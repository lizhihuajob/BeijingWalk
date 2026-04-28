from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from app.models.models import (
    AdminUser, PageView, ContentView,
    Banner, Culture, Specialty, ScenicSpot, Heritage, Guestbook
)
from datetime import datetime, timedelta
from functools import wraps
from sqlalchemy import func

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
    return jsonify(banner.to_dict()), 200

@admin_bp.route('/banners/<int:id>', methods=['DELETE'])
@admin_required
def delete_banner(id):
    banner = Banner.query.get_or_404(id)
    db.session.delete(banner)
    db.session.commit()
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
    return jsonify(culture.to_dict()), 200

@admin_bp.route('/cultures/<int:id>', methods=['DELETE'])
@admin_required
def delete_culture(id):
    culture = Culture.query.get_or_404(id)
    db.session.delete(culture)
    db.session.commit()
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
    return jsonify(specialty.to_dict()), 200

@admin_bp.route('/specialties/<int:id>', methods=['DELETE'])
@admin_required
def delete_specialty(id):
    specialty = Specialty.query.get_or_404(id)
    db.session.delete(specialty)
    db.session.commit()
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
        is_active=data.get('is_active', True)
    )
    
    db.session.add(scenic_spot)
    db.session.commit()
    
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
    
    db.session.commit()
    return jsonify(scenic_spot.to_dict()), 200

@admin_bp.route('/scenic-spots/<int:id>', methods=['DELETE'])
@admin_required
def delete_scenic_spot(id):
    scenic_spot = ScenicSpot.query.get_or_404(id)
    db.session.delete(scenic_spot)
    db.session.commit()
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
    return jsonify(heritage.to_dict()), 200

@admin_bp.route('/heritages/<int:id>', methods=['DELETE'])
@admin_required
def delete_heritage(id):
    heritage = Heritage.query.get_or_404(id)
    db.session.delete(heritage)
    db.session.commit()
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
    data = get_request_data()
    
    if 'is_approved' in data:
        guestbook.is_approved = data.get('is_approved')
    
    db.session.commit()
    return jsonify(guestbook.to_dict()), 200

@admin_bp.route('/guestbooks/<int:id>', methods=['DELETE'])
@admin_required
def delete_guestbook(id):
    guestbook = Guestbook.query.get_or_404(id)
    db.session.delete(guestbook)
    db.session.commit()
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
    
    return jsonify(new_admin.to_dict()), 201

@admin_bp.route('/users/<int:id>', methods=['PUT'])
@admin_required
def update_admin_user(id):
    current_user_id = get_current_admin_id()
    current_admin = AdminUser.query.get(current_user_id)
    
    if not current_admin.is_superuser and current_user_id != id:
        return jsonify({'error': '无权限修改此用户'}), 403
    
    admin = AdminUser.query.get_or_404(id)
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
    db.session.delete(admin)
    db.session.commit()
    return jsonify({'message': '删除成功'}), 200
