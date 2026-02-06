import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProposalService } from '@/types/proposalService';
import { SERVICE_CATEGORIES } from '@/types/proposal';
import { getServiceLabel } from '@/lib/serviceLabels';
import { calculateMultiServicePricing } from '@/lib/pricingMultiService';
import { formatCurrency, DEFAULT_PRICING_PARAMS } from '@/lib/pricing';
import { usePricingParameters, toPricingParams } from '@/hooks/usePricingParameters';
import {
  Calculator,
  Users,
  Clock,
  TrendingUp,
  Package,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface MultiServicePricingPreviewProps {
  services: ProposalService[];
}

const CATEGORY_COLORS: Record<string, string> = {
  consulting: 'bg-blue-500',
  creative: 'bg-purple-500',
  technology: 'bg-green-500',
  events: 'bg-orange-500',
};

export function MultiServicePricingPreview({ services }: MultiServicePricingPreviewProps) {
  const { parameters, isLoading } = usePricingParameters();
  const [showBreakdown, setShowBreakdown] = useState(false);
  
  const pricing = useMemo(() => {
    if (services.length === 0) return null;
    
    const pricingParams = parameters ? toPricingParams(parameters) : DEFAULT_PRICING_PARAMS;
    return calculateMultiServicePricing(services, pricingParams);
  }, [services, parameters]);

  if (services.length === 0) {
    return null;
  }

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
                <span className="text-sm font-medium text-foreground">Estimativa Total</span>
              </div>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {services.length} {services.length === 1 ? 'serviço' : 'serviços'}
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
                    key={pricing.totalFinalPrice}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-3xl font-bold text-foreground"
                  >
                    {formatCurrency(pricing.totalFinalPrice)}
                  </motion.div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Valor total estimado
                  </p>
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-muted/50 rounded-lg p-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs text-muted-foreground">Equipa</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {pricing.totalTeamMembers} {pricing.totalTeamMembers === 1 ? 'membro' : 'membros'}
                    </p>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs text-muted-foreground">Horas</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {Math.round(pricing.totalHours)}h
                    </p>
                  </div>
                </div>
                
                {/* Service Breakdown Toggle */}
                <button
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="w-full flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  <span>Ver detalhes por serviço</span>
                  {showBreakdown ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                
                {/* Service Breakdown */}
                <AnimatePresence>
                  {showBreakdown && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-2 overflow-hidden"
                    >
                      {pricing.services.map((servicePricing, index) => {
                        const service = services[index];
                        const category = SERVICE_CATEGORIES[servicePricing.serviceType];
                        
                        return (
                          <div
                            key={servicePricing.serviceId}
                            className="flex items-center justify-between p-2 bg-muted/30 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "w-2 h-2 rounded-full",
                                CATEGORY_COLORS[category]
                              )} />
                              <span className="text-sm text-foreground truncate max-w-[150px]">
                                {getServiceLabel(servicePricing.serviceType)}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-foreground">
                              {formatCurrency(servicePricing.finalPrice)}
                            </span>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <div className="text-center py-4 text-muted-foreground text-sm">
                Adicione serviços para ver a estimativa
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
