import moment from 'moment';
import { cloneDeep } from 'lodash';
import {
  IDENTIFIER,
} from '../../../../constants';

export const formJsonDetails = ({ useDetails }) => {
  const CustomerReadOnlyFields = [
    {
      label: 'Customer Information',
      data: [
        {
          name: 'customer_id',
          label: 'Customer ID',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          InputProps: true,
          readOnly: true,
          disabled: true,
          defaultValue: ' ',
          multiline: true,
        },
        {
          name: 'customerName',
          label: 'Customer Name',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          InputProps: true,
          readOnly: true,
          disabled: true,
          defaultValue: ' ',
          multiline: true,
        },
        {
          name: 'dob',
          label: 'DOB',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          InputProps: true,
          readOnly: true,
          disabled: true,
          defaultValue: ' ',
          multiline: true,
        },
        {
          name: 'primary_mobile_number',
          label: 'Mobile',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          InputProps: true,
          readOnly: true,
          disabled: true,
          defaultValue: ' ',
          multiline: true,
        },
      ]
    },
    // {
    //   label: 'Loan Details',
    //   data: [
    //     {
    //       name: 'Branch Code',
    //       label: 'Branch Code',
    //       type: 'text',
    //       identifier: IDENTIFIER.INPUTTEXT,
    //       InputProps: true,
    //       readOnly: true,
    //       defaultValue: 'test',
    //     },
    //   ]
    // },
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
          md: 4,
          lg: 4,
          xl: 4
        }
      },
    ],
  };

  const tempForm = cloneDeep(formConfiguration);

  tempForm.form.forEach((formDetails, formIndex) => {
    formDetails.input.readonlyData.forEach((readOnlyForm, readOnlyIndex) => {
      readOnlyForm.data.forEach((inputValue, inputIndex) => {
        if (['dob'].includes(inputValue.name)) {
          tempForm.form[formIndex].input.readonlyData[readOnlyIndex]
            .data[inputIndex].defaultValue = moment(useDetails[inputValue.name], 'DD-MM-YYYY').format('DD/MM/YYYY');
        } else if (inputValue.name === 'customerName') {
          tempForm.form[formIndex].input.readonlyData[readOnlyIndex]
            .data[inputIndex].defaultValue = `${useDetails?.first_name} ${useDetails?.middle_name} ${useDetails?.last_name}`;
        } else {
          tempForm.form[formIndex].input.readonlyData[readOnlyIndex]
            .data[inputIndex].defaultValue = useDetails[inputValue.name] ?? ' ';
        }
      });
    });
  });

  return tempForm;
};

export const repaymentFrequencyEnum = {
  1: 'Monthly',
  2: 'Bi-Monthly',
  3: 'Quarterly',
  6: 'Half Yearly',
  12: 'Yearly'
};
