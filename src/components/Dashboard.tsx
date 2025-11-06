import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import React from 'react';
import { useData } from '../hooks/contexts/useData';
import { useSymbol } from '../hooks/contexts/useSymbol';
import { FlexChartContainer } from '../styles/StyledChart';
import TradesData from './TradesData';
import CandlestickChart from './ui/chart/CandlestickChart';
import MACDChart from './ui/chart/MACDChart';
import StochasticChart from './ui/chart/StochasticChart';
import VolumeAnalysisChart from './ui/chart/VolumeAnalysisChart';
import MarketDataDisplaysGrid from './ui/grids/ResponsiveDataDisplay';
import MarketInfo from './ui/headers/MarketInfo';

const Dashboard = () => {
    const { ticker24hData, kLinesData, loading } = useData();
    const { selectedSymbol } = useSymbol();
 
    // Afficher le loader seulement si on est en train de charger ET qu'un symbole a été sélectionné
    if (loading && selectedSymbol.value) {
        return (
            <Box 
                sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    minHeight: '400px',
                    width: '100%'
                }} 
                data-testid="dashboard-loading"
            >
                <CircularProgress size={60} />
            </Box>
        );
    }

    // Si pas de données et pas de symbole sélectionné, ne rien afficher
    if (!ticker24hData || !kLinesData) {
        return null;
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
            <TradesData />
        </Box>
    );
}
export default Dashboard;
