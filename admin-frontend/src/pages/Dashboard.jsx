import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Users, 
  FileText, 
  MessageSquare,
  Calendar,
  Loader2,
  MapPin,
  Monitor,
  Smartphone,
  Tablet,
  Search,
  Globe
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { dashboardApi } from '../services/api';

const COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#ec4899', '#6366f1', '#14b8a6'];

function Dashboard() {
  const [stats, setStats] = useState({
    total_visits: 0,
    today_visits: 0,
    total_content_views: 0,
    total_content: {
      banners: 0,
      cultures: 0,
      specialties: 0,
      scenic_spots: 0,
      heritages: 0,
      guestbooks: 0
    }
  });
  const [trending, setTrending] = useState([]);
  const [visitTrend, setVisitTrend] = useState([]);
  const [geoDistribution, setGeoDistribution] = useState({ countries: [], provinces: [] });
  const [deviceDistribution, setDeviceDistribution] = useState({ devices: [], browsers: [], operating_systems: [] });
  const [searchKeywords, setSearchKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [activeGeoTab, setActiveGeoTab] = useState('countries');

  useEffect(() => {
    fetchData();
  }, [days]);

  const fetchData = async () => {
    setLoading(true);
    
    try {
      const statsRes = await dashboardApi.getStats();
      if (statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
    
    try {
      const trendingRes = await dashboardApi.getTrending();
      setTrending(trendingRes.data || []);
    } catch (error) {
      console.error('Failed to fetch trending:', error);
    }
    
    try {
      const visitRes = await dashboardApi.getVisitTrend(days);
      setVisitTrend(visitRes.data || []);
    } catch (error) {
      console.error('Failed to fetch visit trend:', error);
    }

    try {
      const geoRes = await dashboardApi.getGeoDistribution();
      setGeoDistribution(geoRes.data || { countries: [], provinces: [] });
    } catch (error) {
      console.error('Failed to fetch geo distribution:', error);
    }

    try {
      const deviceRes = await dashboardApi.getDeviceDistribution(days);
      setDeviceDistribution(deviceRes.data || { devices: [], browsers: [], operating_systems: [] });
    } catch (error) {
      console.error('Failed to fetch device distribution:', error);
    }

    try {
      const searchRes = await dashboardApi.getSearchKeywords(days, 20);
      setSearchKeywords(searchRes.data || []);
    } catch (error) {
      console.error('Failed to fetch search keywords:', error);
    }
    
    setLoading(false);
  };

  const statCards = [
    {
      title: '总访问量',
      value: stats?.total_visits || 0,
      icon: Eye,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: '今日访问',
      value: stats?.today_visits || 0,
      icon: Calendar,
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: '内容浏览',
      value: stats?.total_content_views || 0,
      icon: FileText,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: '留言数量',
      value: stats?.total_content?.guestbooks || 0,
      icon: MessageSquare,
      color: 'bg-orange-500',
      lightColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
  ];

  const getDeviceIcon = (device) => {
    switch (device?.toLowerCase()) {
      case 'mobile': return Smartphone;
      case 'tablet': return Tablet;
      default: return Monitor;
    }
  };

  const geoData = activeGeoTab === 'countries' 
    ? geoDistribution.countries 
    : geoDistribution.provinces;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDays(7)}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              days === 7 ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            7天
          </button>
          <button
            onClick={() => setDays(30)}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              days === 30 ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            30天
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="stat-card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
              </div>
              <div className={`stat-icon ${card.lightColor}`}>
                <card.icon className={`w-6 h-6 ${card.textColor}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="admin-card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">访问趋势</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={visitTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#0ea5e9"
                  strokeWidth={3}
                  dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#0ea5e9' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="admin-card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">设备分布</h3>
          <div className="h-72">
            {deviceDistribution.devices.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceDistribution.devices}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {deviceDistribution.devices.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Monitor className="w-12 h-12 mb-2" />
                <p>暂无设备数据</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="admin-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-500" />
              用户地域分布
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveGeoTab('countries')}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                  activeGeoTab === 'countries' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                国家
              </button>
              <button
                onClick={() => setActiveGeoTab('provinces')}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                  activeGeoTab === 'provinces' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                省市
              </button>
            </div>
          </div>
          <div className="h-72 overflow-y-auto">
            {geoData.length > 0 ? (
              <div className="space-y-3">
                {geoData.slice(0, 10).map((item, index) => {
                  const maxCount = Math.max(...geoData.map(g => g.count), 1);
                  const percentage = (item.count / maxCount) * 100;
                  return (
                    <div key={item.name || index} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700">{item.name || '未知'}</span>
                        <span className="text-gray-500">{item.count} 人</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Globe className="w-12 h-12 mb-2" />
                <p>暂无地域数据</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="admin-card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-purple-500" />
            热门搜索词
          </h3>
          <div className="h-72 overflow-y-auto">
            {searchKeywords.length > 0 ? (
              <div className="space-y-2">
                {searchKeywords.slice(0, 15).map((item, index) => {
                  const maxCount = Math.max(...searchKeywords.map(k => k.search_count), 1);
                  const percentage = (item.search_count / maxCount) * 100;
                  return (
                    <div 
                      key={item.keyword || index}
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                            index === 0 ? 'bg-yellow-100 text-yellow-700' :
                            index === 1 ? 'bg-gray-200 text-gray-700' :
                            index === 2 ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {index + 1}
                          </span>
                          <span className="font-medium text-gray-800">{item.keyword}</span>
                        </div>
                        <span className="text-sm text-gray-500">{item.search_count} 次</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex gap-4 mt-1 text-xs text-gray-500">
                        <span>独立访客: {item.unique_visitors}</span>
                        <span>平均结果: {item.avg_results || 0}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Search className="w-12 h-12 mb-2" />
                <p>暂无搜索数据</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="admin-card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">浏览器分布</h3>
          <div className="h-64">
            {deviceDistribution.browsers.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deviceDistribution.browsers}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                    {deviceDistribution.browsers.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Monitor className="w-10 h-10 mb-2" />
                <p>暂无浏览器数据</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="admin-card"
        >
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">热门内容排行</h3>
          </div>
          <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
            {trending.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                暂无浏览数据
              </div>
            ) : (
              trending.slice(0, 5).map((item, index) => (
                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-600' :
                      index === 1 ? 'bg-gray-100 text-gray-600' :
                      index === 2 ? 'bg-orange-100 text-orange-600' :
                      'bg-gray-50 text-gray-500'
                    }`}>
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500">
                        {item.content_type === 'banner' && '轮播图'}
                        {item.content_type === 'culture' && '文化内容'}
                        {item.content_type === 'specialty' && '地方特产'}
                        {item.content_type === 'scenic_spot' && '名胜古迹'}
                        {item.content_type === 'heritage' && '非物质文化遗产'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{item.view_count.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 flex items-center justify-end gap-1">
                      <Eye className="w-3 h-3" />
                      浏览量
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Dashboard;
