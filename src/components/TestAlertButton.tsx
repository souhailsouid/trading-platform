import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import React, { useState } from 'react';
import { tradingAlertsService, TradingAlert } from '../services/api/tradingAlerts';

const TestAlertButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<TradingAlert>>({
    symbol: 'BTCUSDT',
    price: 50000,
    alertType: 'RSI',
    indicators: {
      rsi: 30,
    },
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setError(null);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      await tradingAlertsService.sendTestAlert(formData);
      setSuccess(true);
      setTimeout(() => {
        handleClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi de l\'alerte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card sx={{ margin: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Tester une Alerte
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Envoyer une alerte de test pour vérifier le système de webhook
          </Typography>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handleOpen}
            fullWidth
          >
            Envoyer une Alerte de Test
          </Button>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Envoyer une Alerte de Test</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Symbole"
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
              fullWidth
              required
            />
            <TextField
              label="Prix"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Type d'alerte</InputLabel>
              <Select
                value={formData.alertType || 'RSI'}
                onChange={(e) => {
                  const alertType = e.target.value as 'RSI' | 'MACD';
                  setFormData({
                    ...formData,
                    alertType,
                    indicators: alertType === 'MACD'
                      ? {
                          macd: {
                            macd: 0.5,
                            signal: 0.3,
                            histogram: 0.2,
                          },
                        }
                      : { rsi: 30 },
                  });
                }}
                label="Type d'alerte"
              >
                <MenuItem value="RSI">RSI</MenuItem>
                <MenuItem value="MACD">MACD</MenuItem>
              </Select>
            </FormControl>

            {formData.alertType === 'RSI' && (
              <TextField
                label="RSI"
                type="number"
                value={formData.indicators?.rsi || 30}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    indicators: {
                      ...formData.indicators,
                      rsi: parseFloat(e.target.value) || 30,
                    },
                  })
                }
                fullWidth
                inputProps={{ min: 0, max: 100, step: 0.1 }}
              />
            )}

            {formData.alertType === 'MACD' && (
              <>
                <TextField
                  label="MACD"
                  type="number"
                  value={formData.indicators?.macd?.macd || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      indicators: {
                        ...formData.indicators,
                        macd: {
                          macd: parseFloat(e.target.value) || 0,
                          signal: formData.indicators?.macd?.signal || 0,
                          histogram: formData.indicators?.macd?.histogram || 0,
                        },
                      },
                    })
                  }
                  fullWidth
                  step={0.0001}
                />
                <TextField
                  label="Signal"
                  type="number"
                  value={formData.indicators?.macd?.signal || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      indicators: {
                        ...formData.indicators,
                        macd: {
                          macd: formData.indicators?.macd?.macd || 0,
                          signal: parseFloat(e.target.value) || 0,
                          histogram: formData.indicators?.macd?.histogram || 0,
                        },
                      },
                    })
                  }
                  fullWidth
                  step={0.0001}
                />
                <TextField
                  label="Histogram"
                  type="number"
                  value={formData.indicators?.macd?.histogram || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      indicators: {
                        ...formData.indicators,
                        macd: {
                          macd: formData.indicators?.macd?.macd || 0,
                          signal: formData.indicators?.macd?.signal || 0,
                          histogram: parseFloat(e.target.value) || 0,
                        },
                      },
                    })
                  }
                  fullWidth
                  step={0.0001}
                />
              </>
            )}

            {error && (
              <Alert severity="error">{error}</Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annuler</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            startIcon={<SendIcon />}
          >
            {loading ? 'Envoi...' : 'Envoyer'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Alerte envoyée avec succès !
        </Alert>
      </Snackbar>
    </>
  );
};

export default TestAlertButton;

