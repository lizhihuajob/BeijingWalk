import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Clock, MapPin, DollarSign, Play, Loader2 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getSpecialtyById } from '../services/api';

const SpecialtyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [specialty, setSpecialty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchSpecialty = async () => {
      try {
        setLoading(true);
        const data = await getSpecialtyById(id);
        setSpecialty(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch specialty:', err);
        setError('加载详情失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialty();
  }, [id]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-lg">加载中...</p>
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
            <p className="text-gray-600 text-lg mb-4">{error || '未找到该特产信息'}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              返回首页
            </button>
          </div>
        </div>
      </div>
    );
  }

  const videoUrl = `https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=${isPlaying ? 1 : 0}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20">
        <div className="relative h-96 md:h-[500px]">
          <img
            src={specialty.image_url}
            alt={specialty.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <motion.button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors mb-6"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeft className="w-4 h-4" />
              返回
            </motion.button>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold text-white mb-4"
            >
              {specialty.name}
            </motion.h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {renderStars(specialty.rating)}
              </div>
              <span className="text-white/80 text-lg">
                {specialty.rating}分
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-3 gap-6 mb-12"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <div className="w-14 h-14 rounded-xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Star className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">用户评分</h3>
              <p className="text-2xl font-bold text-red-500">{specialty.rating}</p>
              <p className="text-sm text-gray-500">满分5分</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <div className="w-14 h-14 rounded-xl bg-pink-100 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-7 h-7 text-pink-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">产地</h3>
              <p className="text-lg text-gray-600">北京</p>
              <p className="text-sm text-gray-500">地道北京味</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <div className="w-14 h-14 rounded-xl bg-rose-100 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-7 h-7 text-rose-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">推荐</h3>
              <p className="text-lg text-gray-600">必尝美食</p>
              <p className="text-sm text-gray-500">不容错过</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-1 h-8 bg-red-500 rounded-full"></span>
              详细介绍
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              {specialty.description}
            </p>
            
            <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 mt-8">
              <h3 className="font-semibold text-gray-900 mb-3">小贴士</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  建议在正规店铺品尝，确保品质
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  可以作为伴手礼带给亲朋好友
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  注意保质期，新鲜食用最佳
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
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-1 h-8 bg-red-500 rounded-full"></span>
                美食视频
              </h2>
            </div>
            <div className="relative aspect-video bg-gray-900">
              {!isPlaying ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src={specialty.image_url}
                    alt="视频封面"
                    className="w-full h-full object-cover opacity-50"
                  />
                  <motion.button
                    onClick={() => setIsPlaying(true)}
                    className="absolute w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play className="w-10 h-10 text-white ml-1" />
                  </motion.button>
                  <p className="absolute bottom-8 text-white text-center">
                    点击播放美食介绍视频
                  </p>
                </div>
              ) : (
                <iframe
                  src={videoUrl}
                  title={`${specialty.name} 介绍视频`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
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
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-400 to-pink-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5" />
              返回首页探索更多
            </motion.button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SpecialtyDetail;
