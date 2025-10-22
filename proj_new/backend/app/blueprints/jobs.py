"""
Jobs Blueprint - 背景任務 API
"""
from flask_smorest import Blueprint

jobs_bp = Blueprint('jobs', __name__, description='背景任務 API')


@jobs_bp.route('/<int:job_id>', methods=['GET'])
def get_job_status(job_id):
    """取得任務狀態"""
    # TODO: 實作任務狀態查詢
    return {'message': 'Jobs API - To be implemented'}, 200
