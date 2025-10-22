"""
Shelters Blueprint - 收容所管理 API
"""
from flask_smorest import Blueprint

shelters_bp = Blueprint('shelters', __name__, description='收容所管理 API')


@shelters_bp.route('/<int:shelter_id>', methods=['GET'])
def get_shelter(shelter_id):
    """取得收容所資訊"""
    # TODO: 實作收容所資訊查詢
    return {'message': 'Shelter API - To be implemented'}, 200
