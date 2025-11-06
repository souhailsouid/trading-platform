import { Ticker24hDataType, TickerDataType, TradeDataType } from ".";

interface TickerDataContextType {
    tickerData: TickerDataType | undefined,
    ticker24hData: Ticker24hDataType | undefined,
    tradesData: TradeDataType | undefined,
    kLinesData: unknown | undefined,
    loading: boolean,
    setTickerData: (tickerData: TickerDataType | undefined) => void;
    setTicker24hData:  (ticker24hData: Ticker24hDataType | undefined) => void;
    setTradesData: (tradesData: TradeDataType | undefined) => void;
    setKLinesData: (kLines: unknown | undefined) => void;
    setLoading: (loading: boolean) => void;
    
}

export type { TickerDataContextType };
