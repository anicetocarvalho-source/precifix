import { MainLayout } from '@/components/layout/MainLayout';
import { useProposals } from '@/hooks/useProposals';
import { formatCurrency } from '@/lib/pricing';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Search,
  Filter,
  Calendar,
  Building,
  ArrowUpRight,
  Trash2,
  FileText,
  Plus,
  Loader2,
  Copy,
  Pencil,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProposalStatus } from '@/types/proposal';
import { useState } from 'react';

const statusConfig: Record<ProposalStatus, { label: string; color: string }> = {
  draft: { label: 'Rascunho', color: 'bg-muted text-muted-foreground' },
  pending: { label: 'Pendente', color: 'bg-warning/10 text-warning' },
  sent: { label: 'Enviada', color: 'bg-info/10 text-info' },
  approved: { label: 'Aprovada', color: 'bg-success/10 text-success' },
  rejected: { label: 'Rejeitada', color: 'bg-destructive/10 text-destructive' },
};

export default function History() {
  const navigate = useNavigate();
  const { proposals, isLoading, deleteProposal, duplicateProposal } = useProposals();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | 'all'>('all');

  const filteredProposals = proposals.filter((proposal) => {
    const matchesSearch = proposal.formData.clientName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalValue = filteredProposals.reduce((sum, p) => sum + p.pricing.finalPrice, 0);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-slide-up">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Histórico de Propostas</h1>
            <p className="text-muted-foreground">
              {filteredProposals.length} proposta(s) • Valor total: {formatCurrency(totalValue)}
            </p>
          </div>
          <Link to="/nova-proposta">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Proposta
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nome do cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ProposalStatus | 'all')}
              className="px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">Todos os status</option>
              <option value="draft">Rascunho</option>
              <option value="pending">Pendente</option>
              <option value="sent">Enviada</option>
              <option value="approved">Aprovada</option>
              <option value="rejected">Rejeitada</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {isLoading ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredProposals.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {proposals.length === 0 ? 'Nenhuma proposta criada' : 'Nenhum resultado encontrado'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {proposals.length === 0
                  ? 'Comece criando a sua primeira proposta'
                  : 'Tente ajustar os filtros de busca'}
              </p>
              {proposals.length === 0 && (
                <Link to="/nova-proposta">
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Criar Proposta
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Cliente</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Serviço</th>
                    <th className="text-center py-4 px-6 text-sm font-medium text-muted-foreground">Duração</th>
                    <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Valor</th>
                    <th className="text-center py-4 px-6 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-center py-4 px-6 text-sm font-medium text-muted-foreground">Data</th>
                    <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProposals.map((proposal) => (
                    <tr key={proposal.id} className="border-b border-border hover:bg-muted/30 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {proposal.formData.clientName || 'Sem nome'}
                            </p>
                            <p className="text-sm text-muted-foreground">{proposal.formData.sector}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-foreground capitalize">
                        {proposal.formData.serviceType === 'pmo' && 'PMO'}
                        {proposal.formData.serviceType === 'restructuring' && 'Reestruturação'}
                        {proposal.formData.serviceType === 'monitoring' && 'Acompanhamento'}
                        {proposal.formData.serviceType === 'training' && 'Formação'}
                        {proposal.formData.serviceType === 'audit' && 'Auditoria'}
                        {proposal.formData.serviceType === 'strategy' && 'Estratégia'}
                      </td>
                      <td className="py-4 px-6 text-center text-foreground">
                        {proposal.formData.estimatedDuration} meses
                      </td>
                      <td className="py-4 px-6 text-right font-semibold text-foreground">
                        {formatCurrency(proposal.pricing.finalPrice)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={cn(
                            'px-3 py-1 rounded-full text-xs font-medium',
                            statusConfig[proposal.status].color
                          )}
                        >
                          {statusConfig[proposal.status].label}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span className="text-sm">
                            {new Date(proposal.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/proposta/${proposal.id}`}>
                            <Button variant="ghost" size="sm" className="gap-1">
                              Ver
                              <ArrowUpRight className="w-3 h-3" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/proposta/${proposal.id}/editar`)}
                            className="text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Editar proposta"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => duplicateProposal.mutate(proposal.id)}
                            className="text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Duplicar proposta"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteProposal.mutate(proposal.id)}
                            className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Eliminar proposta"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
