"""
Security Utilities
"""
import bcrypt


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
