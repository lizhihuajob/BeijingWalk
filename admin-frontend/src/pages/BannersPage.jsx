import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Loader2, Image as ImageIcon, Eye } from 'lucide-react';
import { bannerApi } from '../services/api';
import ContentModal from '../components/ContentModal';

function BannersPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const modalFields = [
    { name: 'title', label: '标题', type: 'text', required: true, placeholder: '请输入标题' },
    { name: 'image_url', label: '图片URL', type: 'text', required: true, placeholder: '请输入图片URL' },
    { name: 'description', label: '描述', type: 'textarea', rows: 3, placeholder: '请输入描述' },
    { name: 'order', label: '排序', type: 'number', defaultValue: 0, placeholder: '数字越小越靠前' },
    { name: 'is_active', label: '启用状态', type: 'checkbox', checkboxLabel: '启用此轮播图' },
  ];

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await bannerApi.getAll();
      setItems(Array.isArray(response.data) ? response.data : []);
      setError('');
    } catch (error) {
      setItems([]);
      setError(error.response?.data?.error || '数据加载失败，请重新登录后重试');
      console.error('Failed to fetch banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    if (editItem) {
      await bannerApi.update(editItem.id, formData);
    }
    fetchItems();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">轮播图管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理首页轮播展示的图片</p>
        </div>
        <span className="text-sm text-gray-500">共 {items.length} 个轮播图</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {error ? (
          <div className="col-span-full p-12 text-center text-red-500 admin-card">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="col-span-full p-12 text-center text-gray-500 admin-card">
            暂无轮播图数据
          </div>
        ) : (
          items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="admin-card overflow-hidden"
            >
              <div className="relative aspect-video bg-gray-100">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/800x450/e2e8f0/94a3b8?text=图片加载失败';
                  }}
                />
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    item.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {item.is_active ? '已启用' : '已禁用'}
                  </span>
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white hover:text-primary-600 rounded-lg transition-colors shadow-sm"
                    title="编辑"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm text-gray-200 mt-1 line-clamp-2">{item.description}</p>
                  )}
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    排序: {item.order}
                  </span>
                  <span className="flex items-center gap-1">
                    <ImageIcon className="w-4 h-4" />
                    ID: {item.id}
                  </span>
                </div>
                <button
                  onClick={() => handleEdit(item)}
                  className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  <Edit3 className="w-4 h-4" />
                  编辑
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <ContentModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditItem(null);
            }}
            onSubmit={handleSubmit}
            title={editItem ? '编辑轮播图' : '添加轮播图'}
            fields={modalFields}
            initialData={editItem || {}}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default BannersPage;
