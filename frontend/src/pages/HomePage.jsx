import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronUp, Loader2, ArrowRight, Scroll, Utensils, 
  Building, Sparkles, MapPin, Star, Clock, Heart,
  ChevronLeft, ChevronRight, MessageSquare
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getBanners, getCultures, getSpecialties, getScenicSpots, getHeritages } from '../services/api';

function HomePage() {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [featuredData, setFeaturedData] = useState({
    cultures: [],
    specialties: [],
    scenicSpots: [],
    heritages: [],
  });
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bannersData, culturesData, specialtiesData, scenicSpotsData, heritagesData] = await Promise.all([
          getBanners(),
          getCultures(),
          getSpecialties(),
          getScenicSpots(),
          getHeritages(),
        ]);
        
        setBanners(bannersData);
        setFeaturedData({
          cultures: culturesData.slice(0, 2),
          specialties: specialtiesData.slice(0, 3),
          scenicSpots: scenicSpots.filter(s => s.is_featured).slice(0, 1).concat(scenicSpots.filter(s => !s.is_featured).slice(0, 2)),
          heritages: heritagesData.slice(0, 4),
        });
        setError(null);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('加载数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextBanner = () => {
    if (banners.length > 0) {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }
  };

  const prevBanner = () => {
    if (banners.length > 0) {
      setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-4 h-4 ${i < fullStars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
        />
      );
    }
    return stars;
  };

  const categories = [
    {
      title: '北京文化',
      description: '探索北京悠久的历史文化，感受千年古都的独特魅力',
      icon: Scroll,
      path: '/culture',
      gradient: 'from-amber-400 to-orange-500',
      bgLight: 'from-amber-50 to-orange-50',
      borderColor: 'border-amber-200',
    },
    {
      title: '地方特产',
      description: '品尝北京地道美食，感受舌尖上的老北京味道',
      icon: Utensils,
      path: '/specialties',
      gradient: 'from-red-400 to-pink-500',
      bgLight: 'from-red-50 to-pink-50',
      borderColor: 'border-red-200',
    },
    {
      title: '名胜古迹',
      description: '探索北京千年历史的著名景点，感受中华文明的博大精深',
      icon: Building,
      path: '/scenic',
      gradient: 'from-blue-400 to-purple-500',
      bgLight: 'from-blue-50 to-purple-50',
      borderColor: 'border-blue-200',
    },
    {
      title: '非物质文化遗产',
      description: '传承千年技艺，守护文化瑰宝，感受老北京的独特魅力',
      icon: Sparkles,
      path: '/heritage',
      gradient: 'from-amber-400 to-yellow-500',
      bgLight: 'from-yellow-50 to-amber-50',
      borderColor: 'border-yellow-200',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-orange-500 animate-spin mx-auto mb-6" />
            <p className="text-gray-600 text-xl">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        <section className="relative h-screen max-h-[800px] overflow-hidden">
          <AnimatePresence mode="wait">
            {banners.length > 0 && (
              <motion.div
                key={currentBannerIndex}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0"
              >
                <img
                  src={banners[currentBannerIndex]?.image_url}
                  alt={banners[currentBannerIndex]?.title || '北京旅游'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60"></div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center px-4 max-w-5xl mx-auto"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-md rounded-full mb-8"
              >
                <MapPin className="w-5 h-5 text-white" />
                <span className="text-white font-medium">欢迎来到首都北京</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight leading-tight"
              >
                探索北京
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-orange-300">
                  千年古都
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed"
              >
                感受历史与现代的完美交融，体验传统文化与时尚潮流的碰撞
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <motion.button
                  onClick={() => navigate('/scenic')}
                  className="px-10 py-5 bg-gradient-to-r from-orange-400 to-amber-500 text-white font-bold text-lg rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center gap-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  开始探索
                  <ArrowRight className="w-6 h-6" />
                </motion.button>
                <motion.button
                  onClick={() => navigate('/culture')}
                  className="px-10 py-5 bg-white/20 backdrop-blur-md text-white font-bold text-lg rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  了解文化
                </motion.button>
              </motion.div>
            </motion.div>
          </div>

          {banners.length > 1 && (
            <>
              <motion.button
                onClick={prevBanner}
                className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-all duration-300 flex items-center justify-center z-10"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft className="w-6 h-6" />
              </motion.button>
              <motion.button
                onClick={nextBanner}
                className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-all duration-300 flex items-center justify-center z-10"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight className="w-6 h-6" />
              </motion.button>

              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
                {banners.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setCurrentBannerIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentBannerIndex
                        ? 'bg-white w-8'
                        : 'bg-white/50 hover:bg-white/80'
                    }`}
                    whileHover={{ scale: 1.2 }}
                  />
                ))}
              </div>
            </>
          )}

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <div className="w-8 h-12 rounded-full border-2 border-white/50 flex items-start justify-center p-2">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-3 bg-white/80 rounded-full"
              />
            </div>
          </motion.div>
        </section>

        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <span className="inline-block px-4 py-2 bg-orange-100 text-orange-600 rounded-full text-sm font-medium mb-6">
                探索分类
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
                发现北京的精彩
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                从千年文化到现代时尚，从地道美食到名胜古迹，北京总有一款适合你
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {categories.map((category, index) => {
                const IconComponent = category.icon;
                return (
                  <motion.div
                    key={category.path}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group"
                  >
                    <motion.div
                      onClick={() => navigate(category.path)}
                      className={`bg-gradient-to-br ${category.bgLight} rounded-3xl p-8 md:p-10 border ${category.borderColor} cursor-pointer transition-all duration-500 hover:shadow-2xl`}
                      whileHover={{ y: -8 }}
                    >
                      <div className="flex items-start gap-6">
                        <motion.div
                          className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${category.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.3 }}
                        >
                          <IconComponent className="w-8 h-8 md:w-10 md:h-10 text-white" />
                        </motion.div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                            {category.title}
                          </h3>
                          <p className="text-gray-600 mb-6 leading-relaxed">
                            {category.description}
                          </p>
                          <motion.button
                            className={`inline-flex items-center gap-2 font-semibold bg-gradient-to-r ${category.gradient} bg-clip-text text-transparent hover:opacity-80 transition-opacity`}
                            whileHover={{ x: 5 }}
                          >
                            立即探索
                            <ArrowRight className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {featuredData.scenicSpots.length > 0 && (
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="flex items-center justify-between mb-12"
              >
                <div>
                  <span className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-medium mb-4">
                    推荐景点
                  </span>
                  <h2 className="text-4xl font-bold text-gray-900 tracking-tight">
                    必游之地
                  </h2>
                </div>
                <motion.button
                  onClick={() => navigate('/scenic')}
                  className="hidden md:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                  whileHover={{ x: 5 }}
                >
                  查看全部
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </motion.div>

              <div className="grid lg:grid-cols-3 gap-8">
                {featuredData.scenicSpots.map((spot, index) => (
                  <motion.div
                    key={spot.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`${index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}`}
                  >
                    <motion.div
                      onClick={() => navigate(`/scenic-spot/${spot.id}`)}
                      className={`group relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer ${
                        index === 0 ? 'h-full min-h-[400px]' : 'h-64 md:h-80'
                      }`}
                      whileHover={{ y: -4 }}
                    >
                      <img
                        src={spot.image_url}
                        alt={spot.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                      
                      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                        {spot.is_featured && (
                          <span className="inline-block px-3 py-1 bg-gradient-to-r from-blue-400 to-purple-500 text-white text-xs font-medium rounded-full mb-3">
                            🌟 推荐
                          </span>
                        )}
                        <h3 className={`font-bold text-white mb-2 ${
                          index === 0 ? 'text-2xl md:text-4xl' : 'text-xl md:text-2xl'
                        }`}>
                          {spot.name}
                        </h3>
                        <div className="flex items-center gap-3 text-white/80 text-sm">
                          {spot.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {spot.location}
                            </span>
                          )}
                        </div>
                      </div>

                      <motion.div
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        whileHover={{ scale: 1.1 }}
                      >
                        <ArrowRight className="w-5 h-5 text-white" />
                      </motion.div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="mt-8 text-center md:hidden"
              >
                <motion.button
                  onClick={() => navigate('/scenic')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-semibold rounded-full"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  查看全部景点
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </motion.div>
            </div>
          </section>
        )}

        {featuredData.specialties.length > 0 && (
          <section className="py-20 bg-gradient-to-b from-white to-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <span className="inline-block px-4 py-2 bg-red-100 text-red-600 rounded-full text-sm font-medium mb-4">
                  地道美食
                </span>
                <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                  舌尖上的北京
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  品尝正宗老北京味道，感受传统与创新的美食文化
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8">
                {featuredData.specialties.map((specialty, index) => (
                  <motion.div
                    key={specialty.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group"
                  >
                    <motion.div
                      onClick={() => navigate(`/specialty/${specialty.id}`)}
                      className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
                      whileHover={{ y: -8 }}
                    >
                      <div className="relative h-56 overflow-hidden">
                        <img
                          src={specialty.image_url}
                          alt={specialty.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-semibold text-gray-900">{specialty.rating}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-500 transition-colors">
                          {specialty.name}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                          {specialty.description}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-1">
                            {renderStars(specialty.rating)}
                          </div>
                          <motion.span
                            className="flex items-center gap-1 text-red-500 font-semibold text-sm"
                            whileHover={{ x: 3 }}
                          >
                            了解详情
                            <ArrowRight className="w-4 h-4" />
                          </motion.span>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="mt-12 text-center"
              >
                <motion.button
                  onClick={() => navigate('/specialties')}
                  className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-red-400 to-pink-500 text-white font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  探索更多美食
                  <ArrowRight className="w-6 h-6" />
                </motion.button>
              </motion.div>
            </div>
          </section>
        )}

        <section className="py-20 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 text-9xl">🏯</div>
            <div className="absolute bottom-10 right-10 text-9xl">🎭</div>
            <div className="absolute top-1/2 left-1/4 text-7xl">✨</div>
          </div>
          
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                准备好探索北京了吗？
              </h2>
              <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                千年古都，现代之都。北京等你来发现它的独特魅力
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.button
                  onClick={() => navigate('/culture')}
                  className="px-10 py-5 bg-white text-orange-600 font-bold text-lg rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center gap-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Heart className="w-6 h-6" />
                  了解北京文化
                </motion.button>
                <motion.button
                  onClick={() => navigate('/guestbook')}
                  className="px-10 py-5 bg-white/20 backdrop-blur-md text-white font-bold text-lg rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300 flex items-center gap-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <MessageSquare className="w-6 h-6" />
                  留言板
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center z-50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronUp className="w-7 h-7" />
          </motion.button>
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-8 py-4 rounded-full shadow-lg z-50"
        >
          <p className="font-medium">{error}</p>
        </motion.div>
      )}
    </div>
  );
}

export default HomePage;
