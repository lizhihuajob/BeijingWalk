import json
from app import create_app, db
from app.models.models import (
    Banner, Culture, Specialty, ScenicSpot, Heritage, 
    Guestbook, AdminUser, SiteConfig, Navigation, Category, BookingGuide, OperationLog
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
