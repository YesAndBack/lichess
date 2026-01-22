import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';
import type { 
  User, 
  Game, 
  GameListResponse, 
  GameStats, 
  LoginResponse, 
  OAuthStartResponse,
  GameFilters 
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.token = null;
          localStorage.removeItem('token');
          window.location.href = '/';
        }
        return Promise.reject(error);
      }
    );

    // Load token from localStorage
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      this.token = savedToken;
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  // Auth endpoints
  async startOAuth(): Promise<OAuthStartResponse> {
    const response = await this.client.get<OAuthStartResponse>('/auth/login');
    return response.data;
  }

  async handleCallback(code: string, state: string): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>('/auth/callback', {
      code,
      state,
    });
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post('/auth/logout');
    this.setToken(null);
  }

  // User endpoints
  async getMyProfile(): Promise<User> {
    const response = await this.client.get<User>('/users/me');
    return response.data;
  }

  async refreshMyProfile(): Promise<User> {
    const response = await this.client.post<User>('/users/me/refresh');
    return response.data;
  }

  async getUserProfile(username: string): Promise<User> {
    const response = await this.client.get<User>(`/users/${username}`);
    return response.data;
  }

  // Game endpoints
  async getMyGames(
    page: number = 1,
    pageSize: number = 20,
    filters?: GameFilters
  ): Promise<GameListResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());
    
    if (filters?.perf_type) {
      params.append('perf_type', filters.perf_type);
    }
    if (filters?.result) {
      params.append('result', filters.result);
    }
    if (filters?.rated !== undefined) {
      params.append('rated', filters.rated.toString());
    }

    const response = await this.client.get<GameListResponse>(`/games/me?${params.toString()}`);
    return response.data;
  }

  async syncGames(maxGames: number = 50, perfType?: string): Promise<{ fetched: number; saved: number }> {
    const params = new URLSearchParams();
    params.append('max_games', maxGames.toString());
    if (perfType) {
      params.append('perf_type', perfType);
    }

    const response = await this.client.post(`/games/me/sync?${params.toString()}`);
    return response.data;
  }

  async getGameStats(): Promise<GameStats> {
    const response = await this.client.get<GameStats>('/games/stats/me');
    return response.data;
  }

  async getGame(gameId: string): Promise<Game> {
    const response = await this.client.get<Game>(`/games/me/${gameId}`);
    return response.data;
  }
}

export const api = new ApiClient();
