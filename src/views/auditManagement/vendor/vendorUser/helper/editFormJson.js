import { cloneDeep } from 'lodash';
import {
  IDENTIFIER, REGEX
} from '../../../../../constants';

export const formJsonDetails = ({
  onCancelHandler,
  userDetails
}) => {
  const formConfiguration = {
    form: [
      {
        title: '',
        variant: 'outlined',
        input: [
          {
            name: 'vendor_name',
            label: 'Vendor Name*',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            InputProps: true,
            readOnly: true,
            disabled: true,
            defaultValue: ' '
          },
          {
            name: 'gst_no',
            label: 'GST No.*',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
          },
          {
            name: 'emp_code',
            label: 'User ID*',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
          },
          {
            name: 'salutation',
            label: 'User Salutation*',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
          },
          {
            name: 'emp_name',
            label: 'User Name*',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
          },
          {
            name: 'functional_designation',
            label: 'Designation*',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
          },
          {
            name: 'mobile',
            label: 'Mobile',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            validation: {
              isRequired: true,
              requiredMsg: 'Please enter mobile number.',
              pattern: REGEX.MOBILE,
              patternMsg: 'Please enter valid mobile number.',
              maxLength: 10,
              maxLenMsg: 'Mobile number should not be more than 10 digits.',
            },
          },
          {
            name: 'email',
            label: 'Email',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            validation: {
              isRequired: true,
              requiredMsg: 'Please enter email.',
              pattern: REGEX.EMAIL,
              patternMsg: 'Please enter valid email id.',
              maxLength: 250,
              maxLenMsg: 'Email ID not be greater than 250 characters.',
            },
          },
          {
            name: 'goldloan_status',
            label: 'System Status',
            type: 'select',
            identifier: IDENTIFIER.SELECT,
            multiSelect: false,
            option: ['Active', 'Inactive'],
            validation: {
              isRequired: true,
              requiredMsg: 'Please select system status.'
            },
          },
        ],
        buttonDetails: {
          alignment: 'center',
          name: 'Submit',
          type: 'submit',
          isShowCustomButton: {
            name: 'Cancel',
            customFunction: onCancelHandler
          }
        },
        alignment: {
          xs: 12,
          sm: 12,
          md: 6,
          lg: 6,
          xl: 6
        }
      },
    ],
    dataFomat: 'SINGLE',
  };
  const tempForm = cloneDeep(formConfiguration);
  tempForm.form[0].input.forEach((item, index) => {
    if (item.name === 'goldloan_status') {
      tempForm.form[0].input[index].defaultValue = userDetails[item?.name] ? 'Active' : 'Inactive';
    } else {
      tempForm.form[0].input[index].defaultValue = userDetails[item?.name];
    }
  });
  return tempForm;
};
