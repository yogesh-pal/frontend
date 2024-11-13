import { Tooltip } from '@mui/material';

export const columnFields = [
  {
    field: 'customer_id',
    headerName: 'Customer ID',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'first_name',
    headerName: 'First Name',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'last_name',
    headerName: 'Last Name',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'branch',
    headerName: 'Branch Name',
    maxWidth: 150,
    sortable: false,
    flex: 1,
  },
  {
    field: 'checkerReason',
    headerName: 'Checker Reason',
    minWidth: 100,
    sortable: false,
    flex: 1,
    renderCell: (cellValues) => (
      <Tooltip title={cellValues?.row?.checkerReason} placement='left'>
        <span>{cellValues?.row?.checkerReason}</span>
      </Tooltip>
    )
  },
  {
    field: 'primary_mobile_number',
    headerName: 'Mobile Number',
    maxWidth: 150,
    sortable: false,
    flex: 1,
  },
  {
    field: 'primary_checker_name',
    headerName: 'Assigned To',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
];
