import {
  IDENTIFIER,
} from '../../../../../constants';

const relationshipManagerStep = () => ({
  title: 'Relationship Manager',
  variant: 'outlined',
  input: [
    {
      name: 'rm_name',
      label: 'RM Name',
      type: 'text',
      identifier: IDENTIFIER.INPUTTEXT,
      defaultValue: ' ',
      InputProps: true,
      readOnly: true,
      disabled: true,
    },
    {
      name: 'rm_code',
      label: 'RM Employee Code',
      type: 'text',
      identifier: IDENTIFIER.INPUTTEXT,
      defaultValue: ' ',
      InputProps: true,
      readOnly: true,
      disabled: true,
    },
    {
      name: 'rm_mobile_number',
      label: 'RM Mobile Number',
      type: 'text',
      identifier: IDENTIFIER.INPUTTEXT,
      InputProps: true,
      readOnly: true,
      disabled: true,
      defaultValue: ' ',
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

export { relationshipManagerStep };
