import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Plus,
  Clock,
  Settings,
  LogOut,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import precifixLogoWhite from '@/assets/precifix-logo-white.png';
import precifixIcon from '@/assets/precifix-icon.svg';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Plus, label: 'Nova Proposta', path: '/nova-proposta' },
  { icon: Clock, label: 'Histórico', path: '/historico' },
  { icon: Settings, label: 'Configurações', path: '/configuracoes' },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <aside
      className={cn(
        'gradient-dark flex flex-col transition-all duration-300 h-screen sticky top-0',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <img 
          src={collapsed ? precifixIcon : precifixLogoWhite} 
          alt="Precifix" 
          className={cn(
            'object-contain transition-all duration-300',
            collapsed ? 'h-8 w-8' : 'h-10 max-w-[160px]'
          )}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="ml-auto text-sidebar-foreground hover:text-primary-foreground hover:bg-sidebar-accent"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-brand'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'animate-scale-in')} />
              {!collapsed && (
                <span className="font-medium animate-fade-in">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-sidebar-border">
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Sair</span>}
        </button>
      </div>
    </aside>
  );
}
