"""
Shelters Blueprint - 收容所管理 API
"""
import base64
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


@shelters_bp.route('', methods=['GET'])
def list_shelters():
    """
    獲取收容所列表 (公開端點)
    支援分頁和搜尋
    """
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    search = request.args.get('search', '')
    verified_only = request.args.get('verified', 'false').lower() == 'true'
    
    # 驗證分頁參數
    if page < 1:
        page = 1
    if per_page < 1 or per_page > 100:
        per_page = 10
    
    # 構建查詢
    query = Shelter.query.filter_by(deleted_at=None)
    
    # 搜尋過濾
    if search:
        query = query.filter(
            db.or_(
                Shelter.name.ilike(f'%{search}%'),
                Shelter.contact_email.ilike(f'%{search}%')
            )
        )
    
    # 僅顯示已驗證收容所
    if verified_only:
        query = query.filter_by(verified=True)
    
    # 排序和分頁
    query = query.order_by(Shelter.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'shelters': [shelter.to_dict() for shelter in pagination.items],
        'total': pagination.total,
        'page': page,
        'per_page': per_page,
        'pages': pagination.pages
    }), 200


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
    接收多個檔案:
    - animal_csv: 動物基本資訊 CSV (必填)
    - medical_csv: 醫療記錄 CSV (選填)
    - photos[]: 動物照片 (選填,檔名格式: {animal_code}_{order}.jpg)
    返回 202 Accepted + jobId
    """
    current_user_id = int(get_jwt_identity())
    
    shelter = Shelter.query.filter_by(shelter_id=shelter_id, deleted_at=None).first()
    if not shelter:
        abort(404, message='收容所不存在')
    
    # 檢查權限
    if not check_shelter_member_or_admin(current_user_id, shelter_id):
        abort(403, message='無權限執行批次匯入')
    
    # === 處理動物基本資訊 CSV (必填) ===
    if 'animal_csv' not in request.files:
        abort(400, message='缺少必填欄位: animal_csv')
    
    animal_csv = request.files['animal_csv']
    
    if animal_csv.filename == '':
        abort(400, message='未選擇動物基本資訊 CSV 檔案')
    
    # 驗證檔案類型
    if not animal_csv.filename.lower().endswith('.csv'):
        abort(400, message='動物基本資訊檔案必須為 CSV 格式')
    
    # 驗證檔案大小 (最大 10MB)
    animal_csv.seek(0, 2)
    file_size = animal_csv.tell()
    animal_csv.seek(0)
    
    if file_size > 10 * 1024 * 1024:
        abort(400, message='動物基本資訊 CSV 檔案不能超過 10MB')
    
    # 讀取動物 CSV 內容
    try:
        animal_csv_content = animal_csv.read().decode('utf-8')
    except UnicodeDecodeError:
        abort(400, message='動物基本資訊 CSV 編碼錯誤,請使用 UTF-8 編碼')
    
    # 驗證 CSV 格式
    import csv
    import io
    try:
        csv_reader = csv.DictReader(io.StringIO(animal_csv_content))
        first_row = next(csv_reader, None)
        if not first_row:
            abort(400, message='動物基本資訊 CSV 檔案為空')
    except Exception as e:
        abort(400, message=f'動物基本資訊 CSV 格式錯誤: {str(e)}')
    
    # === 處理醫療記錄 CSV (選填) ===
    medical_csv_content = None
    if 'medical_csv' in request.files:
        medical_csv = request.files['medical_csv']
        
        if medical_csv.filename and medical_csv.filename != '':
            # 驗證檔案類型
            if not medical_csv.filename.lower().endswith('.csv'):
                abort(400, message='醫療記錄檔案必須為 CSV 格式')
            
            # 驗證檔案大小
            medical_csv.seek(0, 2)
            file_size = medical_csv.tell()
            medical_csv.seek(0)
            
            if file_size > 10 * 1024 * 1024:
                abort(400, message='醫療記錄 CSV 檔案不能超過 10MB')
            
            # 讀取內容
            try:
                medical_csv_content = medical_csv.read().decode('utf-8')
            except UnicodeDecodeError:
                abort(400, message='醫療記錄 CSV 編碼錯誤,請使用 UTF-8 編碼')
    
    # === 處理照片 (選填) ===
    photos_data = []
    if 'photos' in request.files:
        photos = request.files.getlist('photos')
        
        # 導入 MinIO 客戶端
        from app.blueprints.uploads import minio_client, minio_available
        from config import Config
        import uuid as uuid_lib
        
        if not minio_available:
            abort(500, message='MinIO 服務不可用')
        
        for photo in photos:
            if photo.filename and photo.filename != '':
                # 驗證檔案類型
                if not photo.content_type or not photo.content_type.startswith('image/'):
                    abort(400, message=f'檔案 {photo.filename} 不是圖片格式')
                
                # 驗證檔案大小 (最大 5MB per photo)
                photo.seek(0, 2)
                photo_size = photo.tell()
                photo.seek(0)
                
                if photo_size > 5 * 1024 * 1024:
                    abort(400, message=f'照片 {photo.filename} 超過 5MB 限制')
                
                # 上傳照片到 MinIO
                try:
                    # 生成唯一的 object key
                    ext = photo.filename.split('.')[-1] if '.' in photo.filename else 'jpg'
                    object_key = f"batch-uploads/{shelter_id}/{uuid_lib.uuid4()}.{ext}"
                    
                    # 上傳到 MinIO
                    minio_client.put_object(
                        bucket_name=Config.MINIO_BUCKET,
                        object_name=object_key,
                        data=photo,
                        length=photo_size,
                        content_type=photo.content_type or 'image/jpeg'
                    )
                    
                    # 生成公開 URL
                    photo_url = f"http://{Config.MINIO_EXTERNAL_ENDPOINT or 'localhost:9000'}/{Config.MINIO_BUCKET}/{object_key}"
                    
                    photos_data.append({
                        'filename': photo.filename,
                        'content_type': photo.content_type,
                        'storage_key': object_key,
                        'url': photo_url,
                        'size': photo_size
                    })
                except Exception as e:
                    db.session.rollback()
                    abort(400, message=f'上傳照片 {photo.filename} 到 MinIO 失敗: {str(e)}')
    
    # 獲取醫療記錄檔名 (安全處理)
    medical_csv_filename = None
    if 'medical_csv' in request.files:
        medical_file = request.files['medical_csv']
        if medical_file and medical_file.filename:
            medical_csv_filename = medical_file.filename
    
    # 創建 Job 記錄
    try:
        job = Job(
            type=JobType.IMPORT_ANIMALS.value,
            status=JobStatus.PENDING,
            created_by=current_user_id,
            payload={
                'shelter_id': shelter_id,
                'animal_csv_content': animal_csv_content,
                'medical_csv_content': medical_csv_content,
                'photos': photos_data,
                'animal_csv_filename': animal_csv.filename,
                'medical_csv_filename': medical_csv_filename,
                'options': {}
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
            'status': job.status.value,
            'files_received': {
                'animal_csv': animal_csv.filename,
                'medical_csv': medical_csv_filename,
                'photos_count': len(photos_data)
            }
        }), 202
        
    except Exception as e:
        db.session.rollback()
        abort(500, message=f'創建批次匯入任務失敗: {str(e)}')
