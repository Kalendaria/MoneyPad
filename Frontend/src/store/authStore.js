import { create } from 'zustand';
import api from '../api/axios';

const useAuthStore = create((set) => ({
  user:            null,
  token:           localStorage.getItem('token') || null,
  isAuthenticated: false,
  isLoading:       false,
  error:           null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Register failed';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data.user, token, isAuthenticated: true });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

export default useAuthStore;