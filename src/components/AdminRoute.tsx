import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useIsAdmin } from "../hooks/useIsAdmin";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({
  children
}: {
  children: React.ReactNode;
}) {
  const { loading: authLoading, profile, profileLoading } = useAuth();
  const isAdmin = useIsAdmin();

  if (authLoading || profileLoading || isAdmin === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 text-[#0C5A86] animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/acesso-nao-aprovado" replace />;
  }

  if (profile.status === "pending") {
    return <Navigate to="/aguardando-aprovacao" replace />;
  }

  if (profile.status === "suspended") {
    return <Navigate to="/acesso-suspenso" replace />;
  }

  if (profile.status !== "approved") {
    return <Navigate to="/acesso-nao-aprovado" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
