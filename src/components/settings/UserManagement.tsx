import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole, AppRole } from '@/hooks/useUserRole';
import { Loader2, Shield, UserCog, Briefcase, UserX, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  role: AppRole | null;
  created_at: string;
}

const roleConfig: Record<AppRole, { label: string; color: string; icon: typeof Shield }> = {
  admin: { label: 'Administrador', color: 'bg-destructive text-destructive-foreground', icon: Shield },
  gestor: { label: 'Gestor', color: 'bg-primary text-primary-foreground', icon: UserCog },
  comercial: { label: 'Comercial', color: 'bg-secondary text-secondary-foreground', icon: Briefcase },
};

export function UserManagement() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AppRole>('comercial');
  const [inviting, setInviting] = useState(false);
  const { toast } = useToast();
  const { canManageUsers, isAdmin } = useUserRole();

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, created_at');

      if (profilesError) throw profilesError;

      // Fetch roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // We need to get user emails - for now we'll use the profile data
      // In a real app, you'd have an edge function to fetch this securely
      const usersWithRoles: UserWithRole[] = profiles?.map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.user_id);
        return {
          id: profile.user_id,
          email: '', // We can't access auth.users directly
          full_name: profile.full_name,
          role: userRole?.role as AppRole | null,
          created_at: profile.created_at,
        };
      }) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os utilizadores.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function updateUserRole(userId: string, newRole: AppRole | 'none') {
    if (!canManageUsers) {
      toast({
        title: 'Sem permissão',
        description: 'Não tem permissão para alterar papéis de utilizadores.',
        variant: 'destructive',
      });
      return;
    }

    setUpdating(userId);
    try {
      if (newRole === 'none') {
        // Remove role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Check if user already has a role
        const existingUser = users.find(u => u.id === userId);
        
        if (existingUser?.role) {
          // Update existing role
          const { error } = await supabase
            .from('user_roles')
            .update({ role: newRole })
            .eq('user_id', userId);

          if (error) throw error;
        } else {
          // Insert new role
          const { error } = await supabase
            .from('user_roles')
            .insert({ user_id: userId, role: newRole });

          if (error) throw error;
        }
      }

      toast({
        title: 'Sucesso',
        description: 'Papel do utilizador atualizado com sucesso.',
      });

      // Refresh users list
      await fetchUsers();
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível atualizar o papel do utilizador.',
        variant: 'destructive',
      });
    } finally {
      setUpdating(null);
    }
  }

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Gestão de Utilizadores
          </CardTitle>
          <CardDescription>
            Apenas administradores podem gerir utilizadores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <UserX className="w-12 h-12 mb-4 opacity-50" />
            <p>Não tem permissão para aceder a esta secção.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Gestão de Utilizadores
            </CardTitle>
            <CardDescription>
              Gerir papéis e permissões dos utilizadores do sistema.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Role Legend */}
        <div className="mb-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-3">Permissões por Papel</h4>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex items-start gap-2">
              <Badge className={roleConfig.admin.color}>Admin</Badge>
              <span className="text-xs text-muted-foreground">
                Acesso total: gerir utilizadores, preços e todas as propostas
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Badge className={roleConfig.gestor.color}>Gestor</Badge>
              <span className="text-xs text-muted-foreground">
                Gerir preços e ver todas as propostas
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Badge className={roleConfig.comercial.color}>Comercial</Badge>
              <span className="text-xs text-muted-foreground">
                Gerir apenas as suas próprias propostas
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <p>Nenhum utilizador encontrado.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Papel Atual</TableHead>
                <TableHead>Data de Registo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const RoleIcon = user.role ? roleConfig[user.role].icon : UserX;
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <RoleIcon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{user.full_name || 'Sem nome'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.role ? (
                        <Badge className={roleConfig[user.role].color}>
                          {roleConfig[user.role].label}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Sem papel</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('pt-PT')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={user.role || 'none'}
                        onValueChange={(value) => updateUserRole(user.id, value as AppRole | 'none')}
                        disabled={updating === user.id}
                      >
                        <SelectTrigger className="w-[160px]">
                          {updating === user.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <SelectValue />
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="gestor">Gestor</SelectItem>
                          <SelectItem value="comercial">Comercial</SelectItem>
                          <SelectItem value="none">Sem papel</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
