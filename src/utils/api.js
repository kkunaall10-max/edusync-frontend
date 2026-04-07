import axios from 'axios';
import { supabase } from '../lib/supabase';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://edusync.up.railway.app') + '/api';

/**
 * Centralized API client with automatic token attachment and retry logic
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach Authorization header before each request
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Auth session error:", error);
      }

      if (session?.access_token) {
        // Use the common header format for Axios 1.x+
        config.headers.Authorization = `Bearer ${session.access_token}`;
        // Debug log as requested by user
        console.log("Token attached to request:", session.access_token.substring(0, 15) + "...");
      } else {
        console.warn("No active session found in apiClient interceptor");
        // Optional: Redirect if session is missing for protected routes
        // window.location.href = '/login'; 
      }
    } catch (err) {
      console.error("Interceptor error during session retrieval:", err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Unified error and token refresh handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized (Token Refresh or Redirect)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log("401 detected, attempting token refresh...");
      
      try {
        const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (session) {
          console.log("Token refreshed successfully");
          originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
          return apiClient(originalRequest);
        } else {
          console.error("Token refresh failed:", refreshError);
          // Redirect to login if refresh fails
          if (typeof window !== 'undefined') {
            window.location.href = '/login?expired=true';
          }
        }
      } catch (refreshErr) {
        console.error("Refresh session error:", refreshErr);
      }
    }

    // Pass back the error
    return Promise.reject(error);
  }
);

// Global axios configuration (Fixes components currently using raw axios directly)
axios.defaults.baseURL = API_BASE_URL;

axios.interceptors.request.use(
  async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
      console.log("Global Axios - Token attached:", session.access_token.substring(0, 15) + "...");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
