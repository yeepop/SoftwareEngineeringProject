"""
Medical Records Blueprint - 醫療紀錄 API
"""
from flask import jsonify, request
from flask_smorest import Blueprint, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, date
from app import db
from app.models.medical_record import MedicalRecord, RecordType
from app.models.animal import Animal
from app.models.user import User, UserRole

medical_records_bp = Blueprint('medical_records', __name__, description='醫療紀錄 API')


@medical_records_bp.route('/animals/<int:animal_id>/medical-records', methods=['POST'])
@jwt_required()
def create_medical_record(animal_id):
    """
    為動物創建醫療紀錄
    需要認證 (動物擁有者、收容所成員或管理員)
    """
    current_user_id = int(get_jwt_identity())
    
    # 檢查動物是否存在
    animal = Animal.query.filter_by(animal_id=animal_id, deleted_at=None).first()
    if not animal:
        abort(404, message='動物不存在')
    
    # 檢查權限
    user = User.query.get(current_user_id)
    if not user:
        abort(404, message='用戶不存在')
    
    # 權限檢查邏輯:
    # 1. 管理員可以為任何動物創建醫療紀錄
    # 2. 動物擁有者(owner_id)可以為自己的動物創建醫療紀錄
    has_permission = False
    
    if user.role == UserRole.ADMIN:
        has_permission = True
    elif animal.owner_id == current_user_id:
        # 動物擁有者可以為自己的動物創建醫療紀錄
        has_permission = True
    
    if not has_permission:
        abort(403, message='無權限為此動物創建醫療紀錄')
    
    data = request.get_json()
    
    # 驗證 record_type
    record_type = None
    if 'record_type' in data:
        try:
            record_type = RecordType(data['record_type'])
        except ValueError:
            abort(400, message=f'無效的紀錄類型: {data["record_type"]}')
    
    # 驗證日期格式
    record_date = None
    if 'date' in data:
        try:
            record_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        except ValueError:
            abort(400, message='日期格式錯誤,應為 YYYY-MM-DD')
    
    # 創建醫療紀錄
    medical_record = MedicalRecord(
        animal_id=animal_id,
        record_type=record_type,
        date=record_date,
        provider=data.get('provider'),
        details=data.get('details'),
        attachments=data.get('attachments', []),
        verified=False,
        created_by=current_user_id
    )
    
    db.session.add(medical_record)
    db.session.commit()
    
    return jsonify({
        'message': '醫療紀錄創建成功',
        'medical_record': medical_record.to_dict()
    }), 201


@medical_records_bp.route('/animals/<int:animal_id>/medical-records', methods=['GET'])
def list_medical_records(animal_id):
    """
    取得動物的醫療紀錄列表 (公開端點)
    """
    # 檢查動物是否存在
    animal = Animal.query.filter_by(animal_id=animal_id, deleted_at=None).first()
    if not animal:
        abort(404, message='動物不存在')
    
    # 查詢醫療紀錄
    records = MedicalRecord.query.filter_by(
        animal_id=animal_id,
        deleted_at=None
    ).order_by(MedicalRecord.date.desc()).all()
    
    return jsonify({
        'total': len(records),
        'medical_records': [record.to_dict() for record in records]
    }), 200


@medical_records_bp.route('/medical-records/<int:record_id>', methods=['PATCH'])
@jwt_required()
def update_medical_record(record_id):
    """
    更新醫療紀錄
    僅創建者、動物擁有者或管理員可更新
    """
    current_user_id = int(get_jwt_identity())
    
    record = MedicalRecord.query.filter_by(
        medical_record_id=record_id,
        deleted_at=None
    ).first()
    
    if not record:
        abort(404, message='醫療紀錄不存在')
    
    # 檢查權限
    user = User.query.get(current_user_id)
    if not user:
        abort(404, message='用戶不存在')
    
    # 獲取動物資料以檢查擁有者
    animal = Animal.query.get(record.animal_id)
    
    # 權限檢查: 管理員、醫療紀錄創建者、或動物擁有者可更新
    has_permission = (
        user.role == UserRole.ADMIN or 
        record.created_by == current_user_id or
        (animal and animal.owner_id == current_user_id)
    )
    
    if not has_permission:
        abort(403, message='僅創建者、動物擁有者或管理員可更新醫療紀錄')
    
    data = request.get_json()
    
    # 可更新的欄位
    if 'record_type' in data:
        try:
            record.record_type = RecordType(data['record_type'])
        except ValueError:
            abort(400, message=f'無效的紀錄類型: {data["record_type"]}')
    
    if 'date' in data:
        try:
            record.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        except ValueError:
            abort(400, message='日期格式錯誤,應為 YYYY-MM-DD')
    
    if 'provider' in data:
        record.provider = data['provider']
    
    if 'details' in data:
        record.details = data['details']
    
    if 'attachments' in data:
        record.attachments = data['attachments']
    
    record.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'message': '醫療紀錄更新成功',
        'medical_record': record.to_dict()
    }), 200


@medical_records_bp.route('/medical-records/<int:record_id>/verify', methods=['POST'])
@jwt_required()
def verify_medical_record(record_id):
    """
    驗證醫療紀錄 (僅管理員)
    """
    current_user_id = int(get_jwt_identity())
    
    user = User.query.get(current_user_id)
    if not user or user.role != UserRole.ADMIN:
        abort(403, message='僅管理員可驗證醫療紀錄')
    
    record = MedicalRecord.query.filter_by(
        medical_record_id=record_id,
        deleted_at=None
    ).first()
    
    if not record:
        abort(404, message='醫療紀錄不存在')
    
    data = request.get_json() or {}
    verified = data.get('verified', True)
    
    record.verified = verified
    record.verified_by = current_user_id if verified else None
    record.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'message': f'醫療紀錄已{"驗證" if verified else "取消驗證"}',
        'medical_record': record.to_dict()
    }), 200

