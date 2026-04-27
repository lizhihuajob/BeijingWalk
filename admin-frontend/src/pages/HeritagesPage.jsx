import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Loader2, Eye, EyeOff } from 'lucide-react';
import { heritageApi } from '../services/api';
import ContentModal from '../components/ContentModal';

const modalFields = [
  { name: 'name', label: '名称', type: 'text', placeholder: '请输入非遗项目名称', required: true },
  { name: 'icon', label: '图标', type: 'text', placeholder: '请输入图标emoji，如：🎨', defaultValue: '🎨' },
  { name: 'image_url', label: '图片URL', type: 'text', placeholder: '请输入图片URL', required: true },
  { name: 'description', label: '描述', type: 'textarea', placeholder: '请输入描述', required: true },
  { name: 'order', label: '排序', type: 'number', placeholder: '数字越小越靠前', defaultValue: 0 },
  { name: 'is_active', label: '状态', type: 'checkbox', checkboxLabel: '启用' },
];

function HeritagesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await heritageApi.getAll();
      setItems(response.data);
    } finally { setLoading(false); }
  };

  const handleSubmit = async (data) => {
    if (editingItem) await heritageApi.update(editingItem.id, data);
    else await heritageApi.create(data);
    fetchItems();
  };

  const handleDelete = async (id) => {
    await heritageApi.delete(id);
    setDeleteConfirm(null);
    fetchItems();
  };

  if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">非物质文化遗产管理</h1>
        <button onClick={() => { setEditingItem(null); setModalOpen(true); }} className="admin-btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />添加非遗项目
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.length === 0 ? (
          <div className="col-span-full p-12 text-center text-gray-500 admin-card">暂无非遗项目数据</div>
        ) : items.map((item) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="admin-card overflow-hidden">
            <div className="relative">
              <img src={item.image_url} alt={item.name} className="w-full h-48 object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
              <div className="absolute top-4 left-4 w-12 h-12 bg-white/90 backdrop-blur rounded-lg flex items-center justify-center text-2xl shadow-lg">
                {item.icon}
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {item.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {item.is_active ? '已启用' : '已禁用'}
                </span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-3 mb-4">{item.description}</p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-400">排序: {item.order}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setEditingItem(item); setModalOpen(true); }} className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteConfirm(item)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <ContentModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} title={editingItem ? '编辑非遗项目' : '添加非遗项目'} fields={modalFields} initialData={editingItem} />

      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
              <h3 className="text-lg font-bold text-gray-900 mb-2">确认删除</h3>
              <p className="text-gray-600 mb-6">确定要删除非遗项目「<span className="font-medium">{deleteConfirm.name}</span>」吗？</p>
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

export default HeritagesPage;
