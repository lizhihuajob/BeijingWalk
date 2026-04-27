import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials) => api.post('/admin/login', credentials),
  getProfile: () => api.get('/admin/profile'),
};

export const dashboardApi = {
  getStats: () => api.get('/admin/dashboard/stats'),
  getTrending: () => api.get('/admin/dashboard/trending'),
  getVisitTrend: (days) => api.get(`/admin/dashboard/visit-trend?days=${days}`),
};

export const bannerApi = {
  getAll: () => api.get('/admin/banners'),
  getById: (id) => api.get(`/admin/banners/${id}`),
  create: (data) => api.post('/admin/banners', data),
  update: (id, data) => api.put(`/admin/banners/${id}`, data),
  delete: (id) => api.delete(`/admin/banners/${id}`),
};

export const cultureApi = {
  getAll: () => api.get('/admin/cultures'),
  getById: (id) => api.get(`/admin/cultures/${id}`),
  create: (data) => api.post('/admin/cultures', data),
  update: (id, data) => api.put(`/admin/cultures/${id}`, data),
  delete: (id) => api.delete(`/admin/cultures/${id}`),
};

export const specialtyApi = {
  getAll: () => api.get('/admin/specialties'),
  getById: (id) => api.get(`/admin/specialties/${id}`),
  create: (data) => api.post('/admin/specialties', data),
  update: (id, data) => api.put(`/admin/specialties/${id}`, data),
  delete: (id) => api.delete(`/admin/specialties/${id}`),
};

export const scenicApi = {
  getAll: () => api.get('/admin/scenic-spots'),
  getById: (id) => api.get(`/admin/scenic-spots/${id}`),
  create: (data) => api.post('/admin/scenic-spots', data),
  update: (id, data) => api.put(`/admin/scenic-spots/${id}`, data),
  delete: (id) => api.delete(`/admin/scenic-spots/${id}`),
};

export const heritageApi = {
  getAll: () => api.get('/admin/heritages'),
  getById: (id) => api.get(`/admin/heritages/${id}`),
  create: (data) => api.post('/admin/heritages', data),
  update: (id, data) => api.put(`/admin/heritages/${id}`, data),
  delete: (id) => api.delete(`/admin/heritages/${id}`),
};

export const guestbookApi = {
  getAll: () => api.get('/admin/guestbooks'),
  update: (id, data) => api.put(`/admin/guestbooks/${id}`, data),
  delete: (id) => api.delete(`/admin/guestbooks/${id}`),
};

export const userApi = {
  getAll: () => api.get('/admin/users'),
  create: (data) => api.post('/admin/users', data),
  update: (id, data) => api.put(`/admin/users/${id}`, data),
  delete: (id) => api.delete(`/admin/users/${id}`),
};

export default api;
