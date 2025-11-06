import TablePagination from '@mui/material/TablePagination';
import * as React from 'react';
import { useTable } from '../../../hooks/contexts/useTable';

interface WebhookTablePaginationProps {
    rows: any[];
}

const WebhookTablePagination = ({ rows }: WebhookTablePaginationProps) => {
    const { page, setPage, rowsPerPage, setRowsPerPage } = useTable();

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <TablePagination
            rowsPerPageOptions={[5, 10, 15, 20]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
        />
    );
}

export default WebhookTablePagination;

