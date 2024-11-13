import {
  IDENTIFIER,
} from '../../../../../constants';

const occupationAddressStep = () => ({
  title: 'Occupation Address',
  variant: 'outlined',
  input: [
    {
      name: 'occupation_address',
      label: 'Occupation Address',
      type: 'text',
      identifier: IDENTIFIER.INPUTTEXT,
      defaultValue: ' ',
      InputProps: true,
      readOnly: true,
      disabled: true,
    },
    {
      name: 'occupation_address_1',
      label: 'Address 1',
      type: 'text',
      identifier: IDENTIFIER.INPUTTEXT,
      defaultValue: ' ',
      InputProps: true,
      readOnly: true,
      disabled: true,
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
      defaultValue: ' ',
      InputProps: true,
      readOnly: true,
      disabled: true,
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
      defaultValue: ' ',
      InputProps: true,
      readOnly: true,
      disabled: true,
      condition: {
        type: 'showOnValue',
        baseOn: 'occupation_address',
        baseValue: 'Yes',
      },
    },
    {
      name: 'occupation_city',
      label: 'City',
      type: 'text',
      identifier: IDENTIFIER.INPUTTEXT,
      InputProps: true,
      readOnly: true,
      disabled: true,
      defaultValue: ' ',
      condition: {
        type: 'showOnValue',
        baseOn: 'occupation_address',
        baseValue: 'Yes',
      },
    },
    {
      name: 'occupation_state',
      label: 'State',
      type: 'text',
      identifier: IDENTIFIER.INPUTTEXT,
      InputProps: true,
      readOnly: true,
      disabled: true,
      defaultValue: ' ',
      condition: {
        type: 'showOnValue',
        baseOn: 'occupation_address',
        baseValue: 'Yes',
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
});

export { occupationAddressStep };
