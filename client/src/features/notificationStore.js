import { create } from 'zustand';
import api from '../api/axios';

const useNotificationStore = create((set) => ({
  notifications: [],
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/notifications');
      set({ notifications: data.data, loading: false });
    } catch { set({ loading: false }); }
  },

  markAllRead: async () => {
    await api.put('/notifications/read-all');
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    }));
  },
}));

export default useNotificationStore;
