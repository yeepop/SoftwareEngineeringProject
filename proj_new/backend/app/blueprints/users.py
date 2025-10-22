"""
Users Blueprint - 使用者管理 API
"""
from flask_smorest import Blueprint

users_bp = Blueprint('users', __name__, description='使用者管理 API')


@users_bp.route('/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """取得使用者資訊"""
    # TODO: 實作使用者資訊查詢
    return {'message': 'User API - To be implemented'}, 200
