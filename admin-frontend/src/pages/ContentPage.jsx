import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, Loader2, Plus, Edit2, Image as ImageIcon, 
  BookOpen, Utensils, MapPin, Palette, Check, X
} from 'lucide-react';
import { 
  bannerApi, cultureApi, specialtyApi, scenicApi, heritageApi 
} from '../services/api';
import ContentModal from '../components/ContentModal';

const contentTypes = [
  { key: 'banners', label: '轮播图管理', icon: ImageIcon, api: bannerApi },
  { key: 'cultures', label: '文化内容', icon: BookOpen, api: cultureApi },
  { key: 'specialties', label: '特色内容', icon: Utensils, api: specialtyApi },
  { key: 'scenic_spots', label: '景点管理', icon: MapPin, api: scenicApi },
  { key: 'heritages', label: '非遗遗产', icon: Palette, api: heritageApi },
];

const getFields = (contentType) => {
  switch (contentType) {
    case 'banners':
      return [
        { name: 'title', label: '标题', type: 'text', required: true },
        { name: 'image_url', label: '图片URL', type: 'text', required: true },
        { name: 'description', label: '描述', type: 'textarea' },
        { name: 'order', label: '排序', type: 'number', defaultValue: 0 },
        { name: 'is_active', label: '是否启用', type: 'checkbox', defaultValue: true, checkboxLabel: '启用' },
      ];
    case 'cultures':
      return [
        { name: 'title', label: '标题', type: 'text', required: true },
        { name: 'image_url', label: '图片URL', type: 'text', required: true },
        { name: 'description', label: '描述', type: 'textarea', required: true },
        { name: 'details', label: '详细内容', type: 'textarea' },
        { name: 'order', label: '排序', type: 'number', defaultValue: 0 },
        { name: 'is_active', label: '是否启用', type: 'checkbox', defaultValue: true, checkboxLabel: '启用' },
      ];
    case 'specialties':
      return [
        { name: 'name', label: '名称', type: 'text', required: true },
        { name: 'image_url', label: '图片URL', type: 'text', required: true },
        { name: 'description', label: '描述', type: 'textarea', required: true },
        { name: 'rating', label: '评分', type: 'number', defaultValue: 4.5 },
        { name: 'order', label: '排序', type: 'number', defaultValue: 0 },
        { name: 'is_active', label: '是否启用', type: 'checkbox', defaultValue: true, checkboxLabel: '启用' },
      ];
    case 'scenic_spots':
      return [
        { name: 'name', label: '名称', type: 'text', required: true },
        { name: 'image_url', label: '图片URL', type: 'text', required: true },
        { name: 'description', label: '描述', type: 'textarea', required: true },
        { name: 'location', label: '位置', type: 'text' },
        { name: 'latitude', label: '纬度', type: 'number' },
        { name: 'longitude', label: '经度', type: 'number' },
        { name: 'recommended_duration', label: '推荐游览时间', type: 'text' },
        { name: 'ticket_price_peak', label: '旺季门票价格', type: 'text' },
        { name: 'ticket_price_off_peak', label: '淡季门票价格', type: 'text' },
        { name: 'ticket_url', label: '购票链接', type: 'text' },
        { name: 'is_featured', label: '是否推荐', type: 'checkbox', defaultValue: false, checkboxLabel: '推荐景点' },
        { name: 'order', label: '排序', type: 'number', defaultValue: 0 },
        { name: 'is_active', label: '是否启用', type: 'checkbox', defaultValue: true, checkboxLabel: '启用' },
      ];
    case 'heritages':
      return [
        { name: 'name', label: '名称', type: 'text', required: true },
        { name: 'icon', label: '图标', type: 'text', defaultValue: '🎨' },
        { name: 'image_url', label: '图片URL', type: 'text', required: true },
        { name: 'description', label: '描述', type: 'textarea', required: true },
        { name: 'order', label: '排序', type: 'number', defaultValue: 0 },
        { name: 'is_active', label: '是否启用', type: 'checkbox', defaultValue: true, checkboxLabel: '启用' },
      ];
    default:
      return [];
  }
};

function ContentPage() {
  const [activeType, setActiveType] = useState('banners');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const currentType = contentTypes.find(t => t.key === activeType);
  const fields = getFields(activeType);

  useEffect(() => { fetchItems(); }, [activeType]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const api = currentType.api;
      const response = await api.getAll();
      setItems(Array.isArray(response.data) ? response.data : []);
      setError('');
    } catch (error) {
      setItems([]);
      setError(error.response?.data?.error || '数据加载失败，请重新登录后重试');
      console.error('Failed to fetch items:', error);
    } finally { setLoading(false); }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    const api = currentType.api;
    if (editingItem) {
      await api.update(editingItem.id, formData);
    } else {
      await api.create(formData);
    }
    fetchItems();
  };

  const handleDelete = async (id) => {
    const api = currentType.api;
    await api.delete(id);
    setDeleteConfirm(null);
    fetchItems();
  };

  const toggleActive = async (item) => {
    try {
      const api = currentType.api;
      await api.update(item.id, { is_active: !item.is_active });
      fetchItems();
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const getItemTitle = (item) => {
    return item.title || item.name || '未命名';
  };

  const getItemImage = (item) => {
    return item.image_url;
  };

  if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">内容管理</h1>
        <button
          onClick={handleCreate}
          className="admin-btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新增{currentType.label.replace('管理', '')}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        {contentTypes.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.key}
              onClick={() => setActiveType(type.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeType === type.key
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {type.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {error ? (
          <div className="p-12 text-center text-red-500 admin-card">{error}</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-gray-500 admin-card">
            暂无{currentType.label.replace('管理', '')}数据
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`admin-card overflow-hidden ${!item.is_active ? 'opacity-60' : ''}`}
              >
                {getItemImage(item) && (
                  <div className="aspect-video bg-gray-100 relative overflow-hidden">
                    <img
                      src={getItemImage(item)}
                      alt={getItemTitle(item)}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {getItemTitle(item)}
                    </h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                      item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {item.is_active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      {item.is_active ? '已启用' : '已禁用'}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(item)}
                      className={`p-2 rounded-lg transition-colors ${
                        item.is_active
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      title={item.is_active ? '禁用' : '启用'}
                    >
                      {item.is_active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="编辑"
                    >
                      <Edit2 className="w-4 h-4" />
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
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
              <h3 className="text-lg font-bold text-gray-900 mb-2">确认删除</h3>
              <p className="text-gray-600 mb-6">
                确定要删除 <span className="font-medium">{getItemTitle(deleteConfirm)}</span> 吗？
              </p>
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="admin-btn-secondary">取消</button>
                <button onClick={() => handleDelete(deleteConfirm.id)} className="admin-btn-danger">确认删除</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ContentModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null); }}
        onSubmit={handleSubmit}
        title={editingItem ? `编辑${currentType.label.replace('管理', '')}` : `新增${currentType.label.replace('管理', '')}`}
        fields={fields}
        initialData={editingItem || {}}
      />
    </div>
  );
}

export default ContentPage;