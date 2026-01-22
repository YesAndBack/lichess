import { create } from 'zustand';
import type { Game, GameListResponse, GameFilters, GameStats } from '../types';
import { api } from '../api';

interface GamesState {
  games: Game[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  filters: GameFilters;
  stats: GameStats | null;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;

  // Actions
  fetchGames: (page?: number, append?: boolean) => Promise<void>;
  syncGames: (maxGames?: number) => Promise<{ fetched: number; saved: number }>;
  fetchStats: () => Promise<void>;
  setFilters: (filters: GameFilters) => void;
  resetFilters: () => void;
  clearError: () => void;
}

export const useGamesStore = create<GamesState>((set, get) => ({
  games: [],
  total: 0,
  page: 1,
  pageSize: 10,
  hasMore: false,
  filters: {},
  stats: null,
  isLoading: false,
  isSyncing: false,
  error: null,

  fetchGames: async (page: number = 1, append: boolean = false) => {
    set({ isLoading: true, error: null });
    try {
      const { pageSize, filters } = get();
      const response = await api.getMyGames(page, pageSize, filters);
      
      set((state) => ({
        games: append ? [...state.games, ...response.games] : response.games,
        total: response.total,
        page: response.page,
        hasMore: response.has_more,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to fetch games',
        isLoading: false,
      });
    }
  },

  syncGames: async (maxGames: number = 100) => {
    set({ isSyncing: true, error: null });
    try {
      const { filters } = get();
      const result = await api.syncGames(maxGames, filters.perf_type);
      
      // Refresh games list after sync
      await get().fetchGames(1, false);
      await get().fetchStats();
      
      set({ isSyncing: false });
      return result;
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to sync games',
        isSyncing: false,
      });
      throw error;
    }
  },

  fetchStats: async () => {
    try {
      const stats = await api.getGameStats();
      set({ stats });
    } catch (error: any) {
      // Stats fetch failure is not critical
      console.error('Failed to fetch stats:', error);
    }
  },

  setFilters: (filters: GameFilters) => {
    set({ filters, page: 1 });
    get().fetchGames(1, false);
  },

  resetFilters: () => {
    set({ filters: {}, page: 1 });
    get().fetchGames(1, false);
  },

  clearError: () => set({ error: null }),
}));
