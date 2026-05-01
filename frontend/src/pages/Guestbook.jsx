import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, User, Mail, Phone, MapPin, Loader2, CheckCircle, Clock, X, ChevronDown, MessageCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getGuestbooks, createGuestbook } from '../services/api';
import { useI18n } from '../i18n';

const countries = [
  { value: '', labelKey: 'guestbook.pleaseSelectCountry' },
  { value: '中国', labelKey: 'guestbook.countries.china' },
  { value: '美国', labelKey: 'guestbook.countries.usa' },
  { value: '日本', labelKey: 'guestbook.countries.japan' },
  { value: '韩国', labelKey: 'guestbook.countries.korea' },
  { value: '英国', labelKey: 'guestbook.countries.uk' },
  { value: '法国', labelKey: 'guestbook.countries.france' },
  { value: '德国', labelKey: 'guestbook.countries.germany' },
  { value: '加拿大', labelKey: 'guestbook.countries.canada' },
  { value: '澳大利亚', labelKey: 'guestbook.countries.australia' },
  { value: '其他', labelKey: 'guestbook.countries.other' },
];

const provinces = [
  { value: '', labelKey: 'guestbook.pleaseSelectProvince' },
  { value: '北京市', labelKey: 'guestbook.provinces.beijing' },
  { value: '上海市', labelKey: 'guestbook.provinces.shanghai' },
  { value: '广东省', labelKey: 'guestbook.provinces.guangdong' },
  { value: '浙江省', labelKey: 'guestbook.provinces.zhejiang' },
  { value: '江苏省', labelKey: 'guestbook.provinces.jiangsu' },
  { value: '四川省', labelKey: 'guestbook.provinces.sichuan' },
  { value: '湖北省', labelKey: 'guestbook.provinces.hubei' },
  { value: '湖南省', labelKey: 'guestbook.provinces.hunan' },
  { value: '河南省', labelKey: 'guestbook.provinces.henan' },
  { value: '河北省', labelKey: 'guestbook.provinces.hebei' },
  { value: '山东省', labelKey: 'guestbook.provinces.shandong' },
  { value: '山西省', labelKey: 'guestbook.provinces.shanxi' },
  { value: '陕西省', labelKey: 'guestbook.provinces.shaanxi' },
  { value: '福建省', labelKey: 'guestbook.provinces.fujian' },
  { value: '安徽省', labelKey: 'guestbook.provinces.anhui' },
  { value: '江西省', labelKey: 'guestbook.provinces.jiangxi' },
  { value: '广西壮族自治区', labelKey: 'guestbook.provinces.guangxi' },
  { value: '云南省', labelKey: 'guestbook.provinces.yunnan' },
  { value: '贵州省', labelKey: 'guestbook.provinces.guizhou' },
  { value: '重庆市', labelKey: 'guestbook.provinces.chongqing' },
  { value: '天津市', labelKey: 'guestbook.provinces.tianjin' },
  { value: '辽宁省', labelKey: 'guestbook.provinces.liaoning' },
  { value: '吉林省', labelKey: 'guestbook.provinces.jilin' },
  { value: '黑龙江省', labelKey: 'guestbook.provinces.heilongjiang' },
  { value: '甘肃省', labelKey: 'guestbook.provinces.gansu' },
  { value: '青海省', labelKey: 'guestbook.provinces.qinghai' },
  { value: '海南省', labelKey: 'guestbook.provinces.hainan' },
  { value: '台湾省', labelKey: 'guestbook.provinces.taiwan' },
  { value: '内蒙古自治区', labelKey: 'guestbook.provinces.innerMongolia' },
  { value: '新疆维吾尔自治区', labelKey: 'guestbook.provinces.xinjiang' },
  { value: '西藏自治区', labelKey: 'guestbook.provinces.tibet' },
  { value: '宁夏回族自治区', labelKey: 'guestbook.provinces.ningxia' },
  { value: '香港特别行政区', labelKey: 'guestbook.provinces.hongkong' },
  { value: '澳门特别行政区', labelKey: 'guestbook.provinces.macau' },
  { value: '其他', labelKey: 'guestbook.countries.other' },
];

const Guestbook = () => {
  const { t, language } = useI18n();
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
        setError(t('guestbook.loadFailed'));
      } finally {
        setLoading(false);
      }
    };

    fetchGuestbooks();
  }, [language, t]);

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
      setError(t('guestbook.pleaseFill'));
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
      setError(err.response?.data?.error || t('guestbook.submitFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const localeMap = { zh: 'zh-CN', en: 'en-US', ja: 'ja-JP', ko: 'ko-KR' };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(localeMap[language] || 'zh-CN', {
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
                {t('guestbook.title')}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
                {t('guestbook.subtitle')}
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
                <p className="text-green-700 font-medium">{t('guestbook.submitSuccess')}</p>
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
                  {t('guestbook.latestMessages')}
                </h2>
              </div>
              <motion.button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-400 to-amber-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MessageSquare className="w-5 h-5" />
                {t('guestbook.leaveMessage')}
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
                <p className="text-gray-500 text-lg">{t('guestbook.noMessages')}</p>
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
                        <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
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
                        
                        {guestbook.reply_content && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-500">
                                <MessageCircle className="w-3.5 h-3.5 text-white" />
                              </div>
                              <span className="font-semibold text-amber-800 text-sm">{t('guestbook.adminReply')}</span>
                              {guestbook.replied_at && (
                                <span className="text-xs text-amber-500">
                                  {formatDate(guestbook.replied_at)}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed pl-8">
                              {guestbook.reply_content}
                            </p>
                          </motion.div>
                        )}
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
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="pointer-events-auto w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[calc(100vh-2rem)] md:max-h-[calc(100vh-3rem)]"
              >
                <div className="bg-gradient-to-r from-orange-400 to-amber-500 px-6 py-4 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-6 h-6" />
                    {t('guestbook.postMessage')}
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
                          {t('guestbook.name')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder={t('guestbook.enterName')}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Mail className="w-4 h-4 inline mr-1" />
                          {t('guestbook.email')}
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder={t('guestbook.enterEmail')}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Phone className="w-4 h-4 inline mr-1" />
                          {t('guestbook.phone')}
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder={t('guestbook.enterPhone')}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <MapPin className="w-4 h-4 inline mr-1" />
                          {t('guestbook.country')}
                        </label>
                        <div className="relative">
                          <select
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all appearance-none bg-white pr-10"
                          >
                            {countries.map(c => (
                              <option key={c.value} value={c.value}>{t(c.labelKey)}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <MapPin className="w-4 h-4 inline mr-1" />
                          {t('guestbook.province')}
                        </label>
                        <div className="relative">
                          <select
                            name="province"
                            value={formData.province}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all appearance-none bg-white pr-10"
                          >
                            {provinces.map(p => (
                              <option key={p.value} value={p.value}>{t(p.labelKey)}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MessageSquare className="w-4 h-4 inline mr-1" />
                        {t('guestbook.message')} <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder={t('guestbook.enterMessage')}
                        rows={5}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all resize-none"
                        required
                      />
                      <p className="text-xs text-gray-400 mt-2">
                        {t('guestbook.charCount', { count: formData.message.length })}
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
                        {t('common.cancel')}
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
                            {t('guestbook.submitting')}
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            {t('guestbook.submitMessage')}
                          </>
                        )}
                      </motion.button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Guestbook;
