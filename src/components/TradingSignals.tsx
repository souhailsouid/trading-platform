import { Box, Card, CardContent, Chip, LinearProgress, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import { useData } from '../hooks/contexts/useData';
import { useRealtimeSignals } from '../hooks/useRealtimeSignals';
import { KLinesDataType } from '../types';
import { detectSignals, SignalSource, SignalType, TradingSignal } from '../utils/SignalDetector';

const TradingSignals: React.FC = () => {
    const { kLinesData, ticker24hData } = useData();
    const { signals: realtimeSignals, isMonitoring, lastSignal } = useRealtimeSignals();

    // Combiner les signaux statiques et en temps réel
    const signals = useMemo(() => {
        const staticSignals: TradingSignal[] = [];
        
        if (kLinesData && ticker24hData && Array.isArray(kLinesData)) {
            const klines = kLinesData as KLinesDataType[];
            const detectedSignals = detectSignals(klines, ticker24hData.symbol);
            staticSignals.push(...detectedSignals);
        }

        // Combiner avec les signaux en temps réel (priorité aux signaux temps réel)
        const allSignals = [...realtimeSignals, ...staticSignals];
        
        // Dédupliquer par ID
        const uniqueSignals = Array.from(
            new Map(allSignals.map(s => [s.id, s])).values()
        );

        return uniqueSignals;
    }, [kLinesData, ticker24hData, realtimeSignals]);

    const getSignalColor = (type: SignalType) => {
        return type === SignalType.BUY ? 'success' : 'error';
    };

    const getSourceLabel = (source: SignalSource): string => {
        const labels: Record<SignalSource, string> = {
            [SignalSource.MACD_CROSSOVER]: 'MACD',
            [SignalSource.RSI_OVERSOLD]: 'RSI',
            [SignalSource.RSI_OVERBOUGHT]: 'RSI',
            [SignalSource.RSI_BREAKDOWN]: 'RSI',
            [SignalSource.BOLLINGER_TOUCH_LOWER]: 'Bollinger',
            [SignalSource.BOLLINGER_TOUCH_UPPER]: 'Bollinger',
            [SignalSource.STOCH_OVERSOLD]: 'Stochastic',
            [SignalSource.STOCH_OVERBOUGHT]: 'Stochastic',
            [SignalSource.MULTIPLE_CONFIRMATION]: 'Multi',
        };
        return labels[source] || source;
    };

    if (!signals || signals.length === 0) {
        return (
            <Card sx={{ margin: 2 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Signaux de Trading
                    </Typography>
                    <Typography color="textSecondary">
                        Aucun signal détecté pour le moment
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    // Trier par force décroissante
    const sortedSignals = [...signals].sort((a, b) => b.strength - a.strength);

    return (
        <Card sx={{ margin: 2 }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Signaux de Trading ({signals.length})
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                            label={isMonitoring ? '🟢 En direct' : '⚫ Hors ligne'}
                            color={isMonitoring ? 'success' : 'default'}
                            size="small"
                        />
                        {lastSignal && (
                            <Chip
                                label={`Dernier: ${lastSignal.type}`}
                                color={lastSignal.type === SignalType.BUY ? 'success' : 'error'}
                                size="small"
                                variant="outlined"
                            />
                        )}
                    </Box>
                </Box>
                {isMonitoring && (
                    <Box sx={{ mb: 2 }}>
                        <LinearProgress color="success" />
                        <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                            Surveillance en temps réel active - Nouveaux signaux détectés automatiquement
                        </Typography>
                    </Box>
                )}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    {sortedSignals.map((signal) => (
                        <Box
                            key={signal.id}
                            sx={{
                                p: 2,
                                border: `2px solid`,
                                borderColor: signal.type === SignalType.BUY ? 'success.main' : 'error.main',
                                borderRadius: 2,
                                backgroundColor: signal.type === SignalType.BUY
                                    ? 'rgba(76, 175, 80, 0.1)'
                                    : 'rgba(244, 67, 54, 0.1)',
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <Chip
                                        label={signal.type}
                                        color={getSignalColor(signal.type)}
                                        size="small"
                                        sx={{ fontWeight: 'bold' }}
                                    />
                                    <Chip
                                        label={getSourceLabel(signal.source)}
                                        variant="outlined"
                                        size="small"
                                    />
                                    <Chip
                                        label={`Force: ${signal.strength}%`}
                                        variant="outlined"
                                        size="small"
                                        color={signal.strength >= 70 ? 'error' : 'default'}
                                    />
                                </Box>
                                <Typography variant="caption" color="textSecondary">
                                    {new Date(signal.timestamp).toLocaleTimeString()}
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                {signal.message}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                <Typography variant="caption" color="textSecondary">
                                    Prix: ${signal.price.toFixed(4)}
                                </Typography>
                                {signal.indicators.rsi && (
                                    <Typography variant="caption" color="textSecondary">
                                        RSI: {signal.indicators.rsi.toFixed(2)}
                                    </Typography>
                                )}
                                {signal.indicators.macd !== undefined && (
                                    <Typography variant="caption" color="textSecondary">
                                        MACD: {signal.indicators.macd.toFixed(4)}
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    ))}
                </Box>
            </CardContent>
        </Card>
    );
};

export default TradingSignals;

