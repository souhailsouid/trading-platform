import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import { Construct } from 'constructs';
import * as path from 'path';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';


  
interface TradingStackProps extends cdk.StackProps {

}

export class TradingStack extends cdk.Stack {
  public readonly tradingAlertsTable: Table;

  constructor(scope: Construct, id: string, props?: TradingStackProps) {
    super(scope, id, props);

    // Créer la table DynamoDB pour les alertes de trading (autonome)
    this.tradingAlertsTable = new dynamodb.Table(this, 'TradingAlertsTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: true, // Point-in-time recovery activé
    });

    // Add GSI for querying by symbol
    this.tradingAlertsTable.addGlobalSecondaryIndex({
      indexName: 'SymbolIndex',
      partitionKey: { name: 'symbol', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Create SNS topic for trading notifications
    const tradingNotificationsTopic = new sns.Topic(this, 'TradingNotificationsTopic', {
      displayName: 'Trading Notifications',
      topicName: 'trading-notifications-v2',
    });

    // Table pour les bots Telegram
    const telegramBotsTable = new dynamodb.Table(this, 'TelegramBotsTable', {
      partitionKey: { name: 'symbol', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // Create the webhook handler Lambda
    const webhookHandler = new nodejs.NodejsFunction(this, 'TradingViewWebhookHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, '../functions/tradingview-webhook/index.ts'),
      handler: 'handler',
      memorySize: 256,
      timeout: cdk.Duration.seconds(30),
      description: `Webhook handler for TradingView alerts - Telegram notifications only - Updated ${new Date().toISOString()}`,
      environment: {
        NODE_OPTIONS: '--enable-source-maps',
        TRADING_ALERTS_TABLE: this.tradingAlertsTable.tableName,
        TELEGRAM_BOTS_TABLE: telegramBotsTable.tableName,
        SNS_TOPIC_ARN: tradingNotificationsTopic.topicArn
      },
      bundling: {
        minify: true,
        sourceMap: true,
        target: 'node18',
        mainFields: ['module', 'main'],
        forceDockerBundling: false, // Ne pas utiliser Docker
        externalModules: [
          'aws-sdk',
          '@aws-sdk/*',
        ],
        esbuildArgs: {
          '--tree-shaking': 'true',
          '--bundle': 'true',
          '--platform': 'node'
        }
      }
    });

    // Create the get alerts Lambda
    const getAlertsHandler = new nodejs.NodejsFunction(this, 'GetTradingAlertsHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, '../functions/get-trading-alerts/index.ts'),
      handler: 'handler',
      memorySize: 256,
      timeout: cdk.Duration.seconds(30),
      environment: {
        NODE_OPTIONS: '--enable-source-maps',
        TRADING_ALERTS_TABLE: this.tradingAlertsTable.tableName
      },
      bundling: {
        minify: true,
        sourceMap: true,
        target: 'node18',
        forceDockerBundling: false, // Ne pas utiliser Docker
        externalModules: [
          'aws-sdk',
          '@aws-sdk/*',
        ],
      }
    });

    // Grant permissions
    this.tradingAlertsTable.grantWriteData(webhookHandler);
    this.tradingAlertsTable.grantReadData(getAlertsHandler);
    telegramBotsTable.grantReadData(webhookHandler);
    tradingNotificationsTopic.grantPublish(webhookHandler);

    // Create the API Gateway
    const api = new apigateway.RestApi(this, 'TradingViewWebhookApi', {
      restApiName: 'TradingView Webhook API',
      description: 'API pour recevoir les webhooks de TradingView et récupérer les alertes',
      deployOptions: {
        stageName: 'prod',
        tracingEnabled: true,
        dataTraceEnabled: true,
        metricsEnabled: true,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    // Créer une clé API avec une valeur spécifique
    const apiKeyValue = 'tv-webhook-key-' + Buffer.from(Date.now().toString()).toString('base64');
    const apiKey = new apigateway.ApiKey(this, 'TradingViewWebhookApiKey', {
      apiKeyName: '___trading-view-webhook-key-v2-',
      enabled: true,
      description: 'Clé API pour les webhooks TradingView',
    });

    // Créer un plan d'utilisation
    const usagePlan = api.addUsagePlan('TradingViewWebhookUsagePlan', {
      name: 'TradingView Webhook Usage Plan',
      description: 'Plan d\'utilisation pour les webhooks TradingView',
      apiStages: [{
        api,
        stage: api.deploymentStage,
      }],
      throttle: {
        rateLimit: 10,
        burstLimit: 20
      },
      quota: {
        limit: 1000,
        period: apigateway.Period.DAY
      }
    });

    // Associer la clé API au plan d'utilisation
    usagePlan.addApiKey(apiKey);

    // Créer les ressources et méthodes
    const webhooks = api.root.addResource('webhooks');
    webhooks.addMethod('POST', new apigateway.LambdaIntegration(webhookHandler), {
      apiKeyRequired: false,
    });

    const alerts = api.root.addResource('alerts');
    alerts.addMethod('GET', new apigateway.LambdaIntegration(getAlertsHandler), {
      apiKeyRequired: false, // Pas besoin de clé API pour récupérer les alertes
    });

    // Support pour les paramètres de requête
    const alertsWithParams = alerts.addResource('{proxy+}');
    alertsWithParams.addMethod('GET', new apigateway.LambdaIntegration(getAlertsHandler), {
      apiKeyRequired: false,
    });
      
    // Donner les permissions nécessaires
    tradingNotificationsTopic.grantPublish(webhookHandler);

    // Outputs pour faciliter l'utilisation
    new cdk.CfnOutput(this, 'WebhookApiUrl', {
      value: `${api.url}webhooks`,
      description: 'URL de l\'endpoint webhook',
    });

    new cdk.CfnOutput(this, 'AlertsApiUrl', {
      value: `${api.url}alerts`,
      description: 'URL de l\'endpoint pour récupérer les alertes',
    });

    new cdk.CfnOutput(this, 'ApiKeyValue', {
      value: apiKeyValue,
      description: 'Valeur de la clé API',
    });

    // Exporter l'ARN de la clé API
    new cdk.CfnOutput(this, 'ApiKeyArn', {
      value: `arn:aws:apigateway:${this.region}::/apikeys/${apiKey.keyId}`,
      description: 'ARN de la clé API',
    });
  }
} 