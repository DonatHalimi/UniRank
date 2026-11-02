import api from './api.js';
export const authService = {
  async login(credentials) { const { data } = await api.post('/auth/login', credentials); localStorage.setItem('unirank_access_token', data.data.accessToken); return data.data.user; },
  async register(details) { const { data } = await api.post('/auth/register', details); localStorage.setItem('unirank_access_token', data.data.accessToken); return data.data.user; },
  async me() { const { data } = await api.get('/auth/me'); return data.data.user; },
  async logout() { try { await api.post('/auth/logout'); } finally { localStorage.removeItem('unirank_access_token'); } },
};
