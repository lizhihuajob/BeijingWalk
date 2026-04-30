import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, Globe, MapPin, Phone, Mail, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { siteConfigApi } from '../services/api';

function SiteConfigPage() {
  const [formData, setFormData] = useState({
    site_name: '',
    site_description: '',
    contact_address: '',
    contact_phone: '',
    contact_email: '',
    copyright_text: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => { fetchConfig(); }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const response = await siteConfigApi.get();
      if (response.data) {
        setFormData({
          site_name: response.data.site_name || '',
          site_description: response.data.site_description || '',
          contact_address: response.data.contact_address || '',
          contact_phone: response.data.contact_phone || '',
          contact_email: response.data.contact_email || '',
          copyright_text: response.data.copyright_text || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch site config:', error);
    } finally { setLoading(false); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      await siteConfigApi.save(formData);
      setMessage({ type: 'success', text: '保存成功！' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Failed to save site config:', error);
      setMessage({ type: 'error', text: '保存失败，请稍后重试' });
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">网站配置</h1>
      </div>

      {message.text && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{message.text}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="admin-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary-600" />
            基本信息
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">网站名称</label>
              <input
                type="text"
                name="site_name"
                value={formData.site_name}
                onChange={handleChange}
                className="admin-input w-full"
                placeholder="例如：北京旅游"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">网站描述</label>
              <textarea
                name="site_description"
                value={formData.site_description}
                onChange={handleChange}
                rows={3}
                className="admin-input w-full"
                placeholder="例如：探索千年古都的魅力，感受历史与现代的完美交融..."
              />
            </div>
          </div>
        </div>

        <div className="admin-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-600" />
            联系方式
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />联系地址
              </label>
              <input
                type="text"
                name="contact_address"
                value={formData.contact_address}
                onChange={handleChange}
                className="admin-input w-full"
                placeholder="例如：北京市东城区"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />联系电话
              </label>
              <input
                type="text"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleChange}
                className="admin-input w-full"
                placeholder="例如：400-123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />联系邮箱
              </label>
              <input
                type="email"
                name="contact_email"
                value={formData.contact_email}
                onChange={handleChange}
                className="admin-input w-full"
                placeholder="例如：info@beijingwalk.com"
              />
            </div>
          </div>
        </div>

        <div className="admin-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            其他配置
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">版权信息</label>
            <input
              type="text"
              name="copyright_text"
              value={formData.copyright_text}
              onChange={handleChange}
              className="admin-input w-full"
              placeholder="例如：© 2024 北京旅游. All rights reserved."
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="admin-btn-primary flex items-center gap-2 px-8 py-3 text-base"
          >
            {saving ? (
              <><Loader2 className="w-5 h-5 animate-spin" />保存中...</>
            ) : (
              <><Save className="w-5 h-5" />保存配置</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SiteConfigPage;
