import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Music, Pause, Volume2, VolumeX, AlertCircle, Globe, ChevronDown, User, LogOut, Trophy, Star, ChevronRight, Brain } from 'lucide-react';
import { getNavigations, getSiteConfig } from '../services/api';
import { useI18n } from '../i18n';
import { useAuth } from '../contexts/AuthContext';
import SearchBar from './SearchBar';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language, setLanguage, supportedLanguages, getCurrentLanguageInfo } = useI18n();
  const { user, isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const isHomePage = location.pathname === '/';
  const showScrolledStyle = isScrolled || !isHomePage;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const audioRef = useRef(null);
  const languageMenuRef = useRef(null);
  const userMenuRef = useRef(null);
  const [navItems, setNavItems] = useState([
    { path: '/', label: '首页' },
    { path: '/culture', label: '北京文化' },
    { path: '/specialties', label: '地方特产' },
    { path: '/scenic', label: '名胜古迹' },
    { path: '/map', label: '景点地图' },
    { path: '/heritage', label: '非物质文化遗产' },
    { path: '/travel-packages', label: '旅行团推荐' },
    { path: '/guestbook', label: '留言板' },
  ]);
  const [siteConfig, setSiteConfig] = useState({
    site_name: '北京旅游'
  });

  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.volume = 0.3;
    audio.preload = 'metadata';

    audio.addEventListener('canplaythrough', () => {
      setIsAudioReady(true);
      setAudioError(null);
    });

    audio.addEventListener('error', (e) => {
      console.log('音频加载错误:', e);
      const errorMsg = '背景音乐加载失败，请检查音乐文件是否存在';
      setAudioError(errorMsg);
      setIsAudioReady(false);
    });

    audio.src = '/music/villatic_music.mp3';
    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const [navigationsData, siteConfigData] = await Promise.all([
          getNavigations(),
          getSiteConfig(),
        ]);
        
        if (navigationsData && navigationsData.length > 0) {
          const hasTravelPackage = navigationsData.some(
            (item) => item.path === '/travel-packages'
          );
          if (!hasTravelPackage) {
            const heritageIndex = navigationsData.findIndex(
              (item) => item.path === '/heritage'
            );
            if (heritageIndex !== -1) {
              const newNavItems = [...navigationsData];
              newNavItems.splice(heritageIndex + 1, 0, {
                path: '/travel-packages',
                label: '旅行团推荐',
              });
              setNavItems(newNavItems);
            } else {
              const newNavItems = [...navigationsData];
              newNavItems.push({
                path: '/travel-packages',
                label: '旅行团推荐',
              });
              setNavItems(newNavItems);
            }
          } else {
            setNavItems(navigationsData);
          }
        }
        if (siteConfigData) {
          setSiteConfig(siteConfigData);
        }
      } catch (err) {
        console.error('Failed to fetch config:', err);
      }
    };

    fetchConfig();
  }, []);

  const showError = (message) => {
    setAudioError(message);
    setShowErrorToast(true);
    setTimeout(() => setShowErrorToast(false), 5000);
  };

  const toggleMusic = async () => {
    if (!audioRef.current) {
      showError('音频对象未初始化');
      return;
    }

    if (audioError) {
      showError(audioError);
      return;
    }

    if (!isAudioReady) {
      showError('音频还在加载中，请稍后再试');
      return;
    }

    if (isMusicPlaying) {
      try {
        audioRef.current.pause();
        setIsMusicPlaying(false);
      } catch (error) {
        console.log('暂停音频错误:', error);
        showError('暂停音乐失败: ' + error.message);
      }
    } else {
      try {
        audioRef.current.currentTime = 0;
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          await playPromise;
          setIsMusicPlaying(true);
        }
      } catch (error) {
        console.log('播放音频错误:', error);
        let errorMsg = '播放音乐失败';
        
        if (error.name === 'NotAllowedError') {
          errorMsg = '浏览器限制自动播放，请先点击页面任意位置后再尝试播放';
        } else if (error.name === 'NotSupportedError') {
          errorMsg = '浏览器不支持此音频格式';
        } else if (error.message.includes('404') || error.message.includes('not found')) {
          errorMsg = '音乐文件不存在，请确保 public/music/villatic_music.mp3 文件存在';
        }
        
        showError(errorMsg);
      }
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target)) {
        setShowLanguageMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode) => {
    setLanguage(langCode);
    setShowLanguageMenu(false);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/80 backdrop-blur-md shadow-lg'
            : isHomePage
              ? 'bg-transparent'
              : 'bg-white/80 backdrop-blur-md shadow-lg'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/">
              <motion.div
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">京</span>
                </div>
                <span className={`text-xl font-semibold tracking-tight ${
                  showScrolledStyle ? 'text-gray-900' : 'text-white'
                }`}>
                  {siteConfig.site_name || '北京旅游'}
                </span>
              </motion.div>
            </Link>

            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <motion.div
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        active
                          ? showScrolledStyle
                            ? 'bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-md'
                            : 'bg-white/20 text-white shadow-md'
                          : showScrolledStyle
                            ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                            : 'text-white/90 hover:bg-white/20 hover:text-white'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {item.label}
                    </motion.div>
                  </Link>
                );
              })}
            </nav>

            <div className="hidden lg:block w-72">
              <SearchBar placeholder="搜索景点、特产..." />
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative" ref={languageMenuRef}>
                <motion.button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 ${
                    showScrolledStyle
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-white/90 hover:bg-white/20'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title={t('common.language')}
                >
                  <Globe className="w-5 h-5" />
                  <span className="text-sm font-medium">{getCurrentLanguageInfo().flag}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showLanguageMenu ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {showLanguageMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                    >
                      <div className="p-2">
                        {supportedLanguages.map((lang) => (
                          <motion.button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                              language === lang.code
                                ? 'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-600'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                            whileHover={{ x: 4 }}
                          >
                            <span className="text-xl">{lang.flag}</span>
                            <div className="text-left">
                              <span className="font-medium block">{lang.nativeName}</span>
                              <span className="text-xs text-gray-400">{lang.name}</span>
                            </div>
                            {language === lang.code && (
                              <div className="ml-auto w-2 h-2 rounded-full bg-orange-500"></div>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative" ref={userMenuRef}>
                {isAuthenticated ? (
                  <>
                    <motion.button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 ${
                        showScrolledStyle
                          ? 'text-gray-700 hover:bg-gray-100'
                          : 'text-white/90 hover:bg-white/20'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {user?.nickname?.charAt(0) || user?.username?.charAt(0) || '?'}
                      </div>
                      <span className="text-sm font-medium max-w-20 truncate">
                        {user?.nickname || user?.username}
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
                    </motion.button>

                    <AnimatePresence>
                      {showUserMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                        >
                          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                                {user?.nickname?.charAt(0) || user?.username?.charAt(0) || '?'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 truncate">
                                  {user?.nickname || user?.username}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {user?.email}
                                </p>
                              </div>
                            </div>
                            <div className="mt-3 flex items-center gap-4 text-xs text-gray-600">
                              <span className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-orange-500" />
                                {user?.total_score || 0} 积分
                              </span>
                              <span className="flex items-center gap-1">
                                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                                {user?.quizzes_completed || 0} 次游戏
                              </span>
                            </div>
                          </div>

                          <div className="p-2">
                            <Link
                              to="/profile"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <motion.button
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                                whileHover={{ x: 4 }}
                              >
                                <User className="w-5 h-5" />
                                <span className="font-medium">个人中心</span>
                                <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                              </motion.button>
                            </Link>

                            <Link
                              to="/quiz"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <motion.button
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                                whileHover={{ x: 4 }}
                              >
                                <Brain className="w-5 h-5" />
                                <span className="font-medium">知识问答</span>
                                <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                              </motion.button>
                            </Link>
                          </div>

                          <div className="p-2 border-t border-gray-100">
                            <motion.button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 text-red-600 hover:bg-red-50"
                              whileHover={{ x: 4 }}
                            >
                              <LogOut className="w-5 h-5" />
                              <span className="font-medium">退出登录</span>
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link to="/login">
                    <motion.button
                      className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                        showScrolledStyle
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-md'
                          : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/30'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium">登录</span>
                    </motion.button>
                  </Link>
                )}
              </div>

              <AnimatePresence>
                {isMusicPlaying && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    onClick={toggleMute}
                    className={`p-2 rounded-full transition-all duration-300 ${
                      showScrolledStyle
                        ? 'text-gray-700 hover:bg-gray-100'
                        : 'text-white/90 hover:bg-white/20'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </motion.button>
                )}
              </AnimatePresence>

              <motion.button
                onClick={toggleMusic}
                className={`p-2 rounded-full transition-all duration-300 ${
                  showScrolledStyle
                    ? 'text-gray-700 hover:bg-gray-100'
                    : 'text-white/90 hover:bg-white/20'
                } ${
                  isMusicPlaying
                    ? 'bg-orange-100 text-orange-600'
                    : ''
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title={isMusicPlaying ? t('header.pauseMusic') : t('header.playMusic')}
              >
                {isMusicPlaying ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <Pause className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <Music className="w-5 h-5" />
                )}
              </motion.button>

              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2 rounded-full transition-all duration-300 ${
                  showScrolledStyle
                    ? 'text-gray-700 hover:bg-gray-100'
                    : 'text-white/90 hover:bg-white/20'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed top-0 right-0 bottom-0 w-64 z-50 bg-white shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="p-6 pt-20">
              <nav className="space-y-2">
                {navItems.map((item, index) => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <motion.div
                        className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors ${
                          active
                            ? 'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-600 border border-orange-200'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {item.label}
                      </motion.div>
                    </Link>
                  );
                })}
              </nav>

              {isAuthenticated ? (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-3 mb-4 px-4 py-3 bg-orange-50 rounded-xl border border-orange-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                      {user?.nickname?.charAt(0) || user?.username?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user?.nickname || user?.username}</p>
                      <p className="text-xs text-gray-500">{user?.total_score || 0} 积分</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <motion.button
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <User className="w-5 h-5 text-orange-500" />
                        <span>个人中心</span>
                      </motion.button>
                    </Link>
                    
                    <Link
                      to="/quiz"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <motion.button
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Brain className="w-5 h-5 text-purple-500" />
                        <span>知识问答</span>
                      </motion.button>
                    </Link>
                  </div>
                  
                  <motion.button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <LogOut className="w-5 h-5" />
                    <span>退出登录</span>
                  </motion.button>
                </div>
              ) : (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <motion.button
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <User className="w-5 h-5" />
                      <span>登录 / 注册</span>
                    </motion.button>
                  </Link>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-3">{t('common.language')}</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {supportedLanguages.map((lang) => (
                    <motion.button
                      key={lang.code}
                      onClick={() => {
                        handleLanguageChange(lang.code);
                        setIsMenuOpen(false);
                      }}
                      className={`flex items-center gap-2 px-3 py-3 rounded-xl font-medium transition-colors ${
                        language === lang.code
                          ? 'bg-orange-100 text-orange-600 border border-orange-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="text-sm">{lang.nativeName}</span>
                    </motion.button>
                  ))}
                </div>

                <p className="text-sm text-gray-500 mb-3">背景音乐</p>
                <motion.button
                  onClick={() => {
                    toggleMusic();
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ${
                    isMusicPlaying
                      ? 'bg-orange-100 text-orange-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isMusicPlaying ? (
                    <>
                      <Pause className="w-4 h-4" />
                      暂停音乐
                    </>
                  ) : (
                    <>
                      <Music className="w-4 h-4" />
                      播放音乐
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showErrorToast && (
          <motion.div
            className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[320px]">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{audioError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
