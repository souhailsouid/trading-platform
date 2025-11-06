import {
    BarElement,
    CategoryScale,
    ChartDataset,
    Chart as ChartJS,
    ChartOptions,
    Legend,
    LineElement,
    LinearScale,
    PointElement,
    Title,
    Tooltip
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import React, { useMemo } from 'react';
import { Chart } from 'react-chartjs-2';
import { StyledChartContainer } from '../../../styles/StyledChart';
import { KLinesDataType } from '../../../types';
import { calculateMACD } from '../../../utils/TechnicalIndicators';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    annotationPlugin
);

interface MACDChartProps {
    klinesData: KLinesDataType[];
}

const MACDChart: React.FC<MACDChartProps> = ({ klinesData }) => {
    const { macdData, signalData, histogramData, labels } = useMemo(() => {
        if (!klinesData || klinesData.length === 0) {
            return { macdData: [], signalData: [], histogramData: [], labels: [] };
        }

        // Extraire les prix de clôture
        const closePrices = klinesData.map((kline) => parseFloat(kline[4]));

        // Calculer le MACD
        const { macd, signal, histogram } = calculateMACD(closePrices);

        // Créer les labels (dates)
        const labels = klinesData.map((kline) => new Date(kline[0]).toLocaleDateString());

        return {
            macdData: macd,
            signalData: signal,
            histogramData: histogram,
            labels
        };
    }, [klinesData]);

    const data = {
        labels: labels,
        datasets: [
            {
                type: 'line' as const,
                label: 'MACD',
                data: macdData,
                borderColor: '#00d4ff',
                backgroundColor: 'rgba(0, 212, 255, 0.1)',
                borderWidth: 3,
                tension: 0.1,
                pointRadius: 0,
                pointHoverRadius: 5,
                fill: false,
                yAxisID: 'y',
            },
            {
                type: 'line' as const,
                label: 'Signal',
                data: signalData,
                borderColor: '#ff6b9d',
                backgroundColor: 'rgba(255, 107, 157, 0.1)',
                borderWidth: 3,
                tension: 0.1,
                pointRadius: 0,
                pointHoverRadius: 5,
                fill: false,
                yAxisID: 'y',
            },
            {
                type: 'bar' as const,
                label: 'Histogramme',
                data: histogramData,
                borderColor: histogramData.map((val) =>
                    !isNaN(val) && val >= 0 ? '#00ff88' : '#ff4757'
                ),
                backgroundColor: histogramData.map((val) =>
                    !isNaN(val) && val >= 0 ? 'rgba(0, 255, 136, 0.8)' : 'rgba(255, 71, 87, 0.8)'
                ),
                borderWidth: 1,
                yAxisID: 'y',
            },
        ] as ChartDataset<'line' | 'bar', number[]>[],
    };

    const options: ChartOptions<'line' | 'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    font: {
                        size: 14,
                        weight: 'bold' as const,
                    },
                    padding: 15,
                    usePointStyle: true,
                },
            },
            title: {
                display: true,
                text: 'MACD (Moving Average Convergence Divergence)',
                font: {
                    size: 18,
                    weight: 'bold' as const,
                },
                padding: {
                    top: 10,
                    bottom: 20,
                },
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: {
                    size: 14,
                    weight: 'bold' as const,
                },
                bodyFont: {
                    size: 13,
                },
                padding: 12,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
            },
            annotation: {
                annotations: {
                    zeroLine: {
                        type: 'line',
                        yMin: 0,
                        yMax: 0,
                        borderColor: 'rgba(255, 255, 255, 0.4)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        label: {
                            display: true,
                            content: '0',
                            position: 'end',
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            font: {
                                size: 11,
                                weight: 'bold' as const,
                            },
                        },
                    },
                },
            },
        },
        scales: {
            y: {
                type: 'linear',
                position: 'left',
                beginAtZero: false,
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                    lineWidth: 1,
                },
                ticks: {
                    font: {
                        size: 12,
                    },
                    color: '#ffffff',
                },
            },
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                    lineWidth: 1,
                },
                ticks: {
                    font: {
                        size: 11,
                    },
                    color: '#ffffff',
                    maxRotation: 45,
                    minRotation: 45,
                },
            },
        },
        elements: {
            point: {
                radius: 0,
                hoverRadius: 6,
            },
            line: {
                borderWidth: 3,
            },
        },
    };

    if (!klinesData || klinesData.length === 0) {
        return null;
    }

    return (
        <StyledChartContainer id="macd-chart" height="450px">
            <Chart type="line" options={options} data={data} />
        </StyledChartContainer>
    );
};

export default MACDChart;

