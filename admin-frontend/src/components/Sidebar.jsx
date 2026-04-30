import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users,
  User,
  LogOut,
  Settings,
  ChevronDown,
  ChevronRight,
  Image,
  Menu,
  Layers,
  FileText,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const baseMenuItems = [
  { path: '/', icon: LayoutDashboard, label: '仪表盘', isSubmenu: false },
  { path: '/guestbooks', icon: MessageSquare, label: '留言管理', isSubmenu: false },
  {
    label: '网站配置',
    icon: Settings,
    isSubmenu: true,
    subitems: [
      { path: '/site-config', icon: Settings, label: '基本设置' },
      { path: '/content', icon: Image, label: '内容管理' },
      { path: '/navigations', icon: Menu, label: '导航菜单' },
      { path: '/categories', icon: Layers, label: '首页分类' },
    ],
  },
  { path: '/operation-logs', icon: FileText, label: '操作日志', isSubmenu: false },
  { path: '/profile', icon: User, label: '个人中心', isSubmenu: false },
];

function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({ '网站配置': true });

  const getMenuItems = () => {
    const items = [...baseMenuItems];
    if (user?.is_superuser) {
      const profileIndex = items.findIndex(item => item.label === '个人中心');
      if (profileIndex !== -1) {
        items.splice(profileIndex, 0, { 
          path: '/users', 
          icon: Users, 
          label: '员工管理', 
          isSubmenu: false 
        });
      }
    }
    return items;
  };

  const toggleMenu = (label) => {
    setExpandedMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const menuItems = getMenuItems();

  const isSubmenuActive = (subitems) => {
    return subitems.some(item => location.pathname === item.path);
  };

  return (
    <aside className="w-64 bg-sidebar-bg min-h-screen flex flex-col">
      <div className="p-6 border-b border-sidebar-hover">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">🏯</span>
          北京旅游后台
        </h1>
        <p className="text-sidebar-text text-sm mt-1">BeijingWalk Admin</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <div key={item.label}>
            {item.isSubmenu ? (
              <div>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                    isSubmenuActive(item.subitems)
                      ? 'bg-sidebar-active text-sidebar-activeText'
                      : 'text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-activeText'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {expandedMenus[item.label] ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                {expandedMenus[item.label] && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.subitems.map((subitem) => (
                      <NavLink
                        key={subitem.path}
                        to={subitem.path}
                        end
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                            isActive
                              ? 'bg-sidebar-active/50 text-sidebar-activeText'
                              : 'text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-activeText'
                          }`
                        }
                      >
                        <subitem.icon className="w-4 h-4" />
                        <span className="font-medium">{subitem.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
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
            )}
          </div>
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