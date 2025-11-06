import Box from '@mui/material/Box';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import { visuallyHidden } from '@mui/utils';
import * as React from 'react';
import { Order } from '../../../types';
import { TradingAlert } from '../../../services/api/tradingAlerts';

interface HeadCell {
    disablePadding: boolean;
    id: keyof TradingAlert | 'indicators';
    label: string;
    numeric: boolean;
}

const headCells: readonly HeadCell[] = [
    {
        id: 'symbol',
        numeric: false,
        disablePadding: true,
        label: 'Symbol',
    },
    {
        id: 'price',
        numeric: true,
        disablePadding: false,
        label: 'Price',
    },
    {
        id: 'alertType',
        numeric: false,
        disablePadding: false,
        label: 'Type',
    },
    {
        id: 'indicators',
        numeric: false,
        disablePadding: false,
        label: 'Indicators',
    },
    {
        id: 'time',
        numeric: false,
        disablePadding: true,
        label: 'Time',
    },
];

interface WebhookTableHeadProps {
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof TradingAlert | 'indicators') => void;
    order: Order;
    orderBy: string;
}

const WebhookTableHead = (props: WebhookTableHeadProps) => {
    const { order, orderBy, onRequestSort } = props;
    const createSortHandler =
        (property: keyof TradingAlert | 'indicators') => (event: React.MouseEvent<unknown>) => {
            onRequestSort(event, property);
        };

    return (
        <TableHead>
            <TableRow>
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align="center"
                        padding={headCell.disablePadding ? 'none' : 'normal'}
                        sortDirection={orderBy === headCell.id ? order : false}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={createSortHandler(headCell.id)}
                        >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                                <Box component="span" sx={visuallyHidden}>
                                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                </Box>
                            ) : null}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

export default WebhookTableHead;

