import { cloneDeep } from 'lodash';
import {
  IDENTIFIER, REGEX
} from '../../../../../constants';

export const formJsonDetails = ({
  onCancelHandler,
  row
}) => {
  const formConfiguration = {
    form: [
      {
        title: '',
        variant: 'outlined',
        input: [
          {
            name: 'vendor_name',
            label: 'Vendor Name',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            InputProps: true,
            readOnly: true,
            disabled: true,
            defaultValue: ' '
          },
          {
            name: 'gst_no',
            label: 'GST No.',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
          },
          {
            name: 'user_id',
            label: 'User ID',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: '',
            validation: {
              isRequired: true,
              requiredMsg: 'Please enter user id.',
              pattern: REGEX.ALPHANUMERICTRIMSPACE,
              patternMsg: 'Please enter valid user id',
              maxLength: 10,
              maxLenMsg: 'User ID should not be more than 10 characters.',
            },
          },
          {
            name: 'user_salutation',
            label: 'User Salutation',
            type: 'select',
            identifier: IDENTIFIER.SELECT,
            multiSelect: false,
            option: ['Mr', 'Mrs', 'Ms'],
            validation: {
              isRequired: true,
              requiredMsg: 'Please select user salutation.'
            },
          },
          {
            name: 'user_name',
            label: 'User Name ',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: '',
            validation: {
              isRequired: true,
              requiredMsg: 'Please enter user name.',
              pattern: REGEX.SPACESTARTEND,
              patternMsg: 'Please enter valid user name.',
              maxLength: 100,
              maxLenMsg: 'User name should not be more than 100 characters.',
            },
          },
          {
            name: 'mobile',
            label: 'Mobile',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: '',
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
            defaultValue: '',
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
            name: 'status',
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
  tempForm.form[0].input[0].defaultValue = row.vendor_code;
  tempForm.form[0].input[1].defaultValue = row.gst_number;

  return tempForm;
};
