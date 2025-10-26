"""
Security Utilities
"""
import bcrypt
from itsdangerous import URLSafeTimedSerializer
from flask import current_app
from typing import Optional


def hash_password(password: str) -> str:
    """
    將密碼進行雜湊
    
    Args:
        password: 明文密碼
    
    Returns:
        雜湊後的密碼
    """
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def verify_password(password: str, password_hash: str) -> bool:
    """
    驗證密碼
    
    Args:
        password: 明文密碼
        password_hash: 雜湊後的密碼
    
    Returns:
        是否匹配
    """
    password_bytes = password.encode('utf-8')
    hash_bytes = password_hash.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hash_bytes)


def generate_verification_token(user_id: int, purpose: str = 'email-verify') -> str:
    """
    生成驗證 token
    
    Args:
        user_id: 用戶 ID
        purpose: token 用途 (email-verify, password-reset)
    
    Returns:
        token 字符串
    """
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    return serializer.dumps({'user_id': user_id, 'purpose': purpose}, salt=current_app.config['SECURITY_PASSWORD_SALT'])


def verify_token(token: str, purpose: str = 'email-verify', max_age: int = 86400) -> Optional[int]:
    """
    驗證 token 並返回用戶 ID
    
    Args:
        token: token 字符串
        purpose: 預期的 token 用途
        max_age: token 有效期（秒），預設 24 小時
    
    Returns:
        用戶 ID，如果無效則返回 None
    """
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    try:
        data = serializer.loads(
            token,
            salt=current_app.config['SECURITY_PASSWORD_SALT'],
            max_age=max_age
        )
        if data.get('purpose') != purpose:
            return None
        return data.get('user_id')
    except Exception:
        return None
