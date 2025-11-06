import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { TradingAlert, AlertsResponse } from '../../shared/types/trading';
import { corsHeaders, handleCorsPreflight, formatErrorResponse } from '../../shared/utils/trading';

const dynamoClient = new DynamoDBClient({});

// Interface pour les données DynamoDB
interface DynamoDBAlert {
  id: string;
  symbol: string;
  price: number;
  timestamp: string;
  time: string;
  rsi?: number;
  macd?: number;
  macd_signal?: number;
  macd_histogram?: number;
  stoch_k?: number;
  stoch_d?: number;
}

// Interface pour l'historique complet
interface AssetHistory {
  symbol: string;
  totalAlerts: number;
  dateRange: {
    start: string;
    end: string;
  };
  priceRange: {
    min: number;
    max: number;
    current: number;
  };
  indicators: {
    rsi: {
      average: number;
      min: number;
      max: number;
      oversoldCount: number;
      overboughtCount: number;
    };
    macd: {
      average: number;
      min: number;
      max: number;
    };
    stoch: {
      kAverage: number;
      dAverage: number;
    };
  };
  alerts: Array<{
    price: number;
    timestamp: string;
    time: string;
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
  }>;
}

// Récupérer toutes les alertes
const getAllAlerts = async (): Promise<DynamoDBAlert[]> => {
  try {
    const response = await dynamoClient.send(new ScanCommand({
      TableName: process.env.TRADING_ALERTS_TABLE,
      ProjectionExpression: "#ts, symbol, price, #time, rsi, macd, macd_signal, macd_histogram, stoch_k, stoch_d",
      ExpressionAttributeNames: {
        '#time': 'time',
          "#ts": "timestamp"
      }
    }));

    return response.Items?.map(item => unmarshall(item) as DynamoDBAlert) || [];
  } catch (error) {
    console.error('Error fetching alerts:', error);
    throw error;
  }
};

// Convertir les données DynamoDB en format API
const convertToApiFormat = (dbAlert: DynamoDBAlert) => {
  const indicators: any = {};
  
  // Ajouter les indicateurs s'ils existent
  if (dbAlert.rsi !== undefined) {
    indicators.rsi = dbAlert.rsi;
  }
  
  if (dbAlert.macd !== undefined || dbAlert.macd_signal !== undefined || dbAlert.macd_histogram !== undefined) {
    indicators.macd = {
      macd: dbAlert.macd || 0,
      signal: dbAlert.macd_signal || 0,
      histogram: dbAlert.macd_histogram || 0
    };
  }
  
  if (dbAlert.stoch_k !== undefined || dbAlert.stoch_d !== undefined) {
    indicators.stoch = {
      k: dbAlert.stoch_k || 0,
      d: dbAlert.stoch_d || 0
    };
  }

  return {
    symbol: dbAlert.symbol,
    price: dbAlert.price,
    timestamp: dbAlert.timestamp,
    time: dbAlert.time,
    indicators: Object.keys(indicators).length > 0 ? indicators : null
  };
};

// Filtrer les alertes par RSI
const filterAlertsByRsi = (alerts: DynamoDBAlert[], rsiThreshold: number, operator: 'lt' | 'gt' | 'eq' = 'lt'): DynamoDBAlert[] => {
  return alerts.filter(alert => {
    if (alert.rsi === undefined) return false;
    
    switch (operator) {
      case 'lt':
        return alert.rsi < rsiThreshold;
      case 'gt':
        return alert.rsi > rsiThreshold;
      case 'eq':
        return alert.rsi === rsiThreshold;
      default:
        return false;
    }
  });
};

// Créer l'historique complet d'un asset
const createAssetHistory = (alerts: DynamoDBAlert[], symbol: string): AssetHistory => {
  if (alerts.length === 0) {
    return {
      symbol,
      totalAlerts: 0,
      dateRange: { start: '', end: '' },
      priceRange: { min: 0, max: 0, current: 0 },
      indicators: {
        rsi: { average: 0, min: 0, max: 0, oversoldCount: 0, overboughtCount: 0 },
        macd: { average: 0, min: 0, max: 0 },
        stoch: { kAverage: 0, dAverage: 0 }
      },
      alerts: []
    };
  }

  // Trier par timestamp
  const sortedAlerts = alerts.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
  // Calculer les plages de prix
  const prices = sortedAlerts.map(a => a.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const currentPrice = sortedAlerts[sortedAlerts.length - 1].price;
  
  // Calculer les plages de dates
  const dates = sortedAlerts.map(a => new Date(a.timestamp));
  const startDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const endDate = new Date(Math.max(...dates.map(d => d.getTime())));
  
  // Analyser les indicateurs
  const alertsWithRsi = sortedAlerts.filter(a => a.rsi !== undefined);
  const rsiValues = alertsWithRsi.map(a => a.rsi!);
  const rsiAverage = rsiValues.length > 0 ? rsiValues.reduce((sum, val) => sum + val, 0) / rsiValues.length : 0;
  const rsiMin = rsiValues.length > 0 ? Math.min(...rsiValues) : 0;
  const rsiMax = rsiValues.length > 0 ? Math.max(...rsiValues) : 0;
  const rsiOversoldCount = rsiValues.filter(val => val < 30).length;
  const rsiOverboughtCount = rsiValues.filter(val => val > 70).length;
  
  // Analyser MACD
  const alertsWithMacd = sortedAlerts.filter(a => a.macd !== undefined);
  const macdValues = alertsWithMacd.map(a => a.macd!);
  const macdAverage = macdValues.length > 0 ? macdValues.reduce((sum, val) => sum + val, 0) / macdValues.length : 0;
  const macdMin = macdValues.length > 0 ? Math.min(...macdValues) : 0;
  const macdMax = macdValues.length > 0 ? Math.max(...macdValues) : 0;
  
  // Analyser Stochastique
  const alertsWithStoch = sortedAlerts.filter(a => a.stoch_k !== undefined && a.stoch_d !== undefined);
  const stochKValues = alertsWithStoch.map(a => a.stoch_k!);
  const stochDValues = alertsWithStoch.map(a => a.stoch_d!);
  const stochKAverage = stochKValues.length > 0 ? stochKValues.reduce((sum, val) => sum + val, 0) / stochKValues.length : 0;
  const stochDAverage = stochDValues.length > 0 ? stochDValues.reduce((sum, val) => sum + val, 0) / stochDValues.length : 0;
  
  return {
    symbol,
    totalAlerts: sortedAlerts.length,
    dateRange: {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    },
    priceRange: {
      min: minPrice,
      max: maxPrice,
      current: currentPrice
    },
    indicators: {
      rsi: {
        average: Math.round(rsiAverage * 100) / 100,
        min: Math.round(rsiMin * 100) / 100,
        max: Math.round(rsiMax * 100) / 100,
        oversoldCount: rsiOversoldCount,
        overboughtCount: rsiOverboughtCount
      },
      macd: {
        average: Math.round(macdAverage * 1000000) / 1000000,
        min: Math.round(macdMin * 1000000) / 1000000,
        max: Math.round(macdMax * 1000000) / 1000000
      },
      stoch: {
        kAverage: Math.round(stochKAverage * 100) / 100,
        dAverage: Math.round(stochDAverage * 100) / 100
      }
    },
    alerts: sortedAlerts.map(convertToApiFormat)
  };
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { httpMethod, queryStringParameters } = event;
    
    // Gérer les requêtes OPTIONS (CORS preflight)
    if (httpMethod === 'OPTIONS') {
      return handleCorsPreflight();
    }

    // Seulement GET est autorisé
    if (httpMethod !== 'GET') {
      return {
        statusCode: 405,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Method not allowed' })
      };
    }

    // Récupérer toutes les alertes
    const alerts = await getAllAlerts();

    // Trier par timestamp (plus récent en premier)
    alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Filtrer par symbole si demandé
    let filteredAlerts = alerts;
    if (queryStringParameters?.symbol) {
      filteredAlerts = alerts.filter(alert => 
        alert.symbol.toLowerCase() === queryStringParameters.symbol!.toLowerCase()
      );
    }

    // Filtrer par RSI si demandé
    if (queryStringParameters?.rsi_threshold) {
      const rsiThreshold = parseFloat(queryStringParameters.rsi_threshold);
      const rsiOperator = (queryStringParameters.rsi_operator as 'lt' | 'gt' | 'eq') || 'lt';
      
      if (!isNaN(rsiThreshold)) {
        filteredAlerts = filterAlertsByRsi(filteredAlerts, rsiThreshold, rsiOperator);
      }
    }

    // Si on demande l'historique complet
    if (queryStringParameters?.format === 'history' && queryStringParameters?.symbol) {
      const history = createAssetHistory(filteredAlerts, queryStringParameters.symbol);
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: history
        })
      };
    }

    // Limiter le nombre de résultats si demandé
    if (queryStringParameters?.limit) {
      const limit = parseInt(queryStringParameters.limit);
      filteredAlerts = filteredAlerts.slice(0, limit);
    }

    // Formater la réponse avec indicateurs
    const response: AlertsResponse = {
      success: true,
      count: filteredAlerts.length,
      alerts: filteredAlerts.map(convertToApiFormat)
    };

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('Error in handler:', error);
    return formatErrorResponse(error);
  }
}; 