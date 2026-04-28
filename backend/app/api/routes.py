from flask import Blueprint, jsonify, request
from app import db
from app.models.models import (
    Banner, Culture, Specialty, ScenicSpot, Heritage, 
    Guestbook, PageView, ContentView, ContentViewEvent
)
from datetime import datetime

api_bp = Blueprint('api', __name__)

CONTENT_MODEL_MAP = {
    'banner': Banner,
    'culture': Culture,
    'specialty': Specialty,
    'scenic_spot': ScenicSpot,
    'heritage': Heritage,
}

def get_request_data():
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) else {}

def get_client_ip():
    if request.headers.getlist('X-Forwarded-For'):
        return request.headers.getlist('X-Forwarded-For')[0]
    elif request.headers.get('X-Real-IP'):
        return request.headers.get('X-Real-IP')
    else:
        return request.remote_addr

def sanitize_string(value, max_length=500):
    if value is None:
        return None
    text = str(value).strip()
    if not text:
        return None
    return text[:max_length]

def get_content_title(content):
    return getattr(content, 'title', None) or getattr(content, 'name', None)

@api_bp.route('/analytics/page-view', methods=['POST'])
def track_page_view():
    data = get_request_data()
    page_url = sanitize_string(data.get('page_url') or request.path, 500)
    page_type = sanitize_string(data.get('page_type'), 50)
    page_title = sanitize_string(data.get('page_title'), 200)
    visitor_id = sanitize_string(data.get('visitor_id'), 100)
    session_id = sanitize_string(data.get('session_id'), 100)
    referrer = sanitize_string(data.get('referrer') or request.headers.get('Referer'), 500)
    
    if not page_url or not page_type or not visitor_id or not session_id:
        return jsonify({'error': '埋点参数不完整'}), 400
    
    try:
        page_view = PageView(
            page_url=page_url,
            page_type=page_type,
            page_title=page_title,
            visitor_id=visitor_id,
            session_id=session_id,
            ip_address=get_client_ip(),
            user_agent=sanitize_string(request.headers.get('User-Agent'), 500),
            referrer=referrer
        )
        db.session.add(page_view)
        db.session.commit()
        return jsonify({'message': 'page_view recorded'}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error recording page view: {e}")
        return jsonify({'error': '记录页面访问失败'}), 500

@api_bp.route('/analytics/content-view', methods=['POST'])
def track_content_view():
    data = get_request_data()
    content_type = sanitize_string(data.get('content_type'), 50)
    content_id = data.get('content_id')
    visitor_id = sanitize_string(data.get('visitor_id'), 100)
    session_id = sanitize_string(data.get('session_id'), 100)
    page_url = sanitize_string(data.get('page_url') or request.path, 500)
    
    if not content_type or content_type not in CONTENT_MODEL_MAP:
        return jsonify({'error': '无效的内容类型'}), 400
    if not isinstance(content_id, int):
        return jsonify({'error': '内容 ID 无效'}), 400
    if not visitor_id or not session_id:
        return jsonify({'error': '访客标识缺失'}), 400
    
    model = CONTENT_MODEL_MAP[content_type]
    content = model.query.get(content_id)
    if not content:
        return jsonify({'error': '内容不存在'}), 404
    
    try:
        now = datetime.utcnow()
        aggregate = ContentView.query.filter_by(
            content_type=content_type,
            content_id=content_id
        ).first()
        if not aggregate:
            aggregate = ContentView(
                content_type=content_type,
                content_id=content_id,
                view_count=0,
                unique_visitors=0
            )
            db.session.add(aggregate)
        
        has_viewed_before = ContentViewEvent.query.filter_by(
            content_type=content_type,
            content_id=content_id,
            visitor_id=visitor_id
        ).first() is not None
        
        db.session.add(ContentViewEvent(
            content_type=content_type,
            content_id=content_id,
            visitor_id=visitor_id,
            session_id=session_id,
            page_url=page_url,
            created_at=now
        ))
        
        aggregate.view_count += 1
        aggregate.last_viewed_at = now
        if not has_viewed_before:
            aggregate.unique_visitors += 1
        
        db.session.commit()
        return jsonify({
            'message': 'content_view recorded',
            'content_type': content_type,
            'content_id': content_id,
            'title': get_content_title(content),
            'view_count': aggregate.view_count,
            'unique_visitors': aggregate.unique_visitors
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error recording content view: {e}")
        return jsonify({'error': '记录内容浏览失败'}), 500

@api_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'BeijingWalk API is running'}), 200

@api_bp.route('/banners', methods=['GET'])
def get_banners():
    banners = Banner.query.filter_by(is_active=True).order_by(Banner.order).all()
    return jsonify([banner.to_dict() for banner in banners]), 200

@api_bp.route('/banners/<int:id>', methods=['GET'])
def get_banner(id):
    banner = Banner.query.get_or_404(id)
    return jsonify(banner.to_dict()), 200

@api_bp.route('/cultures', methods=['GET'])
def get_cultures():
    cultures = Culture.query.filter_by(is_active=True).order_by(Culture.order).all()
    return jsonify([culture.to_dict() for culture in cultures]), 200

@api_bp.route('/cultures/<int:id>', methods=['GET'])
def get_culture(id):
    culture = Culture.query.get_or_404(id)
    return jsonify(culture.to_dict()), 200

@api_bp.route('/specialties', methods=['GET'])
def get_specialties():
    specialties = Specialty.query.filter_by(is_active=True).order_by(Specialty.order).all()
    return jsonify([specialty.to_dict() for specialty in specialties]), 200

@api_bp.route('/specialties/<int:id>', methods=['GET'])
def get_specialty(id):
    specialty = Specialty.query.get_or_404(id)
    return jsonify(specialty.to_dict()), 200

@api_bp.route('/scenic-spots', methods=['GET'])
def get_scenic_spots():
    scenic_spots = ScenicSpot.query.filter_by(is_active=True).order_by(ScenicSpot.order).all()
    return jsonify([spot.to_dict() for spot in scenic_spots]), 200

@api_bp.route('/scenic-spots/featured', methods=['GET'])
def get_featured_scenic_spots():
    featured = ScenicSpot.query.filter_by(is_active=True, is_featured=True).order_by(ScenicSpot.order).all()
    return jsonify([spot.to_dict() for spot in featured]), 200

@api_bp.route('/scenic-spots/<int:id>', methods=['GET'])
def get_scenic_spot(id):
    spot = ScenicSpot.query.get_or_404(id)
    return jsonify(spot.to_dict()), 200

@api_bp.route('/heritages', methods=['GET'])
def get_heritages():
    heritages = Heritage.query.filter_by(is_active=True).order_by(Heritage.order).all()
    return jsonify([heritage.to_dict() for heritage in heritages]), 200

@api_bp.route('/heritages/<int:id>', methods=['GET'])
def get_heritage(id):
    heritage = Heritage.query.get_or_404(id)
    return jsonify(heritage.to_dict()), 200

@api_bp.route('/all', methods=['GET'])
def get_all_data():
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
