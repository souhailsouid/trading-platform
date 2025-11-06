import Box from '@mui/material/Box';
import React from 'react';
import { useData } from '../hooks/contexts/useData';
import { FlexChartContainer } from '../styles/StyledChart';
import TradesData from './TradesData';
import TradingSignals from './TradingSignals';
import TradingAlerts from './TradingAlerts';
import TestAlertButton from './TestAlertButton';
import CandlestickChart from './ui/chart/CandlestickChart';
import MACDChart from './ui/chart/MACDChart';
import StochasticChart from './ui/chart/StochasticChart';
import VolumeAnalysisChart from './ui/chart/VolumeAnalysisChart';
import MarketDataDisplaysGrid from './ui/grids/ResponsiveDataDisplay';
import MarketInfo from './ui/headers/MarketInfo';

const Dashboard = () => {
    const { ticker24hData, kLinesData } = useData();
 
    if (!ticker24hData  || !kLinesData) {
        return null
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} data-testid="dashboard-component-display">
             <MarketInfo  data={ticker24hData} currencyPair={ticker24hData.symbol} price={''} />
            <FlexChartContainer>
                <VolumeAnalysisChart klinesData={Array.isArray(kLinesData) ? kLinesData: []} />
                <CandlestickChart data={Array.isArray(kLinesData) ? kLinesData: []} />
            </FlexChartContainer>
            <FlexChartContainer>
                <MACDChart klinesData={Array.isArray(kLinesData) ? kLinesData: []} />
                <StochasticChart klinesData={Array.isArray(kLinesData) ? kLinesData: []} />
            </FlexChartContainer>
            <MarketDataDisplaysGrid data={ticker24hData} />
            <TradingSignals />
            <TestAlertButton />
            <TradingAlerts />
            <TradesData />
        </Box>
    );
}
export default Dashboard;
