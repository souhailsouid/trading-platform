import React from 'react';
import useBinanceWebSocket from '../../../hooks/useBinanceWebSocket';
import { HeaderContainer } from '../../../styles/StyledHeaders';
import { Ticker24hDataType } from '../../../types';

import MarketInfoGrid from '../grids/MarketInfoGrid';
import ResponsiveGridItem from '../grids/ResponsiveGridItem';
import { CircularProgress } from '@mui/material';

type HeaderProps = {
    data: Ticker24hDataType;
    price: string;
    currencyPair: string;
};

const MarketInfo = ({ data, currencyPair }: HeaderProps) => {
    const { currentMessage } = useBinanceWebSocket(data.symbol);
    if (!currentMessage?.data) {
        return <CircularProgress />
    }
    return (
        <HeaderContainer container data-testid="marketInfo-component-display">
            <ResponsiveGridItem dataTestId="currency-pair-display" text={currencyPair} xsSize={12} smSize={2} />
            <ResponsiveGridItem dataTestId="current-price-display"  text={currentMessage.data.a} xsSize={12} smSize={2} />
            <MarketInfoGrid data={
                [
                    { title: "24h Change", value: `${data.priceChange} ${data.priceChangePercent}%` },
                    { title: "24h High", value: data.highPrice },
                    { title: "24h Low", value: data.lowPrice },
                    { title: "24h Volume", value: data.volume }
                ]
            } />
        </HeaderContainer>
    );
};

export default MarketInfo;
