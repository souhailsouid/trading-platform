import { useEffect, useRef, useState } from 'react';
import { useData } from './contexts/useData';
import useBinanceKlinesWebSocket from './useBinanceKlinesWebSocket';
import { KLinesDataType } from '../types';
import { TradingSignal, detectSignals } from '../utils/SignalDetector';

interface UseRealtimeSignalsOutput {
    signals: TradingSignal[];
    isMonitoring: boolean;
    lastSignal: TradingSignal | null;
}

/**
 * Hook pour détecter les signaux de trading en temps réel
 * Utilise les klines WebSocket pour détecter les nouveaux signaux à chaque nouvelle kline
 */
export const useRealtimeSignals = (): UseRealtimeSignalsOutput => {
    const { kLinesData, ticker24hData, setKLinesData } = useData();
    const [signals, setSignals] = useState<TradingSignal[]>([]);
    const [lastSignal, setLastSignal] = useState<TradingSignal | null>(null);
    const klinesBufferRef = useRef<KLinesDataType[]>([]);
    const previousSignalsRef = useRef<string[]>([]);

    // Initialiser le buffer avec les klines existantes
    useEffect(() => {
        if (kLinesData && Array.isArray(kLinesData)) {
            klinesBufferRef.current = kLinesData as KLinesDataType[];
        }
    }, [kLinesData]);

    // Callback appelé à chaque nouvelle kline reçue via WebSocket
    const handleNewKline = (newKline: KLinesDataType) => {
        if (!ticker24hData) return;

        // Ajouter la nouvelle kline au buffer
        const currentKlines = [...klinesBufferRef.current];
        
        // Vérifier si c'est une mise à jour de la dernière kline ou une nouvelle
        const lastKline = currentKlines[currentKlines.length - 1];
        if (lastKline && lastKline[0] === newKline[0]) {
            // Mise à jour de la dernière kline (pas encore fermée)
            currentKlines[currentKlines.length - 1] = newKline;
        } else {
            // Nouvelle kline fermée
            currentKlines.push(newKline);
            
            // Garder seulement les 1000 dernières klines
            if (currentKlines.length > 1000) {
                currentKlines.shift();
            }
        }

        klinesBufferRef.current = currentKlines;
        
        // Mettre à jour le contexte
        setKLinesData(currentKlines);

        // Détecter les nouveaux signaux
        const newSignals = detectSignals(currentKlines, ticker24hData.symbol);
        
        // Filtrer pour ne garder que les nouveaux signaux (pas déjà détectés)
        const newUniqueSignals = newSignals.filter(
            signal => !previousSignalsRef.current.includes(signal.id)
        );

        if (newUniqueSignals.length > 0) {
            // Ajouter les nouveaux signaux
            setSignals(prev => [...newUniqueSignals, ...prev].slice(0, 50)); // Garder les 50 derniers
            
            // Mettre à jour le dernier signal
            setLastSignal(newUniqueSignals[0]);
            
            // Stocker les IDs des signaux détectés
            previousSignalsRef.current.push(...newUniqueSignals.map(s => s.id));
            
            // Garder seulement les 100 derniers IDs
            if (previousSignalsRef.current.length > 100) {
                previousSignalsRef.current = previousSignalsRef.current.slice(-100);
            }

            // Notifications (optionnel)
            if ('Notification' in window && Notification.permission === 'granted') {
                newUniqueSignals.forEach(signal => {
                    new Notification(`${signal.type} - ${signal.source}`, {
                        body: signal.message,
                        icon: '/favicon.ico',
                    });
                });
            }
        }
    };

    // WebSocket pour les klines en temps réel
    const { isConnected } = useBinanceKlinesWebSocket(
        ticker24hData?.symbol || '',
        '1m',
        handleNewKline
    );

    // Demander la permission pour les notifications
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    return {
        signals,
        isMonitoring: isConnected,
        lastSignal,
    };
};

