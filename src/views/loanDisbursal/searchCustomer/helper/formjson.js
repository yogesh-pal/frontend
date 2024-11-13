/* eslint-disable no-nested-ternary */
/* eslint-disable max-len */
import { cloneDeep } from 'lodash';
import moment from 'moment';
import {
  IDENTIFIER,
} from '../../../../constants';

export const formJsonDetails = ({ useDetails }) => {
  const CustomerReadOnlyFields = [
    {
      label: 'Customer Details',
      data: [
        {
          name: 'customer_id',
          label: 'Customer ID',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          InputProps: true,
          readOnly: true,
          defaultValue: '',
          disabled: true,
          multiline: true,
        },
        {
          name: 'full_name',
          label: 'Customer Name',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          InputProps: true,
          readOnly: true,
          defaultValue: '',
          disabled: true,
          multiline: true,
        },
        {
          name: 'dob',
          label: 'DOB',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          InputProps: true,
          readOnly: true,
          defaultValue: '',
          disabled: true,
          multiline: true,
        },
        {
          name: 'primary_mobile_number',
          label: 'Mobile',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          InputProps: true,
          readOnly: true,
          defaultValue: '',
          disabled: true,
          multiline: true,
        },
      ]
    },
    {
      label: 'Loan Details',
      data: [
        {
          name: 'total_loan',
          label: 'Total Loan',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          InputProps: true,
          readOnly: true,
          defaultValue: '',
          disabled: true,
        },
        {
          name: 'active_loans',
          label: 'Active Loans',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          InputProps: true,
          readOnly: true,
          defaultValue: '',
          disabled: true,
        },
        {
          name: 'closed_loans',
          label: 'Closed Loans',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          InputProps: true,
          readOnly: true,
          defaultValue: '',
          disabled: true,
        },
        {
          name: 'total_pos',
          label: 'Total Principal Outstanding',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          InputProps: true,
          readOnly: true,
          defaultValue: '',
          disabled: true,
        },
        {
          name: 'total_interest_overdue',
          label: 'Total Interest Due',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          InputProps: true,
          readOnly: true,
          defaultValue: '',
          disabled: true,
        },
        {
          name: 'npa_status',
          label: 'NPA Status',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          InputProps: true,
          readOnly: true,
          defaultValue: '',
          disabled: true,
        },
        {
          name: 'count_of_default_account',
          label: 'Count of accounts in default',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          InputProps: true,
          readOnly: true,
          defaultValue: '',
          disabled: true,
          colorCode: useDetails?.count_of_default_account >= 1 ? '#ffff00' : null
        },
        {
          name: 'count_of_npa_account',
          label: 'Count of accounts in NPA',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          InputProps: true,
          readOnly: true,
          defaultValue: '',
          disabled: true,
        },
        {
          name: 'count_of_auctioned_account',
          label: 'Count of accounts Auctioned',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          InputProps: true,
          readOnly: true,
          defaultValue: '',
          disabled: true,
          colorCode: useDetails?.count_of_auctioned_account >= 1 ? '#ff0000' : null
        },
        {
          name: 'count_of_spurious_account',
          label: 'Count of Spurious accounts',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          InputProps: true,
          readOnly: true,
          defaultValue: '',
          disabled: true,
          colorCode: useDetails?.count_of_spurious_account >= 1 ? '#ffa500' : null
        },
        {
          name: 'lien_status',
          label: 'Lien Status',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          InputProps: true,
          readOnly: true,
          defaultValue: '',
          disabled: true,
        },
        {
          name: 'legal_status',
          label: 'Legal Status',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          InputProps: true,
          readOnly: true,
          defaultValue: '',
          disabled: true,
        },
        {
          name: 'kyc_status',
          label: 'KYC Status',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          InputProps: true,
          readOnly: true,
          defaultValue: '',
          colorCode: useDetails?.kyc_status === 'Re-Kyc Due' ? '#f5716e' : '#9ff28d'
        },
      ]
    },
  ];
  const formConfiguration = {
    form: [
      {
        title: '',
        variant: 'outlined',
        input: {
          readonlyData: CustomerReadOnlyFields,
          identifier: IDENTIFIER.READONLY,
        },
        type: 'readonly',
        alignment: {
          xs: 12,
          sm: 12,
          md: 3,
          lg: 3,
          xl: 3
        }
      },
    ],
  };

  const tempForm = cloneDeep(formConfiguration);

  tempForm.form.forEach((formDetails, formIndex) => {
    formDetails.input.readonlyData.forEach((readOnlyForm, readOnlyIndex) => {
      readOnlyForm.data.forEach((inputValue, inputIndex) => {
        if (inputValue.name === 'dob') {
          tempForm.form[formIndex].input.readonlyData[readOnlyIndex]
            .data[inputIndex].defaultValue = useDetails[inputValue.name] ? moment(useDetails[inputValue.name], 'DD-MM-YYYY').format('DD/MM/YYYY') : ' ';
        } else {
          tempForm.form[formIndex].input.readonlyData[readOnlyIndex]
            .data[inputIndex].defaultValue = useDetails[inputValue.name] ? useDetails[inputValue.name] : (useDetails[inputValue.name] === 0 ? '0' : ' ');
        }
      });
    });
  });

  return tempForm;
};
