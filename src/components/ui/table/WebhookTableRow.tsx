import styled from '@emotion/styled';
import Chip from '@mui/material/Chip';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import React from 'react';
import { TradingAlert } from '../../../services/api/tradingAlerts';
import { formatTimestamp } from '../../../utils/Helpers';

const StyledTableCell = styled(TableCell)`
  padding: 8px;
  text-align: center;
  font-size: 0.875rem;
`;

const StyledTableRow = styled(TableRow)`
  &:hover {
    background-color: #efefef;
  }
`;

interface WebhookTableRowProps {
    row: TradingAlert;
}

const WebhookTableRow: React.FC<WebhookTableRowProps> = ({ row }) => {
    const formatIndicators = () => {
        if (!row.indicators) return '-';
        
        const parts: string[] = [];
        if (row.indicators.rsi !== undefined) {
            parts.push(`RSI: ${row.indicators.rsi.toFixed(2)}`);
        }
        if (row.indicators.macd) {
            parts.push(`MACD: ${row.indicators.macd.macd.toFixed(4)}`);
        }
        if (row.indicators.stoch) {
            parts.push(`Stoch: ${row.indicators.stoch.k.toFixed(2)}`);
        }
        
        return parts.length > 0 ? parts.join(', ') : '-';
    };

    return (
        <StyledTableRow key={row.id || row.timestamp}>
            <StyledTableCell component="th" scope="row">{row.symbol}</StyledTableCell>
            <StyledTableCell align="right">
                ${row.price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </StyledTableCell>
            <StyledTableCell align="center">
                {row.alertType ? (
                    <Chip
                        label={row.alertType}
                        color={row.alertType === 'RSI' ? 'primary' : 'secondary'}
                        size="small"
                    />
                ) : (
                    '-'
                )}
            </StyledTableCell>
            <StyledTableCell align="left" sx={{ fontSize: '0.75rem' }}>
                {formatIndicators()}
            </StyledTableCell>
            <StyledTableCell align="right">
                {(() => {
                    try {
                        const dateStr = row.time || row.timestamp;
                        if (typeof dateStr === 'string') {
                            return new Date(dateStr).toLocaleString('fr-FR');
                        }
                        return formatTimestamp(dateStr);
                    } catch {
                        return row.time || row.timestamp || '-';
                    }
                })()}
            </StyledTableCell>
        </StyledTableRow>
    );
};

export default WebhookTableRow;

