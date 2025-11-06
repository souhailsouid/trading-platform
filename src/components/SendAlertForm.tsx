import { Box, Grid, TextField, MenuItem, Alert, Snackbar } from '@mui/material';
import React, { useState } from 'react';
import { useSymbol } from '../hooks/contexts/useSymbol';
import { useSendAlert } from '../hooks/useSendAlert';
import UseButton from './ui/buttons/Button';

const SendAlertForm: React.FC = () => {
  const { selectedSymbol } = useSymbol();
  const { mutate, isPending, isSuccess, isError, error: mutationError } = useSendAlert();
  
  const [symbol, setSymbol] = useState(selectedSymbol.value || 'TAOUSDT');
  const [price, setPrice] = useState<string>('50000');
  const [alertType, setAlertType] = useState<'RSI' | 'MACD'>('RSI');
  const [rsi, setRsi] = useState<string>('32');
  const [macd, setMacd] = useState<string>('0.5');
  const [signal, setSignal] = useState<string>('0.3');
  const [histogram, setHistogram] = useState<string>('0.2');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  React.useEffect(() => {
    if (selectedSymbol.value) {
      setSymbol(selectedSymbol.value);
    }
  }, [selectedSymbol]);

  React.useEffect(() => {
    if (isSuccess || isError) {
      setSnackbarOpen(true);
    }
    
    // Réinitialiser le formulaire après succès
    if (isSuccess) {
      setSymbol(selectedSymbol.value || 'TAOUSDT');
      setPrice('50000');
      setRsi('32');
      setMacd('0.5');
      setSignal('0.3');
      setHistogram('0.2');
    }
  }, [isSuccess, isError, selectedSymbol]);

  // Fonction utilitaire pour parser un nombre avec valeur par défaut
  const parseNumber = (value: string, defaultValue: number): number => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation des inputs
    if (!symbol || symbol.trim() === '') {
      setSnackbarOpen(true);
      return;
    }
    
    const priceValue = parseNumber(price, 0);
    if (priceValue <= 0) {
      setSnackbarOpen(true);
      return;
    }
    
    const indicators = alertType === 'RSI' 
      ? { rsi: parseNumber(rsi, 30) }
      : {
          macd: {
            macd: parseNumber(macd, 0.5),
            signal: parseNumber(signal, 0.3),
            histogram: parseNumber(histogram, 0.2),
          }
        };

    mutate({
      symbol,
      price: priceValue,
      alertType,
      indicators,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ p: 2, maxWidth: 600, mx: 'auto', mb: 4 }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, mb: 4 }} data-testid="send-alert-form">
        <Grid container spacing={2} flexDirection="column" alignItems="center">
          <Grid item xs={12} sx={{ width: '100%' }}>
            <TextField
              fullWidth
              label="Symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              required
              placeholder="TAOUSDT"
            />
          </Grid>

          <Grid item xs={12} sx={{ width: '100%' }}>
            <TextField
              fullWidth
              label="Price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              inputProps={{ step: '0.01' }}
            />
          </Grid>

          <Grid item xs={12} sx={{ width: '100%' }}>
            <TextField
              fullWidth
              select
              label="Alert Type"
              value={alertType}
              onChange={(e) => setAlertType(e.target.value as 'RSI' | 'MACD')}
              required
            >
              <MenuItem value="RSI">RSI</MenuItem>
              <MenuItem value="MACD">MACD</MenuItem>
            </TextField>
          </Grid>

          {alertType === 'RSI' ? (
            <Grid item xs={12} sx={{ width: '100%' }}>
              <TextField
                fullWidth
                label="RSI Value"
                type="number"
                value={rsi}
                onChange={(e) => setRsi(e.target.value)}
                required
                inputProps={{ step: '0.1', min: '0', max: '100' }}
              />
            </Grid>
          ) : (
            <>
              <Grid item xs={12} sx={{ width: '100%' }}>
                <TextField
                  fullWidth
                  label="MACD"
                  type="number"
                  value={macd}
                  onChange={(e) => setMacd(e.target.value)}
                  required
                  inputProps={{ step: '0.001' }}
                />
              </Grid>
              <Grid item xs={12} sx={{ width: '100%' }}>
                <TextField
                  fullWidth
                  label="Signal"
                  type="number"
                  value={signal}
                  onChange={(e) => setSignal(e.target.value)}
                  required
                  inputProps={{ step: '0.001' }}
                />
              </Grid>
              <Grid item xs={12} sx={{ width: '100%' }}>
                <TextField
                  fullWidth
                  label="Histogram"
                  type="number"
                  value={histogram}
                  onChange={(e) => setHistogram(e.target.value)}
                  required
                  inputProps={{ step: '0.001' }}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <UseButton 
              text="Send Alert" 
              type="submit" 
              disabled={isPending || !symbol || !price} 
              loading={isPending} 
            />
          </Grid>
        </Grid>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={isSuccess ? 'success' : 'error'}
          sx={{ width: '100%' }}
        >
          {isSuccess 
            ? 'Alerte envoyée avec succès !' 
            : `Erreur: ${mutationError instanceof Error ? mutationError.message : 'Erreur lors de l\'envoi'}`}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SendAlertForm;

