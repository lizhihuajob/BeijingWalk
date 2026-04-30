import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, FileText, Search, ChevronLeft, ChevronRight, Clock, User, Eye } from 'lucide-react';
import { operationLogApi } from '../services/api';

const actionLabels = {
  create: '新增',
  update: '修改',
  delete: '删除',
  reply: '回复',
  approve: '审核',
};

const actionColors = {
  create: 'bg-green-100 text-green-700',
  update: 'bg-blue-100 text-blue-700',
  delete: 'bg-red-100 text-red-700',
  reply: 'bg-purple-100 text-purple-700',
  approve: 'bg-orange-100 text-orange-700',
};

function OperationLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detailModal, setDetailModal] = useState(null);
  
  const [filters, setFilters] = useState({
    module: '',
    action: '',
    admin_username: '',
  });
  
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    total_pages: 1,
  });

  const modules = ['', '轮播图管理', '文化内容', '特色内容', '景点管理', '非遗遗产', '留言管理', '管理员', '网站配置', '导航菜单', '首页分类', '购票指南'];
  const actions = ['', 'create', 'update', 'delete', 'reply', 'approve'];

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        per_page: pagination.per_page,
        ...(filters.module && { module: filters.module }),
        ...(filters.action && { action: filters.action }),
        ...(filters.admin_username && { admin_username: filters.admin_username }),
      };
      
      const response = await operationLogApi.getAll(params);
      const data = response.data;
      
      if (data.items) {
        setLogs(data.items);
        setPagination(prev => ({
          ...prev,
          total: data.total,
          total_pages: data.total_pages,
        }));
      } else {
        setLogs(Array.isArray(data) ? data : []);
        setPagination(prev => ({
          ...prev,
          total: data.length,
          total_pages: 1,
        }));
      }
      setError('');
    } catch (error) {
      setLogs([]);
      setError(error.response?.data?.error || '操作日志加载失败，请重新登录后重试');
      console.error('Failed to fetch operation logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '-';
    return new Date(timeStr).toLocaleString('zh-CN');
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">操作日志</h1>
        <span className="text-sm text-gray-500">
          共 {pagination.total} 条记录
        </span>
      </div>

      <div className="admin-card p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" />
            <select
              value={filters.module}
              onChange={(e) => handleFilterChange('module', e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            >
              <option value="">全部模块</option>
              {modules.filter(m => m).map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" />
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            >
              <option value="">全部操作</option>
              {actions.filter(a => a).map(a => (
                <option key={a} value={a}>{actionLabels[a] || a}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索管理员..."
              value={filters.admin_username}
              onChange={(e) => handleFilterChange('admin_username', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>
          <button
            onClick={() => {
              setFilters({ module: '', action: '', admin_username: '' });
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            重置
          </button>
        </div>
      </div>

      <div className="admin-card overflow-hidden">
        {error ? (
          <div className="p-12 text-center text-red-500">{error}</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>暂无操作日志</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    时间
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    管理员
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    模块
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    目标
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    描述
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map((log) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {formatTime(log.created_at)}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 text-gray-400" />
                        <span className="font-medium text-gray-900">{log.admin_username}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {log.module}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${actionColors[log.action] || 'bg-gray-100 text-gray-700'}`}>
                        {actionLabels[log.action] || log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      <div className="max-w-xs truncate">
                        {log.target_name || (log.target_type ? `${log.target_type} #${log.target_id}` : '-')}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="max-w-md truncate">
                        {log.description || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {log.ip_address || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <button
                        onClick={() => setDetailModal(log)}
                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="查看详情"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                page === pagination.page
                  ? 'bg-primary-600 text-white'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.total_pages}
            className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <AnimatePresence>
        {detailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setDetailModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">操作日志详情</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">管理员</label>
                    <p className="text-gray-900 font-medium">{detailModal.admin_username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">操作时间</label>
                    <p className="text-gray-900">{formatTime(detailModal.created_at)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">模块</label>
                    <p className="text-gray-900">{detailModal.module}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">操作类型</label>
                    <p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${actionColors[detailModal.action] || 'bg-gray-100 text-gray-700'}`}>
                        {actionLabels[detailModal.action] || detailModal.action}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">目标类型</label>
                    <p className="text-gray-900">{detailModal.target_type || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">目标 ID</label>
                    <p className="text-gray-900">{detailModal.target_id || '-'}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">目标名称</label>
                  <p className="text-gray-900">{detailModal.target_name || '-'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">操作描述</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{detailModal.description || '-'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">IP 地址</label>
                    <p className="text-gray-900 font-mono text-sm">{detailModal.ip_address || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">日志 ID</label>
                    <p className="text-gray-900 font-mono text-sm">{detailModal.id}</p>
                  </div>
                </div>

                {detailModal.user_agent && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">浏览器信息</label>
                    <p className="text-gray-600 text-sm break-all">{detailModal.user_agent}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setDetailModal(null)}
                  className="admin-btn-primary"
                >
                  关闭
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default OperationLogsPage;