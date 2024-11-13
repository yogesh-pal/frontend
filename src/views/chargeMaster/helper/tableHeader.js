/* eslint-disable no-unused-vars */
import { FormControlLabel, CircularProgress, Tooltip } from '@mui/material';
import {
  IOSSwitch,
} from '../../../components/styledComponents';
import {
  icons
} from '../../../components';

const EditIcon = icons.Edit;
export const columnFields = (
  isLoading,
  editChargeDetailsHandler,
  editChargeStatusHandler
) => [
  {
    field: 'name',
    headerName: 'Charge Name',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'type',
    headerName: 'Charge Type',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'state',
    headerName: 'State',
    minWidth: 100,
    sortable: false,
    flex: 1,
    renderCell: (cellValues) => (
      <Tooltip title={cellValues.row.state} placement='left'>
        <span>{cellValues.row.pan_india === 'YES' ? 'ALL' : cellValues.row.state}</span>
      </Tooltip>
    )
  },
  {
    field: 'city',
    headerName: 'City',
    minWidth: 100,
    sortable: false,
    flex: 1,
    renderCell: (cellValues) => (
      <Tooltip title={cellValues.row.city} placement='left'>
        <span>{cellValues.row.pan_india === 'YES' ? 'ALL' : cellValues.row.city}</span>
      </Tooltip>
    )
  },
  {
    field: 'branch_code',
    headerName: 'Branch',
    minWidth: 100,
    sortable: false,
    flex: 1,
    renderCell: (cellValues) => (
      <Tooltip title={cellValues.row.pan_india === 'YES' ? 'ALL' : cellValues.row.branch_code_preview} placement='left'>
        <span>{cellValues.row.pan_india === 'YES' ? 'ALL' : cellValues.row.branch_code_preview}</span>
      </Tooltip>
    )
  },
  {
    field: 'value',
    headerName: 'Charge Value',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 120,
    sortable: false,
    align: 'center',
    renderCell: (cellValues) => (
      isLoading.loader && cellValues.id === isLoading.id ? <CircularProgress color='secondary' /> : (
        <FormControlLabel
          control={<IOSSwitch sx={{ m: 1 }} disabled={isLoading?.loader} checked={cellValues.row.status === 'ACTIVE'} onClick={() => editChargeStatusHandler(cellValues)} />}
        />
      ))
  },
  {
    field: 'action',
    headerName: 'Actions',
    width: 120,
    sortable: false,
    align: 'center',
    renderCell: (cellValues) => (
      <EditIcon onClick={() => editChargeDetailsHandler(cellValues)} />
    )
  }
];
