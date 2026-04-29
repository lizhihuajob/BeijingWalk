import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Music, Pause, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { getNavigations, getSiteConfig } from '../services/api';

const Header = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const isHomePage = location.pathname === '/';
  const showScrolledStyle = isScrolled || !isHomePage;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const audioRef = useRef(null);
  const [navItems, setNavItems] = useState([
    { path: '/', label: '首页' },
    { path: '/culture', label: '北京文化' },
    { path: '/specialties', label: '地方特产' },
    { path: '/scenic', label: '名胜古迹' },
    { path: '/heritage', label: '非物质文化遗产' },
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
          setNavItems(navigationsData);
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

  const navItems = [
    { path: '/', label: '首页' },
    { path: '/culture', label: '北京文化' },
    { path: '/specialties', label: '地方特产' },
    { path: '/scenic', label: '名胜古迹' },
    { path: '/heritage', label: '非物质文化遗产' },
    { path: '/guestbook', label: '留言板' },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
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

            <div className="flex items-center space-x-2">
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
                title={isMusicPlaying ? '暂停音乐' : '播放背景音乐'}
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
                className={`md:hidden p-2 rounded-full transition-all duration-300 ${
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

              <div className="mt-8 pt-6 border-t border-gray-200">
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
