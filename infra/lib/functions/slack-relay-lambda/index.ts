import { SNSEvent } from 'aws-lambda';
import { App } from '@slack/bolt';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

// Initialiser le client Secrets Manager
const secretsClient = new SecretsManagerClient({
  region: "eu-west-3"
});

// Fonction pour récupérer le token Slack depuis Secrets Manager
async function getSlackBotToken(): Promise<string | null> {
  try {
    const command = new GetSecretValueCommand({ 
      SecretId: 'slack/bot-token'
    });
    
    const response = await secretsClient.send(command);
    const secretString = response.SecretString;
    if (!secretString) {
      console.warn('⚠️  Slack bot token secret not found in Secrets Manager');
      return null;
    }
    const secret = JSON.parse(secretString);
    return secret.SLACK_BOT_TOKEN;
  } catch (error: any) {
    if (error.name === 'ResourceNotFoundException') {
      console.warn('⚠️  Slack bot token secret not found in Secrets Manager. Slack notifications will be skipped.');
      return null;
    }
    console.error('❌ Error retrieving Slack bot token:', error);
    throw error;
  }
}

// Handler Lambda pour SNS
export const handler = async (event: SNSEvent) => {
  console.log('Received SNS event:', JSON.stringify(event, null, 2));
  
  // Récupérer le token Slack (peut être null si le secret n'existe pas)
  const token = await getSlackBotToken();
  
  // Si pas de token, on skip l'envoi Slack mais on continue le traitement
  if (!token) {
    console.log('ℹ️  Skipping Slack notification (token not configured)');
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'SNS event processed, Slack notification skipped (token not configured)' })
    };
  }
  
  // Initialiser l'app Slack
  const app = new App({
    token,
    signingSecret: 'not-needed-for-simple-posting',
  });

  for (const record of event.Records) {
    try {
      console.log('Processing SNS record:', JSON.stringify(record.Sns, null, 2));
      
      // Extraire les données du message SNS
      let messageData;
      try {
        const rawMessage = record.Sns.Message;
        
        // Essayer de parser comme JSON structuré d'abord
        try {
          const parsedMessage = JSON.parse(rawMessage);
          // Si c'est un message structuré avec format slack
          if (parsedMessage.slack) {
            messageData = JSON.parse(parsedMessage.slack);
          } 
          // Si c'est déjà un message formaté pour Slack
          else if (parsedMessage.blocks) {
            messageData = parsedMessage;
          }
          // Sinon, créer un message simple
          else {
            messageData = {
              blocks: [
                {
                  type: "section",
                  text: {
                    type: "mrkdwn",
                    text: rawMessage
                  }
                }
              ]
            };
          }
        } catch (e) {
          // Si ce n'est pas du JSON, créer un message simple
          messageData = {
            blocks: [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: rawMessage
                }
              }
            ]
          };
        }
        
        console.log('Parsed message data:', JSON.stringify(messageData, null, 2));
      } catch (parseError) {
        console.error('Error processing SNS message:', parseError);
        throw parseError;
      }

      // Vérifier que nous avons les blocks pour Slack
      if (!messageData?.blocks) {
        throw new Error('Invalid message format: missing Slack blocks');
      }

      // Envoyer le message via l'API Slack
      const channel = 'trading-alerts';
      await app.client.chat.postMessage({
        channel,
        blocks: messageData.blocks,
        text: typeof messageData.blocks[0]?.text?.text === 'string' 
          ? messageData.blocks[0].text.text 
          : 'Trading Alert'
      });

      console.log('Message sent successfully to Slack');
    } catch (error) {
      console.error('Error processing record:', error);
      throw error;
    }
  }
}; 