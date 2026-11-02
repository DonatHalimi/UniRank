import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', withCredentials: true, headers: { Accept: 'application/json' } });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('unirank_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
let refreshRequest;
api.interceptors.response.use((response) => response, async (error) => {
  const original = error.config;
  const authRequest = ['/auth/login', '/auth/register', '/auth/refresh'].some((path) => original?.url?.includes(path));
  if (error.response?.status !== 401 || !original || original._retry || authRequest) return Promise.reject(error);
  original._retry = true;
  try {
    refreshRequest ||= axios.post(`${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`, {}, { withCredentials: true })
      .then(({ data }) => { const token = data.data.accessToken; localStorage.setItem('unirank_access_token', token); return token; })
      .finally(() => { refreshRequest = null; });
    const token = await refreshRequest;
    original.headers.Authorization = `Bearer ${token}`;
    return api(original);
  } catch (refreshError) {
    localStorage.removeItem('unirank_access_token');
    window.dispatchEvent(new CustomEvent('unirank:session-expired'));
    return Promise.reject(refreshError);
  }
});
export default api;
