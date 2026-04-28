import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Loader2, Eye, Landmark, Star } from 'lucide-react';
import { scenicApi } from '../services/api';
import ContentModal from '../components/ContentModal';

function ScenicSpotsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const modalFields = [
    { name: 'name', label: '景点名称', type: 'text', required: true, placeholder: '请输入景点名称' },
    { name: 'image_url', label: '图片URL', type: 'text', required: true, placeholder: '请输入图片URL' },
    { name: 'description', label: '描述', type: 'textarea', rows: 4, required: true, placeholder: '请输入景点描述' },
    { name: 'is_featured', label: '推荐景点', type: 'checkbox', checkboxLabel: '设为推荐景点（首页展示）' },
    { name: 'order', label: '排序', type: 'number', defaultValue: 0, placeholder: '数字越小越靠前' },
    { name: 'is_active', label: '启用状态', type: 'checkbox', checkboxLabel: '启用此内容' },
  ];

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await scenicApi.getAll();
      setItems(Array.isArray(response.data) ? response.data : []);
      setError('');
    } catch (error) {
      setItems([]);
      setError(error.response?.data?.error || '数据加载失败，请重新登录后重试');
      console.error('Failed to fetch scenic spots:', error);
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
      await scenicApi.update(editItem.id, formData);
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
          <h1 className="text-2xl font-bold text-gray-900">名胜古迹</h1>
          <p className="text-sm text-gray-500 mt-1">管理北京名胜古迹展示</p>
        </div>
        <span className="text-sm text-gray-500">共 {items.length} 条内容</span>
      </div>

      <div className="space-y-4">
        {error ? (
          <div className="p-12 text-center text-red-500 admin-card">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-gray-500 admin-card">
            暂无景点数据
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
              <div className="flex flex-col md:flex-row">
                <div className="md:w-72 h-48 md:h-auto relative flex-shrink-0">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/288x192/e2e8f0/94a3b8?text=图片加载失败';
                    }}
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    {item.is_featured && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                        <Star className="w-3 h-3 fill-yellow-400" />
                        推荐
                      </span>
                    )}
                  </div>
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
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Landmark className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                        {item.is_featured && (
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        )}
                      </div>
                      <p className="text-gray-600 line-clamp-3">{item.description}</p>
                      <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          排序: {item.order}
                        </span>
                        <span>ID: {item.id}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm"
                      >
                        <Edit3 className="w-4 h-4" />
                        编辑
                      </button>
                    </div>
                  </div>
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
            title={editItem ? '编辑景点信息' : '添加景点信息'}
            fields={modalFields}
            initialData={editItem || {}}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default ScenicSpotsPage;
