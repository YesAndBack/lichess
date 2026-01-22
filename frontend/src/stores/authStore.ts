import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import { api } from '../api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (code: string, state: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (code: string, state: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.handleCallback(code, state);
          api.setToken(response.access_token);
          
          // Fetch full user profile
          const user = await api.getMyProfile();
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.detail || 'Login failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await api.logout();
        } catch (error) {
          // Ignore logout errors
        } finally {
          api.setToken(null);
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
        }
      },

      fetchUser: async () => {
        if (!api.getToken()) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const user = await api.getMyProfile();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          api.setToken(null);
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: error.response?.data?.detail || 'Failed to fetch user'
          });
        }
      },

      refreshUser: async () => {
        if (!get().isAuthenticated) return;
        
        set({ isLoading: true, error: null });
        try {
          const user = await api.refreshMyProfile();
          set({ user, isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.detail || 'Failed to refresh user data',
            isLoading: false 
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated,
        user: state.user 
      }),
    }
  )
);
