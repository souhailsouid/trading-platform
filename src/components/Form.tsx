import React from 'react';
import { useSymbol } from '../hooks/contexts/useSymbol';
import { useFetchCurrencyPair } from '../hooks/useFetchCurrencyPair';
import { useSubmitForm } from '../hooks/useSubmitForm';
import { currencyPair, debounce } from '../utils/Helpers';
import FormComponent from './ui/forms/Form';
import { CircularProgress } from '@mui/material';

const Form: React.FC = () => {

    const { selectedSymbol, setSelectedSymbol } = useSymbol()

    const { data: currencies, isLoading, isError } = useFetchCurrencyPair()

    const options = currencyPair(currencies?.data);

    const handleChange = (newValue: { label: string, value: string } | null) => {
        setSelectedSymbol(newValue || { label: '', value: '' });
    }

    const debouncedHandleChange = debounce(handleChange, 300);

    const { submitForm, loading } = useSubmitForm(selectedSymbol.value)

    const debouncedHandleSubmit = debounce(submitForm, 300);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (selectedSymbol.value) debouncedHandleSubmit()
    }

    if (isLoading) return <CircularProgress />;
    if (isError) return <p>Error loading cryptocurrency data</p>;

    return (
        <FormComponent onSubmit={handleSubmit} options={options} value={selectedSymbol} onChange={debouncedHandleChange} loading={loading} />
    );
}
export default Form;



