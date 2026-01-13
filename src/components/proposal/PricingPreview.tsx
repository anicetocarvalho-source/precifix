import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ProposalFormData,
  ServiceType,
  Complexity,
  SERVICE_CATEGORIES,
  SERVICE_LABELS,
} from '@/types/proposal';
import { calculatePricing, formatCurrency, DEFAULT_PRICING_PARAMS } from '@/lib/pricing';
import { usePricingParameters, toPricingParams } from '@/hooks/usePricingParameters';
import {
  Calculator,
  Users,
  Clock,
  TrendingUp,
  Package,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PricingPreviewProps {
  formData: Partial<ProposalFormData>;
}

export function PricingPreview({ formData }: PricingPreviewProps) {
  const { parameters, isLoading } = usePricingParameters();
  
  const pricing = useMemo(() => {
    // Need minimum data to calculate
    if (!formData.serviceType) return null;
    
    // Create complete form data with defaults
    const completeFormData: ProposalFormData = {
      clientType: formData.clientType || 'private',
      clientName: formData.clientName || '',
      sector: formData.sector || '',
      serviceType: formData.serviceType as ServiceType,
      estimatedDuration: formData.estimatedDuration || 1,
      locations: formData.locations?.filter(Boolean) || ['Luanda'],
      complexity: (formData.complexity as Complexity) || 'medium',
      clientMaturity: formData.clientMaturity || 'medium',
      deliverables: formData.deliverables || [],
      hasExistingTeam: formData.hasExistingTeam || false,
      methodology: formData.methodology || 'hybrid',
      eventType: formData.eventType,
      coverageDuration: formData.coverageDuration,
      eventDays: formData.eventDays,
      eventExtras: formData.eventExtras,
      eventStaffing: formData.eventStaffing,
      includesPostProduction: formData.includesPostProduction,
      eventDate: formData.eventDate,
      webSystemsData: formData.webSystemsData,
      designData: formData.designData,
    };
    
    const pricingParams = parameters ? toPricingParams(parameters) : DEFAULT_PRICING_PARAMS;
    return calculatePricing(completeFormData, pricingParams);
  }, [formData, parameters]);

  if (!formData.serviceType) {
    return null;
  }

  const category = SERVICE_CATEGORIES[formData.serviceType];
  const serviceLabel = SERVICE_LABELS[formData.serviceType];
  
  // Calculate completion percentage for visual feedback
  const getCompletionPercentage = () => {
    let fields = 0;
    let completed = 0;
    
    // Base fields
    fields += 3; // serviceType, duration, complexity
    if (formData.serviceType) completed++;
    if (formData.estimatedDuration) completed++;
    if (formData.complexity) completed++;
    
    // Category-specific fields
    if (category === 'events') {
      fields += 3; // eventType, coverageDuration, staffing
      if (formData.eventType) completed++;
      if (formData.coverageDuration) completed++;
      if (formData.eventStaffing && Object.values(formData.eventStaffing).some(v => v > 0)) completed++;
    } else if (category === 'technology') {
      fields += 2; // projectType, pages/modules
      if (formData.webSystemsData?.projectType) completed++;
      if (formData.webSystemsData?.numberOfPages || formData.webSystemsData?.numberOfModules) completed++;
    } else if (category === 'creative') {
      fields += 2; // concepts, formats
      if (formData.designData?.numberOfConcepts) completed++;
      if (formData.designData?.deliverableFormats?.length) completed++;
    }
    
    return Math.round((completed / fields) * 100);
  };

  const completionPercentage = getCompletionPercentage();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden sticky top-4">
          {/* Header */}
          <div className="bg-primary/5 border-b border-border px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Estimativa</span>
              </div>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {serviceLabel}
              </span>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-4 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : pricing ? (
              <>
                {/* Main Price */}
                <div className="text-center">
                  <motion.div
                    key={pricing.finalPrice}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-3xl font-bold text-foreground"
                  >
                    {formatCurrency(pricing.finalPrice)}
                  </motion.div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Valor estimado (pode variar com detalhes)
                  </p>
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Team Members */}
                  <div className="bg-muted/50 rounded-lg p-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs text-muted-foreground">Equipa</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {pricing.teamMembers.length} {pricing.teamMembers.length === 1 ? 'membro' : 'membros'}
                    </p>
                  </div>
                  
                  {/* Hours */}
                  <div className="bg-muted/50 rounded-lg p-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs text-muted-foreground">Horas</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {Math.round(pricing.totalHours)}h
                    </p>
                  </div>
                  
                  {/* Complexity */}
                  <div className="bg-muted/50 rounded-lg p-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <TrendingUp className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs text-muted-foreground">Multiplicador</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {pricing.complexityMultiplier}x
                    </p>
                  </div>
                  
                  {/* Extras */}
                  {pricing.extras && pricing.extras.length > 0 && (
                    <div className="bg-muted/50 rounded-lg p-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Package className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs text-muted-foreground">Extras</span>
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        {pricing.extras.length} {pricing.extras.length === 1 ? 'item' : 'itens'}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Completion Progress */}
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Precisão da estimativa</span>
                    <span className={cn(
                      "font-medium",
                      completionPercentage < 50 ? "text-amber-500" : 
                      completionPercentage < 80 ? "text-blue-500" : 
                      "text-green-500"
                    )}>
                      {completionPercentage}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${completionPercentage}%` }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        "h-full rounded-full",
                        completionPercentage < 50 ? "bg-amber-500" : 
                        completionPercentage < 80 ? "bg-blue-500" : 
                        "bg-green-500"
                      )}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {completionPercentage < 50 
                      ? "Preencha mais campos para maior precisão"
                      : completionPercentage < 80 
                      ? "Estimativa razoável, continue preenchendo"
                      : "Estimativa precisa baseada nos dados"}
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-muted-foreground text-sm">
                Selecione um serviço para ver a estimativa
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
