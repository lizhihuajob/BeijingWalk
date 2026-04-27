from flask import Blueprint, jsonify, request
from app import db
from app.models.models import (
    Banner, Culture, Specialty, ScenicSpot, Heritage, 
    Guestbook, VisitLog, ContentView
)
from datetime import datetime
import uuid

api_bp = Blueprint('api', __name__)

def get_client_ip():
    if request.headers.getlist('X-Forwarded-For'):
        return request.headers.getlist('X-Forwarded-For')[0]
    elif request.headers.get('X-Real-IP'):
        return request.headers.get('X-Real-IP')
    else:
        return request.remote_addr

def record_visit(page_type, item_id=None):
    try:
        ip_address = get_client_ip()
        user_agent = request.headers.get('User-Agent', '')[:500]
        referrer = request.headers.get('Referer', '')[:500]
        page_url = request.path
        
        visit_log = VisitLog(
            page_url=page_url,
            page_type=page_type,
            item_id=item_id,
            ip_address=ip_address,
            user_agent=user_agent,
            session_id=str(uuid.uuid4())[:100],
            referrer=referrer
        )
        db.session.add(visit_log)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"Error recording visit: {e}")

def record_content_view(content_type, content_id):
    try:
        existing = ContentView.query.filter_by(
            content_type=content_type,
            content_id=content_id
        ).first()
        
        if existing:
            existing.view_count = existing.view_count + 1
            existing.last_viewed_at = datetime.utcnow()
        else:
            content_view = ContentView(
                content_type=content_type,
                content_id=content_id,
                view_count=1,
                unique_visitors=1
            )
            db.session.add(content_view)
        
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"Error recording content view: {e}")

@api_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'BeijingWalk API is running'}), 200

@api_bp.route('/banners', methods=['GET'])
def get_banners():
    record_visit('banner_list')
    banners = Banner.query.filter_by(is_active=True).order_by(Banner.order).all()
    return jsonify([banner.to_dict() for banner in banners]), 200

@api_bp.route('/banners/<int:id>', methods=['GET'])
def get_banner(id):
    record_visit('banner_detail', id)
    record_content_view('banner', id)
    banner = Banner.query.get_or_404(id)
    return jsonify(banner.to_dict()), 200

@api_bp.route('/cultures', methods=['GET'])
def get_cultures():
    record_visit('culture_list')
    cultures = Culture.query.filter_by(is_active=True).order_by(Culture.order).all()
    return jsonify([culture.to_dict() for culture in cultures]), 200

@api_bp.route('/cultures/<int:id>', methods=['GET'])
def get_culture(id):
    record_visit('culture_detail', id)
    record_content_view('culture', id)
    culture = Culture.query.get_or_404(id)
    return jsonify(culture.to_dict()), 200

@api_bp.route('/specialties', methods=['GET'])
def get_specialties():
    record_visit('specialty_list')
    specialties = Specialty.query.filter_by(is_active=True).order_by(Specialty.order).all()
    return jsonify([specialty.to_dict() for specialty in specialties]), 200

@api_bp.route('/specialties/<int:id>', methods=['GET'])
def get_specialty(id):
    record_visit('specialty_detail', id)
    record_content_view('specialty', id)
    specialty = Specialty.query.get_or_404(id)
    return jsonify(specialty.to_dict()), 200

@api_bp.route('/scenic-spots', methods=['GET'])
def get_scenic_spots():
    record_visit('scenic_list')
    scenic_spots = ScenicSpot.query.filter_by(is_active=True).order_by(ScenicSpot.order).all()
    return jsonify([spot.to_dict() for spot in scenic_spots]), 200

@api_bp.route('/scenic-spots/featured', methods=['GET'])
def get_featured_scenic_spots():
    record_visit('scenic_featured')
    featured = ScenicSpot.query.filter_by(is_active=True, is_featured=True).order_by(ScenicSpot.order).all()
    return jsonify([spot.to_dict() for spot in featured]), 200

@api_bp.route('/scenic-spots/<int:id>', methods=['GET'])
def get_scenic_spot(id):
    record_visit('scenic_detail', id)
    record_content_view('scenic_spot', id)
    spot = ScenicSpot.query.get_or_404(id)
    return jsonify(spot.to_dict()), 200

@api_bp.route('/heritages', methods=['GET'])
def get_heritages():
    record_visit('heritage_list')
    heritages = Heritage.query.filter_by(is_active=True).order_by(Heritage.order).all()
    return jsonify([heritage.to_dict() for heritage in heritages]), 200

@api_bp.route('/heritages/<int:id>', methods=['GET'])
def get_heritage(id):
    record_visit('heritage_detail', id)
    record_content_view('heritage', id)
    heritage = Heritage.query.get_or_404(id)
    return jsonify(heritage.to_dict()), 200

@api_bp.route('/all', methods=['GET'])
def get_all_data():
    record_visit('all_data')
    banners = Banner.query.filter_by(is_active=True).order_by(Banner.order).all()
    cultures = Culture.query.filter_by(is_active=True).order_by(Culture.order).all()
    specialties = Specialty.query.filter_by(is_active=True).order_by(Specialty.order).all()
    scenic_spots = ScenicSpot.query.filter_by(is_active=True).order_by(ScenicSpot.order).all()
    heritages = Heritage.query.filter_by(is_active=True).order_by(Heritage.order).all()
    
    return jsonify({
        'banners': [banner.to_dict() for banner in banners],
        'cultures': [culture.to_dict() for culture in cultures],
        'specialties': [specialty.to_dict() for specialty in specialties],
        'scenic_spots': [spot.to_dict() for spot in scenic_spots],
        'heritages': [heritage.to_dict() for heritage in heritages]
    }), 200

@api_bp.route('/guestbooks', methods=['GET'])
def get_guestbooks():
    record_visit('guestbook_list')
    guestbooks = Guestbook.query.filter_by(is_approved=True).order_by(Guestbook.created_at.desc()).all()
    return jsonify([guestbook.to_dict() for guestbook in guestbooks]), 200

@api_bp.route('/guestbooks', methods=['POST'])
def create_guestbook():
    data = request.get_json()
    
    if not data or not data.get('name') or not data.get('message'):
        return jsonify({'error': '姓名和留言内容不能为空'}), 400
    
    guestbook = Guestbook(
        name=data.get('name'),
        email=data.get('email'),
        message=data.get('message'),
        is_approved=True
    )
    
    try:
        db.session.add(guestbook)
        db.session.commit()
        return jsonify(guestbook.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@api_bp.route('/guestbooks/<int:id>', methods=['GET'])
def get_guestbook(id):
    guestbook = Guestbook.query.get_or_404(id)
    return jsonify(guestbook.to_dict()), 200