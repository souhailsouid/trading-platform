import { TradingViewAlert } from '../types/trading';

// Validation des données TradingView
export const validateWebhookData = (data: any): data is TradingViewAlert => {
  return (
    typeof data.symbol === 'string' &&
    typeof data.price === 'number' &&
    typeof data.time === 'string'
  );
};

// Créer le message Slack avec indicateurs
export const createSlackMessage = (data: TradingViewAlert) => {
  const alertTypeEmoji = data.alertType === 'RSI' ? '📉' : data.alertType === 'MACD' ? '📈' : '📊';
  const alertTitle = data.alertType 
    ? `${alertTypeEmoji} ${data.alertType} Alert: ${data.symbol}${data.signalType ? ` (${data.signalType})` : ''}`
    : `📊 Trading Alert: ${data.symbol}`;
  
  const blocks: any[] = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: alertTitle,
        emoji: true
      }
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Symbol:*\n${data.symbol}`
        },
        {
          type: "mrkdwn",
          text: `*Price:*\n${data.price}`
        },
        {
          type: "mrkdwn",
          text: `*Time:*\n${data.time}`
        }
      ]
    }
  ];

  // Ajouter alertType et signalType si présents
  if (data.alertType || data.signalType) {
    const typeFields: any[] = [];
    if (data.alertType) {
      typeFields.push({
        type: "mrkdwn",
        text: `*Alert Type:*\n${data.alertType}`
      });
    }
    if (data.signalType) {
      typeFields.push({
        type: "mrkdwn",
        text: `*Signal Type:*\n${data.signalType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`
      });
    }
    if (typeFields.length > 0) {
      blocks.push({
        type: "section",
        fields: typeFields
      });
    }
  }

  // Ajouter les indicateurs si disponibles
  if (data.indicators) {
    const indicatorFields: any[] = [];
    
    if (data.indicators.rsi !== undefined) {
      indicatorFields.push({
        type: "mrkdwn",
        text: `*RSI:*\n${data.indicators.rsi.toFixed(2)}`
      });
    }
    
    if (data.indicators.macd) {
      indicatorFields.push({
        type: "mrkdwn",
        text: `*MACD:*\n${data.indicators.macd.macd.toFixed(4)}`
      });
      indicatorFields.push({
        type: "mrkdwn",
        text: `*Signal:*\n${data.indicators.macd.signal.toFixed(4)}`
      });
    }
    
    if (data.indicators.stoch) {
      indicatorFields.push({
        type: "mrkdwn",
        text: `*Stoch K:*\n${data.indicators.stoch.k.toFixed(2)}`
      });
      indicatorFields.push({
        type: "mrkdwn",
        text: `*Stoch D:*\n${data.indicators.stoch.d.toFixed(2)}`
      });
    }

    if (indicatorFields.length > 0) {
      blocks.push({
        type: "section",
        fields: indicatorFields
      });
    }
  }

  return { blocks };
};

// Headers CORS communs
export const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

// Gérer les requêtes OPTIONS (CORS preflight)
export const handleCorsPreflight = () => ({
  statusCode: 200,
  headers: corsHeaders,
  body: ''
});

// Formater la réponse d'erreur
export const formatErrorResponse = (error: any, statusCode: number = 500) => ({
  statusCode,
  headers: corsHeaders,
  body: JSON.stringify({
    success: false,
    message: 'Internal server error',
    error: error instanceof Error ? error.message : 'Unknown error'
  })
}); 