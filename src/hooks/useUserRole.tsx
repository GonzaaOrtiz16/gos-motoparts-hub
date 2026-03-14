import { useAuth } from "./useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useUserRole = () => {
  const { user, loading: authLoading } = useAuth();

  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      if (error) throw error;
      return data?.map(r => r.role) || [];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', user.id)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const isAdmin = roles?.includes('admin') || false;
  const isVendedor = roles?.includes('vendedor') || false;
  const isStaff = isAdmin || isVendedor;
  const displayName = profile?.full_name || user?.email || '';

  return {
    roles,
    isAdmin,
    isVendedor,
    isStaff,
    displayName,
    loading: authLoading || rolesLoading,
    user,
  };
};
