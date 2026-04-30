import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Loader2, AlertCircle, CheckCircle, Eye, EyeOff, Ticket, Phone, Clock } from 'lucide-react';
import { bookingGuideApi, scenicApi } from '../services/api';
import ContentModal from '../components/ContentModal';

const modalFields = [
  { name: 'scenic_spot_id', label: '关联景点', type: 'select', placeholder: '选择景点', required: true },
  { name: 'title', label: '指南标题', type: 'text', placeholder: '例如：故宫博物院购票指南', required: true },
  { name: 'description', label: '简要描述', type: 'textarea', placeholder: '购票指南的简要说明' },
  { name: 'steps', label: '购票步骤', type: 'textarea', placeholder: 'JSON数组格式：[{"title":"方式一","content":"详细步骤...","note":"提示"}]' },
  { name: 'important_notes', label: '重要提示', type: 'textarea', placeholder: 'JSON数组格式：["提示1", "提示2", "提示3"]' },
  { name: 'contact_phone', label: '联系电话', type: 'text', placeholder: '例如：010-12345678' },
  { name: 'contact_work_time', label: '工作时间', type: 'text', placeholder: '例如：08:00-20:00' },
  { name: 'order', label: '排序', type: 'number', placeholder: '数字越小越靠前' },
  { name: 'is_active', label: '状态', type: 'checkbox', checkboxLabel: '启用' },
];

function BookingGuidesPage() {
  const [items, setItems] = useState([]);
  const [scenicSpots, setScenicSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [guidesData, spotsData] = await Promise.all([
        bookingGuideApi.getAll(),
        scenicApi.getAll(),
      ]);
      setItems(Array.isArray(guidesData.data) ? guidesData.data : []);
      setScenicSpots(Array.isArray(spotsData.data) ? spotsData.data : []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setItems([]);
      setScenicSpots([]);
    } finally { setLoading(false); }
  };

  const getScenicSpotName = (id) => {
    const spot = scenicSpots.find(s => s.id === id);
    return spot ? spot.name : '未知景点';
  };

  const handleSubmit = async (data) => {
    const submitData = {
      ...data,
      scenic_spot_id: data.scenic_spot_id ? parseInt(data.scenic_spot_id) : null,
      order: data.order ? parseInt(data.order) : 0,
    };
    
    try {
      if (editingItem) {
        await bookingGuideApi.update(editingItem.id, submitData);
      } else {
        await bookingGuideApi.create(submitData);
      }
      setMessage({ type: 'success', text: editingItem ? '更新成功！' : '添加成功！' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      fetchAllData();
    } catch (error) {
      console.error('Failed to save booking guide:', error);
      setMessage({ type: 'error', text: '操作失败，请稍后重试' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await bookingGuideApi.delete(id);
      setDeleteConfirm(null);
      setMessage({ type: 'success', text: '删除成功！' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      fetchAllData();
    } catch (error) {
      console.error('Failed to delete booking guide:', error);
      setMessage({ type: 'error', text: '删除失败，请稍后重试' });
    }
  };

  const prepareInitialData = (item) => {
    if (!item) return { is_active: true, order: 0 };
    return {
      ...item,
      steps: typeof item.steps === 'string' ? item.steps : JSON.stringify(item.steps, null, 2),
      important_notes: typeof item.important_notes === 'string' ? item.important_notes : JSON.stringify(item.important_notes, null, 2),
    };
  };

  const dynamicFields = modalFields.map(field => {
    if (field.type === 'select') {
      return {
        ...field,
        options: scenicSpots.map(spot => ({ value: spot.id.toString(), label: spot.name })),
      };
    }
    return field;
  });

  if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">购票指南管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理各景点的购票指南信息</p>
        </div>
        <button onClick={() => { setEditingItem(null); setModalOpen(true); }} className="admin-btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />添加指南
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
            <Ticket className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">暂无购票指南</h3>
            <p className="mb-4">点击上方按钮添加第一个购票指南</p>
            <button onClick={() => { setEditingItem(null); setModalOpen(true); }} className="admin-btn-primary flex items-center gap-2 mx-auto">
              <Plus className="w-4 h-4" />添加指南
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">排序</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">关联景点</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">指南标题</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">联系电话</th>
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
                      <span className="font-medium text-gray-900">{getScenicSpotName(item.scenic_spot_id)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-medium text-gray-900">{item.title}</span>
                        {item.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-1">{item.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {item.contact_phone ? (
                          <span className="flex items-center gap-1 text-sm text-gray-600">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {item.contact_phone}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </div>
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

      <div className="admin-card p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">数据格式说明</h3>
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-medium text-gray-700 mb-2">购票步骤格式（JSON数组）：</p>
            <pre className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600 overflow-x-auto">
{`[
  {
    "title": "方式一：微信小程序预约",
    "content": "1. 打开微信...\\n2. 点击购票...",
    "note": "建议提前7天预约"
  }
]`}
            </pre>
          </div>
          <div>
            <p className="font-medium text-gray-700 mb-2">重要提示格式（JSON数组）：</p>
            <pre className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600 overflow-x-auto">
{`[
  "门票提前7天开售",
  "所有观众须实名预约",
  "周一闭馆（法定节假日除外）"
]`}
            </pre>
          </div>
        </div>
      </div>

      <ContentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        title={editingItem ? '编辑购票指南' : '添加购票指南'}
        fields={dynamicFields}
        initialData={prepareInitialData(editingItem)}
      />

      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
              <h3 className="text-lg font-bold text-gray-900 mb-2">确认删除</h3>
              <p className="text-gray-600 mb-6">
                确定要删除购票指南「<span className="font-medium">{deleteConfirm.title}</span>」吗？
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

export default BookingGuidesPage;
