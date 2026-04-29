import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, MapPin, Clock, Ticket, Calendar, Play, Loader2, Pause, 
  Volume2, VolumeX, ExternalLink, Info, DollarSign, Sun, Moon,
  ChevronRight, AlertCircle
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getScenicSpotById } from '../services/api';
import { trackContentView } from '../services/analytics';

const ScenicSpotDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scenicSpot, setScenicSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = React.useRef(null);

  useEffect(() => {
    const fetchScenicSpot = async () => {
      try {
        setLoading(true);
        const data = await getScenicSpotById(id);
        setScenicSpot(data);
        void trackContentView({
          contentType: 'scenic_spot',
          contentId: Number(id),
          pageUrl: `/scenic-spot/${id}`,
        });
        setError(null);
      } catch (err) {
        console.error('Failed to fetch scenic spot:', err);
        setError('加载详情失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchScenicSpot();
  }, [id]);

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

  const handleBuyTicket = () => {
    if (scenicSpot?.ticket_url) {
      window.open(scenicSpot.ticket_url, '_blank', 'noopener,noreferrer');
    } else {
      navigate(`/ticket-guide/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-lg">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !scenicSpot) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600 text-lg mb-4">{error || '未找到该景点信息'}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            >
              返回首页
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
            <span className="text-sm font-medium">返回</span>
          </motion.button>
        </div>

        <div className="relative h-[600px] md:h-[700px]">
          <img
            src={scenicSpot.image_url}
            alt={scenicSpot.name}
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
                {scenicSpot.name}
              </motion.h1>
              {scenicSpot.is_featured && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="inline-block px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-lg font-medium"
                >
                  推荐景点
                </motion.span>
              )}
            </motion.div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-4 gap-6 mb-12"
          >
            <div className="bg-white rounded-3xl shadow-lg p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">位置</h3>
              <p className="text-gray-500">{scenicSpot.location || '北京市'}</p>
            </div>
            <div className="bg-white rounded-3xl shadow-lg p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-indigo-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">推荐游览</h3>
              <p className="text-gray-500">{scenicSpot.recommended_duration || '建议2-3小时'}</p>
            </div>
            <div className="bg-white rounded-3xl shadow-lg p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <Ticket className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">门票价格</h3>
              <p className="text-gray-500">
                {scenicSpot.ticket_price_peak || '需购票入场'}
              </p>
            </div>
            <div className="bg-white rounded-3xl shadow-lg p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-violet-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">开放状态</h3>
              <p className="text-gray-500">{scenicSpot.opening_status || '正常开放'}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-xl p-8 mb-12"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold text-white mb-2">准备好开始您的旅程了吗？</h3>
                <p className="text-white/80">立即预订门票，避免排队等待</p>
              </div>
              <motion.button
                onClick={handleBuyTicket}
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-indigo-600 font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Ticket className="w-6 h-6" />
                立即购票
                <ExternalLink className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl shadow-xl overflow-hidden mb-12"
          >
            <div className="p-8 md:p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-4">
                <span className="w-2 h-12 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></span>
                门票信息
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Sun className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">旺季（4月1日-10月31日）</h4>
                      <p className="text-2xl font-bold text-amber-600">
                        {scenicSpot.ticket_price_peak || '请咨询景区'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Moon className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">淡季（11月1日-3月31日）</h4>
                      <p className="text-2xl font-bold text-slate-600">
                        {scenicSpot.ticket_price_off_peak || '请咨询景区'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-500" />
                    门票说明
                  </h3>
                  
                  {scenicSpot.ticket_additional_info ? (
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {scenicSpot.ticket_additional_info}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <p className="text-gray-600">请通过官方渠道了解最新门票价格及优惠政策。</p>
                    </div>
                  )}

                  {scenicSpot.ticket_url && (
                    <div className="mt-4">
                      <button
                        onClick={handleBuyTicket}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-full hover:shadow-lg transition-all duration-300"
                      >
                        <Ticket className="w-5 h-5" />
                        查看购票指南
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white rounded-3xl shadow-xl overflow-hidden mb-12"
          >
            <div className="p-8 md:p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-4">
                <span className="w-2 h-12 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></span>
                开放时间
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  {scenicSpot.opening_hours_peak && (
                    <div className="flex items-start gap-4 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
                      <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Sun className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">旺季（4月1日-10月31日）</h4>
                        <p className="text-gray-700 leading-relaxed">
                          {scenicSpot.opening_hours_peak}
                        </p>
                      </div>
                    </div>
                  )}

                  {scenicSpot.opening_hours_off_peak && (
                    <div className="flex items-start gap-4 p-6 bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <Moon className="w-6 h-6 text-slate-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">淡季（11月1日-3月31日）</h4>
                        <p className="text-gray-700 leading-relaxed">
                          {scenicSpot.opening_hours_off_peak}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  {scenicSpot.additional_opening_notes && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-amber-800 mb-2">温馨提示</h4>
                          <p className="text-amber-700 leading-relaxed">
                            {scenicSpot.additional_opening_notes}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-4">
              <span className="w-2 h-12 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></span>
              景点介绍
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              {scenicSpot.description}
            </p>
            
            {(() => {
              let tips = [];
              if (scenicSpot.tips) {
                try {
                  tips = typeof scenicSpot.tips === 'string' ? JSON.parse(scenicSpot.tips) : scenicSpot.tips;
                } catch (e) {
                  console.error('Failed to parse tips:', e);
                }
              }
              
              if (!tips || tips.length === 0) {
                tips = [
                  '建议提前网上预约，避开高峰期游览',
                  '穿着舒适的鞋子，景区较大',
                  '可以请导游讲解，了解更多历史故事',
                ];
              }
              
              return (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mt-8">
                  <h3 className="font-semibold text-gray-900 mb-3 text-lg">游览小贴士</h3>
                  <ul className="space-y-2 text-gray-600">
                    {tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })()}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-white rounded-3xl shadow-xl overflow-hidden mb-12"
          >
            <div className="p-8 md:p-12 pb-0">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-4">
                <span className="w-2 h-12 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></span>
                景点视频
              </h2>
            </div>
            <div className="relative aspect-video bg-gray-900 group">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                poster={scenicSpot.image_url}
                muted={isMuted}
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
              >
                <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
                <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4" />
                您的浏览器不支持视频播放
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
                    点击播放景点介绍视频
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
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-400 to-purple-500 text-white font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-6 h-6" />
              返回首页探索更多
            </motion.button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ScenicSpotDetail;
