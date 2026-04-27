import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Loader2, Shield, ShieldOff, User, Mail, Calendar, Key, Eye, EyeOff } from 'lucide-react';
import { userApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ContentModal from '../components/ContentModal';

const modalFields = [
  { name: 'username', label: '用户名', type: 'text', placeholder: '请输入用户名', required: true },
  { name: 'email', label: '邮箱', type: 'email', placeholder: '请输入邮箱', required: true },
  { name: 'password', label: '密码', type: 'text', placeholder: '请输入密码（新建用户必填）' },
  { name: 'is_active', label: '状态', type: 'checkbox', checkboxLabel: '启用' },
  { name: 'is_superuser', label: '权限', type: 'checkbox', checkboxLabel: '超级管理员' },
];

function UsersPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { user: currentUser } = useAuth();

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    if (!currentUser?.is_superuser) return;
    setLoading(true);
    try {
      const response = await userApi.getAll();
      setItems(response.data);
    } finally { setLoading(false); }
  };

  const handleSubmit = async (data) => {
    const submitData = { ...data };
    if (!submitData.password || submitData.password === '') {
      delete submitData.password;
    }
    
    if (editingItem) {
      await userApi.update(editingItem.id, submitData);
    } else {
      await userApi.create(submitData);
    }
    fetchItems();
  };

  const handleDelete = async (id) => {
    await userApi.delete(id);
    setDeleteConfirm(null);
    fetchItems();
  };

  if (!currentUser?.is_superuser) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-500">
        <Shield className="w-16 h-16 mb-4 text-gray-300" />
        <h2 className="text-xl font-medium mb-2">权限不足</h2>
        <p>只有超级管理员可以访问此页面</p>
      </div>
    );
  }

  if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">管理员管理</h1>
        <button onClick={() => { setEditingItem(null); setModalOpen(true); }} className="admin-btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />添加管理员
        </button>
      </div>

      <div className="admin-card">
        <div className="divide-y divide-gray-100">
          {items.length === 0 ? (
            <div className="p-12 text-center text-gray-500">暂无管理员数据</div>
          ) : items.map((item) => (
            <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 flex items-center gap-6 hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-lg">
                {item.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-semibold text-gray-900">{item.username}</h3>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    item.is_superuser ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {item.is_superuser ? <Shield className="w-3 h-3" /> : <ShieldOff className="w-3 h-3" />}
                    {item.is_superuser ? '超级管理员' : '普通管理员'}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    item.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                  }`}>
                    {item.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {item.is_active ? '已启用' : '已禁用'}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{item.email}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    创建于: {new Date(item.created_at).toLocaleDateString('zh-CN')}
                  </span>
                  {item.last_login && (
                    <span className="flex items-center gap-1">
                      <Key className="w-3 h-3" />
                      最后登录: {new Date(item.last_login).toLocaleString('zh-CN')}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setEditingItem(item); setModalOpen(true); }}
                  className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {currentUser.id !== item.id && (
                  <button
                    onClick={() => setDeleteConfirm(item)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <ContentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        title={editingItem ? '编辑管理员' : '添加管理员'}
        fields={modalFields}
        initialData={editingItem || { is_active: true, is_superuser: false }}
      />

      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
              <h3 className="text-lg font-bold text-gray-900 mb-2">确认删除</h3>
              <p className="text-gray-600 mb-6">确定要删除管理员「<span className="font-medium">{deleteConfirm.username}</span>」吗？</p>
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

export default UsersPage;
