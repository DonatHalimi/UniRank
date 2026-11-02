import { useEffect, useState } from 'react';
import { LogOut, Menu, Shield, X } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import toast from 'react-hot-toast';
import UserMenu from './UserMenu.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setUnread(0);
      return;
    }
    api
      .get('/notifications')
      .then(({ data }) => setUnread(data.data.unreadCount))
      .catch(() => { });
  }, [user]);

  async function signOut() {
    try {
      await logout();
      toast.success('Signed out.');
      navigate('/');
    } catch {
      toast.error('Could not sign out.');
    }
  }

  const links = (
    <>
      <NavLink
        to="/subjects"
        className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
      >
        Browse subjects
      </NavLink>
      {user && (
        <NavLink to="/materials/upload" className="nav-link">
          Upload
        </NavLink>
      )}
      {user?.role === 'admin' && (
        <NavLink to="/admin" className="nav-link">
          <Shield size={15} /> Admin
        </NavLink>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink/85 backdrop-blur-xl">
      <div className="container-shell flex items-center justify-between gap-6 py-4">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <img
            src="/icon.png"
            alt="UniRank"
            className="h-9 w-9 rounded-xl object-cover"
          />
          <span className="text-lg font-bold text-white">
            Uni<span className="text-accent">Rank</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">{links}</nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <UserMenu unread={unread} />
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Log in
              </Link>
              <Link to="/register" className="button-primary">
                Create account
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileOpen((open) => !open)}
          aria-label="Toggle navigation"
          className="rounded-lg p-2 text-slate-300 md:hidden"
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/5 px-5 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {links}
            {user ? (
              <>
                <Link to="/me" className="nav-link">
                  Profile · {user.username}
                </Link>
                <Link to="/notifications" className="nav-link">
                  Notifications{unread > 0 ? ` · ${unread} new` : ''}
                </Link>
                <button onClick={signOut} className="nav-link flex items-center gap-2 text-left">
                  <LogOut size={15} aria-hidden="true" /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  Log in
                </Link>
                <Link to="/register" className="button-primary justify-center">
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}