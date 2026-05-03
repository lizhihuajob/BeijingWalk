from flask import Blueprint, jsonify, request
from app import db
from app.models.models import (
    Banner, Culture, Specialty, ScenicSpot, Heritage, 
    Guestbook, PageView, ContentView, ContentViewEvent,
    SiteConfig, Navigation, Category, BookingGuide,
    TravelPackage, ChatSession, ChatMessage, SearchHistory,
    ARExperience, VirtualPostcard, PostcardTemplate,
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

@api_bp.route('/ar-experiences', methods=['GET'])
def get_ar_experiences():
    category = request.args.get('category')
    featured = request.args.get('featured', type=lambda v: v.lower() == 'true')
    limit = request.args.get('limit', 20, type=int)
    offset = request.args.get('offset', 0, type=int)
    
    query = ARExperience.query.filter_by(is_active=True)
    
    if category:
        query = query.filter(ARExperience.category == category)
    if featured is not None:
        query = query.filter(ARExperience.featured == featured)
    
    total_count = query.count()
    experiences = query.order_by(ARExperience.order, ARExperience.id).offset(offset).limit(limit).all()
    
    return jsonify({
        'experiences': [exp.to_dict() for exp in experiences],
        'total': total_count,
        'categories': ['传统工艺', '传统服饰', '传统艺术', '传统美食']
    }), 200

@api_bp.route('/ar-experiences/<int:id>', methods=['GET'])
def get_ar_experience(id):
    experience = ARExperience.query.get_or_404(id)
    
    if not experience.is_active:
        return jsonify({'error': '该AR体验已下架'}), 404
    
    experience.view_count += 1
    db.session.commit()
    
    return jsonify(experience.to_dict()), 200

@api_bp.route('/ar-experiences/<int:id>/complete', methods=['POST'])
def complete_ar_experience(id):
    experience = ARExperience.query.get_or_404(id)
    
    if not experience.is_active:
        return jsonify({'error': '该AR体验已下架'}), 404
    
    experience.completion_count += 1
    db.session.commit()
    
    return jsonify({
        'message': 'AR体验完成记录已保存',
        'experience_id': id,
        'completion_count': experience.completion_count
    }), 200

@api_bp.route('/ar-experiences/by-heritage/<int:heritage_id>', methods=['GET'])
def get_ar_experiences_by_heritage(heritage_id):
    heritage = Heritage.query.get_or_404(heritage_id)
    
    experiences = ARExperience.query.filter_by(
        heritage_id=heritage_id,
        is_active=True
    ).order_by(ARExperience.order).all()
    
    return jsonify({
        'heritage_name': heritage.name,
        'heritage_id': heritage_id,
        'experiences': [exp.to_dict() for exp in experiences]
    }), 200

@api_bp.route('/postcard-templates', methods=['GET'])
def get_postcard_templates():
    category = request.args.get('category')
    featured = request.args.get('featured', type=lambda v: v.lower() == 'true')
    
    query = PostcardTemplate.query.filter_by(is_active=True)
    
    if category:
        query = query.filter(PostcardTemplate.category == category)
    if featured is not None:
        query = query.filter(PostcardTemplate.is_featured == featured)
    
    templates = query.order_by(PostcardTemplate.order).all()
    
    default_templates = [
        {
            'id': 0,
            'template_id': 'default',
            'name': '经典明信片',
            'description': '传统风格的明信片设计',
            'category': '经典',
            'preview_image_url': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20Chinese%20postcard%20template%20with%20red%20gold%20colors%20elegant%20design&image_size=square',
            'background_color': '#fffaf0',
            'text_color': '#1f2937',
            'accent_color': '#f59e0b',
            'font_family': 'serif',
            'text_position': 'bottom',
            'has_decorations': True,
            'order': 0,
            'is_active': True,
            'is_featured': True
        },
        {
            'id': 0,
            'template_id': 'modern',
            'name': '现代简约',
            'description': '简洁现代的设计风格',
            'category': '现代',
            'preview_image_url': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20minimalist%20postcard%20template%20clean%20design%20white%20space&image_size=square',
            'background_color': '#ffffff',
            'text_color': '#111827',
            'accent_color': '#3b82f6',
            'font_family': 'sans-serif',
            'text_position': 'right',
            'has_decorations': False,
            'order': 1,
            'is_active': True,
            'is_featured': True
        },
        {
            'id': 0,
            'template_id': 'vintage',
            'name': '复古怀旧',
            'description': '怀旧复古的老照片风格',
            'category': '复古',
            'preview_image_url': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20sepia%20postcard%20template%20old%20photo%20style%20decorative%20border&image_size=square',
            'background_color': '#fef3c7',
            'text_color': '#78350f',
            'accent_color': '#92400e',
            'font_family': 'serif',
            'text_position': 'bottom',
            'has_decorations': True,
            'order': 2,
            'is_active': True,
            'is_featured': True
        },
        {
            'id': 0,
            'template_id': 'festive',
            'name': '喜庆节日',
            'description': '喜庆的节日主题设计',
            'category': '节日',
            'preview_image_url': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=festive%20Chinese%20postcard%20template%20red%20gold%20lanterns%20celebration&image_size=square',
            'background_color': '#fef2f2',
            'text_color': '#991b1b',
            'accent_color': '#dc2626',
            'font_family': 'serif',
            'text_position': 'top',
            'has_decorations': True,
            'order': 3,
            'is_active': True,
            'is_featured': False
        }
    ]
    
    result = [t.to_dict() for t in templates] if templates else default_templates
    
    return jsonify({
        'templates': result,
        'categories': ['经典', '现代', '复古', '节日', '艺术']
    }), 200

@api_bp.route('/postcards', methods=['GET'])
def get_postcards():
    session_id = request.args.get('session_id')
    is_public = request.args.get('public', type=lambda v: v.lower() == 'true')
    limit = request.args.get('limit', 20, type=int)
    offset = request.args.get('offset', 0, type=int)
    
    query = VirtualPostcard.query
    
    if session_id:
        query = query.filter(VirtualPostcard.session_id == session_id)
    elif is_public:
        query = query.filter(VirtualPostcard.is_public == True)
    else:
        return jsonify({'error': '请提供 session_id 或设置 public=true'}), 400
    
    total_count = query.count()
    postcards = query.order_by(VirtualPostcard.created_at.desc()).offset(offset).limit(limit).all()
    
    return jsonify({
        'postcards': [p.to_dict() for p in postcards],
        'total': total_count
    }), 200

@api_bp.route('/postcards', methods=['POST'])
def create_postcard():
    data = get_request_data()
    
    session_id = sanitize_string(data.get('session_id'), 100) or str(uuid.uuid4())
    image_url = sanitize_string(data.get('image_url'), 500)
    template_id = sanitize_string(data.get('template_id'), 50) or 'default'
    
    if not image_url:
        return jsonify({'error': '请选择照片'}), 400
    
    scenic_spot_id = data.get('scenic_spot_id')
    heritage_id = data.get('heritage_id')
    
    if scenic_spot_id is not None and not isinstance(scenic_spot_id, int):
        return jsonify({'error': '景点ID格式无效'}), 400
    if heritage_id is not None and not isinstance(heritage_id, int):
        return jsonify({'error': '非遗ID格式无效'}), 400
    
    message = sanitize_string(data.get('message'), 1000)
    sender_name = sanitize_string(data.get('sender_name'), 100)
    recipient_name = sanitize_string(data.get('recipient_name'), 100)
    recipient_email = sanitize_string(data.get('recipient_email'), 200)
    
    style_options = data.get('style_options')
    is_public = data.get('is_public', False)
    
    postcard = VirtualPostcard(
        session_id=session_id,
        scenic_spot_id=scenic_spot_id,
        heritage_id=heritage_id,
        template_id=template_id,
        image_url=image_url,
        message=message,
        sender_name=sender_name,
        recipient_name=recipient_name,
        recipient_email=recipient_email,
        style_options=json.dumps(style_options, ensure_ascii=False) if style_options else None,
        is_public=bool(is_public)
    )
    
    db.session.add(postcard)
    db.session.commit()
    
    share_url = f'/postcard/{postcard.id}'
    postcard.share_url = share_url
    db.session.commit()
    
    return jsonify(postcard.to_dict()), 201

@api_bp.route('/postcards/<int:id>', methods=['GET'])
def get_postcard(id):
    postcard = VirtualPostcard.query.get_or_404(id)
    
    postcard.view_count += 1
    db.session.commit()
    
    return jsonify(postcard.to_dict()), 200

@api_bp.route('/postcards/<int:id>/send', methods=['POST'])
def send_postcard(id):
    postcard = VirtualPostcard.query.get_or_404(id)
    data = get_request_data()
    
    recipient_email = sanitize_string(data.get('recipient_email'), 200) or postcard.recipient_email
    
    if not recipient_email:
        return jsonify({'error': '请提供收件人邮箱'}), 400
    
    postcard.recipient_email = recipient_email
    postcard.is_sent = True
    postcard.sent_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({
        'message': '明信片已发送',
        'postcard_id': id,
        'recipient_email': recipient_email,
        'sent_at': postcard.sent_at.isoformat()
    }), 200

@api_bp.route('/postcards/photos', methods=['GET'])
def get_postcard_photos():
    type_param = request.args.get('type', 'all')
    limit = request.args.get('limit', 50, type=int)
    offset = request.args.get('offset', 0, type=int)
    
    photos = []
    
    if type_param == 'all' or type_param == 'scenic':
        scenic_spots = ScenicSpot.query.filter_by(is_active=True).order_by(ScenicSpot.order).offset(offset).limit(limit).all()
        for spot in scenic_spots:
            photos.append({
                'id': spot.id,
                'type': 'scenic_spot',
                'name': spot.name,
                'image_url': spot.image_url,
                'description': spot.description[:80] + '...' if len(spot.description) > 80 else spot.description,
                'location': spot.location,
                'is_featured': spot.is_featured
            })
    
    if type_param == 'all' or type_param == 'heritage':
        heritages = Heritage.query.filter_by(is_active=True).order_by(Heritage.order).offset(offset).limit(limit).all()
        for heritage in heritages:
            photos.append({
                'id': heritage.id,
                'type': 'heritage',
                'name': heritage.name,
                'image_url': heritage.image_url,
                'description': heritage.description[:80] + '...' if len(heritage.description) > 80 else heritage.description,
                'icon': heritage.icon,
                'is_featured': False
            })
    
    if type_param == 'all' or type_param == 'culture':
        cultures = Culture.query.filter_by(is_active=True).order_by(Culture.order).offset(offset).limit(limit).all()
        for culture in cultures:
            photos.append({
                'id': culture.id,
                'type': 'culture',
                'name': culture.title,
                'image_url': culture.image_url,
                'description': culture.description[:80] + '...' if len(culture.description) > 80 else culture.description,
                'is_featured': False
            })
    
    return jsonify({
        'photos': photos,
        'total': len(photos),
        'types': ['all', 'scenic', 'heritage', 'culture']
    }), 200
