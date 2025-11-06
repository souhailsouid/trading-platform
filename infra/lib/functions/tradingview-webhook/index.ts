import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { DynamoDBClient, PutItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { TradingViewAlert } from '../../shared/types/trading';
import { 
  validateWebhookData, 
  corsHeaders, 
  handleCorsPreflight, 
  formatErrorResponse 
} from '../../shared/utils/trading';

const snsClient = new SNSClient({
    region: "eu-west-3"
});
const dynamoClient = new DynamoDBClient({});

// Charger la configuration des bots Telegram
const loadTelegramBots = async (): Promise<Array<{symbol: string; chatId: string; botToken: string}>> => {
  try {
    // Utiliser la variable d'environnement ou le nom de la table créée
    const tableName = process.env.TELEGRAM_BOTS_TABLE || 'TradingStack-TelegramBotsTable';
    console.log(`🔍 Loading Telegram bots from table: ${tableName}`);
    const response = await dynamoClient.send(new ScanCommand({
      TableName: tableName
    }));
    return response.Items?.map(item => ({
      symbol: item.symbol.S || '',
      chatId: item.chat_id.S || '',
      botToken: item.bot_token.S || ''
    })) || [];
  } catch (error: any) {
    // Si la table n'existe pas, c'est OK, on continue sans Telegram
    if (error.name === 'ResourceNotFoundException') {
      console.log('⚠️  Telegram bots table not found, continuing without Telegram notifications');
      return [];
    }
    console.error('Error loading Telegram bots:', error);
    return [];
  }
};

// Envoyer une notification Telegram
const sendTelegramNotification = async (symbol: string, data: TradingViewAlert): Promise<void> => {
  try {
    console.log(`📱 Attempting to send Telegram notification for ${symbol}`);
    const bots = await loadTelegramBots();
    console.log(`📋 Found ${bots.length} Telegram bot(s) configured`);
    const bot = bots.find(b => b.symbol === symbol);
    
    if (!bot) {
      console.warn(`⚠️  No Telegram bot found for ${symbol}`);
      return;
    }
    
    console.log(`✅ Telegram bot found for ${symbol}, sending message...`);

    // Formater le message Telegram
    const alertTypeEmoji = data.alertType === 'RSI' ? '📉' : data.alertType === 'MACD' ? '📈' : '📊';
    const alertTitle = data.alertType 
      ? `${alertTypeEmoji} ${data.alertType} Alert: ${data.symbol}${data.signalType ? ` (${data.signalType})` : ''}`
      : `📊 Trading Alert: ${data.symbol}`;
    
    let message = `*${alertTitle}*\n\n`;
    message += `*Symbol:* ${data.symbol}\n`;
    message += `*Price:* ${data.price}\n`;
    message += `*Time:* ${data.time}\n`;
    
    if (data.alertType || data.signalType) {
      if (data.alertType) {
        message += `*Alert Type:* ${data.alertType}\n`;
      }
      if (data.signalType) {
        message += `*Signal Type:* ${data.signalType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}\n`;
      }
      message += `\n`;
    }
    
    if (data.indicators) {
      if (data.indicators.rsi !== undefined) {
        message += `*RSI:* ${data.indicators.rsi.toFixed(2)}\n`;
      }
      if (data.indicators.macd) {
        message += `*MACD:* ${data.indicators.macd.macd?.toFixed(4) || 'N/A'}\n`;
        message += `*Signal:* ${data.indicators.macd.signal?.toFixed(4) || 'N/A'}\n`;
        message += `*Histogram:* ${data.indicators.macd.histogram?.toFixed(4) || 'N/A'}\n`;
      }
      if (data.indicators.stoch) {
        message += `*Stoch K:* ${data.indicators.stoch.k?.toFixed(2) || 'N/A'}\n`;
        message += `*Stoch D:* ${data.indicators.stoch.d?.toFixed(2) || 'N/A'}\n`;
      }
    }

    // Envoyer via l'API Telegram Bot
    const telegramApiUrl = `https://api.telegram.org/bot${bot.botToken}/sendMessage`;
    await axios.post(telegramApiUrl, {
      chat_id: bot.chatId,
      text: message,
      parse_mode: 'Markdown'
    });
    
    console.log(`Notification sent to Telegram for ${symbol}`);
  } catch (error) {
    console.error(`Error sending Telegram notification for ${symbol}:`, error);
    // Ne pas faire échouer le traitement si Telegram échoue
  }
};

const processTradeSignal = async (data: TradingViewAlert) => {
  const timestamp = new Date().toISOString();
  const alertId = uuidv4();

  // Log le signal de trading
  console.log('Processing trade signal:', {
    symbol: data.symbol,
    price: data.price,
    time: data.time,
    indicators: data.indicators
  });

  // Préparer les données pour DynamoDB
  const itemData: any = {
    id: alertId,
    timestamp,
    symbol: data.symbol,
    price: data.price,
    time: data.time,
    status: 'PROCESSED'
  };

  // Ajouter alertType et signalType si présents
  if (data.alertType) {
    itemData.alertType = data.alertType;
  }
  if (data.signalType) {
    itemData.signalType = data.signalType;
  }

  // Fonction helper pour filtrer les NaN et valeurs invalides
  const isValidNumber = (value: any): boolean => {
    return value !== undefined && value !== null && !isNaN(value) && isFinite(value);
  };

  // Ajouter les indicateurs s'ils existent (filtre les NaN)
  const filteredIndicators: string[] = [];
  
  if (data.indicators) {
    // RSI
    if (isValidNumber(data.indicators.rsi)) {
      itemData.rsi = data.indicators.rsi;
    } else if (data.indicators.rsi !== undefined) {
      filteredIndicators.push('RSI (NaN)');
    }
    
    // MACD
    if (data.indicators.macd) {
      if (isValidNumber(data.indicators.macd.macd)) {
        itemData.macd = data.indicators.macd.macd;
      } else {
        filteredIndicators.push('MACD.macd (NaN)');
      }
      if (isValidNumber(data.indicators.macd.signal)) {
        itemData.macd_signal = data.indicators.macd.signal;
      } else {
        filteredIndicators.push('MACD.signal (NaN)');
      }
      if (isValidNumber(data.indicators.macd.histogram)) {
        itemData.macd_histogram = data.indicators.macd.histogram;
      } else {
        filteredIndicators.push('MACD.histogram (NaN)');
      }
    }
    
    // Stochastique
    if (data.indicators.stoch) {
      if (isValidNumber(data.indicators.stoch.k)) {
        itemData.stoch_k = data.indicators.stoch.k;
      } else {
        filteredIndicators.push('Stoch.K (NaN)');
      }
      if (isValidNumber(data.indicators.stoch.d)) {
        itemData.stoch_d = data.indicators.stoch.d;
      } else {
        filteredIndicators.push('Stoch.D (NaN)');
      }
    }
  }
  
  // Logger les valeurs filtrées si nécessaire
  if (filteredIndicators.length > 0) {
    console.log(`⚠️  Valeurs NaN filtrées (non sauvegardées): ${filteredIndicators.join(', ')}`);
  }

  // 🔍 DEBUG: Vérifier itemData avant nettoyage
  console.log('🔍 DEBUG itemData avant nettoyage:');
  console.log('  itemData keys:', Object.keys(itemData));
  for (const [key, value] of Object.entries(itemData)) {
    console.log(`  ${key}: typeof=${typeof value}, value=${value}, isNaN=${isNaN(value as any)}`);
  }

  // Nettoyer l'objet : supprimer toutes les propriétés undefined/null/NaN
  console.log('🧹 Nettoyage de l\'objet itemData avant sauvegarde...');
  
  // Utiliser un replacer pour JSON.stringify qui convertit NaN en null
  const safeStringify = (obj: any) => {
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
        return null; // Remplacer NaN/Infinity par null pour l'affichage
      }
      return value;
    }, 2);
  };
  console.log('📝 itemData avant nettoyage:', safeStringify(itemData));
  
  const cleanItemData: any = {};
  let cleanedCount = 0;
  
  for (const [key, value] of Object.entries(itemData)) {
    // Ne garder que les valeurs valides (pas undefined, null, NaN, Infinity)
    if (value === undefined || value === null) {
      console.log(`  ⏭️  ${key}: undefined/null, ignoré`);
      continue;
    }
    
    if (typeof value === 'number') {
      if (isNaN(value) || !isFinite(value)) {
        console.log(`  ❌ ${key}: ${value} (NaN/infini), ignoré`);
        cleanedCount++;
        continue;
      }
      console.log(`  ✅ ${key}: ${value} (nombre valide)`);
      cleanItemData[key] = value;
    } else if (typeof value === 'object' && value !== null) {
      // Pour les objets, on doit aussi nettoyer récursivement
      const cleanedObj: any = {};
      let objHasValidData = false;
      
      for (const [objKey, objValue] of Object.entries(value)) {
        if (objValue !== undefined && objValue !== null) {
          if (typeof objValue === 'number') {
            if (!isNaN(objValue) && isFinite(objValue)) {
              cleanedObj[objKey] = objValue;
              objHasValidData = true;
            } else {
              console.log(`    ❌ ${key}.${objKey}: ${objValue} (NaN/infini), ignoré`);
            }
          } else {
            cleanedObj[objKey] = objValue;
            objHasValidData = true;
          }
        }
      }
      
      if (objHasValidData) {
        cleanItemData[key] = cleanedObj;
        console.log(`  ✅ ${key}: objet nettoyé`);
      } else {
        console.log(`  ⏭️  ${key}: objet vide après nettoyage, ignoré`);
      }
    } else {
      // Pour les strings, etc., on garde tout
      console.log(`  ✅ ${key}: ${value} (${typeof value})`);
      cleanItemData[key] = value;
    }
  }
  
  console.log(`📦 Données nettoyées (${cleanedCount} valeurs NaN supprimées):`, JSON.stringify(cleanItemData, null, 2));

  // Sauvegarder l'alerte dans DynamoDB
  await dynamoClient.send(new PutItemCommand({
    TableName: process.env.TRADING_ALERTS_TABLE,
    Item: marshall(cleanItemData)
  }));

  // Envoyer une notification Telegram
  await sendTelegramNotification(data.symbol, data);

  // Envoyer une notification via SNS
  const alertTypeLabel = data.alertType || 'General';
  const signalTypeLabel = data.signalType ? ` (${data.signalType})` : '';
  const message = {
    default: `New ${alertTypeLabel} trading signal${signalTypeLabel} for ${data.symbol} at ${data.price}`,
    email: {
      subject: `${alertTypeLabel} Trading Alert: ${data.symbol}${signalTypeLabel}`,
      body: `
        Alert Type: ${alertTypeLabel}${signalTypeLabel ? `\nSignal Type: ${data.signalType}` : ''}
        Symbol: ${data.symbol}
        Price: ${data.price}
        Time: ${data.time}
        ${data.indicators ? `
        ${data.indicators.rsi !== undefined ? `RSI: ${data.indicators.rsi.toFixed(2)}` : ''}
        ${data.indicators.macd ? `
        MACD: ${data.indicators.macd.macd?.toFixed(4) || 'N/A'}
        Signal: ${data.indicators.macd.signal?.toFixed(4) || 'N/A'}
        Histogram: ${data.indicators.macd.histogram?.toFixed(4) || 'N/A'}` : ''}
        ${data.indicators.stoch ? `Stoch K: ${data.indicators.stoch.k?.toFixed(2) || 'N/A'}` : ''}
        ` : ''}
      `
    }
  };

  console.log('Sending SNS notification with TopicArn:', process.env.SNS_TOPIC_ARN);
  
  await snsClient.send(new PublishCommand({
    TopicArn: process.env.SNS_TOPIC_ARN,
    Message: JSON.stringify(message),
    MessageStructure: 'json'
  }));

  return {
    processed: true,
    timestamp,
    alertId,
    signal: {
      symbol: data.symbol,
      price: data.price,
      time: data.time,
      indicators: data.indicators
    }
  };
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // 🔍 DEBUG: Logger tout l'event pour diagnostiquer
    console.log('=== TRADINGVIEW WEBHOOK EVENT DEBUG ===');
    console.log('Event:', JSON.stringify(event, null, 2));
    console.log('Method:', event.httpMethod);
    console.log('Headers:', JSON.stringify(event.headers, null, 2));
    console.log('Body:', event.body);
    console.log('Body type:', typeof event.body);
    console.log('Is base64 encoded:', event.isBase64Encoded);
    console.log('========================================');

    // Gérer les requêtes OPTIONS
    if (event.httpMethod === 'OPTIONS') {
      return handleCorsPreflight();
    }

    // Vérifier si nous avons un body
    if (!event.body) {
      console.error('❌ No body provided in event');
      console.error('Event keys:', Object.keys(event));
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ 
          message: 'No body provided',
          debug: {
            hasBody: !!event.body,
            method: event.httpMethod,
            headers: event.headers
          }
        }),
      };
    }

    // Parser le body
    let webhookData;
    try {
      // Si body est base64 encodé, le décoder
      let bodyString = event.body;
      if (event.isBase64Encoded) {
        bodyString = Buffer.from(event.body, 'base64').toString('utf-8');
        console.log('Decoded base64 body:', bodyString);
      }
      
      webhookData = JSON.parse(bodyString);
      
      // 🔧 Convertir NaN en null (TradingView peut envoyer NaN dans le JSON)
      // JSON ne supporte pas NaN, mais JavaScript le permet après parsing
      const convertNaNtoNull = (obj: any): any => {
        if (obj === null || obj === undefined) {
          return obj;
        }
        if (typeof obj === 'number' && (isNaN(obj) || !isFinite(obj))) {
          return null;
        }
        if (Array.isArray(obj)) {
          return obj.map(convertNaNtoNull);
        }
        if (typeof obj === 'object') {
          const result: any = {};
          for (const [key, value] of Object.entries(obj)) {
            result[key] = convertNaNtoNull(value);
          }
          return result;
        }
        return obj;
      };
      
      webhookData = convertNaNtoNull(webhookData);
      console.log('✅ Parsed webhook data (NaN → null):', JSON.stringify(webhookData, null, 2));
      
      // 🔍 DEBUG: Logger le typeof de chaque valeur
      console.log('🔍 DEBUG typeof des valeurs:');
      console.log('  price:', typeof webhookData.price, '=', webhookData.price);
      if (webhookData.indicators) {
        console.log('  indicators.rsi:', typeof webhookData.indicators.rsi, '=', webhookData.indicators.rsi);
        if (webhookData.indicators.macd) {
          console.log('  indicators.macd.macd:', typeof webhookData.indicators.macd.macd, '=', webhookData.indicators.macd.macd);
          console.log('  indicators.macd.signal:', typeof webhookData.indicators.macd.signal, '=', webhookData.indicators.macd.signal);
          console.log('  indicators.macd.histogram:', typeof webhookData.indicators.macd.histogram, '=', webhookData.indicators.macd.histogram);
        }
        if (webhookData.indicators.stoch) {
          console.log('  indicators.stoch.k:', typeof webhookData.indicators.stoch.k, '=', webhookData.indicators.stoch.k);
          console.log('  indicators.stoch.d:', typeof webhookData.indicators.stoch.d, '=', webhookData.indicators.stoch.d);
        }
      }
    } catch (parseError) {
      console.error('❌ Error parsing JSON:', parseError);
      console.error('Raw body:', event.body);
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ 
          message: 'Invalid JSON format',
          error: parseError instanceof Error ? parseError.message : 'Unknown error',
          rawBody: event.body
        }),
      };
    }

    // Fonction helper pour valider et nettoyer les valeurs numériques
    // Si c'est déjà un nombre valide, on l'utilise directement (pas de parseFloat inutile)
    const validateNumber = (value: any, fieldName: string = 'unknown'): number | undefined => {
      // Si c'est déjà undefined ou null (TradingView envoie "null" qui devient null après JSON.parse)
      if (value === undefined || value === null) {
        console.log(`  ⏭️  ${fieldName}: null/undefined, ignoré`);
        return undefined;
      }
      
      // Si c'est déjà un nombre
      if (typeof value === "number") {
        // Si c'est NaN ou infini, on ignore
        if (isNaN(value) || !isFinite(value)) {
          console.log(`  ⚠️  ${fieldName}: ${value} (NaN/infini), ignoré`);
          return undefined;
        }
        // Sinon, on utilise directement la valeur (pas besoin de parseFloat)
        console.log(`  ✅ ${fieldName}: ${value} (nombre valide, utilisé tel quel)`);
        return value;
      }
      
      // Si c'est une string
      if (typeof value === "string") {
        // Si c'est littéralement "NaN", "null", "undefined" ou vide, on ignore
        const trimmed = value.trim().toLowerCase();
        if (trimmed === "nan" || trimmed === "null" || trimmed === "undefined" || trimmed === "") {
          console.log(`  ⚠️  ${fieldName}: string "${value}" invalide, ignoré`);
          return undefined;
        }
        // Parser la string en nombre
        const parsed = parseFloat(value);
        if (isNaN(parsed) || !isFinite(parsed)) {
          console.log(`  ⚠️  ${fieldName}: parseFloat("${value}") = ${parsed} (invalide), ignoré`);
          return undefined;
        }
        console.log(`  ✅ ${fieldName}: parseFloat("${value}") = ${parsed} (valide)`);
        return parsed;
      }
      
      // Type non supporté
      console.log(`  ⚠️  ${fieldName}: type ${typeof value} non supporté, ignoré`);
      return undefined;
    };

    // Nettoyer les valeurs : si c'est déjà un nombre valide, on l'utilise directement
    // Si c'est une string, on la parse. Si c'est NaN, on l'ignore.
    console.log('🔍 Nettoyage des valeurs...');
    
    // Price
    if (webhookData.price !== undefined) {
      const validPrice = validateNumber(webhookData.price, 'Price');
      if (validPrice === undefined) {
        console.error('❌ Price is NaN or invalid:', webhookData.price);
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ 
            message: 'Invalid price value',
            error: 'Price cannot be NaN or invalid'
          }),
        };
      }
      webhookData.price = validPrice;
    }

    // Indicateurs
    if (webhookData.indicators) {
      if (webhookData.indicators.rsi !== undefined) {
        webhookData.indicators.rsi = validateNumber(webhookData.indicators.rsi, 'RSI');
      }
      if (webhookData.indicators.macd) {
        if (webhookData.indicators.macd.macd !== undefined) {
          webhookData.indicators.macd.macd = validateNumber(webhookData.indicators.macd.macd, 'MACD.macd');
        }
        if (webhookData.indicators.macd.signal !== undefined) {
          webhookData.indicators.macd.signal = validateNumber(webhookData.indicators.macd.signal, 'MACD.signal');
        }
        if (webhookData.indicators.macd.histogram !== undefined) {
          webhookData.indicators.macd.histogram = validateNumber(webhookData.indicators.macd.histogram, 'MACD.histogram');
        }
      }
      if (webhookData.indicators.stoch) {
        if (webhookData.indicators.stoch.k !== undefined) {
          webhookData.indicators.stoch.k = validateNumber(webhookData.indicators.stoch.k, 'Stoch.K');
        }
        if (webhookData.indicators.stoch.d !== undefined) {
          webhookData.indicators.stoch.d = validateNumber(webhookData.indicators.stoch.d, 'Stoch.D');
        }
      }
    }
    
    console.log('✅ Données nettoyées:', JSON.stringify(webhookData, null, 2));

    // Valider le format des données
    if (!validateWebhookData(webhookData)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ 
          message: 'Invalid webhook data format',
          required_format: {
            symbol: 'string',
            price: 'number',
            time: 'string',
            indicators: 'object (optional)'
          }
        }),
      };
    }

    // Traiter le signal de trading
    const result = await processTradeSignal(webhookData);

    // Retourner la réponse
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: 'Webhook processed successfully',
        data: result,
      }),
    };

  } catch (error) {
    console.error('Error processing webhook:', error);
    
    // Gérer les différents types d'erreurs
    if (error instanceof SyntaxError) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          message: 'Invalid JSON format',
          error: error.message,
        }),
      };
    }

    return formatErrorResponse(error);
  }
}; 