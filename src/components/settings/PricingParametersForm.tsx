import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, Calculator, Users, Percent, Camera, Monitor, Music } from 'lucide-react';
import { usePricingParameters, DEFAULT_PRICING_PARAMETERS } from '@/hooks/usePricingParameters';
import { formatCurrency } from '@/lib/pricing';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function PricingParametersForm() {
  const { parameters, isLoading, saveParameters, resetToDefaults } = usePricingParameters();
  
  const [formData, setFormData] = useState({
    // Consulting rates
    rateSeniorManager: DEFAULT_PRICING_PARAMETERS.rateSeniorManager,
    rateConsultant: DEFAULT_PRICING_PARAMETERS.rateConsultant,
    rateAnalyst: DEFAULT_PRICING_PARAMETERS.rateAnalyst,
    rateCoordinator: DEFAULT_PRICING_PARAMETERS.rateCoordinator,
    rateTrainer: DEFAULT_PRICING_PARAMETERS.rateTrainer,
    // Creative rates
    rateVideographer: DEFAULT_PRICING_PARAMETERS.rateVideographer,
    ratePhotographer: DEFAULT_PRICING_PARAMETERS.ratePhotographer,
    rateVideoEditor: DEFAULT_PRICING_PARAMETERS.rateVideoEditor,
    rateGraphicDesigner: DEFAULT_PRICING_PARAMETERS.rateGraphicDesigner,
    rateWebDeveloper: DEFAULT_PRICING_PARAMETERS.rateWebDeveloper,
    rateSoundTechnician: DEFAULT_PRICING_PARAMETERS.rateSoundTechnician,
    rateLightingTechnician: DEFAULT_PRICING_PARAMETERS.rateLightingTechnician,
    // Multipliers
    multiplierLow: DEFAULT_PRICING_PARAMETERS.multiplierLow,
    multiplierMedium: DEFAULT_PRICING_PARAMETERS.multiplierMedium,
    multiplierHigh: DEFAULT_PRICING_PARAMETERS.multiplierHigh,
    // Extras
    extrasDrone: DEFAULT_PRICING_PARAMETERS.extrasDrone,
    extrasMulticamStreaming: DEFAULT_PRICING_PARAMETERS.extrasMulticamStreaming,
    extrasAdvancedLedLighting: DEFAULT_PRICING_PARAMETERS.extrasAdvancedLedLighting,
    extrasSlider: DEFAULT_PRICING_PARAMETERS.extrasSlider,
    extrasCrane: DEFAULT_PRICING_PARAMETERS.extrasCrane,
    extrasAerialCrane: DEFAULT_PRICING_PARAMETERS.extrasAerialCrane,
    // Percentages
    overheadPercentage: DEFAULT_PRICING_PARAMETERS.overheadPercentage * 100,
    marginPercentage: DEFAULT_PRICING_PARAMETERS.marginPercentage * 100,
  });

  useEffect(() => {
    if (parameters) {
      setFormData({
        rateSeniorManager: parameters.rateSeniorManager,
        rateConsultant: parameters.rateConsultant,
        rateAnalyst: parameters.rateAnalyst,
        rateCoordinator: parameters.rateCoordinator,
        rateTrainer: parameters.rateTrainer,
        rateVideographer: parameters.rateVideographer,
        ratePhotographer: parameters.ratePhotographer,
        rateVideoEditor: parameters.rateVideoEditor,
        rateGraphicDesigner: parameters.rateGraphicDesigner,
        rateWebDeveloper: parameters.rateWebDeveloper,
        rateSoundTechnician: parameters.rateSoundTechnician,
        rateLightingTechnician: parameters.rateLightingTechnician,
        multiplierLow: parameters.multiplierLow,
        multiplierMedium: parameters.multiplierMedium,
        multiplierHigh: parameters.multiplierHigh,
        extrasDrone: parameters.extrasDrone,
        extrasMulticamStreaming: parameters.extrasMulticamStreaming,
        extrasAdvancedLedLighting: parameters.extrasAdvancedLedLighting,
        extrasSlider: parameters.extrasSlider,
        extrasCrane: parameters.extrasCrane,
        extrasAerialCrane: parameters.extrasAerialCrane,
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
      rateVideographer: formData.rateVideographer,
      ratePhotographer: formData.ratePhotographer,
      rateVideoEditor: formData.rateVideoEditor,
      rateGraphicDesigner: formData.rateGraphicDesigner,
      rateWebDeveloper: formData.rateWebDeveloper,
      rateSoundTechnician: formData.rateSoundTechnician,
      rateLightingTechnician: formData.rateLightingTechnician,
      multiplierLow: formData.multiplierLow,
      multiplierMedium: formData.multiplierMedium,
      multiplierHigh: formData.multiplierHigh,
      extrasDrone: formData.extrasDrone,
      extrasMulticamStreaming: formData.extrasMulticamStreaming,
      extrasAdvancedLedLighting: formData.extrasAdvancedLedLighting,
      extrasSlider: formData.extrasSlider,
      extrasCrane: formData.extrasCrane,
      extrasAerialCrane: formData.extrasAerialCrane,
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
      rateVideographer: DEFAULT_PRICING_PARAMETERS.rateVideographer,
      ratePhotographer: DEFAULT_PRICING_PARAMETERS.ratePhotographer,
      rateVideoEditor: DEFAULT_PRICING_PARAMETERS.rateVideoEditor,
      rateGraphicDesigner: DEFAULT_PRICING_PARAMETERS.rateGraphicDesigner,
      rateWebDeveloper: DEFAULT_PRICING_PARAMETERS.rateWebDeveloper,
      rateSoundTechnician: DEFAULT_PRICING_PARAMETERS.rateSoundTechnician,
      rateLightingTechnician: DEFAULT_PRICING_PARAMETERS.rateLightingTechnician,
      multiplierLow: DEFAULT_PRICING_PARAMETERS.multiplierLow,
      multiplierMedium: DEFAULT_PRICING_PARAMETERS.multiplierMedium,
      multiplierHigh: DEFAULT_PRICING_PARAMETERS.multiplierHigh,
      extrasDrone: DEFAULT_PRICING_PARAMETERS.extrasDrone,
      extrasMulticamStreaming: DEFAULT_PRICING_PARAMETERS.extrasMulticamStreaming,
      extrasAdvancedLedLighting: DEFAULT_PRICING_PARAMETERS.extrasAdvancedLedLighting,
      extrasSlider: DEFAULT_PRICING_PARAMETERS.extrasSlider,
      extrasCrane: DEFAULT_PRICING_PARAMETERS.extrasCrane,
      extrasAerialCrane: DEFAULT_PRICING_PARAMETERS.extrasAerialCrane,
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

  const RateInput = ({ label, field, value }: { label: string; field: keyof typeof formData; value: number }) => (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => handleChange(field, e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
      />
      <p className="text-xs text-muted-foreground mt-1">{formatCurrency(value)}/hora</p>
    </div>
  );

  const ExtrasInput = ({ label, field, value }: { label: string; field: keyof typeof formData; value: number }) => (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => handleChange(field, e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
      />
      <p className="text-xs text-muted-foreground mt-1">{formatCurrency(value)}/evento</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-2">Parâmetros de Precificação</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Configure as taxas horárias, multiplicadores de complexidade e percentagens utilizados no cálculo automático dos orçamentos.
        </p>
      </div>

      <Tabs defaultValue="consulting" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="consulting" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Consultoria</span>
          </TabsTrigger>
          <TabsTrigger value="creative" className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">Criativos</span>
          </TabsTrigger>
          <TabsTrigger value="tech" className="flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            <span className="hidden sm:inline">Tecnologia</span>
          </TabsTrigger>
          <TabsTrigger value="extras" className="flex items-center gap-2">
            <Music className="w-4 h-4" />
            <span className="hidden sm:inline">Extras</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="consulting" className="space-y-4 mt-6">
          <div className="flex items-center gap-2 text-foreground mb-4">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="font-medium">Taxas Horárias - Consultoria (Kz/hora)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RateInput label="Gestor Sénior" field="rateSeniorManager" value={formData.rateSeniorManager} />
            <RateInput label="Consultor Pleno" field="rateConsultant" value={formData.rateConsultant} />
            <RateInput label="Analista" field="rateAnalyst" value={formData.rateAnalyst} />
            <RateInput label="Coordenador Local" field="rateCoordinator" value={formData.rateCoordinator} />
            <RateInput label="Formador" field="rateTrainer" value={formData.rateTrainer} />
          </div>
        </TabsContent>

        <TabsContent value="creative" className="space-y-4 mt-6">
          <div className="flex items-center gap-2 text-foreground mb-4">
            <Camera className="w-4 h-4 text-primary" />
            <h3 className="font-medium">Taxas Horárias - Criativos (Kz/hora)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RateInput label="Videógrafo" field="rateVideographer" value={formData.rateVideographer} />
            <RateInput label="Fotógrafo" field="ratePhotographer" value={formData.ratePhotographer} />
            <RateInput label="Editor de Vídeo" field="rateVideoEditor" value={formData.rateVideoEditor} />
            <RateInput label="Designer Gráfico" field="rateGraphicDesigner" value={formData.rateGraphicDesigner} />
          </div>
        </TabsContent>

        <TabsContent value="tech" className="space-y-4 mt-6">
          <div className="flex items-center gap-2 text-foreground mb-4">
            <Monitor className="w-4 h-4 text-primary" />
            <h3 className="font-medium">Taxas Horárias - Tecnologia e Produção (Kz/hora)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RateInput label="Web Developer" field="rateWebDeveloper" value={formData.rateWebDeveloper} />
            <RateInput label="Técnico de Som" field="rateSoundTechnician" value={formData.rateSoundTechnician} />
            <RateInput label="Técnico de Iluminação" field="rateLightingTechnician" value={formData.rateLightingTechnician} />
          </div>
        </TabsContent>

        <TabsContent value="extras" className="space-y-4 mt-6">
          <div className="flex items-center gap-2 text-foreground mb-4">
            <Music className="w-4 h-4 text-primary" />
            <h3 className="font-medium">Equipamentos e Extras (Kz/evento)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ExtrasInput label="Drone" field="extrasDrone" value={formData.extrasDrone} />
            <ExtrasInput label="Streaming Multi-câmara" field="extrasMulticamStreaming" value={formData.extrasMulticamStreaming} />
            <ExtrasInput label="Iluminação LED Avançada" field="extrasAdvancedLedLighting" value={formData.extrasAdvancedLedLighting} />
            <ExtrasInput label="Slider" field="extrasSlider" value={formData.extrasSlider} />
            <ExtrasInput label="Grua" field="extrasCrane" value={formData.extrasCrane} />
            <ExtrasInput label="Grua Aérea" field="extrasAerialCrane" value={formData.extrasAerialCrane} />
          </div>
        </TabsContent>
      </Tabs>

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
