import { Box, Grid } from '@mui/material';
import React from 'react';
import UseButton from '../buttons/Button';
import UseAutocomplete from '../inputs/AutoComplete';

interface FormComponentProps {
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    options: { label: string, value: string }[],
    value: { label: string; value: string };
    onChange: (newValue: { label: string; value: string }) => void;
    loading: boolean;
}

const FormComponent: React.FC<FormComponentProps> = ({ onSubmit, options, value, onChange, loading }) => {
    const isDisabled = loading || !value.value || value.value.trim() === '';
    
    return (
        <Box component="form" onSubmit={onSubmit} sx={{ mt: 2, mb: 4, ml: 2 }} data-testid="form-component-display">
            <Grid container spacing={2} flexDirection="column" alignItems="center">
                <UseAutocomplete options={options} value={value} onchange={onChange} />
                <UseButton text='Load data' type="submit" disabled={isDisabled} loading={loading} />
            </Grid>
        </Box>
    );
};

export default FormComponent;
