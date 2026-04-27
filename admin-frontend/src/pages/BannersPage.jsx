import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Loader2, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';
import { bannerApi } from '../services/api';
import ContentModal from '../components/ContentModal';

const modalFields = [
  { name: 'title', label: '标题', type: 'text', placeholder: '请输入标题', required: true },
  { name: 'image_url', label: '图片URL', type: 'text', placeholder: '请输入图片URL', required: true },
  { name: 'description', label: '描述', type: 'textarea', placeholder: '请输入描述' },
  { name: 'order', label: '排序', type: 'number', placeholder: '数字越小越靠前', defaultValue: 0 },
  { name: 'is_active', label: '状态', type: 'checkbox', checkboxLabel: '启用' },
];

function BannersPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await bannerApi.getAll();
      setItems(response.data);
    } catch (error) {
      console.error('Failed to fetch banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    if (editingItem) {
      await bannerApi.update(editingItem.id, data);
    } else {
      await bannerApi.create(data);
    }
    fetchItems();
  };

  const handleDelete = async (id) => {
    await bannerApi.delete(id);
    setDeleteConfirm(null);
    fetchItems();
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setModalOpen(true);
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
        <h1 className="text-2xl font-bold text-gray-900">轮播图管理</h1>
        <button onClick={openAddModal} className="admin-btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          添加轮播图
        </button>
      </div>

      <div className="admin-card">
        <div className="divide-y divide-gray-100">
          {items.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              暂无轮播图数据，点击上方按钮添加
            </div>
          ) : (
            items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 flex items-center gap-6 hover:bg-gray-50 transition-colors"
              >
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-48 h-24 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="192" height="96" viewBox="0 0 192 96"%3E%3Crect fill="%23f1f5f9" width="192" height="96"/%3E%3Ctext fill="%2394a3b8" font-family="sans-serif" font-size="12" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3E图片加载失败%3C/text%3E%3C/svg%3E';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900 truncate">{item.title}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      item.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {item.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {item.is_active ? '已启用' : '已禁用'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 truncate">{item.description || '暂无描述'}</p>
                  <p className="text-xs text-gray-400 mt-1">排序: {item.order}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(item)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <ContentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        title={editingItem ? '编辑轮播图' : '添加轮播图'}
        fields={modalFields}
        initialData={editingItem}
      />

      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setDeleteConfirm(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">确认删除</h3>
              <p className="text-gray-600 mb-6">
                确定要删除轮播图「<span className="font-medium">{deleteConfirm.title}</span>」吗？此操作无法撤销。
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="admin-btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm.id)}
                  className="admin-btn-danger"
                >
                  确认删除
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default BannersPage;
