"""
Shelters Blueprint - 收容所管理 API
"""
from flask import jsonify, request
from flask_smorest import Blueprint, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app import db
from app.models.shelter import Shelter
from app.models.user import User, UserRole
from app.models.others import Job, JobType, JobStatus
from app.services.audit_service import audit_service
import re

shelters_bp = Blueprint('shelters', __name__, description='收容所管理 API')


def check_shelter_member_or_admin(user_id, shelter_id=None):
    """檢查用戶是否為收容所成員或管理員"""
    user = User.query.get(user_id)
    if not user:
        abort(404, message='用戶不存在')
    
    # 管理員有完全權限
    if user.role == UserRole.ADMIN:
        return True
    
    # 收容所成員需要檢查關聯
    if user.role == UserRole.SHELTER_MEMBER:
        if shelter_id:
            # 檢查是否為該收容所的主要負責人或關聯成員
            shelter = Shelter.query.get(shelter_id)
            if shelter and (shelter.primary_account_user_id == user_id or user.primary_shelter_id == shelter_id):
                return True
        else:
            # 創建新收容所時,只要是收容所成員即可
            return True
    
    return False


@shelters_bp.route('', methods=['POST'])
@jwt_required()
def create_shelter():
    """
    創建收容所
    需要 SHELTER_MEMBER 或 ADMIN 角色
    """
    current_user_id = int(get_jwt_identity())
    
    # 檢查權限
    if not check_shelter_member_or_admin(current_user_id):
        abort(403, message='僅收容所成員或管理員可創建收容所')
    
    data = request.get_json()
    
    # 驗證必填欄位
    required_fields = ['name', 'contact_email', 'contact_phone', 'address']
    for field in required_fields:
        if field not in data:
            abort(400, message=f'缺少必填欄位: {field}')
    
    # 驗證 email 格式
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, data['contact_email']):
        abort(400, message='Email 格式不正確')
    
    # 驗證 address 結構
    if not isinstance(data['address'], dict):
        abort(400, message='地址必須為JSON對象')
    
    address_fields = ['street', 'city', 'county', 'postal_code']
    for field in address_fields:
        if field not in data['address']:
            abort(400, message=f'地址缺少必填欄位: {field}')
    
    # 生成 slug (如果未提供)
    slug = data.get('slug')
    if slug:
        # 檢查 slug 唯一性
        if Shelter.query.filter_by(slug=slug).first():
            abort(400, message='Slug 已存在')
    
    # 創建收容所
    shelter = Shelter(
        name=data['name'],
        slug=slug,
        contact_email=data['contact_email'],
        contact_phone=data['contact_phone'],
        address=data['address'],
        verified=False,  # 預設未驗證
        primary_account_user_id=current_user_id
    )
    
    db.session.add(shelter)
    db.session.commit()
    
    return jsonify({
        'message': '收容所創建成功',
        'shelter': shelter.to_dict()
    }), 201


@shelters_bp.route('/<int:shelter_id>', methods=['GET'])
def get_shelter(shelter_id):
    """取得收容所資訊 (公開端點)"""
    shelter = Shelter.query.filter_by(shelter_id=shelter_id, deleted_at=None).first()
    
    if not shelter:
        abort(404, message='收容所不存在')
    
    return jsonify(shelter.to_dict()), 200


@shelters_bp.route('/<int:shelter_id>', methods=['PATCH'])
@jwt_required()
def update_shelter(shelter_id):
    """
    更新收容所資訊
    僅該收容所的主要負責人或管理員可更新
    """
    current_user_id = int(get_jwt_identity())
    
    shelter = Shelter.query.filter_by(shelter_id=shelter_id, deleted_at=None).first()
    if not shelter:
        abort(404, message='收容所不存在')
    
    # 檢查權限
    if not check_shelter_member_or_admin(current_user_id, shelter_id):
        abort(403, message='無權限更新此收容所')
    
    data = request.get_json()
    
    # 可更新的欄位
    allowed_fields = ['name', 'slug', 'contact_email', 'contact_phone', 'address']
    
    for field in allowed_fields:
        if field in data:
            # 特殊驗證
            if field == 'contact_email':
                email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
                if not re.match(email_pattern, data['contact_email']):
                    abort(400, message='Email 格式不正確')
            
            if field == 'slug' and data['slug']:
                # 檢查 slug 唯一性(排除自己)
                existing = Shelter.query.filter(
                    Shelter.slug == data['slug'],
                    Shelter.shelter_id != shelter_id
                ).first()
                if existing:
                    abort(400, message='Slug 已存在')
            
            if field == 'address':
                if not isinstance(data['address'], dict):
                    abort(400, message='地址必須為JSON對象')
                address_fields = ['street', 'city', 'county', 'postal_code']
                for addr_field in address_fields:
                    if addr_field not in data['address']:
                        abort(400, message=f'地址缺少必填欄位: {addr_field}')
            
            setattr(shelter, field, data[field])
    
    shelter.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'message': '收容所更新成功',
        'shelter': shelter.to_dict()
    }), 200


@shelters_bp.route('/<int:shelter_id>/verify', methods=['POST'])
@jwt_required()
def verify_shelter(shelter_id):
    """
    驗證收容所 (僅管理員)
    """
    current_user_id = int(get_jwt_identity())
    
    user = User.query.get(current_user_id)
    if not user or user.role != UserRole.ADMIN:
        abort(403, message='僅管理員可驗證收容所')
    
    shelter = Shelter.query.filter_by(shelter_id=shelter_id, deleted_at=None).first()
    if not shelter:
        abort(404, message='收容所不存在')
    
    data = request.get_json() or {}
    verified = data.get('verified', True)
    
    shelter.verified = verified
    shelter.updated_at = datetime.utcnow()
    db.session.commit()
    
    # 記錄審計日誌
    audit_service.log_shelter_verify(shelter_id, current_user_id, verified)
    
    return jsonify({
        'message': f'收容所已{"驗證" if verified else "取消驗證"}',
        'shelter': shelter.to_dict()
    }), 200


@shelters_bp.route('/<int:shelter_id>/animals/batch', methods=['POST'])
@jwt_required()
def batch_upload_animals(shelter_id):
    """
    批次匯入動物 (使用 Job Pattern)
    返回 202 Accepted + jobId
    """
    current_user_id = int(get_jwt_identity())
    
    shelter = Shelter.query.filter_by(shelter_id=shelter_id, deleted_at=None).first()
    if not shelter:
        abort(404, message='收容所不存在')
    
    # 檢查權限
    if not check_shelter_member_or_admin(current_user_id, shelter_id):
        abort(403, message='無權限執行批次匯入')
    
    data = request.get_json()
    
    # 驗證必填欄位
    if 'file_url' not in data:
        abort(400, message='缺少必填欄位: file_url')
    
    # 創建 Job 記錄
    job = Job(
        job_type=JobType.IMPORT_ANIMALS,
        status=JobStatus.PENDING,
        created_by=current_user_id,
        payload={
            'shelter_id': shelter_id,
            'file_url': data['file_url'],
            'options': data.get('options', {})
        }
    )
    
    db.session.add(job)
    db.session.commit()
    
    # 將 job 加入 Celery 隊列
    from app.tasks import process_animal_batch_import
    process_animal_batch_import.delay(job.job_id)
    
    return jsonify({
        'message': '批次匯入已加入隊列',
        'job_id': job.job_id,
        'status': job.status.value
    }), 202
