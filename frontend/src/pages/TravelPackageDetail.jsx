import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, MapPin, Clock, DollarSign, Star, Loader2, 
  CheckCircle, XCircle, MessageCircle, X, Send, User, Bot,
  Calendar, Users, Phone, Mail, ChevronRight, Info, AlertCircle
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  getTravelPackageById, 
  initChatSession, 
  getChatMessages, 
  sendChatMessage, 
  pollChatMessages 
} from '../services/api';
import { trackContentView } from '../services/analytics';
import { useI18n } from '../i18n';

const generateVisitorId = () => {
  return 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

const TravelPackageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useI18n();
  const [travelPackage, setTravelPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showChat, setShowChat] = useState(false);
  const [chatSessionId, setChatSessionId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [visitorId, setVisitorId] = useState(null);
  const [lastMessageId, setLastMessageId] = useState(0);
  const messagesEndRef = React.useRef(null);
  const pollIntervalRef = React.useRef(null);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        setLoading(true);
        const data = await getTravelPackageById(id);
        setTravelPackage(data);
        void trackContentView({
          contentType: 'travel_package',
          contentId: Number(id),
          pageUrl: `/travel-package/${id}`,
        });
        setError(null);
      } catch (err) {
        console.error('Failed to fetch travel package:', err);
        setError('加载产品详情失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [id, language]);

  useEffect(() => {
    const storedVisitorId = localStorage.getItem('chat_visitor_id');
    if (storedVisitorId) {
      setVisitorId(storedVisitorId);
    } else {
      const newVisitorId = generateVisitorId();
      setVisitorId(newVisitorId);
      localStorage.setItem('chat_visitor_id', newVisitorId);
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, scrollToBottom]);

  useEffect(() => {
    if (chatSessionId && showChat) {
      pollIntervalRef.current = setInterval(async () => {
        try {
          const result = await pollChatMessages(chatSessionId, lastMessageId);
          if (result.messages && result.messages.length > 0) {
            setChatMessages(prev => [...prev, ...result.messages]);
            const maxId = Math.max(...result.messages.map(m => m.id));
            setLastMessageId(maxId);
          }
        } catch (err) {
          console.error('Poll chat error:', err);
        }
      }, 3000);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [chatSessionId, showChat, lastMessageId]);

  const initChat = async () => {
    if (chatSessionId) {
      setShowChat(true);
      return;
    }

    try {
      setChatLoading(true);
      const result = await initChatSession({
        travel_package_id: Number(id),
        visitor_id: visitorId,
        visitor_name: visitorName || '游客',
      });
      
      setChatSessionId(result.session_id);
      setShowChat(true);
      
      setChatMessages([{
        id: 0,
        sender_type: 'admin',
        sender_name: '客服',
        content: '您好！欢迎咨询关于 "' + (travelPackage?.title || '该产品') + '" 的相关问题，请问有什么可以帮您的吗？',
        created_at: new Date().toISOString(),
      }]);
    } catch (err) {
      console.error('Init chat error:', err);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !chatSessionId) return;

    const content = chatInput.trim();
    setChatInput('');

    const tempMessage = {
      id: Date.now(),
      session_id: chatSessionId,
      sender_type: 'visitor',
      sender_id: visitorId,
      sender_name: visitorName || '游客',
      message_type: 'text',
      content: content,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    setChatMessages(prev => [...prev, tempMessage]);

    try {
      const result = await sendChatMessage(chatSessionId, {
        content: content,
        visitor_name: visitorName || '游客',
      });
      
      setChatMessages(prev => 
        prev.map(m => m.id === tempMessage.id ? result : m)
      );
      setLastMessageId(result.id);
    } catch (err) {
      console.error('Send message error:', err);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
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

  if (error || !travelPackage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600 text-lg mb-4">{error || '产品不存在'}</p>
            <button
              onClick={() => navigate('/travel-packages')}
              className="px-6 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
            >
              返回旅行团列表
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
            onClick={() => navigate('/travel-packages')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full shadow-lg hover:bg-white transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">返回列表</span>
          </motion.button>
        </div>

        <div className="relative h-[500px] md:h-[600px]">
          <img
            src={travelPackage.image_url}
            alt={travelPackage.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
          
          <div className="absolute inset-0 flex items-end justify-center pb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center px-4 max-w-4xl"
            >
              <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                {travelPackage.is_featured && (
                  <span className="inline-flex items-center gap-1 px-4 py-2 bg-orange-500 text-white rounded-full text-sm font-bold">
                    <Star className="w-4 h-4 fill-current" />
                    推荐产品
                  </span>
                )}
                {travelPackage.duration && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm">
                    <Clock className="w-4 h-4" />
                    {travelPackage.duration}
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                {travelPackage.title}
              </h1>
              
              {travelPackage.subtitle && (
                <p className="text-xl md:text-2xl text-white/90 mb-8">
                  {travelPackage.subtitle}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center gap-6">
                {travelPackage.price && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl md:text-5xl font-bold text-white">
                      ¥{travelPackage.price}
                    </span>
                    <span className="text-white/80 text-lg">
                      {travelPackage.price_unit || '元/人'}
                    </span>
                  </div>
                )}
                {travelPackage.discount_price && (
                  <div className="text-white/60 text-xl line-through">
                    ¥{travelPackage.discount_price}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-3xl shadow-xl p-8 mb-12"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold text-white mb-2">对这个产品感兴趣？</h3>
                <p className="text-white/80">点击咨询按钮，与客服实时沟通了解更多详情</p>
              </div>
              <motion.button
                onClick={initChat}
                disabled={chatLoading}
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-orange-600 font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {chatLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <MessageCircle className="w-6 h-6" />
                )}
                在线咨询
              </motion.button>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white rounded-3xl shadow-xl p-8 md:p-12"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-4">
                  <span className="w-2 h-8 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></span>
                  产品介绍
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {travelPackage.description}
                </p>
              </motion.div>

              {travelPackage.highlights && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-3xl shadow-xl p-8 md:p-12"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-4">
                    <span className="w-2 h-8 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></span>
                    行程亮点
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {(Array.isArray(travelPackage.highlights) ? travelPackage.highlights : []).map((highlight, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 + index * 0.05 }}
                        className="flex items-start gap-3 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl"
                      >
                        <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{highlight}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {travelPackage.itinerary && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-3xl shadow-xl p-8 md:p-12"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-4">
                    <span className="w-2 h-8 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></span>
                    详细行程
                  </h2>
                  <div className="space-y-6">
                    {(Array.isArray(travelPackage.itinerary) ? travelPackage.itinerary : []).map((day, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 + index * 0.1 }}
                        className="relative pl-8 pb-6 border-l-2 border-orange-200 last:border-l-0"
                      >
                        <div className="absolute left-0 top-0 -translate-x-1/2 w-8 h-8 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                          {index + 1}
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-6 ml-4">
                          <h3 className="text-lg font-bold text-gray-900 mb-3">
                            {day.title || `第${index + 1}天`}
                          </h3>
                          {day.activities && (
                            <div className="space-y-3">
                              {(Array.isArray(day.activities) ? day.activities : []).map((activity, actIndex) => (
                                <div key={actIndex} className="flex items-start gap-2 text-gray-600">
                                  <ChevronRight className="w-4 h-4 text-orange-400 flex-shrink-0 mt-1" />
                                  <span>{activity}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {day.description && (
                            <p className="text-gray-600 mt-3">{day.description}</p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {travelPackage.inclusion && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white rounded-3xl shadow-xl p-8 md:p-12"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-4">
                    <span className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></span>
                    费用包含
                  </h2>
                  <div className="grid md:grid-cols-2 gap-3">
                    {(Array.isArray(travelPackage.inclusion) ? travelPackage.inclusion : []).map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {travelPackage.exclusion && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                  className="bg-white rounded-3xl shadow-xl p-8 md:p-12"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-4">
                    <span className="w-2 h-8 bg-gradient-to-b from-red-500 to-rose-500 rounded-full"></span>
                    费用不含
                  </h2>
                  <div className="grid md:grid-cols-2 gap-3">
                    {(Array.isArray(travelPackage.exclusion) ? travelPackage.exclusion : []).map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {travelPackage.notes && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white rounded-3xl shadow-xl p-8 md:p-12"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-4">
                    <span className="w-2 h-8 bg-gradient-to-b from-amber-500 to-yellow-500 rounded-full"></span>
                    温馨提示
                  </h2>
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700 leading-relaxed">{travelPackage.notes}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-3xl shadow-xl p-6 sticky top-24"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6">产品信息</h3>
                
                <div className="space-y-4">
                  {travelPackage.duration && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">行程天数</p>
                        <p className="font-medium text-gray-900">{travelPackage.duration}</p>
                      </div>
                    </div>
                  )}

                  {travelPackage.departure_city && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">出发城市</p>
                        <p className="font-medium text-gray-900">{travelPackage.departure_city}</p>
                      </div>
                    </div>
                  )}

                  {travelPackage.destination_city && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                        <Users className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">目的地</p>
                        <p className="font-medium text-gray-900">{travelPackage.destination_city}</p>
                      </div>
                    </div>
                  )}
                </div>

                {(travelPackage.contact_name || travelPackage.contact_phone || travelPackage.contact_email) && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-4">联系方式</h4>
                    <div className="space-y-3">
                      {travelPackage.contact_name && (
                        <div className="flex items-center gap-3 text-gray-600">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>{travelPackage.contact_name}</span>
                        </div>
                      )}
                      {travelPackage.contact_phone && (
                        <div className="flex items-center gap-3 text-gray-600">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{travelPackage.contact_phone}</span>
                        </div>
                      )}
                      {travelPackage.contact_email && (
                        <div className="flex items-center gap-3 text-gray-600">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{travelPackage.contact_email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <motion.button
                  onClick={initChat}
                  disabled={chatLoading}
                  className="w-full mt-6 inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {chatLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <MessageCircle className="w-5 h-5" />
                  )}
                  在线咨询
                </motion.button>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showChat && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowChat(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, y: '100%', scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: '100%', scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-4 right-4 w-full md:w-96 h-[70vh] max-h-[600px] bg-white rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
            >
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">在线客服</h4>
                    <p className="text-white/80 text-sm">关于 "{travelPackage.title}"</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChat(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {chatMessages.map((msg, index) => (
                  <motion.div
                    key={msg.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.sender_type === 'visitor' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-end gap-2 max-w-[80%] ${msg.sender_type === 'visitor' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.sender_type === 'visitor' 
                          ? 'bg-orange-100' 
                          : 'bg-blue-100'
                      }`}>
                        {msg.sender_type === 'visitor' ? (
                          <User className="w-4 h-4 text-orange-600" />
                        ) : (
                          <Bot className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <div className={`px-4 py-3 rounded-2xl ${
                          msg.sender_type === 'visitor'
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-br-sm'
                            : 'bg-white text-gray-700 shadow-sm rounded-bl-sm'
                        }`}>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        <p className={`text-xs text-gray-400 mt-1 ${
                          msg.sender_type === 'visitor' ? 'text-right' : 'text-left'
                        }`}>
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
                {!chatSessionId ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500">请输入您的昵称开始咨询</p>
                    <input
                      type="text"
                      value={visitorName}
                      onChange={(e) => setVisitorName(e.target.value)}
                      placeholder="请输入您的昵称"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    />
                    <motion.button
                      onClick={initChat}
                      disabled={chatLoading}
                      className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {chatLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                      ) : (
                        '开始咨询'
                      )}
                    </motion.button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="输入消息..."
                      className="flex-1 px-4 py-3 bg-gray-100 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    />
                    <motion.button
                      onClick={handleSendMessage}
                      disabled={!chatInput.trim()}
                      className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: chatInput.trim() ? 1.1 : 1 }}
                      whileTap={{ scale: chatInput.trim() ? 0.9 : 1 }}
                    >
                      <Send className="w-5 h-5" />
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default TravelPackageDetail;
