import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import NewProposal from "./pages/NewProposal";
import NewMultiServiceProposal from "./pages/NewMultiServiceProposal";
import EditProposal from "./pages/EditProposal";
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
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nova-proposta"
              element={
                <ProtectedRoute>
                  <NewProposal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nova-proposta-multi"
              element={
                <ProtectedRoute>
                  <NewMultiServiceProposal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/proposta/:id"
              element={
                <ProtectedRoute>
                  <ProposalView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/proposta/:id/editar"
              element={
                <ProtectedRoute>
                  <EditProposal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/historico"
              element={
                <ProtectedRoute>
                  <History />
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
