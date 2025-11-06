import { Order } from "../types";

export const currencyPair = (data: { symbol: string; }[]) => data?.map((item: { symbol: string }) => ({
    label: item.symbol,
    value: item.symbol,
}));

export const debounce = (func: (...args: ({ label: string, value: string })[]) => void, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: ({ label: string, value: string })[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    };
};

const descendingComparator = <T>(a: T, b: T, orderBy: keyof T) => {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

export const getComparator = <Key extends keyof never>(
    order: Order,
    orderBy: Key,
) => (
    a: { [key in Key]: number | string | boolean },
    b: { [key in Key]: number | string | boolean },
): number =>
        order === 'desc'
            ? descendingComparator(a, b, orderBy)
            : -descendingComparator(a, b, orderBy);


export const stableSort = <T>(array: T[], comparator: (a: T, b: T) => number) => {
    const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) {
            return order;
        }
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

export const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
}


export const parseToNumber = (numberString: string, fixed: number = 2): number => {
    return parseFloat(parseFloat(numberString).toFixed(fixed));
};

export const formatNumber = (number: number): string => {
    return number.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

export const parseAndFormatNumber = (numberString: string, fixed: number = 2): string => {
    const parsedNumber = parseToNumber(numberString, fixed);
    return formatNumber(parsedNumber);
};

export const ensureArray = (data: Array<unknown>) => {
    return Array.isArray(data) ? data : [];
}

// Fonction pour extraire la valeur d'une alerte selon la clé
export const getTradingAlertValue = (alert: { 
    price?: number; 
    symbol?: string; 
    timestamp?: string; 
    time?: string; 
    alertType?: string;
}, key: string): string | number => {
    if (key === 'price') {
        return alert.price ?? 0;
    } else if (key === 'symbol') {
        return alert.symbol ?? '';
    } else if (key === 'timestamp' || key === 'time') {
        return alert.timestamp || alert.time || '';
    } else if (key === 'alertType') {
        return alert.alertType || '';
    }
    return '';
};

// Fonction générique pour trier les alertes
export const sortAlerts = <T extends Record<string, any>>(
    alerts: T[],
    order: Order,
    orderBy: keyof T | string,
    getValue?: (alert: T, key: string) => string | number
): T[] => {
    return [...alerts].sort((a, b) => {
        let aValue: string | number = '';
        let bValue: string | number = '';
        
        if (getValue) {
            aValue = getValue(a, orderBy as string);
            bValue = getValue(b, orderBy as string);
        } else {
            const key = orderBy as keyof T;
            aValue = a[key] ?? '';
            bValue = b[key] ?? '';
        }
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return order === 'asc' 
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        }
        
        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return order === 'asc' ? comparison : -comparison;
    });
}