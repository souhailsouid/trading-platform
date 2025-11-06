import { useEffect, useRef, useState } from 'react';
import { KLinesDataType } from '../types';

type KlineWebSocketData = {
    e: string; // Event type
    E: number; // Event time
    s: string; // Symbol
    k: {
        t: number; // Kline start time
        T: number; // Kline close time
        s: string; // Symbol
        i: string; // Interval
        f: number; // First trade ID
        L: number; // Last trade ID
        o: string; // Open price
        c: string; // Close price
        h: string; // High price
        l: string; // Low price
        v: string; // Volume
        n: number; // Number of trades
        x: boolean; // Is this kline closed?
        q: string; // Quote asset volume
        V: string; // Taker buy base asset volume
        Q: string; // Taker buy quote asset volume
    };
};

interface UseBinanceKlinesWebSocketOutput {
    latestKline: KLinesDataType | null;
    isConnected: boolean;
    error: Error | null;
}

/**
 * Hook pour recevoir les klines (chandeliers) en temps réel via WebSocket Binance
 * @param symbol - Le symbole de trading (ex: BTCUSDT)
 * @param interval - L'intervalle des klines (1m, 5m, 15m, 1h, etc.)
 * @param onNewKline - Callback appelé à chaque nouvelle kline
 */
const useBinanceKlinesWebSocket = (
    symbol: string,
    interval: string = '1m',
    onNewKline?: (kline: KLinesDataType) => void
): UseBinanceKlinesWebSocketOutput => {
    const [latestKline, setLatestKline] = useState<KLinesDataType | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const onNewKlineRef = useRef(onNewKline);

    // Mettre à jour la référence du callback
    useEffect(() => {
        onNewKlineRef.current = onNewKline;
    }, [onNewKline]);

    useEffect(() => {
        if (!symbol) return;

        const stream = `${symbol.toLowerCase()}@kline_${interval}`;
        const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${stream}`);

        wsRef.current = ws;

        ws.onopen = () => {
            console.log(`Connected to Binance Klines WebSocket: ${symbol}@${interval}`);
            setIsConnected(true);
            setError(null);
        };

        ws.onmessage = (event: MessageEvent) => {
            try {
                const data: KlineWebSocketData = JSON.parse(event.data);

                if (data.k && data.k.x) {
                    // Kline fermée - format: [time, open, high, low, close, volume, ...]
                    const kline: KLinesDataType = [
                        data.k.t, // Open time
                        data.k.o, // Open
                        data.k.h, // High
                        data.k.l, // Low
                        data.k.c, // Close
                        data.k.v, // Volume
                        data.k.T, // Close time
                        data.k.q, // Quote asset volume
                        data.k.n, // Number of trades
                        data.k.V, // Taker buy base asset volume
                        data.k.Q, // Taker buy quote asset volume
                        '0', // Ignore
                    ];

                    setLatestKline(kline);

                    // Appeler le callback si fourni
                    if (onNewKlineRef.current) {
                        onNewKlineRef.current(kline);
                    }
                }
            } catch (err) {
                console.error('Error parsing WebSocket message:', err);
                setError(err as Error);
            }
        };

        ws.onerror = (err) => {
            console.error('WebSocket Error:', err);
            setError(new Error('WebSocket connection error'));
            setIsConnected(false);
        };

        ws.onclose = () => {
            console.log(`Disconnected from Binance Klines WebSocket: ${symbol}@${interval}`);
            setIsConnected(false);
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                ws.close();
            }
        };
    }, [symbol, interval]);

    return { latestKline, isConnected, error };
};

export default useBinanceKlinesWebSocket;

