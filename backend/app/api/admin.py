from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from app.models.models import (
    AdminUser, PageView, ContentView,
    Banner, Culture, Specialty, ScenicSpot, Heritage, Guestbook,
    SiteConfig, Navigation, Category, BookingGuide, OperationLog
)
from datetime import datetime, timedelta
from functools import wraps
from sqlalchemy import func, desc
import json

admin_bp = Blueprint('admin', __name__)

def get_request_data():
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) else {}

def get_current_admin_id():
    identity = get_jwt_identity()
    try:
        return int(identity)
    except (TypeError, ValueError):
        return None

def get_client_ip():
    if request.headers.getlist('X-Forwarded-For'):
        return request.headers.getlist('X-Forwarded-For')[0]
    elif request.headers.get('X-Real-IP'):
        return request.headers.get('X-Real-IP')
    else:
        return request.remote_addr

def log_operation(module, action, target_type=None, target_id=None, target_name=None, description=None):
    try:
        current_user_id = get_current_admin_id()
        if current_user_id is None:
            return
        
        admin = AdminUser.query.get(current_user_id)
        if not admin:
            return
        
        log_entry = OperationLog(
            admin_id=admin.id,
            admin_username=admin.username,
            module=module,
            action=action,
            target_type=target_type,
            target_id=target_id,
            target_name=str(target_name) if target_name else None,
            description=description,
            ip_address=get_client_ip(),
            user_agent=request.headers.get('User-Agent')
        )
        db.session.add(log_entry)
        db.session.commit()
    except Exception as e:
        print(f"Error logging operation: {e}")
        db.session.rollback()

def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        try:
            current_user_id = get_current_admin_id()
            if current_user_id is None:
                return jsonify({'error': '登录状态无效'}), 401
            admin = AdminUser.query.get(current_user_id)
            if not admin or not admin.is_active:
                return jsonify({'error': '无权限访问'}), 403
            return fn(*args, **kwargs)
        except Exception as e:
            print(f"Error in admin_required: {e}")
            db.session.rollback()
            return jsonify({'error': '服务器错误'}), 500
    return wrapper

@admin_bp.route('/login', methods=['POST'])
def login():
    data = get_request_data()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': '用户名和密码不能为空'}), 400
    
    admin = AdminUser.query.filter_by(username=data.get('username')).first()
    
    if not admin or not admin.check_password(data.get('password')):
        return jsonify({'error': '用户名或密码错误'}), 401
    
    if not admin.is_active:
        return jsonify({'error': '账户已被禁用'}), 403
    
    admin.last_login = datetime.utcnow()
    db.session.commit()
    
    access_token = create_access_token(identity=str(admin.id), expires_delta=timedelta(hours=24))
    
    return jsonify({
        'access_token': access_token,
        'admin': admin.to_dict()
    }), 200

@admin_bp.route('/profile', methods=['GET'])
@admin_required
def get_profile():
    current_user_id = get_current_admin_id()
    admin = AdminUser.query.get(current_user_id)
    return jsonify(admin.to_dict()), 200

@admin_bp.route('/profile', methods=['PUT'])
@admin_required
def update_profile():
    current_user_id = get_current_admin_id()
    admin = AdminUser.query.get(current_user_id)
    data = get_request_data()
    
    if 'username' in data and data.get('username') != admin.username:
        if AdminUser.query.filter_by(username=data.get('username')).first():
            return jsonify({'error': '用户名已存在'}), 400
        admin.username = data.get('username')
    
    if 'email' in data and data.get('email') != admin.email:
        if AdminUser.query.filter_by(email=data.get('email')).first():
            return jsonify({'error': '邮箱已存在'}), 400
        admin.email = data.get('email')
    
    if data.get('password'):
        admin.set_password(data.get('password'))
    
    db.session.commit()
    return jsonify(admin.to_dict()), 200

@admin_bp.route('/dashboard/stats', methods=['GET'])
@admin_required
def get_dashboard_stats():
    total_visits = 0
    today_visits = 0
    total_content_views = 0
    
    try:
        total_visits = db.session.query(func.count(PageView.id)).scalar() or 0
    except Exception as e:
        print(f"Error querying PageView: {e}")
    
    try:
        today = datetime.utcnow().date()
        today_visits = db.session.query(func.count(PageView.id)).filter(
            func.date(PageView.created_at) == today
        ).scalar() or 0
    except Exception as e:
        print(f"Error querying today's visits: {e}")
    
    try:
        total_content_views = db.session.query(func.sum(ContentView.view_count)).scalar() or 0
    except Exception as e:
        print(f"Error querying ContentView: {e}")
    
    total_banners = db.session.query(func.count(Banner.id)).scalar() or 0
    total_cultures = db.session.query(func.count(Culture.id)).scalar() or 0
    total_specialties = db.session.query(func.count(Specialty.id)).scalar() or 0
    total_scenic = db.session.query(func.count(ScenicSpot.id)).scalar() or 0
    total_heritages = db.session.query(func.count(Heritage.id)).scalar() or 0
    total_guestbooks = db.session.query(func.count(Guestbook.id)).scalar() or 0
    
    return jsonify({
        'total_visits': total_visits,
        'today_visits': today_visits,
        'total_content': {
            'banners': total_banners,
            'cultures': total_cultures,
            'specialties': total_specialties,
            'scenic_spots': total_scenic,
            'heritages': total_heritages,
            'guestbooks': total_guestbooks
        },
        'total_content_views': total_content_views
    }), 200

@admin_bp.route('/dashboard/trending', methods=['GET'])
@admin_required
def get_trending_content():
    content_details = []
    try:
        trending = db.session.query(ContentView).order_by(
            ContentView.view_count.desc()
        ).limit(10).all()
        
        for cv in trending:
            content = None
            title = None
            
            if cv.content_type == 'banner':
                content = Banner.query.get(cv.content_id)
                title = content.title if content else None
            elif cv.content_type == 'culture':
                content = Culture.query.get(cv.content_id)
                title = content.title if content else None
            elif cv.content_type == 'specialty':
                content = Specialty.query.get(cv.content_id)
                title = content.name if content else None
            elif cv.content_type == 'scenic_spot':
                content = ScenicSpot.query.get(cv.content_id)
                title = content.name if content else None
            elif cv.content_type == 'heritage':
                content = Heritage.query.get(cv.content_id)
                title = content.name if content else None
            
            if content:
                content_details.append({
                    'id': cv.id,
                    'content_type': cv.content_type,
                    'content_id': cv.content_id,
                    'title': title,
                    'view_count': cv.view_count,
                    'unique_visitors': cv.unique_visitors,
                    'last_viewed_at': cv.last_viewed_at.isoformat() if cv.last_viewed_at else None
                })
    except Exception as e:
        print(f"Error querying trending content: {e}")
    
    return jsonify(content_details), 200

@admin_bp.route('/dashboard/visit-trend', methods=['GET'])
@admin_required
def get_visit_trend():
    trend_data = []
    try:
        days = request.args.get('days', 7, type=int)
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        visits = db.session.query(
            func.date(PageView.created_at).label('date'),
            func.count(PageView.id).label('count')
        ).filter(
            PageView.created_at >= start_date
        ).group_by(
            func.date(PageView.created_at)
        ).order_by(
            func.date(PageView.created_at)
        ).all()
        
        trend_data = [{'date': str(v.date), 'count': v.count} for v in visits]
    except Exception as e:
        print(f"Error querying visit trend: {e}")
    
    return jsonify(trend_data), 200

@admin_bp.route('/banners', methods=['GET'])
@admin_required
def get_banners_admin():
    banners = Banner.query.order_by(Banner.order).all()
    return jsonify([banner.to_dict() for banner in banners]), 200

@admin_bp.route('/banners', methods=['POST'])
@admin_required
def create_banner():
    data = get_request_data()
    
    if not data or not data.get('title') or not data.get('image_url'):
        return jsonify({'error': '标题和图片URL不能为空'}), 400
    
    banner = Banner(
        title=data.get('title'),
        image_url=data.get('image_url'),
        description=data.get('description', ''),
        order=data.get('order', 0),
        is_active=data.get('is_active', True)
    )
    
    db.session.add(banner)
    db.session.commit()
    
    log_operation(
        module='内容管理',
        action='create',
        target_type='Banner',
        target_id=banner.id,
        target_name=banner.title,
        description=f'创建轮播图: {banner.title}'
    )
    
    return jsonify(banner.to_dict()), 201

@admin_bp.route('/banners/<int:id>', methods=['GET'])
@admin_required
def get_banner_admin(id):
    banner = Banner.query.get_or_404(id)
    return jsonify(banner.to_dict()), 200

@admin_bp.route('/banners/<int:id>', methods=['PUT'])
@admin_required
def update_banner(id):
    banner = Banner.query.get_or_404(id)
    old_title = banner.title
    data = get_request_data()
    
    if 'title' in data:
        banner.title = data.get('title')
    if 'image_url' in data:
        banner.image_url = data.get('image_url')
    if 'description' in data:
        banner.description = data.get('description')
    if 'order' in data:
        banner.order = data.get('order')
    if 'is_active' in data:
        banner.is_active = data.get('is_active')
    
    db.session.commit()
    
    log_operation(
        module='内容管理',
        action='update',
        target_type='Banner',
        target_id=id,
        target_name=banner.title,
        description=f'更新轮播图: {old_title} -> {banner.title}' if old_title != banner.title else f'更新轮播图: {banner.title}'
    )
    
    return jsonify(banner.to_dict()), 200

@admin_bp.route('/banners/<int:id>', methods=['DELETE'])
@admin_required
def delete_banner(id):
    banner = Banner.query.get_or_404(id)
    banner_title = banner.title
    db.session.delete(banner)
    db.session.commit()
    
    log_operation(
        module='内容管理',
        action='delete',
        target_type='Banner',
        target_id=id,
        target_name=banner_title,
        description=f'删除轮播图: {banner_title}'
    )
    
    return jsonify({'message': '删除成功'}), 200

@admin_bp.route('/cultures', methods=['GET'])
@admin_required
def get_cultures_admin():
    cultures = Culture.query.order_by(Culture.order).all()
    return jsonify([culture.to_dict() for culture in cultures]), 200

@admin_bp.route('/cultures', methods=['POST'])
@admin_required
def create_culture():
    data = get_request_data()
    
    if not data or not data.get('title') or not data.get('image_url') or not data.get('description'):
        return jsonify({'error': '标题、图片URL和描述不能为空'}), 400
    
    culture = Culture(
        title=data.get('title'),
        image_url=data.get('image_url'),
        description=data.get('description'),
        details=data.get('details', ''),
        order=data.get('order', 0),
        is_active=data.get('is_active', True)
    )
    
    db.session.add(culture)
    db.session.commit()
    
    log_operation(
        module='内容管理',
        action='create',
        target_type='Culture',
        target_id=culture.id,
        target_name=culture.title,
        description=f'创建文化内容: {culture.title}'
    )
    
    return jsonify(culture.to_dict()), 201

@admin_bp.route('/cultures/<int:id>', methods=['GET'])
@admin_required
def get_culture_admin(id):
    culture = Culture.query.get_or_404(id)
    return jsonify(culture.to_dict()), 200

@admin_bp.route('/cultures/<int:id>', methods=['PUT'])
@admin_required
def update_culture(id):
    culture = Culture.query.get_or_404(id)
    old_title = culture.title
    data = get_request_data()
    
    if 'title' in data:
        culture.title = data.get('title')
    if 'image_url' in data:
        culture.image_url = data.get('image_url')
    if 'description' in data:
        culture.description = data.get('description')
    if 'details' in data:
        culture.details = data.get('details')
    if 'order' in data:
        culture.order = data.get('order')
    if 'is_active' in data:
        culture.is_active = data.get('is_active')
    
    db.session.commit()
    
    log_operation(
        module='内容管理',
        action='update',
        target_type='Culture',
        target_id=id,
        target_name=culture.title,
        description=f'更新文化内容: {old_title}'
    )
    
    return jsonify(culture.to_dict()), 200

@admin_bp.route('/cultures/<int:id>', methods=['DELETE'])
@admin_required
def delete_culture(id):
    culture = Culture.query.get_or_404(id)
    culture_title = culture.title
    db.session.delete(culture)
    db.session.commit()
    
    log_operation(
        module='内容管理',
        action='delete',
        target_type='Culture',
        target_id=id,
        target_name=culture_title,
        description=f'删除文化内容: {culture_title}'
    )
    
    return jsonify({'message': '删除成功'}), 200

@admin_bp.route('/specialties', methods=['GET'])
@admin_required
def get_specialties_admin():
    specialties = Specialty.query.order_by(Specialty.order).all()
    return jsonify([specialty.to_dict() for specialty in specialties]), 200

@admin_bp.route('/specialties', methods=['POST'])
@admin_required
def create_specialty():
    data = get_request_data()
    
    if not data or not data.get('name') or not data.get('image_url') or not data.get('description'):
        return jsonify({'error': '名称、图片URL和描述不能为空'}), 400
    
    specialty = Specialty(
        name=data.get('name'),
        image_url=data.get('image_url'),
        description=data.get('description'),
        rating=data.get('rating', 4.5),
        order=data.get('order', 0),
        is_active=data.get('is_active', True)
    )
    
    db.session.add(specialty)
    db.session.commit()
    
    log_operation(
        module='内容管理',
        action='create',
        target_type='Specialty',
        target_id=specialty.id,
        target_name=specialty.name,
        description=f'创建特产: {specialty.name}'
    )
    
    return jsonify(specialty.to_dict()), 201

@admin_bp.route('/specialties/<int:id>', methods=['GET'])
@admin_required
def get_specialty_admin(id):
    specialty = Specialty.query.get_or_404(id)
    return jsonify(specialty.to_dict()), 200

@admin_bp.route('/specialties/<int:id>', methods=['PUT'])
@admin_required
def update_specialty(id):
    specialty = Specialty.query.get_or_404(id)
    old_name = specialty.name
    data = get_request_data()
    
    if 'name' in data:
        specialty.name = data.get('name')
    if 'image_url' in data:
        specialty.image_url = data.get('image_url')
    if 'description' in data:
        specialty.description = data.get('description')
    if 'rating' in data:
        specialty.rating = data.get('rating')
    if 'order' in data:
        specialty.order = data.get('order')
    if 'is_active' in data:
        specialty.is_active = data.get('is_active')
    
    db.session.commit()
    
    log_operation(
        module='内容管理',
        action='update',
        target_type='Specialty',
        target_id=id,
        target_name=specialty.name,
        description=f'更新特产: {old_name}'
    )
    
    return jsonify(specialty.to_dict()), 200

@admin_bp.route('/specialties/<int:id>', methods=['DELETE'])
@admin_required
def delete_specialty(id):
    specialty = Specialty.query.get_or_404(id)
    specialty_name = specialty.name
    db.session.delete(specialty)
    db.session.commit()
    
    log_operation(
        module='内容管理',
        action='delete',
        target_type='Specialty',
        target_id=id,
        target_name=specialty_name,
        description=f'删除特产: {specialty_name}'
    )
    
    return jsonify({'message': '删除成功'}), 200

@admin_bp.route('/scenic-spots', methods=['GET'])
@admin_required
def get_scenic_spots_admin():
    scenic_spots = ScenicSpot.query.order_by(ScenicSpot.order).all()
    return jsonify([spot.to_dict() for spot in scenic_spots]), 200

@admin_bp.route('/scenic-spots', methods=['POST'])
@admin_required
def create_scenic_spot():
    data = get_request_data()
    
    if not data or not data.get('name') or not data.get('image_url') or not data.get('description'):
        return jsonify({'error': '名称、图片URL和描述不能为空'}), 400
    
    scenic_spot = ScenicSpot(
        name=data.get('name'),
        image_url=data.get('image_url'),
        description=data.get('description'),
        is_featured=data.get('is_featured', False),
        order=data.get('order', 0),
        is_active=data.get('is_active', True),
        location=data.get('location'),
        tips=data.get('tips'),
        ticket_price_peak=data.get('ticket_price_peak'),
        ticket_price_off_peak=data.get('ticket_price_off_peak'),
        ticket_additional_info=data.get('ticket_additional_info'),
        ticket_url=data.get('ticket_url'),
        has_direct_booking=data.get('has_direct_booking', False),
        opening_hours_peak=data.get('opening_hours_peak'),
        opening_hours_off_peak=data.get('opening_hours_off_peak'),
        additional_opening_notes=data.get('additional_opening_notes'),
        recommended_duration=data.get('recommended_duration')
    )
    
    db.session.add(scenic_spot)
    db.session.commit()
    
    log_operation(
        module='内容管理',
        action='create',
        target_type='ScenicSpot',
        target_id=scenic_spot.id,
        target_name=scenic_spot.name,
        description=f'创建景点: {scenic_spot.name}'
    )
    
    return jsonify(scenic_spot.to_dict()), 201

@admin_bp.route('/scenic-spots/<int:id>', methods=['GET'])
@admin_required
def get_scenic_spot_admin(id):
    scenic_spot = ScenicSpot.query.get_or_404(id)
    return jsonify(scenic_spot.to_dict()), 200

@admin_bp.route('/scenic-spots/<int:id>', methods=['PUT'])
@admin_required
def update_scenic_spot(id):
    scenic_spot = ScenicSpot.query.get_or_404(id)
    old_name = scenic_spot.name
    data = get_request_data()
    
    if 'name' in data:
        scenic_spot.name = data.get('name')
    if 'image_url' in data:
        scenic_spot.image_url = data.get('image_url')
    if 'description' in data:
        scenic_spot.description = data.get('description')
    if 'is_featured' in data:
        scenic_spot.is_featured = data.get('is_featured')
    if 'order' in data:
        scenic_spot.order = data.get('order')
    if 'is_active' in data:
        scenic_spot.is_active = data.get('is_active')
    if 'location' in data:
        scenic_spot.location = data.get('location')
    if 'tips' in data:
        scenic_spot.tips = data.get('tips')
    if 'ticket_price_peak' in data:
        scenic_spot.ticket_price_peak = data.get('ticket_price_peak')
    if 'ticket_price_off_peak' in data:
        scenic_spot.ticket_price_off_peak = data.get('ticket_price_off_peak')
    if 'ticket_additional_info' in data:
        scenic_spot.ticket_additional_info = data.get('ticket_additional_info')
    if 'ticket_url' in data:
        scenic_spot.ticket_url = data.get('ticket_url')
    if 'has_direct_booking' in data:
        scenic_spot.has_direct_booking = data.get('has_direct_booking')
    if 'opening_hours_peak' in data:
        scenic_spot.opening_hours_peak = data.get('opening_hours_peak')
    if 'opening_hours_off_peak' in data:
        scenic_spot.opening_hours_off_peak = data.get('opening_hours_off_peak')
    if 'additional_opening_notes' in data:
        scenic_spot.additional_opening_notes = data.get('additional_opening_notes')
    if 'recommended_duration' in data:
        scenic_spot.recommended_duration = data.get('recommended_duration')
    
    db.session.commit()
    
    log_operation(
        module='内容管理',
        action='update',
        target_type='ScenicSpot',
        target_id=id,
        target_name=scenic_spot.name,
        description=f'更新景点: {old_name}'
    )
    
    return jsonify(scenic_spot.to_dict()), 200

@admin_bp.route('/scenic-spots/<int:id>', methods=['DELETE'])
@admin_required
def delete_scenic_spot(id):
    scenic_spot = ScenicSpot.query.get_or_404(id)
    spot_name = scenic_spot.name
    db.session.delete(scenic_spot)
    db.session.commit()
    
    log_operation(
        module='内容管理',
        action='delete',
        target_type='ScenicSpot',
        target_id=id,
        target_name=spot_name,
        description=f'删除景点: {spot_name}'
    )
    
    return jsonify({'message': '删除成功'}), 200

@admin_bp.route('/heritages', methods=['GET'])
@admin_required
def get_heritages_admin():
    heritages = Heritage.query.order_by(Heritage.order).all()
    return jsonify([heritage.to_dict() for heritage in heritages]), 200

@admin_bp.route('/heritages', methods=['POST'])
@admin_required
def create_heritage():
    data = get_request_data()
    
    if not data or not data.get('name') or not data.get('image_url') or not data.get('description'):
        return jsonify({'error': '名称、图片URL和描述不能为空'}), 400
    
    heritage = Heritage(
        name=data.get('name'),
        icon=data.get('icon', '🎨'),
        image_url=data.get('image_url'),
        description=data.get('description'),
        order=data.get('order', 0),
        is_active=data.get('is_active', True)
    )
    
    db.session.add(heritage)
    db.session.commit()
    
    log_operation(
        module='内容管理',
        action='create',
        target_type='Heritage',
        target_id=heritage.id,
        target_name=heritage.name,
        description=f'创建非物质文化遗产: {heritage.name}'
    )
    
    return jsonify(heritage.to_dict()), 201

@admin_bp.route('/heritages/<int:id>', methods=['GET'])
@admin_required
def get_heritage_admin(id):
    heritage = Heritage.query.get_or_404(id)
    return jsonify(heritage.to_dict()), 200

@admin_bp.route('/heritages/<int:id>', methods=['PUT'])
@admin_required
def update_heritage(id):
    heritage = Heritage.query.get_or_404(id)
    old_name = heritage.name
    data = get_request_data()
    
    if 'name' in data:
        heritage.name = data.get('name')
    if 'icon' in data:
        heritage.icon = data.get('icon')
    if 'image_url' in data:
        heritage.image_url = data.get('image_url')
    if 'description' in data:
        heritage.description = data.get('description')
    if 'order' in data:
        heritage.order = data.get('order')
    if 'is_active' in data:
        heritage.is_active = data.get('is_active')
    
    db.session.commit()
    
    log_operation(
        module='内容管理',
        action='update',
        target_type='Heritage',
        target_id=id,
        target_name=heritage.name,
        description=f'更新非物质文化遗产: {old_name}'
    )
    
    return jsonify(heritage.to_dict()), 200

@admin_bp.route('/heritages/<int:id>', methods=['DELETE'])
@admin_required
def delete_heritage(id):
    heritage = Heritage.query.get_or_404(id)
    heritage_name = heritage.name
    db.session.delete(heritage)
    db.session.commit()
    
    log_operation(
        module='内容管理',
        action='delete',
        target_type='Heritage',
        target_id=id,
        target_name=heritage_name,
        description=f'删除非物质文化遗产: {heritage_name}'
    )
    
    return jsonify({'message': '删除成功'}), 200

@admin_bp.route('/guestbooks', methods=['GET'])
@admin_required
def get_guestbooks_admin():
    guestbooks = Guestbook.query.order_by(Guestbook.created_at.desc()).all()
    return jsonify([guestbook.to_dict() for guestbook in guestbooks]), 200

@admin_bp.route('/guestbooks/<int:id>', methods=['PUT'])
@admin_required
def update_guestbook(id):
    guestbook = Guestbook.query.get_or_404(id)
    old_approved = guestbook.is_approved
    data = get_request_data()
    
    if 'is_approved' in data:
        guestbook.is_approved = data.get('is_approved')
    
    db.session.commit()
    
    log_operation(
        module='留言管理',
        action='update',
        target_type='Guestbook',
        target_id=id,
        target_name=guestbook.name,
        description=f'更新留言审核状态: {guestbook.name} - {"已通过" if guestbook.is_approved else "待审核"}'
    )
    
    return jsonify(guestbook.to_dict()), 200

@admin_bp.route('/guestbooks/<int:id>', methods=['DELETE'])
@admin_required
def delete_guestbook(id):
    guestbook = Guestbook.query.get_or_404(id)
    guestbook_name = guestbook.name
    db.session.delete(guestbook)
    db.session.commit()
    
    log_operation(
        module='留言管理',
        action='delete',
        target_type='Guestbook',
        target_id=id,
        target_name=guestbook_name,
        description=f'删除留言: {guestbook_name}'
    )
    
    return jsonify({'message': '删除成功'}), 200

@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_admin_users():
    current_user_id = get_current_admin_id()
    current_admin = AdminUser.query.get(current_user_id)
    
    if not current_admin.is_superuser:
        return jsonify({'error': '只有超级管理员可以查看用户列表'}), 403
    
    admins = AdminUser.query.order_by(AdminUser.created_at.desc()).all()
    return jsonify([admin.to_dict() for admin in admins]), 200

@admin_bp.route('/users', methods=['POST'])
@admin_required
def create_admin_user():
    current_user_id = get_current_admin_id()
    current_admin = AdminUser.query.get(current_user_id)
    
    if not current_admin.is_superuser:
        return jsonify({'error': '只有超级管理员可以创建用户'}), 403
    
    data = get_request_data()
    
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'error': '用户名、邮箱和密码不能为空'}), 400
    
    if AdminUser.query.filter_by(username=data.get('username')).first():
        return jsonify({'error': '用户名已存在'}), 400
    
    if AdminUser.query.filter_by(email=data.get('email')).first():
        return jsonify({'error': '邮箱已存在'}), 400
    
    new_admin = AdminUser(
        username=data.get('username'),
        email=data.get('email'),
        is_active=data.get('is_active', True),
        is_superuser=data.get('is_superuser', False)
    )
    new_admin.set_password(data.get('password'))
    
    db.session.add(new_admin)
    db.session.commit()
    
    log_operation(
        module='用户管理',
        action='create',
        target_type='AdminUser',
        target_id=new_admin.id,
        target_name=new_admin.username,
        description=f'创建管理员用户: {new_admin.username}'
    )
    
    return jsonify(new_admin.to_dict()), 201

@admin_bp.route('/users/<int:id>', methods=['PUT'])
@admin_required
def update_admin_user(id):
    current_user_id = get_current_admin_id()
    current_admin = AdminUser.query.get(current_user_id)
    
    if not current_admin.is_superuser and current_user_id != id:
        return jsonify({'error': '无权限修改此用户'}), 403
    
    admin = AdminUser.query.get_or_404(id)
    old_username = admin.username
    data = get_request_data()
    
    if 'username' in data and data.get('username') != admin.username:
        if AdminUser.query.filter_by(username=data.get('username')).first():
            return jsonify({'error': '用户名已存在'}), 400
        admin.username = data.get('username')
    
    if 'email' in data and data.get('email') != admin.email:
        if AdminUser.query.filter_by(email=data.get('email')).first():
            return jsonify({'error': '邮箱已存在'}), 400
        admin.email = data.get('email')
    
    if data.get('password'):
        admin.set_password(data.get('password'))
    
    if current_admin.is_superuser:
        if 'is_active' in data:
            admin.is_active = data.get('is_active')
        if 'is_superuser' in data:
            admin.is_superuser = data.get('is_superuser')
    
    db.session.commit()
    
    log_operation(
        module='用户管理',
        action='update',
        target_type='AdminUser',
        target_id=id,
        target_name=admin.username,
        description=f'更新管理员用户: {old_username}'
    )
    
    return jsonify(admin.to_dict()), 200

@admin_bp.route('/users/<int:id>', methods=['DELETE'])
@admin_required
def delete_admin_user(id):
    current_user_id = get_current_admin_id()
    current_admin = AdminUser.query.get(current_user_id)
    
    if not current_admin.is_superuser:
        return jsonify({'error': '只有超级管理员可以删除用户'}), 403
    
    if current_user_id == id:
        return jsonify({'error': '不能删除自己的账户'}), 400
    
    admin = AdminUser.query.get_or_404(id)
    admin_username = admin.username
    db.session.delete(admin)
    db.session.commit()
    
    log_operation(
        module='用户管理',
        action='delete',
        target_type='AdminUser',
        target_id=id,
        target_name=admin_username,
        description=f'删除管理员用户: {admin_username}'
    )
    
    return jsonify({'message': '删除成功'}), 200

def to_json(value):
    if value is None:
        return None
    return json.dumps(value, ensure_ascii=False)

@admin_bp.route('/site-config', methods=['GET'])
@admin_required
def get_site_config_admin():
    config = SiteConfig.query.first()
    if not config:
        return jsonify({
            'id': 0,
            'site_name': '北京旅游',
            'site_description': None,
            'site_keywords': None,
            'contact_address': None,
            'contact_phone': None,
            'contact_email': None,
            'copyright_text': None,
            'footer_links': None,
            'banner_title': '探索北京',
            'banner_subtitle': '千年古都',
            'banner_description': '感受历史与现代的完美交融',
            'is_active': True
        }), 200
    
    config_dict = config.to_dict()
    config_dict['footer_links'] = json.loads(config.footer_links) if config.footer_links else None
    return jsonify(config_dict), 200

@admin_bp.route('/site-config', methods=['POST', 'PUT'])
@admin_required
def save_site_config():
    data = get_request_data()
    config = SiteConfig.query.first()
    
    if not config:
        config = SiteConfig(
            site_name=data.get('site_name', '北京旅游'),
            site_description=data.get('site_description'),
            site_keywords=data.get('site_keywords'),
            contact_address=data.get('contact_address'),
            contact_phone=data.get('contact_phone'),
            contact_email=data.get('contact_email'),
            copyright_text=data.get('copyright_text'),
            footer_links=to_json(data.get('footer_links')),
            banner_title=data.get('banner_title', '探索北京'),
            banner_subtitle=data.get('banner_subtitle', '千年古都'),
            banner_description=data.get('banner_description', '感受历史与现代的完美交融'),
            is_active=data.get('is_active', True)
        )
        db.session.add(config)
    else:
        if 'site_name' in data:
            config.site_name = data.get('site_name')
        if 'site_description' in data:
            config.site_description = data.get('site_description')
        if 'site_keywords' in data:
            config.site_keywords = data.get('site_keywords')
        if 'contact_address' in data:
            config.contact_address = data.get('contact_address')
        if 'contact_phone' in data:
            config.contact_phone = data.get('contact_phone')
        if 'contact_email' in data:
            config.contact_email = data.get('contact_email')
        if 'copyright_text' in data:
            config.copyright_text = data.get('copyright_text')
        if 'footer_links' in data:
            config.footer_links = to_json(data.get('footer_links'))
        if 'banner_title' in data:
            config.banner_title = data.get('banner_title')
        if 'banner_subtitle' in data:
            config.banner_subtitle = data.get('banner_subtitle')
        if 'banner_description' in data:
            config.banner_description = data.get('banner_description')
        if 'is_active' in data:
            config.is_active = data.get('is_active')
    
    db.session.commit()
    
    log_operation(
        module='网站配置',
        action='update',
        target_type='SiteConfig',
        target_id=config.id,
        target_name=config.site_name,
        description=f'更新网站配置: {config.site_name}'
    )
    
    config_dict = config.to_dict()
    config_dict['footer_links'] = json.loads(config.footer_links) if config.footer_links else None
    return jsonify(config_dict), 200

@admin_bp.route('/navigations', methods=['GET'])
@admin_required
def get_navigations_admin():
    navigations = Navigation.query.order_by(Navigation.order).all()
    return jsonify([nav.to_dict() for nav in navigations]), 200

@admin_bp.route('/navigations', methods=['POST'])
@admin_required
def create_navigation():
    data = get_request_data()
    
    if not data or not data.get('label') or not data.get('path'):
        return jsonify({'error': '标签和路径不能为空'}), 400
    
    navigation = Navigation(
        label=data.get('label'),
        path=data.get('path'),
        order=data.get('order', 0),
        is_active=data.get('is_active', True),
        is_new_tab=data.get('is_new_tab', False)
    )
    
    db.session.add(navigation)
    db.session.commit()
    
    log_operation(
        module='导航菜单',
        action='create',
        target_type='Navigation',
        target_id=navigation.id,
        target_name=navigation.label,
        description=f'创建导航菜单: {navigation.label}'
    )
    
    return jsonify(navigation.to_dict()), 201

@admin_bp.route('/navigations/<int:id>', methods=['GET'])
@admin_required
def get_navigation_admin(id):
    navigation = Navigation.query.get_or_404(id)
    return jsonify(navigation.to_dict()), 200

@admin_bp.route('/navigations/<int:id>', methods=['PUT'])
@admin_required
def update_navigation(id):
    navigation = Navigation.query.get_or_404(id)
    old_label = navigation.label
    data = get_request_data()
    
    if 'label' in data:
        navigation.label = data.get('label')
    if 'path' in data:
        navigation.path = data.get('path')
    if 'order' in data:
        navigation.order = data.get('order')
    if 'is_active' in data:
        navigation.is_active = data.get('is_active')
    if 'is_new_tab' in data:
        navigation.is_new_tab = data.get('is_new_tab')
    
    db.session.commit()
    
    log_operation(
        module='导航菜单',
        action='update',
        target_type='Navigation',
        target_id=id,
        target_name=navigation.label,
        description=f'更新导航菜单: {old_label}'
    )
    
    return jsonify(navigation.to_dict()), 200

@admin_bp.route('/navigations/<int:id>', methods=['DELETE'])
@admin_required
def delete_navigation(id):
    navigation = Navigation.query.get_or_404(id)
    nav_label = navigation.label
    db.session.delete(navigation)
    db.session.commit()
    
    log_operation(
        module='导航菜单',
        action='delete',
        target_type='Navigation',
        target_id=id,
        target_name=nav_label,
        description=f'删除导航菜单: {nav_label}'
    )
    
    return jsonify({'message': '删除成功'}), 200

@admin_bp.route('/categories', methods=['GET'])
@admin_required
def get_categories_admin():
    categories = Category.query.order_by(Category.order).all()
    return jsonify([cat.to_dict() for cat in categories]), 200

@admin_bp.route('/categories', methods=['POST'])
@admin_required
def create_category():
    data = get_request_data()
    
    if not data or not data.get('title') or not data.get('description') or not data.get('path'):
        return jsonify({'error': '标题、描述和路径不能为空'}), 400
    
    category = Category(
        title=data.get('title'),
        description=data.get('description'),
        icon=data.get('icon'),
        path=data.get('path'),
        gradient=data.get('gradient', 'from-amber-400 to-orange-500'),
        bg_light=data.get('bg_light', 'from-amber-50 to-orange-50'),
        border_color=data.get('border_color', 'border-amber-200'),
        order=data.get('order', 0),
        is_active=data.get('is_active', True)
    )
    
    db.session.add(category)
    db.session.commit()
    
    log_operation(
        module='首页分类',
        action='create',
        target_type='Category',
        target_id=category.id,
        target_name=category.title,
        description=f'创建首页分类: {category.title}'
    )
    
    return jsonify(category.to_dict()), 201

@admin_bp.route('/categories/<int:id>', methods=['GET'])
@admin_required
def get_category_admin(id):
    category = Category.query.get_or_404(id)
    return jsonify(category.to_dict()), 200

@admin_bp.route('/categories/<int:id>', methods=['PUT'])
@admin_required
def update_category(id):
    category = Category.query.get_or_404(id)
    old_title = category.title
    data = get_request_data()
    
    if 'title' in data:
        category.title = data.get('title')
    if 'description' in data:
        category.description = data.get('description')
    if 'icon' in data:
        category.icon = data.get('icon')
    if 'path' in data:
        category.path = data.get('path')
    if 'gradient' in data:
        category.gradient = data.get('gradient')
    if 'bg_light' in data:
        category.bg_light = data.get('bg_light')
    if 'border_color' in data:
        category.border_color = data.get('border_color')
    if 'order' in data:
        category.order = data.get('order')
    if 'is_active' in data:
        category.is_active = data.get('is_active')
    
    db.session.commit()
    
    log_operation(
        module='首页分类',
        action='update',
        target_type='Category',
        target_id=id,
        target_name=category.title,
        description=f'更新首页分类: {old_title}'
    )
    
    return jsonify(category.to_dict()), 200

@admin_bp.route('/categories/<int:id>', methods=['DELETE'])
@admin_required
def delete_category(id):
    category = Category.query.get_or_404(id)
    category_title = category.title
    db.session.delete(category)
    db.session.commit()
    
    log_operation(
        module='首页分类',
        action='delete',
        target_type='Category',
        target_id=id,
        target_name=category_title,
        description=f'删除首页分类: {category_title}'
    )
    
    return jsonify({'message': '删除成功'}), 200

@admin_bp.route('/booking-guides', methods=['GET'])
@admin_required
def get_booking_guides_admin():
    guides = BookingGuide.query.order_by(BookingGuide.order).all()
    result = []
    for guide in guides:
        guide_dict = guide.to_dict()
        guide_dict['steps'] = json.loads(guide.steps) if guide.steps else None
        guide_dict['important_notes'] = json.loads(guide.important_notes) if guide.important_notes else None
        result.append(guide_dict)
    return jsonify(result), 200

@admin_bp.route('/booking-guides', methods=['POST'])
@admin_required
def create_booking_guide():
    data = get_request_data()
    
    if not data or not data.get('scenic_spot_id') or not data.get('title'):
        return jsonify({'error': '景点ID和标题不能为空'}), 400
    
    guide = BookingGuide(
        scenic_spot_id=data.get('scenic_spot_id'),
        title=data.get('title'),
        description=data.get('description'),
        steps=to_json(data.get('steps')),
        important_notes=to_json(data.get('important_notes')),
        contact_phone=data.get('contact_phone'),
        contact_work_time=data.get('contact_work_time'),
        order=data.get('order', 0),
        is_active=data.get('is_active', True)
    )
    
    db.session.add(guide)
    db.session.commit()
    
    log_operation(
        module='购票指南',
        action='create',
        target_type='BookingGuide',
        target_id=guide.id,
        target_name=guide.title,
        description=f'创建购票指南: {guide.title}'
    )
    
    guide_dict = guide.to_dict()
    guide_dict['steps'] = json.loads(guide.steps) if guide.steps else None
    guide_dict['important_notes'] = json.loads(guide.important_notes) if guide.important_notes else None
    return jsonify(guide_dict), 201

@admin_bp.route('/booking-guides/<int:id>', methods=['GET'])
@admin_required
def get_booking_guide_admin(id):
    guide = BookingGuide.query.get_or_404(id)
    guide_dict = guide.to_dict()
    guide_dict['steps'] = json.loads(guide.steps) if guide.steps else None
    guide_dict['important_notes'] = json.loads(guide.important_notes) if guide.important_notes else None
    return jsonify(guide_dict), 200

@admin_bp.route('/booking-guides/<int:id>', methods=['PUT'])
@admin_required
def update_booking_guide(id):
    guide = BookingGuide.query.get_or_404(id)
    old_title = guide.title
    data = get_request_data()
    
    if 'scenic_spot_id' in data:
        guide.scenic_spot_id = data.get('scenic_spot_id')
    if 'title' in data:
        guide.title = data.get('title')
    if 'description' in data:
        guide.description = data.get('description')
    if 'steps' in data:
        guide.steps = to_json(data.get('steps'))
    if 'important_notes' in data:
        guide.important_notes = to_json(data.get('important_notes'))
    if 'contact_phone' in data:
        guide.contact_phone = data.get('contact_phone')
    if 'contact_work_time' in data:
        guide.contact_work_time = data.get('contact_work_time')
    if 'order' in data:
        guide.order = data.get('order')
    if 'is_active' in data:
        guide.is_active = data.get('is_active')
    
    db.session.commit()
    
    log_operation(
        module='购票指南',
        action='update',
        target_type='BookingGuide',
        target_id=id,
        target_name=guide.title,
        description=f'更新购票指南: {old_title}'
    )
    
    guide_dict = guide.to_dict()
    guide_dict['steps'] = json.loads(guide.steps) if guide.steps else None
    guide_dict['important_notes'] = json.loads(guide.important_notes) if guide.important_notes else None
    return jsonify(guide_dict), 200

@admin_bp.route('/booking-guides/<int:id>', methods=['DELETE'])
@admin_required
def delete_booking_guide(id):
    guide = BookingGuide.query.get_or_404(id)
    guide_title = guide.title
    db.session.delete(guide)
    db.session.commit()
    log_operation(
        module='购票指南',
        action='delete',
        target_type='BookingGuide',
        target_id=id,
        target_name=guide_title,
        description=f'删除购票指南: {guide_title}'
    )
    return jsonify({'message': '删除成功'}), 200

@admin_bp.route('/operation-logs', methods=['GET'])
@admin_required
def get_operation_logs():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    module = request.args.get('module')
    action = request.args.get('action')
    admin_username = request.args.get('admin_username')
    
    query = OperationLog.query
    
    if module:
        query = query.filter(OperationLog.module == module)
    if action:
        query = query.filter(OperationLog.action == action)
    if admin_username:
        query = query.filter(OperationLog.admin_username.ilike(f'%{admin_username}%'))
    
    pagination = query.order_by(desc(OperationLog.created_at)).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'items': [log.to_dict() for log in pagination.items],
        'total': pagination.total,
        'total_pages': pagination.pages,
        'current_page': page,
        'per_page': per_page
    }), 200

@admin_bp.route('/operation-logs/<int:id>', methods=['GET'])
@admin_required
def get_operation_log(id):
    log_entry = OperationLog.query.get_or_404(id)
    return jsonify(log_entry.to_dict()), 200

@admin_bp.route('/guestbooks/<int:id>/reply', methods=['POST', 'PUT'])
@admin_required
def reply_guestbook(id):
    guestbook = Guestbook.query.get_or_404(id)
    data = get_request_data()
    
    reply_content = data.get('reply_content')
    if not reply_content or not reply_content.strip():
        return jsonify({'error': '回复内容不能为空'}), 400
    
    current_user_id = get_current_admin_id()
    admin = AdminUser.query.get(current_user_id)
    
    guestbook.reply_content = reply_content.strip()
    guestbook.reply_admin_id = current_user_id
    guestbook.replied_at = datetime.utcnow()
    
    db.session.commit()
    
    log_operation(
        module='留言管理',
        action='reply',
        target_type='Guestbook',
        target_id=id,
        target_name=guestbook.name,
        description=f'回复留言: {guestbook.name} - {reply_content[:100]}...' if len(reply_content) > 100 else f'回复留言: {guestbook.name}'
    )
    
    return jsonify(guestbook.to_dict()), 200
