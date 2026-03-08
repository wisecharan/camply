from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from config import Config
from app.models import db
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity, get_jwt
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_mail import Mail
import os

mail = Mail()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    CORS(app, resources={r"/api/*": {
        "origins": "*",
        "allow_headers": ["Content-Type", "Authorization"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }})
    db.init_app(app)
    jwt = JWTManager(app)
    mail.init_app(app)
    Limiter(
        get_remote_address,
        app=app,
        default_limits=["500 per day", "100 per hour"],
        storage_uri="memory://"
    )

    # Register Blueprints
    from app.routes.auth import auth_bp
    from app.routes.student import student_bp
    from app.routes.company import company_bp
    from app.routes.admin import admin_bp
    from app.routes.notifications import notifications_bp

    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(student_bp, url_prefix='/api/student')
    app.register_blueprint(company_bp, url_prefix='/api/company')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')

    # JWT Refresh Token Endpoint
    @app.route('/api/refresh', methods=['POST'])
    @jwt_required(refresh=True)
    def refresh():
        identity = get_jwt_identity()
        claims = get_jwt()
        new_access_token = create_access_token(
            identity=identity,
            additional_claims={'role': claims.get('role', '')}
        )
        return jsonify({'token': new_access_token}), 200

    # Serve uploaded files
    upload_folder = os.path.join(os.path.dirname(__file__), 'uploads')
    os.makedirs(upload_folder, exist_ok=True)

    @app.route('/uploads/<path:filename>')
    def serve_upload(filename):
        return send_from_directory(upload_folder, filename)

    # Create all database tables if they don't exist
    with app.app_context():
        db.create_all()

    @app.route('/api/health')
    def health_check():
        return {'status': 'ok'}, 200

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
