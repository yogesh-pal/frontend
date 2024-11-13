import { REGEX } from '../../../constants';

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
  },
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

export const columnFields = () => [
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
    field: 'status',
    headerName: 'Status',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
];
