from flask import Blueprint, jsonify, request
from app import db
from app.models.models import (
    Banner, Culture, Specialty, ScenicSpot, Heritage, 
    Guestbook, PageView, ContentView, ContentViewEvent,
    SiteConfig, Navigation, Category, BookingGuide
)
from datetime import datetime
import json

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
