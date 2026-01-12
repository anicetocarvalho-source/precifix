import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useProposals } from '@/hooks/useProposals';
import { usePricingParameters } from '@/hooks/usePricingParameters';
import { calculatePricing, formatCurrency, PricingParams } from '@/lib/pricing';
import { TrendingUp, TrendingDown, Minus, Calculator, RotateCcw, ArrowRight, Save, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function PricingImpactSimulator() {
  const { proposals } = useProposals();
  const { parameters, isLoading, saveParameters } = usePricingParameters();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Simulated parameters (editable)
  const [simulatedParams, setSimulatedParams] = useState<{
    rateSeniorManager: number;
    rateConsultant: number;
    rateAnalyst: number;
    rateCoordinator: number;
    rateTrainer: number;
    multiplierLow: number;
    multiplierMedium: number;
    multiplierHigh: number;
    overheadPercentage: number;
    marginPercentage: number;
  } | null>(null);

  // Initialize simulated params when parameters load
  const activeSimulatedParams = simulatedParams || parameters;

  const resetSimulation = () => {
    setSimulatedParams(null);
  };

  const updateSimulatedParam = (key: keyof typeof activeSimulatedParams, value: number) => {
    setSimulatedParams(prev => ({
      ...(prev || parameters),
      [key]: value,
    }));
  };

  const handleApplyParameters = async () => {
    if (!simulatedParams) return;
    
    await saveParameters.mutateAsync({
      rateSeniorManager: simulatedParams.rateSeniorManager,
      rateConsultant: simulatedParams.rateConsultant,
      rateAnalyst: simulatedParams.rateAnalyst,
      rateCoordinator: simulatedParams.rateCoordinator,
      rateTrainer: simulatedParams.rateTrainer,
      multiplierLow: simulatedParams.multiplierLow,
      multiplierMedium: simulatedParams.multiplierMedium,
      multiplierHigh: simulatedParams.multiplierHigh,
      overheadPercentage: simulatedParams.overheadPercentage,
      marginPercentage: simulatedParams.marginPercentage,
    });
    
    setSimulatedParams(null);
    setShowConfirmDialog(false);
  };

  // Calculate impact on all proposals
  const impactAnalysis = useMemo(() => {
    if (!proposals.length) return null;

    // Filter proposals that don't have saved pricing params (they use current params)
    const affectedProposals = proposals.filter(p => !p.pricingParams);

    if (!affectedProposals.length) return { 
      totalCurrentValue: 0, 
      totalSimulatedValue: 0, 
      difference: 0, 
      percentChange: 0,
      proposalImpacts: [] 
    };

    const currentPricingParams: PricingParams = {
      hourlyRates: {
        seniorManager: parameters.rateSeniorManager,
        consultant: parameters.rateConsultant,
        analyst: parameters.rateAnalyst,
        coordinator: parameters.rateCoordinator,
        trainer: parameters.rateTrainer,
      },
      complexityMultipliers: {
        low: parameters.multiplierLow,
        medium: parameters.multiplierMedium,
        high: parameters.multiplierHigh,
      },
      overheadPercentage: parameters.overheadPercentage,
      marginPercentage: parameters.marginPercentage,
    };

    const simulatedPricingParams: PricingParams = {
      hourlyRates: {
        seniorManager: activeSimulatedParams.rateSeniorManager,
        consultant: activeSimulatedParams.rateConsultant,
        analyst: activeSimulatedParams.rateAnalyst,
        coordinator: activeSimulatedParams.rateCoordinator,
        trainer: activeSimulatedParams.rateTrainer,
      },
      complexityMultipliers: {
        low: activeSimulatedParams.multiplierLow,
        medium: activeSimulatedParams.multiplierMedium,
        high: activeSimulatedParams.multiplierHigh,
      },
      overheadPercentage: activeSimulatedParams.overheadPercentage,
      marginPercentage: activeSimulatedParams.marginPercentage,
    };

    const proposalImpacts = affectedProposals.map(proposal => {
      const currentPricing = calculatePricing(proposal.formData, currentPricingParams);
      const simulatedPricing = calculatePricing(proposal.formData, simulatedPricingParams);
      const difference = simulatedPricing.finalPrice - currentPricing.finalPrice;
      const percentChange = currentPricing.finalPrice > 0 
        ? ((difference / currentPricing.finalPrice) * 100) 
        : 0;

      return {
        id: proposal.id,
        clientName: proposal.formData.clientName,
        currentValue: currentPricing.finalPrice,
        simulatedValue: simulatedPricing.finalPrice,
        difference,
        percentChange,
      };
    });

    const totalCurrentValue = proposalImpacts.reduce((sum, p) => sum + p.currentValue, 0);
    const totalSimulatedValue = proposalImpacts.reduce((sum, p) => sum + p.simulatedValue, 0);
    const totalDifference = totalSimulatedValue - totalCurrentValue;
    const totalPercentChange = totalCurrentValue > 0 
      ? ((totalDifference / totalCurrentValue) * 100) 
      : 0;

    return {
      totalCurrentValue,
      totalSimulatedValue,
      difference: totalDifference,
      percentChange: totalPercentChange,
      proposalImpacts,
    };
  }, [proposals, parameters, activeSimulatedParams]);

  const hasChanges = simulatedParams !== null;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  const getDifferenceIcon = (diff: number) => {
    if (diff > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (diff < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const getDifferenceColor = (diff: number) => {
    if (diff > 0) return 'text-green-600';
    if (diff < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Simulador de Impacto</CardTitle>
                <CardDescription>
                  Veja como alterações nos parâmetros afectam o valor das propostas
                </CardDescription>
              </div>
            </div>
            {hasChanges && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={resetSimulation} className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Repor
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => setShowConfirmDialog(true)} 
                  className="gap-2"
                  disabled={saveParameters.isPending}
                >
                  {saveParameters.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Aplicar Parâmetros
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Parameter Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Hourly Rates */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                Taxas Horárias
              </h4>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <Label>Gestor Sénior</Label>
                    <span className="font-medium">{formatCurrency(activeSimulatedParams.rateSeniorManager)}</span>
                  </div>
                  <Slider
                    value={[activeSimulatedParams.rateSeniorManager]}
                    onValueChange={([value]) => updateSimulatedParam('rateSeniorManager', value)}
                    min={50000}
                    max={200000}
                    step={5000}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <Label>Consultor</Label>
                    <span className="font-medium">{formatCurrency(activeSimulatedParams.rateConsultant)}</span>
                  </div>
                  <Slider
                    value={[activeSimulatedParams.rateConsultant]}
                    onValueChange={([value]) => updateSimulatedParam('rateConsultant', value)}
                    min={30000}
                    max={150000}
                    step={5000}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <Label>Analista</Label>
                    <span className="font-medium">{formatCurrency(activeSimulatedParams.rateAnalyst)}</span>
                  </div>
                  <Slider
                    value={[activeSimulatedParams.rateAnalyst]}
                    onValueChange={([value]) => updateSimulatedParam('rateAnalyst', value)}
                    min={20000}
                    max={100000}
                    step={5000}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Complexity Multipliers */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                Multiplicadores
              </h4>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <Label>Complexidade Baixa</Label>
                    <span className="font-medium">×{activeSimulatedParams.multiplierLow.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[activeSimulatedParams.multiplierLow * 100]}
                    onValueChange={([value]) => updateSimulatedParam('multiplierLow', value / 100)}
                    min={80}
                    max={150}
                    step={5}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <Label>Complexidade Média</Label>
                    <span className="font-medium">×{activeSimulatedParams.multiplierMedium.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[activeSimulatedParams.multiplierMedium * 100]}
                    onValueChange={([value]) => updateSimulatedParam('multiplierMedium', value / 100)}
                    min={100}
                    max={200}
                    step={5}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <Label>Complexidade Alta</Label>
                    <span className="font-medium">×{activeSimulatedParams.multiplierHigh.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[activeSimulatedParams.multiplierHigh * 100]}
                    onValueChange={([value]) => updateSimulatedParam('multiplierHigh', value / 100)}
                    min={120}
                    max={250}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Percentages */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                Percentagens
              </h4>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <Label>Overhead</Label>
                    <span className="font-medium">{(activeSimulatedParams.overheadPercentage * 100).toFixed(0)}%</span>
                  </div>
                  <Slider
                    value={[activeSimulatedParams.overheadPercentage * 100]}
                    onValueChange={([value]) => updateSimulatedParam('overheadPercentage', value / 100)}
                    min={0}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <Label>Margem</Label>
                    <span className="font-medium">{(activeSimulatedParams.marginPercentage * 100).toFixed(0)}%</span>
                  </div>
                  <Slider
                    value={[activeSimulatedParams.marginPercentage * 100]}
                    onValueChange={([value]) => updateSimulatedParam('marginPercentage', value / 100)}
                    min={0}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Impact Summary */}
      {impactAnalysis && impactAnalysis.proposalImpacts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Impacto nas Propostas</CardTitle>
            <CardDescription>
              {impactAnalysis.proposalImpacts.length} proposta(s) sem parâmetros guardados serão afectadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Total Impact */}
            <div className="bg-muted/30 rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Valor Actual Total</p>
                  <p className="text-xl font-bold">{formatCurrency(impactAnalysis.totalCurrentValue)}</p>
                </div>
                <div className="flex items-center justify-center">
                  <ArrowRight className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Valor Simulado Total</p>
                  <p className="text-xl font-bold">{formatCurrency(impactAnalysis.totalSimulatedValue)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Diferença</p>
                  <div className="flex items-center gap-2">
                    {getDifferenceIcon(impactAnalysis.difference)}
                    <span className={`text-xl font-bold ${getDifferenceColor(impactAnalysis.difference)}`}>
                      {impactAnalysis.difference >= 0 ? '+' : ''}{formatCurrency(impactAnalysis.difference)}
                    </span>
                    <Badge variant={impactAnalysis.difference >= 0 ? 'default' : 'destructive'} className="ml-2">
                      {impactAnalysis.percentChange >= 0 ? '+' : ''}{impactAnalysis.percentChange.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Per-Proposal Impact */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                Detalhe por Proposta
              </h4>
              <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
                {impactAnalysis.proposalImpacts.map((impact) => (
                  <div key={impact.id} className="flex items-center justify-between p-4 bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{impact.clientName}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatCurrency(impact.currentValue)}</span>
                        <ArrowRight className="w-3 h-3" />
                        <span>{formatCurrency(impact.simulatedValue)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {getDifferenceIcon(impact.difference)}
                      <span className={`font-medium ${getDifferenceColor(impact.difference)}`}>
                        {impact.difference >= 0 ? '+' : ''}{formatCurrency(impact.difference)}
                      </span>
                      <Badge 
                        variant={impact.difference >= 0 ? 'outline' : 'destructive'} 
                        className="ml-1"
                      >
                        {impact.percentChange >= 0 ? '+' : ''}{impact.percentChange.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {hasChanges && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>Nota:</strong> Esta é apenas uma simulação. Para aplicar estas alterações, 
                  guarde os novos parâmetros na aba "Parâmetros de Precificação".
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No proposals message */}
      {impactAnalysis && impactAnalysis.proposalImpacts.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              {proposals.length === 0 
                ? 'Não existem propostas para simular o impacto.'
                : 'Todas as propostas têm parâmetros de precificação guardados, por isso não serão afectadas por alterações nos parâmetros globais.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aplicar Parâmetros Simulados?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acção irá guardar os parâmetros simulados como os novos parâmetros de precificação globais.
              {impactAnalysis && impactAnalysis.proposalImpacts.length > 0 && (
                <span className="block mt-2">
                  <strong>{impactAnalysis.proposalImpacts.length}</strong> proposta(s) sem parâmetros guardados terão os valores recalculados.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleApplyParameters} disabled={saveParameters.isPending}>
              {saveParameters.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  A guardar...
                </>
              ) : (
                'Aplicar Parâmetros'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}