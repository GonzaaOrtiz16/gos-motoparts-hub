import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: 'admin' | 'vendedor' | 'staff';
  redirectTo?: string;
}

const ProtectedRoute = ({ children, requiredRole, redirectTo = '/auth' }: ProtectedRouteProps) => {
  const { user, isAdmin, isVendedor, isStaff, loading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate(redirectTo);
      return;
    }
    const hasAccess =
      requiredRole === 'admin' ? isAdmin :
      requiredRole === 'vendedor' ? isVendedor || isAdmin :
      requiredRole === 'staff' ? isStaff : false;

    if (!hasAccess) {
      toast.error("No tenés permisos para acceder a esta sección");
      navigate('/');
    }
  }, [loading, user, isAdmin, isVendedor, isStaff, requiredRole, navigate, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hasAccess =
    requiredRole === 'admin' ? isAdmin :
    requiredRole === 'vendedor' ? isVendedor || isAdmin :
    requiredRole === 'staff' ? isStaff : false;

  if (!user || !hasAccess) return null;

  return <>{children}</>;
};

export default ProtectedRoute;
