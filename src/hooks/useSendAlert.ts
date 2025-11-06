import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tradingAlertsService, TradingAlert } from '../services/api/tradingAlerts';

export const useSendAlert = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (alert: Partial<TradingAlert>) => tradingAlertsService.sendTestAlert(alert),
    onSuccess: () => {
      // Invalider la query pour rafraîchir les alertes
      queryClient.invalidateQueries({ queryKey: ['webhookAlerts'] });
    },
    onError: (error) => {
      console.error('Erreur lors de l\'envoi de l\'alerte:', error);
    },
    retry: 2, // Réessayer 2 fois en cas d'échec
    retryDelay: 1000, // Attendre 1 seconde entre les tentatives
  });

  return mutation;
};

