import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, DollarSign, Star, Loader2, ChevronUp, ArrowRight, Tag, Users, Calendar, Phone } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getTravelPackages, getFeaturedTravelPackages } from '../services/api';
import { useI18n } from '../i18n';

const TravelPackagesPage = () => {
  const navigate = useNavigate();
  const { t, language } = useI18n();
  const [packages, setPackages] = useState([]);
  const [featuredPackages, setFeaturedPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [packagesData, featuredData] = await Promise.all([
          getTravelPackages(),
          getFeaturedTravelPackages(),
        ]);
        setPackages(packagesData);
        setFeaturedPackages(featuredData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch travel packages:', err);
        setError('加载旅行团产品失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [language]);

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

  const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-lg">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Header />
      
      <main className="pt-20">
        <div className="relative h-80 md:h-96 bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-500 overflow-hidden">
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center px-4"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm mb-6">
                <Tag className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
                旅行团产品
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
                精选优质旅行团，省心出行，畅游北京
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-8 text-center"
            >
              <p className="text-lg">{error}</p>
            </motion.div>
          )}

          {featuredPackages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-16"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                  <Star className="w-5 h-5 text-white fill-current" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">推荐产品</h3>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredPackages.map((pkg, index) => (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group"
                  >
                    <motion.div
                      className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 h-full flex flex-col cursor-pointer relative"
                      whileHover={{ y: -8 }}
                      onClick={() => navigate(`/travel-package/${pkg.id}`)}
                    >
                      <div className="absolute top-4 left-4 z-10">
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white rounded-full text-xs font-bold shadow-lg">
                          <Star className="w-3 h-3 fill-current" />
                          推荐
                        </span>
                      </div>

                      <div className="relative overflow-hidden h-56">
                        <img
                          src={pkg.image_url}
                          alt={pkg.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-center justify-between">
                            <div>
                              {pkg.price && (
                                <div className="flex items-baseline gap-2">
                                  <span className="text-2xl font-bold text-white">
                                    ¥{pkg.price}
                                  </span>
                                  <span className="text-white/80 text-sm">
                                    {pkg.price_unit || '元/人'}
                                  </span>
                                </div>
                              )}
                              {pkg.discount_price && (
                                <div className="text-white/60 text-sm line-through">
                                  ¥{pkg.discount_price}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                          {pkg.title}
                        </h3>
                        {pkg.subtitle && (
                          <p className="text-gray-500 text-sm mb-3">{pkg.subtitle}</p>
                        )}
                        <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1">
                          {truncateText(pkg.description, 80)}
                        </p>

                        <div className="flex flex-wrap gap-3 mb-4 text-sm text-gray-500">
                          {pkg.duration && (
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              <span>{pkg.duration}</span>
                            </div>
                          )}
                          {pkg.departure_city && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4" />
                              <span>{pkg.departure_city}</span>
                            </div>
                          )}
                          {pkg.destination_city && (
                            <div className="flex items-center gap-1.5">
                              <Users className="w-4 h-4" />
                              <span>{pkg.destination_city}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <Calendar className="w-4 h-4" />
                            <span>查看详情</span>
                          </div>
                          <motion.button
                            className="inline-flex items-center gap-1.5 text-orange-500 hover:text-orange-600 text-sm font-semibold transition-colors"
                            whileHover={{ x: 3 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/travel-package/${pkg.id}`);
                            }}
                          >
                            了解更多
                            <ArrowRight className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {packages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-12 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">全部旅行团</h2>
                  <p className="text-gray-500">共 {packages.length} 个产品</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {packages.map((pkg, index) => (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="group"
                  >
                    <motion.div
                      className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 h-full flex flex-col cursor-pointer"
                      whileHover={{ y: -8 }}
                      onClick={() => navigate(`/travel-package/${pkg.id}`)}
                    >
                      <div className="relative overflow-hidden h-52">
                        <img
                          src={pkg.image_url}
                          alt={pkg.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        
                        <div className="absolute bottom-4 left-4 right-4">
                          {pkg.price && (
                            <div className="flex items-baseline gap-2">
                              <span className="text-xl font-bold text-white">
                                ¥{pkg.price}
                              </span>
                              <span className="text-white/80 text-sm">
                                {pkg.price_unit || '元/人'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                          {pkg.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1">
                          {truncateText(pkg.description, 60)}
                        </p>

                        <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                          {pkg.duration && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{pkg.duration}</span>
                            </div>
                          )}
                          {pkg.departure_city && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{pkg.departure_city}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {packages.length === 0 && featuredPackages.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
                <Tag className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">暂无旅行团产品</h3>
              <p className="text-gray-500">请稍后再来查看</p>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-20 text-center"
          >
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-3xl p-12 border border-orange-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                需要定制行程？
              </h3>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                我们提供专业的定制旅游服务，根据您的需求量身打造专属行程方案。
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-5 h-5 text-orange-500" />
                  <span className="font-medium">咨询热线：400-123-4567</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
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
    </div>
  );
};

export default TravelPackagesPage;
