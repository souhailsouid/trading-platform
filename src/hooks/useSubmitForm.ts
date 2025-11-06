import { useState } from 'react';
import { fetchCryptoData } from '../services/api/binance';
import { useData } from './contexts/useData';

export const useSubmitForm = (selectedSymbol: string) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const { setTickerData, setTicker24hData, setTradesData, setKLinesData, setLoading: setContextLoading } = useData()

    const submitForm = async () => {
            if (!selectedSymbol || selectedSymbol.trim() === '') {
                return;
            }
            try {
                setLoading(true);
                setContextLoading(true);
                setError(null);
                const { tickerData, ticker24hData, tradesData, kLinesData } = await fetchCryptoData(selectedSymbol)
                setTickerData(tickerData);
                setTicker24hData(ticker24hData);
                setTradesData(tradesData);
                setKLinesData(kLinesData)
            } catch (error) {
                setError(error as Error);
            } finally {
                setLoading(false);
                setContextLoading(false);
            }
    }

    return { loading, error, submitForm };
};
