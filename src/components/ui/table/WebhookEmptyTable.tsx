/* eslint-disable @typescript-eslint/no-explicit-any */
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import React, { Fragment } from 'react';
import { useTable } from '../../../hooks/contexts/useTable';

interface WebhookEmptyTableProps {
    rows: any[];
}

const WebhookEmptyTable = ({ rows }: WebhookEmptyTableProps) => {
    const { page, rowsPerPage } = useTable();
    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

    return (
        <Fragment>
            {emptyRows > 0 && (
                <TableRow
                    style={{
                        height: 33 * emptyRows,
                    }}
                >
                    <TableCell colSpan={5} />
                </TableRow>
            )}
        </Fragment>
    );
}

export default WebhookEmptyTable;

