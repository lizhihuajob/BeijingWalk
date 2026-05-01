import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Loader2, ChevronUp, ArrowLeft, Heart, Award, Users } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getHeritages } from '../services/api';
import { useI18n } from '../i18n';

const HeritagePage = () => {
  const navigate = useNavigate();
  const { t, language } = useI18n();
  const [heritages, setHeritages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getHeritages();
        setHeritages(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch heritages:', err);
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

  const truncateText = (text, maxLength = 80) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
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
        <div className="relative h-80 md:h-96 bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 overflow-hidden">
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center px-4"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm mb-6">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
                {t('heritage.title')}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
                {t('heritage.subtitleFull')}
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-3xl p-8 text-center border border-amber-100"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t('heritage.nationalLevel')}</h3>
                <p className="text-gray-500 text-sm">{t('heritage.thousandYearTreasure')}</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-8 text-center border border-orange-100"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t('heritage.craftsmanship')}</h3>
                <p className="text-gray-500 text-sm">{t('heritage.craftsmanDedication')}</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-3xl p-8 text-center border border-yellow-100"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t('heritage.culturalIdentity')}</h3>
                <p className="text-gray-500 text-sm">{t('heritage.spiritualHome')}</p>
              </motion.div>
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-1 h-12 bg-gradient-to-b from-amber-500 to-yellow-500 rounded-full"></div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t('heritage.heritageItems')}</h2>
                <p className="text-gray-500">{t('heritage.totalItems', { count: heritages.length })}</p>
              </div>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {heritages.map((heritage, index) => (
              <motion.div
                key={heritage.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group"
              >
                <motion.div
                  className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 h-full flex flex-col cursor-pointer"
                  whileHover={{ y: -8 }}
                  onClick={() => navigate(`/heritage/${heritage.id}`)}
                >
                  <div className="relative">
                    <div className="absolute top-4 left-4 z-10">
                      <div className="w-14 h-14 rounded-2xl bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-xl border border-white/50">
                        <span className="text-3xl">{heritage.icon}</span>
                      </div>
                    </div>

                    <div className="relative overflow-hidden h-52">
                      <img
                        src={heritage.image_url}
                        alt={heritage.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      
                      <div className="absolute top-4 right-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg">
                          <span className="text-xs font-bold text-white">{index + 1}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-amber-600 transition-colors">
                      {heritage.name}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1">
                      {truncateText(heritage.description, 60)}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span className="text-xs text-amber-600 font-medium">{t('heritage.heritageItem')}</span>
                      </div>
                      <motion.button
                        className="inline-flex items-center gap-1.5 text-amber-600 hover:text-amber-700 text-sm font-semibold transition-colors"
                        whileHover={{ x: 3 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/heritage/${heritage.id}`);
                        }}
                      >
                        {t('heritage.learnMore')}
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-20"
          >
            <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 text-8xl">🎭</div>
                <div className="absolute bottom-10 right-10 text-8xl">🎨</div>
                <div className="absolute top-1/2 left-1/4 text-6xl">✨</div>
              </div>
              
              <div className="relative z-10">
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  {t('heritage.preserveCulture')}
                </h3>
                <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
                  {t('heritage.preserveDescription')}
                </p>
                <motion.button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center gap-2 px-10 py-5 bg-white text-amber-600 font-bold text-lg rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft className="w-6 h-6" />
                  {t('heritage.exploreMoreCulture')}
                </motion.button>
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
            className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-amber-500 to-yellow-500 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center z-50"
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

export default HeritagePage;
