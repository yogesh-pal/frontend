import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { REGEX } from '../../../constants';
import {
  icons
} from '../../../components';

const ViewIcon = icons.View;

const Container = styled(Box)(() => ({
}));

export const STATUS = {
  INTERESTED: 'Interested',
  NOT_INTERESTED: 'Not Interested',
  CALL_BACK_LATER: 'Call Back Later',
  NOT_PICKED: 'Not Picked',
  DISBURSED: 'DISBURSED'
};

export const LEAD_TYPE = {
  GL_WINBACK: 'GL_Winback',
  SWARNIM: 'Swarnim',
  GL_TOPUP: 'GL_TopUp'
};

export const LEAD_TYPE_SHOW_VALUES = {
  [LEAD_TYPE.GL_WINBACK]: 'GL Winback',
  [LEAD_TYPE.SWARNIM]: 'Swarnim',
  [LEAD_TYPE.GL_TOPUP]: 'GL Top Up'
};

export const LEAD_TYPE_VALUES = [
  LEAD_TYPE.GL_WINBACK,
  LEAD_TYPE.SWARNIM,
  LEAD_TYPE.GL_TOPUP
];

export const STATUS_FILTER_VALUES = [
  STATUS.INTERESTED,
  STATUS.NOT_INTERESTED,
  STATUS.CALL_BACK_LATER,
  STATUS.NOT_PICKED,
  STATUS.DISBURSED
];

export const STATUS_SET_VALUES = [
  STATUS.INTERESTED,
  STATUS.NOT_INTERESTED,
  STATUS.CALL_BACK_LATER,
  STATUS.NOT_PICKED,
];

export const leadListingSearchValidation = {
  lead_id: {
    name: 'lead_id',
    validation: {
      isRequired: true,
      requiredMsg: 'Please enter Lead Id',
    }
  },
  customer_name: {
    name: 'customer_name',
    validation: {
      isRequired: true,
      requiredMsg: 'Please enter Customer Name',
      pattern: REGEX.ALPHABETS,
      patternMsg: 'Please enter valid Customer Name',
    }
  },
  customer_mobile_number: {
    name: 'customer_mobile_number',
    validation: {
      isRequired: true,
      requiredMsg: 'Please enter mobile number.',
      pattern: REGEX.MOBILE,
      patternMsg: 'Please enter valid mobile number.',
    }
  }
};

export const togglerGroup = {
  defaultValue: 'lead_id',
  values: [
    {
      name: 'Lead Id',
      value: 'lead_id'
    },
    {
      name: 'Customer Name',
      value: 'customer_name',
    },
    {
      name: 'Mobile No',
      value: 'customer_mobile_number',
    }
  ]
};

export const columnFields = ({
  openUpdateLeadDialog
}) => [
  {
    field: 'id',
    headerName: 'Lead ID',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'fullName',
    headerName: 'Customer Name',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'phoneNumberMasked',
    headerName: 'Mobile No.',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'loanAmount',
    headerName: 'Loan Amount',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'appointmentDate',
    headerName: 'Follow Up Date',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'status',
    headerName: 'Status',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'action',
    headerName: 'Actions',
    width: 100,
    sortable: false,
    align: 'center',
    renderCell: (cellValues) => (
      <Container>
        <ViewIcon
          onClick={() => openUpdateLeadDialog(cellValues)}
        />
      </Container>
    )
  },
];
