"""
Medical Records Blueprint - 醫療紀錄 API
"""
from flask_smorest import Blueprint

medical_records_bp = Blueprint('medical_records', __name__, description='醫療紀錄 API')


@medical_records_bp.route('', methods=['GET'])
def list_medical_records():
    """取得醫療紀錄列表"""
    # TODO: 實作醫療紀錄列表查詢
    return {'message': 'Medical Records API - To be implemented'}, 200
