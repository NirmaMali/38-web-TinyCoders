import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// NO withCredentials — we use Bearer tokens from localStorage, not cookies.
// Cookies are shared across tabs and break multi-role sessions.
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Detect current role from URL path
const getCurrentRole = () => {
  const path = window.location.pathname;
  if (path.startsWith('/student')) return 'student';
  if (path.startsWith('/admin')) return 'admin';
  if (path.startsWith('/alumni')) return 'alumni';
  return null;
};

const STORAGE_PREFIX = 'placeiq_session_';

const getSession = (role) => {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${role}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const saveSession = (role, data) => {
  localStorage.setItem(`${STORAGE_PREFIX}${role}`, JSON.stringify(data));
};

const clearSession = (role) => {
  localStorage.removeItem(`${STORAGE_PREFIX}${role}`);
};

// REQUEST interceptor — attach the right Bearer token based on current URL role
api.interceptors.request.use(
  (config) => {
    // Determine which role's token to use
    let role = getCurrentRole();

    // For auth routes, don't attach any token (login/register)
    if (config.url?.includes('/auth/login') || config.url?.includes('/auth/register')) {
      return config;
    }

    // For API-specific routes, detect role from the API path
    if (!role) {
      if (config.url?.includes('/student')) role = 'student';
      else if (config.url?.includes('/admin')) role = 'admin';
      else if (config.url?.includes('/alumni')) role = 'alumni';
    }

    if (role) {
      const session = getSession(role);
      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      }
    }

    // Store the role on the config for the response interceptor
    config._role = role;
    return config;
  },
  (error) => Promise.reject(error)
);

// Track refresh state per role
const refreshState = {};

// RESPONSE interceptor — handle 401 with per-role token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const role = originalRequest?._role || getCurrentRole();

    if (error.response?.status === 401 && !originalRequest._retry && role) {
      originalRequest._retry = true;

      // Prevent multiple refresh calls for the same role
      if (refreshState[role]) {
        return refreshState[role].then(() => {
          const session = getSession(role);
          if (session?.accessToken) {
            originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
          }
          return api(originalRequest);
        });
      }

      refreshState[role] = (async () => {
        try {
          const session = getSession(role);
          if (!session?.refreshToken) throw new Error('No refresh token');

          // Use plain axios (not the api instance) to avoid interceptor loops
          // NO withCredentials — send refresh token in body only
          const { data } = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken: session.refreshToken,
          });

          // Update stored tokens
          const updatedSession = {
            ...session,
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken || session.refreshToken,
          };
          saveSession(role, updatedSession);

          // Also update Zustand store if available
          try {
            const { default: useAuthStore } = await import('../features/authStore');
            useAuthStore.getState().updateToken(role, updatedSession.accessToken, updatedSession.refreshToken);
          } catch {}

        } catch (refreshError) {
          // Refresh failed — clear this role's session
          clearSession(role);
          // Only redirect if we're on this role's pages
          if (getCurrentRole() === role) {
            window.location.href = '/login';
          }
          throw refreshError;
        } finally {
          delete refreshState[role];
        }
      })();

      await refreshState[role];

      const session = getSession(role);
      if (session?.accessToken) {
        originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
      }
      return api(originalRequest);
    }

    const message = error.response?.data?.message || 'Something went wrong';
    if (error.response?.status !== 401) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;
