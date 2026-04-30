import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Loader2, ArrowUp, ArrowDown, Link2, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { navigationApi } from '../services/api';
import ContentModal from '../components/ContentModal';

const modalFields = [
  { name: 'label', label: '菜单名称', type: 'text', placeholder: '例如：首页', required: true },
  { name: 'path', label: '跳转路径', type: 'text', placeholder: '例如：/ 或 /culture', required: true },
  { name: 'order', label: '排序', type: 'number', placeholder: '数字越小越靠前' },
  { name: 'is_active', label: '状态', type: 'checkbox', checkboxLabel: '启用' },
];

function NavigationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await navigationApi.getAll();
      setItems(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch navigations:', error);
      setItems([]);
    } finally { setLoading(false); }
  };

  const handleSubmit = async (data) => {
    const submitData = {
      ...data,
      order: data.order ? parseInt(data.order) : 0,
    };
    
    try {
      if (editingItem) {
        await navigationApi.update(editingItem.id, submitData);
      } else {
        await navigationApi.create(submitData);
      }
      setMessage({ type: 'success', text: editingItem ? '更新成功！' : '添加成功！' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      fetchItems();
    } catch (error) {
      console.error('Failed to save navigation:', error);
      setMessage({ type: 'error', text: '操作失败，请稍后重试' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await navigationApi.delete(id);
      setDeleteConfirm(null);
      setMessage({ type: 'success', text: '删除成功！' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      fetchItems();
    } catch (error) {
      console.error('Failed to delete navigation:', error);
      setMessage({ type: 'error', text: '删除失败，请稍后重试' });
    }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">导航菜单管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理网站顶部和底部的导航链接</p>
        </div>
        <button onClick={() => { setEditingItem(null); setModalOpen(true); }} className="admin-btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />添加菜单
        </button>
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

      <div className="admin-card overflow-hidden">
        {items.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Link2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">暂无导航菜单</h3>
            <p className="mb-4">点击上方按钮添加第一个导航菜单</p>
            <button onClick={() => { setEditingItem(null); setModalOpen(true); }} className="admin-btn-primary flex items-center gap-2 mx-auto">
              <Plus className="w-4 h-4" />添加菜单
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">排序</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">菜单名称</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">跳转路径</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {items.map((item) => (
                  <motion.tr 
                    key={item.id} 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg text-sm font-medium text-gray-600">
                        {item.order || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{item.label}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">{item.path}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {item.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {item.is_active ? '已启用' : '已禁用'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setEditingItem(item); setModalOpen(true); }}
                          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
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
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ContentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        title={editingItem ? '编辑导航菜单' : '添加导航菜单'}
        fields={modalFields}
        initialData={editingItem || { is_active: true, order: 0 }}
      />

      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
              <h3 className="text-lg font-bold text-gray-900 mb-2">确认删除</h3>
              <p className="text-gray-600 mb-6">
                确定要删除导航菜单「<span className="font-medium">{deleteConfirm.label}</span>」吗？
              </p>
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

export default NavigationsPage;
