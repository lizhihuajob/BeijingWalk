import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, User, Mail, Phone, MapPin, Loader2, CheckCircle, Clock, X, ChevronDown } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getGuestbooks, createGuestbook } from '../services/api';

const countries = [
  { value: '', label: '请选择国家' },
  { value: '中国', label: '中国' },
  { value: '美国', label: '美国' },
  { value: '日本', label: '日本' },
  { value: '韩国', label: '韩国' },
  { value: '英国', label: '英国' },
  { value: '法国', label: '法国' },
  { value: '德国', label: '德国' },
  { value: '加拿大', label: '加拿大' },
  { value: '澳大利亚', label: '澳大利亚' },
  { value: '其他', label: '其他' },
];

const provinces = [
  { value: '', label: '请选择省市' },
  { value: '北京市', label: '北京市' },
  { value: '上海市', label: '上海市' },
  { value: '广东省', label: '广东省' },
  { value: '浙江省', label: '浙江省' },
  { value: '江苏省', label: '江苏省' },
  { value: '四川省', label: '四川省' },
  { value: '湖北省', label: '湖北省' },
  { value: '湖南省', label: '湖南省' },
  { value: '河南省', label: '河南省' },
  { value: '河北省', label: '河北省' },
  { value: '山东省', label: '山东省' },
  { value: '山西省', label: '山西省' },
  { value: '陕西省', label: '陕西省' },
  { value: '福建省', label: '福建省' },
  { value: '安徽省', label: '安徽省' },
  { value: '江西省', label: '江西省' },
  { value: '广西壮族自治区', label: '广西壮族自治区' },
  { value: '云南省', label: '云南省' },
  { value: '贵州省', label: '贵州省' },
  { value: '重庆市', label: '重庆市' },
  { value: '天津市', label: '天津市' },
  { value: '辽宁省', label: '辽宁省' },
  { value: '吉林省', label: '吉林省' },
  { value: '黑龙江省', label: '黑龙江省' },
  { value: '甘肃省', label: '甘肃省' },
  { value: '青海省', label: '青海省' },
  { value: '海南省', label: '海南省' },
  { value: '台湾省', label: '台湾省' },
  { value: '内蒙古自治区', label: '内蒙古自治区' },
  { value: '新疆维吾尔自治区', label: '新疆维吾尔自治区' },
  { value: '西藏自治区', label: '西藏自治区' },
  { value: '宁夏回族自治区', label: '宁夏回族自治区' },
  { value: '香港特别行政区', label: '香港特别行政区' },
  { value: '澳门特别行政区', label: '澳门特别行政区' },
  { value: '其他', label: '其他' },
];

const Guestbook = () => {
  const [guestbooks, setGuestbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    province: '',
    message: ''
  });

  useEffect(() => {
    const fetchGuestbooks = async () => {
      try {
        setLoading(true);
        const data = await getGuestbooks();
        setGuestbooks(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch guestbooks:', err);
        setError('加载留言失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchGuestbooks();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.message.trim()) {
      setError('请填写姓名和留言内容');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const newGuestbook = await createGuestbook({
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        country: formData.country || null,
        province: formData.province || null,
        message: formData.message.trim()
      });
      
      setGuestbooks(prev => [newGuestbook, ...prev]);
      setFormData({ name: '', email: '', phone: '', country: '', province: '', message: '' });
      setShowSuccess(true);
      setShowModal(false);
      
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to submit guestbook:', err);
      setError(err.response?.data?.error || '提交留言失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAvatarColor = (name) => {
    const colors = [
      'from-amber-400 to-orange-500',
      'from-red-400 to-pink-500',
      'from-blue-400 to-indigo-500',
      'from-green-400 to-emerald-500',
      'from-purple-400 to-violet-500'
    ];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

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
                <MessageSquare className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
                留言板
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
                留下您的宝贵意见和建议，分享您的北京之旅感受
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-8 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-green-700 font-medium">留言提交成功！感谢您的留言。</p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></div>
                <h2 className="text-2xl font-bold text-gray-900">
                  最新留言
                </h2>
              </div>
              <motion.button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-400 to-amber-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MessageSquare className="w-5 h-5" />
                我要留言
              </motion.button>
            </div>

            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : guestbooks.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">暂无留言，快来发表第一条留言吧！</p>
              </div>
            ) : (
              <div className="space-y-6">
                {guestbooks.map((guestbook, index) => (
                  <motion.div
                    key={guestbook.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarColor(guestbook.name)} flex items-center justify-center flex-shrink-0 shadow-md`}>
                        <span className="text-white font-bold text-lg">
                          {guestbook.name?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-1">
                          <h4 className="font-bold text-gray-900">
                            {guestbook.name}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(guestbook.created_at)}
                            </span>
                            {guestbook.country && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {guestbook.country}{guestbook.province ? ` · ${guestbook.province}` : ''}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-600 leading-relaxed mb-3">
                          {guestbook.message}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          {guestbook.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {guestbook.email}
                            </span>
                          )}
                          {guestbook.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {guestbook.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl z-50 bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-orange-400 to-amber-500 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-6 h-6" />
                  发表留言
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
                    <p className="text-red-700">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-1" />
                        姓名 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="请输入您的姓名"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="w-4 h-4 inline mr-1" />
                        邮箱（可选）
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="请输入您的邮箱"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      手机号（可选）
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="请输入您的手机号"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        国家（可选）
                      </label>
                      <div className="relative">
                        <select
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all appearance-none bg-white pr-10"
                        >
                          {countries.map(c => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        省市（可选）
                      </label>
                      <div className="relative">
                        <select
                          name="province"
                          value={formData.province}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all appearance-none bg-white pr-10"
                        >
                          {provinces.map(p => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MessageSquare className="w-4 h-4 inline mr-1" />
                      留言内容 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="请输入您想说的话..."
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all resize-none"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      字符数：{formData.message.length} 字
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <motion.button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      取消
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-400 to-amber-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      whileHover={!submitting ? { scale: 1.02 } : undefined}
                      whileTap={!submitting ? { scale: 0.98 } : undefined}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          提交中...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          提交留言
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Guestbook;
