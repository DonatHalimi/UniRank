import { useEffect, useRef, useState } from 'react';
import {
    Bell,
    ChevronDown,
    LogOut,
    Settings,
    Shield,
    UploadCloud,
    UserRound,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import RoleBadge from './RoleBadge.jsx';
import Avatar from './Avatar.jsx';

export default function UserMenu({ unread = 0 }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);
    const triggerRef = useRef(null);
    const firstItemRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        function onPointerDown(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('touchstart', onPointerDown);
        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('touchstart', onPointerDown);
        };
    }, [open]);

    useEffect(() => {
        if (!open) return;
        function onKey(event) {
            if (event.key === 'Escape') {
                setOpen(false);
                triggerRef.current?.focus();
            }
        }
        document.addEventListener('keydown', onKey);
        const id = window.setTimeout(() => firstItemRef.current?.focus(), 0);
        return () => {
            document.removeEventListener('keydown', onKey);
            window.clearTimeout(id);
        };
    }, [open]);

    async function signOut() {
        setOpen(false);
        try {
            await logout();
            toast.success('Signed out.');
            navigate('/');
        } catch {
            toast.error('Could not sign out.');
        }
    }

    if (!user) return null;

    const items = [
        { to: '/me', icon: UserRound, label: 'Profile' },
        { to: '/notifications', icon: Bell, label: 'Notifications', badge: unread },
        { to: '/materials/upload', icon: UploadCloud, label: 'Upload material' },
        ...(user.role === 'admin'
            ? [{ to: '/admin', icon: Shield, label: 'Admin panel' }]
            : []),
        { to: '/settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <div ref={containerRef} className="relative">
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-haspopup="menu"
                aria-expanded={open}
                className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            >
                <Avatar name={user.username} size="sm" />
                <span className="hidden max-w-[10rem] truncate sm:inline" dir="auto">
                    {user.username}
                </span>
                <ChevronDown
                    size={14}
                    aria-hidden="true"
                    className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
                />
                {unread > 0 && (
                    <span
                        aria-label={`${unread} unread notifications`}
                        className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500/90 px-1.5 text-[10px] font-semibold text-white"
                    >
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        role="menu"
                        aria-label="User menu"
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute right-0 z-50 mt-2 w-64 origin-top-right overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center gap-3 border-b border-white/10 p-4">
                            <Avatar name={user.username} size="md" />
                            <div className="min-w-0 flex-1">
                                <div
                                    dir="ltr"
                                    className="flex flex-wrap items-center gap-x-2 gap-y-1 [unicode-bidi:isolate]"
                                >
                                    <span className="truncate font-medium text-white" dir="auto">
                                        {user.username}
                                    </span>
                                    <RoleBadge role={user.role} />
                                </div>
                                {user.email && (
                                    <p className="mt-0.5 truncate text-xs text-slate-400" dir="auto">
                                        {user.email}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Items */}
                        <ul className="py-1.5" role="none">
                            {items.map(({ to, icon: Icon, label, badge }, index) => (
                                <li key={to} role="none">
                                    <Link
                                        ref={index === 0 ? firstItemRef : undefined}
                                        role="menuitem"
                                        to={to}
                                        onClick={() => setOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5 hover:text-white focus:bg-white/5 focus:text-white focus:outline-none"
                                    >
                                        <Icon size={16} className="text-slate-400" aria-hidden="true" />
                                        <span className="flex-1">{label}</span>
                                        {badge > 0 && (
                                            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500/90 px-1.5 text-[10px] font-semibold text-white">
                                                {badge > 9 ? '9+' : badge}
                                            </span>
                                        )}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        <div className="border-t border-white/10 p-1.5">
                            <button
                                type="button"
                                role="menuitem"
                                onClick={signOut}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200 focus:bg-rose-500/10 focus:text-rose-200 focus:outline-none"
                            >
                                <LogOut size={16} aria-hidden="true" />
                                Sign out
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}