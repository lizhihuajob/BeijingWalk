import json
from app import create_app, db
from app.models.models import (
    Banner, Culture, Specialty, ScenicSpot, Heritage, 
    Guestbook, AdminUser, SiteConfig, Navigation, Category, BookingGuide, OperationLog,
    ARExperience, VirtualPostcard, PostcardTemplate
)
from sqlalchemy import text

app = create_app()

def migrate_guestbook_table():
    with app.app_context():
        inspector = db.inspect(db.engine)
        tables = inspector.get_table_names()
        
        if 'guestbooks' in tables:
            columns = [c['name'] for c in inspector.get_columns('guestbooks')]
            
            migrations = []
            if 'phone' not in columns:
                migrations.append('ALTER TABLE guestbooks ADD COLUMN IF NOT EXISTS phone VARCHAR(20)')
            if 'country' not in columns:
                migrations.append('ALTER TABLE guestbooks ADD COLUMN IF NOT EXISTS country VARCHAR(100)')
            if 'province' not in columns:
                migrations.append('ALTER TABLE guestbooks ADD COLUMN IF NOT EXISTS province VARCHAR(100)')
            if 'reply_content' not in columns:
                migrations.append('ALTER TABLE guestbooks ADD COLUMN IF NOT EXISTS reply_content TEXT')
            if 'reply_admin_id' not in columns:
                migrations.append('ALTER TABLE guestbooks ADD COLUMN IF NOT EXISTS reply_admin_id INTEGER')
            if 'replied_at' not in columns:
                migrations.append('ALTER TABLE guestbooks ADD COLUMN IF NOT EXISTS replied_at TIMESTAMP')
            
            for migration in migrations:
                try:
                    db.session.execute(text(migration))
                    print(f'Executed migration: {migration}')
                except Exception as e:
                    print(f'Migration skipped: {migration}, Error: {e}')
            
            if migrations:
                db.session.commit()
                print('Guestbook table migrated successfully!')

def migrate_specialty_table():
    with app.app_context():
        inspector = db.inspect(db.engine)
        tables = inspector.get_table_names()
        
        if 'specialties' in tables:
            columns = [c['name'] for c in inspector.get_columns('specialties')]
            
            new_columns = [
                ('category', "VARCHAR(50) DEFAULT '美食'"),
            ]
            
            migrations = []
            for col_name, col_type in new_columns:
                if col_name not in columns:
                    migrations.append(f'ALTER TABLE specialties ADD COLUMN IF NOT EXISTS {col_name} {col_type}')
            
            for migration in migrations:
                try:
                    db.session.execute(text(migration))
                    print(f'Executed migration: {migration}')
                except Exception as e:
                    print(f'Migration skipped: {migration}, Error: {e}')
            
            if migrations:
                db.session.commit()
                print('Specialty table migrated successfully!')

def get_scenic_spot_update_data():
    return {
        '故宫博物院': {
            'ticket_price_peak': '60元/人',
            'ticket_price_off_peak': '40元/人',
            'ticket_additional_info': '珍宝馆：10元/人；钟表馆：10元/人。学生票（本科及以下）：旺季20元/人，淡季20元/人。60岁以上老人半价：旺季30元/人，淡季20元/人。18周岁以下未成年人免费。',
            'ticket_url': 'https://ticket.dpm.org.cn/',
            'has_direct_booking': False,
            'opening_hours_peak': '旺季（4月1日-10月31日）：8:30-17:00（16:10停止入院）',
            'opening_hours_off_peak': '淡季（11月1日-3月31日）：8:30-16:30（15:40停止入院）',
            'additional_opening_notes': '周一闭馆（法定节假日除外）。所有观众须实名预约参观，不售当日票，可提前7日20:00开始预约。',
            'recommended_duration': '3-4小时'
        },
        '颐和园': {
            'ticket_price_peak': '门票30元/张，联票60元/张',
            'ticket_price_off_peak': '门票20元/张，联票50元/张',
            'ticket_additional_info': '园中园：德和园5元/张，佛香阁10元/张，苏州街10元/张，颐和园博物馆20元/张。学生凭学生证半价优惠。',
            'ticket_url': 'https://yhy.yidyou.cn/#/',
            'has_direct_booking': True,
            'opening_hours_peak': '旺季（4月1日-10月31日）：6:00开园，19:00停止入园，20:00闭园',
            'opening_hours_off_peak': '淡季（11月1日-3月31日）：6:30开园，18:00停止入园，19:00闭园',
            'additional_opening_notes': '园中园（佛香阁、德和园、颐和园博物馆、苏州街）：8:00-18:00（17:30停止进入），周一闭园（法定节假日除外）。',
            'recommended_duration': '3-4小时'
        },
        '天坛公园': {
            'ticket_price_peak': '门票15元/张，联票34元/张',
            'ticket_price_off_peak': '门票10元/张，联票28元/张',
            'ticket_additional_info': '联票含大门票、祈年殿、圜丘、回音壁。学生凭学生证半价优惠。60岁以上老人、军人等凭证免票。',
            'ticket_url': 'https://www.tiantanpark.cn/',
            'has_direct_booking': False,
            'opening_hours_peak': '旺季（4月1日-10月31日）：公园大门6:00-22:00（21:00停止入园）；景点8:00-18:00（17:30停止入园）',
            'opening_hours_off_peak': '淡季（11月1日-3月31日）：公园大门6:30-22:00（21:00停止入园）；景点8:00-17:30（17:00停止入园）',
            'additional_opening_notes': '可通过"畅游公园"平台预约购票。',
            'recommended_duration': '2-3小时'
        },
        '明十三陵': {
            'ticket_price_peak': '长陵45元/人，定陵60元/人，昭陵30元/人，总神道30元/人',
            'ticket_price_off_peak': '长陵30元/人，定陵40元/人，昭陵20元/人，总神道20元/人',
            'ticket_additional_info': '联票98元/人（含长陵、定陵、总神道）。学生凭学生证半价优惠。60岁以上老人、残疾人、现役军人凭证免票。',
            'ticket_url': 'https://www.mingshisanling.com/ticket.html',
            'has_direct_booking': False,
            'opening_hours_peak': '旺季（4月1日-10月31日）：8:00-17:30（17:00停止入园）',
            'opening_hours_off_peak': '淡季（11月1日-3月31日）：8:30-17:00（16:30停止入园）',
            'additional_opening_notes': '可通过"昌平文旅集团"小程序预约购票。建议下午3点前进入陵区，避免赶不上深度游览。',
            'recommended_duration': '3-4小时'
        }
    }

def migrate_scenic_spot_table():
    with app.app_context():
        inspector = db.inspect(db.engine)
        tables = inspector.get_table_names()
        needs_data_update = False
        
        if 'scenic_spots' in tables:
            columns = [c['name'] for c in inspector.get_columns('scenic_spots')]
            
            new_columns = [
                ('spot_type', "VARCHAR(50) DEFAULT '皇家园林'"),
                ('ticket_price_peak', 'VARCHAR(100)'),
                ('ticket_price_off_peak', 'VARCHAR(100)'),
                ('ticket_additional_info', 'TEXT'),
                ('ticket_url', 'VARCHAR(500)'),
                ('has_direct_booking', 'BOOLEAN DEFAULT FALSE'),
                ('opening_hours_peak', 'VARCHAR(200)'),
                ('opening_hours_off_peak', 'VARCHAR(200)'),
                ('additional_opening_notes', 'TEXT'),
                ('recommended_duration', 'VARCHAR(100)'),
                ('location', 'VARCHAR(200)'),
                ('latitude', 'DOUBLE PRECISION'),
                ('longitude', 'DOUBLE PRECISION'),
                ('tips', 'TEXT'),
                ('opening_status', 'VARCHAR(100)'),
            ]
            
            migrations = []
            for col_name, col_type in new_columns:
                if col_name not in columns:
                    migrations.append(f'ALTER TABLE scenic_spots ADD COLUMN IF NOT EXISTS {col_name} {col_type}')
                    needs_data_update = True
            
            for migration in migrations:
                try:
                    db.session.execute(text(migration))
                    print(f'Executed migration: {migration}')
                except Exception as e:
                    print(f'Migration skipped: {migration}, Error: {e}')
            
            if migrations:
                db.session.commit()
                print('ScenicSpot table migrated successfully!')
        
        if 'scenic_spots' in tables:
            existing_spots = ScenicSpot.query.all()
            if existing_spots:
                update_data = get_scenic_spot_update_data()
                
                spot_location_map = {
                    '故宫博物院': '北京市东城区景山前街4号',
                    '颐和园': '北京市海淀区新建宫门路19号',
                    '天坛公园': '北京市东城区天坛内东里7号',
                    '明十三陵': '北京市昌平区十三陵镇',
                }
                
                spot_coordinates_map = {
                    '故宫博物院': {'latitude': 39.916667, 'longitude': 116.397222},
                    '颐和园': {'latitude': 39.999444, 'longitude': 116.275556},
                    '天坛公园': {'latitude': 39.888333, 'longitude': 116.4175},
                    '明十三陵': {'latitude': 40.298611, 'longitude': 116.239722},
                }
                
                spot_tips_map = {
                    '故宫博物院': [
                        '建议提前网上预约，避开高峰期游览',
                        '穿着舒适的鞋子，景区较大',
                        '可以请导游讲解，了解更多历史故事',
                        '周一闭馆（法定节假日除外）',
                    ],
                    '颐和园': [
                        '建议从东门或北门进入，游览路线更合理',
                        '夏季注意防晒和补水',
                        '佛香阁是最佳观景点，不要错过',
                        '可以乘坐昆明湖游船欣赏美景',
                    ],
                    '天坛公园': [
                        '建议早晨游览，空气清新，人也较少',
                        '联票包含祈年殿、圜丘、回音壁，推荐购买',
                        '回音壁有特定的听音点，注意观察指示牌',
                        '公园很大，建议租用电瓶车',
                    ],
                    '明十三陵': [
                        '定陵是唯一开放地宫的陵墓，值得一看',
                        '长陵是规模最大的陵墓，建筑宏伟',
                        '神道是进入陵区的必经之路，石像生很有特色',
                        '建议下午3点前进入陵区，避免赶不上深度游览',
                    ],
                }
                
                spot_opening_status_map = {
                    '故宫博物院': '正常开放',
                    '颐和园': '正常开放',
                    '天坛公园': '正常开放',
                    '明十三陵': '正常开放',
                }
                
                for spot in existing_spots:
                    if spot.name in update_data:
                        data = update_data[spot.name]
                        if spot.ticket_price_peak is None:
                            spot.ticket_price_peak = data['ticket_price_peak']
                            spot.ticket_price_off_peak = data['ticket_price_off_peak']
                            spot.ticket_additional_info = data['ticket_additional_info']
                            spot.ticket_url = data['ticket_url']
                            spot.has_direct_booking = data['has_direct_booking']
                            spot.opening_hours_peak = data['opening_hours_peak']
                            spot.opening_hours_off_peak = data['opening_hours_off_peak']
                            spot.additional_opening_notes = data['additional_opening_notes']
                            spot.recommended_duration = data['recommended_duration']
                            print(f'Updated ticket data for scenic spot: {spot.name}')
                    
                    if spot.name in spot_location_map and spot.location is None:
                        spot.location = spot_location_map[spot.name]
                    if spot.name in spot_coordinates_map:
                        coords = spot_coordinates_map[spot.name]
                        if spot.latitude is None:
                            spot.latitude = coords['latitude']
                        if spot.longitude is None:
                            spot.longitude = coords['longitude']
                    if spot.name in spot_tips_map and spot.tips is None:
                        spot.tips = json.dumps(spot_tips_map[spot.name], ensure_ascii=False)
                    if spot.name in spot_opening_status_map and spot.opening_status is None:
                        spot.opening_status = spot_opening_status_map[spot.name]
                
                try:
                    db.session.commit()
                    print('ScenicSpot data updated successfully!')
                except Exception as e:
                    db.session.rollback()
                    print(f'Error updating ScenicSpot data: {e}')

def init_database():
    with app.app_context():
        db.create_all()
        print('Database tables created successfully!')
        
        if Banner.query.first() is None:
            banners = [
                Banner(
                    title='故宫博物院',
                    image_url='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Forbidden%20City%20Beijing%20China%20imperial%20palace%20traditional%20Chinese%20architecture%20red%20walls%20golden%20roofs%20panoramic%20view&image_size=landscape_16_9',
                    description='明清两代的皇家宫殿',
                    order=1,
                    is_active=True
                ),
                Banner(
                    title='万里长城',
                    image_url='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Great%20Wall%20of%20China%20Badaling%20section%20snaking%20through%20mountainous%20landscape%20majestic%20historical%20monument&image_size=landscape_16_9',
                    description='世界奇迹之一',
                    order=2,
                    is_active=True
                ),
                Banner(
                    title='颐和园',
                    image_url='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Summer%20Palace%20Beijing%20China%20Kunming%20Lake%20Tower%20of%20Buddhist%20Incense%20traditional%20Chinese%20garden%20landscape&image_size=landscape_16_9',
                    description='皇家园林博物馆',
                    order=3,
                    is_active=True
                ),
                Banner(
                    title='天坛',
                    image_url='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Temple%20of%20Heaven%20Beijing%20China%20Hall%20of%20Prayer%20for%20Good%20Harvests%20circular%20roof%20traditional%20Chinese%20architecture&image_size=landscape_16_9',
                    description='明清皇帝祭天场所',
                    order=4,
                    is_active=True
                )
            ]
            db.session.add_all(banners)
        
        if Culture.query.first() is None:
            cultures = [
                Culture(
                    title='京剧',
                    image_url='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Peking%20Opera%20Beijing%20China%20traditional%20Chinese%20opera%20performers%20in%20colorful%20costumes%20and%20makeup%20on%20stage&image_size=landscape_4_3',
                    description='京剧又称平剧、京戏，是中国影响最大的戏曲剧种，分布地以北京为中心，遍及全国。京剧的腔调以西皮、二黄为主，用胡琴和锣鼓等伴奏，被视为中国国粹。',
                    details='京剧形成于清代乾隆年间，由徽剧、汉剧等剧种融合演变而成。京剧表演艺术讲究唱、念、做、打四种基本功，角色分为生、旦、净、丑四大行当。',
                    order=1,
                    is_active=True
                ),
                Culture(
                    title='胡同文化',
                    image_url='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Beijing%20Hutong%20China%20traditional%20alleyway%20with%20courtyard%20houses%20siheyuan%20red%20doors%20gray%20brick%20walls%20old%20street&image_size=landscape_4_3',
                    description='胡同是北京特有的一种古老的城市小巷，源于元代。北京胡同是久远历史的产物，它反映了北京历史的面貌，有着丰富的内容。北京有句老话："有名的胡同三千六，没名的胡同如牛毛。"',
                    details='胡同文化是北京文化的重要组成部分，它代表了老北京人的生活方式和社会关系。胡同里的四合院是中国传统民居建筑的典范，体现了中国古代的家庭伦理和宗法制度。',
                    order=2,
                    is_active=True
                )
            ]
            db.session.add_all(cultures)
        
        if Specialty.query.first() is None:
            specialties = [
                Specialty(
                    name='北京烤鸭',
                    image_url='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Beijing%20Roast%20Duck%20Peking%20Duck%20crispy%20skin%20sliced%20duck%20meat%20pancakes%20hoisin%20sauce%20scallions%20cucumber%20traditional%20Chinese%20cuisine&image_size=square',
                    description='北京烤鸭是北京著名的特色菜，被誉为"天下美味"。它以色泽红艳、肉质细嫩、味道醇厚、肥而不腻的特色而驰名中外。北京烤鸭分为挂炉烤鸭和焖炉烤鸭两大流派。',
                    rating=4.9,
                    category='美食',
                    order=1,
                    is_active=True
                ),
                Specialty(
                    name='冰糖葫芦',
                    image_url='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Beijing%20Candied%20Haws%20Tanghulu%20traditional%20Chinese%20snack%20candied%20fruits%20on%20bamboo%20sticks%20glossy%20sugar%20coating%20hawthorns&image_size=square',
                    description='冰糖葫芦是中国传统的小吃，尤以北京的冰糖葫芦最为著名。它是用竹签将山楂串成串，蘸上麦芽糖稀，糖稀遇风迅速变硬，吃起来又酸又甜，冰凉爽口。',
                    rating=4.7,
                    category='美食',
                    order=2,
                    is_active=True
                ),
                Specialty(
                    name='北京酸奶',
                    image_url='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20Chinese%20Beijing%20style%20yogurt%20in%20white%20ceramic%20bowl%20topped%20with%20fresh%20fruits%20strawberries%20blueberries%20and%20honey%20drizzle%20soft%20natural%20lighting&image_size=square',
                    description='北京酸奶是北京地区特有的传统乳制品，历史悠久，口感醇厚，酸甜适中。传统的北京酸奶使用瓷碗盛装，上面盖着油纸，是老北京人喜爱的传统饮品。',
                    rating=4.6,
                    category='饮品',
                    order=3,
                    is_active=True
                ),
                Specialty(
                    name='景泰蓝',
                    image_url='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Cloisonne%20enamel%20Cloisonne%20Chinese%20traditional%20craft%20blue%20and%20gold%20vase%20intricate%20patterns%20traditional%20Chinese%20artwork&image_size=square',
                    description='景泰蓝又称铜胎掐丝珐琅，是北京著名的传统特种工艺品。因其在明朝景泰年间盛行，制作技艺比较成熟，使用的珐琅釉多以蓝色为主，故而得名景泰蓝。',
                    rating=4.8,
                    category='工艺品',
                    order=4,
                    is_active=True
                ),
                Specialty(
                    name='京绣',
                    image_url='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Beijing%20embroidery%20Jingxiu%20traditional%20Chinese%20silk%20embroidery%20golden%20thread%20dragon%20pattern%20imperial%20royal%20craftsmanship&image_size=square',
                    description='京绣又称宫廷绣，是以北京为中心的刺绣产品的总称，是中国传统刺绣工艺之一，历史悠久，可追溯到唐代。京绣以其精湛的技艺和独特的艺术风格闻名于世。',
                    rating=4.7,
                    category='工艺品',
                    order=5,
                    is_active=True
                )
            ]
            db.session.add_all(specialties)
        
        if ScenicSpot.query.first() is None:
            spot_location_map = {
                '故宫博物院': '北京市东城区景山前街4号',
                '颐和园': '北京市海淀区新建宫门路19号',
                '天坛公园': '北京市东城区天坛内东里7号',
                '明十三陵': '北京市昌平区十三陵镇',
            }
            
            spot_coordinates_map = {
                '故宫博物院': {'latitude': 39.916667, 'longitude': 116.397222},
                '颐和园': {'latitude': 39.999444, 'longitude': 116.275556},
                '天坛公园': {'latitude': 39.888333, 'longitude': 116.4175},
                '明十三陵': {'latitude': 40.298611, 'longitude': 116.239722},
            }
            
            spot_tips_map = {
                '故宫博物院': [
                    '建议提前网上预约，避开高峰期游览',
                    '穿着舒适的鞋子，景区较大',
                    '可以请导游讲解，了解更多历史故事',
                    '周一闭馆（法定节假日除外）',
                ],
                '颐和园': [
                    '建议从东门或北门进入，游览路线更合理',
                    '夏季注意防晒和补水',
                    '佛香阁是最佳观景点，不要错过',
                    '可以乘坐昆明湖游船欣赏美景',
                ],
                '天坛公园': [
                    '建议早晨游览，空气清新，人也较少',
                    '联票包含祈年殿、圜丘、回音壁，推荐购买',
                    '回音壁有特定的听音点，注意观察指示牌',
                    '公园很大，建议租用电瓶车',
                ],
                '明十三陵': [
                    '定陵是唯一开放地宫的陵墓，值得一看',
                    '长陵是规模最大的陵墓，建筑宏伟',
                    '神道是进入陵区的必经之路，石像生很有特色',
                    '建议下午3点前进入陵区，避免赶不上深度游览',
                ],
            }
            
            spot_type_map = {
                '故宫博物院': '皇家园林',
                '颐和园': '皇家园林',
                '天坛公园': '寺庙',
                '明十三陵': '皇家园林',
                '国家博物馆': '博物馆',
                '南锣鼓巷': '胡同',
                '雍和宫': '寺庙',
                '恭王府': '皇家园林',
            }
            
            additional_spots = {
                '国家博物馆': {
                    'location': '北京市东城区东长安街16号',
                    'latitude': 39.907778,
                    'longitude': 116.402222,
                    'tips': [
                        '建议提前网上预约，免费参观',
                        '周一闭馆（法定节假日除外）',
                        '重点展厅：古代中国、复兴之路',
                        '可以租讲解器，了解更多文物知识',
                    ],
                    'opening_status': '正常开放',
                    'ticket_price_peak': '免费',
                    'ticket_price_off_peak': '免费',
                    'ticket_additional_info': '免费参观，需提前预约。特殊展览可能需要单独购票。',
                    'ticket_url': 'http://www.chnmuseum.cn/',
                    'has_direct_booking': False,
                    'opening_hours_peak': '9:00-17:00（16:00停止入场）',
                    'opening_hours_off_peak': '9:00-17:00（16:00停止入场）',
                    'additional_opening_notes': '周一闭馆（法定节假日除外）。',
                    'recommended_duration': '3-4小时',
                    'is_featured': False,
                    'order': 5,
                    'image_url': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=National%20Museum%20of%20China%20Beijing%20grand%20building%20exhibition%20halls%20ancient%20artifacts&image_size=square',
                    'description': '中国国家博物馆是代表国家收藏、研究、展示、阐释能够充分反映中华优秀传统文化、革命文化和社会主义先进文化代表性物证的最高机构，是国家最高历史文化艺术殿堂和文化客厅。',
                },
                '南锣鼓巷': {
                    'location': '北京市东城区南锣鼓巷胡同',
                    'latitude': 39.941667,
                    'longitude': 116.408333,
                    'tips': [
                        '建议傍晚或晚上游览，夜景更美',
                        '胡同里有很多特色小店和美食',
                        '可以租人力车游览胡同',
                        '注意保护历史建筑，文明游览',
                    ],
                    'opening_status': '正常开放',
                    'ticket_price_peak': '免费',
                    'ticket_price_off_peak': '免费',
                    'ticket_additional_info': '免费开放，无需预约。',
                    'ticket_url': None,
                    'has_direct_booking': False,
                    'opening_hours_peak': '全天开放',
                    'opening_hours_off_peak': '全天开放',
                    'additional_opening_notes': '部分店铺营业时间可能有所不同。',
                    'recommended_duration': '2-3小时',
                    'is_featured': False,
                    'order': 6,
                    'image_url': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Beijing%20Nanluoguxiang%20Hutong%20traditional%20alleyway%20with%20courtyard%20houses%20siheyuan%20red%20doors%20gray%20brick%20walls%20old%20street&image_size=square',
                    'description': '南锣鼓巷是北京最古老的街区之一，也是保存最完整的传统胡同区。这里保存着元大都时期的胡同格局，有众多的四合院、名人故居和特色小店。',
                },
                '雍和宫': {
                    'location': '北京市东城区雍和宫大街12号',
                    'latitude': 39.948611,
                    'longitude': 116.417222,
                    'tips': [
                        '建议上午游览，人少清净',
                        '可以请导游讲解，了解藏传佛教文化',
                        '寺内有免费香火发放',
                        '穿着得体，尊重宗教习俗',
                    ],
                    'opening_status': '正常开放',
                    'ticket_price_peak': '25元/人',
                    'ticket_price_off_peak': '25元/人',
                    'ticket_additional_info': '学生凭学生证半价优惠。60岁以上老人、残疾人、现役军人凭证免票。',
                    'ticket_url': 'https://www.yonghegong.cn/',
                    'has_direct_booking': False,
                    'opening_hours_peak': '4月1日-10月31日：9:00-16:30（16:00停止售票）',
                    'opening_hours_off_peak': '11月1日-3月31日：9:00-16:00（15:30停止售票）',
                    'additional_opening_notes': '每年农历正月初一至十五有祈福活动。',
                    'recommended_duration': '2-3小时',
                    'is_featured': False,
                    'order': 7,
                    'image_url': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Lama%20Temple%20Yonghegong%20Beijing%20China%20traditional%20Tibetan%20Buddhist%20temple%20golden%20roofs%20red%20walls%20incense%20burning&image_size=square',
                    'description': '雍和宫是北京市内最大的藏传佛教格鲁派寺院，始建于清康熙三十三年（1694年）。这里曾是雍正皇帝的府邸，乾隆皇帝也诞生于此，因此被称为"龙潜福地"。',
                },
                '恭王府': {
                    'location': '北京市西城区前海西街17号',
                    'latitude': 39.943333,
                    'longitude': 116.383333,
                    'tips': [
                        '建议提前网上预约',
                        '可以租讲解器，了解和珅的故事',
                        '花园部分非常漂亮，不要错过',
                        '周一闭馆（法定节假日除外）',
                    ],
                    'opening_status': '正常开放',
                    'ticket_price_peak': '40元/人',
                    'ticket_price_off_peak': '40元/人',
                    'ticket_additional_info': '学生凭学生证半价优惠。60岁以上老人、残疾人、现役军人凭证免票。',
                    'ticket_url': 'https://www.pgm.org.cn/',
                    'has_direct_booking': False,
                    'opening_hours_peak': '旺季（4月1日-10月31日）：8:00-17:00（16:10停止入场）',
                    'opening_hours_off_peak': '淡季（11月1日-3月31日）：9:00-16:30（15:40停止入场）',
                    'additional_opening_notes': '周一闭馆（法定节假日除外）。',
                    'recommended_duration': '2-3小时',
                    'is_featured': False,
                    'order': 8,
                    'image_url': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Prince%20Gongs%20Mansion%20Beijing%20China%20traditional%20Chinese%20garden%20architecture%20courtyard%20houses%20ponds%20and%20pavilions&image_size=square',
                    'description': '恭王府是清代规模最大的一座王府，曾先后作为和珅、永璘的宅邸。1851年恭亲王奕訢成为宅子的主人，恭王府的名称也因此得来。恭王府规模宏大，占地约6万平方米，分为府邸和花园两部分，拥有各式建筑群落30多处。',
                },
            }
            
            scenic_spots = [
                ScenicSpot(
                    name='故宫博物院',
                    image_url='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Forbidden%20City%20Palace%20Museum%20Beijing%20China%20Meridian%20Gate%20grand%20entrance%20imperial%20palace%20traditional%20Chinese%20architecture%20golden%20roofs&image_size=landscape_16_9',
                    description='故宫又称紫禁城，是中国明清两代的皇家宫殿，位于北京中轴线的中心，是中国古代宫廷建筑之精华。故宫以三大殿为中心，占地面积72万平方米，建筑面积约15万平方米。',
                    is_featured=True,
                    spot_type='皇家园林',
                    order=1,
                    is_active=True,
                    ticket_price_peak='60元/人',
                    ticket_price_off_peak='40元/人',
                    ticket_additional_info='珍宝馆：10元/人；钟表馆：10元/人。学生票（本科及以下）：旺季20元/人，淡季20元/人。60岁以上老人半价：旺季30元/人，淡季20元/人。18周岁以下未成年人免费。',
                    ticket_url='https://ticket.dpm.org.cn/',
                    has_direct_booking=False,
                    opening_hours_peak='旺季（4月1日-10月31日）：8:30-17:00（16:10停止入院）',
                    opening_hours_off_peak='淡季（11月1日-3月31日）：8:30-16:30（15:40停止入院）',
                    additional_opening_notes='周一闭馆（法定节假日除外）。所有观众须实名预约参观，不售当日票，可提前7日20:00开始预约。',
                    recommended_duration='3-4小时',
                    location=spot_location_map['故宫博物院'],
                    latitude=spot_coordinates_map['故宫博物院']['latitude'],
                    longitude=spot_coordinates_map['故宫博物院']['longitude'],
                    tips=json.dumps(spot_tips_map['故宫博物院'], ensure_ascii=False),
                    opening_status='正常开放'
                ),
                ScenicSpot(
                    name='颐和园',
                    image_url='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Summer%20Palace%20Beijing%20China%20Long%20Corridor%20painted%20ceiling%20traditional%20Chinese%20garden%20architecture&image_size=square',
                    description='颐和园是中国清朝时期皇家园林，前身为清漪园，坐落在北京西郊，占地约290公顷。',
                    is_featured=False,
                    spot_type='皇家园林',
                    order=2,
                    is_active=True,
                    ticket_price_peak='门票30元/张，联票60元/张',
                    ticket_price_off_peak='门票20元/张，联票50元/张',
                    ticket_additional_info='园中园：德和园5元/张，佛香阁10元/张，苏州街10元/张，颐和园博物馆20元/张。学生凭学生证半价优惠。',
                    ticket_url='https://yhy.yidyou.cn/#/',
                    has_direct_booking=True,
                    opening_hours_peak='旺季（4月1日-10月31日）：6:00开园，19:00停止入园，20:00闭园',
                    opening_hours_off_peak='淡季（11月1日-3月31日）：6:30开园，18:00停止入园，19:00闭园',
                    additional_opening_notes='园中园（佛香阁、德和园、颐和园博物馆、苏州街）：8:00-18:00（17:30停止进入），周一闭园（法定节假日除外）。',
                    recommended_duration='3-4小时',
                    location=spot_location_map['颐和园'],
                    latitude=spot_coordinates_map['颐和园']['latitude'],
                    longitude=spot_coordinates_map['颐和园']['longitude'],
                    tips=json.dumps(spot_tips_map['颐和园'], ensure_ascii=False),
                    opening_status='正常开放'
                ),
                ScenicSpot(
                    name='天坛公园',
                    image_url='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Temple%20of%20Heaven%20Beijing%20China%20Circular%20Mound%20Altar%20blue%20sky%20reflection%20symmetrical%20architecture&image_size=square',
                    description='天坛是明清两代皇帝祭祀皇天、祈五谷丰登的场所，是现存中国古代规模最大、伦理等级最高的祭天建筑群。',
                    is_featured=False,
                    spot_type='寺庙',
                    order=3,
                    is_active=True,
                    ticket_price_peak='门票15元/张，联票34元/张',
                    ticket_price_off_peak='门票10元/张，联票28元/张',
                    ticket_additional_info='联票含大门票、祈年殿、圜丘、回音壁。学生凭学生证半价优惠。60岁以上老人、军人等凭证免票。',
                    ticket_url='https://www.tiantanpark.cn/',
                    has_direct_booking=False,
                    opening_hours_peak='旺季（4月1日-10月31日）：公园大门6:00-22:00（21:00停止入园）；景点8:00-18:00（17:30停止入园）',
                    opening_hours_off_peak='淡季（11月1日-3月31日）：公园大门6:30-22:00（21:00停止入园）；景点8:00-17:30（17:00停止入园）',
                    additional_opening_notes='可通过"畅游公园"平台预约购票。',
                    recommended_duration='2-3小时',
                    location=spot_location_map['天坛公园'],
                    latitude=spot_coordinates_map['天坛公园']['latitude'],
                    longitude=spot_coordinates_map['天坛公园']['longitude'],
                    tips=json.dumps(spot_tips_map['天坛公园'], ensure_ascii=False),
                    opening_status='正常开放'
                ),
                ScenicSpot(
                    name='明十三陵',
                    image_url='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Ming%20Tombs%20Beijing%20China%20Sacred%20Way%20stone%20statues%20ancient%20Chinese%20imperial%20burial%20site&image_size=square',
                    description='明十三陵是明朝迁都北京后13位皇帝陵墓的皇家陵寝的总称，是中国现存规模最大、保存最完整的帝王陵墓群。',
                    is_featured=False,
                    spot_type='皇家园林',
                    order=4,
                    is_active=True,
                    ticket_price_peak='长陵45元/人，定陵60元/人，昭陵30元/人，总神道30元/人',
                    ticket_price_off_peak='长陵30元/人，定陵40元/人，昭陵20元/人，总神道20元/人',
                    ticket_additional_info='联票98元/人（含长陵、定陵、总神道）。学生凭学生证半价优惠。60岁以上老人、残疾人、现役军人凭证免票。',
                    ticket_url='https://www.mingshisanling.com/ticket.html',
                    has_direct_booking=False,
                    opening_hours_peak='旺季（4月1日-10月31日）：8:00-17:30（17:00停止入园）',
                    opening_hours_off_peak='淡季（11月1日-3月31日）：8:30-17:00（16:30停止入园）',
                    additional_opening_notes='可通过"昌平文旅集团"小程序预约购票。建议下午3点前进入陵区，避免赶不上深度游览。',
                    recommended_duration='3-4小时',
                    location=spot_location_map['明十三陵'],
                    latitude=spot_coordinates_map['明十三陵']['latitude'],
                    longitude=spot_coordinates_map['明十三陵']['longitude'],
                    tips=json.dumps(spot_tips_map['明十三陵'], ensure_ascii=False),
                    opening_status='正常开放'
                ),
            ]
            
            for spot_name, spot_data in additional_spots.items():
                scenic_spots.append(ScenicSpot(
                    name=spot_name,
                    image_url=spot_data['image_url'],
                    description=spot_data['description'],
                    is_featured=spot_data['is_featured'],
                    spot_type=spot_type_map.get(spot_name, '皇家园林'),
                    order=spot_data['order'],
                    is_active=True,
                    ticket_price_peak=spot_data['ticket_price_peak'],
                    ticket_price_off_peak=spot_data['ticket_price_off_peak'],
                    ticket_additional_info=spot_data['ticket_additional_info'],
                    ticket_url=spot_data['ticket_url'],
                    has_direct_booking=spot_data['has_direct_booking'],
                    opening_hours_peak=spot_data['opening_hours_peak'],
                    opening_hours_off_peak=spot_data['opening_hours_off_peak'],
                    additional_opening_notes=spot_data['additional_opening_notes'],
                    recommended_duration=spot_data['recommended_duration'],
                    location=spot_data['location'],
                    latitude=spot_data['latitude'],
                    longitude=spot_data['longitude'],
                    tips=json.dumps(spot_data['tips'], ensure_ascii=False),
                    opening_status=spot_data['opening_status']
                ))
            db.session.add_all(scenic_spots)
        
        if Heritage.query.first() is None:
            heritages = [
                Heritage(
                    name='景泰蓝',
                    icon='🎨',
                    image_url='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Cloisonne%20enamel%20Cloisonne%20Chinese%20traditional%20craft%20blue%20and%20gold%20vase%20intricate%20patterns%20traditional%20Chinese%20artwork&image_size=square',
                    description='景泰蓝又称铜胎掐丝珐琅，是北京著名的传统特种工艺品。因其在明朝景泰年间盛行，制作技艺比较成熟，使用的珐琅釉多以蓝色为主，故而得名景泰蓝。',
                    order=1,
                    is_active=True
                ),
                Heritage(
                    name='北京皮影戏',
                    icon='🎪',
                    image_url='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20shadow%20puppetry%20Beijing%20style%20traditional%20leather%20puppets%20colorful%20intricate%20designs%20shadow%20theater%20performance&image_size=square',
                    description='北京皮影戏又称灯影，是一种古老的传统民间艺术。它用灯光照射兽皮或纸板做成的人物剪影以表演故事，是中国民间广为流传的傀儡戏之一。',
                    order=2,
                    is_active=True
                ),
                Heritage(
                    name='京绣',
                    icon='🪡',
                    image_url='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Beijing%20embroidery%20Jingxiu%20traditional%20Chinese%20silk%20embroidery%20golden%20thread%20dragon%20pattern%20imperial%20royal%20craftsmanship&image_size=square',
                    description='京绣又称宫廷绣，是以北京为中心的刺绣产品的总称，是中国传统刺绣工艺之一，历史悠久，可追溯到唐代。京绣以其精湛的技艺和独特的艺术风格闻名于世。',
                    order=3,
                    is_active=True
                ),
                Heritage(
                    name='北京琴书',
                    icon='🎵',
                    image_url='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20traditional%20musical%20instrument%20Yangqin%20dulcimer%20Beijing%20Qinshu%20storytelling%20performance%20traditional%20Chinese%20music&image_size=square',
                    description='北京琴书是北京市的传统说唱艺术，前身是清代流行的五音大鼓，20世纪40年代改称北京琴书。北京琴书以唱为主，以说为辅，曲调优美，语言生动。',
                    order=4,
                    is_active=True
                )
            ]
            db.session.add_all(heritages)
        
        if ARExperience.query.first() is None:
            ar_experiences = [
                ARExperience(
                    heritage_id=1,
                    name='景泰蓝制作工艺',
                    description='体验景泰蓝的完整制作过程，包括制胎、掐丝、点蓝、烧蓝、磨光、镀金等六大工序。',
                    category='传统工艺',
                    icon='🎨',
                    image_url='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Cloisonne%20enamel%20crafting%20process%20traditional%20Chinese%20artisan%20working%20on%20copper%20vase%20intricate%20wire%20inlay%20blue%20enamel%20colorful%20patterns&image_size=landscape_16_9',
                    steps=json.dumps([
                        {
                            'title': '制胎',
                            'description': '使用紫铜板制作器物的胎体。根据设计要求，将铜板裁剪成合适的形状，然后通过敲打、焊接等工艺制成器物的基本形状。',
                            'duration': 60,
                            'image': None
                        },
                        {
                            'title': '掐丝',
                            'description': '用镊子将扁细的铜丝掐、掰成各种纹样，再用白芨粘焊在铜胎上。这是景泰蓝制作中最精细的工序，需要极高的手工技艺。',
                            'duration': 120,
                            'image': None
                        },
                        {
                            'title': '点蓝',
                            'description': '用吸管或小铲将珐琅釉料填充到掐好的花纹轮廓内。每种颜色都要反复填充、烧制多次，才能达到理想的色泽。',
                            'duration': 90,
                            'image': None
                        },
                        {
                            'title': '烧蓝',
                            'description': '将点好蓝的器物放入炉膛中烧制，使珐琅釉料熔化并与铜胎牢固结合。每次烧制后需要再次点蓝，反复进行三到四次。',
                            'duration': 30,
                            'image': None
                        },
                        {
                            'title': '磨光',
                            'description': '用砂石、黄石、木炭等工具将烧制好的器物表面磨平，使图案和底色平整光滑。这道工序需要耐心和细心。',
                            'duration': 60,
                            'image': None
                        },
                        {
                            'title': '镀金',
                            'description': '将磨光后的器物进行镀金处理，使外露的铜丝和铜胎表面镀上一层黄金，增加器物的华贵感和抗氧化能力。',
                            'duration': 30,
                            'image': None
                        }
                    ], ensure_ascii=False),
                    materials=json.dumps(['紫铜板', '扁铜丝', '珐琅釉料', '白芨', '焊药', '黄金'], ensure_ascii=False),
                    tools=json.dumps(['镊子', '剪刀', '焊枪', '吸管', '小铲', '磨石', '木炭'], ensure_ascii=False),
                    duration_minutes=40,
                    difficulty_level='中等',
                    view_count=1520,
                    is_active=True
                ),
                ARExperience(
                    heritage_id=3,
                    name='京绣刺绣技艺',
                    description='学习京绣的传统刺绣技法，体验平金、打籽、盘金等多种针法，感受皇家刺绣的精致与华贵。',
                    category='传统服饰',
                    icon='🪡',
                    image_url='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Beijing%20embroidery%20Jingxiu%20traditional%20Chinese%20silk%20embroidery%20artisan%20hand%20stitching%20golden%20thread%20dragon%20pattern%20imperial%20royal%20craftsmanship%20colorful%20silk%20threads&image_size=landscape_16_9',
                    steps=json.dumps([
                        {
                            'title': '设计纹样',
                            'description': '根据刺绣用途设计纹样图案。京绣传统纹样多为龙、凤、牡丹、祥云等吉祥图案，讲究对称、饱满、寓意吉祥。',
                            'duration': 30,
                            'image': None
                        },
                        {
                            'title': '绷架绷布',
                            'description': '将绸缎布料绷紧在刺绣绷架上。绷布需要平整、松紧适度，这是保证刺绣质量的基础。',
                            'duration': 15,
                            'image': None
                        },
                        {
                            'title': '描稿',
                            'description': '用铅笔或淡墨将设计好的纹样轻轻描绘在绷好的布料上。描稿要求线条清晰、位置准确。',
                            'duration': 20,
                            'image': None
                        },
                        {
                            'title': '平针绣',
                            'description': '使用各色丝线，采用平针绣法绣出纹样的主体部分。平针绣要求针脚整齐、排线均匀、不露底布。',
                            'duration': 60,
                            'image': None
                        },
                        {
                            'title': '盘金绣',
                            'description': '用金线或银线盘绕出纹样轮廓，再用丝线钉牢。这是京绣最具特色的技法之一，使图案富有立体感和华贵感。',
                            'duration': 45,
                            'image': None
                        },
                        {
                            'title': '打籽绣',
                            'description': '每一针都将丝线绕成小结，形成颗粒状的"籽"。打籽绣常用于表现花朵的花蕊或动物的眼睛，质感独特。',
                            'duration': 30,
                            'image': None
                        },
                        {
                            'title': '整理装裱',
                            'description': '完成刺绣后，将作品从绷架上取下，进行熨烫整理，然后根据用途进行装裱或缝制。',
                            'duration': 20,
                            'image': None
                        }
                    ], ensure_ascii=False),
                    materials=json.dumps(['真丝缎', '绣花线', '金线', '银线', '绒线'], ensure_ascii=False),
                    tools=json.dumps(['绣花绷架', '绣花针', '剪刀', '顶针', '描笔'], ensure_ascii=False),
                    duration_minutes=35,
                    difficulty_level='中等',
                    view_count=980,
                    is_active=True
                ),
                ARExperience(
                    heritage_id=2,
                    name='皮影戏表演体验',
                    description='了解北京皮影戏的历史渊源，学习皮影人物的制作技艺，体验皮影戏的表演技巧。',
                    category='传统艺术',
                    icon='🎪',
                    image_url='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20shadow%20puppetry%20Beijing%20style%20traditional%20leather%20puppets%20colorful%20intricate%20designs%20shadow%20theater%20performance%20behind%20white%20screen%20lantern%20lighting%20artisan%20craftsmanship&image_size=landscape_16_9',
                    steps=json.dumps([
                        {
                            'title': '选皮制皮',
                            'description': '选用驴皮或牛皮作为原料。将皮子浸泡软化后，刮去毛和肉，晾晒成半透明的皮子。这是制作皮影的基础材料。',
                            'duration': 30,
                            'image': None
                        },
                        {
                            'title': '描样镂刻',
                            'description': '将设计好的人物纹样描在皮子上，然后用刻刀进行镂刻。皮影人物一般分为头、身、四肢等部分，分别制作后再组装。',
                            'duration': 60,
                            'image': None
                        },
                        {
                            'title': '上色熨平',
                            'description': '用矿物颜料给镂刻好的皮影上色。传统皮影颜色鲜艳，以红、黄、绿、黑为主。上色后需要熨平，使颜色牢固。',
                            'duration': 25,
                            'image': None
                        },
                        {
                            'title': '缀结装订',
                            'description': '将皮影的各个部件用线绳或铆钉连接起来，使人物能够活动。头部和身体一般可以拆卸，方便更换不同的造型。',
                            'duration': 20,
                            'image': None
                        },
                        {
                            'title': '安装操纵杆',
                            'description': '在皮影人物的手部和颈部安装操纵杆。一般人物有三根操纵杆：颈部一根控制整体移动，双手各一根控制动作。',
                            'duration': 15,
                            'image': None
                        },
                        {
                            'title': '学习操纵技法',
                            'description': '学习如何操纵皮影人物。基本动作包括行走、转身、招手、打斗等。熟练的艺人可以让皮影人物表现出丰富的情感和复杂的动作。',
                            'duration': 40,
                            'image': None
                        },
                        {
                            'title': '表演体验',
                            'description': '在皮影戏后台体验实际表演。配合灯光和音乐，操纵皮影人物演绎一段简单的故事片段，感受皮影戏的独特魅力。',
                            'duration': 30,
                            'image': None
                        }
                    ], ensure_ascii=False),
                    materials=json.dumps(['驴皮', '牛皮', '矿物颜料', '线绳', '铆钉'], ensure_ascii=False),
                    tools=json.dumps(['刻刀', '剪刀', '锥子', '熨斗', '毛笔'], ensure_ascii=False),
                    duration_minutes=30,
                    difficulty_level='简单',
                    view_count=2100,
                    is_active=True
                ),
                ARExperience(
                    heritage_id=None,
                    name='北京烤鸭制作体验',
                    description='了解北京烤鸭的历史和文化，学习烤鸭的选材、晾坯、烤制等关键工序，体验片鸭技巧。',
                    category='传统美食',
                    icon='🦆',
                    image_url='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Beijing%20Roast%20Duck%20Peking%20Duck%20traditional%20Chinese%20cuisine%20chef%20preparing%20duck%20hanging%20in%20oven%20fruit%20wood%20fired%20crispy%20skin%20slicing%20duck%20meat%20pancakes%20hoisin%20sauce&image_size=landscape_16_9',
                    steps=json.dumps([
                        {
                            'title': '选材',
                            'description': '选用北京填鸭作为原料。北京填鸭生长周期短、肉质细嫩、脂肪含量适中，是制作北京烤鸭的最佳选择。鸭龄一般在45-50天左右。',
                            'duration': 10,
                            'image': None
                        },
                        {
                            'title': '宰杀处理',
                            'description': '将鸭子宰杀后，去除内脏和羽毛。然后从腋下开一个小口，取出内脏，用清水冲洗干净。这一步需要专业技能，确保鸭皮完整。',
                            'duration': 15,
                            'image': None
                        },
                        {
                            'title': '打气烫皮',
                            'description': '从鸭子的颈部开口处打气，使鸭皮与鸭肉分离。然后用沸水浇烫鸭皮，使皮肤收缩紧绷。这是保证鸭皮酥脆的关键步骤。',
                            'duration': 20,
                            'image': None
                        },
                        {
                            'title': '挂色晾坯',
                            'description': '在鸭皮上均匀涂抹糖水或麦芽糖水，然后将鸭子挂在通风阴凉处晾干。晾坯时间一般需要24-48小时，使鸭皮充分干燥。',
                            'duration': 30,
                            'image': None
                        },
                        {
                            'title': '入炉烤制',
                            'description': '将晾好的鸭子挂入特制的烤炉中，用果木（枣木、梨木等）进行烤制。烤制过程中需要不断调整鸭子的位置，使受热均匀。',
                            'duration': 45,
                            'image': None
                        },
                        {
                            'title': '片鸭装盘',
                            'description': '烤好的鸭子出炉后，需要趁热片鸭。传统片鸭方法有"片片"和"条片"两种。片好的鸭肉要皮脆肉嫩，肥瘦相间，配上薄饼、甜面酱、葱丝食用。',
                            'duration': 20,
                            'image': None
                        }
                    ], ensure_ascii=False),
                    materials=json.dumps(['北京填鸭', '麦芽糖', '枣木', '梨木'], ensure_ascii=False),
                    tools=json.dumps(['烤炉', '挂钩', '片鸭刀', '烫鸭锅'], ensure_ascii=False),
                    duration_minutes=25,
                    difficulty_level='简单',
                    view_count=3200,
                    is_active=True
                )
            ]
            db.session.add_all(ar_experiences)
            print('Default AR experiences created')
        
        if PostcardTemplate.query.first() is None:
            postcard_templates = [
                PostcardTemplate(
                    template_id='classic-red',
                    name='经典红',
                    description='传统中国红配色，庄重典雅，适合各种场合',
                    category='classic',
                    preview_image_url='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elegant%20red%20Chinese%20style%20postcard%20template%20golden%20cloud%20patterns%20traditional%20Chinese%20border%20decorations%20space%20for%20photo%20and%20message%20minimalist%20design&image_size=square',
                    accent_color='#DC2626',
                    background_color='#FEF2F2',
                    text_color='#1F2937',
                    is_active=True,
                    order=1
                ),
                PostcardTemplate(
                    template_id='classic-gold',
                    name='经典金',
                    description='金色边框搭配米白色背景，高贵典雅，正式场合首选',
                    category='classic',
                    preview_image_url='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elegant%20golden%20Chinese%20style%20postcard%20template%20intricate%20gold%20patterns%20cream%20white%20background%20traditional%20Chinese%20motifs%20space%20for%20photo%20and%20message%20luxury%20design&image_size=square',
                    accent_color='#D97706',
                    background_color='#FFFBEB',
                    text_color='#1F2937',
                    is_active=True,
                    order=2
                ),
                PostcardTemplate(
                    template_id='modern-blue',
                    name='现代蓝',
                    description='清新蓝色渐变，简约现代风格，适合年轻人',
                    category='modern',
                    preview_image_url='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20minimalist%20blue%20gradient%20postcard%20template%20clean%20design%20soft%20blue%20shades%20white%20space%20for%20photo%20and%20message%20simple%20geometric%20accents%20contemporary%20style&image_size=square',
                    accent_color='#2563EB',
                    background_color='#EFF6FF',
                    text_color='#1E3A8A',
                    is_active=True,
                    order=3
                ),
                PostcardTemplate(
                    template_id='modern-green',
                    name='现代绿',
                    description='自然绿色调，清新环保风格，传递祝福与希望',
                    category='modern',
                    preview_image_url='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20nature%20green%20postcard%20template%20soft%20emerald%20shades%20white%20background%20subtle%20leaf%20patterns%20space%20for%20photo%20and%20message%20clean%20eco-friendly%20design&image_size=square',
                    accent_color='#059669',
                    background_color='#ECFDF5',
                    text_color='#065F46',
                    is_active=True,
                    order=4
                ),
                PostcardTemplate(
                    template_id='vintage-paper',
                    name='复古信纸',
                    description='仿旧羊皮纸效果，怀旧复古风格，适合文艺青年',
                    category='vintage',
                    preview_image_url='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20parchment%20paper%20postcard%20template%20aged%20yellowed%20paper%20texture%20faded%20ink%20stains%20ornate%20victorian%20borders%20space%20for%20photo%20and%20handwritten%20message%20nostalgic%20retro%20design&image_size=square',
                    accent_color='#92400E',
                    background_color='#FEF3C7',
                    text_color='#78350F',
                    is_active=True,
                    order=5
                ),
                PostcardTemplate(
                    template_id='vintage-sepia',
                    name='复古棕褐',
                    description='老照片色调，怀旧风格，唤起美好回忆',
                    category='vintage',
                    preview_image_url='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20sepia%20toned%20postcard%20template%20warm%20brown%20shades%20old%20photo%20texture%20faded%20edges%20ornate%21920s%20style%20borders%20space%20for%20photo%20and%20message%20nostalgic%20retro%20design&image_size=square',
                    accent_color='#78716C',
                    background_color='#FAFAF9',
                    text_color='#44403C',
                    is_active=True,
                    order=6
                ),
                PostcardTemplate(
                    template_id='festive-spring',
                    name='春节喜庆',
                    description='春节主题配色，红色金色搭配灯笼鞭炮图案，传递节日祝福',
                    category='festive',
                    preview_image_url='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=festive%20Chinese%20New%20Year%20postcard%20template%20vibrant%20red%20and%20gold%20lanterns%20firecrackers%20traditional%20Chinese%20patterns%20space%20for%20photo%20and%20greeting%20message%20celebratory%20design&image_size=square',
                    accent_color='#B91C1C',
                    background_color='#FEF2F2',
                    text_color='#7F1D1D',
                    is_active=True,
                    order=7
                ),
                PostcardTemplate(
                    template_id='festive-midautumn',
                    name='中秋团圆',
                    description='中秋主题，月色桂花，适合中秋佳节传递思念与祝福',
                    category='festive',
                    preview_image_url='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=festive%20Mid%20Autumn%20Festival%20postcard%20template%20serene%20night%20sky%20full%20moon%20osmanthus%20flowers%20mooncakes%20soft%20blue%20and%20gold%20tones%20space%20for%20photo%20and%20greeting%20message%20peaceful%20reunion%20theme&image_size=square',
                    accent_color='#1E3A8A',
                    background_color='#EFF6FF',
                    text_color='#1E3A8A',
                    is_active=True,
                    order=8
                )
            ]
            db.session.add_all(postcard_templates)
            print('Default postcard templates created')
        
        if Guestbook.query.first() is None:
            guestbooks = [
                Guestbook(
                    name='张明',
                    email='zhangming@example.com',
                    message='北京真是一座充满历史和文化底蕴的城市！故宫、长城、颐和园都是必去的景点。特别是京剧表演，让人印象深刻。推荐大家一定要来北京旅游！',
                    is_approved=True
                ),
                Guestbook(
                    name='李华',
                    email='lihua@example.com',
                    message='第一次来北京，被这里的文化氛围深深吸引。胡同文化很有意思，炸酱面和北京烤鸭也非常美味。下次还要带家人一起来！',
                    is_approved=True
                ),
                Guestbook(
                    name='王芳',
                    email=None,
                    message='作为一个老北京，看到网站上展示的这些传统文化，感到非常亲切。希望更多人能了解和喜欢北京的文化！',
                    is_approved=True
                )
            ]
            db.session.add_all(guestbooks)
        
        if AdminUser.query.first() is None:
            default_admin = AdminUser(
                username='admin',
                email='admin@beijingwalk.com',
                is_active=True,
                is_superuser=True
            )
            default_admin.set_password('admin123')
            db.session.add(default_admin)
            print('Default admin user created: username=admin, password=admin123')
        
        if SiteConfig.query.first() is None:
            site_config = SiteConfig(
                site_name='北京旅游',
                logo_url=None,
                contact_address='北京市东城区景山前街4号',
                contact_phone='400-123-4567',
                contact_email='info@beijingtravel.com',
                contact_work_time='周一至周日 9:00-18:00',
                copyright_text='© 2024 北京旅游. All rights reserved.',
                icp_text='京ICP备12345678号-1',
            )
            db.session.add(site_config)
            print('Default site config created')
        
        if Navigation.query.first() is None:
            navigations = [
                Navigation(
                    label='首页',
                    path='/',
                    order=1,
                    is_active=True
                ),
                Navigation(
                    label='北京文化',
                    path='/culture',
                    order=2,
                    is_active=True
                ),
                Navigation(
                    label='地方特产',
                    path='/specialties',
                    order=3,
                    is_active=True
                ),
                Navigation(
                    label='名胜古迹',
                    path='/scenic',
                    order=4,
                    is_active=True
                ),
                Navigation(
                    label='非物质文化遗产',
                    path='/heritage',
                    order=5,
                    is_active=True
                ),
                Navigation(
                    label='留言板',
                    path='/guestbook',
                    order=6,
                    is_active=True
                ),
            ]
            db.session.add_all(navigations)
            print('Default navigations created')
        
        if Category.query.first() is None:
            categories = [
                Category(
                    title='北京文化',
                    description='探索北京悠久的历史文化，感受千年古都的独特魅力',
                    icon='Scroll',
                    path='/culture',
                    gradient='from-amber-400 to-orange-500',
                    bg_light='from-amber-50 to-orange-50',
                    border_color='border-amber-200',
                    order=1,
                    is_active=True
                ),
                Category(
                    title='地方特产',
                    description='品尝北京地道美食，感受舌尖上的老北京味道',
                    icon='Utensils',
                    path='/specialties',
                    gradient='from-red-400 to-pink-500',
                    bg_light='from-red-50 to-pink-50',
                    border_color='border-red-200',
                    order=2,
                    is_active=True
                ),
                Category(
                    title='名胜古迹',
                    description='探索北京千年历史的著名景点，感受中华文明的博大精深',
                    icon='Building',
                    path='/scenic',
                    gradient='from-blue-400 to-purple-500',
                    bg_light='from-blue-50 to-purple-50',
                    border_color='border-blue-200',
                    order=3,
                    is_active=True
                ),
                Category(
                    title='非物质文化遗产',
                    description='传承千年技艺，守护文化瑰宝，感受老北京的独特魅力',
                    icon='Sparkles',
                    path='/heritage',
                    gradient='from-amber-400 to-yellow-500',
                    bg_light='from-yellow-50 to-amber-50',
                    border_color='border-yellow-200',
                    order=4,
                    is_active=True
                ),
            ]
            db.session.add_all(categories)
            print('Default categories created')
        
        try:
            db.session.commit()
            print('Database initialized successfully!')
        except Exception as e:
            db.session.rollback()
            print(f'Error initializing database: {e}')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        print('Database tables created/verified')
    
    migrate_guestbook_table()
    migrate_specialty_table()
    migrate_scenic_spot_table()
    init_database()
