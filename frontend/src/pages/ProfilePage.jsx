import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Award,
  Trophy,
  Star,
  CheckCircle,
  LogOut,
  Edit2,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Gamepad2,
  Target,
  TrendingUp,
  Calendar,
  Clock,
  Loader2,
  AlertCircle,
  ChevronRight,
  Settings,
  Bell,
  Heart
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getUserBadges,
  getUserScores,
  getQuizHistory,
  updateProfile
} from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [badges, setBadges] = useState({ earned: [], not_earned: [], total_earned: 0, total_available: 0 });
  const [scoreHistory, setScoreHistory] = useState({ current_score: 0, histories: [] });
  const [quizHistory, setQuizHistory] = useState({ total: 0, games: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    nickname: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  
  const { user, token, logout, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/profile' } } });
      return;
    }
    
    if (user) {
      setEditForm({
        nickname: user.nickname || user.username,
        phone: user.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
    
    fetchData();
  }, [isAuthenticated, navigate, user, token]);
  
  const fetchData = async () => {
    if (!token) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const [badgesData, scoresData, historyData] = await Promise.all([
        getUserBadges(token),
        getUserScores(token),
        getQuizHistory(token, 10, 0),
      ]);
      
      setBadges(badgesData || { earned: [], not_earned: [], total_earned: 0, total_available: 0 });
      setScoreHistory(scoresData || { current_score: 0, histories: [] });
      setQuizHistory(historyData || { total: 0, games: [] });
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError('加载数据失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveProfile = async () => {
    if (!token) return;
    
    if (editForm.newPassword && editForm.newPassword !== editForm.confirmPassword) {
      setError('两次输入的新密码不一致');
      return;
    }
    
    setSavingProfile(true);
    
    try {
      const data = {
        nickname: editForm.nickname,
        phone: editForm.phone,
      };
      
      if (editForm.currentPassword && editForm.newPassword) {
        data.current_password = editForm.currentPassword;
        data.new_password = editForm.newPassword;
      }
      
      const result = await updateProfile(token, data);
      
      if (result.user) {
        updateUser(result.user);
        setShowEditModal(false);
        setEditForm({
          ...editForm,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.error || '更新失败，请稍后重试');
    } finally {
      setSavingProfile(false);
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'legendary':
        return 'from-purple-500 to-pink-500';
      case 'rare':
        return 'from-red-500 to-rose-500';
      case 'uncommon':
        return 'from-blue-500 to-indigo-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };
  
  const getRarityLabel = (rarity) => {
    switch (rarity) {
      case 'legendary':
        return '传说';
      case 'rare':
        return '稀有';
      case 'uncommon':
        return '精良';
      default:
        return '普通';
    }
  };
  
  const getRarityBg = (rarity) => {
    switch (rarity) {
      case 'legendary':
        return 'bg-purple-50 border-purple-200';
      case 'rare':
        return 'bg-red-50 border-red-200';
      case 'uncommon':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        <Header />
        <div className="pt-24 pb-16 px-4 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 mx-auto text-orange-500 animate-spin mb-4" />
            <p className="text-gray-600">加载中...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <Header />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
                <button
                  onClick={() => setError('')}
                  className="ml-auto text-red-600 hover:text-red-800"
                >
                  关闭
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6"
          >
            <div className="bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 p-8 text-white">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center text-4xl shadow-lg">
                    {user?.nickname?.charAt(0) || user?.username?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold mb-1">
                      {user?.nickname || user?.username}
                    </h1>
                    <p className="text-white/80 text-sm mb-3">
                      @{user?.username}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {user?.email}
                      </span>
                      {user?.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {user?.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-3 bg-white/20 hover:bg-red-500/50 rounded-xl transition-colors"
                    title="退出登录"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="mt-8 grid grid-cols-4 gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold mb-1">{user?.total_score || 0}</div>
                  <div className="text-white/80 text-sm">总积分</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold mb-1">{user?.quizzes_completed || 0}</div>
                  <div className="text-white/80 text-sm">游戏次数</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold mb-1">{user?.accuracy_rate || 0}%</div>
                  <div className="text-white/80 text-sm">正确率</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold mb-1">{badges.total_earned || 0}</div>
                  <div className="text-white/80 text-sm">获得徽章</div>
                </div>
              </div>
            </div>
            
            <div className="flex border-b border-gray-100 px-6">
              {[
                { id: 'overview', label: '概览', icon: <User className="w-4 h-4" /> },
                { id: 'badges', label: '徽章', icon: <Award className="w-4 h-4" /> },
                { id: 'history', label: '历史', icon: <Gamepad2 className="w-4 h-4" /> },
                { id: 'scores', label: '积分', icon: <Star className="w-4 h-4" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2 ${
                    activeTab === tab.id
                      ? 'text-orange-600 border-orange-500'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
            
            <div className="p-6">
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">游戏统计</h3>
                            <p className="text-sm text-gray-500">知识问答表现</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm">完成游戏</span>
                            <span className="font-semibold text-gray-900">
                              {user?.quizzes_completed || 0} 次
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm">答对题目</span>
                            <span className="font-semibold text-green-600">
                              {user?.questions_correct || 0} 题
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm">答错题目</span>
                            <span className="font-semibold text-red-600">
                              {(user?.questions_total || 0) - (user?.questions_correct || 0)} 题
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm">总答题数</span>
                            <span className="font-semibold text-gray-900">
                              {user?.questions_total || 0} 题
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                            <Award className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">徽章收集</h3>
                            <p className="text-sm text-gray-500">已获得 {badges.total_earned}/{badges.total_available} 个</p>
                          </div>
                        </div>
                        
                        {badges.earned?.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {badges.earned.slice(0, 8).map((badge) => (
                              <div
                                key={badge.id}
                                className={`w-12 h-12 bg-gradient-to-br ${badge.color || 'from-gray-400 to-gray-500'} rounded-xl flex items-center justify-center text-2xl shadow-sm`}
                                title={badge.name}
                              >
                                {badge.icon || '🏆'}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-gray-500 py-4">
                            还没有获得徽章，快去答题吧！
                          </p>
                        )}
                        
                        <button
                          onClick={() => setActiveTab('badges')}
                          className="w-full mt-4 py-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                        >
                          查看全部徽章 →
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          <Gamepad2 className="w-5 h-5 text-orange-500" />
                          最近游戏记录
                        </h3>
                        <button
                          onClick={() => setActiveTab('history')}
                          className="text-sm text-orange-600 hover:text-orange-700"
                        >
                          查看全部
                        </button>
                      </div>
                      
                      {quizHistory.games?.length > 0 ? (
                        <div className="space-y-3">
                          {quizHistory.games.slice(0, 5).map((game, index) => (
                            <div
                              key={game.id}
                              className="flex items-center justify-between p-4 bg-white rounded-xl"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg flex items-center justify-center text-white font-bold">
                                  {index + 1}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {game.category_name || '随机挑战'}
                                  </p>
                                  <p className="text-sm text-gray-500 flex items-center gap-2">
                                    <Calendar className="w-3 h-3" />
                                    {game.started_at?.slice(0, 10)}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-orange-600">
                                  +{game.score || 0} 分
                                </p>
                                <p className="text-sm text-gray-500">
                                  答对 {game.correct_count}/{game.total_questions}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-gray-500 py-8">
                          还没有游戏记录
                          <button
                            onClick={() => navigate('/quiz')}
                            className="block mx-auto mt-2 text-orange-600 hover:text-orange-700"
                          >
                            开始答题 →
                          </button>
                        </p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        onClick={() => navigate('/quiz')}
                        className="flex items-center gap-4 p-6 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl text-white hover:shadow-lg transition-shadow"
                      >
                        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                          <Brain className="w-8 h-8" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold">知识问答</p>
                          <p className="text-sm text-white/80">测试你的北京文化知识</p>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => setActiveTab('badges')}
                        className="flex items-center gap-4 p-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white hover:shadow-lg transition-shadow"
                      >
                        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                          <Award className="w-8 h-8" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold">徽章收藏</p>
                          <p className="text-sm text-white/80">查看已获得的徽章</p>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-4 p-6 bg-gradient-to-r from-gray-600 to-gray-700 rounded-2xl text-white hover:shadow-lg transition-shadow"
                      >
                        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                          <TrendingUp className="w-8 h-8" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold">探索北京</p>
                          <p className="text-sm text-white/80">浏览更多精彩内容</p>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}
                
                {activeTab === 'badges' && (
                  <motion.div
                    key="badges"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                        <Award className="w-4 h-4" />
                        已收集 {badges.total_earned}/{badges.total_available} 个徽章
                      </div>
                    </div>
                    
                    {badges.earned?.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          已获得的徽章
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {badges.earned.map((badge) => (
                            <motion.div
                              key={badge.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={`p-4 rounded-2xl border-2 ${getRarityBg(badge.rarity)}`}
                            >
                              <div className="text-center">
                                <div className={`w-16 h-16 mx-auto mb-3 bg-gradient-to-br ${badge.color || getRarityColor(badge.rarity)} rounded-2xl flex items-center justify-center text-3xl shadow-lg`}>
                                  {badge.icon || '🏆'}
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-1">
                                  {badge.name}
                                </h4>
                                <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                                  {badge.description}
                                </p>
                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                                  badge.rarity === 'legendary' ? 'bg-purple-100 text-purple-700' :
                                  badge.rarity === 'rare' ? 'bg-red-100 text-red-700' :
                                  badge.rarity === 'uncommon' ? 'bg-blue-100 text-blue-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {getRarityLabel(badge.rarity)}
                                </span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {badges.not_earned?.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Target className="w-5 h-5 text-gray-400" />
                          待收集的徽章
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {badges.not_earned.map((badge) => (
                            <motion.div
                              key={badge.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="p-4 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50"
                            >
                              <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-3 bg-gray-200 rounded-2xl flex items-center justify-center text-3xl opacity-50">
                                  {badge.icon || '🏆'}
                                </div>
                                <h4 className="font-semibold text-gray-500 mb-1">
                                  ???
                                </h4>
                                <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                                  {badge.requirement_type === 'total_score' && `累计获得 ${badge.requirement_value} 积分`}
                                  {badge.requirement_type === 'quizzes_completed' && `完成 ${badge.requirement_value} 次游戏`}
                                  {badge.requirement_type === 'single_game_score' && `单次游戏获得 ${badge.requirement_value} 分`}
                                  {badge.requirement_type === 'single_game_perfect' && `单次游戏全部答对 ${badge.requirement_value} 题`}
                                  {badge.requirement_type === 'accuracy_rate' && `答题正确率达到 ${badge.requirement_value}%`}
                                </p>
                                <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">
                                  {getRarityLabel(badge.rarity)}
                                </span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
                
                {activeTab === 'history' && (
                  <motion.div
                    key="history"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        游戏历史
                      </h3>
                      <p className="text-sm text-gray-500">
                        共完成 {quizHistory.total || 0} 次游戏
                      </p>
                    </div>
                    
                    {quizHistory.games?.length > 0 ? (
                      <div className="space-y-4">
                        {quizHistory.games.map((game, index) => (
                          <motion.div
                            key={game.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                          >
                            <div className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                    {quizHistory.total - index}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900">
                                      {game.category_name || '随机挑战'}
                                    </h4>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {game.started_at?.slice(0, 10)}
                                      </span>
                                      {game.duration_seconds && (
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-4 h-4" />
                                          {game.duration_seconds}秒
                                        </span>
                                      )}
                                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                                        game.status === 'completed' 
                                          ? 'bg-green-100 text-green-700' 
                                          : 'bg-yellow-100 text-yellow-700'
                                      }`}>
                                        {game.status === 'completed' ? '已完成' : '进行中'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-orange-600">
                                    +{game.score || 0}
                                  </p>
                                  <p className="text-sm text-gray-500">积分</p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                                <div className="text-center">
                                  <p className="text-xl font-bold text-green-600">
                                    {game.correct_count}
                                  </p>
                                  <p className="text-xs text-gray-500">答对</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xl font-bold text-red-600">
                                    {game.incorrect_count}
                                  </p>
                                  <p className="text-xs text-gray-500">答错</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xl font-bold text-gray-900">
                                    {game.accuracy_rate || 0}%
                                  </p>
                                  <p className="text-xs text-gray-500">正确率</p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-3xl flex items-center justify-center text-4xl">
                          🎮
                        </div>
                        <p className="text-gray-600 mb-4">还没有游戏记录</p>
                        <button
                          onClick={() => navigate('/quiz')}
                          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-xl hover:shadow-lg transition-shadow"
                        >
                          开始答题
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
                
                {activeTab === 'scores' && (
                  <motion.div
                    key="scores"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-400 to-amber-500 rounded-3xl shadow-lg mb-4">
                        <Star className="w-10 h-10 text-white" />
                      </div>
                      <p className="text-4xl font-bold text-gray-900 mb-2">
                        {scoreHistory.current_score || 0}
                      </p>
                      <p className="text-gray-500">当前总积分</p>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        积分记录
                      </h3>
                      
                      {scoreHistory.histories?.length > 0 ? (
                        <div className="space-y-3">
                          {scoreHistory.histories.map((history, index) => (
                            <motion.div
                              key={history.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.03 }}
                              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100"
                            >
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                history.score_change > 0 
                                  ? 'bg-green-100' 
                                  : 'bg-red-100'
                              }`}>
                                {history.score_change > 0 ? (
                                  <Star className="w-5 h-5 text-green-600" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-red-600" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {history.reason === 'quiz_game' ? '答题奖励' :
                                   history.reason === 'badge_earned' ? '徽章奖励' :
                                   history.description || '其他'}
                                </p>
                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                  <Calendar className="w-3 h-3" />
                                  {history.created_at?.slice(0, 10)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className={`font-bold text-lg ${
                                  history.score_change > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {history.score_change > 0 ? '+' : ''}{history.score_change}
                                </p>
                                <p className="text-xs text-gray-400">
                                  累计: {history.score_after}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-16">
                          <div className="w-24 h-20 mx-auto mb-4 bg-gray-100 rounded-3xl flex items-center justify-center text-4xl">
                            ⭐
                          </div>
                          <p className="text-gray-600 mb-4">还没有积分记录</p>
                          <button
                            onClick={() => navigate('/quiz')}
                            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-xl hover:shadow-lg transition-shadow"
                          >
                            去答题赚积分
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
      
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">编辑资料</h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    昵称
                  </label>
                  <input
                    type="text"
                    value={editForm.nickname}
                    onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                    placeholder="请输入昵称"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    手机号
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="请输入手机号"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="font-medium text-gray-900 mb-4">修改密码（可选）</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        当前密码
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={editForm.currentPassword}
                          onChange={(e) => setEditForm({ ...editForm, currentPassword: e.target.value })}
                          placeholder="请输入当前密码"
                          className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        新密码
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={editForm.newPassword}
                          onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                          placeholder="请输入新密码（至少6位）"
                          className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        确认新密码
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={editForm.confirmPassword}
                          onChange={(e) => setEditForm({ ...editForm, confirmPassword: e.target.value })}
                          placeholder="请再次输入新密码"
                          className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        保存中...
                      </>
                    ) : (
                      '保存'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <Footer />
    </div>
  );
};

export default ProfilePage;
