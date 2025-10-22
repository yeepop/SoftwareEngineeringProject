"""
Flask Application Factory
"""
from flask import Flask
from flask_cors import CORS
from flask_smorest import Api
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from redis import Redis

# 初始化擴展
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
redis_client = None


def create_app(config_name='development'):
    """
    應用工廠函數
    
    Args:
        config_name: 配置名稱 ('development', 'production', 'testing')
    
    Returns:
        Flask app instance
    """
    app = Flask(__name__)
    
    # 載入配置
    app.config.from_object(f'config.{config_name.capitalize()}Config')
    
    # 初始化 CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": app.config['CORS_ORIGINS'],
            "methods": ["GET", "POST", "PUT", "PATCH", "DELETE"],
            "allow_headers": ["Content-Type", "Authorization", "Idempotency-Key"]
        }
    })
    
    # 初始化擴展
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # 初始化 Redis
    global redis_client
    redis_client = Redis(
        host=app.config['REDIS_HOST'],
        port=app.config['REDIS_PORT'],
        db=app.config['REDIS_DB'],
        decode_responses=True
    )
    
    # 初始化 Flask-SMOREST (OpenAPI)
    api = Api(app)
    
    # 註冊藍圖
    from app.blueprints.auth import auth_bp
    from app.blueprints.users import users_bp
    from app.blueprints.animals import animals_bp
    from app.blueprints.applications import applications_bp
    from app.blueprints.shelters import shelters_bp
    from app.blueprints.medical_records import medical_records_bp
    from app.blueprints.notifications import notifications_bp
    from app.blueprints.uploads import uploads_bp
    from app.blueprints.jobs import jobs_bp
    from app.blueprints.admin import admin_bp
    
    api.register_blueprint(auth_bp, url_prefix='/api/auth')
    api.register_blueprint(users_bp, url_prefix='/api/users')
    api.register_blueprint(animals_bp, url_prefix='/api/animals')
    api.register_blueprint(applications_bp, url_prefix='/api/applications')
    api.register_blueprint(shelters_bp, url_prefix='/api/shelters')
    api.register_blueprint(medical_records_bp, url_prefix='/api/medical-records')
    api.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    api.register_blueprint(uploads_bp, url_prefix='/api/uploads')
    api.register_blueprint(jobs_bp, url_prefix='/api/jobs')
    api.register_blueprint(admin_bp, url_prefix='/api/admin')
    
    # 健康檢查端點
    @app.route('/healthz')
    def health_check():
        return {'status': 'healthy'}, 200
    
    @app.route('/readyz')
    def readiness_check():
        try:
            # 檢查資料庫連接
            db.session.execute('SELECT 1')
            return {'status': 'ready'}, 200
        except Exception as e:
            return {'status': 'not ready', 'error': str(e)}, 503
    
    # JWT 錯誤處理
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return {'error': 'Token has expired'}, 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return {'error': 'Invalid token'}, 401
    
    @jwt.unauthorized_loader
    def unauthorized_callback(error):
        return {'error': 'Missing authorization header'}, 401
    
    return app
