import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users,
  User,
  LogOut,
  Settings,
  Menu,
  Layers,
  Ticket
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const baseMenuItems = [
  { path: '/', icon: LayoutDashboard, label: '仪表盘' },
  { path: '/guestbooks', icon: MessageSquare, label: '留言管理' },
  { path: '/site-config', icon: Settings, label: '网站配置' },
  { path: '/navigations', icon: Menu, label: '导航菜单' },
  { path: '/categories', icon: Layers, label: '首页分类' },
  { path: '/booking-guides', icon: Ticket, label: '购票指南' },
  { path: '/profile', icon: User, label: '个人中心' },
];

function Sidebar() {
  const { user, logout } = useAuth();

  const getMenuItems = () => {
    const items = [...baseMenuItems];
    if (user?.is_superuser) {
      const usersIndex = items.findIndex(item => item.path === '/profile');
      if (usersIndex !== -1) {
        items.splice(usersIndex, 0, { path: '/users', icon: Users, label: '员工管理' });
      }
    }
    return items;
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-64 bg-sidebar-bg min-h-screen flex flex-col">
      <div className="p-6 border-b border-sidebar-hover">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">🏯</span>
          北京旅游后台
        </h1>
        <p className="text-sidebar-text text-sm mt-1">BeijingWalk Admin</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-sidebar-active text-sidebar-activeText'
                  : 'text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-activeText'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-hover">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div>
              <p className="text-white text-sm font-medium">{user?.username || '管理员'}</p>
              <p className="text-sidebar-text text-xs">
                {user?.is_superuser ? '超级管理员' : '管理员'}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sidebar-text hover:text-white hover:bg-sidebar-hover rounded-lg transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>退出登录</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
