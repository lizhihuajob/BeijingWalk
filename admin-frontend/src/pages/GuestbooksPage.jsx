import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Loader2, Check, X, Mail, User, Calendar, MessageSquare, Send } from 'lucide-react';
import { guestbookApi } from '../services/api';

function GuestbooksPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState('');
  const [replyModal, setReplyModal] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [replySaving, setReplySaving] = useState(false);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await guestbookApi.getAll();
      setItems(Array.isArray(response.data) ? response.data : []);
      setError('');
    } catch (error) {
      setItems([]);
      setError(error.response?.data?.error || '留言数据加载失败，请重新登录后重试');
      console.error('Failed to fetch guestbooks:', error);
    } finally { setLoading(false); }
  };

  const toggleApproval = async (item) => {
    try {
      await guestbookApi.update(item.id, { is_approved: !item.is_approved });
      fetchItems();
    } catch (error) {
      console.error('Failed to update guestbook:', error);
    }
  };

  const handleDelete = async (id) => {
    await guestbookApi.delete(id);
    setDeleteConfirm(null);
    fetchItems();
  };

  const openReplyModal = (item) => {
    setReplyModal(item);
    setReplyContent(item.reply_content || '');
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    
    setReplySaving(true);
    try {
      await guestbookApi.reply(replyModal.id, { reply_content: replyContent.trim() });
      setReplyModal(null);
      setReplyContent('');
      fetchItems();
    } catch (error) {
      console.error('Failed to reply guestbook:', error);
      alert(error.response?.data?.error || '回复失败');
    } finally {
      setReplySaving(false);
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
        <h1 className="text-2xl font-bold text-gray-900">留言管理</h1>
        <span className="text-sm text-gray-500">共 {items.length} 条留言</span>
      </div>

      <div className="space-y-4">
        {error ? (
          <div className="p-12 text-center text-red-500 admin-card">{error}</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-gray-500 admin-card">暂无留言数据</div>
        ) : items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`admin-card p-6 ${!item.is_approved ? 'border-l-4 border-l-orange-400' : ''}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <div className="flex items-center gap-1 text-gray-700">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  {item.email && (
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <Mail className="w-3 h-3" />
                      <span>{item.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-gray-400 text-sm">
                    <Calendar className="w-3 h-3" />
                    <span>{formatTime(item.created_at)}</span>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    item.is_approved ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {item.is_approved ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    {item.is_approved ? '已通过' : '待审核'}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{item.message}</p>
                
                {item.reply_content && (
                  <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">管理员回复</span>
                      <span className="text-xs text-purple-500">{formatTime(item.replied_at)}</span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{item.reply_content}</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openReplyModal(item)}
                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  title={item.reply_content ? '编辑回复' : '回复留言'}
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleApproval(item)}
                  className={`p-2 rounded-lg transition-colors ${
                    item.is_approved
                      ? 'text-green-600 hover:bg-green-50'
                      : 'text-orange-600 hover:bg-orange-50'
                  }`}
                  title={item.is_approved ? '取消审核' : '通过审核'}
                >
                  {item.is_approved ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setDeleteConfirm(item)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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
                确定要删除 <span className="font-medium">{deleteConfirm.name}</span> 的留言吗？
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
        {replyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
              onClick={() => setReplyModal(null)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {replyModal.reply_content ? '编辑回复' : '回复留言'}
              </h3>
              
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-700">{replyModal.name}</span>
                  <span className="text-xs text-gray-400">{formatTime(replyModal.created_at)}</span>
                </div>
                <p className="text-gray-600 text-sm">{replyModal.message}</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  回复内容
                </label>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="请输入回复内容..."
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button 
                  onClick={() => setReplyModal(null)} 
                  className="admin-btn-secondary"
                  disabled={replySaving}
                >
                  取消
                </button>
                <button 
                  onClick={handleReply} 
                  className="admin-btn-primary flex items-center gap-2"
                  disabled={replySaving || !replyContent.trim()}
                >
                  {replySaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {replySaving ? '发送中...' : '发送回复'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default GuestbooksPage;