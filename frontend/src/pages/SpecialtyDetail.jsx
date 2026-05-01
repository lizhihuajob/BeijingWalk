import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, MapPin, DollarSign, Play, Loader2, Pause, Volume2, VolumeX } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getSpecialtyById } from '../services/api';
import { trackContentView } from '../services/analytics';
import { useI18n } from '../i18n';

const SpecialtyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useI18n();
  const [specialty, setSpecialty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = React.useRef(null);

  useEffect(() => {
    const fetchSpecialty = async () => {
      try {
        setLoading(true);
        const data = await getSpecialtyById(id);
        setSpecialty(data);
        void trackContentView({
          contentType: 'specialty',
          contentId: Number(id),
          pageUrl: `/specialty/${id}`,
        });
        setError(null);
      } catch (err) {
        console.error('Failed to fetch specialty:', err);
        setError(t('error.loadDetailFailed'));
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialty();
  }, [id, language, t]);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="w-5 h-5 text-yellow-400 fill-current opacity-50" />);
      } else {
        stars.push(<Star key={i} className="w-5 h-5 text-gray-300" />);
      }
    }
    return stars;
  };

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
            <Loader2 className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-lg">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !specialty) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600 text-lg mb-4">{error || t('error.notFound')}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
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
            src={specialty.image_url}
            alt={specialty.name}
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
                {specialty.name}
              </motion.h1>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex items-center justify-center gap-4"
              >
                <div className="flex items-center gap-1">
                  {renderStars(specialty.rating)}
                </div>
                <span className="text-xl text-white/90 font-semibold">
                  {t('specialtyDetail.ratingScore', { rating: specialty.rating })}
                </span>
              </motion.div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-3 gap-8 mb-12"
          >
            <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('specialtyDetail.userRating')}</h3>
              <p className="text-2xl font-bold text-red-500">{specialty.rating}</p>
              <p className="text-gray-500">{t('specialtyDetail.outOf5')}</p>
            </div>
            <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-pink-100 flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-8 h-8 text-pink-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('specialtyDetail.origin')}</h3>
              <p className="text-lg text-gray-600">{t('specialtyDetail.beijing')}</p>
              <p className="text-gray-500">{t('specialtyDetail.authenticBeijing')}</p>
            </div>
            <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto mb-6">
                <DollarSign className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('specialtyDetail.recommend')}</h3>
              <p className="text-lg text-gray-600">{t('specialtyDetail.mustTry')}</p>
              <p className="text-gray-500">{t('specialtyDetail.notToMiss')}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-4">
              <span className="w-2 h-12 bg-gradient-to-b from-red-500 to-pink-500 rounded-full"></span>
              {t('specialtyDetail.introduction')}
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              {specialty.description}
            </p>
            
            <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 mt-8">
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">{t('specialtyDetail.tips')}</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  {t('specialtyDetail.tip1')}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  {t('specialtyDetail.tip2')}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  {t('specialtyDetail.tip3')}
                </li>
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-3xl shadow-xl overflow-hidden mb-12"
          >
            <div className="p-8 md:p-12 pb-0">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-4">
                <span className="w-2 h-12 bg-gradient-to-b from-red-500 to-pink-500 rounded-full"></span>
                {t('specialtyDetail.foodVideo')}
              </h2>
            </div>
            <div className="relative aspect-video bg-gray-900 group">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                poster={specialty.image_url}
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
                    {t('specialtyDetail.playVideo')}
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
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <motion.button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-red-400 to-pink-500 text-white font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-6 h-6" />
              {t('specialtyDetail.returnHomeExplore')}
            </motion.button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SpecialtyDetail;
