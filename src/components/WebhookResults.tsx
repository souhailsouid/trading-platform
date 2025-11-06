import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableContainer,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import { tradingAlertsService, TradingAlert } from '../services/api/tradingAlerts';
import { useTable } from '../hooks/contexts/useTable';
import { Order } from '../types';
import { sortAlerts, getTradingAlertValue } from '../utils/Helpers';
import { StyledCard } from '../styles/StyledCards';
import WebhookTableHead from './ui/table/WebhookTableHead';
import WebhookTableRow from './ui/table/WebhookTableRow';
import WebhookEmptyTable from './ui/table/WebhookEmptyTable';
import WebhookTablePagination from './ui/table/WebhookTablePagination';

const WebhookResults: React.FC = () => {
  const [order, setOrder] = React.useState<Order>('desc');
  const [orderBy, setOrderBy] = React.useState<keyof TradingAlert | 'indicators'>('timestamp');
  const { rowsPerPage, page } = useTable();

  const { data: alerts = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ['webhookAlerts'],
    queryFn: () => tradingAlertsService.getAllAlerts(),
    refetchInterval: 10000, // Rafraîchir toutes les 10 secondes
    staleTime: 5000, // Considérer les données comme "fraîches" pendant 5 secondes
  });

  const error = queryError instanceof Error ? queryError.message : null;

  const handleRequestSort = (
    _event: React.MouseEvent<unknown>,
    property: keyof TradingAlert | 'indicators',
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const visibleRows = useMemo(
    () => {
      const sorted = sortAlerts(alerts, order, orderBy, getTradingAlertValue);
      
      return sorted.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage,
      );
    },
    [order, orderBy, page, alerts, rowsPerPage],
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, maxWidth: 1400, mx: 'auto' }} data-testid="webhook-results-display">
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Résultats du Webhook
      </Typography>

      {alerts.length === 0 ? (
        <Alert severity="info">Aucune alerte trouvée</Alert>
      ) : (
        <Box>
          <StyledCard>
            <TableContainer>
              <Table
                aria-labelledby="webhookTableTitle"
                size="small"
              >
                <WebhookTableHead
                  order={order}
                  orderBy={orderBy}
                  onRequestSort={handleRequestSort}
                />
                <TableBody>
                  {visibleRows.map((row, index) => (
                    <WebhookTableRow row={row} key={row.id || row.timestamp || index} />
                  ))}
                  <WebhookEmptyTable rows={alerts} />
                </TableBody>
              </Table>
              <WebhookTablePagination rows={alerts} />
            </TableContainer>
          </StyledCard>
        </Box>
      )}
    </Box>
  );
};

export default WebhookResults;

