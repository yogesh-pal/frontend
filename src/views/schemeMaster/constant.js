import { FormControlLabel, CircularProgress } from '@mui/material';
import { icons } from '../../components';
import { IOSSwitch } from '../../components/styledComponents';

const EditIcon = icons.Edit;
const ViewIcon = icons.View;

export const unclaimedColumnFields = (isLoading, editFunction, editHandler) => [
  {
    field: 'Scheme_Name',
    headerName: 'Scheme Name',
    minWidth: 100,
    flex: 1,
    sortable: false,
  },
  {
    field: 'Scheme_Code',
    headerName: 'Scheme Code',
    minWidth: 100,
    flex: 1,
    sortable: false,
  },
  {
    field: 'Scheme_Type',
    headerName: 'Scheme Type',
    minWidth: 100,
    flex: 1,
    sortable: false,
  },
  {
    field: 'Scheme_RPG_LTV',
    headerName: 'Scheme RPG LTV',
    minWidth: 100,
    flex: 1,
    sortable: false,
  },
  {
    field: 'status',
    headerName: 'Scheme Status',
    minWidth: 100,
    flex: 1,
    sortable: false,
    renderCell: (cellValues) => (isLoading.loader && cellValues.id === isLoading.id ? <CircularProgress color='secondary' /> : (
      <FormControlLabel
        control={<IOSSwitch sx={{ m: 1 }} disabled={isLoading?.loader} checked={cellValues.row.status === 'ACTIVE'} onClick={() => editHandler(cellValues)} />}
      />
    ))
  },
  {
    field: 'action',
    headerName: 'Actions',
    width: 120,
    align: 'center',
    sortable: false,
    renderCell: (cellValues) => (
      <EditIcon
        variant='contained'
        color='primary'
        onClick={() => editFunction(cellValues)}
      />
    )
  },
];

export const getRepaymentFrequency = (value) => {
  switch (value) {
    case '1':
      return 30;
    case '2':
      return 60;
    case '3':
      return 90;
    case '6':
      return 180;
    case '12':
      return 360;
    default:
      return 365;
  }
};

export const errorMessageHandler = (message) => {
  try {
    let msg = '';
    if (typeof (message) === 'object') {
      Object.keys(message).forEach((item) => {
        msg += message[item][0];
      });
    }
    return msg;
  } catch (e) {
    console.log('Error', e);
  }
};

export const reserveAmountEnum = {
  900: 0,
  901: 500,
  902: 1000,
  903: 2000
};

export const rebateSlabTableColumns = [
  {
    field: 'from',
    headerName: 'Start Days',
    minWidth: 100,
    flex: 1,
    sortable: false,
  },
  {
    field: 'to',
    headerName: 'End Days',
    minWidth: 100,
    flex: 1,
    sortable: false,
  },
  {
    field: 'interest',
    headerName: 'Rebate',
    minWidth: 100,
    flex: 1,
    sortable: false,
  }
];

export const foreClosureChargesTableColumns = [
  {
    field: 'slab',
    headerName: 'Bucket',
    minWidth: 100,
    flex: 1,
    sortable: false,
  },
  {
    field: 'interest',
    headerName: '% Charge',
    minWidth: 100,
    flex: 1,
    sortable: false,
  },
];

export const schemeMasterBranchUserColumnFields = (schemeDetailsModalHandler) => [
  {
    field: 'Scheme_Name',
    headerName: 'Scheme Name',
    minWidth: 100,
    flex: 1,
    sortable: false,
  },
  {
    field: 'Scheme_Code',
    headerName: 'Scheme Code',
    minWidth: 100,
    flex: 1,
    sortable: false,
  },
  {
    field: 'Scheme_Type',
    headerName: 'Scheme Type',
    minWidth: 100,
    flex: 1,
    sortable: false,
  },
  {
    field: 'Scheme_RPG_LTV',
    headerName: 'Scheme RPG LTV',
    minWidth: 100,
    flex: 1,
    sortable: false,
  },
  {
    field: 'action',
    headerName: 'Actions',
    width: 120,
    align: 'center',
    sortable: false,
    renderCell: (params) => (
      <ViewIcon
        variant='contained'
        color='primary'
        onClick={() => schemeDetailsModalHandler(params.row.fullData.scheme)}
      />
    )
  },
];

export const repaymentFrequencyToLabelMapper = {
  1: 'Monthly',
  2: 'Bi-Monthly',
  3: 'Quarterly',
  6: 'Half Yearly',
  12: 'Yearly'
};
