import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useProposals } from '@/hooks/useProposals';
import { useUserRole } from '@/hooks/useUserRole';
import { formatCurrency } from '@/lib/pricing';
import { getServiceLabel } from '@/lib/serviceLabels';
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
  Copy,
  Pencil,
  User,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ProposalStatus } from '@/types/proposal';
import { HistoryTableSkeleton } from '@/components/skeletons/HistorySkeleton';
import { DuplicateProposalDialog } from '@/components/proposal/DuplicateProposalDialog';
import { STATUS_CONFIG, formatDuration } from '@/lib/statusLabels';

type SortColumn = 'clientName' | 'author' | 'serviceType' | 'duration' | 'value' | 'status' | 'date';
type SortDirection = 'asc' | 'desc';

export default function History() {
  const navigate = useNavigate();
  const { proposals, isLoading, deleteProposal, duplicateProposal } = useProposals();
  const { canViewAllProposals, canEditAllProposals } = useUserRole();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | 'all'>('all');
  const [duplicateDialogData, setDuplicateDialogData] = useState<{ id: string; name: string } | null>(null);
  const [sortColumn, setSortColumn] = useState<SortColumn>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-3 h-3 ml-1" /> 
      : <ArrowDown className="w-3 h-3 ml-1" />;
  };

  const filteredProposals = useMemo(() => {
    return proposals.filter((proposal) => {
      const matchesSearch = proposal.formData.clientName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [proposals, searchTerm, statusFilter]);

  // Reset to first page when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: ProposalStatus | 'all') => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const sortedProposals = useMemo(() => {
    const sorted = [...filteredProposals].sort((a, b) => {
      let comparison = 0;
      
      switch (sortColumn) {
        case 'clientName':
          comparison = a.formData.clientName.localeCompare(b.formData.clientName);
          break;
        case 'author':
          comparison = (a.authorName || '').localeCompare(b.authorName || '');
          break;
        case 'serviceType':
          comparison = a.formData.serviceType.localeCompare(b.formData.serviceType);
          break;
        case 'duration':
          comparison = a.formData.estimatedDuration - b.formData.estimatedDuration;
          break;
        case 'value':
          comparison = a.pricing.finalPrice - b.pricing.finalPrice;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  }, [filteredProposals, sortColumn, sortDirection]);

  // Pagination calculations
  const totalPages = Math.ceil(sortedProposals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProposals = sortedProposals.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

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
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value as ProposalStatus | 'all')}
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
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-muted-foreground">Mostrar:</span>
            <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <HistoryTableSkeleton showAuthor={canViewAllProposals} />
        ) : filteredProposals.length === 0 ? (
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden animate-slide-up" style={{ animationDelay: '0.2s' }}>
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
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th 
                      className="text-left py-4 px-6 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => handleSort('clientName')}
                    >
                      <div className="flex items-center">
                        Cliente
                        {getSortIcon('clientName')}
                      </div>
                    </th>
                    {canViewAllProposals && (
                      <th 
                        className="text-left py-4 px-6 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                        onClick={() => handleSort('author')}
                      >
                        <div className="flex items-center">
                          Autor
                          {getSortIcon('author')}
                        </div>
                      </th>
                    )}
                    <th 
                      className="text-left py-4 px-6 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => handleSort('serviceType')}
                    >
                      <div className="flex items-center">
                        Serviço
                        {getSortIcon('serviceType')}
                      </div>
                    </th>
                    <th 
                      className="text-center py-4 px-6 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => handleSort('duration')}
                    >
                      <div className="flex items-center justify-center">
                        Duração
                        {getSortIcon('duration')}
                      </div>
                    </th>
                    <th 
                      className="text-right py-4 px-6 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => handleSort('value')}
                    >
                      <div className="flex items-center justify-end">
                        Valor
                        {getSortIcon('value')}
                      </div>
                    </th>
                    <th 
                      className="text-center py-4 px-6 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center justify-center">
                        Status
                        {getSortIcon('status')}
                      </div>
                    </th>
                    <th 
                      className="text-center py-4 px-6 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center justify-center">
                        Data
                        {getSortIcon('date')}
                      </div>
                    </th>
                    <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProposals.map((proposal) => (
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
                      {canViewAllProposals && (
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className={cn(
                                "text-sm",
                                proposal.isOwner ? "text-primary font-medium" : "text-foreground"
                              )}>
                                {proposal.isOwner ? 'Você' : proposal.authorName}
                              </p>
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="py-4 px-6 text-foreground">
                        {getServiceLabel(proposal.formData.serviceType)}
                      </td>
                      <td className="py-4 px-6 text-center text-foreground">
                        {formatDuration(proposal.formData.estimatedDuration, proposal.formData.durationUnit)}
                      </td>
                      <td className="py-4 px-6 text-right font-semibold text-foreground">
                        {formatCurrency(proposal.pricing.finalPrice)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={cn(
                            'px-3 py-1 rounded-full text-xs font-medium',
                            STATUS_CONFIG[proposal.status].color
                          )}
                        >
                          {STATUS_CONFIG[proposal.status].label}
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
                          {(proposal.isOwner || canEditAllProposals) && (
                            <>
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
                                onClick={() => setDuplicateDialogData({ 
                                  id: proposal.id, 
                                  name: proposal.formData.clientName 
                                })}
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
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  A mostrar {startIndex + 1}-{Math.min(endIndex, sortedProposals.length)} de {sortedProposals.length} propostas
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="w-8"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Duplicate Proposal Dialog */}
        <DuplicateProposalDialog
          open={!!duplicateDialogData}
          onOpenChange={(open) => !open && setDuplicateDialogData(null)}
          originalName={duplicateDialogData?.name || ''}
          onConfirm={(newName) => {
            if (duplicateDialogData) {
              duplicateProposal.mutate(
                { id: duplicateDialogData.id, newClientName: newName },
                {
                  onSuccess: () => {
                    setDuplicateDialogData(null);
                  },
                }
              );
            }
          }}
          isPending={duplicateProposal.isPending}
        />
      </div>
    </MainLayout>
  );
}
