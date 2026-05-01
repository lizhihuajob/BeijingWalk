import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Star, Play, Loader2, Pause, Volume2, VolumeX } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getCultureById } from '../services/api';
import { trackContentView } from '../services/analytics';
import { useI18n } from '../i18n';

const CultureDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useI18n();
  const [culture, setCulture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = React.useRef(null);

  useEffect(() => {
    const fetchCulture = async () => {
      try {
        setLoading(true);
        const data = await getCultureById(id);
        setCulture(data);
        void trackContentView({
          contentType: 'culture',
          contentId: Number(id),
          pageUrl: `/culture/${id}`,
        });
        setError(null);
      } catch (err) {
        console.error('Failed to fetch culture:', err);
        setError(t('error.loadDetailFailed'));
      } finally {
        setLoading(false);
      }
    };

    fetchCulture();
  }, [id, language, t]);

  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
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

  if (error || !culture) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600 text-lg mb-4">{error || t('error.notFound')}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
            >
              {t('common.returnHome')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20">
        <div className="fixed top-20 right-4 md:right-8 z-40">
          <motion.button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full shadow-lg hover:bg-white transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">{t('common.back')}</span>
          </motion.button>
        </div>

        <div className="relative h-[600px] md:h-[700px]">
          <img
            src={culture.image_url}
            alt={culture.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
          
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center px-4"
            >
              <motion.h1
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight drop-shadow-lg"
              >
                {culture.title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed"
              >
                {culture.description?.substring(0, 80)}...
              </motion.p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-4">
              <span className="w-2 h-12 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></span>
              {t('cultureDetail.introduction')}
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              {culture.description}
            </p>
            {culture.details && (
              <div className="bg-amber-50 rounded-2xl p-6 mt-6">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">{t('cultureDetail.moreBackground')}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {culture.details}
                </p>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl shadow-xl overflow-hidden mb-12"
          >
            <div className="p-8 md:p-12 pb-0">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-4">
                <span className="w-2 h-12 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></span>
                {t('cultureDetail.video')}
              </h2>
            </div>
            <div className="relative aspect-video bg-gray-900 group">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                poster={culture.image_url}
                muted={isMuted}
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
              >
                <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
                <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4" />
                {t('common.browserNotSupported')}
              </video>
              
              {!isVideoPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <motion.button
                    onClick={toggleVideoPlay}
                    className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play className="w-12 h-12 text-white ml-2" />
                  </motion.button>
                  <p className="absolute bottom-8 text-white text-center w-full">
                    {t('cultureDetail.playVideo')}
                  </p>
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-between">
                  <motion.button
                    onClick={toggleVideoPlay}
                    className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isVideoPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </motion.button>
                  <motion.button
                    onClick={toggleMute}
                    className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid md:grid-cols-3 gap-8 mb-16"
          >
            <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('cultureDetail.longHistory')}</h3>
              <p className="text-gray-500">{t('cultureDetail.culturalTreasure')}</p>
            </div>
            <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('cultureDetail.nationalEssence')}</h3>
              <p className="text-gray-500">{t('cultureDetail.culturalRepresentative')}</p>
            </div>
            <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-yellow-100 flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('cultureDetail.beijingFeature')}</h3>
              <p className="text-gray-500">{t('cultureDetail.culturalSymbol')}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <motion.button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-orange-400 to-amber-500 text-white font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-6 h-6" />
              {t('cultureDetail.returnHomeExplore')}
            </motion.button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CultureDetail;
