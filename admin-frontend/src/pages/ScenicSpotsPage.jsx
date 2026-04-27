import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Loader2, Eye, EyeOff, Star } from 'lucide-react';
import { scenicApi } from '../services/api';
import ContentModal from '../components/ContentModal';

const modalFields = [
  { name: 'name', label: '名称', type: 'text', placeholder: '请输入景点名称', required: true },
  { name: 'image_url', label: '图片URL', type: 'text', placeholder: '请输入图片URL', required: true },
  { name: 'description', label: '描述', type: 'textarea', placeholder: '请输入描述', required: true },
  { name: 'is_featured', label: '推荐', type: 'checkbox', checkboxLabel: '设为推荐' },
  { name: 'order', label: '排序', type: 'number', placeholder: '数字越小越靠前', defaultValue: 0 },
  { name: 'is_active', label: '状态', type: 'checkbox', checkboxLabel: '启用' },
];

function ScenicSpotsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await scenicApi.getAll();
      setItems(response.data);
    } finally { setLoading(false); }
  };

  const handleSubmit = async (data) => {
    if (editingItem) await scenicApi.update(editingItem.id, data);
    else await scenicApi.create(data);
    fetchItems();
  };

  const handleDelete = async (id) => {
    await scenicApi.delete(id);
    setDeleteConfirm(null);
    fetchItems();
  };

  if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">名胜古迹管理</h1>
        <button onClick={() => { setEditingItem(null); setModalOpen(true); }} className="admin-btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />添加景点
        </button>
      </div>

      <div className="admin-card">
        <div className="divide-y divide-gray-100">
          {items.length === 0 ? (
            <div className="p-12 text-center text-gray-500">暂无景点数据</div>
          ) : items.map((item) => (
            <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 flex items-center gap-6 hover:bg-gray-50 transition-colors">
              <img src={item.image_url} alt={item.name} className="w-40 h-28 object-cover rounded-lg" onError={(e) => { e.target.style.display = 'none'; }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  {item.is_featured && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700"><Star className="w-3 h-3" />推荐</span>}
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {item.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {item.is_active ? '已启用' : '已禁用'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                <p className="text-xs text-gray-400 mt-1">排序: {item.order}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setEditingItem(item); setModalOpen(true); }} className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => setDeleteConfirm(item)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <ContentModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} title={editingItem ? '编辑景点' : '添加景点'} fields={modalFields} initialData={editingItem} />

      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
              <h3 className="text-lg font-bold text-gray-900 mb-2">确认删除</h3>
              <p className="text-gray-600 mb-6">确定要删除景点「<span className="font-medium">{deleteConfirm.name}</span>」吗？</p>
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="admin-btn-secondary">取消</button>
                <button onClick={() => handleDelete(deleteConfirm.id)} className="admin-btn-danger">确认删除</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ScenicSpotsPage;
