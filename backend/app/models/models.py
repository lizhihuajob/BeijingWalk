from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import re
import json

def parse_json_field(value, default=None):
    if value is None:
        return default
    if isinstance(value, str):
        try:
            return json.loads(value)
        except (json.JSONDecodeError, ValueError):
            return default
    return value

def parse_user_agent(user_agent):
    if not user_agent:
        return {'device': 'Unknown', 'browser': 'Unknown', 'os': 'Unknown'}
    
    ua = user_agent.lower()
    
    device = 'Desktop'
    if 'mobile' in ua or 'android' in ua or 'iphone' in ua or 'ipad' in ua:
        if 'ipad' in ua or 'tablet' in ua:
            device = 'Tablet'
        else:
            device = 'Mobile'
    
    browser = 'Other'
    if 'edg' in ua:
        browser = 'Edge'
    elif 'chrome' in ua and 'edg' not in ua:
        browser = 'Chrome'
    elif 'firefox' in ua:
        browser = 'Firefox'
    elif 'safari' in ua and 'chrome' not in ua:
        browser = 'Safari'
    elif 'opera' in ua or 'opr' in ua:
        browser = 'Opera'
    elif 'msie' in ua or 'trident' in ua:
        browser = 'IE'
    
    os = 'Other'
    if 'windows' in ua:
        os = 'Windows'
    elif 'mac os' in ua or 'macos' in ua:
        os = 'macOS'
    elif 'linux' in ua and 'android' not in ua:
        os = 'Linux'
    elif 'android' in ua:
        os = 'Android'
    elif 'iphone' in ua or 'ipad' in ua or 'ipod' in ua:
        os = 'iOS'
    
    return {'device': device, 'browser': browser, 'os': os}

class AdminUser(db.Model):
    __tablename__ = 'admin_users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    is_superuser = db.Column(db.Boolean, default=False)
    last_login = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'is_active': self.is_active,
            'is_superuser': self.is_superuser,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class PageView(db.Model):
    __tablename__ = 'page_views'
    
    id = db.Column(db.Integer, primary_key=True)
    page_url = db.Column(db.String(500), nullable=False)
    page_type = db.Column(db.String(50), nullable=False)
    page_title = db.Column(db.String(200))
    visitor_id = db.Column(db.String(100), nullable=False, index=True)
    session_id = db.Column(db.String(100), nullable=False, index=True)
    ip_address = db.Column(db.String(50))
    user_agent = db.Column(db.String(500))
    referrer = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'page_url': self.page_url,
            'page_type': self.page_type,
            'page_title': self.page_title,
            'visitor_id': self.visitor_id,
            'session_id': self.session_id,
            'ip_address': self.ip_address,
            'user_agent': self.user_agent,
            'referrer': self.referrer,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class VisitLog(db.Model):
    __tablename__ = 'visit_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    page_url = db.Column(db.String(500))
    page_type = db.Column(db.String(50))
    item_id = db.Column(db.Integer)
    ip_address = db.Column(db.String(50))
    user_agent = db.Column(db.String(500))
    session_id = db.Column(db.String(100))
    referrer = db.Column(db.String(500))
    duration_seconds = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'page_url': self.page_url,
            'page_type': self.page_type,
            'item_id': self.item_id,
            'ip_address': self.ip_address,
            'user_agent': self.user_agent,
            'session_id': self.session_id,
            'referrer': self.referrer,
            'duration_seconds': self.duration_seconds,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class ContentView(db.Model):
    __tablename__ = 'content_views'
    
    id = db.Column(db.Integer, primary_key=True)
    content_type = db.Column(db.String(50), nullable=False)
    content_id = db.Column(db.Integer, nullable=False)
    view_count = db.Column(db.Integer, default=0)
    unique_visitors = db.Column(db.Integer, default=0)
    last_viewed_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        db.UniqueConstraint('content_type', 'content_id', name='uix_content_type_id'),
    )
    
    def to_dict(self):
        return {
            'id': self.id,
            'content_type': self.content_type,
            'content_id': self.content_id,
            'view_count': self.view_count,
            'unique_visitors': self.unique_visitors,
            'last_viewed_at': self.last_viewed_at.isoformat() if self.last_viewed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class ContentViewEvent(db.Model):
    __tablename__ = 'content_view_events'
    
    id = db.Column(db.Integer, primary_key=True)
    content_type = db.Column(db.String(50), nullable=False, index=True)
    content_id = db.Column(db.Integer, nullable=False, index=True)
    visitor_id = db.Column(db.String(100), nullable=False, index=True)
    session_id = db.Column(db.String(100), nullable=False, index=True)
    page_url = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'content_type': self.content_type,
            'content_id': self.content_id,
            'visitor_id': self.visitor_id,
            'session_id': self.session_id,
            'page_url': self.page_url,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Banner(db.Model):
    __tablename__ = 'banners'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    image_url = db.Column(db.String(500), nullable=False)
    description = db.Column(db.Text)
    order = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    publish_time = db.Column(db.DateTime)
    expire_time = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'image_url': self.image_url,
            'description': self.description,
            'order': self.order,
            'is_active': self.is_active,
            'publish_time': self.publish_time.isoformat() if self.publish_time else None,
            'expire_time': self.expire_time.isoformat() if self.expire_time else None
        }

class Culture(db.Model):
    __tablename__ = 'cultures'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    image_url = db.Column(db.String(500), nullable=False)
    description = db.Column(db.Text, nullable=False)
    details = db.Column(db.Text)
    order = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    publish_time = db.Column(db.DateTime)
    expire_time = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'image_url': self.image_url,
            'description': self.description,
            'details': self.details,
            'order': self.order,
            'is_active': self.is_active,
            'publish_time': self.publish_time.isoformat() if self.publish_time else None,
            'expire_time': self.expire_time.isoformat() if self.expire_time else None
        }

class Specialty(db.Model):
    __tablename__ = 'specialties'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    image_url = db.Column(db.String(500), nullable=False)
    description = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Float, default=4.5)
    order = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    publish_time = db.Column(db.DateTime)
    expire_time = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'image_url': self.image_url,
            'description': self.description,
            'rating': self.rating,
            'order': self.order,
            'is_active': self.is_active,
            'publish_time': self.publish_time.isoformat() if self.publish_time else None,
            'expire_time': self.expire_time.isoformat() if self.expire_time else None
        }

class ScenicSpot(db.Model):
    __tablename__ = 'scenic_spots'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    image_url = db.Column(db.String(500), nullable=False)
    description = db.Column(db.Text, nullable=False)
    is_featured = db.Column(db.Boolean, default=False)
    order = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    
    location = db.Column(db.String(200))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    tips = db.Column(db.Text)
    opening_status = db.Column(db.String(100), default='正常开放')
    
    ticket_price_peak = db.Column(db.String(100))
    ticket_price_off_peak = db.Column(db.String(100))
    ticket_additional_info = db.Column(db.Text)
    ticket_url = db.Column(db.String(500))
    has_direct_booking = db.Column(db.Boolean, default=False)
    
    opening_hours_peak = db.Column(db.String(200))
    opening_hours_off_peak = db.Column(db.String(200))
    additional_opening_notes = db.Column(db.Text)
    
    recommended_duration = db.Column(db.String(100))
    
    publish_time = db.Column(db.DateTime)
    expire_time = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'image_url': self.image_url,
            'description': self.description,
            'is_featured': self.is_featured,
            'order': self.order,
            'is_active': self.is_active,
            'location': self.location,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'tips': self.tips,
            'opening_status': self.opening_status,
            'ticket_price_peak': self.ticket_price_peak,
            'ticket_price_off_peak': self.ticket_price_off_peak,
            'ticket_additional_info': self.ticket_additional_info,
            'ticket_url': self.ticket_url,
            'has_direct_booking': self.has_direct_booking,
            'opening_hours_peak': self.opening_hours_peak,
            'opening_hours_off_peak': self.opening_hours_off_peak,
            'additional_opening_notes': self.additional_opening_notes,
            'recommended_duration': self.recommended_duration,
            'publish_time': self.publish_time.isoformat() if self.publish_time else None,
            'expire_time': self.expire_time.isoformat() if self.expire_time else None
        }

class Heritage(db.Model):
    __tablename__ = 'heritages'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    icon = db.Column(db.String(50), default='🎨')
    image_url = db.Column(db.String(500), nullable=False)
    description = db.Column(db.Text, nullable=False)
    order = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    publish_time = db.Column(db.DateTime)
    expire_time = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'icon': self.icon,
            'image_url': self.image_url,
            'description': self.description,
            'order': self.order,
            'is_active': self.is_active,
            'publish_time': self.publish_time.isoformat() if self.publish_time else None,
            'expire_time': self.expire_time.isoformat() if self.expire_time else None
        }

class Guestbook(db.Model):
    __tablename__ = 'guestbooks'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(200))
    phone = db.Column(db.String(20))
    country = db.Column(db.String(100))
    province = db.Column(db.String(100))
    message = db.Column(db.Text, nullable=False)
    is_approved = db.Column(db.Boolean, default=True)
    reply_content = db.Column(db.Text)
    reply_admin_id = db.Column(db.Integer, db.ForeignKey('admin_users.id'))
    replied_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    reply_admin = db.relationship('AdminUser', backref='guestbook_replies')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'country': self.country,
            'province': self.province,
            'message': self.message,
            'is_approved': self.is_approved,
            'reply_content': self.reply_content,
            'reply_admin_id': self.reply_admin_id,
            'reply_admin_name': self.reply_admin.username if self.reply_admin else None,
            'replied_at': self.replied_at.isoformat() if self.replied_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class SiteConfig(db.Model):
    __tablename__ = 'site_configs'
    
    id = db.Column(db.Integer, primary_key=True)
    site_name = db.Column(db.String(200), default='北京旅游')
    site_description = db.Column(db.Text)
    site_keywords = db.Column(db.String(500))
    
    logo_url = db.Column(db.String(500))
    
    contact_address = db.Column(db.String(500))
    contact_phone = db.Column(db.String(100))
    contact_email = db.Column(db.String(200))
    contact_work_time = db.Column(db.String(200))
    
    copyright_text = db.Column(db.String(500))
    icp_text = db.Column(db.String(200))
    footer_links = db.Column(db.Text)
    
    banner_title = db.Column(db.String(200), default='探索北京')
    banner_subtitle = db.Column(db.String(500), default='千年古都')
    banner_description = db.Column(db.String(1000), default='感受历史与现代的完美交融，体验传统文化与时尚潮流的碰撞')
    
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'site_name': self.site_name,
            'site_description': self.site_description,
            'site_keywords': self.site_keywords,
            'logo_url': self.logo_url,
            'contact_address': self.contact_address,
            'contact_phone': self.contact_phone,
            'contact_email': self.contact_email,
            'contact_work_time': self.contact_work_time,
            'copyright_text': self.copyright_text,
            'icp_text': self.icp_text,
            'footer_links': self.footer_links,
            'banner_title': self.banner_title,
            'banner_subtitle': self.banner_subtitle,
            'banner_description': self.banner_description,
            'is_active': self.is_active
        }

class Navigation(db.Model):
    __tablename__ = 'navigations'
    
    id = db.Column(db.Integer, primary_key=True)
    label = db.Column(db.String(100), nullable=False)
    path = db.Column(db.String(500), nullable=False)
    order = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    is_new_tab = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'label': self.label,
            'path': self.path,
            'order': self.order,
            'is_active': self.is_active,
            'is_new_tab': self.is_new_tab
        }

class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    icon = db.Column(db.String(100))
    path = db.Column(db.String(500), nullable=False)
    
    gradient = db.Column(db.String(100), default='from-amber-400 to-orange-500')
    bg_light = db.Column(db.String(100), default='from-amber-50 to-orange-50')
    border_color = db.Column(db.String(100), default='border-amber-200')
    
    order = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'icon': self.icon,
            'path': self.path,
            'gradient': self.gradient,
            'bg_light': self.bg_light,
            'border_color': self.border_color,
            'order': self.order,
            'is_active': self.is_active
        }

class BookingGuide(db.Model):
    __tablename__ = 'booking_guides'
    
    id = db.Column(db.Integer, primary_key=True)
    scenic_spot_id = db.Column(db.Integer, db.ForeignKey('scenic_spots.id'), nullable=False)
    
    title = db.Column(db.String(500), nullable=False)
    description = db.Column(db.Text)
    
    steps = db.Column(db.Text)
    important_notes = db.Column(db.Text)
    contact_phone = db.Column(db.String(100))
    contact_work_time = db.Column(db.String(200))
    
    order = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'scenic_spot_id': self.scenic_spot_id,
            'title': self.title,
            'description': self.description,
            'steps': self.steps,
            'important_notes': self.important_notes,
            'contact_phone': self.contact_phone,
            'contact_work_time': self.contact_work_time,
            'order': self.order,
            'is_active': self.is_active
        }

class SearchHistory(db.Model):
    __tablename__ = 'search_history'
    
    id = db.Column(db.Integer, primary_key=True)
    keyword = db.Column(db.String(200), nullable=False, index=True)
    visitor_id = db.Column(db.String(100), index=True)
    session_id = db.Column(db.String(100), index=True)
    ip_address = db.Column(db.String(50))
    user_agent = db.Column(db.String(500))
    search_type = db.Column(db.String(50), default='general')
    results_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'keyword': self.keyword,
            'visitor_id': self.visitor_id,
            'session_id': self.session_id,
            'ip_address': self.ip_address,
            'search_type': self.search_type,
            'results_count': self.results_count,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class OperationLog(db.Model):
    __tablename__ = 'operation_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    admin_id = db.Column(db.Integer, db.ForeignKey('admin_users.id'), nullable=False)
    admin_username = db.Column(db.String(80), nullable=False)
    module = db.Column(db.String(50), nullable=False)
    action = db.Column(db.String(20), nullable=False)
    target_type = db.Column(db.String(50))
    target_id = db.Column(db.Integer)
    target_name = db.Column(db.String(200))
    description = db.Column(db.Text)
    ip_address = db.Column(db.String(50))
    user_agent = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    admin = db.relationship('AdminUser', backref='operation_logs')
    
    def to_dict(self):
        return {
            'id': self.id,
            'admin_id': self.admin_id,
            'admin_username': self.admin_username,
            'module': self.module,
            'action': self.action,
            'target_type': self.target_type,
            'target_id': self.target_id,
            'target_name': self.target_name,
            'description': self.description,
            'ip_address': self.ip_address,
            'user_agent': self.user_agent,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class TravelPackage(db.Model):
    __tablename__ = 'travel_packages'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    subtitle = db.Column(db.String(500))
    image_url = db.Column(db.String(500), nullable=False)
    description = db.Column(db.Text, nullable=False)
    
    price = db.Column(db.String(100))
    price_unit = db.Column(db.String(20), default='元/人')
    discount_price = db.Column(db.String(100))
    
    duration = db.Column(db.String(100))
    departure_city = db.Column(db.String(100))
    destination_city = db.Column(db.String(100))
    
    highlights = db.Column(db.Text)
    itinerary = db.Column(db.Text)
    inclusion = db.Column(db.Text)
    exclusion = db.Column(db.Text)
    notes = db.Column(db.Text)
    
    is_featured = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    status = db.Column(db.String(50), default='active')
    
    contact_phone = db.Column(db.String(100))
    contact_email = db.Column(db.String(200))
    contact_name = db.Column(db.String(100))
    
    order = db.Column(db.Integer, default=0)
    view_count = db.Column(db.Integer, default=0)
    
    publish_time = db.Column(db.DateTime)
    expire_time = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'subtitle': self.subtitle,
            'image_url': self.image_url,
            'description': self.description,
            'price': self.price,
            'price_unit': self.price_unit,
            'discount_price': self.discount_price,
            'duration': self.duration,
            'departure_city': self.departure_city,
            'destination_city': self.destination_city,
            'highlights': parse_json_field(self.highlights),
            'itinerary': parse_json_field(self.itinerary),
            'inclusion': parse_json_field(self.inclusion),
            'exclusion': parse_json_field(self.exclusion),
            'notes': self.notes,
            'is_featured': self.is_featured,
            'is_active': self.is_active,
            'status': self.status,
            'contact_phone': self.contact_phone,
            'contact_email': self.contact_email,
            'contact_name': self.contact_name,
            'order': self.order,
            'view_count': self.view_count,
            'publish_time': self.publish_time.isoformat() if self.publish_time else None,
            'expire_time': self.expire_time.isoformat() if self.expire_time else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class ChatSession(db.Model):
    __tablename__ = 'chat_sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(100), unique=True, nullable=False, index=True)
    
    visitor_id = db.Column(db.String(100), index=True)
    visitor_name = db.Column(db.String(100))
    visitor_email = db.Column(db.String(200))
    visitor_phone = db.Column(db.String(20))
    
    travel_package_id = db.Column(db.Integer, db.ForeignKey('travel_packages.id'))
    
    status = db.Column(db.String(50), default='active')
    assigned_admin_id = db.Column(db.Integer, db.ForeignKey('admin_users.id'))
    
    last_message_at = db.Column(db.DateTime)
    unread_count = db.Column(db.Integer, default=0)
    admin_unread_count = db.Column(db.Integer, default=0)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    travel_package = db.relationship('TravelPackage', backref='chat_sessions')
    assigned_admin = db.relationship('AdminUser', backref='assigned_chats')
    
    def to_dict(self):
        return {
            'id': self.id,
            'session_id': self.session_id,
            'visitor_id': self.visitor_id,
            'visitor_name': self.visitor_name,
            'visitor_email': self.visitor_email,
            'visitor_phone': self.visitor_phone,
            'travel_package_id': self.travel_package_id,
            'status': self.status,
            'assigned_admin_id': self.assigned_admin_id,
            'last_message_at': self.last_message_at.isoformat() if self.last_message_at else None,
            'unread_count': self.unread_count,
            'admin_unread_count': self.admin_unread_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'travel_package_title': self.travel_package.title if self.travel_package else None
        }

class ChatMessage(db.Model):
    __tablename__ = 'chat_messages'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(100), db.ForeignKey('chat_sessions.session_id'), nullable=False, index=True)
    
    sender_type = db.Column(db.String(20), nullable=False)
    sender_id = db.Column(db.String(100))
    sender_name = db.Column(db.String(100))
    
    message_type = db.Column(db.String(50), default='text')
    content = db.Column(db.Text, nullable=False)
    
    is_read = db.Column(db.Boolean, default=False)
    read_at = db.Column(db.DateTime)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'session_id': self.session_id,
            'sender_type': self.sender_type,
            'sender_id': self.sender_id,
            'sender_name': self.sender_name,
            'message_type': self.message_type,
            'content': self.content,
            'is_read': self.is_read,
            'read_at': self.read_at.isoformat() if self.read_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
