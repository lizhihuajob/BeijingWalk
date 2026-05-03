from flask import Blueprint, jsonify, request
from app import db
from app.models.models import (
    Banner, Culture, Specialty, ScenicSpot, Heritage, 
    Guestbook, PageView, ContentView, ContentViewEvent,
    SiteConfig, Navigation, Category, BookingGuide,
    TravelPackage, ChatSession, ChatMessage, SearchHistory,
    parse_json_field
)
from datetime import datetime, timedelta
from sqlalchemy import func
import json
import uuid

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
        phone=data.get('phone'),
        country=data.get('country'),
        province=data.get('province'),
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

def parse_json_field(value, default=None):
    if value is None:
        return default
    if isinstance(value, str):
        try:
            return json.loads(value)
        except (json.JSONDecodeError, ValueError):
            return default
    return value

@api_bp.route('/site-config', methods=['GET'])
def get_site_config():
    config = SiteConfig.query.filter_by(is_active=True).first()
    if not config:
        default_config = {
            'id': 0,
            'site_name': '北京旅游',
            'site_description': '探索千年古都的魅力',
            'site_keywords': '',
            'contact_address': '北京市东城区',
            'contact_phone': '400-123-4567',
            'contact_email': 'info@beijingwalk.com',
            'copyright_text': '',
            'footer_links': None,
            'banner_title': '探索北京',
            'banner_subtitle': '千年古都',
            'banner_description': '感受历史与现代的完美交融，体验传统文化与时尚潮流的碰撞',
            'is_active': True
        }
        return jsonify(default_config), 200
    
    config_dict = config.to_dict()
    config_dict['footer_links'] = parse_json_field(config.footer_links)
    return jsonify(config_dict), 200

@api_bp.route('/navigations', methods=['GET'])
def get_navigations():
    navigations = Navigation.query.filter_by(is_active=True).order_by(Navigation.order).all()
    return jsonify([nav.to_dict() for nav in navigations]), 200

@api_bp.route('/categories', methods=['GET'])
def get_categories():
    categories = Category.query.filter_by(is_active=True).order_by(Category.order).all()
    return jsonify([cat.to_dict() for cat in categories]), 200

@api_bp.route('/booking-guides', methods=['GET'])
def get_booking_guides():
    guides = BookingGuide.query.filter_by(is_active=True).order_by(BookingGuide.order).all()
    result = []
    for guide in guides:
        guide_dict = guide.to_dict()
        guide_dict['steps'] = parse_json_field(guide.steps)
        guide_dict['important_notes'] = parse_json_field(guide.important_notes)
        result.append(guide_dict)
    return jsonify(result), 200

@api_bp.route('/booking-guides/<int:scenic_spot_id>', methods=['GET'])
def get_booking_guide_by_spot(scenic_spot_id):
    guide = BookingGuide.query.filter_by(
        scenic_spot_id=scenic_spot_id, 
        is_active=True
    ).first()
    
    if not guide:
        return jsonify({
            'id': 0,
            'scenic_spot_id': scenic_spot_id,
            'title': '景点购票指南',
            'description': '请通过官方渠道购买门票，确保顺利入园。',
            'steps': [{
                'title': '官方渠道购票',
                'content': '请访问景点官方网站或关注官方公众号/小程序进行购票。\n\n避免通过非官方渠道购票，以免造成损失。',
                'note': '建议提前3-7天预约，避免门票售罄'
            }],
            'important_notes': [
                '请携带购票时使用的有效身份证件原件',
                '建议提前了解景区开放时间和限流政策',
                '如有疑问，请联系景区官方客服'
            ],
            'contact_phone': None,
            'contact_work_time': None,
            'order': 0,
            'is_active': True
        }), 200
    
    guide_dict = guide.to_dict()
    guide_dict['steps'] = parse_json_field(guide.steps)
    guide_dict['important_notes'] = parse_json_field(guide.important_notes)
    return jsonify(guide_dict), 200

@api_bp.route('/config/all', methods=['GET'])
def get_all_config():
    config = SiteConfig.query.filter_by(is_active=True).first()
    navigations = Navigation.query.filter_by(is_active=True).order_by(Navigation.order).all()
    categories = Category.query.filter_by(is_active=True).order_by(Category.order).all()
    
    config_dict = None
    if config:
        config_dict = config.to_dict()
        config_dict['footer_links'] = parse_json_field(config.footer_links)
    else:
        config_dict = {
            'id': 0,
            'site_name': '北京旅游',
            'site_description': '探索千年古都的魅力',
            'site_keywords': '',
            'contact_address': '北京市东城区',
            'contact_phone': '400-123-4567',
            'contact_email': 'info@beijingwalk.com',
            'copyright_text': '',
            'footer_links': None,
            'banner_title': '探索北京',
            'banner_subtitle': '千年古都',
            'banner_description': '感受历史与现代的完美交融，体验传统文化与时尚潮流的碰撞',
            'is_active': True
        }
    
    return jsonify({
        'site_config': config_dict,
        'navigations': [nav.to_dict() for nav in navigations],
        'categories': [cat.to_dict() for cat in categories]
    }), 200

@api_bp.route('/scenic-spots/map', methods=['GET'])
def get_scenic_spots_for_map():
    scenic_spots = ScenicSpot.query.filter_by(is_active=True).order_by(ScenicSpot.order).all()
    
    result = []
    for spot in scenic_spots:
        spot_dict = spot.to_dict()
        if spot_dict['latitude'] and spot_dict['longitude']:
            result.append({
                'id': spot_dict['id'],
                'name': spot_dict['name'],
                'image_url': spot_dict['image_url'],
                'location': spot_dict['location'],
                'latitude': spot_dict['latitude'],
                'longitude': spot_dict['longitude'],
                'is_featured': spot_dict['is_featured'],
                'recommended_duration': spot_dict['recommended_duration'],
                'ticket_price_peak': spot_dict['ticket_price_peak'],
                'opening_status': spot_dict['opening_status']
            })
    
    return jsonify(result), 200

@api_bp.route('/scenic-spots/<int:id>/nearby', methods=['GET'])
def get_nearby_recommendations(id):
    spot = ScenicSpot.query.get_or_404(id)
    
    spot_dict = spot.to_dict()
    
    if not spot_dict['latitude'] or not spot_dict['longitude']:
        return jsonify({
            'error': '该景点暂无坐标信息',
            'food': [],
            'culture': [],
            'specialty': []
        }), 404
    
    nearby_data = {
        'spot_id': spot_dict['id'],
        'spot_name': spot_dict['name'],
        'spot_latitude': spot_dict['latitude'],
        'spot_longitude': spot_dict['longitude'],
        'food': [
            {
                'id': 1,
                'name': '全聚德烤鸭店',
                'type': 'restaurant',
                'distance': '约500米',
                'rating': 4.8,
                'address': '北京市东城区前门大街30号',
                'description': '中华老字号，以挂炉烤鸭闻名，是品尝北京烤鸭的绝佳选择。',
                'image_url': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20Chinese%20restaurant%20Quanjude%20Peking%20duck%20interior%20elegant%20dining%20room&image_size=square'
            },
            {
                'id': 2,
                'name': '老北京炸酱面',
                'type': 'restaurant',
                'distance': '约800米',
                'rating': 4.5,
                'address': '北京市东城区南锣鼓巷12号',
                'description': '地道的老北京炸酱面，面条劲道，酱料香浓，搭配各种小菜。',
                'image_url': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20Beijing%20zhajiangmian%20noodles%20with%20soybean%20paste%20and%20vegetables&image_size=square'
            },
            {
                'id': 3,
                'name': '护国寺小吃',
                'type': 'restaurant',
                'distance': '约1.2公里',
                'rating': 4.6,
                'address': '北京市西城区护国寺大街93号',
                'description': '汇集北京各种传统小吃，驴打滚、豌豆黄、艾窝窝等应有尽有。',
                'image_url': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20Chinese%20snacks%20Beijing%20Huguosi%20style%20assorted%20desserts%20and%20pastries&image_size=square'
            }
        ],
        'culture': [
            {
                'id': 1,
                'name': '国家博物馆',
                'type': 'museum',
                'distance': '约2公里',
                'rating': 4.9,
                'address': '北京市东城区东长安街16号',
                'description': '中国最大的综合性博物馆，收藏了大量珍贵文物，展示中华文明五千年历史。',
                'image_url': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=National%20Museum%20of%20China%20Beijing%20grand%20building%20exhibition%20halls%20ancient%20artifacts&image_size=square'
            },
            {
                'id': 2,
                'name': '北京老舍茶馆',
                'type': 'culture',
                'distance': '约1.5公里',
                'rating': 4.7,
                'address': '北京市西城区前门西大街正阳市场3号楼',
                'description': '以著名作家老舍命名的茶馆，可以品茶、欣赏京剧、相声等传统表演。',
                'image_url': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20Chinese%20teahouse%20LaoShe%20Beijing%20style%20interior%20with%20tea%20ceremony&image_size=square'
            },
            {
                'id': 3,
                'name': '北京自然博物馆',
                'type': 'museum',
                'distance': '约3公里',
                'rating': 4.6,
                'address': '北京市东城区天桥南大街126号',
                'description': '展示自然历史和生物进化的博物馆，适合家庭参观，有恐龙骨架等精彩展品。',
                'image_url': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=natural%20history%20museum%20Beijing%20dinosaur%20skeletons%20exhibition%20interior&image_size=square'
            }
        ],
        'specialty': [
            {
                'id': 1,
                'name': '北京同仁堂',
                'type': 'specialty',
                'distance': '约1公里',
                'rating': 4.8,
                'address': '北京市东城区大栅栏24号',
                'description': '中华老字号中药店，可以购买到正宗的中药材和中成药，还有保健品等。',
                'image_url': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20Chinese%20medicine%20shop%20Tongrentang%20Beijing%20herbs%20and%20remedies&image_size=square'
            },
            {
                'id': 2,
                'name': '内联升鞋店',
                'type': 'specialty',
                'distance': '约800米',
                'rating': 4.5,
                'address': '北京市西城区大栅栏街34号',
                'description': '中华老字号鞋店，以手工制作布鞋闻名，穿着舒适，是北京特色纪念品。',
                'image_url': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20Chinese%20shoe%20shop%20Neiliansheng%20Beijing%20handmade%20cloth%20shoes&image_size=square'
            },
            {
                'id': 3,
                'name': '瑞蚨祥丝绸店',
                'type': 'specialty',
                'distance': '约900米',
                'rating': 4.7,
                'address': '北京市西城区大栅栏街5号',
                'description': '中华老字号丝绸店，提供各种优质丝绸面料和成衣，是购买丝绸制品的好去处。',
                'image_url': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20Chinese%20silk%20shop%20Ruifuxiang%20Beijing%20colorful%20silk%20fabrics%20and%20garments&image_size=square'
            }
        ]
    }
    
    return jsonify(nearby_data), 200

@api_bp.route('/travel-packages', methods=['GET'])
def get_travel_packages():
    packages = TravelPackage.query.filter_by(is_active=True, status='active').order_by(TravelPackage.order).all()
    return jsonify([pkg.to_dict() for pkg in packages]), 200

@api_bp.route('/travel-packages/featured', methods=['GET'])
def get_featured_travel_packages():
    featured = TravelPackage.query.filter_by(
        is_active=True, 
        status='active', 
        is_featured=True
    ).order_by(TravelPackage.order).all()
    return jsonify([pkg.to_dict() for pkg in featured]), 200

@api_bp.route('/travel-packages/<int:id>', methods=['GET'])
def get_travel_package(id):
    package = TravelPackage.query.get_or_404(id)
    
    if not package.is_active or package.status != 'active':
        return jsonify({'error': '该产品已下架或不存在'}), 404
    
    package.view_count += 1
    db.session.commit()
    
    return jsonify(package.to_dict()), 200

import uuid

def generate_session_id():
    return str(uuid.uuid4())

@api_bp.route('/chat/init', methods=['POST'])
def init_chat_session():
    data = get_request_data()
    
    travel_package_id = data.get('travel_package_id')
    visitor_id = sanitize_string(data.get('visitor_id'), 100)
    visitor_name = sanitize_string(data.get('visitor_name'), 100)
    visitor_email = sanitize_string(data.get('visitor_email'), 200)
    visitor_phone = sanitize_string(data.get('visitor_phone'), 20)
    
    if not visitor_id:
        visitor_id = str(uuid.uuid4())
    
    session_id = generate_session_id()
    
    session = ChatSession(
        session_id=session_id,
        visitor_id=visitor_id,
        visitor_name=visitor_name,
        visitor_email=visitor_email,
        visitor_phone=visitor_phone,
        travel_package_id=travel_package_id,
        status='active'
    )
    
    db.session.add(session)
    db.session.commit()
    
    return jsonify({
        'session_id': session_id,
        'visitor_id': visitor_id,
        'message': '聊天会话已创建'
    }), 201

@api_bp.route('/chat/<session_id>/messages', methods=['GET'])
def get_chat_messages(session_id):
    session = ChatSession.query.filter_by(session_id=session_id).first()
    
    if not session:
        return jsonify({'error': '会话不存在'}), 404
    
    messages = ChatMessage.query.filter_by(
        session_id=session_id
    ).order_by(ChatMessage.created_at).all()
    
    unread_messages = [m for m in messages if m.sender_type == 'admin' and not m.is_read]
    for msg in unread_messages:
        msg.is_read = True
        msg.read_at = datetime.utcnow()
    
    session.unread_count = 0
    db.session.commit()
    
    return jsonify([msg.to_dict() for msg in messages]), 200

@api_bp.route('/chat/<session_id>/send', methods=['POST'])
def send_chat_message(session_id):
    session = ChatSession.query.filter_by(session_id=session_id).first()
    
    if not session:
        return jsonify({'error': '会话不存在'}), 404
    
    if session.status != 'active':
        return jsonify({'error': '会话已关闭'}), 400
    
    data = get_request_data()
    
    content = data.get('content')
    if not content or not content.strip():
        return jsonify({'error': '消息内容不能为空'}), 400
    
    visitor_name = sanitize_string(data.get('visitor_name'), 100) or '游客'
    
    message = ChatMessage(
        session_id=session_id,
        sender_type='visitor',
        sender_id=session.visitor_id,
        sender_name=visitor_name,
        message_type='text',
        content=content.strip()
    )
    
    session.last_message_at = datetime.utcnow()
    session.admin_unread_count += 1
    
    if visitor_name and not session.visitor_name:
        session.visitor_name = visitor_name
    
    db.session.add(message)
    db.session.commit()
    
    return jsonify(message.to_dict()), 201

@api_bp.route('/chat/<session_id>/poll', methods=['GET'])
def poll_chat_messages(session_id):
    session = ChatSession.query.filter_by(session_id=session_id).first()
    
    if not session:
        return jsonify({'error': '会话不存在'}), 404
    
    last_message_id = request.args.get('last_message_id', 0, type=int)
    
    messages = ChatMessage.query.filter(
        ChatMessage.session_id == session_id,
        ChatMessage.id > last_message_id
    ).order_by(ChatMessage.created_at).all()
    
    unread_admin_messages = [m for m in messages if m.sender_type == 'admin' and not m.is_read]
    for msg in unread_admin_messages:
        msg.is_read = True
        msg.read_at = datetime.utcnow()
    
    if unread_admin_messages:
        session.unread_count = max(0, session.unread_count - len(unread_admin_messages))
        db.session.commit()
    
    return jsonify({
        'messages': [msg.to_dict() for msg in messages],
        'session_status': session.status
    }), 200

@api_bp.route('/search', methods=['GET'])
def global_search():
    keyword = request.args.get('keyword', '').strip()
    search_type = request.args.get('type', 'all')
    limit = request.args.get('limit', 20, type=int)
    offset = request.args.get('offset', 0, type=int)
    
    if not keyword:
        return jsonify({
            'error': '搜索关键词不能为空',
            'results': [],
            'total': 0
        }), 400
    
    all_results = []
    
    if search_type == 'all' or search_type == 'scenic':
        scenic_query = ScenicSpot.query.filter(
            ScenicSpot.is_active == True,
            db.or_(
                ScenicSpot.name.like(f'%{keyword}%'),
                ScenicSpot.description.like(f'%{keyword}%'),
                ScenicSpot.location.like(f'%{keyword}%')
            )
        )
        scenic_count = scenic_query.count()
        scenic_results = scenic_query.order_by(ScenicSpot.order).offset(offset).limit(limit).all()
        
        for spot in scenic_results:
            spot_dict = spot.to_dict()
            spot_dict['result_type'] = 'scenic_spot'
            spot_dict['result_type_label'] = '景点'
            spot_dict['url'] = f'/scenic-spot/{spot.id}'
            all_results.append(spot_dict)
    
    if search_type == 'all' or search_type == 'specialty':
        specialty_query = Specialty.query.filter(
            Specialty.is_active == True,
            db.or_(
                Specialty.name.like(f'%{keyword}%'),
                Specialty.description.like(f'%{keyword}%')
            )
        )
        specialty_count = specialty_query.count()
        specialty_results = specialty_query.order_by(Specialty.order).offset(offset).limit(limit).all()
        
        for specialty in specialty_results:
            specialty_dict = specialty.to_dict()
            specialty_dict['result_type'] = 'specialty'
            specialty_dict['result_type_label'] = '特产'
            specialty_dict['url'] = f'/specialty/{specialty.id}'
            all_results.append(specialty_dict)
    
    if search_type == 'all' or search_type == 'culture':
        culture_query = Culture.query.filter(
            Culture.is_active == True,
            db.or_(
                Culture.title.like(f'%{keyword}%'),
                Culture.description.like(f'%{keyword}%'),
                Culture.details.like(f'%{keyword}%')
            )
        )
        culture_count = culture_query.count()
        culture_results = culture_query.order_by(Culture.order).offset(offset).limit(limit).all()
        
        for culture in culture_results:
            culture_dict = culture.to_dict()
            culture_dict['result_type'] = 'culture'
            culture_dict['result_type_label'] = '文化'
            culture_dict['url'] = f'/culture/{culture.id}'
            all_results.append(culture_dict)
    
    if search_type == 'all' or search_type == 'heritage':
        heritage_query = Heritage.query.filter(
            Heritage.is_active == True,
            db.or_(
                Heritage.name.like(f'%{keyword}%'),
                Heritage.description.like(f'%{keyword}%')
            )
        )
        heritage_count = heritage_query.count()
        heritage_results = heritage_query.order_by(Heritage.order).offset(offset).limit(limit).all()
        
        for heritage in heritage_results:
            heritage_dict = heritage.to_dict()
            heritage_dict['result_type'] = 'heritage'
            heritage_dict['result_type_label'] = '非遗'
            heritage_dict['url'] = f'/heritage/{heritage.id}'
            all_results.append(heritage_dict)
    
    try:
        search_history = SearchHistory(
            keyword=keyword,
            visitor_id=sanitize_string(request.args.get('visitor_id'), 100) or str(uuid.uuid4()),
            session_id=sanitize_string(request.args.get('session_id'), 100) or str(uuid.uuid4()),
            ip_address=get_client_ip(),
            user_agent=sanitize_string(request.headers.get('User-Agent'), 500),
            search_type=search_type,
            results_count=len(all_results)
        )
        db.session.add(search_history)
        db.session.commit()
    except Exception as e:
        print(f'Error recording search history: {e}')
    
    all_results.sort(key=lambda x: x.get('order', 0))
    
    total_count = (
        (scenic_count if 'scenic_count' in locals() else 0) +
        (specialty_count if 'specialty_count' in locals() else 0) +
        (culture_count if 'culture_count' in locals() else 0) +
        (heritage_count if 'heritage_count' in locals() else 0)
    )
    
    return jsonify({
        'keyword': keyword,
        'search_type': search_type,
        'results': all_results,
        'total': total_count,
        'count_by_type': {
            'scenic_spot': scenic_count if 'scenic_count' in locals() else 0,
            'specialty': specialty_count if 'specialty_count' in locals() else 0,
            'culture': culture_count if 'culture_count' in locals() else 0,
            'heritage': heritage_count if 'heritage_count' in locals() else 0
        }
    }), 200

@api_bp.route('/scenic-spots/filter', methods=['GET'])
def filter_scenic_spots():
    spot_type = request.args.get('type')
    limit = request.args.get('limit', 20, type=int)
    offset = request.args.get('offset', 0, type=int)
    
    query = ScenicSpot.query.filter_by(is_active=True)
    
    if spot_type:
        query = query.filter(ScenicSpot.spot_type == spot_type)
    
    total_count = query.count()
    results = query.order_by(ScenicSpot.order).offset(offset).limit(limit).all()
    
    return jsonify({
        'results': [spot.to_dict() for spot in results],
        'total': total_count,
        'filter_type': spot_type,
        'available_types': ['皇家园林', '寺庙', '胡同', '博物馆']
    }), 200

@api_bp.route('/specialties/filter', methods=['GET'])
def filter_specialties():
    category = request.args.get('category')
    limit = request.args.get('limit', 20, type=int)
    offset = request.args.get('offset', 0, type=int)
    
    query = Specialty.query.filter_by(is_active=True)
    
    if category:
        query = query.filter(Specialty.category == category)
    
    total_count = query.count()
    results = query.order_by(Specialty.order).offset(offset).limit(limit).all()
    
    return jsonify({
        'results': [specialty.to_dict() for specialty in results],
        'total': total_count,
        'filter_category': category,
        'available_categories': ['美食', '工艺品', '饮品']
    }), 200

@api_bp.route('/search/hot-keywords', methods=['GET'])
def get_hot_keywords():
    days = request.args.get('days', 7, type=int)
    limit = request.args.get('limit', 10, type=int)
    
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    hot_keywords = db.session.query(
        SearchHistory.keyword,
        func.count(SearchHistory.id).label('search_count')
    ).filter(
        SearchHistory.created_at >= cutoff_date
    ).group_by(
        SearchHistory.keyword
    ).order_by(
        func.count(SearchHistory.id).desc()
    ).limit(limit).all()
    
    default_hot = [
        {'keyword': '故宫', 'search_count': 0},
        {'keyword': '长城', 'search_count': 0},
        {'keyword': '颐和园', 'search_count': 0},
        {'keyword': '天坛', 'search_count': 0},
        {'keyword': '北京烤鸭', 'search_count': 0},
        {'keyword': '胡同', 'search_count': 0},
        {'keyword': '博物馆', 'search_count': 0},
        {'keyword': '雍和宫', 'search_count': 0},
    ]
    
    result = [{'keyword': kw.keyword, 'search_count': kw.search_count} for kw in hot_keywords]
    
    if not result:
        result = default_hot
    
    return jsonify({
        'hot_keywords': result,
        'days': days,
        'limit': limit
    }), 200

@api_bp.route('/itinerary/generate', methods=['POST'])
def generate_itinerary():
    data = get_request_data()
    
    selected_spot_ids = data.get('spot_ids', [])
    days = data.get('days', 1)
    preferences = data.get('preferences', {})
    
    if not selected_spot_ids:
        return jsonify({'error': '请选择至少一个景点'}), 400
    
    if days < 1 or days > 7:
        return jsonify({'error': '行程天数应在1-7天之间'}), 400
    
    spots = ScenicSpot.query.filter(
        ScenicSpot.id.in_(selected_spot_ids),
        ScenicSpot.is_active == True
    ).all()
    
    if not spots:
        return jsonify({'error': '未找到有效的景点'}), 404
    
    spot_dict = {spot.id: spot for spot in spots}
    ordered_spots = [spot_dict[spot_id] for spot_id in selected_spot_ids if spot_id in spot_dict]
    
    spots_per_day = max(1, len(ordered_spots) // days)
    itinerary = []
    
    time_blocks = [
        {'time': '上午', 'time_range': '9:00-12:00', 'type': 'morning'},
        {'time': '下午', 'time_range': '13:00-16:00', 'type': 'afternoon'},
        {'time': '晚上', 'time_range': '18:00-21:00', 'type': 'evening'}
    ]
    
    spot_index = 0
    total_spots = len(ordered_spots)
    
    for day in range(1, days + 1):
        day_plan = {
            'day': day,
            'title': f'第{day}天',
            'activities': []
        }
        
        spots_for_this_day = min(spots_per_day + (1 if day == days and (total_spots % days != 0) else 0), total_spots - spot_index)
        
        time_block_index = 0
        for i in range(spots_for_this_day):
            if spot_index >= total_spots:
                break
            
            spot = ordered_spots[spot_index]
            time_block = time_blocks[time_block_index % len(time_blocks)]
            
            spot_dict_data = spot.to_dict()
            tips_list = parse_json_field(spot_dict_data.get('tips'), [])
            
            activity = {
                'time': time_block['time'],
                'time_range': time_block['time_range'],
                'type': time_block['type'],
                'spot': {
                    'id': spot.id,
                    'name': spot.name,
                    'image_url': spot_dict_data.get('image_url'),
                    'location': spot_dict_data.get('location'),
                    'recommended_duration': spot_dict_data.get('recommended_duration'),
                    'ticket_price_peak': spot_dict_data.get('ticket_price_peak'),
                    'opening_status': spot_dict_data.get('opening_status')
                },
                'description': f'游览{spot.name}，{spot.description[:100]}...',
                'tips': tips_list[:2] if tips_list else []
            }
            
            day_plan['activities'].append(activity)
            spot_index += 1
            time_block_index += 1
        
        if day == days and preferences.get('include_dinner', True):
            dinner_activity = {
                'time': '晚上',
                'time_range': '18:00-20:00',
                'type': 'evening',
                'spot': None,
                'description': '推荐品尝北京特色美食，如北京烤鸭、炸酱面等。',
                'tips': [
                    '推荐餐厅：全聚德、大董、四季民福',
                    '建议提前预订，避免排队'
                ],
                'is_meal': True
            }
            day_plan['activities'].append(dinner_activity)
        
        itinerary.append(day_plan)
    
    summary = {
        'total_days': days,
        'total_spots': len(ordered_spots),
        'spots': [{'id': spot.id, 'name': spot.name} for spot in ordered_spots],
        'estimated_budget': f'约{len(ordered_spots) * 50}元/人（门票参考价）',
        'best_season': '春季（4-5月）和秋季（9-10月）是北京最佳旅游季节'
    }
    
    return jsonify({
        'itinerary': itinerary,
        'summary': summary,
        'preferences': preferences
    }), 200

from app.models.models import (
    User, QuizCategory, QuizQuestion, QuizGame, 
    QuizGameQuestion, Badge, UserBadge, UserScoreHistory
)
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt
)
from datetime import timedelta, datetime
import re

def validate_email(email):
    if not email:
        return False
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return re.match(email_regex, email) is not None

def validate_username(username):
    if not username or len(username) < 3 or len(username) > 20:
        return False
    username_regex = r'^[a-zA-Z0-9_\u4e00-\u9fa5]+$'
    return re.match(username_regex, username) is not None

def validate_password(password):
    if not password or len(password) < 6:
        return False
    return True

@api_bp.route('/auth/register', methods=['POST'])
def register():
    data = get_request_data()
    
    username = sanitize_string(data.get('username'), 80)
    email = sanitize_string(data.get('email'), 120)
    password = data.get('password')
    nickname = sanitize_string(data.get('nickname'), 80)
    
    if not username or not email or not password:
        return jsonify({'error': '用户名、邮箱和密码不能为空'}), 400
    
    if not validate_username(username):
        return jsonify({'error': '用户名格式不正确，应为3-20位字母、数字、下划线或中文'}), 400
    
    if not validate_email(email):
        return jsonify({'error': '邮箱格式不正确'}), 400
    
    if not validate_password(password):
        return jsonify({'error': '密码长度至少为6位'}), 400
    
    if User.query.filter_by(username=username).first():
        return jsonify({'error': '用户名已存在'}), 400
    
    if User.query.filter_by(email=email).first():
        return jsonify({'error': '邮箱已被注册'}), 400
    
    try:
        user = User(
            username=username,
            email=email,
            nickname=nickname or username
        )
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        access_token = create_access_token(
            identity=user.id,
            expires_delta=timedelta(days=1)
        )
        refresh_token = create_refresh_token(
            identity=user.id,
            expires_delta=timedelta(days=7)
        )
        
        return jsonify({
            'message': '注册成功',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f'Error registering user: {e}')
        return jsonify({'error': '注册失败，请稍后重试'}), 500

@api_bp.route('/auth/login', methods=['POST'])
def login():
    data = get_request_data()
    
    login_identifier = sanitize_string(data.get('username') or data.get('email'), 120)
    password = data.get('password')
    
    if not login_identifier or not password:
        return jsonify({'error': '请输入用户名/邮箱和密码'}), 400
    
    user = None
    if validate_email(login_identifier):
        user = User.query.filter_by(email=login_identifier).first()
    else:
        user = User.query.filter_by(username=login_identifier).first()
    
    if not user or not user.check_password(password):
        return jsonify({'error': '用户名/邮箱或密码错误'}), 401
    
    if not user.is_active:
        return jsonify({'error': '账户已被禁用，请联系管理员'}), 403
    
    try:
        user.last_login = datetime.utcnow()
        user.last_login_ip = get_client_ip()
        db.session.commit()
        
        access_token = create_access_token(
            identity=user.id,
            expires_delta=timedelta(days=1)
        )
        refresh_token = create_refresh_token(
            identity=user.id,
            expires_delta=timedelta(days=7)
        )
        
        return jsonify({
            'message': '登录成功',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        print(f'Error logging in: {e}')
        return jsonify({'error': '登录失败，请稍后重试'}), 500

@api_bp.route('/auth/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh_token():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_active:
            return jsonify({'error': '用户不存在或已被禁用'}), 401
        
        access_token = create_access_token(
            identity=user.id,
            expires_delta=timedelta(days=1)
        )
        
        return jsonify({
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
    except Exception as e:
        print(f'Error refreshing token: {e}')
        return jsonify({'error': '刷新令牌失败'}), 500

@api_bp.route('/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': '用户不存在'}), 404
        
        return jsonify(user.to_dict()), 200
    except Exception as e:
        print(f'Error getting current user: {e}')
        return jsonify({'error': '获取用户信息失败'}), 500

@api_bp.route('/auth/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': '用户不存在'}), 404
        
        data = get_request_data()
        
        nickname = sanitize_string(data.get('nickname'), 80)
        phone = sanitize_string(data.get('phone'), 20)
        avatar_url = sanitize_string(data.get('avatar_url'), 500)
        
        if nickname:
            user.nickname = nickname
        if phone:
            user.phone = phone
        if avatar_url:
            user.avatar_url = avatar_url
        
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        
        if current_password and new_password:
            if not user.check_password(current_password):
                return jsonify({'error': '当前密码错误'}), 400
            if not validate_password(new_password):
                return jsonify({'error': '新密码长度至少为6位'}), 400
            user.set_password(new_password)
        
        db.session.commit()
        
        return jsonify({
            'message': '资料更新成功',
            'user': user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        print(f'Error updating profile: {e}')
        return jsonify({'error': '更新资料失败'}), 500

@api_bp.route('/quiz/categories', methods=['GET'])
def get_quiz_categories():
    try:
        categories = QuizCategory.query.filter_by(is_active=True).order_by(QuizCategory.order).all()
        return jsonify([cat.to_dict() for cat in categories]), 200
    except Exception as e:
        print(f'Error getting quiz categories: {e}')
        return jsonify({'error': '获取问答分类失败'}), 500

@api_bp.route('/quiz/categories/<int:category_id>', methods=['GET'])
def get_quiz_category(category_id):
    try:
        category = QuizCategory.query.get_or_404(category_id)
        if not category.is_active:
            return jsonify({'error': '分类不存在或已禁用'}), 404
        
        result = category.to_dict()
        questions = QuizQuestion.query.filter_by(
            category_id=category_id,
            is_active=True
        ).order_by(QuizQuestion.order).limit(5).all()
        result['sample_questions'] = [q.to_dict(include_answer=False) for q in questions]
        
        return jsonify(result), 200
    except Exception as e:
        print(f'Error getting quiz category: {e}')
        return jsonify({'error': '获取分类详情失败'}), 500

@api_bp.route('/quiz/start', methods=['POST'])
@jwt_required()
def start_quiz():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': '用户不存在'}), 404
        
        data = get_request_data()
        category_id = data.get('category_id')
        game_type = sanitize_string(data.get('game_type'), 20) or 'standard'
        question_count = data.get('question_count', 10)
        
        query = QuizQuestion.query.filter_by(is_active=True)
        if category_id:
            query = query.filter_by(category_id=category_id)
        
        total_available = query.count()
        if total_available == 0:
            return jsonify({'error': '暂无可用的题目'}), 404
        
        question_count = min(question_count, total_available, 20)
        
        from sqlalchemy.sql.expression import func
        selected_questions = query.order_by(func.random()).limit(question_count).all()
        
        game = QuizGame(
            user_id=user.id,
            category_id=category_id,
            game_type=game_type,
            total_questions=len(selected_questions),
            current_question_index=0,
            status='active',
            started_at=datetime.utcnow()
        )
        db.session.add(game)
        db.session.flush()
        
        for index, question in enumerate(selected_questions):
            game_question = QuizGameQuestion(
                game_id=game.id,
                question_id=question.id,
                question_index=index
            )
            db.session.add(game_question)
        
        db.session.commit()
        
        first_question = selected_questions[0].to_dict(include_answer=False)
        
        return jsonify({
            'game': game.to_dict(),
            'current_question': first_question,
            'total_questions': len(selected_questions)
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f'Error starting quiz: {e}')
        return jsonify({'error': '开始游戏失败'}), 500

@api_bp.route('/quiz/game/<int:game_id>/current', methods=['GET'])
@jwt_required()
def get_current_question(game_id):
    try:
        current_user_id = get_jwt_identity()
        game = QuizGame.query.get_or_404(game_id)
        
        if game.user_id != current_user_id:
            return jsonify({'error': '无权访问此游戏'}), 403
        
        if game.status != 'active':
            return jsonify({'error': '游戏已结束或不存在'}), 400
        
        game_question = QuizGameQuestion.query.filter_by(
            game_id=game.id,
            question_index=game.current_question_index
        ).first()
        
        if not game_question or not game_question.question:
            return jsonify({'error': '题目不存在'}), 404
        
        return jsonify({
            'game': game.to_dict(),
            'question': game_question.question.to_dict(include_answer=False),
            'question_index': game.current_question_index
        }), 200
    except Exception as e:
        print(f'Error getting current question: {e}')
        return jsonify({'error': '获取题目失败'}), 500

@api_bp.route('/quiz/game/<int:game_id>/answer', methods=['POST'])
@jwt_required()
def submit_answer(game_id):
    try:
        current_user_id = get_jwt_identity()
        game = QuizGame.query.get_or_404(game_id)
        
        if game.user_id != current_user_id:
            return jsonify({'error': '无权访问此游戏'}), 403
        
        if game.status != 'active':
            return jsonify({'error': '游戏已结束或不存在'}), 400
        
        data = get_request_data()
        user_answer = sanitize_string(data.get('answer'), 1)
        time_spent = data.get('time_spent_seconds', 0)
        
        if not user_answer or user_answer not in ['A', 'B', 'C', 'D', 'a', 'b', 'c', 'd']:
            return jsonify({'error': '请选择有效的答案'}), 400
        
        user_answer = user_answer.upper()
        
        game_question = QuizGameQuestion.query.filter_by(
            game_id=game.id,
            question_index=game.current_question_index
        ).first()
        
        if not game_question or not game_question.question:
            return jsonify({'error': '题目不存在'}), 404
        
        question = game_question.question
        is_correct = user_answer == question.correct_option
        points_earned = 0
        
        if is_correct:
            points_earned = question.points
            game.correct_count += 1
            game.score += points_earned
            question.times_correct += 1
        else:
            game.incorrect_count += 1
            question.times_incorrect += 1
        
        question.times_used += 1
        game_question.user_answer = user_answer
        game_question.is_correct = is_correct
        game_question.points_earned = points_earned
        game_question.time_spent_seconds = time_spent
        game_question.answered_at = datetime.utcnow()
        
        game.current_question_index += 1
        
        is_game_complete = game.current_question_index >= game.total_questions
        if is_game_complete:
            game.status = 'completed'
            game.completed_at = datetime.utcnow()
            if game.started_at:
                game.duration_seconds = int((game.completed_at - game.started_at).total_seconds())
            
            user = User.query.get(current_user_id)
            user.total_score += game.score
            user.quizzes_completed += 1
            user.questions_correct += game.correct_count
            user.questions_total += game.total_questions
            
            score_history = UserScoreHistory(
                user_id=user.id,
                score_change=game.score,
                score_after=user.total_score,
                reason='quiz_game',
                source_type='quiz_game',
                source_id=game.id,
                description=f'完成问答游戏，答对{game.correct_count}题，获得{game.score}积分'
            )
            db.session.add(score_history)
            
            check_and_award_badges(user.id, game.score, game.correct_count)
        
        db.session.commit()
        
        result = {
            'is_correct': is_correct,
            'correct_option': question.correct_option,
            'explanation': question.explanation,
            'points_earned': points_earned,
            'game': game.to_dict(),
            'is_game_complete': is_game_complete
        }
        
        if is_game_complete:
            result['final_result'] = {
                'score': game.score,
                'correct_count': game.correct_count,
                'incorrect_count': game.incorrect_count,
                'accuracy_rate': game.get_accuracy_rate(),
                'duration_seconds': game.duration_seconds
            }
        
        return jsonify(result), 200
    except Exception as e:
        db.session.rollback()
        print(f'Error submitting answer: {e}')
        return jsonify({'error': '提交答案失败'}), 500

def check_and_award_badges(user_id, game_score, correct_count):
    user = User.query.get(user_id)
    if not user:
        return
    
    all_badges = Badge.query.filter_by(is_active=True).all()
    
    for badge in all_badges:
        existing = UserBadge.query.filter_by(
            user_id=user_id,
            badge_id=badge.id
        ).first()
        
        if existing:
            continue
        
        earned = False
        
        if badge.requirement_type == 'total_score':
            if user.total_score >= badge.requirement_value:
                earned = True
        
        elif badge.requirement_type == 'quizzes_completed':
            if user.quizzes_completed >= badge.requirement_value:
                earned = True
        
        elif badge.requirement_type == 'single_game_score':
            if game_score >= badge.requirement_value:
                earned = True
        
        elif badge.requirement_type == 'single_game_perfect':
            if correct_count >= 10 and correct_count == badge.requirement_value:
                earned = True
        
        elif badge.requirement_type == 'accuracy_rate':
            if user.get_accuracy_rate() >= badge.requirement_value and user.questions_total >= 10:
                earned = True
        
        if earned:
            user_badge = UserBadge(
                user_id=user_id,
                badge_id=badge.id,
                earned_at=datetime.utcnow(),
                is_new=True
            )
            db.session.add(user_badge)
            
            if badge.points_reward > 0:
                user.total_score += badge.points_reward
                score_history = UserScoreHistory(
                    user_id=user_id,
                    score_change=badge.points_reward,
                    score_after=user.total_score,
                    reason='badge_earned',
                    source_type='badge',
                    source_id=badge.id,
                    description=f'获得徽章「{badge.name}」，奖励{badge.points_reward}积分'
                )
                db.session.add(score_history)

@api_bp.route('/quiz/game/<int:game_id>/result', methods=['GET'])
@jwt_required()
def get_game_result(game_id):
    try:
        current_user_id = get_jwt_identity()
        game = QuizGame.query.get_or_404(game_id)
        
        if game.user_id != current_user_id:
            return jsonify({'error': '无权访问此游戏'}), 403
        
        if game.status != 'completed':
            return jsonify({'error': '游戏尚未完成'}), 400
        
        game_questions = QuizGameQuestion.query.filter_by(
            game_id=game.id
        ).order_by(QuizGameQuestion.question_index).all()
        
        result = game.to_dict()
        result['questions'] = [gq.to_dict() for gq in game_questions]
        
        return jsonify(result), 200
    except Exception as e:
        print(f'Error getting game result: {e}')
        return jsonify({'error': '获取游戏结果失败'}), 500

@api_bp.route('/quiz/history', methods=['GET'])
@jwt_required()
def get_quiz_history():
    try:
        current_user_id = get_jwt_identity()
        limit = request.args.get('limit', 20, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        query = QuizGame.query.filter_by(user_id=current_user_id).order_by(QuizGame.started_at.desc())
        total = query.count()
        games = query.offset(offset).limit(limit).all()
        
        return jsonify({
            'total': total,
            'games': [g.to_dict() for g in games]
        }), 200
    except Exception as e:
        print(f'Error getting quiz history: {e}')
        return jsonify({'error': '获取游戏历史失败'}), 500

@api_bp.route('/user/badges', methods=['GET'])
@jwt_required()
def get_user_badges():
    try:
        current_user_id = get_jwt_identity()
        
        user_badges = UserBadge.query.filter_by(
            user_id=current_user_id
        ).order_by(UserBadge.earned_at.desc()).all()
        
        for ub in user_badges:
            if ub.is_new:
                ub.is_new = False
        db.session.commit()
        
        all_badges = Badge.query.filter_by(is_active=True).all()
        earned_badge_ids = set(ub.badge_id for ub in user_badges)
        
        earned = []
        not_earned = []
        
        for badge in all_badges:
            badge_dict = badge.to_dict()
            if badge.id in earned_badge_ids:
                for ub in user_badges:
                    if ub.badge_id == badge.id:
                        badge_dict['earned_at'] = ub.earned_at.isoformat() if ub.earned_at else None
                        badge_dict['is_new'] = ub.is_new
                        break
                earned.append(badge_dict)
            else:
                not_earned.append(badge_dict)
        
        return jsonify({
            'earned': earned,
            'not_earned': not_earned,
            'total_earned': len(earned),
            'total_available': len(all_badges)
        }), 200
    except Exception as e:
        print(f'Error getting user badges: {e}')
        return jsonify({'error': '获取徽章失败'}), 500

@api_bp.route('/user/scores', methods=['GET'])
@jwt_required()
def get_user_scores():
    try:
        current_user_id = get_jwt_identity()
        limit = request.args.get('limit', 20, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        query = UserScoreHistory.query.filter_by(
            user_id=current_user_id
        ).order_by(UserScoreHistory.created_at.desc())
        
        total = query.count()
        histories = query.offset(offset).limit(limit).all()
        
        user = User.query.get(current_user_id)
        
        return jsonify({
            'current_score': user.total_score if user else 0,
            'total': total,
            'histories': [h.to_dict() for h in histories]
        }), 200
    except Exception as e:
        print(f'Error getting user scores: {e}')
        return jsonify({'error': '获取积分记录失败'}), 500

@api_bp.route('/quiz/leaderboard', methods=['GET'])
def get_leaderboard():
    try:
        limit = request.args.get('limit', 20, type=int)
        type_ = request.args.get('type', 'score')
        
        if type_ == 'accuracy':
            users = User.query.filter(
                User.questions_total >= 10
            ).order_by(
                User.questions_correct.desc()
            ).limit(limit).all()
            
            users.sort(key=lambda u: u.get_accuracy_rate(), reverse=True)
        else:
            users = User.query.order_by(
                User.total_score.desc()
            ).limit(limit).all()
        
        return jsonify({
            'type': type_,
            'leaderboard': [user.to_safe_dict() for user in users]
        }), 200
    except Exception as e:
        print(f'Error getting leaderboard: {e}')
        return jsonify({'error': '获取排行榜失败'}), 500

@api_bp.route('/quiz/init-data', methods=['POST'])
def init_quiz_data():
    try:
        existing_categories = QuizCategory.query.count()
        if existing_categories > 0:
            return jsonify({'message': '数据已存在，无需初始化'}), 200
        
        categories = [
            {
                'name': '北京历史',
                'name_en': 'Beijing History',
                'description': '测试你对北京悠久历史的了解，从古代都城到现代首都的变迁。',
                'icon': '📜',
                'color': 'from-amber-400 to-orange-500'
            },
            {
                'name': '名胜古迹',
                'name_en': 'Scenic Spots',
                'description': '了解北京的著名景点，故宫、长城、颐和园等世界文化遗产。',
                'icon': '🏛️',
                'color': 'from-red-400 to-rose-500'
            },
            {
                'name': '北京文化',
                'name_en': 'Beijing Culture',
                'description': '探索北京独特的文化传统，胡同文化、京剧、传统美食等。',
                'icon': '🎭',
                'color': 'from-purple-400 to-pink-500'
            },
            {
                'name': '美食特产',
                'name_en': 'Food & Specialties',
                'description': '品尝北京的特色美食，北京烤鸭、炸酱面、传统小吃等。',
                'icon': '🍜',
                'color': 'from-green-400 to-emerald-500'
            }
        ]
        
        created_categories = []
        for cat_data in categories:
            cat = QuizCategory(**cat_data, order=len(created_categories))
            db.session.add(cat)
            created_categories.append(cat)
        
        db.session.flush()
        
        questions_data = [
            {
                'category_name': '北京历史',
                'question_text': '北京作为都城的历史最早可以追溯到哪个朝代？',
                'difficulty': 'easy',
                'points': 10,
                'option_a': '唐朝',
                'option_b': '辽朝',
                'option_c': '金朝',
                'option_d': '元朝',
                'correct_option': 'B',
                'explanation': '北京最早作为都城是在辽朝，当时称为"南京"，是辽朝的陪都。金朝时期称为"中都"，正式成为都城。'
            },
            {
                'category_name': '北京历史',
                'question_text': '明朝哪位皇帝将都城从南京迁至北京？',
                'difficulty': 'easy',
                'points': 10,
                'option_a': '明太祖朱元璋',
                'option_b': '明成祖朱棣',
                'option_c': '明仁宗朱高炽',
                'option_d': '明宣宗朱瞻基',
                'correct_option': 'B',
                'explanation': '明成祖朱棣在1421年将都城从南京迁至北京，这是北京历史上的重要转折点。'
            },
            {
                'category_name': '北京历史',
                'question_text': '北京在历史上不包括以下哪个名称？',
                'difficulty': 'medium',
                'points': 15,
                'option_a': '燕京',
                'option_b': '大都',
                'option_c': '金陵',
                'option_d': '北平',
                'correct_option': 'C',
                'explanation': '金陵是南京的古称，不是北京的名称。北京曾被称为燕京（春秋战国）、大都（元朝）、北平（民国时期）等。'
            },
            {
                'category_name': '北京历史',
                'question_text': '故宫是在哪个朝代建成的？',
                'difficulty': 'easy',
                'points': 10,
                'option_a': '元朝',
                'option_b': '明朝',
                'option_c': '清朝',
                'option_d': '中华民国',
                'correct_option': 'B',
                'explanation': '故宫始建于明朝永乐四年（1406年），建成于永乐十八年（1420年），是明清两代的皇宫。'
            },
            {
                'category_name': '北京历史',
                'question_text': '北京和平解放是在哪一年？',
                'difficulty': 'medium',
                'points': 15,
                'option_a': '1948年',
                'option_b': '1949年',
                'option_c': '1950年',
                'option_d': '1951年',
                'correct_option': 'B',
                'explanation': '1949年1月，傅作义率部接受改编，北平和平解放。同年9月，北平改名为北京。'
            },
            {
                'category_name': '名胜古迹',
                'question_text': '故宫有多少个房间？',
                'difficulty': 'easy',
                'points': 10,
                'option_a': '8888间',
                'option_b': '9999间半',
                'option_c': '10000间',
                'option_d': '12345间',
                'correct_option': 'B',
                'explanation': '传说故宫有9999间半房间。实际上，根据1973年的统计，故宫有大小院落90多座，房屋980座，共计8707间。'
            },
            {
                'category_name': '名胜古迹',
                'question_text': '长城最早修建于哪个时期？',
                'difficulty': 'easy',
                'points': 10,
                'option_a': '秦朝',
                'option_b': '战国时期',
                'option_c': '汉朝',
                'option_d': '明朝',
                'correct_option': 'B',
                'explanation': '长城最早修建于战国时期，燕国、赵国、秦国等国都修建过长城。秦始皇统一六国后，将这些长城连接起来。'
            },
            {
                'category_name': '名胜古迹',
                'question_text': '北京的"三山五园"中的三山不包括以下哪座山？',
                'difficulty': 'hard',
                'points': 20,
                'option_a': '万寿山',
                'option_b': '香山',
                'option_c': '玉泉山',
                'option_d': '景山',
                'correct_option': 'D',
                'explanation': '"三山五园"中的三山指的是万寿山、香山、玉泉山。五园指的是畅春园、圆明园、清漪园（颐和园）、静明园、静宜园。'
            },
            {
                'category_name': '名胜古迹',
                'question_text': '颐和园是在哪个园林基础上修建的？',
                'difficulty': 'medium',
                'points': 15,
                'option_a': '圆明园',
                'option_b': '清漪园',
                'option_c': '畅春园',
                'option_d': '静明园',
                'correct_option': 'B',
                'explanation': '颐和园的前身是清漪园，始建于乾隆十五年（1750年）。1860年被英法联军焚毁后，1888年慈禧太后重建，改名为颐和园。'
            },
            {
                'category_name': '名胜古迹',
                'question_text': '天坛的主要建筑圜丘坛是用什么材料建造的？',
                'difficulty': 'medium',
                'points': 15,
                'option_a': '木质结构',
                'option_b': '砖石结构',
                'option_c': '汉白玉石',
                'option_d': '琉璃瓦',
                'correct_option': 'C',
                'explanation': '圜丘坛是用汉白玉石建造的三层圆形石台，全部采用艾叶青石，体现了中国古代"天人合一"的思想。'
            },
            {
                'category_name': '北京文化',
                'question_text': '北京胡同最典型的民居形式是什么？',
                'difficulty': 'easy',
                'points': 10,
                'option_a': '窑洞',
                'option_b': '四合院',
                'option_c': '吊脚楼',
                'option_d': '土楼',
                'correct_option': 'B',
                'explanation': '四合院是北京胡同最典型的民居形式，由正房、东西厢房和倒座房组成，中间是一个庭院。'
            },
            {
                'category_name': '北京文化',
                'question_text': '京剧的主要腔调不包括以下哪种？',
                'difficulty': 'medium',
                'points': 15,
                'option_a': '西皮',
                'option_b': '二黄',
                'option_c': '昆曲',
                'option_d': '高拨子',
                'correct_option': 'C',
                'explanation': '京剧的主要腔调是西皮和二黄，此外还有反西皮、反二黄、高拨子等。昆曲是独立的戏曲剧种，不是京剧的腔调。'
            },
            {
                'category_name': '北京文化',
                'question_text': '"北京话"属于哪个方言区？',
                'difficulty': 'medium',
                'points': 15,
                'option_a': '吴方言区',
                'option_b': '北方方言区',
                'option_c': '粤方言区',
                'option_d': '闽方言区',
                'correct_option': 'B',
                'explanation': '北京话属于北方方言（官话方言），具体来说是华北官话中的北京官话。北京话是普通话的基础方言。'
            },
            {
                'category_name': '北京文化',
                'question_text': '老北京"天桥八怪"主要活跃于哪个时期？',
                'difficulty': 'hard',
                'points': 20,
                'option_a': '清朝康熙年间',
                'option_b': '清朝乾隆年间',
                'option_c': '清末至民国初年',
                'option_d': '新中国成立后',
                'correct_option': 'C',
                'explanation': '"天桥八怪"是指清末至民国初年在北京天桥地区卖艺的八位著名民间艺人，他们以各自独特的技艺闻名，代表了老北京的市井文化。'
            },
            {
                'category_name': '北京文化',
                'question_text': '北京的"兔儿爷"与哪个传统节日有关？',
                'difficulty': 'medium',
                'points': 15,
                'option_a': '春节',
                'option_b': '端午节',
                'option_c': '中秋节',
                'option_d': '元宵节',
                'correct_option': 'C',
                'explanation': '兔儿爷是老北京中秋节的传统玩具，传说玉兔为百姓治病后，人们用泥塑造其形象来供奉和纪念，成为中秋节的吉祥物。'
            },
            {
                'category_name': '美食特产',
                'question_text': '正宗的北京烤鸭使用什么鸭子品种？',
                'difficulty': 'medium',
                'points': 15,
                'option_a': '麻鸭',
                'option_b': '北京鸭',
                'option_c': '樱桃谷鸭',
                'option_d': '绍兴鸭',
                'correct_option': 'B',
                'explanation': '正宗北京烤鸭使用的是北京鸭，这是中国培育的优良肉用鸭品种，以生长快、肉质细嫩、脂肪适中著称。'
            },
            {
                'category_name': '美食特产',
                'question_text': '北京炸酱面中的"炸酱"主要是用什么做的？',
                'difficulty': 'easy',
                'points': 10,
                'option_a': '黄豆酱',
                'option_b': '甜面酱和黄酱',
                'option_c': '豆瓣酱',
                'option_d': '辣椒酱',
                'correct_option': 'B',
                'explanation': '北京炸酱面的炸酱通常是用甜面酱和黄酱按照一定比例混合，加上五花肉丁炒制而成，是这道菜的灵魂所在。'
            },
            {
                'category_name': '美食特产',
                'question_text': '以下哪项不是北京传统小吃？',
                'difficulty': 'easy',
                'points': 10,
                'option_a': '驴打滚',
                'option_b': '豌豆黄',
                'option_c': '小笼包',
                'option_d': '艾窝窝',
                'correct_option': 'C',
                'explanation': '小笼包是上海、江苏等地的特色小吃，不是北京传统小吃。驴打滚、豌豆黄、艾窝窝都是北京著名的传统小吃。'
            },
            {
                'category_name': '美食特产',
                'question_text': '北京稻香村以什么著名？',
                'difficulty': 'easy',
                'points': 10,
                'option_a': '烤鸭',
                'option_b': '糕点和熟食',
                'option_c': '火锅',
                'option_d': '面条',
                'correct_option': 'B',
                'explanation': '稻香村是北京著名的老字号，以生产中式糕点、熟食和节日食品而闻名，是北京人购买点心的首选之一。'
            },
            {
                'category_name': '美食特产',
                'question_text': '老北京"豆汁儿"是用什么原料制作的？',
                'difficulty': 'medium',
                'points': 15,
                'option_a': '黄豆',
                'option_b': '绿豆',
                'option_c': '黑豆',
                'option_d': '红豆',
                'correct_option': 'B',
                'explanation': '豆汁儿是用绿豆制作淀粉时的副产品发酵而成，是老北京的传统饮品，具有独特的酸臭味，喜欢的人视若珍宝，不喜欢的人难以下咽。'
            }
        ]
        
        for q_data in questions_data:
            cat_name = q_data.pop('category_name')
            category = next((c for c in created_categories if c.name == cat_name), None)
            if category:
                q_data['category_id'] = category.id
                question = QuizQuestion(**q_data)
                db.session.add(question)
        
        badges_data = [
            {
                'name': '初出茅庐',
                'name_en': 'Beginner',
                'description': '完成第一次问答游戏',
                'icon': '🌱',
                'color': 'from-green-400 to-emerald-500',
                'rarity': 'common',
                'requirement_type': 'quizzes_completed',
                'requirement_value': 1,
                'points_reward': 50
            },
            {
                'name': '小试牛刀',
                'name_en': 'Novice',
                'description': '完成5次问答游戏',
                'icon': '⚔️',
                'color': 'from-blue-400 to-indigo-500',
                'rarity': 'common',
                'requirement_type': 'quizzes_completed',
                'requirement_value': 5,
                'points_reward': 100
            },
            {
                'name': '崭露头角',
                'name_en': 'Rising Star',
                'description': '完成10次问答游戏',
                'icon': '⭐',
                'color': 'from-yellow-400 to-amber-500',
                'rarity': 'uncommon',
                'requirement_type': 'quizzes_completed',
                'requirement_value': 10,
                'points_reward': 200
            },
            {
                'name': '知识达人',
                'name_en': 'Knowledge Master',
                'description': '累计获得500积分',
                'icon': '📚',
                'color': 'from-purple-400 to-pink-500',
                'rarity': 'uncommon',
                'requirement_type': 'total_score',
                'requirement_value': 500,
                'points_reward': 100
            },
            {
                'name': '博学之士',
                'name_en': 'Scholar',
                'description': '累计获得1000积分',
                'icon': '🎓',
                'color': 'from-red-400 to-rose-500',
                'rarity': 'rare',
                'requirement_type': 'total_score',
                'requirement_value': 1000,
                'points_reward': 200
            },
            {
                'name': '泰斗级',
                'name_en': 'Grand Master',
                'description': '累计获得5000积分',
                'icon': '👑',
                'color': 'from-amber-400 to-yellow-500',
                'rarity': 'legendary',
                'requirement_type': 'total_score',
                'requirement_value': 5000,
                'points_reward': 500
            },
            {
                'name': '答题快手',
                'name_en': 'Speedster',
                'description': '单次游戏获得100分以上',
                'icon': '⚡',
                'color': 'from-cyan-400 to-blue-500',
                'rarity': 'uncommon',
                'requirement_type': 'single_game_score',
                'requirement_value': 100,
                'points_reward': 50
            },
            {
                'name': '答题达人',
                'name_en': 'Quiz Master',
                'description': '单次游戏获得200分以上',
                'icon': '🔥',
                'color': 'from-orange-400 to-red-500',
                'rarity': 'rare',
                'requirement_type': 'single_game_score',
                'requirement_value': 200,
                'points_reward': 100
            },
            {
                'name': '神射手',
                'name_en': 'Sharpshooter',
                'description': '答题正确率达到80%以上',
                'icon': '🎯',
                'color': 'from-green-400 to-emerald-500',
                'rarity': 'rare',
                'requirement_type': 'accuracy_rate',
                'requirement_value': 80,
                'points_reward': 150
            },
            {
                'name': '百发百中',
                'name_en': 'Perfect Score',
                'description': '单次游戏全部答对10题',
                'icon': '💯',
                'color': 'from-purple-500 to-pink-500',
                'rarity': 'legendary',
                'requirement_type': 'single_game_perfect',
                'requirement_value': 10,
                'points_reward': 300
            }
        ]
        
        for badge_data in badges_data:
            badge = Badge(**badge_data)
            db.session.add(badge)
        
        db.session.commit()
        
        return jsonify({
            'message': '初始化成功',
            'categories_created': len(categories),
            'questions_created': len(questions_data),
            'badges_created': len(badges_data)
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f'Error initializing quiz data: {e}')
        return jsonify({'error': '初始化数据失败'}), 500
