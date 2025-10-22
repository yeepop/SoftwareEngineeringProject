"""
Auth Blueprint - 身份驗證相關 API
"""
from flask import request, jsonify
from flask_smorest import Blueprint, abort
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from app import db
from app.models import User, UserRole
from app.utils.security import hash_password, verify_password
from datetime import datetime

auth_bp = Blueprint('auth', __name__, description='身份驗證 API')


@auth_bp.route('/register', methods=['POST'])
def register():
    """
    使用者註冊
    ---
    """
    data = request.get_json()
    
    # 驗證必填欄位
    required_fields = ['email', 'password']
    if not all(field in data for field in required_fields):
        abort(400, message='缺少必填欄位')
    
    # 檢查 email 是否已存在
    if User.query.filter_by(email=data['email']).first():
        abort(409, message='此 email 已被註冊')
    
    # 建立新使用者
    user = User(
        email=data['email'],
        password_hash=hash_password(data['password']),
        username=data.get('username'),
        first_name=data.get('first_name'),
        last_name=data.get('last_name'),
        phone_number=data.get('phone_number'),
        role=UserRole.GENERAL_MEMBER
    )
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({
        'message': '註冊成功',
        'user': user.to_dict()
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    使用者登入
    ---
    """
    data = request.get_json()
    
    # 驗證必填欄位
    if not data.get('email') or not data.get('password'):
        abort(400, message='Email 和密碼為必填')
    
    # 查詢使用者
    user = User.query.filter_by(email=data['email']).first()
    
    if not user:
        abort(401, message='Email 或密碼錯誤')
    
    # 檢查帳號是否被鎖定
    if user.is_locked:
        abort(403, message=f'帳號已被鎖定至 {user.locked_until}')
    
    # 驗證密碼
    if not verify_password(data['password'], user.password_hash):
        # 增加失敗次數
        user.failed_login_attempts += 1
        
        # 如果失敗次數超過 5 次，鎖定帳號 30 分鐘
        if user.failed_login_attempts >= 5:
            from datetime import timedelta
            user.locked_until = datetime.utcnow() + timedelta(minutes=30)
        
        db.session.commit()
        abort(401, message='Email 或密碼錯誤')
    
    # 登入成功，重置失敗次數
    user.failed_login_attempts = 0
    user.locked_until = None
    user.last_login_at = datetime.utcnow()
    db.session.commit()
    
    # 建立 token
    access_token = create_access_token(identity=user.user_id)
    refresh_token = create_refresh_token(identity=user.user_id)
    
    return jsonify({
        'message': '登入成功',
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user.to_dict()
    }), 200


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """
    刷新 access token
    ---
    """
    current_user_id = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user_id)
    
    return jsonify({
        'access_token': new_access_token
    }), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """
    取得當前使用者資訊
    ---
    """
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        abort(404, message='使用者不存在')
    
    return jsonify(user.to_dict(include_sensitive=True)), 200


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    使用者登出
    ---
    """
    # 在實際應用中，應該將 token 加入黑名單
    # 這裡簡化處理，僅返回成功訊息
    return jsonify({
        'message': '登出成功'
    }), 200
