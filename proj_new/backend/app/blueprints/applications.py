"""
Applications Blueprint - 領養申請 API
"""
from flask_smorest import Blueprint

applications_bp = Blueprint('applications', __name__, description='領養申請 API')


@applications_bp.route('', methods=['GET'])
def list_applications():
    """取得申請列表"""
    # TODO: 實作申請列表查詢
    return {'message': 'Applications API - To be implemented'}, 200


@applications_bp.route('', methods=['POST'])
def create_application():
    """建立申請"""
    # TODO: 實作申請建立
    return {'message': 'Create application - To be implemented'}, 201
