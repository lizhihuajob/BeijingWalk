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

export const getARExperiences = async (options = {}) => {
  const params = new URLSearchParams();
  if (options.category) params.append('category', options.category);
  if (options.featured !== undefined) params.append('featured', options.featured.toString());
  if (options.limit) params.append('limit', options.limit.toString());
  if (options.offset) params.append('offset', options.offset.toString());
  
  const queryString = params.toString();
  const response = await apiClient.get(`/ar-experiences${queryString ? '?' + queryString : ''}`);
  return response.data;
};

export const getARExperienceById = async (id) => {
  const response = await apiClient.get(`/ar-experiences/${id}`);
  return response.data;
};

export const completeARExperience = async (id) => {
  const response = await apiClient.post(`/ar-experiences/${id}/complete`);
  return response.data;
};

export const getARExperiencesByHeritage = async (heritageId) => {
  const response = await apiClient.get(`/ar-experiences/by-heritage/${heritageId}`);
  return response.data;
};

export const getPostcardTemplates = async (options = {}) => {
  const params = new URLSearchParams();
  if (options.category) params.append('category', options.category);
  if (options.featured !== undefined) params.append('featured', options.featured.toString());
  
  const queryString = params.toString();
  const response = await apiClient.get(`/postcard-templates${queryString ? '?' + queryString : ''}`);
  return response.data;
};

export const getPostcardPhotos = async (type = 'all', limit = 50, offset = 0) => {
  const params = new URLSearchParams({
    type,
    limit: limit.toString(),
    offset: offset.toString(),
  });
  const response = await apiClient.get(`/postcards/photos?${params.toString()}`);
  return response.data;
};

export const createPostcard = async (data) => {
  const response = await apiClient.post('/postcards', data);
  return response.data;
};

export const getPostcards = async (options = {}) => {
  const params = new URLSearchParams();
  if (options.sessionId) params.append('session_id', options.sessionId);
  if (options.isPublic !== undefined) params.append('public', options.isPublic.toString());
  if (options.limit) params.append('limit', options.limit.toString());
  if (options.offset) params.append('offset', options.offset.toString());
  
  const queryString = params.toString();
  const response = await apiClient.get(`/postcards${queryString ? '?' + queryString : ''}`);
  return response.data;
};

export const getPostcardById = async (id) => {
  const response = await apiClient.get(`/postcards/${id}`);
  return response.data;
};

export const sendPostcard = async (id, recipientEmail) => {
  const response = await apiClient.post(`/postcards/${id}/send`, {
    recipient_email: recipientEmail,
  });
  return response.data;
};

export default apiClient;