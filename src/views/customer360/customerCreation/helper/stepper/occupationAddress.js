import {
  IDENTIFIER,
  REGEX,
  FUNCTION_IDENTIFIER
} from '../../../../../constants';

const occupationAddressStep = (props) => {
  const { pincodeVerificationHandler } = props;

  return {
    title: 'Occupation Address',
    variant: 'outlined',
    input: [
      {
        name: 'occupation_address',
        label: 'Occupation Address',
        type: 'radio',
        identifier: IDENTIFIER.RADIO,
        option: ['Yes', 'No'],
        inline: true,
        validation: {
          isRequired: true,
          requiredMsg: 'Please select occupation address.'
        },
      },
      {
        name: 'occupation_address_1',
        label: 'Address 1',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        multiline: true,
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter address 1.',
          pattern: REGEX.SPACESTARTEND,
          patternMsg: 'Please enter valid address 1.',
          maxLength: 512,
          maxLenMsg: 'Address 1 should not be more than 512 characters.'
        },
        condition: {
          type: 'showOnValue',
          baseOn: 'occupation_address',
          baseValue: 'Yes',
        },
      },
      {
        name: 'occupation_address_2',
        label: 'Address 2',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        multiline: true,
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter address 2.',
          pattern: REGEX.SPACESTARTEND,
          patternMsg: 'Please enter valid address 2.',
          maxLength: 512,
          maxLenMsg: 'Address 2 should not be more than 512 characters.'
        },
        condition: {
          type: 'showOnValue',
          baseOn: 'occupation_address',
          baseValue: 'Yes',
        },
      },
      {
        name: 'occupation_pincode',
        label: 'Pincode',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        apiCallValidation: {
          pattern: REGEX.PINCODE,
        },
        functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE_SETTER,
        functionChangeBaseOn: 'occupation_pincode',
        customFunction: (value, callback) => pincodeVerificationHandler(value, callback, ['occupation_pincode']),
        defaultValue: '',
        setValueArr: [
          {
            apiKey: 'city',
            name: 'occupation_city'
          },
          {
            apiKey: 'state',
            name: 'occupation_state'
          },
        ],
        condition: {
          type: 'showOnValue',
          baseOn: 'occupation_address',
          baseValue: 'Yes',
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter pincode',
          pattern: REGEX.PINCODE,
          patternMsg: 'Please enter valid pincode.'
        }
      },
      {
        name: 'occupation_city',
        label: 'City',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        disabled: true,
        defaultValue: '',
        condition: {
          type: 'showOnValue',
          baseOn: 'occupation_address',
          baseValue: 'Yes',
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter city.',
          pattern: /^[A-Za-z\s]{1,50}$/,
          patternMsg: 'Please enter valid city.'
        },
      },
      {
        name: 'occupation_state',
        label: 'State',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        disabled: true,
        defaultValue: '',
        condition: {
          type: 'showOnValue',
          baseOn: 'occupation_address',
          baseValue: 'Yes',
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter state.',
          pattern: /^[A-Za-z\s]{1,50}$/,
          patternMsg: 'Please enter valid state.'
        },
      },
    ],
    buttonDetails: {
      name: 'Next',
    },
    alignment: {
      xs: 12,
      sm: 12,
      md: 6,
      lg: 6,
      xl: 6
    }
  };
};
export {
  occupationAddressStep
};
