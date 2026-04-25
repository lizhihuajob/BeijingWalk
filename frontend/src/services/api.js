import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

export default apiClient;