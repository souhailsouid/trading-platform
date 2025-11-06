import { KLinesDataType } from '../types';
import {
    calculateBollingerBands,
    calculateMACD,
    calculateRSI,
    calculateStochastic,
} from './TechnicalIndicators';

export enum SignalType {
    BUY = 'BUY',
    SELL = 'SELL',
}

export enum SignalSource {
    MACD_CROSSOVER = 'MACD_CROSSOVER',
    RSI_OVERSOLD = 'RSI_OVERSOLD',
    RSI_OVERBOUGHT = 'RSI_OVERBOUGHT',
    RSI_BREAKDOWN = 'RSI_BREAKDOWN',
    BOLLINGER_TOUCH_LOWER = 'BOLLINGER_TOUCH_LOWER',
    BOLLINGER_TOUCH_UPPER = 'BOLLINGER_TOUCH_UPPER',
    STOCH_OVERSOLD = 'STOCH_OVERSOLD',
    STOCH_OVERBOUGHT = 'STOCH_OVERBOUGHT',
    MULTIPLE_CONFIRMATION = 'MULTIPLE_CONFIRMATION',
}

export interface TradingSignal {
    id: string;
    type: SignalType;
    source: SignalSource;
    symbol: string;
    timestamp: number;
    price: number;
    message: string;
    strength: number;
    indicators: {
        rsi?: number;
        macd?: number;
        macdSignal?: number;
        stochK?: number;
        stochD?: number;
    };
}

/**
 * Détecte les signaux de trading à partir des données klines
 */
export const detectSignals = (
    klinesData: KLinesDataType[],
    symbol: string
): TradingSignal[] => {
    if (!klinesData || klinesData.length < 50) {
        return [];
    }

    const signals: TradingSignal[] = [];

    // Extraire les données
    const closePrices = klinesData.map((k) => parseFloat(k[4]));
    const highPrices = klinesData.map((k) => parseFloat(k[2]));
    const lowPrices = klinesData.map((k) => parseFloat(k[3]));
    const currentPrice = closePrices[closePrices.length - 1];
    const currentIndex = closePrices.length - 1;
    const prevIndex = currentIndex - 1;

    // Calculer les indicateurs
    const rsi = calculateRSI(closePrices, 14);
    const { macd, signal: macdSignal } = calculateMACD(closePrices, 12, 26, 9);
    const { k: stochK, d: stochD } = calculateStochastic(
        highPrices,
        lowPrices,
        closePrices,
        14,
        3
    );
    const { upper: bbUpper, lower: bbLower } = calculateBollingerBands(closePrices, 20, 2);

    // Valeurs actuelles et précédentes
    const currentRSI = rsi[currentIndex];
    const prevRSI = rsi[prevIndex];
    const currentMACD = macd[currentIndex];
    const prevMACD = macd[prevIndex];
    const currentMACDSignal = macdSignal[currentIndex];
    const prevMACDSignal = macdSignal[prevIndex];
    const currentStochK = stochK[currentIndex];
    const currentStochD = stochD[currentIndex];
    const currentBBLower = bbLower[currentIndex];
    const currentBBUpper = bbUpper[currentIndex];

    // 1. Détecter croisement MACD
    if (
        !isNaN(currentMACD) && !isNaN(currentMACDSignal) &&
        !isNaN(prevMACD) && !isNaN(prevMACDSignal)
    ) {
        // Croisement haussier (MACD croise au-dessus du signal)
        if (currentMACD > currentMACDSignal && prevMACD <= prevMACDSignal) {
            signals.push({
                id: `${symbol}-${Date.now()}-macd-buy`,
                type: SignalType.BUY,
                source: SignalSource.MACD_CROSSOVER,
                symbol,
                timestamp: Date.now(),
                price: currentPrice,
                message: `Croisement MACD haussier: MACD (${currentMACD.toFixed(4)}) > Signal (${currentMACDSignal.toFixed(4)})`,
                strength: 75,
                indicators: { macd: currentMACD, macdSignal: currentMACDSignal },
            });
        }

        // Croisement baissier (MACD croise en-dessous du signal)
        if (currentMACD < currentMACDSignal && prevMACD >= prevMACDSignal) {
            signals.push({
                id: `${symbol}-${Date.now()}-macd-sell`,
                type: SignalType.SELL,
                source: SignalSource.MACD_CROSSOVER,
                symbol,
                timestamp: Date.now(),
                price: currentPrice,
                message: `Croisement MACD baissier: MACD (${currentMACD.toFixed(4)}) < Signal (${currentMACDSignal.toFixed(4)})`,
                strength: 75,
                indicators: { macd: currentMACD, macdSignal: currentMACDSignal },
            });
        }
    }

    // 2. Détecter RSI
    if (!isNaN(currentRSI)) {
        // RSI surachat (> 70)
        if (currentRSI > 70) {
            signals.push({
                id: `${symbol}-${Date.now()}-rsi-overbought`,
                type: SignalType.SELL,
                source: SignalSource.RSI_OVERBOUGHT,
                symbol,
                timestamp: Date.now(),
                price: currentPrice,
                message: `RSI surachat: ${currentRSI.toFixed(2)} (seuil: 70)`,
                strength: 60,
                indicators: { rsi: currentRSI },
            });
        }

        // RSI survente (< 30)
        if (currentRSI < 30) {
            signals.push({
                id: `${symbol}-${Date.now()}-rsi-oversold`,
                type: SignalType.BUY,
                source: SignalSource.RSI_OVERSOLD,
                symbol,
                timestamp: Date.now(),
                price: currentPrice,
                message: `RSI survente: ${currentRSI.toFixed(2)} (seuil: 30)`,
                strength: 60,
                indicators: { rsi: currentRSI },
            });
        }

        // Cassure baissière RSI (passe sous 50 après être au-dessus)
        if (!isNaN(prevRSI) && currentRSI < 50 && prevRSI >= 50) {
            signals.push({
                id: `${symbol}-${Date.now()}-rsi-breakdown`,
                type: SignalType.SELL,
                source: SignalSource.RSI_BREAKDOWN,
                symbol,
                timestamp: Date.now(),
                price: currentPrice,
                message: `Cassure baissière RSI: ${currentRSI.toFixed(2)} (passage sous 50)`,
                strength: 70,
                indicators: { rsi: currentRSI },
            });
        }
    }

    // 3. Détecter Stochastic
    if (!isNaN(currentStochK) && !isNaN(currentStochD)) {
        // Stochastic surachat (> 80)
        if (currentStochK > 80 || currentStochD > 80) {
            signals.push({
                id: `${symbol}-${Date.now()}-stoch-overbought`,
                type: SignalType.SELL,
                source: SignalSource.STOCH_OVERBOUGHT,
                symbol,
                timestamp: Date.now(),
                price: currentPrice,
                message: `Stochastic surachat: %K=${currentStochK.toFixed(2)}, %D=${currentStochD.toFixed(2)}`,
                strength: 55,
                indicators: { stochK: currentStochK, stochD: currentStochD },
            });
        }

        // Stochastic survente (< 20)
        if (currentStochK < 20 || currentStochD < 20) {
            signals.push({
                id: `${symbol}-${Date.now()}-stoch-oversold`,
                type: SignalType.BUY,
                source: SignalSource.STOCH_OVERSOLD,
                symbol,
                timestamp: Date.now(),
                price: currentPrice,
                message: `Stochastic survente: %K=${currentStochK.toFixed(2)}, %D=${currentStochD.toFixed(2)}`,
                strength: 55,
                indicators: { stochK: currentStochK, stochD: currentStochD },
            });
        }
    }

    // 4. Détecter Bollinger Bands
    if (!isNaN(currentBBLower) && !isNaN(currentBBUpper)) {
        // Prix touche bande inférieure (signal achat)
        if (currentPrice <= currentBBLower * 1.001) {
            signals.push({
                id: `${symbol}-${Date.now()}-bb-lower`,
                type: SignalType.BUY,
                source: SignalSource.BOLLINGER_TOUCH_LOWER,
                symbol,
                timestamp: Date.now(),
                price: currentPrice,
                message: `Prix touche bande inférieure Bollinger: ${currentPrice.toFixed(4)}`,
                strength: 65,
                indicators: {},
            });
        }

        // Prix touche bande supérieure (signal vente)
        if (currentPrice >= currentBBUpper * 0.999) {
            signals.push({
                id: `${symbol}-${Date.now()}-bb-upper`,
                type: SignalType.SELL,
                source: SignalSource.BOLLINGER_TOUCH_UPPER,
                symbol,
                timestamp: Date.now(),
                price: currentPrice,
                message: `Prix touche bande supérieure Bollinger: ${currentPrice.toFixed(4)}`,
                strength: 65,
                indicators: {},
            });
        }
    }

    // 5. Détecter confirmations multiples
    const buySignals = signals.filter(s => s.type === SignalType.BUY);
    const sellSignals = signals.filter(s => s.type === SignalType.SELL);

    if (buySignals.length >= 2) {
        const avgStrength = Math.min(100, buySignals.reduce((sum, s) => sum + s.strength, 0) / buySignals.length + 10);
        signals.push({
            id: `${symbol}-${Date.now()}-multiple-buy`,
            type: SignalType.BUY,
            source: SignalSource.MULTIPLE_CONFIRMATION,
            symbol,
            timestamp: Date.now(),
            price: currentPrice,
            message: `🚀 Signal ACHAT confirmé par ${buySignals.length} indicateurs`,
            strength: avgStrength,
            indicators: {
                rsi: currentRSI,
                macd: currentMACD,
                macdSignal: currentMACDSignal,
                stochK: currentStochK,
                stochD: currentStochD,
            },
        });
    }

    if (sellSignals.length >= 2) {
        const avgStrength = Math.min(100, sellSignals.reduce((sum, s) => sum + s.strength, 0) / sellSignals.length + 10);
        signals.push({
            id: `${symbol}-${Date.now()}-multiple-sell`,
            type: SignalType.SELL,
            source: SignalSource.MULTIPLE_CONFIRMATION,
            symbol,
            timestamp: Date.now(),
            price: currentPrice,
            message: `⚠️ Signal VENTE confirmé par ${sellSignals.length} indicateurs`,
            strength: avgStrength,
            indicators: {
                rsi: currentRSI,
                macd: currentMACD,
                macdSignal: currentMACDSignal,
                stochK: currentStochK,
                stochD: currentStochD,
            },
        });
    }

    return signals;
};

