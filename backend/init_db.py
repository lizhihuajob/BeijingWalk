import json
from app import create_app, db
from app.models.models import (
    Banner, Culture, Specialty, ScenicSpot, Heritage, 
    Guestbook, AdminUser, SiteConfig, Navigation, Category, BookingGuide
)
from sqlalchemy import text

app = create_app()

def migrate_guestbook_table():
    with app.app_context():
        inspector = db.inspect(db.engine)
        
        if 'guestbooks' in inspector.get_table_names():
            columns = [c['name'] for c in inspector.get_columns('guestbooks')]
            
            migrations = []
            if 'phone' not in columns:
                migrations.append('ALTER TABLE guestbooks ADD COLUMN IF NOT EXISTS phone VARCHAR(20)')
            if 'country' not in columns:
                migrations.append('ALTER TABLE guestbooks ADD COLUMN IF NOT EXISTS country VARCHAR(100)')
            if 'province' not in columns:
                migrations.append('ALTER TABLE guestbooks ADD COLUMN IF NOT EXISTS province VARCHAR(100)')
            
            for migration in migrations:
                try:
                    db.session.execute(text(migration))
                    print(f'Executed migration: {migration}')
                except Exception as e:
                    print(f'Migration skipped: {migration}, Error: {e}')
            
            if migrations:
                db.session.commit()
                print('Guestbook table migrated successfully!')

def migrate_config_tables():
    with app.app_context():
        inspector = db.inspect(db.engine)
        tables = inspector.get_table_names()
        
        if 'scenic_spots' in tables:
            columns = [c['name'] for c in inspector.get_columns('scenic_spots')]
            
            new_columns = [
                ('location', 'VARCHAR(200)'),
                ('tips', 'TEXT'),
                ('opening_status', 'VARCHAR(100)'),
            ]
            
            for col_name, col_type in new_columns:
                if col_name not in columns:
                    try:
                        db.session.execute(text(f'ALTER TABLE scenic_spots ADD COLUMN IF NOT EXISTS {col_name} {col_type}'))
                        print(f'Added column {col_name} to scenic_spots')
                    except Exception as e:
                        print(f'Failed to add column {col_name}: {e}')
            
            try:
                db.session.commit()
            except Exception as e:
                db.session.rollback()
                print(f'Failed to commit scenic_spots migration: {e}')
        
        existing_spots = ScenicSpot.query.all()
        spot_location_map = {
            '故宫博物院': '北京市东城区景山前街4号',
            '颐和园': '北京市海淀区新建宫门路19号',
            '天坛公园': '北京市东城区天坛内东里7号',
            '明十三陵': '北京市昌平区十三陵镇',
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
            if spot.name in spot_location_map and spot.location is None:
                spot.location = spot_location_map[spot.name]
            if spot.name in spot_tips_map and spot.tips is None:
                spot.tips = json.dumps(spot_tips_map[spot.name], ensure_ascii=False)
            if spot.name in spot_opening_status_map and spot.opening_status is None:
                spot.opening_status = spot_opening_status_map[spot.name]
        
        try:
            db.session.commit()
            print('ScenicSpot additional fields updated successfully!')
        except Exception as e:
            db.session.rollback()
            print(f'Error updating ScenicSpot additional fields: {e}')

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
        needs_data_update = False
        
        if 'scenic_spots' in inspector.get_table_names():
            columns = [c['name'] for c in inspector.get_columns('scenic_spots')]
            
            new_columns = [
                ('ticket_price_peak', 'VARCHAR(100)'),
                ('ticket_price_off_peak', 'VARCHAR(100)'),
                ('ticket_additional_info', 'TEXT'),
                ('ticket_url', 'VARCHAR(500)'),
                ('has_direct_booking', 'BOOLEAN DEFAULT FALSE'),
                ('opening_hours_peak', 'VARCHAR(200)'),
                ('opening_hours_off_peak', 'VARCHAR(200)'),
                ('additional_opening_notes', 'TEXT'),
                ('recommended_duration', 'VARCHAR(100)'),
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
        
        if needs_data_update or ScenicSpot.query.first() is not None:
            existing_spots = ScenicSpot.query.all()
            update_data = get_scenic_spot_update_data()
            
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
                        print(f'Updated data for scenic spot: {spot.name}')
            
            try:
                db.session.commit()
                print('ScenicSpot data updated successfully!')
            except Exception as e:
                db.session.rollback()
                print(f'Error updating ScenicSpot data: {e}')

def init_database():
    with app.app_context():
        db.create_all()
        
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
                    order=1,
                    is_active=True
                ),
                Specialty(
                    name='冰糖葫芦',
                    image_url='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Beijing%20Candied%20Haws%20Tanghulu%20traditional%20Chinese%20snack%20candied%20fruits%20on%20bamboo%20sticks%20glossy%20sugar%20coating%20hawthorns&image_size=square',
                    description='冰糖葫芦是中国传统的小吃，尤以北京的冰糖葫芦最为著名。它是用竹签将山楂串成串，蘸上麦芽糖稀，糖稀遇风迅速变硬，吃起来又酸又甜，冰凉爽口。',
                    rating=4.7,
                    order=2,
                    is_active=True
                ),
                Specialty(
                    name='北京酸奶',
                    image_url='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20Chinese%20Beijing%20style%20yogurt%20in%20white%20ceramic%20bowl%20topped%20with%20fresh%20fruits%20strawberries%20blueberries%20and%20honey%20drizzle%20soft%20natural%20lighting&image_size=square',
                    description='北京酸奶是北京地区特有的传统乳制品，历史悠久，口感醇厚，酸甜适中。传统的北京酸奶使用瓷碗盛装，上面盖着油纸，是老北京人喜爱的传统饮品。',
                    rating=4.6,
                    order=3,
                    is_active=True
                )
            ]
            db.session.add_all(specialties)
        
        if ScenicSpot.query.first() is None:
            scenic_spots = [
                ScenicSpot(
                    name='故宫博物院',
                    image_url='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Forbidden%20City%20Palace%20Museum%20Beijing%20China%20Meridian%20Gate%20grand%20entrance%20imperial%20palace%20traditional%20Chinese%20architecture%20golden%20roofs&image_size=landscape_16_9',
                    description='故宫又称紫禁城，是中国明清两代的皇家宫殿，位于北京中轴线的中心，是中国古代宫廷建筑之精华。故宫以三大殿为中心，占地面积72万平方米，建筑面积约15万平方米。',
                    is_featured=True,
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
                    recommended_duration='3-4小时'
                ),
                ScenicSpot(
                    name='颐和园',
                    image_url='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Summer%20Palace%20Beijing%20China%20Long%20Corridor%20painted%20ceiling%20traditional%20Chinese%20garden%20architecture&image_size=square',
                    description='颐和园是中国清朝时期皇家园林，前身为清漪园，坐落在北京西郊，占地约290公顷。',
                    is_featured=False,
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
                    recommended_duration='3-4小时'
                ),
                ScenicSpot(
                    name='天坛公园',
                    image_url='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Temple%20of%20Heaven%20Beijing%20China%20Circular%20Mound%20Altar%20blue%20sky%20reflection%20symmetrical%20architecture&image_size=square',
                    description='天坛是明清两代皇帝祭祀皇天、祈五谷丰登的场所，是现存中国古代规模最大、伦理等级最高的祭天建筑群。',
                    is_featured=False,
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
                    recommended_duration='2-3小时'
                ),
                ScenicSpot(
                    name='明十三陵',
                    image_url='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Ming%20Tombs%20Beijing%20China%20Sacred%20Way%20stone%20statues%20ancient%20Chinese%20imperial%20burial%20site&image_size=square',
                    description='明十三陵是明朝迁都北京后13位皇帝陵墓的皇家陵寝的总称，是中国现存规模最大、保存最完整的帝王陵墓群。',
                    is_featured=False,
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
                    recommended_duration='3-4小时'
                )
            ]
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
                    title='首页',
                    path='/',
                    icon=None,
                    order=1,
                    is_active=True
                ),
                Navigation(
                    title='景点大全',
                    path='/spots',
                    icon=None,
                    order=2,
                    is_active=True
                ),
                Navigation(
                    title='特色专题',
                    path='/special',
                    icon=None,
                    order=3,
                    is_active=True
                ),
                Navigation(
                    title='游记留言',
                    path='/guestbook',
                    icon=None,
                    order=4,
                    is_active=True
                ),
            ]
            db.session.add_all(navigations)
            print('Default navigations created')
        
        if Category.query.first() is None:
            categories = [
                Category(
                    name='景点导航',
                    slug='spots-guide',
                    icon='MapPin',
                    bg_light='#fff5eb',
                    border_color='#f97316',
                    description='精选特色街区，深入胡同小巷，发现别样风景',
                    link_to='/spots',
                    order=1,
                    is_active=True
                ),
                Category(
                    name='文化体验',
                    slug='culture-experience',
                    icon='Theater',
                    bg_light='#f0fdf4',
                    border_color='#22c55e',
                    description='深度体验传统文化的独特魅力',
                    link_to='/culture',
                    order=2,
                    is_active=True
                ),
                Category(
                    name='美食之旅',
                    slug='food-tour',
                    icon='UtensilsCrossed',
                    bg_light='#fef2f2',
                    border_color='#ef4444',
                    description='品尝地道北京风味，感受舌尖上的北京',
                    link_to='/food',
                    order=3,
                    is_active=True
                ),
                Category(
                    name='非物质文化遗产',
                    slug='heritage',
                    icon='Star',
                    bg_light='#faf5ff',
                    border_color='#8b5cf6',
                    description='传承千年技艺，守护文化瑰宝',
                    link_to='/heritage',
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
    migrate_guestbook_table()
    migrate_scenic_spot_table()
    migrate_config_tables()
    init_database()
