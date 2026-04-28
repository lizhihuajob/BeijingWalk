import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Calendar, Key, Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { authApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function Profile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = '用户名不能为空';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = '邮箱不能为空';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }
    
    if (formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = '密码至少6个字符';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '两次密码输入不一致';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setSuccess(false);
    
    try {
      const submitData = {
        username: formData.username,
        email: formData.email,
      };
      
      if (formData.password) {
        submitData.password = formData.password;
      }
      
      const response = await authApi.updateProfile(submitData);
      
      if (updateUser) {
        updateUser(response.data);
      }
      
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: '',
      }));
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('更新个人信息失败:', error);
      if (error.response?.data?.error) {
        setErrors({ submit: error.response.data.error });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (errors.submit) {
      setErrors(prev => ({ ...prev, submit: '' }));
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">个人中心</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="admin-card p-6"
        >
          <div className="text-center">
            <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{user.username}</h2>
            <p className="text-gray-500 mt-1">{user.email}</p>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium mt-3 ${
              user.is_superuser ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {user.is_superuser ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
              {user.is_superuser ? '超级管理员' : '员工'}
            </span>
          </div>

          {user.last_login && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-3 text-sm">
                <Key className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-gray-500">最后登录</p>
                  <p className="font-medium text-gray-900">
                    {new Date(user.last_login).toLocaleString('zh-CN')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="admin-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">修改个人信息</h3>
            
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700"
              >
                <Check className="w-5 h-5" />
                <span>个人信息更新成功！</span>
              </motion.div>
            )}

            {errors.submit && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {errors.submit}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    用户名
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`admin-input ${errors.username ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="请输入用户名"
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    邮箱
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`admin-input ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="请输入邮箱"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">修改密码（留空则不修改）</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Key className="w-4 h-4 inline mr-1" />
                      新密码
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`admin-input pr-10 ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="请输入新密码（至少6个字符）"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Key className="w-4 h-4 inline mr-1" />
                      确认密码
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`admin-input ${errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="请再次输入新密码"
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="admin-btn-primary flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  保存修改
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Profile;