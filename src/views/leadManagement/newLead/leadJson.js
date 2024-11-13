/* eslint-disable max-len */
import { FUNCTION_IDENTIFIER, IDENTIFIER, REGEX } from '../../../constants';

export const productConfigurationJson = (productTypeHandler, isDisable) => ({
  form: [
    {
      title: '',
      variant: 'outlined',
      input: [
        {
          name: 'product_type',
          label: 'Product Type',
          type: 'text',
          identifier: IDENTIFIER.SELECT,
          customFunction: productTypeHandler,
          functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE,
          functionChangeBaseOn: 'product_type',
          disabled: isDisable,
          option: [
            { label: 'HOME LOAN', value: 'HOME_LOAN' },
            { label: 'MSME LOAN', value: 'MSME_LOAN' },
            { label: 'GOLD LOAN', value: 'GOLD_LOAN' },
          ],
          validation: {
            isRequired: true,
            requiredMsg: 'Please select product type',
          }
        },
      ],
      alignment: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 3,
        xl: 3
      },
      // buttonDetails: {
      //   name: 'Submit',
      //   type: 'submit',
      // },
    }
  ],
  dataFomat: 'SINGLE'
});
export const verifyMobileJson = (proceedSendOtpHandler, isLoading) => ({
  form: [
    {
      title: '',
      variant: 'outlined',
      input: [
        {
          name: 'verify_mobile',
          label: 'Verify Mobile',
          identifier: IDENTIFIER.HEADER,
          alignment: {
            xs: 12,
            sm: 12,
            md: 12,
            lg: 12,
            xl: 12
          },
          style: {
            backgroundColor: '#fff'
          },
        },
        {
          name: 'enter_mobile',
          label: 'Enter Mobile No.',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          validation: {
            isRequired: true,
            requiredMsg: 'Please enter mobile number',
            pattern: REGEX.MOBILE,
            patternMsg: 'Please enter valid mobile number.',
            maxLength: 10,
            maxLenMsg: 'Mobile number should not be more than 10 digits.',
          }
        },
        {
          alignment: {
            xs: 6,
            sm: 6,
            md: 6,
            lg: 6,
            xl: 6
          },
          name: 'send_otp',
          label: 'Send OTP',
          identifier: IDENTIFIER.BUTTON,
          disabled: isLoading,
          clickHanlder: proceedSendOtpHandler,
          style: {
            width: '150px',
            height: '50px',
            right: 0,
            boxShadow: 'none',
            borderRadius: '8px',
            padding: 0
          },
        }
      ],
      // buttonDetails: {
      //   name: 'Submit',
      //   type: 'submit',
      // },
      alignment: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 4,
        xl: 4
      }
    }
  ],
  dataFomat: 'SINGLE'
});

export const verifyOtpJson = (otpVerificationHandler, isLoading) => ({
  form: [
    {
      title: '',
      variant: 'outlined',
      input: [
        {
          name: 'fill_details',
          label: 'Fill Details',
          identifier: IDENTIFIER.HEADER,
          alignment: {
            xs: 12,
            sm: 12,
            md: 12,
            lg: 12,
            xl: 12
          }
        },
        {
          name: 'enter_otp',
          label: 'Enter 4 Digit OTP',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          validation: {
            isRequired: true,
            requiredMsg: 'Please enter OTP',
            minLength: 4,
            minLenMsg: 'OTP should not be less than 4 digits',
            maxLength: 4,
            maxLenMsg: 'OTP should not be more than 4 digits',
            pattern: REGEX.NUMBER,
            patternMsg: 'Please enter numeric digits only'
          }
        },
        {
          alignment: {
            xs: 6,
            sm: 6,
            md: 6,
            lg: 6,
            xl: 6
          },
          name: 'verify',
          label: 'Verify',
          identifier: IDENTIFIER.BUTTON,
          disabled: isLoading,
          clickHanlder: otpVerificationHandler,
          style: {
            width: '150px',
            height: '50px',
            right: 0,
            boxShadow: 'none',
            borderRadius: '8px',
            padding: 0
          },
        }
      ],
      // buttonDetails: {
      //   name: 'Submit',
      //   type: 'submit',
      // },
      alignment: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 4,
        xl: 4
      }
    }
  ],
  dataFomat: 'SINGLE'
});

export const detailsJson = (
  branches,
  branchHandler,
  pinChangeHandler,
  panChangeHandler,
  mobileNo,
  onCancelHandler
) => ({
  form: [
    {
      title: '',
      variant: 'outlined',
      input: [
        {
          name: 'fill_details',
          label: 'Fill Details',
          identifier: IDENTIFIER.HEADER,
          alignment: {
            xs: 12,
            sm: 12,
            md: 12,
            lg: 12,
            xl: 12
          }
        },
        {
          name: 'mobile_no',
          label: 'Mobile No.',
          type: 'text',
          defaultValue: mobileNo,
          disabled: true,
          readOnly: true,
          identifier: IDENTIFIER.INPUTTEXT,
          validation: {
            isRequired: true,
            requiredMsg: 'Please enter mobile number',
            pattern: REGEX.MOBILE,
            patternMsg: 'Please enter valid mobile number.',
            maxLength: 10,
            maxLenMsg: 'Mobile number should not be more than 10 digits.',
          }
        },
        {
          name: 'pan',
          label: 'PAN',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE_SETTER,
          functionChangeBaseOn: 'pan',
          customFunction: (value, callback, index, setValue) => panChangeHandler(value, callback, index, setValue),
          validation: {
            isRequired: true,
            requiredMsg: 'Please enter your pan number',
            pattern: REGEX.PANCARD,
            patternMsg: 'Please enter valid pan number.'
          }
        },
        {
          name: 'full_name',
          label: 'Full Name',
          type: 'text',
          disabled: true,
          readOnly: true,
          identifier: IDENTIFIER.INPUTTEXT,
          validation: {
            isRequired: true,
            requiredMsg: 'Please enter full name',
          }
        },
        {
          name: 'address',
          label: 'Address',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          validation: {
            maxLength: 35,
            maxLenMsg: 'Address should not be more than 35 characters.',
          }
        },
        {
          name: 'pin_code',
          label: 'Pincode',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE_SETTER,
          functionChangeBaseOn: 'pin_code',
          customFunction: (value, callback, index, setValue) => pinChangeHandler(value, callback, index, setValue),
          validation: {
            isRequired: true,
            requiredMsg: 'Please enter pin code',
            pattern: REGEX.PINCODE,
            patternMsg: 'Please enter valid pincode.'
          }
        },
        {
          name: 'city',
          label: 'City',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          disabled: true,
          readOnly: true,
          validation: {
            isRequired: true,
            requiredMsg: 'Please enter city name',
          }
        },
        {
          name: 'state',
          label: 'State',
          type: 'text',
          disabled: true,
          readOnly: true,
          identifier: IDENTIFIER.INPUTTEXT,
          validation: {
            isRequired: true,
            requiredMsg: 'Please enter state name',
          }
        },
        {
          name: 'loan_amount',
          label: 'Required Loan Amount(in rs.)',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          validation: {
            isRequired: true,
            requiredMsg: 'Please enter required loan amount',
            pattern: REGEX.AMOUNT,
            patternMsg: 'Please enter numeric digits only',
            min: 200000,
            max: 5000000,
            maxMsg: 'Please enter value between 200000 - 5000000',
            minMsg: 'Please enter value between 200000 - 5000000',
          }
        },
        {
          name: 'select_branch',
          label: 'Select Branch',
          type: 'text',
          identifier: IDENTIFIER.SELECT,
          customFunction: branchHandler,
          functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE,
          // functionChangeBaseOn: 'pin_code',
          option: branches || [],
          validation: {
            isRequired: true,
            requiredMsg: 'Please select branch name',
          }
        },
        {
          name: 'aadhar_card',
          label: 'Aadhar Card',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          validation: {
            pattern: REGEX.AADHAAR,
            patternMsg: 'Please enter valid aadhaar number.'
          }
        },
      ],
      // buttonDetails: {
      //   name: 'Submit',
      //   type: 'submit',
      // },
      alignment: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 3,
        xl: 3
      },
      buttonDetails: {
        name: 'Submit',
        type: 'submit',
        rowReverse: 'row-reverse',
        isShowCustomButton: {
          name: 'Cancel',
          customFunction: onCancelHandler
        }
      },
    }
  ],

});

export const createLeadJson = (onCancelHandler, pincodeVerificationHandler) => ({
  form: [
    {
      title: '',
      variant: 'outlined',
      input: [
        {
          name: 'customer_name',
          label: 'Name',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          validation: {
            isRequired: true,
            requiredMsg: 'Please enter the name',
            pattern: REGEX.ALPHABETS,
            patternMsg: 'Please enter only alphabets.',
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
          identifier: IDENTIFIER.INPUTTEXT,
          validation: {
            isRequired: true,
            requiredMsg: 'Please enter mobile number',
            pattern: REGEX.MOBILE,
            patternMsg: 'Please enter valid mobile number.',
            maxLength: 10,
            maxLenMsg: 'Mobile number should not be more than 10 digits.',
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
          name: 'gold_loan_amount',
          label: 'Required Loan Amount(in rs.)',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          validation: {
            isRequired: true,
            requiredMsg: 'Please enter required loan amount',
            pattern: REGEX.AMOUNT,
            patternMsg: 'Please enter numeric digits only',
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
          name: 'pincode',
          label: 'Pin Code',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE_SETTER,
          functionChangeBaseOn: 'pincode',
          customFunction: (value, callback) => pincodeVerificationHandler(value, callback, ['pincode']),
          setValueArr: [
            {
              apiKey: 'city',
              name: 'city'
            },
            {
              apiKey: 'state',
              name: 'state'
            }
          ],
          validation: {
            isRequired: false,
            pattern: REGEX.PINCODE,
            patternMsg: 'Please enter valid pincode.'
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
          name: 'city',
          label: 'City',
          type: 'text',
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
          name: 'state',
          label: 'State',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT,
          validation: {
            isRequired: false,
            requiredMsg: 'Please enter state name',
          },
          alignment: {
            xs: 12,
            sm: 12,
            md: 6,
            lg: 6,
            xl: 6,
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
    }
  ]
});
