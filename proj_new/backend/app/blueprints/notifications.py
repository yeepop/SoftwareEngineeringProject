"""
Notifications Blueprint - 通知中心 API
"""
from flask_smorest import Blueprint

notifications_bp = Blueprint('notifications', __name__, description='通知中心 API')


@notifications_bp.route('', methods=['GET'])
def list_notifications():
    """取得通知列表"""
    # TODO: 實作通知列表查詢
    return {'message': 'Notifications API - To be implemented'}, 200
