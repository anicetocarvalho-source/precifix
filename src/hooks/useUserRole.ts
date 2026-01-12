import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'gestor' | 'comercial';

interface UserRoleData {
  role: AppRole | null;
  loading: boolean;
  isAdmin: boolean;
  isGestor: boolean;
  isComercial: boolean;
  hasRole: (role: AppRole) => boolean;
  canManageUsers: boolean;
  canManagePricing: boolean;
  canViewAllProposals: boolean;
  canEditAllProposals: boolean;
}

export function useUserRole(): UserRoleData {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching user role:', error);
          setRole(null);
        } else {
          setRole(data?.role as AppRole | null);
        }
      } catch (err) {
        console.error('Error fetching user role:', err);
        setRole(null);
      } finally {
        setLoading(false);
      }
    }

    fetchRole();
  }, [user]);

  const isAdmin = role === 'admin';
  const isGestor = role === 'gestor';
  const isComercial = role === 'comercial';

  const hasRole = (checkRole: AppRole) => role === checkRole;

  // Permission definitions
  const canManageUsers = isAdmin;
  const canManagePricing = isAdmin || isGestor;
  const canViewAllProposals = isAdmin || isGestor;
  const canEditAllProposals = isAdmin;

  return {
    role,
    loading,
    isAdmin,
    isGestor,
    isComercial,
    hasRole,
    canManageUsers,
    canManagePricing,
    canViewAllProposals,
    canEditAllProposals,
  };
}
