import {
  IDENTIFIER,
  REGEX
} from '../../../../constants';

export const formLoan = (customerId, ucic) => ({
  form: [
    {
      title: '',
      variant: 'outlined',
      input: [
        {
          name: 'customerId',
          label: 'Customer ID',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          InputProps: true,
          readOnly: true,
          defaultValue: customerId ?? '',
        },
        {
          name: 'ucic',
          label: 'UCIC',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          InputProps: true,
          readOnly: true,
          defaultValue: ucic ?? '',
        },
        {
          name: 'loanAmount',
          label: 'Required Loan Amount',
          type: 'text',
          isAmount: true,
          identifier: IDENTIFIER.INPUTTEXT,
          validation: {
            isRequired: true,
            requiredMsg: 'Please enter loan amount.',
            pattern: REGEX.AMOUNT,
            patternMsg: 'Please enter valid loan amount.',
          },
        },
      ],
      buttonDetails: {
        name: 'Apply Now',
        type: 'submit',
        alignment: 'center',
      },
      alignment: {
        xs: 12,
        sm: 12,
        md: 12,
        lg: 12,
        xl: 12
      }
    },
  ],
});
