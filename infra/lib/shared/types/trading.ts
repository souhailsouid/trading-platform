// Types partagés pour les alertes trading
export interface TradingViewAlert {
  alertType?: 'RSI' | 'MACD'; // Type d'alerte (RSI ou MACD)
  signalType?: string; // Type de signal MACD (bullish_signal_crossover, bearish_signal_crossover, etc.)
  symbol: string;
  price: number;
  time: string;
  indicators?: {
    rsi?: number;
    macd?: {
      macd: number;
      signal: number;
      histogram: number;
    };
    stoch?: {
      k: number;
      d: number;
    };
  };
}

export interface TradingAlert extends TradingViewAlert {
  id: string;
  timestamp: string;
  status: string;
}

export interface WebhookConfig {
  symbol: string;
  channel_id: string;
  webhook_url: string;
}

// Types pour les réponses API
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface AlertsResponse {
  success: boolean;
  count: number;
  alerts: Array<{
    symbol: string;
    price: number;
    timestamp: string;
    time: string;
    indicators: TradingViewAlert['indicators'] | null;
  }>;
} 