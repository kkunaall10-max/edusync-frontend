import axios from 'axios';
import { supabase } from '../lib/supabase';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://edusync.up.railway.app') + '/api';

/**
 * Centralized API client with automatic token attachment and retry logic
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach Authorization header before each request
apiClient.interceptors.request.use(
  async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Unified error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Add retry mechanisms or token refreshing here if needed
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
      
      if (session) {
        originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
        return apiClient(originalRequest);
      }
    }

    if (error.response?.status === 404) {
      console.warn(`Resource not found: ${originalRequest.url}`);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
