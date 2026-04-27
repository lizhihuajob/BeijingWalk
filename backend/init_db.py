from app import create_app, db
from app.models.models import Banner, Culture, Specialty, ScenicSpot, Heritage, Guestbook, AdminUser

app = create_app()

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
                    is_active=True
                ),
                ScenicSpot(
                    name='颐和园',
                    image_url='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Summer%20Palace%20Beijing%20China%20Long%20Corridor%20painted%20ceiling%20traditional%20Chinese%20garden%20architecture&image_size=square',
                    description='颐和园是中国清朝时期皇家园林，前身为清漪园，坐落在北京西郊，占地约290公顷。',
                    is_featured=False,
                    order=2,
                    is_active=True
                ),
                ScenicSpot(
                    name='天坛公园',
                    image_url='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Temple%20of%20Heaven%20Beijing%20China%20Circular%20Mound%20Altar%20blue%20sky%20reflection%20symmetrical%20architecture&image_size=square',
                    description='天坛是明清两代皇帝祭祀皇天、祈五谷丰登的场所，是现存中国古代规模最大、伦理等级最高的祭天建筑群。',
                    is_featured=False,
                    order=3,
                    is_active=True
                ),
                ScenicSpot(
                    name='明十三陵',
                    image_url='https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Ming%20Tombs%20Beijing%20China%20Sacred%20Way%20stone%20statues%20ancient%20Chinese%20imperial%20burial%20site&image_size=square',
                    description='明十三陵是明朝迁都北京后13位皇帝陵墓的皇家陵寝的总称，是中国现存规模最大、保存最完整的帝王陵墓群。',
                    is_featured=False,
                    order=4,
                    is_active=True
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
        
        try:
            db.session.commit()
            print('Database initialized successfully!')
        except Exception as e:
            db.session.rollback()
            print(f'Error initializing database: {e}')

if __name__ == '__main__':
    init_database()