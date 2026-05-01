import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Scroll, ArrowRight, Loader2, ChevronUp, ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getCultures } from '../services/api';
import { useI18n } from '../i18n';

const CulturePage = () => {
  const navigate = useNavigate();
  const { t, language } = useI18n();
  const [cultures, setCultures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getCultures();
        setCultures(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch cultures:', err);
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

  const truncateText = (text, maxLength = 150) => {
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
        <div className="relative h-80 md:h-96 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 overflow-hidden">
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center px-4"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm mb-6">
                <Scroll className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
                {t('culture.title')}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
                {t('culture.subtitle')}
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
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent"></div>
              <p className="text-gray-500 text-sm uppercase tracking-widest">
                {t('culture.totalItems', { count: cultures.length })}
              </p>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent"></div>
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

          <div className="space-y-16">
            {cultures.map((culture, index) => (
              <motion.div
                key={culture.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`flex flex-col ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'
                } gap-8 lg:gap-16 items-stretch`}
              >
                <div className="w-full lg:w-1/2">
                  <motion.div
                    className="relative group h-72 md:h-80 lg:h-96 rounded-3xl overflow-hidden shadow-xl"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
                    <img
                      src={culture.image_url}
                      alt={culture.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
                    <div className="absolute top-6 left-6">
                      <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">{index + 1}</span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="w-full lg:w-1/2 flex flex-col justify-center">
                  <div className="bg-white rounded-3xl p-8 md:p-10 shadow-lg border border-gray-100 h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></div>
                      <span className="text-orange-600 text-sm font-medium uppercase tracking-wider">
                        {t('culture.culturalHeritage')}
                      </span>
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
                      {culture.title}
                    </h2>
                    
                    <p className="text-gray-600 text-lg leading-relaxed mb-6">
                      {truncateText(culture.description, 200)}
                    </p>
                    
                    {culture.details && (
                      <div className="bg-amber-50 rounded-2xl p-6 mb-8">
                        <h3 className="font-semibold text-gray-900 mb-3 text-lg">{t('culture.cultureBackground')}</h3>
                        <p className="text-gray-600 leading-relaxed">
                          {truncateText(culture.details, 120)}
                        </p>
                      </div>
                    )}

                    <motion.button
                      onClick={() => navigate(`/culture/${culture.id}`)}
                      className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-400 to-amber-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 self-start"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {t('culture.learnMore')}
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-20 text-center"
          >
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-12 border border-amber-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {t('culture.exploreMoreTitle')}
              </h3>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                {t('culture.exploreMoreSubtitle')}
              </p>
              <motion.button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-400 to-amber-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5" />
                {t('culture.backToHome')}
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

export default CulturePage;
