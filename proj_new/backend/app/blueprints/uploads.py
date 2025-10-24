"""
Uploads Blueprint - 檔案上傳 API
"""
from flask import request, jsonify
from flask_smorest import Blueprint, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import timedelta
import uuid

from app import db
from app.models.attachment import Attachment
from app.models.user import User
from config import Config

# MinIO 客戶端初始化
from minio import Minio
minio_client = Minio(
    Config.MINIO_ENDPOINT,
    access_key=Config.MINIO_ACCESS_KEY,
    secret_key=Config.MINIO_SECRET_KEY,
    secure=False
)

uploads_bp = Blueprint('uploads', __name__, description='檔案上傳 API')


@uploads_bp.route('/presign', methods=['POST'])
@jwt_required()
def generate_presigned_url():
    """
    產生預簽名上傳 URL
    ---
    用於單檔案上傳 (< 5GB)
    """
    try:
        current_user_id = int(get_jwt_identity())
        data = request.get_json()
        
        # 驗證必填欄位
        if not data.get('filename'):
            abort(400, message='缺少必填欄位: filename')
        
        object_key = data.get('object_key')
        if not object_key:
            # 自動生成唯一 object key
            ext = data['filename'].split('.')[-1] if '.' in data['filename'] else ''
            object_key = f"uploads/{current_user_id}/{uuid.uuid4()}.{ext}"
        
        # 生成 PUT 預簽名 URL (15分鐘有效)
        presigned_url = minio_client.presigned_put_object(
            bucket_name=Config.MINIO_BUCKET_NAME,
            object_name=object_key,
            expires=timedelta(minutes=15)
        )
        
        return jsonify({
            'presigned_url': presigned_url,
            'object_key': object_key,
            'expires_in': 900  # 秒
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@uploads_bp.route('/presign/multipart', methods=['POST'])
@jwt_required()
def generate_multipart_presigned_urls():
    """
    產生多部分上傳的預簽名 URLs
    ---
    用於大檔案上傳 (> 5GB)
    """
    try:
        current_user_id = int(get_jwt_identity())
        data = request.get_json()
        
        # 驗證必填欄位
        if not data.get('filename') or not data.get('parts'):
            abort(400, message='缺少必填欄位: filename, parts')
        
        parts = data['parts']
        if parts < 1 or parts > 10000:
            abort(400, message='parts 必須在 1-10000 之間')
        
        object_key = data.get('object_key')
        if not object_key:
            ext = data['filename'].split('.')[-1] if '.' in data['filename'] else ''
            object_key = f"uploads/{current_user_id}/{uuid.uuid4()}.{ext}"
        
        # 生成多個 part 的預簽名 URLs (1小時有效)
        presigned_urls = []
        for part_number in range(1, parts + 1):
            url = minio_client.presigned_put_object(
                bucket_name=Config.MINIO_BUCKET_NAME,
                object_name=object_key,
                expires=timedelta(hours=1)
            )
            presigned_urls.append({
                'part_number': part_number,
                'presigned_url': url
            })
        
        return jsonify({
            'presigned_urls': presigned_urls,
            'object_key': object_key,
            'expires_in': 3600
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@uploads_bp.route('/attachments', methods=['POST'])
@jwt_required()
def create_attachment():
    """
    建立附件記錄
    ---
    上傳完成後建立元數據
    """
    try:
        current_user_id = int(get_jwt_identity())
        data = request.get_json()
        
        # 驗證必填欄位
        required_fields = ['object_key', 'filename', 'content_type', 'size']
        for field in required_fields:
            if not data.get(field):
                abort(400, message=f'缺少必填欄位: {field}')
        
        # 驗證檔案是否存在於 MinIO
        try:
            stat = minio_client.stat_object(
                bucket_name=Config.MINIO_BUCKET_NAME,
                object_name=data['object_key']
            )
        except Exception:
            abort(404, message='檔案不存在於儲存系統')
        
        # 建立附件記錄
        attachment = Attachment(
            object_key=data['object_key'],
            filename=data['filename'],
            content_type=data['content_type'],
            size=data['size'],
            uploaded_by_id=current_user_id,
            entity_type=data.get('entity_type'),  # 'animal', 'application', etc.
            entity_id=data.get('entity_id')
        )
        
        db.session.add(attachment)
        db.session.commit()
        
        # 生成下載 URL
        download_url = minio_client.presigned_get_object(
            bucket_name=Config.MINIO_BUCKET_NAME,
            object_name=data['object_key'],
            expires=timedelta(hours=1)
        )
        
        return jsonify({
            'message': '附件已建立',
            'attachment': attachment.to_dict(),
            'download_url': download_url
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@uploads_bp.route('/attachments/<int:attachment_id>', methods=['GET'])
@jwt_required()
def get_attachment(attachment_id):
    """
    取得附件資訊及下載 URL
    ---
    """
    try:
        current_user_id = int(get_jwt_identity())
        
        attachment = Attachment.query.filter_by(
            attachment_id=attachment_id,
            deleted_at=None
        ).first()
        
        if not attachment:
            abort(404, message='附件不存在')
        
        # 生成新的下載 URL (1小時有效)
        download_url = minio_client.presigned_get_object(
            bucket_name=Config.MINIO_BUCKET_NAME,
            object_name=attachment.object_key,
            expires=timedelta(hours=1)
        )
        
        return jsonify({
            'attachment': attachment.to_dict(),
            'download_url': download_url,
            'expires_in': 3600
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@uploads_bp.route('/attachments/<int:attachment_id>', methods=['DELETE'])
@jwt_required()
def delete_attachment(attachment_id):
    """
    刪除附件
    ---
    軟刪除，實際檔案保留在 MinIO
    """
    try:
        current_user_id = int(get_jwt_identity())
        current_user = User.query.get(current_user_id)
        
        attachment = Attachment.query.filter_by(
            attachment_id=attachment_id,
            deleted_at=None
        ).first()
        
        if not attachment:
            abort(404, message='附件不存在')
        
        # 權限檢查: 上傳者本人或管理員
        from app.models.user import UserRole
        if attachment.uploaded_by_id != current_user_id and current_user.role != UserRole.ADMIN:
            abort(403, message='無權限刪除此附件')
        
        # 軟刪除
        from datetime import datetime
        attachment.deleted_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({'message': '附件已刪除'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
