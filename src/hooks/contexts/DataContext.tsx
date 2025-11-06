import React, { ReactNode, createContext, useState } from 'react';
import { Ticker24hDataType, TickerDataContextType, TickerDataType, TradeDataType } from '../../types';

export const DataContext = createContext<TickerDataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tickerData, setTickerData] = useState<TickerDataType | undefined>(undefined)
  const [ticker24hData, setTicker24hData] = useState<Ticker24hDataType | undefined>(undefined);
  const [tradesData, setTradesData] = useState<TradeDataType | undefined>(undefined);
  const [kLinesData, setKLinesData] = useState<unknown | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <DataContext.Provider value={{
      tickerData, setTickerData,
      ticker24hData, setTicker24hData,
      tradesData, setTradesData,
      kLinesData, setKLinesData,
      loading, setLoading
    }}>
      {children}
    </DataContext.Provider>
  );
};

