/**
 * Calcul de la Moyenne Mobile Exponentielle (EMA)
 * @param prices - Tableau des prix de clôture
 * @param period - Période de l'EMA (par défaut 12)
 * @returns Tableau des valeurs EMA
 */
export const calculateEMA = (prices: number[], period: number = 12): number[] => {
    if (prices.length < period) {
        return new Array(prices.length).fill(NaN);
    }

    const ema: number[] = new Array(prices.length).fill(NaN);
    const multiplier = 2 / (period + 1);

    // Calculer la première EMA comme moyenne simple
    let sum = 0;
    for (let i = 0; i < period; i++) {
        sum += prices[i];
    }
    ema[period - 1] = sum / period;

    // Calculer les EMA suivantes
    for (let i = period; i < prices.length; i++) {
        ema[i] = (prices[i] - ema[i - 1]) * multiplier + ema[i - 1];
    }

    return ema;
};

/**
 * Calcul du MACD (Moving Average Convergence Divergence)
 * @param prices - Tableau des prix de clôture
 * @param fastPeriod - Période rapide (par défaut 12)
 * @param slowPeriod - Période lente (par défaut 26)
 * @param signalPeriod - Période du signal (par défaut 9)
 * @returns Objet contenant MACD, signal et histogramme
 */
export const calculateMACD = (
    prices: number[],
    fastPeriod: number = 12,
    slowPeriod: number = 26,
    signalPeriod: number = 9
): {
    macd: number[];
    signal: number[];
    histogram: number[];
} => {
    if (prices.length < slowPeriod + signalPeriod) {
        return { macd: [], signal: [], histogram: [] };
    }

    // Calculer les EMA rapide et lente
    const emaFast = calculateEMA(prices, fastPeriod);
    const emaSlow = calculateEMA(prices, slowPeriod);

    // Calculer le MACD (différence entre EMA rapide et lente)
    const macd: number[] = new Array(prices.length).fill(NaN);
    const startIndex = slowPeriod - 1;

    for (let i = startIndex; i < prices.length; i++) {
        if (emaFast[i] !== undefined && emaSlow[i] !== undefined) {
            macd[i] = emaFast[i] - emaSlow[i];
        }
    }

    // Extraire uniquement les valeurs MACD valides pour calculer le signal
    const macdValues = macd.slice(startIndex).filter((val) => !isNaN(val)) as number[];

    if (macdValues.length < signalPeriod) {
        return { macd, signal: new Array(prices.length).fill(NaN), histogram: new Array(prices.length).fill(NaN) };
    }

    // Calculer la ligne de signal (EMA du MACD)
    const signalEMA = calculateEMA(macdValues, signalPeriod);
    const signal: number[] = new Array(prices.length).fill(NaN);

    // Ajouter les valeurs de signal
    const signalStartIndex = startIndex + signalPeriod - 1;
    for (let i = 0; i < signalEMA.length; i++) {
        const index = signalStartIndex + i;
        if (index < prices.length) {
            signal[index] = signalEMA[i];
        }
    }

    // Calculer l'histogramme (différence entre MACD et signal)
    const histogram: number[] = [];
    for (let i = 0; i < prices.length; i++) {
        if (!isNaN(macd[i]) && !isNaN(signal[i])) {
            histogram[i] = macd[i] - signal[i];
        } else {
            histogram[i] = NaN;
        }
    }

    return { macd, signal, histogram };
};

/**
 * Calcul du Stochastic Oscillator
 * @param highPrices - Tableau des prix hauts
 * @param lowPrices - Tableau des prix bas
 * @param closePrices - Tableau des prix de clôture
 * @param kPeriod - Période pour %K (par défaut 14)
 * @param dPeriod - Période pour %D (par défaut 3)
 * @returns Objet contenant %K et %D
 */
export const calculateStochastic = (
    highPrices: number[],
    lowPrices: number[],
    closePrices: number[],
    kPeriod: number = 14,
    dPeriod: number = 3
): {
    k: number[];
    d: number[];
} => {
    if (highPrices.length !== lowPrices.length || highPrices.length !== closePrices.length) {
        return { k: [], d: [] };
    }

    if (highPrices.length < kPeriod) {
        return { k: new Array(highPrices.length).fill(NaN), d: new Array(highPrices.length).fill(NaN) };
    }

    const k: number[] = new Array(highPrices.length).fill(NaN);

    // Calculer %K
    for (let i = kPeriod - 1; i < closePrices.length; i++) {
        const highestHigh = Math.max(...highPrices.slice(i - kPeriod + 1, i + 1));
        const lowestLow = Math.min(...lowPrices.slice(i - kPeriod + 1, i + 1));
        const currentClose = closePrices[i];

        if (highestHigh === lowestLow) {
            k[i] = 50; // Éviter division par zéro
        } else {
            k[i] = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
        }
    }

    // Calculer %D (moyenne mobile simple de %K)
    const d: number[] = new Array(highPrices.length).fill(NaN);

    // Calculer %D (moyenne mobile simple de %K)
    for (let i = kPeriod - 1; i < k.length; i++) {
        const start = Math.max(0, i - dPeriod + 1);
        const end = i + 1;
        const kSlice = k.slice(start, end).filter((val) => !isNaN(val)) as number[];

        if (kSlice.length > 0) {
            const sum = kSlice.reduce((acc, val) => acc + val, 0);
            d[i] = sum / kSlice.length;
        } else {
            d[i] = NaN;
        }
    }

    return { k, d };
};

/**
 * Calcul du RSI (Relative Strength Index)
 * @param prices - Tableau des prix de clôture
 * @param period - Période du RSI (par défaut 14)
 * @returns Tableau des valeurs RSI
 */
export const calculateRSI = (prices: number[], period: number = 14): number[] => {
    if (prices.length < period + 1) {
        return new Array(prices.length).fill(NaN);
    }

    const rsi: number[] = new Array(prices.length).fill(NaN);
    const gains: number[] = [];
    const losses: number[] = [];

    // Calculer les gains et pertes
    for (let i = 1; i < prices.length; i++) {
        const change = prices[i] - prices[i - 1];
        gains.push(change > 0 ? change : 0);
        losses.push(change < 0 ? Math.abs(change) : 0);
    }

    // Calculer la moyenne des gains et pertes sur la période initiale
    let avgGain = 0;
    let avgLoss = 0;

    for (let i = 0; i < period; i++) {
        avgGain += gains[i];
        avgLoss += losses[i];
    }

    avgGain /= period;
    avgLoss /= period;

    // Calculer le premier RSI
    if (avgLoss === 0) {
        rsi[period] = 100;
    } else {
        const rs = avgGain / avgLoss;
        rsi[period] = 100 - (100 / (1 + rs));
    }

    // Calculer les RSI suivants avec moyenne mobile exponentielle
    for (let i = period + 1; i < prices.length; i++) {
        const gainIndex = i - 1;
        const lossIndex = i - 1;

        avgGain = (avgGain * (period - 1) + gains[gainIndex]) / period;
        avgLoss = (avgLoss * (period - 1) + losses[lossIndex]) / period;

        if (avgLoss === 0) {
            rsi[i] = 100;
        } else {
            const rs = avgGain / avgLoss;
            rsi[i] = 100 - (100 / (1 + rs));
        }
    }

    return rsi;
};

/**
 * Calcul de la Moyenne Mobile Simple (SMA)
 * @param prices - Tableau des prix
 * @param period - Période de la SMA
 * @returns Tableau des valeurs SMA
 */
export const calculateSMA = (prices: number[], period: number): number[] => {
    if (prices.length < period) {
        return new Array(prices.length).fill(NaN);
    }

    const sma: number[] = new Array(prices.length).fill(NaN);

    for (let i = period - 1; i < prices.length; i++) {
        let sum = 0;
        for (let j = i - period + 1; j <= i; j++) {
            sum += prices[j];
        }
        sma[i] = sum / period;
    }

    return sma;
};

/**
 * Calcul de l'écart-type
 * @param prices - Tableau des prix
 * @param period - Période
 * @param sma - Moyenne mobile simple correspondante
 * @returns Tableau des écarts-types
 */
const calculateStandardDeviation = (prices: number[], period: number, sma: number[]): number[] => {
    const stdDev: number[] = new Array(prices.length).fill(NaN);

    for (let i = period - 1; i < prices.length; i++) {
        if (isNaN(sma[i])) continue;

        let sumSquaredDiff = 0;
        for (let j = i - period + 1; j <= i; j++) {
            const diff = prices[j] - sma[i];
            sumSquaredDiff += diff * diff;
        }
        stdDev[i] = Math.sqrt(sumSquaredDiff / period);
    }

    return stdDev;
};

/**
 * Calcul des Bandes de Bollinger
 * @param prices - Tableau des prix de clôture
 * @param period - Période de la moyenne mobile (par défaut 20)
 * @param stdDevMultiplier - Multiplicateur de l'écart-type (par défaut 2)
 * @returns Objet contenant la bande supérieure, moyenne et inférieure
 */
export const calculateBollingerBands = (
    prices: number[],
    period: number = 20,
    stdDevMultiplier: number = 2
): {
    upper: number[];
    middle: number[];
    lower: number[];
} => {
    if (prices.length < period) {
        return {
            upper: new Array(prices.length).fill(NaN),
            middle: new Array(prices.length).fill(NaN),
            lower: new Array(prices.length).fill(NaN),
        };
    }

    const middle = calculateSMA(prices, period);
    const stdDev = calculateStandardDeviation(prices, period, middle);

    const upper: number[] = [];
    const lower: number[] = [];

    for (let i = 0; i < prices.length; i++) {
        if (isNaN(middle[i]) || isNaN(stdDev[i])) {
            upper[i] = NaN;
            lower[i] = NaN;
        } else {
            upper[i] = middle[i] + (stdDev[i] * stdDevMultiplier);
            lower[i] = middle[i] - (stdDev[i] * stdDevMultiplier);
        }
    }

    return { upper, middle, lower };
};

