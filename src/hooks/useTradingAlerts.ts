import { useEffect, useState, useCallback } from 'react';
import { TradingAlert, tradingAlertsService } from '../services/api/tradingAlerts';

interface UseTradingAlertsOptions {
  symbol?: string;
  limit?: number;
  alertType?: 'RSI' | 'MACD';
  signalType?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // en millisecondes
}

export function useTradingAlerts(options: UseTradingAlertsOptions = {}) {
  const {
    symbol,
    limit = 50,
    alertType,
    signalType,
    autoRefresh = false,
    refreshInterval = 10000, // 10 secondes par défaut
  } = options;

  const [alerts, setAlerts] = useState<TradingAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedAlerts = await tradingAlertsService.getFilteredAlerts({
        symbol,
        limit,
        alertType,
        signalType,
      });
      
      setAlerts(fetchedAlerts);
      setLastUpdate(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des alertes';
      setError(errorMessage);
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  }, [symbol, limit, alertType, signalType]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchAlerts();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchAlerts]);

  const sendTestAlert = useCallback(async (testAlert: Partial<TradingAlert>) => {
    try {
      setLoading(true);
      const response = await tradingAlertsService.sendTestAlert(testAlert);
      // Rafraîchir les alertes après l'envoi
      await fetchAlerts();
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'envoi de l\'alerte';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchAlerts]);

  return {
    alerts,
    loading,
    error,
    lastUpdate,
    refetch: fetchAlerts,
    sendTestAlert,
  };
}

