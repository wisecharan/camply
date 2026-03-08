from flask import Blueprint, jsonify
from app.models import db, Notification
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('/', methods=['GET'])
@jwt_required()
def get_notifications():
    user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get('role')
    
    notifications = Notification.query.filter_by(user_id=user_id, role=role).order_by(Notification.created_at.desc()).all()
    results = []
    for notification in notifications:
        results.append({
            'id': notification.id,
            'message': notification.message,
            'is_read': notification.is_read,
            'created_at': notification.created_at.isoformat()
        })
    return jsonify(results), 200

@notifications_bp.route('/<int:notification_id>/read', methods=['PUT'])
@jwt_required()
def mark_as_read(notification_id):
    user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get('role')
    
    notification = Notification.query.filter_by(id=notification_id, user_id=user_id, role=role).first()
    if not notification:
        return jsonify({'message': 'Notification not found'}), 404
        
    notification.is_read = True
    db.session.commit()
    return jsonify({'message': 'Notification marked as read'}), 200
