import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Calendar, Award, Users, Play, Loader2 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getHeritageById } from '../services/api';

const HeritageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [heritage, setHeritage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchHeritage = async () => {
      try {
        setLoading(true);
        const data = await getHeritageById(id);
        setHeritage(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch heritage:', err);
        setError('加载详情失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchHeritage();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-lg">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !heritage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600 text-lg mb-4">{error || '未找到该非遗信息'}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors"
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
            src={heritage.image_url}
            alt={heritage.name}
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
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-4xl">{heritage.icon}</span>
              </div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-bold text-white"
              >
                {heritage.name}
              </motion.h1>
            </div>
            <span className="inline-block px-4 py-1 bg-amber-500/80 text-white rounded-full text-sm font-medium">
              非物质文化遗产
            </span>
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
              <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-7 h-7 text-amber-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">历史悠久</h3>
              <p className="text-sm text-gray-500">传承千年的技艺</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <div className="w-14 h-14 rounded-xl bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                <Award className="w-7 h-7 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">国家级非遗</h3>
              <p className="text-sm text-gray-500">重点保护项目</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-orange-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">传承有序</h3>
              <p className="text-sm text-gray-500">代代相传的文化</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-1 h-8 bg-amber-500 rounded-full"></span>
              详细介绍
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              {heritage.description}
            </p>
            
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 mt-8">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                非遗小知识
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  非物质文化遗产是各族人民世代相承、与群众生活密切相关的各种传统文化表现形式
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  保护和利用非物质文化遗产，对传承和弘扬民族精神、促进民族团结具有重要意义
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  欢迎大家共同保护和传承这些宝贵的文化遗产
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
                <span className="w-1 h-8 bg-amber-500 rounded-full"></span>
                非遗视频
              </h2>
            </div>
            <div className="relative aspect-video bg-gray-900">
              {!isPlaying ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src={heritage.image_url}
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
                    点击播放非遗介绍视频
                  </p>
                </div>
              ) : (
                <iframe
                  src={videoUrl}
                  title={`${heritage.name} 介绍视频`}
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
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
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

export default HeritageDetail;
