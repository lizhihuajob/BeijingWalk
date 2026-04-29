from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

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
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'image_url': self.image_url,
            'description': self.description,
            'order': self.order,
            'is_active': self.is_active
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
            'is_active': self.is_active
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
            'is_active': self.is_active
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
    tips = db.Column(db.Text)
    
    ticket_price_peak = db.Column(db.String(100))
    ticket_price_off_peak = db.Column(db.String(100))
    ticket_additional_info = db.Column(db.Text)
    ticket_url = db.Column(db.String(500))
    has_direct_booking = db.Column(db.Boolean, default=False)
    
    opening_hours_peak = db.Column(db.String(200))
    opening_hours_off_peak = db.Column(db.String(200))
    additional_opening_notes = db.Column(db.Text)
    
    recommended_duration = db.Column(db.String(100))
    
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
            'tips': self.tips,
            'ticket_price_peak': self.ticket_price_peak,
            'ticket_price_off_peak': self.ticket_price_off_peak,
            'ticket_additional_info': self.ticket_additional_info,
            'ticket_url': self.ticket_url,
            'has_direct_booking': self.has_direct_booking,
            'opening_hours_peak': self.opening_hours_peak,
            'opening_hours_off_peak': self.opening_hours_off_peak,
            'additional_opening_notes': self.additional_opening_notes,
            'recommended_duration': self.recommended_duration
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
            'is_active': self.is_active
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
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
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
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class SiteConfig(db.Model):
    __tablename__ = 'site_configs'
    
    id = db.Column(db.Integer, primary_key=True)
    site_name = db.Column(db.String(200), default='北京旅游')
    site_description = db.Column(db.Text)
    site_keywords = db.Column(db.String(500))
    
    contact_address = db.Column(db.String(500))
    contact_phone = db.Column(db.String(100))
    contact_email = db.Column(db.String(200))
    
    copyright_text = db.Column(db.String(500))
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
            'contact_address': self.contact_address,
            'contact_phone': self.contact_phone,
            'contact_email': self.contact_email,
            'copyright_text': self.copyright_text,
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
