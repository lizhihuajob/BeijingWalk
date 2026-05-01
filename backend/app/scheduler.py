from flask_apscheduler import APScheduler
from datetime import datetime
from app import db

scheduler = APScheduler()
_app = None

def set_app(app):
    global _app
    _app = app

def check_content_schedule():
    global _app
    if _app is None:
        print("Error: App not initialized for scheduler")
        return
    
    with _app.app_context():
        try:
            now = datetime.utcnow()
            
            from app.models.models import Banner, Culture, Specialty, ScenicSpot, Heritage
            models = [Banner, Culture, Specialty, ScenicSpot, Heritage]
            
            for model in models:
                items_to_publish = model.query.filter(
                    model.publish_time.isnot(None),
                    model.publish_time <= now,
                    model.is_active == False
                ).all()
                
                for item in items_to_publish:
                    item.is_active = True
                    print(f"Auto-publishing {model.__name__} ID: {item.id}")
                
                items_to_expire = model.query.filter(
                    model.expire_time.isnot(None),
                    model.expire_time <= now,
                    model.is_active == True
                ).all()
                
                for item in items_to_expire:
                    item.is_active = False
                    print(f"Auto-expiring {model.__name__} ID: {item.id}")
            
            db.session.commit()
            print(f"Schedule check completed at {now}")
        except Exception as e:
            db.session.rollback()
            print(f"Error in schedule check: {e}")

def init_scheduler(app):
    global _app
    _app = app
    scheduler.init_app(app)
    
    if not scheduler.running:
        scheduler.start()
        print("Scheduler started")
    
    job_id = 'content_schedule_check'
    if not scheduler.get_job(job_id):
        scheduler.add_job(
            id=job_id,
            func=check_content_schedule,
            trigger='cron',
            minute='*/5'
        )
        print(f"Job {job_id} added, running every 5 minutes")
