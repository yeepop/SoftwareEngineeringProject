"""
Applications Blueprint - 領養申請 API
"""
from flask import request, jsonify
from flask_smorest import Blueprint, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import or_
from datetime import datetime

from app import db
from app.models.application import Application, ApplicationStatus
from app.models.user import User, UserRole
from app.models.animal import Animal
from app.services.audit_service import audit_service

applications_bp = Blueprint('applications', __name__, description='領養申請 API')


@applications_bp.route('', methods=['GET'])
@jwt_required()
def list_applications():
    """
    取得申請列表
    ---
    支援過濾: status, animal_id, applicant_id
    """
    try:
        current_user_id = int(get_jwt_identity())
        current_user = User.query.get(current_user_id)
        
        # 分頁參數
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # 基礎查詢
        query = Application.query.filter_by(deleted_at=None)
        
        # 權限過濾: 一般用戶只能看自己的申請
        if current_user.role == UserRole.GENERAL_MEMBER:
            query = query.filter_by(applicant_id=current_user_id)
        
        # 過濾條件
        if 'status' in request.args:
            status_str = request.args.get('status')
            try:
                status_enum = ApplicationStatus(status_str)
                query = query.filter_by(status=status_enum)
            except ValueError:
                abort(400, message=f'無效的狀態值: {status_str}')
        if 'animal_id' in request.args:
            query = query.filter_by(animal_id=request.args.get('animal_id', type=int))
        if 'applicant_id' in request.args and current_user.role != UserRole.GENERAL_MEMBER:
            query = query.filter_by(applicant_id=request.args.get('applicant_id', type=int))
        
        # 執行分頁查詢
        pagination = query.order_by(Application.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'items': [app.to_dict(include_relations=True) for app in pagination.items],
            'total': pagination.total,
            'page': page,
            'per_page': per_page,
            'pages': pagination.pages
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@applications_bp.route('', methods=['POST'])
@jwt_required()
def create_application():
    """
    建立領養申請
    ---
    支援冪等性: 透過 Idempotency-Key header
    """
    try:
        current_user_id = int(get_jwt_identity())
        data = request.get_json()
        
        # 驗證必填欄位
        if not data.get('animal_id'):
            abort(400, message='缺少必填欄位: animal_id')
        
        # 檢查動物是否存在且可領養
        animal = Animal.query.filter_by(
            animal_id=data['animal_id'],
            deleted_at=None
        ).first()
        
        if not animal:
            abort(404, message='動物不存在')
        
        if animal.status != 'PUBLISHED':
            abort(400, message='此動物目前無法申請領養')
        
        # 檢查申請人不能是刊登者本人
        if animal.owner_id == current_user_id or animal.created_by == current_user_id:
            abort(400, message='您不能申請自己刊登的動物')
        
        # 檢查是否已有進行中的申請
        existing = Application.query.filter_by(
            animal_id=data['animal_id'],
            applicant_id=current_user_id,
            deleted_at=None
        ).filter(
            Application.status.in_([ApplicationStatus.PENDING, ApplicationStatus.UNDER_REVIEW])
        ).first()
        
        if existing:
            abort(409, message='您已對此動物提交申請')
        
        # 冪等性檢查
        idempotency_key = request.headers.get('Idempotency-Key')
        if idempotency_key:
            existing_app = Application.query.filter_by(
                idempotency_key=idempotency_key,
                applicant_id=current_user_id
            ).first()
            if existing_app:
                return jsonify(existing_app.to_dict()), 200
        
        # 建立申請
        application = Application(
            animal_id=data['animal_id'],
            applicant_id=current_user_id,
            type=data.get('type', 'ADOPTION'),
            status=ApplicationStatus.PENDING,
            submitted_at=datetime.utcnow(),
            attachments=data.get('attachments'),
            idempotency_key=idempotency_key
        )
        
        db.session.add(application)
        db.session.commit()
        
        return jsonify({
            'message': '申請已提交',
            'application': application.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@applications_bp.route('/<int:application_id>', methods=['GET'])
@jwt_required()
def get_application(application_id):
    """
    取得單一申請詳情
    ---
    """
    try:
        current_user_id = int(get_jwt_identity())
        current_user = User.query.get(current_user_id)
        
        application = Application.query.filter_by(
            application_id=application_id,
            deleted_at=None
        ).first()
        
        if not application:
            abort(404, message='申請不存在')
        
        # 權限檢查: 申請人本人或管理員/收容所人員
        if current_user.role == UserRole.GENERAL_MEMBER and application.applicant_id != current_user_id:
            abort(403, message='無權限查看此申請')
        
        return jsonify(application.to_dict(include_relations=True)), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@applications_bp.route('/<int:application_id>/review', methods=['POST'])
@jwt_required()
def review_application(application_id):
    """
    審核申請 (核准/拒絕)
    ---
    需要管理員或收容所人員權限
    支援樂觀鎖: 透過 version 欄位
    """
    try:
        current_user_id = int(get_jwt_identity())
        current_user = User.query.get(current_user_id)
        
        # 權限檢查
        if current_user.role not in [UserRole.ADMIN, UserRole.SHELTER_MEMBER]:
            abort(403, message='無權限審核申請')
        
        application = Application.query.filter_by(
            application_id=application_id,
            deleted_at=None
        ).first()
        
        if not application:
            abort(404, message='申請不存在')
        
        data = request.get_json()
        action = data.get('action')  # 'approve' or 'reject'
        
        if action not in ['approve', 'reject']:
            abort(400, message='action 必須為 approve 或 reject')
        
        # 檢查狀態
        if application.status not in [ApplicationStatus.PENDING, ApplicationStatus.UNDER_REVIEW]:
            abort(400, message='此申請無法審核')
        
        # 樂觀鎖檢查
        if 'version' in data:
            if application.version != data['version']:
                abort(409, message='申請已被其他人修改，請重新載入')
        
        # 保存舊狀態用於審計日誌
        old_status = application.status
        
        # 更新申請狀態
        if action == 'approve':
            application.status = ApplicationStatus.APPROVED
        else:
            application.status = ApplicationStatus.REJECTED
        
        application.assignee_id = current_user_id
        application.reviewed_at = datetime.utcnow()
        application.review_notes = data.get('review_notes')
        application.version += 1
        
        db.session.commit()
        
        # 記錄審計日誌
        audit_service.log_application_review(
            application_id,
            current_user_id,
            old_status.value,
            application.status.value
        )
        
        return jsonify({
            'message': f'申請已{("核准" if action == "approve" else "拒絕")}',
            'application': application.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@applications_bp.route('/<int:application_id>/assign', methods=['POST'])
@jwt_required()
def assign_application(application_id):
    """
    指派申請給處理人員
    ---
    需要管理員或收容所人員權限
    """
    try:
        current_user_id = int(get_jwt_identity())
        current_user = User.query.get(current_user_id)
        
        if current_user.role not in [UserRole.ADMIN, UserRole.SHELTER_MEMBER]:
            abort(403, message='無權限指派申請')
        
        application = Application.query.filter_by(
            application_id=application_id,
            deleted_at=None
        ).first()
        
        if not application:
            abort(404, message='申請不存在')
        
        data = request.get_json()
        assignee_id = data.get('assignee_id')
        
        # 驗證受理人
        assignee = User.query.get(assignee_id)
        if not assignee or assignee.role not in [UserRole.ADMIN, UserRole.SHELTER_MEMBER]:
            abort(400, message='無效的受理人')
        
        application.assignee_id = assignee_id
        application.status = ApplicationStatus.UNDER_REVIEW
        application.version += 1
        
        db.session.commit()
        
        return jsonify({
            'message': '已指派處理人員',
            'application': application.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@applications_bp.route('/<int:application_id>/withdraw', methods=['POST'])
@jwt_required()
def withdraw_application(application_id):
    """
    撤回申請 (申請人自己)
    ---
    """
    try:
        current_user_id = int(get_jwt_identity())
        
        application = Application.query.filter_by(
            application_id=application_id,
            applicant_id=current_user_id,
            deleted_at=None
        ).first()
        
        if not application:
            abort(404, message='申請不存在或無權限')
        
        if application.status not in [ApplicationStatus.PENDING, ApplicationStatus.UNDER_REVIEW]:
            abort(400, message='此申請無法撤回')
        
        application.status = ApplicationStatus.WITHDRAWN
        application.version += 1
        
        db.session.commit()
        
        return jsonify({
            'message': '申請已撤回',
            'application': application.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
