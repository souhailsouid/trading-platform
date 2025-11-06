// Service API pour récupérer les alertes trading depuis cloud-backend

const API_BASE_URL = import.meta.env.VITE_TRADING_API_URL || 
  'https://4lr0f9o34g.execute-api.eu-west-3.amazonaws.com/prod';

const WEBHOOK_URL = `${API_BASE_URL}/webhooks`;

export interface TradingAlert {
  id?: string;
  symbol: string;
  price: number;
  timestamp: string;
  time: string;
  alertType?: 'RSI' | 'MACD';
  signalType?: string;
  indicators: {
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
  } | null;
}

export interface AlertsResponse {
  success: boolean;
  count: number;
  alerts: TradingAlert[];
}

export interface WebhookResponse {
  message: string;
  data: {
    processed: boolean;
    timestamp: string;
    alertId: string;
    signal: TradingAlert;
  };
}

class TradingAlertsService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Récupérer toutes les alertes
  async getAllAlerts(): Promise<TradingAlert[]> {
    try {
      const response = await fetch(`${this.baseUrl}/alerts`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: AlertsResponse = await response.json();
      return data.alerts;
    } catch (error) {
      console.error('Error fetching alerts:', error);
      throw error;
    }
  }

  // Récupérer les alertes d'un symbole spécifique
  async getAlertsBySymbol(symbol: string): Promise<TradingAlert[]> {
    try {
      const response = await fetch(`${this.baseUrl}/alerts?symbol=${symbol}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: AlertsResponse = await response.json();
      return data.alerts;
    } catch (error) {
      console.error('Error fetching alerts by symbol:', error);
      throw error;
    }
  }

  // Récupérer les alertes avec limite
  async getAlertsWithLimit(limit: number): Promise<TradingAlert[]> {
    try {
      const response = await fetch(`${this.baseUrl}/alerts?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: AlertsResponse = await response.json();
      return data.alerts;
    } catch (error) {
      console.error('Error fetching alerts with limit:', error);
      throw error;
    }
  }

  // Récupérer les alertes filtrées
  async getFilteredAlerts(params: {
    symbol?: string;
    limit?: number;
    alertType?: 'RSI' | 'MACD';
    signalType?: string;
  }): Promise<TradingAlert[]> {
    try {
      const urlParams = new URLSearchParams();
      if (params.symbol) urlParams.append('symbol', params.symbol);
      if (params.limit) urlParams.append('limit', params.limit.toString());
      if (params.alertType) urlParams.append('alertType', params.alertType);
      if (params.signalType) urlParams.append('signalType', params.signalType);
      
      const queryString = urlParams.toString();
      const url = queryString ? `${this.baseUrl}/alerts?${queryString}` : `${this.baseUrl}/alerts`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: AlertsResponse = await response.json();
      return data.alerts;
    } catch (error) {
      console.error('Error fetching filtered alerts:', error);
      throw error;
    }
  }

  // Envoyer une alerte de test (simuler TradingView)
  async sendTestAlert(alert: Partial<TradingAlert>): Promise<WebhookResponse> {
    try {
      let defaultIndicators: TradingAlert['indicators'];
      
      if (alert.alertType === 'MACD') {
        const macdIndicators = alert.indicators && 'macd' in alert.indicators 
          ? alert.indicators.macd 
          : undefined;
        defaultIndicators = {
          macd: {
            macd: macdIndicators?.macd || 0.5,
            signal: macdIndicators?.signal || 0.3,
            histogram: macdIndicators?.histogram || 0.2,
          }
        };
      } else {
        const rsiValue = alert.indicators && 'rsi' in alert.indicators 
          ? alert.indicators.rsi 
          : undefined;
        defaultIndicators = {
          rsi: rsiValue || 30,
        };
      }

      const testAlert: TradingAlert = {
        symbol: alert.symbol || 'BTCUSDT',
        price: alert.price || 50000,
        timestamp: new Date().toISOString(),
        time: new Date().toISOString(),
        alertType: alert.alertType || 'RSI',
        signalType: alert.signalType,
        indicators: alert.indicators || defaultIndicators,
      };

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testAlert),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: WebhookResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending test alert:', error);
      throw error;
    }
  }
}

export const tradingAlertsService = new TradingAlertsService();
