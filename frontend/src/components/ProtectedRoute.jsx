import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSkeleton from './LoadingSkeleton.jsx';
export default function ProtectedRoute({ requiredRole }) {
  const { user, loading } = useAuth(); const location = useLocation();
  if (loading) return <div className="mx-auto max-w-3xl py-12"><LoadingSkeleton rows={2} /></div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (requiredRole && ![].concat(requiredRole).includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}
