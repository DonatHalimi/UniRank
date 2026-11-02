import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api.js';
import { authService } from '../services/auth.service.js';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    async function boot() {
      try {
        if (!localStorage.getItem('unirank_access_token')) {
          const { data } = await api.post('/auth/refresh', {});
          localStorage.setItem('unirank_access_token', data.data.accessToken);
        }
        const currentUser = await authService.me(); if (active) setUser(currentUser);
      } catch { localStorage.removeItem('unirank_access_token'); }
      finally { if (active) setLoading(false); }
    }
    boot();
    const expired = () => setUser(null);
    window.addEventListener('unirank:session-expired', expired);
    return () => { active = false; window.removeEventListener('unirank:session-expired', expired); };
  }, []);
  const value = useMemo(() => ({
    user, loading, setUser,
    async login(credentials) { const next = await authService.login(credentials); setUser(next); return next; },
    async register(details) { const next = await authService.register(details); setUser(next); return next; },
    async logout() { await authService.logout(); setUser(null); },
  }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('useAuth must be used within AuthProvider.'); return value; }
