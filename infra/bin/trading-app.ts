#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { TradingStack } from '../lib/stacks/trading-stack';

const app = new cdk.App();

// Environnement commun
const env = { 
  account: process.env.CDK_DEFAULT_ACCOUNT, 
  region: process.env.CDK_DEFAULT_REGION 
};

// Create ONLY the Trading stack (autonome, pas de dépendances)
const tradingStack = new TradingStack(app, 'TradingStack', {
  env
});

// Ajouter des tags pour identifier facilement
cdk.Tags.of(tradingStack).add('Stack', 'Trading');
cdk.Tags.of(tradingStack).add('Purpose', 'TradingView-Webhooks');

