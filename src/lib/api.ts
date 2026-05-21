import axios from 'axios';
import { Game, Deal } from '../types';

const api = axios.create({
  baseURL: '/api',
});

export const gameService = {
  getGames: (params?: any) => api.get<Game[]>('/games/list', { params }).then(res => res.data),
  getGameDetails: (id: string | number) => api.get<Game>('/games/details', { params: { id } }).then(res => res.data),
  getDeals: (params?: any) => api.get<Deal[]>('/deals', { params }).then(res => res.data),
  summarizeGame: (gameTitle: string, description: string) => 
    api.post<{ summary: string }>('/ai/summarize', { gameTitle, description }).then(res => res.data),
  recommendGames: (favoriteGames: string[], allGames: string[]) =>
    api.post<{ recommendation: string }>('/ai/recommend', { favoriteGames, allGames }).then(res => res.data),
  trackClick: (gameId: string, platform: string, userId?: string) => 
    api.post('/analytics/click', { gameId, platform, userId }).then(res => res.data),
  trackView: (gameId: string) => 
    api.post('/analytics/view', { gameId }).then(res => res.data),
};
