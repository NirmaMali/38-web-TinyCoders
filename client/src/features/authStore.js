import { create } from 'zustand';
import api from '../api/axios';

// Helper to get/set per-role session from localStorage
const STORAGE_PREFIX = 'placeiq_session_';

const loadSession = (role) => {
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

const loadAllSessions = () => {
  const sessions = {};
  ['student', 'admin', 'alumni'].forEach((role) => {
    const session = loadSession(role);
    if (session) sessions[role] = session;
  });
  return sessions;
};

const useAuthStore = create((set, get) => ({
  // sessions = { student: { user, accessToken, refreshToken }, admin: {...}, ... }
  sessions: loadAllSessions(),
  isLoading: false,

  // Get session for a specific role
  getSession: (role) => get().sessions[role] || null,

  // Check if a role is authenticated
  isRoleAuthenticated: (role) => !!get().sessions[role],

  // Get user for a role
  getRoleUser: (role) => get().sessions[role]?.user || null,

  // Login — stores session for the logged-in role
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const role = data.data.role;
    const sessionData = {
      user: data.data,
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken,
    };
    saveSession(role, sessionData);
    set((state) => ({
      sessions: { ...state.sessions, [role]: sessionData },
    }));
    return data;
  },

  // Register — stores session for the registered role (except alumni pending approval)
  register: async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    const role = data.data.role;
    if (role !== 'alumni') {
      const sessionData = {
        user: data.data,
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
      };
      saveSession(role, sessionData);
      set((state) => ({
        sessions: { ...state.sessions, [role]: sessionData },
      }));
    }
    return data;
  },

  // Logout a specific role
  logout: async (role) => {
    clearSession(role);
    set((state) => {
      const sessions = { ...state.sessions };
      delete sessions[role];
      return { sessions };
    });
  },

  // Update access token for a role (after refresh)
  updateToken: (role, accessToken, refreshToken) => {
    const session = get().sessions[role];
    if (!session) return;
    const updated = { ...session, accessToken, refreshToken: refreshToken || session.refreshToken };
    saveSession(role, updated);
    set((state) => ({
      sessions: { ...state.sessions, [role]: updated },
    }));
  },

  // Check if any role is authenticated
  hasAnySession: () => Object.keys(get().sessions).length > 0,
}));

export default useAuthStore;
