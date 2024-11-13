import { IDENTIFIER } from '../../../../constants';

export const remarkJson = (onCancelHandler) => ({
  form: [
    {
      title: '',
      variant: 'outlined',
      input: [
        {
          name: 'remarks',
          label: 'Remarks',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          validation: {
            isRequired: true,
            requiredMsg: 'Please enter the remarks',
            maxLength: 300,
            maxLenMsg: 'Remarks should not be more than 300 characters.',
          },
          alignment: {
            xs: 12,
            sm: 12,
            md: 12,
            lg: 12,
            xl: 12,
          },
        },
      ],
      buttonDetails: {
        alignment: 'center',
        name: 'Yes',
        type: 'submit',
        isShowCustomButton: {
          name: 'No',
          customFunction: onCancelHandler
        }
      },
    }
  ]
});
