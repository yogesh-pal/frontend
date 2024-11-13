import {
  IDENTIFIER,
  REGEX,
} from '../../../../../constants';

const sendOtpStep = (props) => {
  const { otpMobileVerificationHandler, otpHandler } = props;
  return {
    title: 'Send OTP',
    variant: 'outlined',
    input: [
      {
        name: 'primary_mobile_number',
        label: 'Primary Contact Number',
        type: 'text',
        identifier: IDENTIFIER.INPUTBUTTONOTP,
        function: otpHandler,
        apiBody: ['primary_mobile_number'],
        status: false,
        disableTime: 1000,
        count: 180,
        buttonDetails: {
          isCall: true,
          isOtp: true,
          isWhatsapp: true,
          disableWhatsapp: true,
          attemptWhatsapp: 1,
          callName: 'Send OTP via Call',
          sendOTP: 'Send OTP',
          whatsappOTP: 'OTP Via Whatsapp',
          fail: {
            disableWhatsapp: false,
          }
        },
        success: {
          setValueArr: [{
            value: '',
            name: 'OTPVerificationStatus'
          }],
          showField: [{
            name: 'primaryContactNumberOTP',
            condition: 'isShow',
            value: true
          },
          {
            name: 'OTPVerificationStatus',
            condition: 'isShow',
            value: false
          }
          ],
          status: true,
        },
        fail: {
          setValueArr: [{
            value: '',
            name: 'OTPVerificationStatus'
          }],
          showField: [{
            name: 'primaryContactNumberOTP',
            condition: 'isShow',
            value: false
          },
          {
            name: 'OTPVerificationStatus',
            condition: 'isShow',
            value: false
          }],
          status: true
        },
        enablebutton: {
          length: 10
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter primary contact number.',
          pattern: REGEX.MOBILENUMBER,
          patternMsg: 'Please enter valid primary contact number.',
          maxLength: 10,
          maxLenMsg: 'Primary contact number should not be more than 10 digits.',
        },
        alignment: {
          xs: 12,
          sm: 12,
          md: 12,
          lg: 12,
          xl: 12
        }
      },
      {
        name: 'primaryContactNumberOTP',
        label: 'OTP',
        type: 'text',
        identifier: IDENTIFIER.INPUTOTP,
        function: otpMobileVerificationHandler,
        status: false,
        enablebutton: {
          length: 4
        },
        apiBody: ['primary_mobile_number', 'primaryContactNumberOTP'],
        success: {
          setValueArr: [{
            value: 'VALID',
            name: 'OTPVerificationStatus'
          }],
          showField: [{
            name: 'primaryContactNumberOTP',
            condition: 'isShow',
            value: false
          },
          {
            name: 'OTPVerificationStatus',
            condition: 'isShow',
            value: true
          }],
          disable: {
            value: true,
            disableFields: ['primary_mobile_number'],
          },
        },
        fail: {
          setValueArr: [{
            value: 'INVALID',
            name: 'OTPVerificationStatus'
          }],
          showField: [{
            name: 'primaryContactNumberOTP',
            condition: 'isShow',
            value: true
          },
          {
            name: 'OTPVerificationStatus',
            condition: 'isShow',
            value: true
          }],
          disable: {
            value: false,
            disableFields: ['primary_mobile_number'],
          },
        },
        condition: {
          type: 'visible',
          isShow: false
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter OTP',
          pattern: REGEX.OTPVERIFICATION,
          patternMsg: 'Please enter valid OTP.'
        },
        alignment: {
          xs: 12,
          sm: 12,
          md: 5,
          lg: 5,
          xl: 5
        }
      },
      {
        name: 'OTPVerificationStatus',
        label: 'Status',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        defaultValue: '',
        disabled: true,
        condition: {
          type: 'visible',
          isShow: false
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter your name',
          pattern: REGEX.ALPHABETS,
          patternMsg: 'Alphabetical characters only'
        },
        alignment: {
          xs: 12,
          sm: 12,
          md: 5,
          lg: 5,
          xl: 5
        }
      },
    ],
    onBack: {
      disable: {
        value: false,
        disableFields: ['primary_mobile_number'],
      },
      reset: {
        currentForm: ['primaryContactNumberOTP', 'OTPVerificationStatus']
      },
      condition: {
        currentForm: [
          {
            name: 'primaryContactNumberOTP',
            condition: 'isShow',
            value: false
          },
          {
            name: 'OTPVerificationStatus',
            condition: 'isShow',
            value: false
          },
        ]
      },
      status: {
        currentForm: [
          {
            name: 'primary_mobile_number',
            status: false
          },
          {
            name: 'primaryContactNumberOTP',
            status: false
          },
        ]
      }
    },
    buttonDetails: {
      name: 'Update Customer',
      type: 'submit'
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

export { sendOtpStep };
