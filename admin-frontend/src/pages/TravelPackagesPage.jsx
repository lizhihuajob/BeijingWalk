import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, Loader2, Plus, Edit, Eye, EyeOff, 
  Star, StarOff, ChevronDown, ChevronUp,
  MapPin, Clock, DollarSign, Users, Send, X
} from 'lucide-react';
import { travelPackageApi } from '../services/api';

const defaultFormData = {
  title: '',
  subtitle: '',
  image_url: '',
  description: '',
  price: '',
  price_unit: '元/人',
  discount_price: '',
  duration: '',
  departure_city: '',
  destination_city: '',
  highlights: '',
  itinerary: '',
  inclusion: '',
  exclusion: '',
  notes: '',
  contact_phone: '',
  contact_email: '',
  contact_name: '',
  order: 0,
  is_featured: false,
  is_active: true,
};

function TravelPackagesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState('');
  const [formModal, setFormModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ ...defaultFormData });
  const [formSaving, setFormSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState({ basic: true, itinerary: true, contact: false });
  const [highlightInput, setHighlightInput] = useState('');

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await travelPackageApi.getAll();
      setItems(Array.isArray(response.data) ? response.data : []);
      setError('');
    } catch (error) {
      setItems([]);
      setError(error.response?.data?.error || '数据加载失败');
      console.error('Failed to fetch travel packages:', error);
    } finally { setLoading(false); }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({ ...defaultFormData });
    setHighlightInput('');
    setFormModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setHighlightInput('');
    setFormData({
      title: item.title || '',
      subtitle: item.subtitle || '',
      image_url: item.image_url || '',
      description: item.description || '',
      price: item.price || '',
      price_unit: item.price_unit || '元/人',
      discount_price: item.discount_price || '',
      duration: item.duration || '',
      departure_city: item.departure_city || '',
      destination_city: item.destination_city || '',
      highlights: Array.isArray(item.highlights) ? item.highlights.join('\n') : '',
      itinerary: Array.isArray(item.itinerary) ? JSON.stringify(item.itinerary, null, 2) : '',
      inclusion: Array.isArray(item.inclusion) ? item.inclusion.join('\n') : '',
      exclusion: Array.isArray(item.exclusion) ? item.exclusion.join('\n') : '',
      notes: item.notes || '',
      contact_phone: item.contact_phone || '',
      contact_email: item.contact_email || '',
      contact_name: item.contact_name || '',
      order: item.order || 0,
      is_featured: item.is_featured || false,
      is_active: item.is_active || true,
    });
    setFormModal(true);
  };

  const handleDelete = async (id) => {
    await travelPackageApi.delete(id);
    setDeleteConfirm(null);
    fetchItems();
  };

  const handleActivate = async (item, activate) => {
    try {
      if (activate) {
        await travelPackageApi.activate(item.id);
      } else {
        await travelPackageApi.deactivate(item.id);
      }
      fetchItems();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleFeature = async (item, feature) => {
    try {
      if (feature) {
        await travelPackageApi.feature(item.id);
      } else {
        await travelPackageApi.unfeature(item.id);
      }
      fetchItems();
    } catch (error) {
      console.error('Failed to update featured status:', error);
    }
  };

  const parseTextLines = (text) => {
    if (!text || !text.trim()) return null;
    return text.split('\n').map(l => l.trim()).filter(l => l);
  };

  const parseItinerary = (text) => {
    if (!text || !text.trim()) return null;
    try {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.image_url || !formData.description) {
      alert('标题、图片URL和描述不能为空');
      return;
    }

    setFormSaving(true);
    try {
      const submitData = {
        title: formData.title,
        subtitle: formData.subtitle,
        image_url: formData.image_url,
        description: formData.description,
        price: formData.price,
        price_unit: formData.price_unit,
        discount_price: formData.discount_price,
        duration: formData.duration,
        departure_city: formData.departure_city,
        destination_city: formData.destination_city,
        highlights: parseTextLines(formData.highlights),
        itinerary: parseItinerary(formData.itinerary),
        inclusion: parseTextLines(formData.inclusion),
        exclusion: parseTextLines(formData.exclusion),
        notes: formData.notes,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email,
        contact_name: formData.contact_name,
        order: Number(formData.order) || 0,
        is_featured: formData.is_featured,
        is_active: formData.is_active,
        status: formData.is_active ? 'active' : 'inactive',
      };

      if (editingItem) {
        await travelPackageApi.update(editingItem.id, submitData);
      } else {
        await travelPackageApi.create(submitData);
      }
      
      setFormModal(false);
      fetchItems();
    } catch (error) {
      console.error('Failed to save travel package:', error);
      alert(error.response?.data?.error || '保存失败');
    } finally {
      setFormSaving(false);
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '-';
    return new Date(timeStr).toLocaleString('zh-CN');
  };

  if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">旅行团产品管理</h1>
        <button
          onClick={openCreateModal}
          className="admin-btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新增产品
        </button>
      </div>

      <div className="grid gap-4">
        {error ? (
          <div className="p-12 text-center text-red-500 admin-card">{error}</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-gray-500 admin-card">暂无产品数据，点击右上角"新增产品"创建第一个产品</div>
        ) : items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="admin-card p-6"
          >
            <div className="flex gap-4">
              <div className="w-32 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                {item.image_url && (
                  <img 
                    src={item.image_url} 
                    alt={item.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{item.title}</h3>
                      {item.is_featured && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                          <Star className="w-3 h-3" />推荐
                        </span>
                      )}
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.is_active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {item.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {item.is_active ? '已上架' : '已下架'}
                      </span>
                    </div>
                    {item.subtitle && (
                      <p className="text-sm text-gray-500 mt-1">{item.subtitle}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="编辑"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleActivate(item, !item.is_active)}
                      className={`p-2 rounded-lg transition-colors ${
                        item.is_active
                          ? 'text-orange-600 hover:bg-orange-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={item.is_active ? '下架' : '上架'}
                    >
                      {item.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => {
                        if (item.is_featured) {
                          travelPackageApi.unfeature(item.id).then(fetchItems);
                        } else {
                          travelPackageApi.feature(item.id).then(fetchItems);
                        }
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        item.is_featured
                          ? 'text-amber-600 hover:bg-amber-50'
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      title={item.is_featured ? '取消推荐' : '设为推荐'}
                    >
                      {item.is_featured ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(item)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-600 flex-wrap">
                  {item.price && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-green-600">{item.price}</span>
                      <span>{item.price_unit || '元/人'}</span>
                      {item.discount_price && (
                        <span className="text-gray-400 line-through ml-1">{item.discount_price}</span>
                      )}
                    </div>
                  )}
                  {item.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{item.duration}</span>
                    </div>
                  )}
                  {item.departure_city && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{item.departure_city}</span>
                      {item.destination_city && <span>→ {item.destination_city}</span>}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>浏览 {item.view_count || 0}</span>
                  </div>
                  <span className="text-gray-400">创建于 {formatTime(item.created_at)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
              <h3 className="text-lg font-bold text-gray-900 mb-2">确认删除</h3>
              <p className="text-gray-600 mb-6">
                确定要删除产品 <span className="font-medium">{deleteConfirm.title}</span> 吗？
              </p>
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="admin-btn-secondary">取消</button>
                <button onClick={() => handleDelete(deleteConfirm.id)} className="admin-btn-danger">确认删除</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {formModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setFormModal(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 20 }} 
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingItem ? '编辑产品' : '新增产品'}
                </h3>
                <button
                  onClick={() => setFormModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="bg-gray-50 rounded-lg">
                  <button
                    onClick={() => toggleSection('basic')}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span className="font-semibold text-gray-900">基本信息</span>
                    {expandedSections.basic ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {expandedSections.basic && (
                    <div className="p-4 pt-0 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            产品标题 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="例如：北京5日深度游"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">副标题</label>
                          <input
                            type="text"
                            value={formData.subtitle}
                            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                            placeholder="一句话简短描述"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            图片URL <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            placeholder="https://example.com/image.jpg"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            产品描述 <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="详细描述该旅行团产品"
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">价格</label>
                          <input
                            type="text"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            placeholder="例如：2999"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">价格单位</label>
                          <input
                            type="text"
                            value={formData.price_unit}
                            onChange={(e) => setFormData({ ...formData, price_unit: e.target.value })}
                            placeholder="元/人"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">原价（划掉显示）</label>
                          <input
                            type="text"
                            value={formData.discount_price}
                            onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                            placeholder="例如：3999"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">行程天数</label>
                          <input
                            type="text"
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                            placeholder="例如：5天4晚"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">出发城市</label>
                          <input
                            type="text"
                            value={formData.departure_city}
                            onChange={(e) => setFormData({ ...formData, departure_city: e.target.value })}
                            placeholder="例如：北京"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">目的城市</label>
                          <input
                            type="text"
                            value={formData.destination_city}
                            onChange={(e) => setFormData({ ...formData, destination_city: e.target.value })}
                            placeholder="例如：上海"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
                          <input
                            type="number"
                            value={formData.order}
                            onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.is_featured}
                            onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700">设为推荐</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700">上架显示</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg">
                  <button
                    onClick={() => toggleSection('itinerary')}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span className="font-semibold text-gray-900">行程详情</span>
                    {expandedSections.itinerary ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {expandedSections.itinerary && (
                    <div className="p-4 pt-0 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">行程亮点（每行一条）</label>
                        <textarea
                          value={formData.highlights}
                          onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                          placeholder="全程五星酒店&#10;专业导游讲解&#10;含景点门票"
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">详细行程（JSON 格式）</label>
                        <p className="text-xs text-gray-500 mb-1">
                          {`格式示例：[{"day": "第一天", "title": "抵达北京", "activities": ["接机入住", "自由活动"]}]`}
                        </p>
                        <textarea
                          value={formData.itinerary}
                          onChange={(e) => setFormData({ ...formData, itinerary: e.target.value })}
                          placeholder='[{"day":"第一天","title":"抵达北京","activities":["接机入住","自由活动"]}]'
                          rows={8}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">费用包含（每行一条）</label>
                          <textarea
                            value={formData.inclusion}
                            onChange={(e) => setFormData({ ...formData, inclusion: e.target.value })}
                            placeholder="行程内交通&#10;景点首道门票&#10;4晚四星酒店"
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">费用不含（每行一条）</label>
                          <textarea
                            value={formData.exclusion}
                            onChange={(e) => setFormData({ ...formData, exclusion: e.target.value })}
                            placeholder="各地到北京往返机票&#10;个人消费&#10;单房差"
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">温馨提示</label>
                        <textarea
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          placeholder="出行前请携带有效身份证件..."
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg">
                  <button
                    onClick={() => toggleSection('contact')}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span className="font-semibold text-gray-900">联系方式</span>
                    {expandedSections.contact ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {expandedSections.contact && (
                    <div className="p-4 pt-0 grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">联系人</label>
                        <input
                          type="text"
                          value={formData.contact_name}
                          onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                          placeholder="例如：张经理"
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">联系电话</label>
                        <input
                          type="text"
                          value={formData.contact_phone}
                          onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                          placeholder="例如：010-12345678"
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">联系邮箱</label>
                        <input
                          type="email"
                          value={formData.contact_email}
                          onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                          placeholder="例如：contact@example.com"
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
                <button 
                  onClick={() => setFormModal(false)} 
                  className="admin-btn-secondary"
                  disabled={formSaving}
                >
                  取消
                </button>
                <button 
                  onClick={handleSubmit} 
                  className="admin-btn-primary flex items-center gap-2"
                  disabled={formSaving}
                >
                  {formSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {formSaving ? '保存中...' : '保存产品'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TravelPackagesPage;