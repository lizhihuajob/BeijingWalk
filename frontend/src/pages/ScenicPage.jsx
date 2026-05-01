import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, ArrowRight, Loader2, ChevronUp, ArrowLeft, MapPin, Star, Clock } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getScenicSpots } from '../services/api';
import { useI18n } from '../i18n';

const ScenicPage = () => {
  const navigate = useNavigate();
  const { t, language } = useI18n();
  const [scenicSpots, setScenicSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getScenicSpots();
        setScenicSpots(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch scenic spots:', err);
        setError(t('error.loadFailed'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [language, t]);

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

  const featuredSpot = scenicSpots.find((spot) => spot.is_featured);
  const otherSpots = scenicSpots.filter((spot) => !spot.is_featured);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-lg">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Header />
      
      <main className="pt-20">
        <div className="relative h-80 md:h-96 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500 overflow-hidden">
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center px-4"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm mb-6">
                <Building className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
                {t('scenic.title')}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
                {t('scenic.subtitle')}
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-1 h-12 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t('home.title')}</h2>
                <p className="text-gray-500">{t('scenic.totalSpots', { count: scenicSpots.length })}</p>
              </div>
            </div>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-8 text-center"
            >
              <p className="text-lg">{error}</p>
            </motion.div>
          )}

          {featuredSpot && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-16"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <Star className="w-5 h-5 text-white fill-current" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{t('scenic.featuredSpots')}</h3>
              </div>

              <motion.div
                className="group relative rounded-3xl overflow-hidden shadow-2xl cursor-pointer"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.3 }}
                onClick={() => navigate(`/scenic-spot/${featuredSpot.id}`)}
              >
                <div className="relative h-80 md:h-96 lg:h-[500px]">
                  <img
                    src={featuredSpot.image_url}
                    alt={featuredSpot.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                      ⭐ {t('scenic.featured')}
                    </span>
                    {featuredSpot.location && (
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm">
                        <MapPin className="w-4 h-4" />
                        {featuredSpot.location}
                      </span>
                    )}
                  </div>

                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                    {featuredSpot.name}
                  </h2>
                  
                  <p className="text-white/90 text-lg md:text-xl max-w-3xl mb-6 leading-relaxed">
                    {truncateText(featuredSpot.description, 150)}
                  </p>

                  <motion.button
                    className="inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-900 font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/scenic-spot/${featuredSpot.id}`);
                    }}
                  >
                    {t('home.exploreMore')}
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {otherSpots.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{t('home.viewAll')}</h3>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {otherSpots.map((spot, index) => (
                  <motion.div
                    key={spot.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="group"
                  >
                    <motion.div
                      className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 h-full flex flex-col cursor-pointer"
                      whileHover={{ y: -8 }}
                      onClick={() => navigate(`/scenic-spot/${spot.id}`)}
                    >
                      <div className="relative overflow-hidden h-48">
                        <img
                          src={spot.image_url}
                          alt={spot.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        
                        {spot.location && (
                          <div className="absolute top-4 left-4">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg">
                              <MapPin className="w-3.5 h-3.5 text-blue-500" />
                              <span className="text-xs font-medium text-gray-900">{spot.location}</span>
                            </div>
                          </div>
                        )}

                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-xl font-bold text-white drop-shadow-lg">
                            {spot.name}
                          </h3>
                        </div>
                      </div>

                      <div className="p-6 flex-1 flex flex-col">
                        <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1">
                          {truncateText(spot.description, 80)}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>{t('scenicDetail.tourTips')}</span>
                          </div>
                          <motion.button
                            className="inline-flex items-center gap-1.5 text-blue-500 hover:text-blue-600 text-sm font-semibold transition-colors"
                            whileHover={{ x: 3 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/scenic-spot/${spot.id}`);
                            }}
                          >
                            {t('scenic.viewDetails')}
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

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-20 text-center"
          >
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-12 border border-blue-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {t('culture.exploreMoreTitle')}
              </h3>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                {t('culture.exploreMoreSubtitle')}
              </p>
              <motion.button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-400 to-purple-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5" />
                {t('common.returnHome')}
              </motion.button>
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
            className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center z-50"
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

export default ScenicPage;
