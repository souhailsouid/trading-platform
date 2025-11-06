import {
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
import { Line } from 'react-chartjs-2';
import { StyledChartContainer } from '../../../styles/StyledChart';
import { KLinesDataType } from '../../../types';
import { calculateStochastic } from '../../../utils/TechnicalIndicators';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    annotationPlugin
);

interface StochasticChartProps {
    klinesData: KLinesDataType[];
    kPeriod?: number;
    dPeriod?: number;
}

const StochasticChart: React.FC<StochasticChartProps> = ({
    klinesData,
    kPeriod = 14,
    dPeriod = 3
}) => {
    const { kData, dData, labels } = useMemo(() => {
        if (!klinesData || klinesData.length === 0) {
            return { kData: [], dData: [], labels: [] };
        }

        // Extraire les prix High, Low et Close
        const highPrices = klinesData.map((kline) => parseFloat(kline[2]));
        const lowPrices = klinesData.map((kline) => parseFloat(kline[3]));
        const closePrices = klinesData.map((kline) => parseFloat(kline[4]));

        // Calculer le Stochastic
        const { k, d } = calculateStochastic(highPrices, lowPrices, closePrices, kPeriod, dPeriod);

        // Créer les labels (dates)
        const labels = klinesData.map((kline) => new Date(kline[0]).toLocaleDateString());

        return {
            kData: k,
            dData: d,
            labels
        };
    }, [klinesData, kPeriod, dPeriod]);

    const data = {
        labels: labels,
        datasets: [
            {
                label: `%K (${kPeriod})`,
                data: kData,
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
                label: `%D (${dPeriod})`,
                data: dData,
                borderColor: '#ffa726',
                backgroundColor: 'rgba(255, 167, 38, 0.1)',
                borderWidth: 3,
                tension: 0.1,
                pointRadius: 0,
                pointHoverRadius: 5,
                fill: false,
                yAxisID: 'y',
            },
        ] as ChartDataset<'line', number[]>[],
    };

    const options: ChartOptions<'line'> = {
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
                text: 'Stochastic Oscillator',
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
                    line80: {
                        type: 'line',
                        yMin: 80,
                        yMax: 80,
                        borderColor: 'rgba(255, 0, 0, 0.7)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        label: {
                            display: true,
                            content: 'Surachat (80)',
                            position: 'end',
                            backgroundColor: 'rgba(255, 0, 0, 0.5)',
                            font: {
                                size: 12,
                                weight: 'bold' as const,
                            },
                            color: '#ffffff',
                        },
                    },
                    line20: {
                        type: 'line',
                        yMin: 20,
                        yMax: 20,
                        borderColor: 'rgba(0, 255, 0, 0.7)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        label: {
                            display: true,
                            content: 'Survente (20)',
                            position: 'end',
                            backgroundColor: 'rgba(0, 255, 0, 0.5)',
                            font: {
                                size: 12,
                                weight: 'bold' as const,
                            },
                            color: '#ffffff',
                        },
                    },
                },
            },
        },
        scales: {
            y: {
                type: 'linear',
                position: 'left',
                min: 0,
                max: 100,
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                    lineWidth: 1,
                },
                ticks: {
                    stepSize: 20,
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
        <StyledChartContainer id="stochastic-chart" height="450px">
            <Line options={options} data={data} />
        </StyledChartContainer>
    );
};

export default StochasticChart;

