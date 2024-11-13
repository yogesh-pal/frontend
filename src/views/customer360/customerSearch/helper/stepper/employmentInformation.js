/* eslint-disable max-len */
import {
  FUNCTION_IDENTIFIER,
  IDENTIFIER,
  REGEX
} from '../../../../../constants';

const employmentInformationStep = ({
  udyamSendOtp, udyamValidateOtp, userDetails, annualIncomeHandler, customerOccupationHandler
}) => ({
  title: 'Employment Information',
  variant: 'outlined',
  input: [
    {
      name: 'customer_occupation',
      label: 'Customer Occupation',
      type: 'select',
      identifier: IDENTIFIER.SELECT,
      multiSelect: false,
      option: ['Self Employed', 'Salaried', 'Agriculturist', 'Homemaker', 'Unemployed', 'Student'],
      customFunction: customerOccupationHandler,
      functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE_SETTER,
      functionChangeBaseOn: 'customer_occupation',
      onChange: {
        'Self Employed': {
          defaultValue: 'Self Employed',
          showField: [{
            name: 'psl_category',
            condition: 'isShow',
            value: true
          }],
          disable: {
            value: false,
            disableFields: ['annual_income_self_salaried', 'annual_income_salaried', 'annual_income_agriculturist', 'psl_status', 'psl_category'],
          },
          resetFields: ['risk_rating', 'annual_income_salaried', 'annual_income_agriculturist', 'annual_income_homemaker', 'annual_income_student', 'annual_income_unemployed']
        },
        Salaried: {
          defaultValue: 'Salaried',
          showField: [{
            name: 'psl_category',
            condition: 'isShow',
            value: false
          }],
          disable: {
            value: false,
            disableFields: ['annual_income_self_salaried', 'annual_income_salaried', 'annual_income_agriculturist'],
          },
          resetFields: ['risk_rating', 'annual_income_self_salaried', 'annual_income_agriculturist', 'annual_income_homemaker', 'annual_income_student', 'annual_income_unemployed']
        },
        Agriculturist: {
          defaultValue: 'Agriculturist',
          showField: [{
            name: 'psl_category',
            condition: 'isShow',
            value: true
          }],
          disable: [{
            value: true,
            disableFields: ['psl_category', 'psl_status'],
          }, {
            value: false,
            disableFields: ['annual_income_self_salaried', 'annual_income_salaried', 'annual_income_agriculturist'],
          }],
          resetFields: ['risk_rating', 'annual_income_self_salaried', 'annual_income_salaried', 'annual_income_homemaker', 'annual_income_student', 'annual_income_unemployed']
        },
        Homemaker: {
          defaultValue: 'Homemaker',
          disable: [{
            value: true,
            disableFields: ['psl_status'],
          }, {
            value: false,
            disableFields: ['annual_income_homemaker'],
          }],
          resetFields: ['risk_rating', 'annual_income_self_salaried', 'annual_income_agriculturist', 'annual_income_salaried', 'annual_income_student', 'annual_income_unemployed']
        },
        Unemployed: {
          defaultValue: 'Unemployed',
          disable: [{
            value: true,
            disableFields: ['psl_status'],
          }, {
            value: false,
            disableFields: ['annual_income_unemployed'],
          }],
          resetFields: ['risk_rating', 'annual_income_self_salaried', 'annual_income_agriculturist', 'annual_income_salaried', 'annual_income_homemaker', 'annual_income_student']
        },
        Student: {
          defaultValue: 'Student',
          disable: [{
            value: true,
            disableFields: ['psl_status'],
          }, {
            value: false,
            disableFields: ['annual_income_student'],
          }],
          resetFields: ['risk_rating', 'annual_income_self_salaried', 'annual_income_agriculturist', 'annual_income_salaried', 'annual_income_homemaker', 'annual_income_unemployed']
        },
      },
      validation: {
        isRequired: true,
        requiredMsg: 'Please select customer occupation.',
      },
    },
    {
      name: 'annual_income_self_salaried',
      label: 'Annual Income',
      type: 'select',
      identifier: IDENTIFIER.SELECT,
      multiSelect: false,
      option: ['Less than 1 Lac', '1 Lac to 5 Lacs', '5 Lacs to 10 Lacs', '10 Lacs to 25 Lacs', '25 Lacs to 1 Crore', 'More than 1 Crore'],
      functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE_SETTER,
      functionChangeBaseOn: 'annual_income_self_salaried',
      customFunction: (values, callback, index, setValue) => annualIncomeHandler(values, callback, index, setValue, 'annual_income_self_salaried'),
      disabled: true,
      defaultValue: '',
      condition: {
        type: 'showOnValue',
        baseOn: 'customer_occupation',
        baseValue: 'Self Employed',
      },
      validation: {
        isRequired: true,
        requiredMsg: 'Please select annual income.',
      },
    },
    {
      name: 'annual_income_salaried',
      label: 'Annual Income',
      type: 'select',
      identifier: IDENTIFIER.SELECT,
      multiSelect: false,
      option: ['Less than 1 Lac', '1 Lac to 5 Lacs', '5 Lacs to 10 Lacs', '10 Lacs to 25 Lacs', '25 Lacs to 1 Crore', 'More than 1 Crore'],
      functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE_SETTER,
      functionChangeBaseOn: 'annual_income_salaried',
      customFunction: (values, callback, index, setValue) => annualIncomeHandler(values, callback, index, setValue, 'annual_income_salaried'),
      disabled: true,
      defaultValue: '',
      condition: {
        type: 'showOnValue',
        baseOn: 'customer_occupation',
        baseValue: 'Salaried',
      },
      validation: {
        isRequired: true,
        requiredMsg: 'Please select annual income.',
      },
    },
    {
      name: 'annual_income_agriculturist',
      label: 'Annual Income',
      type: 'select',
      identifier: IDENTIFIER.SELECT,
      multiSelect: false,
      option: ['Less than 1 Lac', '1 Lac to 5 Lacs', '5 Lacs to 10 Lacs', '10 Lacs to 25 Lacs', '25 Lacs to 1 Crore', 'More than 1 Crore'],
      functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE_SETTER,
      functionChangeBaseOn: 'annual_income_agriculturist',
      customFunction: (values, callback, index, setValue) => annualIncomeHandler(values, callback, index, setValue, 'annual_income_agriculturist'),
      disabled: true,
      defaultValue: '',
      condition: {
        type: 'showOnValue',
        baseOn: 'customer_occupation',
        baseValue: 'Agriculturist',
      },
      validation: {
        isRequired: true,
        requiredMsg: 'Please select annual income.',
      },
    },
    {
      name: 'annual_income_homemaker',
      label: 'Annual Income',
      type: 'select',
      identifier: IDENTIFIER.SELECT,
      multiSelect: false,
      option: ['Less than 1 Lac', '1 Lac to 5 Lacs', '5 Lacs to 10 Lacs', '10 Lacs to 25 Lacs', '25 Lacs to 1 Crore', 'More than 1 Crore'],
      functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE_SETTER,
      functionChangeBaseOn: 'annual_income_homemaker',
      customFunction: (values, callback, index, setValue) => annualIncomeHandler(values, callback, index, setValue, 'annual_income_homemaker'),
      disabled: true,
      defaultValue: '',
      condition: {
        type: 'showOnValue',
        baseOn: 'customer_occupation',
        baseValue: 'Homemaker',
      },
      validation: {
        isRequired: true,
        requiredMsg: 'Please select annual income.',
      },
    },
    {
      name: 'annual_income_student',
      label: 'Annual Income',
      type: 'select',
      identifier: IDENTIFIER.SELECT,
      multiSelect: false,
      option: ['Less than 1 Lac', '1 Lac to 5 Lacs', '5 Lacs to 10 Lacs', '10 Lacs to 25 Lacs', '25 Lacs to 1 Crore', 'More than 1 Crore'],
      functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE_SETTER,
      functionChangeBaseOn: 'annual_income_student',
      customFunction: (values, callback, index, setValue) => annualIncomeHandler(values, callback, index, setValue, 'annual_income_student'),
      disabled: true,
      defaultValue: '',
      condition: {
        type: 'showOnValue',
        baseOn: 'customer_occupation',
        baseValue: 'Student',
      },
      validation: {
        isRequired: true,
        requiredMsg: 'Please select annual income.',
      },
    },
    {
      name: 'annual_income_unemployed',
      label: 'Annual Income',
      type: 'select',
      identifier: IDENTIFIER.SELECT,
      multiSelect: false,
      option: ['Less than 1 Lac', '1 Lac to 5 Lacs', '5 Lacs to 10 Lacs', '10 Lacs to 25 Lacs', '25 Lacs to 1 Crore', 'More than 1 Crore'],
      functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE_SETTER,
      functionChangeBaseOn: 'annual_income_unemployed',
      customFunction: (values, callback, index, setValue) => annualIncomeHandler(values, callback, index, setValue, 'annual_income_unemployed'),
      disabled: true,
      defaultValue: '',
      condition: {
        type: 'showOnValue',
        baseOn: 'customer_occupation',
        baseValue: 'Unemployed',
      },
      validation: {
        isRequired: true,
        requiredMsg: 'Please select annual income.',
      },
    },
    {
      name: 'risk_rating',
      label: 'Risk Category',
      type: 'text',
      identifier: IDENTIFIER.INPUTTEXT,
      InputProps: true,
      readOnly: true,
      disabled: true,
      defaultValue: '',
    },
    {
      name: 'psl_status',
      label: 'PSL Status',
      type: 'radio',
      identifier: IDENTIFIER.RADIO,
      option: ['Yes', 'No'],
      inline: true,
      validation: {
        isRequired: true,
        requiredMsg: 'Please select psl status'
      },
      condition: {
        type: 'multiShowOnValue',
        baseOn: 'customer_occupation',
        baseValue: ['Self Employed', 'Agriculturist', 'Homemaker', 'Unemployed', 'Student'],
      },
    },
    {
      name: 'psl_category',
      label: 'PSL Category',
      type: 'select',
      identifier: IDENTIFIER.SELECT,
      multiSelect: false,
      option: ['Agriculture', 'MSME', 'Education', 'Housing', 'Social Infrastructure', 'Renewable Energy', 'Others'],
      validation: {
        isRequired: true,
        requiredMsg: 'Please select psl category.'
      },
      condition: {
        type: 'visible,showOnValue',
        isShow: false,
        baseOn: 'psl_status',
        baseValue: 'Yes',
      },
    },
    {
      name: 'is_gst_applicable',
      label: 'Is GST Applicable for Customer?',
      type: 'text',
      identifier: IDENTIFIER.RADIO,
      option: ['Yes', 'No'],
      defaultValue: 'No',
      inline: true,
      validation: {
        isRequired: true,
        requiredMsg: 'Please select any of the above options'
      }
    },
    {
      name: 'customer_gst_number',
      label: 'Customer GST Number',
      type: 'text',
      identifier: IDENTIFIER.INPUTTEXT,
      condition: {
        type: 'showOnValue',
        baseOn: 'is_gst_applicable',
        baseValue: 'Yes'
      },
      validation: {
        isRequired: true,
        requiredMsg: 'Please enter Customer GST Number.',
        pattern: REGEX.GSTNUMBER,
        patternMsg: 'Please enter valid Customer GST Number.'
      }
    },
    {
      name: 'udyam_registration_number',
      label: 'Udyam Registration Number',
      disabled: !!userDetails.udyam_registration_number,
      identifier: IDENTIFIER.INPUTTEXT,
      validation: {
        pattern: REGEX.UDYAMNUMBER,
        patternMsg: 'Please enter valid udyam registration number'
      },
    },
    {
      name: 'udyam_mobile_number',
      label: 'Udyam Registered Mobile Number',
      isPageLoaderRequired: {
        val: true,
        msg: 'Please do not refresh or press back button.'
      },
      isErrorHandled: true,
      disabled: userDetails?.udyam_mobile_number,
      type: 'text',
      identifier: IDENTIFIER.INPUTBUTTONOTP,
      function: udyamSendOtp,
      apiBody: ['udyam_mobile_number', 'udyam_registration_number', 'first_name',
        'middle_name',
        'last_name'],
      // disabled: false,
      disableTime: 1000,
      count: 180,
      status: true,
      condition: {
        type: 'visible',
        isShow: userDetails?.udyam_data?.mode ? userDetails?.udyam_data?.mode === 'Online' : true
      },
      buttonDetails: {
        isCall: false,
        isOtp: true,
        callName: 'CALL',
        sendOTP: 'SEND OTP'
      },
      success: [{
        showField: [{
          name: 'udyamOTP',
          condition: 'isShow',
          value: true
        }],
        resetFields: ['udyamOTP'],
        status: true,
        setValueArr: [{
          apiKey: 'requestId',
          name: 'udyam_requestId'
        }],
      }, {
        showField: [{
          name: 'udyam_certificate',
          condition: 'isShow',
          value: true
        }],
        disable: {
          value: true,
          disableOnValue: true,
          disableFields: ['udyam_mobile_number', 'udyam_registration_number'],
        },
        setValueArr: [{
          apiKey: 'url',
          name: 'udyam_certificate'
        }, {
          apiKey: 'fuzzyScore',
          name: 'udyam_fuzzy_score'
        }],
        status: true,
      }],
      fail: [{
        resetFields: ['udyamOTP'],
        status: true,
        setValueArr: [{
          apiKey: 'error',
          name: 'udyam_failure_reason'
        }, {
          value: null,
          name: 'udyam_certificate'
        }, {
          value: null,
          name: 'udyam_certificate_postOTP'
        }]
      }, {
        resetFields: ['udyamOTP'],
        status: true,
        setValueArr: [{
          value: null,
          name: 'udyam_certificate'
        }, {
          value: null,
          name: 'udyam_certificate_postOTP'
        }]
      }],
      enablebutton: {
        length: 10
      },
      validation: {
        pattern: REGEX.MOBILENUMBER,
        patternMsg: 'Please enter valid Mobile number.'
      },
    },
    {
      name: 'udyamOTP',
      label: 'Enter Udyam OTP',
      type: 'text',
      identifier: IDENTIFIER.INPUTOTP,
      show: 'initial',
      function: udyamValidateOtp,
      apiBody: ['udyamOTP', 'udyam_registration_number', 'udyam_requestId'],
      status: true,
      success: {
        showField: [{
          name: 'udyamOTP',
          condition: 'isShow',
          value: false
        }, {
          name: 'udyam_certificate_postOTP',
          condition: 'isShow',
          value: true
        }],
        setValueArr: [{
          apiKey: 'url',
          name: 'udyam_certificate_postOTP'
        }, {
          apiKey: 'fuzzyScore',
          name: 'udyam_fuzzy_score'
        }],
        disable: {
          value: true,
          disableOnValue: true,
          disableFields: ['udyam_mobile_number', 'udyam_registration_number'],
        },
        status: true,
      },
      fail: [{
        // resetFields: ['udyamOTP'],
        status: true,
        setValueArr: [{
          apiKey: 'error',
          name: 'udyam_failure_reason'
        }, {
          value: null,
          name: 'udyam_certificate'
        }, {
          value: null,
          name: 'udyam_certificate_postOTP'
        }]
      }, {
        // resetFields: ['udyamOTP'],
        status: true,
        setValueArr: [{
          value: null,
          name: 'udyam_certificate'
        }, {
          value: null,
          name: 'udyam_certificate_postOTP'
        }]
      }],
      enablebutton: {
        length: 6
      },
      condition: {
        type: 'visible',
        isShow: false,
        baseOn: 'udyam_mobile_number',
      },
      validation: {
        isRequired: true,
        requiredMsg: 'Please enter your Udyam OTP',
        pattern: REGEX.OTPVERIFICATION,
        patternMsg: 'Please enter valid OTP.'
      },
    },
    {
      name: 'udyam_requestId',
      label: 'Udyam request ID',
      identifier: IDENTIFIER.INPUTTEXT,
      condition: {
        type: 'visible',
        isShow: false,
        baseOn: 'udyam_mobile_number',
      },
    },
    {
      name: 'udyam_fuzzy_score',
      label: 'Udyam Fuzzy Score',
      identifier: IDENTIFIER.INPUTTEXT,
      condition: {
        type: 'visible',
        isShow: false,
        baseOn: 'udyam_mobile_number',
      },
    },
    {
      name: 'udyam_verification_mode',
      label: 'Udyam Verification Mode',
      identifier: IDENTIFIER.INPUTTEXT,
      condition: {
        type: 'visible',
        isShow: false,
      },
    },
    {
      name: 'udyam_verified_on',
      label: 'Udyam Verified On',
      identifier: IDENTIFIER.INPUTTEXT,
      condition: {
        type: 'visible',
        isShow: false,
      },
    },
    {
      name: 'udyam_certificate',
      label: 'Udyam Certificate',
      identifier: IDENTIFIER.PDFFILEVIEWER,
      condition: {
        type: 'visible',
        isShow: userDetails?.udyam_data?.mode === 'Online',
        baseOn: 'udyam_mobile_number',
      },
    },
    {
      name: 'udyam_proof',
      label: 'Udyam Certificate',
      identifier: userDetails?.udyam_data?.proof?.[0].includes('.pdf') ? IDENTIFIER.PDFFILEVIEWER : IDENTIFIER.MULTIPLELIVEPHOTO,
      condition: {
        type: 'visible',
        isShow: userDetails?.udyam_data?.mode === 'Offline'
      },
      disable: userDetails?.udyam_data?.mode === 'Offline'
    },
    {
      name: 'udyam_certificate_postOTP',
      label: 'Udyam Certificate On OTP',
      identifier: IDENTIFIER.PDFFILEVIEWER,
      condition: {
        type: 'visible',
        isShow: false,
        baseOn: 'udyamOTP',
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

export { employmentInformationStep };
