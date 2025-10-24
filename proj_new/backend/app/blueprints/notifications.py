"""
Notifications Blueprint - ?šçŸ¥ä¸­å? API
"""
from flask import request, jsonify
from flask_smorest import Blueprint, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app import db
from app.models import Notification, User

notifications_bp = Blueprint('notifications', __name__, description='?šçŸ¥ä¸­å? API')


@notifications_bp.route('', methods=['GET'])
@jwt_required()
def list_notifications():
    """
    ?–å??šçŸ¥?—è¡¨
    ---
    """
    try:
        current_user_id = int(get_jwt_identity())
        
        # ?–å??¥è©¢?ƒæ•¸
        read = request.args.get('read')  # 'true', 'false', or None (all)
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # æ§‹å»º?¥è©¢
        query = Notification.query.filter_by(recipient_id=current_user_id)
        
        # ?æ¿¾å·²è?/?ªè?
        if read is not None:
            is_read = read.lower() == 'true'
            query = query.filter_by(read=is_read)
        
        # ?†é?ä¸¦æ?åº?(?€?°ç??¨å?)
        pagination = query.order_by(Notification.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'notifications': [n.to_dict() for n in pagination.items],
            'total': pagination.total,
            'page': page,
            'per_page': per_page,
            'pages': pagination.pages
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@notifications_bp.route('/unread-count', methods=['GET'])
@jwt_required()
def get_unread_count():
    """
    ?–å??ªè??šçŸ¥?¸é?
    ---
    """
    try:
        current_user_id = int(get_jwt_identity())
        
        count = Notification.query.filter_by(
            recipient_id=current_user_id,
            read=False
        ).count()
        
        return jsonify({
            'unread_count': count
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@notifications_bp.route('/<int:notification_id>/mark-read', methods=['POST'])
@jwt_required()
def mark_notification_read(notification_id):
    """
    æ¨™è??šçŸ¥?ºå·²è®€
    ---
    """
    try:
        current_user_id = int(get_jwt_identity())
        
        notification = Notification.query.filter_by(
            notification_id=notification_id,
            recipient_id=current_user_id
        ).first()
        
        if not notification:
            abort(404, message='?šçŸ¥ä¸å???)
        
        if not notification.read:
            notification.read = True
            notification.read_at = datetime.utcnow()
            db.session.commit()
        
        return jsonify(notification.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@notifications_bp.route('/mark-all-read', methods=['POST'])
@jwt_required()
def mark_all_read():
    """
    æ¨™è??€?‰é€šçŸ¥?ºå·²è®€
    ---
    """
    try:
        current_user_id = int(get_jwt_identity())
        
        updated_count = Notification.query.filter_by(
            recipient_id=current_user_id,
            read=False
        ).update({
            'read': True,
            'read_at': datetime.utcnow()
        })
        
        db.session.commit()
        
        return jsonify({
            'message': f'å·²æ?è¨?{updated_count} ?‡é€šçŸ¥?ºå·²è®€',
            'updated_count': updated_count
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@notifications_bp.route('/<int:notification_id>', methods=['DELETE'])
@jwt_required()
def delete_notification(notification_id):
    """
    ?ªé™¤?šçŸ¥
    ---
    """
    try:
        current_user_id = int(get_jwt_identity())
        
        notification = Notification.query.filter_by(
            notification_id=notification_id,
            recipient_id=current_user_id
        ).first()
        
        if not notification:
            abort(404, message='?šçŸ¥ä¸å???)
        
        db.session.delete(notification)
        db.session.commit()
        
        return jsonify({
            'message': '?šçŸ¥å·²åˆª??
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
