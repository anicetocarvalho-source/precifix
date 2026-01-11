import { Bell, User, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Topbar() {
  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Bem-vindo de volta</h2>
          <p className="text-sm text-muted-foreground">Gerencie suas propostas com inteligência</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Language */}
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Globe className="w-5 h-5" />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
        </Button>

        {/* User */}
        <div className="flex items-center gap-3 pl-3 border-l border-border">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">João Silva</p>
            <p className="text-xs text-muted-foreground">Gestor de Projectos</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>
    </header>
  );
}
