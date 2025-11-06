import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Refresh,
  Send,
  NotificationsActive,
  NotificationsOff,
  FilterList,
  Clear,
} from '@mui/icons-material';
import React, { useState } from 'react';
import { useTradingAlerts } from '../hooks/useTradingAlerts';
import { TradingAlert } from '../services/api/tradingAlerts';

const TradingAlerts: React.FC = () => {
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [filterSymbol, setFilterSymbol] = useState<string>('');
  const [filterAlertType, setFilterAlertType] = useState<'RSI' | 'MACD' | ''>('');
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [testAlert, setTestAlert] = useState<Partial<TradingAlert>>({
    symbol: 'BTCUSDT',
    price: 50000,
    alertType: 'RSI',
    indicators: { rsi: 30 },
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { alerts, loading, error, lastUpdate, refetch, sendTestAlert } = useTradingAlerts({
    symbol: filterSymbol || undefined,
    limit: 50,
    alertType: filterAlertType || undefined,
    autoRefresh,
    refreshInterval: 10000,
  });

  const handleSendTestAlert = async () => {
    try {
      await sendTestAlert(testAlert);
      setSnackbar({
        open: true,
        message: 'Alerte de test envoyée avec succès !',
        severity: 'success',
      });
      setShowTestDialog(false);
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Erreur lors de l\'envoi de l\'alerte de test',
        severity: 'error',
      });
    }
  };

  const getAlertTypeColor = (alertType?: string) => {
    switch (alertType) {
      case 'RSI':
        return 'warning';
      case 'MACD':
        return 'info';
      default:
        return 'default';
    }
  };

  const getSignalTypeLabel = (signalType?: string) => {
    if (!signalType) return '';
    const labels: Record<string, string> = {
      bullish_signal_crossover: '📈 Bullish Crossover',
      bearish_signal_crossover: '📉 Bearish Crossover',
      bullish_zero_crossover: '⬆️ Bullish Zero',
      bearish_zero_crossover: '⬇️ Bearish Zero',
      bullish_divergence: '🔺 Bullish Divergence',
      bearish_divergence: '🔻 Bearish Divergence',
    };
    return labels[signalType] || signalType;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const clearFilters = () => {
    setFilterSymbol('');
    setFilterAlertType('');
  };

  return (
    <>
      <Card sx={{ margin: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Alertes TradingView ({alerts.length})
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Tooltip title={autoRefresh ? 'Désactiver le rafraîchissement automatique' : 'Activer le rafraîchissement automatique'}>
                <IconButton
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  color={autoRefresh ? 'primary' : 'default'}
                  size="small"
                >
                  {autoRefresh ? <NotificationsActive /> : <NotificationsOff />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Rafraîchir">
                <IconButton onClick={refetch} disabled={loading} size="small">
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Send />}
                onClick={() => setShowTestDialog(true)}
              >
                Tester
              </Button>
            </Box>
          </Box>

          {lastUpdate && (
            <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: 'block' }}>
              Dernière mise à jour: {formatDate(lastUpdate.toISOString())}
            </Typography>
          )}

          {/* Filtres */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              label="Symbole"
              size="small"
              value={filterSymbol}
              onChange={(e) => setFilterSymbol(e.target.value.toUpperCase())}
              placeholder="BTCUSDT"
              sx={{ minWidth: 150 }}
            />
            <TextField
              select
              label="Type d'alerte"
              size="small"
              value={filterAlertType}
              onChange={(e) => setFilterAlertType(e.target.value as 'RSI' | 'MACD' | '')}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="RSI">RSI</MenuItem>
              <MenuItem value="MACD">MACD</MenuItem>
            </TextField>
            {(filterSymbol || filterAlertType) && (
              <Button
                size="small"
                startIcon={<Clear />}
                onClick={clearFilters}
              >
                Effacer
              </Button>
            )}
          </Box>

          {loading && alerts.length === 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {!loading && alerts.length === 0 && (
            <Typography color="textSecondary" sx={{ textAlign: 'center', p: 3 }}>
              Aucune alerte trouvée
            </Typography>
          )}

          {alerts.length > 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2, maxHeight: '600px', overflowY: 'auto' }}>
              {alerts.map((alert, index) => (
                <Box
                  key={alert.id || `${alert.symbol}-${alert.timestamp}-${index}`}
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    backgroundColor: 'background.paper',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                      <Chip
                        label={alert.symbol}
                        color="primary"
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                      {alert.alertType && (
                        <Chip
                          label={alert.alertType}
                          color={getAlertTypeColor(alert.alertType) as any}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      {alert.signalType && (
                        <Chip
                          label={getSignalTypeLabel(alert.signalType)}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      {formatDate(alert.timestamp)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 3, mt: 1, flexWrap: 'wrap' }}>
                    <Typography variant="body2">
                      <strong>Prix:</strong> ${formatPrice(alert.price)}
                    </Typography>
                    {alert.indicators?.rsi !== undefined && (
                      <Typography variant="body2">
                        <strong>RSI:</strong> {alert.indicators.rsi.toFixed(2)}
                      </Typography>
                    )}
                    {alert.indicators?.macd && (
                      <>
                        <Typography variant="body2">
                          <strong>MACD:</strong> {alert.indicators.macd.macd.toFixed(4)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Signal:</strong> {alert.indicators.macd.signal.toFixed(4)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Histogram:</strong> {alert.indicators.macd.histogram.toFixed(4)}
                        </Typography>
                      </>
                    )}
                    {alert.indicators?.stoch && (
                      <>
                        <Typography variant="body2">
                          <strong>Stoch K:</strong> {alert.indicators.stoch.k.toFixed(2)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Stoch D:</strong> {alert.indicators.stoch.d.toFixed(2)}
                        </Typography>
                      </>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Dialog pour envoyer une alerte de test */}
      <Dialog open={showTestDialog} onClose={() => setShowTestDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Envoyer une alerte de test</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Symbole"
              value={testAlert.symbol}
              onChange={(e) => setTestAlert({ ...testAlert, symbol: e.target.value.toUpperCase() })}
              fullWidth
            />
            <TextField
              label="Prix"
              type="number"
              value={testAlert.price}
              onChange={(e) => setTestAlert({ ...testAlert, price: parseFloat(e.target.value) })}
              fullWidth
            />
            <TextField
              select
              label="Type d'alerte"
              value={testAlert.alertType || ''}
              onChange={(e) => setTestAlert({ ...testAlert, alertType: e.target.value as 'RSI' | 'MACD' })}
              fullWidth
            >
              <MenuItem value="RSI">RSI</MenuItem>
              <MenuItem value="MACD">MACD</MenuItem>
            </TextField>
            {testAlert.alertType === 'RSI' && (
              <TextField
                label="RSI"
                type="number"
                value={testAlert.indicators?.rsi || ''}
                onChange={(e) =>
                  setTestAlert({
                    ...testAlert,
                    indicators: { ...testAlert.indicators, rsi: parseFloat(e.target.value) },
                  })
                }
                fullWidth
              />
            )}
            {testAlert.alertType === 'MACD' && (
              <>
                <TextField
                  label="MACD"
                  type="number"
                  value={testAlert.indicators?.macd?.macd || ''}
                  onChange={(e) =>
                    setTestAlert({
                      ...testAlert,
                      indicators: {
                        ...testAlert.indicators,
                        macd: {
                          macd: parseFloat(e.target.value),
                          signal: testAlert.indicators?.macd?.signal || 0,
                          histogram: testAlert.indicators?.macd?.histogram || 0,
                        },
                      },
                    })
                  }
                  fullWidth
                />
                <TextField
                  label="Signal Type"
                  select
                  value={testAlert.signalType || ''}
                  onChange={(e) => setTestAlert({ ...testAlert, signalType: e.target.value })}
                  fullWidth
                >
                  <MenuItem value="bullish_signal_crossover">Bullish Signal Crossover</MenuItem>
                  <MenuItem value="bearish_signal_crossover">Bearish Signal Crossover</MenuItem>
                  <MenuItem value="bullish_zero_crossover">Bullish Zero Crossover</MenuItem>
                  <MenuItem value="bearish_zero_crossover">Bearish Zero Crossover</MenuItem>
                  <MenuItem value="bullish_divergence">Bullish Divergence</MenuItem>
                  <MenuItem value="bearish_divergence">Bearish Divergence</MenuItem>
                </TextField>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTestDialog(false)}>Annuler</Button>
          <Button onClick={handleSendTestAlert} variant="contained" startIcon={<Send />}>
            Envoyer
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TradingAlerts;
