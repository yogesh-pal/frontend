/* eslint-disable max-len */
import { IDENTIFIER } from '../../../constants';
import { STATUS, STATUS_FILTER_VALUES, STATUS_SET_VALUES } from './constant';

export const assignedLeadJson = (leadDetails, handleLeadUpdate) => ({
  form: [
    {
      title: '',
      variant: 'outlined',
      input: [
        {
          name: 'customer_name',
          label: 'Name',
          type: 'text',
          readOnly: true,
          disabled: true,
          defaultValue: leadDetails && leadDetails?.fullName ? leadDetails?.fullName : '',
          identifier: IDENTIFIER.INPUTTEXT,
          validation: {
            isRequired: true,
            requiredMsg: 'Please enter the name',
          },
          alignment: {
            xs: 12,
            sm: 12,
            md: 6,
            lg: 6,
            xl: 6,
          },
        },
        {
          name: 'mobile_number',
          label: 'Enter Mobile No.',
          type: 'text',
          readOnly: true,
          disabled: true,
          defaultValue: leadDetails && leadDetails?.phoneNumberMasked ? leadDetails?.phoneNumberMasked : '',
          identifier: IDENTIFIER.INPUTTEXT,
          validation: {
            isRequired: true,
            requiredMsg: 'Please enter mobile number',
            // pattern: REGEX.MOBILE,
            // patternMsg: 'Please enter valid mobile number.',
            // maxLength: 10,
            // maxLenMsg: 'Mobile number should not be more than 10 digits.',
          },
          alignment: {
            xs: 12,
            sm: 12,
            md: 6,
            lg: 6,
            xl: 6,
          },
        },
        {
          name: 'loan_amount',
          label: 'Required Loan Amount(in Rs.)',
          type: 'text',
          readOnly: true,
          disabled: true,
          defaultValue: leadDetails && leadDetails?.loanAmount ? leadDetails?.loanAmount.toLocaleString('en-US', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
          }) : '',
          identifier: IDENTIFIER.INPUTTEXT,
          alignment: {
            xs: 12,
            sm: 12,
            md: 6,
            lg: 6,
            xl: 6,
          },
        },
        {
          name: 'city',
          label: 'City',
          type: 'text',
          readOnly: true,
          disabled: true,
          defaultValue: leadDetails && leadDetails?.city ? leadDetails?.city : '',
          identifier: IDENTIFIER.INPUTTEXT,
          validation: {
            isRequired: true,
            requiredMsg: 'Please enter city name',
          },
          alignment: {
            xs: 12,
            sm: 12,
            md: 6,
            lg: 6,
            xl: 6,
          },
        },
        {
          name: 'cuid',
          label: 'Customer Id',
          type: 'text',
          readOnly: true,
          disabled: true,
          defaultValue: leadDetails && leadDetails?.customerId ? leadDetails?.customerId : '',
          identifier: IDENTIFIER.INPUTTEXT,
          alignment: {
            xs: 12,
            sm: 12,
            md: 6,
            lg: 6,
            xl: 6,
          },
        },
        {
          name: 'lan',
          label: 'LAN',
          type: 'text',
          readOnly: true,
          disabled: true,
          defaultValue: leadDetails && leadDetails?.lan ? leadDetails?.lan : '',
          identifier: IDENTIFIER.INPUTTEXT,
          alignment: {
            xs: 12,
            sm: 12,
            md: 6,
            lg: 6,
            xl: 6,
          },
        },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          identifier: IDENTIFIER.SELECT,
          defaultValue: leadDetails && leadDetails?.status && leadDetails?.status !== 'PENDING_CALL_CENTER' ? leadDetails.status : '',
          multiSelect: false,
          disabled: leadDetails && leadDetails?.status === 'DISBURSED',
          option: leadDetails && leadDetails?.status === 'DISBURSED' ? STATUS_FILTER_VALUES : STATUS_SET_VALUES,
          onChange: {
            [STATUS.NOT_INTERESTED]: {
              disable: {
                value: true,
                disableFields: ['reschedule_date',],
              },
              unregisterFields: [
                'reschedule_date'
              ],
              validation: {
                reschedule_date: {
                  validation: {
                    isRequired: false,
                    requiredMsg: 'Please select date.'
                  }
                }
              }
            },
            [STATUS.INTERESTED]: {
              disable: {
                value: false,
                disableFields: ['reschedule_date'],
              },
              validation: {
                reschedule_date: {
                  validation: {
                    isRequired: true,
                    requiredMsg: 'Please select date.'
                  }
                }
              }
            },
            [STATUS.NOT_PICKED]: {
              disable: {
                value: false,
                disableFields: ['reschedule_date'],
              },
              validation: {
                reschedule_date: {
                  validation: {
                    isRequired: true,
                    requiredMsg: 'Please select date.'
                  }
                }
              }
            },
            [STATUS.CALL_BACK_LATER]: {
              disable: {
                value: false,
                disableFields: ['reschedule_date'],
              },
              validation: {
                reschedule_date: {
                  validation: {
                    isRequired: true,
                    requiredMsg: 'Please select date.'
                  }
                }
              }
            },
          },
          validation: {
            isRequired: true,
            requiredMsg: 'Please select status.'
          },
          alignment: {
            xs: 12,
            sm: 12,
            md: 6,
            lg: 6,
            xl: 6,
          },
        },
        {
          name: 'reschedule_date',
          label: 'Reschedule Date',
          type: 'date',
          readonly: true,
          inputMode: 'none',
          disabled: leadDetails && leadDetails?.status === 'DISBURSED',
          identifier: IDENTIFIER.DATEPICKER,
          defaultValue: '',
          validation: {
            isRequired: true,
            requiredMsg: 'Please select date.'
          },
          alignment: {
            xs: 12,
            sm: 12,
            md: 6,
            lg: 6,
            xl: 6,
          },
          isFutureDateDisable: false,
          isPastDateDisable: true,
          format: 'DD-MM-YYYY',
        },
      ],
      dynamicValidation: handleLeadUpdate,
      buttonDetails: {
        alignment: 'center',
        name: 'Update',
        type: 'submit',
        disableButton: leadDetails && leadDetails?.status === 'DISBURSED'
      },
    }
  ]
});
