import { useState, useEffect, useCallback, useRef } from 'react';
import { Cloud, CloudOff, Check, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface AutoSaveIndicatorProps {
  status: AutoSaveStatus;
  lastSaved?: Date | null;
  className?: string;
}

export function AutoSaveIndicator({ status, lastSaved, className }: AutoSaveIndicatorProps) {
  const [displayTime, setDisplayTime] = useState<string>('');

  useEffect(() => {
    if (!lastSaved) return;

    const updateTime = () => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);

      if (diff < 5) {
        setDisplayTime('agora mesmo');
      } else if (diff < 60) {
        setDisplayTime(`há ${diff} segundos`);
      } else if (diff < 3600) {
        const mins = Math.floor(diff / 60);
        setDisplayTime(`há ${mins} ${mins === 1 ? 'minuto' : 'minutos'}`);
      } else {
        const hours = Math.floor(diff / 3600);
        setDisplayTime(`há ${hours} ${hours === 1 ? 'hora' : 'horas'}`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, [lastSaved]);

  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          icon: Loader2,
          text: 'A guardar...',
          iconClass: 'animate-spin text-primary',
          bgClass: 'bg-primary/10',
        };
      case 'saved':
        return {
          icon: Check,
          text: lastSaved ? `Guardado ${displayTime}` : 'Guardado',
          iconClass: 'text-success',
          bgClass: 'bg-success/10',
        };
      case 'error':
        return {
          icon: AlertCircle,
          text: 'Erro ao guardar',
          iconClass: 'text-destructive',
          bgClass: 'bg-destructive/10',
        };
      default:
        return {
          icon: Cloud,
          text: 'Auto-save activo',
          iconClass: 'text-muted-foreground',
          bgClass: 'bg-muted',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
          config.bgClass,
          className
        )}
      >
        <Icon className={cn('w-3.5 h-3.5', config.iconClass)} />
        <span className="text-foreground/80">{config.text}</span>
      </motion.div>
    </AnimatePresence>
  );
}

// Hook for managing auto-save state
interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  debounceMs?: number;
  enabled?: boolean;
}

export function useAutoSave<T>({ data, onSave, debounceMs = 2000, enabled = true }: UseAutoSaveOptions<T>) {
  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastDataRef = useRef<string>('');
  const isFirstRender = useRef(true);

  const save = useCallback(async (dataToSave: T) => {
    try {
      setStatus('saving');
      await onSave(dataToSave);
      setStatus('saved');
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save error:', error);
      setStatus('error');
    }
  }, [onSave]);

  useEffect(() => {
    if (!enabled) return;

    // Skip the first render to avoid saving on initial load
    if (isFirstRender.current) {
      isFirstRender.current = false;
      lastDataRef.current = JSON.stringify(data);
      return;
    }

    const currentData = JSON.stringify(data);
    
    // Only trigger save if data actually changed
    if (currentData === lastDataRef.current) return;
    
    lastDataRef.current = currentData;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new debounced save
    timeoutRef.current = setTimeout(() => {
      save(data);
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, debounceMs, enabled, save]);

  return { status, lastSaved };
}
