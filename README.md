# BeijingWalk - 北京旅游网站

一个采用现代化技术栈构建的北京旅游展示网站，采用苹果UI风格设计，提供优雅的用户体验。

## 项目简介

BeijingWalk 是一个展示北京旅游资源的网站，包括北京文化、地方特产、名胜古迹和非物质文化遗产等内容。项目采用前后端分离架构，前端使用 React 构建，后端使用 Python Flask 框架，数据库使用 PostgreSQL，并通过 Docker 实现一键部署。

## 技术栈

### 前端技术
- **React 18** - 前端框架
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **Framer Motion** - 动画库
- **Lucide React** - 图标库
- **Axios** - HTTP 客户端

### 后端技术
- **Python 3.11** - 编程语言
- **Flask** - Web 框架
- **Flask-SQLAlchemy** - ORM 框架
- **Flask-Migrate** - 数据库迁移
- **Flask-CORS** - 跨域支持
- **PostgreSQL** - 数据库
- **Gunicorn** - WSGI 服务器

### 部署技术
- **Docker** - 容器化技术
- **Docker Compose** - 多容器编排

## 项目结构

```
BeijingWalk/
├── backend/                    # 后端代码目录
│   ├── app/
│   │   ├── api/               # API 路由
│   │   │   ├── __init__.py
│   │   │   └── routes.py
│   │   ├── models/            # 数据库模型
│   │   │   ├── __init__.py
│   │   │   └── models.py
│   │   ├── config.py          # 配置文件
│   │   └── __init__.py        # 应用初始化
│   ├── migrations/            # 数据库迁移目录
│   ├── .env.example           # 环境变量示例
│   ├── Dockerfile             # 后端 Docker 配置
│   ├── requirements.txt       # Python 依赖
│   ├── run.py                 # 应用入口
│   └── init_db.py             # 数据初始化脚本
├── frontend/                   # 前端代码目录
│   ├── src/
│   │   ├── components/        # React 组件
│   │   │   ├── Header.jsx
│   │   │   ├── Banner.jsx
│   │   │   ├── CultureSection.jsx
│   │   │   ├── SpecialtiesSection.jsx
│   │   │   ├── ScenicSection.jsx
│   │   │   ├── HeritageSection.jsx
│   │   │   └── Footer.jsx
│   │   ├── services/          # API 服务
│   │   │   └── api.js
│   │   ├── App.jsx            # 主应用组件
│   │   ├── main.jsx           # 入口文件
│   │   └── index.css          # 全局样式
│   ├── .env.example           # 环境变量示例
│   ├── Dockerfile             # 前端 Docker 配置
│   ├── package.json           # 前端依赖
│   ├── vite.config.js         # Vite 配置
│   └── index.html             # HTML 模板
├── .env.example               # 根目录环境变量示例
├── docker-compose.yml         # Docker Compose 配置
└── README.md                  # 项目说明文档
```

## 功能特性

### 前端页面
- **苹果UI风格设计** - 采用简洁、优雅的苹果风格UI设计
- **响应式布局** - 完美适配桌面端、平板和手机
- **流畅动画** - 使用 Framer Motion 实现丝滑的页面过渡动画
- **轮播图展示** - 精美图片轮播展示北京名胜
- **模块化组件** - 采用 React 组件化开发，代码结构清晰

### 后端服务
- **RESTful API** - 标准的 RESTful 接口设计
- **PostgreSQL 数据库** - 强大的关系型数据库支持
- **数据初始化** - 内置丰富的示例数据
- **CORS 支持** - 跨域请求处理
- **健康检查** - API 健康状态监控

### 数据库模型
- **Banner** - 轮播图数据
- **Culture** - 北京文化内容
- **Specialty** - 地方特产信息
- **ScenicSpot** - 名胜古迹介绍
- **Heritage** - 非物质文化遗产

## 快速开始

### 环境要求
- Docker 20.10+
- Docker Compose 2.0+

### 一键启动（推荐）

1. **克隆项目**
```bash
git clone <repository-url>
cd BeijingWalk
```

2. **配置环境变量（可选）**
```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑 .env 文件，根据需要修改配置
nano .env
```

3. **启动所有服务**
```bash
docker-compose up -d --build
```

4. **访问应用**
- 前端页面: http://localhost:3000
- 后端API: http://localhost:5000
- API文档: http://localhost:5000/api/health

### 常用命令

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend

# 停止服务
docker-compose stop

# 启动已停止的服务
docker-compose start

# 重启服务
docker-compose restart

# 停止并删除容器
docker-compose down

# 停止并删除容器及数据卷（慎用，会删除数据库数据）
docker-compose down -v
```

## 手动部署（开发环境）

### 后端部署

1. **进入后端目录**
```bash
cd backend
```

2. **创建虚拟环境**
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate  # Windows
```

3. **安装依赖**
```bash
pip install -r requirements.txt
```

4. **配置环境变量**
```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库连接等
```

5. **启动 PostgreSQL（使用 Docker）**
```bash
docker run --name postgres -e POSTGRES_USER=beijingwalk -e POSTGRES_PASSWORD=beijingwalk123 -e POSTGRES_DB=beijingwalk -p 5432:5432 -d postgres:15-alpine
```

6. **初始化数据库**
```bash
python init_db.py
```

7. **启动服务**
```bash
# 开发模式
flask run

# 或使用 Gunicorn
gunicorn --bind 0.0.0.0:5000 run:app
```

### 前端部署

1. **进入前端目录**
```bash
cd frontend
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
cp .env.example .env.local
# 编辑 .env.local 文件，配置 API 地址
```

4. **启动开发服务器**
```bash
npm run dev
```

5. **构建生产版本**
```bash
npm run build
```

6. **预览生产版本**
```bash
npm run preview
```

## API 接口文档

### 基础路径
`http://localhost:5000/api`

### 健康检查
```
GET /health
```

### 轮播图接口
```
GET /banners          # 获取所有轮播图
GET /banners/:id      # 获取单个轮播图详情
```

### 文化内容接口
```
GET /cultures         # 获取所有文化内容
GET /cultures/:id     # 获取单个文化内容详情
```

### 地方特产接口
```
GET /specialties      # 获取所有特产
GET /specialties/:id  # 获取单个特产详情
```

### 名胜古迹接口
```
GET /scenic-spots              # 获取所有景点
GET /scenic-spots/featured     # 获取推荐景点
GET /scenic-spots/:id          # 获取单个景点详情
```

### 非物质文化遗产接口
```
GET /heritages        # 获取所有非遗项目
GET /heritages/:id    # 获取单个非遗项目详情
```

### 综合数据接口
```
GET /all              # 获取所有数据（一次性获取所有板块数据）
```

### 响应示例
```json
{
  "banners": [
    {
      "id": 1,
      "title": "故宫博物院",
      "image_url": "https://...",
      "description": "明清两代的皇家宫殿",
      "order": 1,
      "is_active": true
    }
  ],
  "cultures": [...],
  "specialties": [...],
  "scenic_spots": [...],
  "heritages": [...]
}
```

## 页面展示

### 主要板块
1. **首页轮播** - 展示北京标志性景点的精美图片轮播
2. **北京文化** - 介绍京剧、胡同文化等北京特色文化
3. **地方特产** - 展示北京烤鸭、冰糖葫芦等特色美食
4. **名胜古迹** - 介绍故宫、长城、颐和园等著名景点
5. **非物质文化遗产** - 展示景泰蓝、皮影戏等传统技艺

### 设计特色
- **苹果风格UI** - 简洁、优雅的设计语言
- **圆角卡片** - 柔和的圆角设计，视觉效果舒适
- **渐变背景** - 精美的渐变色彩搭配
- **悬停效果** - 丰富的交互动画
- **滚动动画** - 页面滚动时的流畅动画效果

## 数据管理

### 初始化数据
项目内置了丰富的示例数据，包括：
- 4 个轮播图（故宫、长城、颐和园、天坛）
- 2 个文化内容（京剧、胡同文化）
- 3 个地方特产（北京烤鸭、冰糖葫芦、北京酸奶）
- 4 个名胜古迹（故宫、颐和园、天坛、明十三陵）
- 4 个非物质文化遗产（景泰蓝、皮影戏、京绣、北京琴书）

### 添加新数据
可以通过以下方式添加新数据：
1. 直接修改 `backend/init_db.py` 文件中的数据
2. 连接数据库直接插入数据
3. 开发管理后台接口（待实现）

## 环境变量配置

### 后端环境变量
| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| FLASK_ENV | Flask 运行环境 | production |
| DATABASE_URL | 数据库连接字符串 | - |
| SECRET_KEY | 应用密钥 | - |
| POSTGRES_USER | PostgreSQL 用户名 | beijingwalk |
| POSTGRES_PASSWORD | PostgreSQL 密码 | beijingwalk123 |
| POSTGRES_DB | PostgreSQL 数据库名 | beijingwalk |

### 前端环境变量
| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| VITE_API_URL | 后端API地址 | http://localhost:5000/api |

## 性能优化

### 前端优化
- **代码分割** - 使用 React.lazy 进行组件懒加载
- **图片优化** - 使用适当的图片格式和大小
- **缓存策略** - 合理配置浏览器缓存
- **CDN 加速** - 静态资源可使用 CDN 加速

### 后端优化
- **数据库索引** - 为常用查询字段添加索引
- **连接池** - 使用数据库连接池
- **Gunicorn 多进程** - 充分利用多核 CPU
- **Nginx 反向代理** - 生产环境建议使用 Nginx

## 安全建议

### 生产环境部署
1. **修改默认密码** - 修改 PostgreSQL 默认密码
2. **设置强密钥** - 设置复杂的 SECRET_KEY
3. **启用 HTTPS** - 使用 SSL 证书
4. **配置防火墙** - 限制数据库端口访问
5. **定期备份** - 定期备份数据库数据

### 安全配置
```python
# 生产环境配置
class ProductionConfig(Config):
    DEBUG = False
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-strong-secret-key'
    # 其他安全配置...
```

## 故障排查

### 常见问题

1. **服务启动失败**
   - 检查端口是否被占用
   - 查看 Docker 日志：`docker-compose logs`
   - 确保 Docker 服务正常运行

2. **数据库连接失败**
   - 检查 PostgreSQL 容器状态：`docker-compose ps postgres`
   - 检查数据库连接字符串配置
   - 确认数据库已初始化

3. **前端无法访问后端API**
   - 检查后端服务是否正常运行
   - 确认 API 地址配置正确
   - 检查 CORS 配置

4. **数据未加载**
   - 检查数据库是否已初始化
   - 确认 `init_db.py` 已执行
   - 查看后端日志是否有错误

### 查看日志
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

## 开发指南

### 本地开发
1. 使用 Docker Compose 启动数据库：`docker-compose up -d postgres`
2. 后端使用 Flask 开发模式：`flask run --debug`
3. 前端使用 Vite 开发模式：`npm run dev`

### 代码规范
- 后端：遵循 PEP 8 规范
- 前端：使用 ESLint 和 Prettier（可自行配置）
- 提交信息：使用语义化提交信息

### 目录规范
- 后端代码放在 `backend/app/` 目录
- 前端组件放在 `frontend/src/components/` 目录
- API 服务放在 `frontend/src/services/` 目录

## 版本历史

### v1.0.0
- 初始版本发布
- 实现前后端分离架构
- 添加 PostgreSQL 数据库支持
- 实现 Docker Compose 一键部署
- 采用苹果UI风格设计
- 内置丰富的示例数据

## 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个项目。

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 GitHub Issue
- 发送邮件至项目维护者

---

**享受探索北京的旅程！** 🏯✨