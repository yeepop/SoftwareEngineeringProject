"""
Uploads Blueprint - 檔案上傳 API
"""
from flask_smorest import Blueprint

uploads_bp = Blueprint('uploads', __name__, description='檔案上傳 API')


@uploads_bp.route('/presign', methods=['POST'])
def generate_presigned_url():
    """產生預簽名上傳 URL"""
    # TODO: 實作預簽名 URL 產生
    return {'message': 'Uploads API - To be implemented'}, 200
