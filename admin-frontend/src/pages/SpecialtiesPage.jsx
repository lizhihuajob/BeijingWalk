import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Loader2, Eye, ShoppingBag, Star } from 'lucide-react';
import { specialtyApi } from '../services/api';
import ContentModal from '../components/ContentModal';

function SpecialtiesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const modalFields = [
    { name: 'name', label: '特产名称', type: 'text', required: true, placeholder: '请输入特产名称' },
    { name: 'image_url', label: '图片URL', type: 'text', required: true, placeholder: '请输入图片URL' },
    { name: 'description', label: '描述', type: 'textarea', rows: 4, required: true, placeholder: '请输入特产描述' },
    { name: 'rating', label: '评分', type: 'number', defaultValue: 4.5, step: '0.1', placeholder: '0-5 之间的小数' },
    { name: 'order', label: '排序', type: 'number', defaultValue: 0, placeholder: '数字越小越靠前' },
    { name: 'is_active', label: '启用状态', type: 'checkbox', checkboxLabel: '启用此内容' },
  ];

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await specialtyApi.getAll();
      setItems(Array.isArray(response.data) ? response.data : []);
      setError('');
    } catch (error) {
      setItems([]);
      setError(error.response?.data?.error || '数据加载失败，请重新登录后重试');
      console.error('Failed to fetch specialties:', error);
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
      await specialtyApi.update(editItem.id, formData);
    }
    fetchItems();
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalf) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }
    return stars;
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
          <h1 className="text-2xl font-bold text-gray-900">地方特产</h1>
          <p className="text-sm text-gray-500 mt-1">管理北京地方特产展示</p>
        </div>
        <span className="text-sm text-gray-500">共 {items.length} 条内容</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {error ? (
          <div className="col-span-full p-12 text-center text-red-500 admin-card">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="col-span-full p-12 text-center text-gray-500 admin-card">
            暂无特产数据
          </div>
        ) : (
          items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="admin-card overflow-hidden flex flex-col"
            >
              <div className="relative aspect-video bg-gray-100">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/400x300/e2e8f0/94a3b8?text=图片加载失败';
                  }}
                />
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    item.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {item.is_active ? '已启用' : '已禁用'}
                  </span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingBag className="w-4 h-4 text-orange-500" />
                  <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                </div>
                <div className="flex items-center gap-1 mb-3">
                  {renderStars(item.rating)}
                  <span className="text-sm text-gray-500 ml-1">{item.rating}</span>
                </div>
                <p className="text-gray-600 text-sm line-clamp-3 flex-1">{item.description}</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      排序: {item.order}
                    </span>
                  </div>
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm"
                  >
                    <Edit3 className="w-4 h-4" />
                    编辑
                  </button>
                </div>
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
            title={editItem ? '编辑特产信息' : '添加特产信息'}
            fields={modalFields}
            initialData={editItem || {}}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default SpecialtiesPage;
