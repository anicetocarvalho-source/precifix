import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import PagamentoPendente from "./pages/PagamentoPendente";
import Dashboard from "./pages/Dashboard";
import NewProposal from "./pages/NewProposal";
import NewMultiServiceProposal from "./pages/NewMultiServiceProposal";
import QuickQuote from "./pages/QuickQuote";
import EditProposal from "./pages/EditProposal";
import EditMultiServiceProposal from "./pages/EditMultiServiceProposal";
import ProposalView from "./pages/ProposalView";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/pagamento-pendente"
              element={
                <ProtectedRoute>
                  <PagamentoPendente />
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <SubscriptionGate>
                    <Dashboard />
                  </SubscriptionGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/nova-proposta"
              element={
                <ProtectedRoute>
                  <SubscriptionGate>
                    <NewProposal />
                  </SubscriptionGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/nova-proposta-multi"
              element={
                <ProtectedRoute>
                  <SubscriptionGate>
                    <NewMultiServiceProposal />
                  </SubscriptionGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/orcamento-rapido"
              element={
                <ProtectedRoute>
                  <SubscriptionGate>
                    <QuickQuote />
                  </SubscriptionGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/proposta/:id"
              element={
                <ProtectedRoute>
                  <SubscriptionGate>
                    <ProposalView />
                  </SubscriptionGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/proposta/:id/editar"
              element={
                <ProtectedRoute>
                  <SubscriptionGate>
                    <EditProposal />
                  </SubscriptionGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/proposta/:id/editar-multi"
              element={
                <ProtectedRoute>
                  <SubscriptionGate>
                    <EditMultiServiceProposal />
                  </SubscriptionGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/historico"
              element={
                <ProtectedRoute>
                  <SubscriptionGate>
                    <History />
                  </SubscriptionGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/configuracoes"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
