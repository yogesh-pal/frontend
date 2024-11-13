/* eslint-disable no-underscore-dangle */
import { Chip, FormControlLabel } from '@mui/material';
import { RadiobuttonStyle } from '../../../../components/styledComponents';

export const columnFields = [
  {
    field: 'select',
    headerName: '',
    sortable: false,
    align: 'center',
    maxWidth: 70,
    renderCell: ({ row }) => (
      <FormControlLabel
        control={<RadiobuttonStyle id={row._id} checked={row?.selected} />}
      />
    )
  },
  {
    field: 'FIRST_NAME',
    headerName: 'First Name',
    minWidth: 100,
    sortable: false,
    flex: 1,
    colSpan: ({ row }) => (row?.FIRST_NAME === 'Create New Customer' ? 7 : 0)
  },
  {
    field: 'LAST_NAME',
    headerName: 'Last Name',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'DOB',
    headerName: 'DOB',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'PAN_NO',
    headerName: 'PAN',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'CITY',
    headerName: 'City',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'UCIC',
    headerName: 'UCIC',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'match',
    headerName: 'Positive/Negative Customer',
    minWidth: 100,
    sortable: false,
    flex: 1,
    renderCell: (cellValues) => (
      cellValues.row.match
        ? <span>{cellValues.row.match === 'POSITIVE' ? <Chip label={cellValues.row.match} color='success' variant='outlined' /> : <Chip label={cellValues.row.match} color='error' variant='outlined' />}</span> : null
    )
  },
];
