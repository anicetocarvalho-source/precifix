import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SERVICE_LABELS, ServiceType } from '@/types/proposal';
import { formatCurrency } from '@/lib/pricing';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Zap, ArrowLeft, Save, FileText } from 'lucide-react';

export default function QuickQuote() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    clientName: '',
    serviceType: '' as ServiceType | '',
    value: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientName || !formData.serviceType || !formData.value) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    if (!user) {
      toast.error('Utilizador não autenticado');
      return;
    }

    setIsSubmitting(true);

    try {
      const numericValue = parseFloat(formData.value.replace(/[^\d.,]/g, '').replace(',', '.'));
      
      if (isNaN(numericValue) || numericValue <= 0) {
        toast.error('Por favor, insira um valor válido');
        setIsSubmitting(false);
        return;
      }

      const { data, error } = await supabase
        .from('proposals')
        .insert({
          user_id: user.id,
          client_name: formData.clientName,
          client_type: 'private',
          service_type: formData.serviceType,
          sector: 'Geral',
          duration_months: 1,
          complexity: 'low',
          maturity_level: 'medium',
          methodology: 'traditional',
          has_existing_team: false,
          locations: [],
          deliverables: [],
          total_value: numericValue,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Orçamento criado com sucesso!');
      navigate(`/proposta/${data.id}`);
    } catch (error) {
      console.error('Error creating quick quote:', error);
      toast.error('Erro ao criar orçamento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const numericValue = parseFloat(formData.value.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;

  return (
    <MainLayout>
      <div className="max-w-xl mx-auto py-8 animate-slide-up">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Dashboard
        </Button>

        <Card>
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Orçamento Rápido</CardTitle>
            <CardDescription>
              Crie um orçamento em segundos. Apenas o essencial, sem complicações.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="clientName">Nome do Cliente</Label>
                <Input
                  id="clientName"
                  placeholder="Ex: Empresa ABC, Lda"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceType">Tipo de Serviço</Label>
                <Select
                  value={formData.serviceType}
                  onValueChange={(value) => setFormData({ ...formData, serviceType: value as ServiceType })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SERVICE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">Valor do Orçamento (MZN)</Label>
                <Input
                  id="value"
                  type="text"
                  placeholder="Ex: 150000"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                />
              </div>

              {numericValue > 0 && (
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Valor Total</p>
                  <p className="text-3xl font-bold text-primary">
                    {formatCurrency(numericValue)}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => navigate('/')}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 gap-2"
                  disabled={isSubmitting || !formData.clientName || !formData.serviceType || !formData.value}
                >
                  {isSubmitting ? (
                    <>Guardando...</>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Criar Orçamento
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
