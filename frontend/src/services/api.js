import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getAPIBaseURL = () => API_BASE_URL;

export const healthCheck = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

export const getBanners = async () => {
  const response = await apiClient.get('/banners');
  return response.data;
};

export const getBannerById = async (id) => {
  const response = await apiClient.get(`/banners/${id}`);
  return response.data;
};

export const getCultures = async () => {
  const response = await apiClient.get('/cultures');
  return response.data;
};

export const getCultureById = async (id) => {
  const response = await apiClient.get(`/cultures/${id}`);
  return response.data;
};

export const getSpecialties = async () => {
  const response = await apiClient.get('/specialties');
  return response.data;
};

export const getSpecialtyById = async (id) => {
  const response = await apiClient.get(`/specialties/${id}`);
  return response.data;
};

export const getScenicSpots = async () => {
  const response = await apiClient.get('/scenic-spots');
  return response.data;
};

export const getFeaturedScenicSpots = async () => {
  const response = await apiClient.get('/scenic-spots/featured');
  return response.data;
};

export const getScenicSpotById = async (id) => {
  const response = await apiClient.get(`/scenic-spots/${id}`);
  return response.data;
};

export const getHeritages = async () => {
  const response = await apiClient.get('/heritages');
  return response.data;
};

export const getHeritageById = async (id) => {
  const response = await apiClient.get(`/heritages/${id}`);
  return response.data;
};

export const getAllData = async () => {
  const response = await apiClient.get('/all');
  return response.data;
};

export const getGuestbooks = async () => {
  const response = await apiClient.get('/guestbooks');
  return response.data;
};

export const getGuestbookById = async (id) => {
  const response = await apiClient.get(`/guestbooks/${id}`);
  return response.data;
};

export const createGuestbook = async (data) => {
  const response = await apiClient.post('/guestbooks', data);
  return response.data;
};

export const getSiteConfig = async () => {
  const response = await apiClient.get('/site-config');
  return response.data;
};

export const getNavigations = async () => {
  const response = await apiClient.get('/navigations');
  return response.data;
};

export const getCategories = async () => {
  const response = await apiClient.get('/categories');
  return response.data;
};

export const getBookingGuideByScenicSpot = async (scenicSpotId) => {
  const response = await apiClient.get(`/booking-guides/${scenicSpotId}`);
  return response.data;
};

export const getAllConfig = async () => {
  const response = await apiClient.get('/config/all');
  return response.data;
};

export const getScenicSpotsForMap = async () => {
  const response = await apiClient.get('/scenic-spots/map');
  return response.data;
};

export const getNearbyRecommendations = async (scenicSpotId) => {
  const response = await apiClient.get(`/scenic-spots/${scenicSpotId}/nearby`);
  return response.data;
};

export const recordSearchHistory = async (data) => {
  const response = await apiClient.post('/admin/search-history', data);
  return response.data;
};

export const getTravelPackages = async () => {
  const response = await apiClient.get('/travel-packages');
  return response.data;
};

export const getFeaturedTravelPackages = async () => {
  const response = await apiClient.get('/travel-packages/featured');
  return response.data;
};

export const getTravelPackageById = async (id) => {
  const response = await apiClient.get(`/travel-packages/${id}`);
  return response.data;
};

export const initChatSession = async (data) => {
  const response = await apiClient.post('/chat/init', data);
  return response.data;
};

export const getChatMessages = async (sessionId) => {
  const response = await apiClient.get(`/chat/${sessionId}/messages`);
  return response.data;
};

export const sendChatMessage = async (sessionId, data) => {
  const response = await apiClient.post(`/chat/${sessionId}/send`, data);
  return response.data;
};

export const pollChatMessages = async (sessionId, lastMessageId = 0) => {
  const response = await apiClient.get(`/chat/${sessionId}/poll?last_message_id=${lastMessageId}`);
  return response.data;
};

export const globalSearch = async (keyword, searchType = 'all', limit = 20, offset = 0) => {
  const params = new URLSearchParams({
    keyword,
    type: searchType,
    limit: limit.toString(),
    offset: offset.toString(),
  });
  const response = await apiClient.get(`/search?${params.toString()}`);
  return response.data;
};

export const filterScenicSpots = async (spotType, limit = 20, offset = 0) => {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });
  if (spotType) {
    params.append('type', spotType);
  }
  const response = await apiClient.get(`/scenic-spots/filter?${params.toString()}`);
  return response.data;
};

export const filterSpecialties = async (category, limit = 20, offset = 0) => {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });
  if (category) {
    params.append('category', category);
  }
  const response = await apiClient.get(`/specialties/filter?${params.toString()}`);
  return response.data;
};

export const getHotKeywords = async (days = 7, limit = 10) => {
  const params = new URLSearchParams({
    days: days.toString(),
    limit: limit.toString(),
  });
  const response = await apiClient.get(`/search/hot-keywords?${params.toString()}`);
  return response.data;
};

export const generateItinerary = async (spotIds, days = 1, preferences = {}) => {
  const response = await apiClient.post('/itinerary/generate', {
    spot_ids: spotIds,
    days,
    preferences,
  });
  return response.data;
};

export default apiClient;