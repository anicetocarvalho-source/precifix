import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, Calculator, Users, Percent } from 'lucide-react';
import { usePricingParameters, DEFAULT_PRICING_PARAMETERS } from '@/hooks/usePricingParameters';
import { formatCurrency } from '@/lib/pricing';

export function PricingParametersForm() {
  const { parameters, isLoading, saveParameters, resetToDefaults } = usePricingParameters();
  
  const [formData, setFormData] = useState({
    rateSeniorManager: 100000,
    rateConsultant: 75000,
    rateAnalyst: 45000,
    rateCoordinator: 60000,
    rateTrainer: 50000,
    multiplierLow: 1,
    multiplierMedium: 1.2,
    multiplierHigh: 1.5,
    overheadPercentage: 15,
    marginPercentage: 25,
  });

  useEffect(() => {
    if (parameters) {
      setFormData({
        rateSeniorManager: parameters.rateSeniorManager,
        rateConsultant: parameters.rateConsultant,
        rateAnalyst: parameters.rateAnalyst,
        rateCoordinator: parameters.rateCoordinator,
        rateTrainer: parameters.rateTrainer,
        multiplierLow: parameters.multiplierLow,
        multiplierMedium: parameters.multiplierMedium,
        multiplierHigh: parameters.multiplierHigh,
        overheadPercentage: parameters.overheadPercentage * 100,
        marginPercentage: parameters.marginPercentage * 100,
      });
    }
  }, [parameters]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, [field]: numValue }));
  };

  const handleSave = () => {
    saveParameters.mutate({
      rateSeniorManager: formData.rateSeniorManager,
      rateConsultant: formData.rateConsultant,
      rateAnalyst: formData.rateAnalyst,
      rateCoordinator: formData.rateCoordinator,
      rateTrainer: formData.rateTrainer,
      multiplierLow: formData.multiplierLow,
      multiplierMedium: formData.multiplierMedium,
      multiplierHigh: formData.multiplierHigh,
      overheadPercentage: formData.overheadPercentage / 100,
      marginPercentage: formData.marginPercentage / 100,
    });
  };

  const handleReset = () => {
    setFormData({
      rateSeniorManager: DEFAULT_PRICING_PARAMETERS.rateSeniorManager,
      rateConsultant: DEFAULT_PRICING_PARAMETERS.rateConsultant,
      rateAnalyst: DEFAULT_PRICING_PARAMETERS.rateAnalyst,
      rateCoordinator: DEFAULT_PRICING_PARAMETERS.rateCoordinator,
      rateTrainer: DEFAULT_PRICING_PARAMETERS.rateTrainer,
      multiplierLow: DEFAULT_PRICING_PARAMETERS.multiplierLow,
      multiplierMedium: DEFAULT_PRICING_PARAMETERS.multiplierMedium,
      multiplierHigh: DEFAULT_PRICING_PARAMETERS.multiplierHigh,
      overheadPercentage: DEFAULT_PRICING_PARAMETERS.overheadPercentage * 100,
      marginPercentage: DEFAULT_PRICING_PARAMETERS.marginPercentage * 100,
    });
    resetToDefaults.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-2">Parâmetros de Precificação</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Configure as taxas horárias, multiplicadores de complexidade e percentagens utilizados no cálculo automático dos orçamentos.
        </p>
      </div>

      {/* Hourly Rates */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-foreground">
          <Users className="w-4 h-4 text-primary" />
          <h3 className="font-medium">Taxas Horárias (Kz/hora)</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Gestor Sénior</label>
            <input
              type="number"
              value={formData.rateSeniorManager}
              onChange={(e) => handleChange('rateSeniorManager', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">{formatCurrency(formData.rateSeniorManager)}/hora</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Consultor Pleno</label>
            <input
              type="number"
              value={formData.rateConsultant}
              onChange={(e) => handleChange('rateConsultant', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">{formatCurrency(formData.rateConsultant)}/hora</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Analista</label>
            <input
              type="number"
              value={formData.rateAnalyst}
              onChange={(e) => handleChange('rateAnalyst', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">{formatCurrency(formData.rateAnalyst)}/hora</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Coordenador Local</label>
            <input
              type="number"
              value={formData.rateCoordinator}
              onChange={(e) => handleChange('rateCoordinator', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">{formatCurrency(formData.rateCoordinator)}/hora</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Formador</label>
            <input
              type="number"
              value={formData.rateTrainer}
              onChange={(e) => handleChange('rateTrainer', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">{formatCurrency(formData.rateTrainer)}/hora</p>
          </div>
        </div>
      </div>

      {/* Complexity Multipliers */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-foreground">
          <Calculator className="w-4 h-4 text-primary" />
          <h3 className="font-medium">Multiplicadores de Complexidade</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Baixa</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={formData.multiplierLow}
              onChange={(e) => handleChange('multiplierLow', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">Multiplicador: {formData.multiplierLow}x</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Média</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={formData.multiplierMedium}
              onChange={(e) => handleChange('multiplierMedium', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">Multiplicador: {formData.multiplierMedium}x</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Alta</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={formData.multiplierHigh}
              onChange={(e) => handleChange('multiplierHigh', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">Multiplicador: {formData.multiplierHigh}x</p>
          </div>
        </div>
      </div>

      {/* Percentages */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-foreground">
          <Percent className="w-4 h-4 text-primary" />
          <h3 className="font-medium">Percentagens</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Overhead (%)</label>
            <input
              type="number"
              step="1"
              min="0"
              max="100"
              value={formData.overheadPercentage}
              onChange={(e) => handleChange('overheadPercentage', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">Custos indirectos: {formData.overheadPercentage}%</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Margem (%)</label>
            <input
              type="number"
              step="1"
              min="0"
              max="100"
              value={formData.marginPercentage}
              onChange={(e) => handleChange('marginPercentage', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">Margem de lucro: {formData.marginPercentage}%</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t border-border">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={resetToDefaults.isPending}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Restaurar Padrão
        </Button>
        <Button
          onClick={handleSave}
          disabled={saveParameters.isPending}
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          {saveParameters.isPending ? 'A guardar...' : 'Guardar Alterações'}
        </Button>
      </div>
    </div>
  );
}
