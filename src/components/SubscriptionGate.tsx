import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

interface SubscriptionGateProps {
  children: React.ReactNode;
}

/**
 * Bloqueia o acesso a rotas protegidas quando a subscrição não está activa.
 * Deve ser colocado dentro de <ProtectedRoute> (utilizador já autenticado).
 */
export function SubscriptionGate({ children }: SubscriptionGateProps) {
  const { isLoading, canAccess, subscription } = useSubscription();

  if (isLoading || !subscription) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground">A verificar subscrição...</p>
        </div>
      </div>
    );
  }

  if (!canAccess) {
    return <Navigate to="/pagamento-pendente" replace />;
  }

  return <>{children}</>;
}
