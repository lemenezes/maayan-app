import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, profile, profileLoading } = useAuth();
  const location = useLocation();

  if (loading || (user !== null && profileLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 text-[#0C5A86] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/entrar" state={{ from: location.pathname }} replace />;
  }

  if (profile?.status !== 'approved') {
    return <Navigate to="/aguardando-aprovacao" replace />;
  }

  return <>{children}</>;
}
