"""
Admin Blueprint - 管理員 API
"""
from flask_smorest import Blueprint

admin_bp = Blueprint('admin', __name__, description='管理員 API')


@admin_bp.route('/audit', methods=['GET'])
def list_audit_logs():
    """取得審計日誌"""
    # TODO: 實作審計日誌查詢
    return {'message': 'Admin API - To be implemented'}, 200
