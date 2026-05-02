import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, MessageSquare, User, Clock, Send, X, 
  ChevronRight, ChevronLeft, ArrowRight, Circle,
  Check, Phone, Mail, Tag, AlertCircle
} from 'lucide-react';
import { chatSessionApi } from '../services/api';

const POLL_INTERVAL = 3000;

function ChatSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyContent, setReplyContent] = useState('');
  const [replying, setReplying] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, total: 0, total_pages: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  
  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await chatSessionApi.getUnreadCount();
      setUnreadCount(response.data.unread_count || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, []);

  const fetchSessions = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, per_page: 20 };
      if (statusFilter) params.status = statusFilter;
      
      const queryString = new URLSearchParams(params).toString();
      const response = await chatSessionApi.getAll(params);
      
      setSessions(Array.isArray(response.data.items) ? response.data.items : []);
      setPagination({
        page: response.data.current_page || 1,
        total: response.data.total || 0,
        total_pages: response.data.total_pages || 0,
      });
      setError('');
    } catch (error) {
      setSessions([]);
      setError(error.response?.data?.error || '数据加载失败');
      console.error('Failed to fetch chat sessions:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const fetchMessages = useCallback(async (sessionId, isPolling = false) => {
    try {
      const response = await chatSessionApi.getMessages(sessionId);
      const newMessages = Array.isArray(response.data) ? response.data : [];
      
      if (!isPolling) {
        setMessages(newMessages);
      } else {
        setMessages(prev => {
          const existingIds = new Set(prev.map(m => m.id));
          const newerMessages = newMessages.filter(m => !existingIds.has(m.id));
          if (newerMessages.length > 0) {
            return [...prev, ...newerMessages];
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  }, []);

  useEffect(() => {
    fetchSessions(1);
    fetchUnreadCount();
  }, [statusFilter, fetchSessions, fetchUnreadCount]);

  useEffect(() => {
    if (selectedSession) {
      fetchMessages(selectedSession.session_id);
      
      pollingRef.current = setInterval(() => {
        fetchMessages(selectedSession.session_id, true);
        fetchUnreadCount();
      }, POLL_INTERVAL);
      
      return () => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
        }
      };
    }
  }, [selectedSession, fetchMessages, fetchUnreadCount]);

  const openSession = (session) => {
    setSelectedSession(session);
    fetchMessages(session.session_id);
    fetchUnreadCount();
  };

  const closeSession = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }
    setSelectedSession(null);
    setMessages([]);
    setReplyContent('');
    fetchSessions(pagination.page);
  };

  const handleReply = async () => {
    if (!replyContent.trim() || !selectedSession) return;
    
    setReplying(true);
    try {
      await chatSessionApi.reply(selectedSession.session_id, {
        content: replyContent.trim()
      });
      setReplyContent('');
      fetchMessages(selectedSession.session_id);
    } catch (error) {
      console.error('Failed to send reply:', error);
      alert(error.response?.data?.error || '发送失败');
    } finally {
      setReplying(false);
    }
  };

  const handleCloseSession = async () => {
    if (!selectedSession) return;
    if (!window.confirm('确定要关闭此会话吗？关闭后访客将无法继续发送消息。')) return;
    
    try {
      await chatSessionApi.close(selectedSession.session_id);
      closeSession();
    } catch (error) {
      console.error('Failed to close session:', error);
      alert(error.response?.data?.error || '关闭失败');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleReply();
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '-';
    const date = new Date(timeStr);
    return date.toLocaleString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status, adminUnread) => {
    const hasUnread = adminUnread > 0;
    
    if (status === 'closed') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
          <X className="w-3 h-3" />
          已关闭
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs">
        {hasUnread ? (
          <>
            <Circle className="w-2 h-2 fill-current" />
            <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
              {adminUnread} 条未读
            </span>
          </>
        ) : (
          <>
            <Circle className="w-2 h-2 fill-green-500" />
            <span className="text-green-600">进行中</span>
          </>
        )}
      </span>
    );
  };

  if (loading && sessions.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">咨询聊天管理</h1>
          {unreadCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
              <AlertCircle className="w-4 h-4" />
              {unreadCount} 条未读消息
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setSelectedSession(null);
            }}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          >
            <option value="">全部状态</option>
            <option value="active">进行中</option>
            <option value="closed">已关闭</option>
          </select>
          <span className="text-sm text-gray-500">
            共 {pagination.total} 个会话
          </span>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        <div className={`bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col ${
          selectedSession ? 'w-80 shrink-0' : 'w-full'
        }`}>
          {error ? (
            <div className="flex-1 flex items-center justify-center text-red-500 p-8">
              {error}
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
              <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
              <p>暂无咨询会话</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {sessions.map((session) => (
                <motion.button
                  key={session.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => openSession(session)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                    selectedSession?.session_id === session.session_id
                      ? 'bg-primary-50 border-l-2 border-l-primary-500'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0">
                          {session.visitor_name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {session.visitor_name || '访客'}
                          </p>
                          {session.travel_package_title && (
                            <p className="text-xs text-gray-500 truncate">
                              <Tag className="w-3 h-3 inline mr-1" />
                              {session.travel_package_title}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {getStatusBadge(session.status, session.admin_unread_count)}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-400 pl-10">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {session.last_message_at ? formatTime(session.last_message_at) : formatTime(session.created_at)}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </motion.button>
              ))}
            </div>
          )}
          
          {pagination.total_pages > 1 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => fetchSessions(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                上一页
              </button>
              <span className="text-sm text-gray-500">
                {pagination.page} / {pagination.total_pages}
              </span>
              <button
                onClick={() => fetchSessions(pagination.page + 1)}
                disabled={pagination.page >= pagination.total_pages}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <AnimatePresence>
          {selectedSession && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col min-w-0"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                    {selectedSession.visitor_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedSession.visitor_name || '访客'}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {selectedSession.visitor_phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {selectedSession.visitor_phone}
                        </span>
                      )}
                      {selectedSession.visitor_email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {selectedSession.visitor_email}
                        </span>
                      )}
                      <span>创建于 {formatTime(selectedSession.created_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedSession.status !== 'closed' && (
                    <button
                      onClick={handleCloseSession}
                      className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      关闭会话
                    </button>
                  )}
                  <button
                    onClick={closeSession}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
                    <p>暂无消息</p>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${msg.sender_type === 'admin' ? 'order-2' : 'order-1'}`}>
                        <div className={`flex items-center gap-2 mb-1 ${
                          msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'
                        }`}>
                          <span className={`text-xs ${
                            msg.sender_type === 'admin' ? 'text-blue-500' : 'text-orange-500'
                          }`}>
                            {msg.sender_type === 'admin' ? '管理员' : (msg.sender_name || '访客')}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatTime(msg.created_at)}
                          </span>
                          {msg.sender_type === 'admin' && msg.is_read && (
                            <Check className="w-3 h-3 text-green-500" />
                          )}
                        </div>
                        <div className={`px-4 py-2.5 rounded-2xl ${
                          msg.sender_type === 'admin'
                            ? 'bg-blue-500 text-white rounded-tr-sm'
                            : 'bg-white text-gray-800 border border-gray-200 rounded-tl-sm'
                        }`}>
                          <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {selectedSession.status !== 'closed' ? (
                <div className="p-4 border-t border-gray-100 bg-white">
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="输入回复内容...（按 Enter 发送，Shift+Enter 换行）"
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                        disabled={replying}
                      />
                    </div>
                    <button
                      onClick={handleReply}
                      disabled={!replyContent.trim() || replying}
                      className="admin-btn-primary flex items-center gap-2 h-[66px] px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {replying ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      发送
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 border-t border-gray-100 bg-gray-50 text-center text-gray-500 text-sm">
                  此会话已关闭，无法继续回复
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default ChatSessionsPage;