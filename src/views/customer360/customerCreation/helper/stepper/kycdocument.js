/* eslint-disable no-undef */
/* eslint-disable camelcase */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import moment from 'moment';
import { cloneDeep } from 'lodash';
import {
  FUNCTION_IDENTIFIER,
  IDENTIFIER,
  REGEX,
  MODULE,
} from '../../../../../constants';
import {
  ID_PROOF_NAMELIST_WITHOUT_PAN,
  ADDRESS_PROOF_NAME_LIST,
  AADHAARVERFICATIONMODE
} from '../constant';
import { CONFIGCUSTOMER } from './config';

const kycDocumentStep = (props) => {
  const {
    customerID,
    customerDetails,
    aadhaarVerifyHandler,
    aadhaarCardOtpHandler,
    aadhaarOTPVerificationHandler,
    pincodeVerificationHandler,
    panVerificationHandler,
    idProofListHandler,
    handleDynamicKYCValidation,
    preFillIfExists,
    onSaveClickHandler,
    onSaveClickHandlerID,
    onSaveClickHandlerAddress,
    resetField,
    biometricComponent,
    aadhaarVerificationModeHandler,
    closeHandlerAadhaarVerificationHandler,
    CONFIGURATION,
    biometricEnableHandler,
    onChangeKycHandler,
    resetFormValues,
    onDeleteHandlerId,
  } = props;

  const { CUSTOMER } = MODULE;
  const {
    ocr, biometric, aadhaarPanlinking, offline
  } = CONFIGURATION;
  const {
    BIOMETRIC, NONBIOMETRIC, OFFLINEMODE, OFFLINEMODEDISABLED
  } = CONFIGCUSTOMER({
    biometricComponent,
    aadhaarVerificationModeHandler,
    closeHandlerAadhaarVerificationHandler,
    biometricEnableHandler,
    CONFIGURATION,
    customerID,
    customerDetails,
  });

  const BIODETAILS = {
    OPTION: biometric ? BIOMETRIC.OPTIONS : NONBIOMETRIC.OPTIONS,
    ONCHANGE: biometric ? BIOMETRIC.ONCHANGE : NONBIOMETRIC.ONCHANGE,
    INPUTCONFIG: biometric ? BIOMETRIC.INPUTCONFIG : NONBIOMETRIC.INPUTCONFIG,
    OTHERINPUTCONFIG: biometric ? BIOMETRIC.OTHERINPUTCONFIG : NONBIOMETRIC.OTHERINPUTCONFIG
  };

  const OFFLINEDETAILS = {
    OPTION: offline ? OFFLINEMODE.OPTIONS : OFFLINEMODEDISABLED.OPTIONS,
    ONCHANGE: biometric ? OFFLINEMODE.ONCHANGE : OFFLINEMODEDISABLED.ONCHANGE,
  };

  return {
    title: 'KYC Documents',
    variant: 'outlined',
    input: [
      {
        name: 'ckyc',
        label: 'CKYC',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        validation: {
          pattern: REGEX.CKYC,
          patternMsg: 'Please enter valid CKYC.',
          maxLength: 10,
          maxLenMsg: 'CKYC should not be more than 10 digits.',
        },
      },
      {
        name: 'aadhaar_verification_mode',
        label: 'Aadhaar verification Via',
        type: 'text',
        defaultValue: AADHAARVERFICATIONMODE.ONLINE,
        identifier: IDENTIFIER.RADIO,
        option: [
          {
            value: AADHAARVERFICATIONMODE.ONLINE,
            label: AADHAARVERFICATIONMODE.ONLINE,
            disabled: false
          },
          ...BIODETAILS.OPTION,
          ...OFFLINEDETAILS.OPTION,
          // {
          //   value: AADHAARVERFICATIONMODE.BIOMETRIC,
          //   label: AADHAARVERFICATIONMODE.BIOMETRIC,
          //   disabled: true
          // },

        ],
        // option: [AADHAARVERFICATIONMODE.ONLINE, AADHAARVERFICATIONMODE.OFFLINE, AADHAARVERFICATIONMODE.BIOMETRIC],
        onChange: {
          [AADHAARVERFICATIONMODE.ONLINE]: {
            validation: {
              father_or_spouse_name: {
                validation: {
                  isRequired: true,
                  requiredMsg: 'Please enter father/spouse name',
                  pattern: REGEX.SPACESTARTEND,
                  patternMsg: 'Please enter valid customer father/spouse Name.',
                  maxLength: 150,
                  maxLenMsg: 'Father/Spouse Name should not more than 150 characters.',
                }
              },
              aadharCardOffline: {
                validation: {
                  isRequired: true,
                  requiredMsg: 'Please enter your aadhaar number',
                  pattern: REGEX.AADHAAR,
                  patternMsg: 'Please enter valid aadhaar number.'
                }
              }
            },
            showField: [{
              name: 'enterAadhaarOTP',
              condition: 'isShow',
              value: false
            },
            {
              name: 'aadharCardOffline',
              condition: 'isShow',
              value: false
            },
            {
              name: 'aadharCardOfflineocr',
              condition: 'isShow',
              value: false
            }],
            defaultValue: AADHAARVERFICATIONMODE.ONLINE,
            disable: {
              value: true,
              disableFields: ['aadhaarStatus', 'first_name', 'middle_name', 'last_name', 'father_or_spouse_name', 'dob', 'address_1', 'address_2', 'pincode'],
            },
            resetFields: [
              'aadharCardBiometric',
              'aadharCardOfflineocr',
              'aadharCardOffline',
              'aadhaarStatus',
              'first_name',
              'middle_name',
              'last_name',
              'father_or_spouse_name',
              'dob',
              'address_1',
              'address_2',
              'pincode',
              'city',
              'state',
              'pincodeOnline'
            ],
          },
          ...BIODETAILS.ONCHANGE,
          ...OFFLINEDETAILS.ONCHANGE,
        },

        ...BIODETAILS.INPUTCONFIG,
        inline: true,
        validation: {
          isRequired: true,
          requiredMsg: 'Please select aadhaar card verfication type.',
        }
      },
      {
        name: 'aadharCardOffline',
        label: 'Aadhaar Card Number',
        type: 'text',
        identifier: IDENTIFIER.INPUTOTP,
        function: aadhaarVerifyHandler,
        apiBody: ['aadharCardOffline'],
        disabled: false,
        status: false,
        buttonDetails: {
          isCall: false,
          isOtp: true,
          callName: 'CALL',
          sendOTP: 'Verify'
        },
        success: {
          setValueArr: customerDetails && Object.keys(customerDetails)?.length ? [
            {
              value: 'VALID',
              name: 'aadhaarStatus'
            },
            {
              apiKey: 'first_name',
              name: 'first_name'
            },
            {
              apiKey: 'middle_name',
              name: 'middle_name'
            },
            {
              apiKey: 'last_name',
              name: 'last_name'
            },
            {
              apiKey: 'father_or_spouse_name',
              name: 'father_or_spouse_name'
            },
            {
              apiKey: 'dob',
              name: 'dob'
            },
            {
              apiKey: 'address_1',
              name: 'address_1'
            },
            {
              apiKey: 'address_2',
              name: 'address_2'
            },
            {
              apiKey: 'pincode',
              name: 'pincode'
            },
            {
              apiKey: 'pincodeOnline',
              name: 'pincodeOnline'
            },
            {
              apiKey: 'city',
              name: 'city'
            },
            {
              apiKey: 'state',
              name: 'state'
            },
          ] : [],
          status: true,
          disable: {
            value: true,
            disableOnValue: true,
            disableFields: ['aadharCardOffline', 'pincode', 'pincodeOnline'],
          },
          disableOption: [
            {
              name: 'aadhaar_verification_mode',
              value: AADHAARVERFICATIONMODE.ONLINE,
              disabled: true
            },
            ...BIODETAILS.OTHERINPUTCONFIG.aadharCardOffline.SUCCESS.disableOption
          ],
          validation: {
            aadharCardOffline: {
              isRequired: true,
              requiredMsg: 'Please enter your aadhaar number',
            },
          },
        },
        fail: {
          status: false,
          disable: {
            value: false,
            disableOnValue: true,
            disableFields: ['aadharCardOffline'],
          },
          validation: {
            aadharCardOffline: {
              isRequired: true,
              requiredMsg: 'Please enter your aadhaar number',
              pattern: REGEX.AADHAAR,
              patternMsg: 'Please enter valid aadhaar number.'
            }
          },
        },
        enablebutton: {
          length: 12
        },
        condition: {
          // type: 'showOnValue',
          // baseOn: 'aadhaar_verification_mode',
          // baseValue: AADHAARVERFICATIONMODE.OFFLINE
          type: 'visible',
          isShow: false
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter your aadhaar number',
          pattern: REGEX.AADHAAR,
          patternMsg: 'Please enter valid aadhaar number.',
          verifyMsg: 'Please verify Aadhaar card no. to proceed further'
        },
      },
      {
        name: 'aadharCardOfflineocr',
        label: 'Aadhaar Card Number',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        disabled: true,
        defaultValue: '',
        condition: {
          // type: 'showOnValue',
          // baseOn: 'aadhaar_verification_mode',
          // baseValue: 'Offline'
          type: 'visible',
          isShow: false
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter your aadhaar number',
          pattern: REGEX.AADHAAR,
          patternMsg: 'Please enter valid aadhaar number.'
        },
      },
      {
        name: 'aadharCardBiometric',
        label: 'Aadhaar Card Number',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        disabled: true,
        defaultValue: '',
        condition: {
          type: 'showOnValue',
          baseOn: 'aadhaar_verification_mode',
          baseValue: `${AADHAARVERFICATIONMODE.BIOMETRIC}`
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter your aadhaar number'
        },
      },
      {
        name: 'ocr',
        label: 'Aadhaar(Multiple Upload)*',
        type: 'text',
        filePath: `${CUSTOMER?.name}/${CUSTOMER?.details?.aadhaarVerification}`,
        identifier: IDENTIFIER.MULTIPLELIVEPHOTOPREVIEW,
        imageDetails: [
          {
            name: 'aadhaarFront',
            mandatory: true,
            label: 'Front Side',
          },
          {
            name: 'aadhaarBack',
            label: 'Back Side',
            mandatory: true
          }
        ],
        disable: false,
        onSaveHandler: onSaveClickHandler,
        enableMasking: !ocr,
        successOCRDisabled: {
          setValueArr: [
            {
              value: 'VALID',
              name: 'aadhaarStatus'
            },
          ]
        },
        failOCRDisabled: {
          setValueArr: [{
            value: 'INVALID',
            name: 'aadhaarStatus'
          },
          ],
          showField: [{
            name: 'aadhaarStatus',
            condition: 'isShow',
            value: true
          }],
        },
        success: {
          setValueArr: [{
            name: 'aadharCardOfflineocr',
            apiKey: 'aadharCardOffline'
          },
          {
            name: 'aadharCardOffline',
            apiKey: 'aadharCardOffline'
          },
          {
            value: 'VALID',
            name: 'aadhaarStatus'
          },
          {
            apiKey: 'first_name',
            name: 'first_name'
          },
          {
            apiKey: 'middle_name',
            name: 'middle_name'
          },
          {
            apiKey: 'last_name',
            name: 'last_name'
          },
          {
            apiKey: 'father_or_spouse_name',
            name: 'father_or_spouse_name'
          },
          {
            apiKey: 'dob',
            name: 'dob'
          },
          {
            apiKey: 'address_1',
            name: 'address_1'
          },
          {
            apiKey: 'address_2',
            name: 'address_2'
          },
          {
            apiKey: 'pincode',
            name: 'pincodeOnline'
          },
          {
            apiKey: 'city',
            name: 'city'
          },
          {
            apiKey: 'state',
            name: 'state'
          },
          ],
          showField: [{
            name: 'aadhaarStatus',
            condition: 'isShow',
            value: true
          },
          {
            name: 'enterAadhaarOTP',
            condition: 'isShow',
            value: false
          }],
          disable: {
            value: true,
            disableFields: ['first_name', 'aadhaar_verification_mode', 'aadharCardOnline', 'middle_name', 'last_name', 'father_or_spouse_name', 'dob', 'address_1', 'address_2', 'pincode', 'city', 'state'],
          },
          status: true,
          validation: {
            aadharCardOnline: {
              isRequired: true,
              requiredMsg: 'Please enter your aadhaar number',
            },
          },
          disableOption: [
            {
              name: 'aadhaar_verification_mode',
              value: AADHAARVERFICATIONMODE.BIOMETRIC,
              disabled: true
            },
            {
              name: 'aadhaar_verification_mode',
              value: AADHAARVERFICATIONMODE.ONLINE,
              disabled: true
            },
            {
              name: 'aadhaar_verification_mode',
              value: AADHAARVERFICATIONMODE.OFFLINE,
              disabled: true
            }
          ],
        },
        fail: {
          setValueArr: [{
            value: 'INVALID',
            name: 'aadhaarStatus'
          },
          ],
          showField: [{
            name: 'aadhaarStatus',
            condition: 'isShow',
            value: true
          }],
          disable: {
            value: true,
            disableFields: ['first_name', 'middle_name', 'last_name', 'father_or_spouse_name', 'dob', 'address_1', 'address_2'],
          },
          resetFields: ['first_name', 'middle_name', 'last_name', 'father_or_spouse_name', 'dob', 'address_1', 'address_2'],
          status: false,
          validation: {
            aadharCardOnline: {
              isRequired: true,
              requiredMsg: 'Please enter your aadhaar number',
              pattern: REGEX.AADHAAR,
              patternMsg: 'Please enter valid aadhaar number.'
            },
          },
        },
        condition: {
          type: 'showOnValue',
          baseOn: 'aadhaar_verification_mode',
          baseValue: 'Offline'
          // type: 'visible',
          // isShow: false
        }
      },
      {
        name: 'aadharCardOnline',
        label: 'Aadhaar Card Number',
        type: 'text',
        identifier: IDENTIFIER.INPUTBUTTONOTP,
        function: aadhaarCardOtpHandler,
        apiBody: ['aadharCardOnline', 'aadhaar_verification_mode'],
        disabled: false,
        disableTime: 1000,
        isErrorHandled: true,
        count: 60,
        status: false,
        buttonDetails: {
          isCall: false,
          isOtp: true,
          callName: 'CALL',
          sendOTP: 'SEND OTP'
        },
        onOTPSendHandler: biometricEnableHandler,
        enableBiometric: {
          disableOption: [
            {
              name: 'aadhaar_verification_mode',
              value: AADHAARVERFICATIONMODE.BIOMETRIC,
              disabled: false
            }
          ],
        },
        enableOffline: {
          disableOption: [
            {
              name: 'aadhaar_verification_mode',
              value: AADHAARVERFICATIONMODE.OFFLINE,
              disabled: false
            }
          ],
        },
        success: {
          showField: [{
            name: 'enterAadhaarOTP',
            condition: 'isShow',
            value: true
          }],
          resetFields: ['enterAadhaarOTP'],
          status: true,
          // disableOption: [
          //   {
          //     name: 'aadhaar_verification_mode',
          //     value: AADHAARVERFICATIONMODE.BIOMETRIC,
          //     disabled: true
          //   },
          //   {
          //     name: 'aadhaar_verification_mode',
          //     value: AADHAARVERFICATIONMODE.ONLINE,
          //     disabled: true
          //   },
          //   {
          //     name: 'aadhaar_verification_mode',
          //     value: AADHAARVERFICATIONMODE.OFFLINE,
          //     disabled: true
          //   }
          // ],
        },
        fail: {
          setValueArr: [{
            value: 'INVALID',
            name: 'aadhaarStatus'
          }],
          resetFields: ['enterAadhaarOTP'],
          status: false,
          disableOption: [
            ...BIODETAILS.OTHERINPUTCONFIG.aadharCardOnline.FAILED.disableOption
          ]
        },
        enablebutton: {
          length: 12
        },
        condition: {
          type: 'showOnValue',
          baseOn: 'aadhaar_verification_mode',
          baseValue: `${AADHAARVERFICATIONMODE.ONLINE}`
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter your aadhaar number',
          pattern: REGEX.AADHAAR,
          patternMsg: 'Please enter valid aadhaar number.'
        },
      },
      {
        name: 'aadhaar_osv_done',
        label: 'Aadhaar OSV Done',
        type: 'text',
        identifier: IDENTIFIER.RADIO,
        option: ['Yes', 'No'],
        inline: true,
        condition: {
          type: 'multiShowOnValue',
          baseOn: 'aadhaar_verification_mode',
          baseValue: 'Offline'
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please select aadhaar OSV.',
        }
      },
      {
        name: 'enterAadhaarOTP',
        label: 'Enter Aadhaar OTP',
        type: 'text',
        identifier: IDENTIFIER.INPUTOTP,
        show: 'initial',
        function: aadhaarOTPVerificationHandler,
        apiBody: ['enterAadhaarOTP', 'aadharCardOnline', 'aadhaar_verification_mode'],
        status: false,
        success: {
          setValueArr: [{
            name: 'aadharCardOnline',
            apiKey: 'aadharCardOnline'
          },
          {
            value: 'VALID',
            name: 'aadhaarStatus'
          },
          {
            apiKey: 'first_name',
            name: 'first_name'
          },
          {
            apiKey: 'middle_name',
            name: 'middle_name'
          },
          {
            apiKey: 'last_name',
            name: 'last_name'
          },
          {
            apiKey: 'father_or_spouse_name',
            name: 'father_or_spouse_name'
          },
          {
            apiKey: 'dob',
            name: 'dob'
          },
          {
            apiKey: 'address_1',
            name: 'address_1'
          },
          {
            apiKey: 'address_2',
            name: 'address_2'
          },
          {
            apiKey: 'pincode',
            name: 'pincode'
          },
          {
            apiKey: 'city',
            name: 'city'
          },
          {
            apiKey: 'state',
            name: 'state'
          },
          ],
          showField: [{
            name: 'aadhaarStatus',
            condition: 'isShow',
            value: true
          },
          {
            name: 'enterAadhaarOTP',
            condition: 'isShow',
            value: false
          }],
          disable: {
            value: true,
            disableOnValue: true,
            disableFields: ['first_name', 'aadhaar_verification_mode', 'aadharCardOnline', 'middle_name', 'last_name', 'father_or_spouse_name', 'dob', 'address_1', 'address_2', 'pincode', 'city', 'state'],
          },
          disableOption: [
            ...BIODETAILS.OTHERINPUTCONFIG.enterAadhaarOTP.SUCCESS.disableOption,
            {
              name: 'aadhaar_verification_mode',
              value: AADHAARVERFICATIONMODE.ONLINE,
              disabled: true
            },
            {
              name: 'aadhaar_verification_mode',
              value: AADHAARVERFICATIONMODE.OFFLINE,
              disabled: true
            }
          ],
          status: true,
          validation: {
            aadharCardOnline: {
              isRequired: true,
              requiredMsg: 'Please enter your aadhaar number',
            },
          },
        },
        fail: {
          disableOption: [
            ...BIODETAILS.OTHERINPUTCONFIG.enterAadhaarOTP.FAILED.disableOption,
            {
              name: 'aadhaar_verification_mode',
              value: AADHAARVERFICATIONMODE.ONLINE,
              disabled: false
            },
          ],
          setValueArr: [{
            value: 'INVALID',
            name: 'aadhaarStatus'
          },
          ],
          showField: [{
            name: 'aadhaarStatus',
            condition: 'isShow',
            value: true
          }],
          disable: {
            value: true,
            disableFields: ['first_name', 'middle_name', 'last_name', 'father_or_spouse_name', 'dob', 'address_1', 'address_2'],
          },
          resetFields: ['first_name', 'middle_name', 'last_name', 'father_or_spouse_name', 'dob', 'address_1', 'address_2'],
          status: false,
          validation: {
            aadharCardOnline: {
              isRequired: true,
              requiredMsg: 'Please enter your aadhaar number',
              pattern: REGEX.AADHAAR,
              patternMsg: 'Please enter valid aadhaar number.'
            },
          },
        },
        enablebutton: {
          length: 6
        },
        condition: {
          type: 'visible,multiShowOnValue',
          isShow: false,
          baseOn: 'aadhaar_verification_mode',
          baseValue: `${AADHAARVERFICATIONMODE.ONLINE},${AADHAARVERFICATIONMODE.BIOMETRIC}`
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter your aadhaar OTP',
          pattern: REGEX.OTPVERIFICATION,
          patternMsg: 'Please enter valid OTP.'
        },
      },
      {
        name: 'aadhaarStatus',
        label: 'Aadhaar Status',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        disabled: true,
        defaultValue: '',
        condition: {
          type: 'visible,multiShowOnValue',
          baseOn: 'aadhaar_verification_mode',
          baseValue: `${AADHAARVERFICATIONMODE.ONLINE},${AADHAARVERFICATIONMODE.BIOMETRIC}`,
          isShow: false
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Aadhaar status will not be empty.',
        }
      },
      {
        name: 'prefix',
        label: 'Prefix',
        type: 'select',
        identifier: IDENTIFIER.SELECT,
        defaultValue: '',
        multiSelect: false,
        option: ['Mr', 'Mrs', 'Ms'],
        validation: {
          isRequired: true,
          requiredMsg: 'Please select prefix',
        },
      },
      {
        name: 'first_name',
        label: 'First Name',
        type: 'text',
        defaultValue: customerDetails?.first_name || '',
        identifier: IDENTIFIER.INPUTTEXT,
        disabled: true,
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter first name',
          pattern: REGEX.SPACESTARTEND,
          patternMsg: 'Please enter valid first name.',
          maxLength: 75,
          maxLenMsg: 'First name should not more than 75 characters.',
        }
      },
      {
        name: 'middle_name',
        label: 'Middle Name',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        disabled: true,
        defaultValue: customerDetails?.middle_name || '',
        validation: {
          pattern: REGEX.SPACESTARTEND,
          patternMsg: 'Please enter valid middle name.',
          maxLength: 75,
          maxLenMsg: 'Middle name should not more than 75 characters.',
        }
      },
      {
        name: 'last_name',
        label: 'Last Name',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        disabled: true,
        defaultValue: customerDetails?.last_name || '',
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter last name',
          pattern: REGEX.SPACESTARTEND,
          patternMsg: 'Please enter valid last name.',
          maxLength: 75,
          maxLenMsg: 'Last name should not more than 75 characters.',
        }
      },
      {
        name: 'father_or_spouse_name',
        label: 'Father/Spouse Name',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        disabled: true,
        defaultValue: '',
        validation: {
          pattern: REGEX.SPACESTARTEND,
          patternMsg: 'Please enter valid customer father/spouse Name.',
          maxLength: 150,
          maxLenMsg: 'Father/Spouse Name should not more than 150 characters.',
        }
      },
      {
        name: 'dob',
        label: 'DOB',
        type: 'date',
        identifier: IDENTIFIER.DATEPICKER,
        disabled: true,
        defaultValue: customerDetails?.dob || '',
        readonly: true,
        greaterDateDisable: moment().subtract(18, 'years'),
        lesserDateDisable: moment().subtract(80, 'years'),
        disableYears: (currentDate) => moment().diff(moment(currentDate), 'years') > 80 || moment().diff(moment(currentDate), 'years') < 18,
        validation: {
          isRequired: true,
          requiredMsg: 'Please select your date of birth'
        }
      },
      {
        name: 'address_1',
        label: 'Address 1',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        disabled: true,
        defaultValue: customerDetails?.address_1 || '',
        multiline: true,
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter address 1',
          pattern: REGEX.SPACESTARTEND,
          patternMsg: 'Please enter valid address 1.',
          maxLength: 512,
          maxLenMsg: 'Address 1 should not be more than 512 characters.'
        }
      },
      {
        name: 'address_2',
        label: 'Address 2',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        disabled: true,
        defaultValue: customerDetails?.address_2 || '',
        multiline: true,
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter address 2',
          pattern: REGEX.SPACESTARTEND,
          patternMsg: 'Please enter valid address 2.',
          maxLength: 512,
          maxLenMsg: 'Address 2 should not be more than 512 characters.'
        }
      },
      {
        name: 'pincodeOnline',
        label: 'Pincode',
        type: 'text',
        disabled: !!customerDetails?.pin_code,
        identifier: IDENTIFIER.INPUTTEXT,
        apiCallValidation: {
          pattern: REGEX.PINCODE,
        },
        functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE_SETTER,
        functionChangeBaseOn: 'pincodeOnline',
        defaultValue: customerDetails?.pin_code || '',
        customFunction: (value, callback) => !customerDetails?.pin_code && pincodeVerificationHandler(value, callback, ['pincodeOnline']),
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
        condition: {
          type: 'showOnValue',
          baseOn: 'aadhaar_verification_mode',
          baseValue: 'Offline'
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter pincode',
          pattern: REGEX.PINCODE,
          patternMsg: 'Please enter valid pincode.'
        }
      },
      {
        name: 'pincode',
        label: 'Pincode',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        disabled: true,
        apiCallValidation: {
          pattern: REGEX.PINCODE,
        },
        functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE_SETTER,
        functionChangeBaseOn: 'pincode',
        // defaultValue: customerDetails?.pin_code || '',
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
        defaultValue: customerDetails?.pin_code || '',
        condition: {
          type: 'multiShowOnValue',
          baseOn: 'aadhaar_verification_mode',
          baseValue: `${AADHAARVERFICATIONMODE.ONLINE}, ${AADHAARVERFICATIONMODE.BIOMETRIC}`
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter pincode',
          pattern: REGEX.PINCODE,
          patternMsg: 'Please enter valid pincode.'
        }
      },
      {
        name: 'city',
        label: 'City',
        type: 'text',
        disabled: true,
        defaultValue: customerDetails?.city || '',
        identifier: IDENTIFIER.INPUTTEXT,
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter city',
        },
      },
      {
        name: 'state',
        label: 'State',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        disabled: true,
        defaultValue: customerDetails?.state || '',
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter state',
        },
      },
      {
        name: 'landmark',
        label: 'Landmark',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        disabled: false,
        multiline: true,
        defaultValue: '',
        validation: {
          isRequired: false,
          maxLength: 100,
          maxLenMsg: 'Landmark should not be more than 100 characters'
        },
      },
      {
        name: 'enter_pan_details',
        label: 'Enter Pan Details',
        type: 'text',
        identifier: IDENTIFIER.RADIO,
        option: ['Yes', 'No'],
        inline: true,
        onChange: {
          No: {
            disable: {
              value: false,
              disableFields: ['pancardNumberOnline', 'panStatus'],
            },
            showField: [{
              name: 'pan_url',
              condition: 'isShow',
              value: false
            }],
            resetFields: ['pancardNumberOnline', 'panStatus', 'pan_url', 'pan_customer_name'],
            unregisterFields: [
              'pan_url'
            ],
          },
          Yes: {
            defaultValue: 'Online',
            showField: [{
              name: 'pan_customer_name',
              condition: 'isShow',
              value: true
            }, {
              name: 'pan_url',
              condition: 'isShow',
              value: true
            }],
            disable: {
              value: true,
              disableFields: ['panStatus', 'pan_customer_name'],
            },
            resetFields: ['pancardNumberOnline', 'panStatus', 'pan_customer_name', 'pan_url'],
          }
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please select any of the above options',
        },

      },
      {
        name: 'pancardNumberOnline',
        label: 'Pan Number',
        type: 'text',
        isUpperCase: true,
        identifier: IDENTIFIER.INPUTTEXT,
        functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE_SETTER,
        functionChangeBaseOn: 'pancardNumberOnline',
        customFunction: (value, callback) => {
          if (value.pancardNumberOnline.match(REGEX.PANCARD)) {
            panVerificationHandler(value, callback, ['pancardNumberOnline'], aadhaarPanlinking);
          }
        },
        setValueArr: [
          {
            apiKey: 'status',
            name: 'panStatus'
          },
          {
            apiKey: 'full_name',
            name: 'pan_customer_name'
          }
        ],
        condition: {
          type: 'showOnValue',
          baseOn: 'enter_pan_details',
          baseValue: 'Yes'
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Pancard number is required.',
          pattern: REGEX.PANCARD,
          patternMsg: 'Please enter valid pancard number.',
          maxLength: 10,
          maxLenMsg: 'PAN card number should not more than 10 characters.',
        },
      },
      {
        name: 'panStatus',
        label: 'PAN Status',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        disabled: true,
        defaultValue: '',
        validation: {
          isRequired: true,
          requiredMsg: 'Pancard number status required.',
        },
        onChange: {
          VALID: {
            disable: {
              value: true,
              disableFields: ['pancardNumberOnline'],
            },
          }
        },
        condition: {
          type: 'showOnValue',
          baseOn: 'enter_pan_details',
          baseValue: 'Yes'
        },
      },
      {
        name: 'pan_customer_name',
        label: 'PAN Customer Name',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        disabled: true,
        defaultValue: '',
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter pancard customer name.',
        },
        condition: {
          type: 'visible,showOnValue',
          isShow: true,
          baseOn: 'enter_pan_details',
          baseValue: 'Yes'
        },
      },
      {
        name: 'pan_url',
        label: 'PAN Card',
        type: 'file',
        filePath: `${CUSTOMER?.name}/${CUSTOMER?.details?.panProof}`,
        identifier: IDENTIFIER.MULTIPLELIVEPHOTO,
        maxUploadCount: 1,
        isPreview: null,
        maxUploadMsg: 'Maximum 1 PAN Card image capture allowed.',
        condition: {
          type: 'visible',
          isShow: false
        },
        // condition: {
        //   type: 'multiShowOnValue',
        //   baseOn: 'id_proof_name',
        //   baseValue: IDPROOFBASEON
        // },
        validation: {
          isRequired: true,
          requiredMsg: 'Please upload PAN Card image',
        }
      },
      {
        name: 'id_proof_name',
        label: 'ID Proof',
        type: 'select',
        defaultValue: customerDetails?.id_proof_name || '',
        identifier: IDENTIFIER.SELECT,
        maskingHandler: {
          updateFieldDetails: [{
            name: 'id_proof_url',
            key: 'enableMasking',
            value: true
          }, {
            name: 'address_proof_name',
            key: 'disabled',
            value: false
          },
          {
            name: 'address_proof_url',
            key: 'disabled',
            value: false
          },
          {
            name: 'address_proof_number',
            key: 'disabled',
            value: false
          },
          {
            name: 'address_proof_name',
            key: 'option',
            value: cloneDeep(ADDRESS_PROOF_NAME_LIST)
          }
          ],
        },
        checkifExists: (field, value, getValues, setValue, additionalKey, updateJsonHandler) => {
          preFillIfExists({
            fields: field,
            value,
            getValues,
            setValue,
            name: 'id_proof_name',
            additionalKey,
            updateJsonHandler
          });
          // if (value !== 'Aadhaar Card') {
          //   preFillIfExists(field, value, getValues, setValue);
          // } else {
          //   resetField(field, value, getValues, setValue);
          // }
        },
        checkField: [{
          parent: 'address_proof_name',
          children: [{
            to: 'id_proof_url',
            from: 'address_proof_url'
          }, {
            to: 'id_proof_number',
            from: 'address_proof_number'
          }, {
            to: 'id_proof_remarks',
            from: 'address_proof_remarks'
          }]
        }],
        multiSelect: false,
        option: ID_PROOF_NAMELIST_WITHOUT_PAN,
        functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE,
        customFunction: idProofListHandler,
        functionChangeBaseOn: 'enter_pan_details,id_proof_name',
        onChange: {
          resetFields: ['address_proof_number', 'address_proof_name', 'address_proof_url', 'address_proof_same_id_proof'],
          Passport: {
            disable: {
              value: false,
              disableFields: ['id_proof_number', 'address_proof_number', 'address_proof_name', 'address_proof_url', 'address_proof_same_id_proof']
            },
            validation: {
              id_proof_number: {
                validation: {
                  isRequired: true,
                  requiredMsg: 'Please enter id proof number.',
                  pattern: REGEX.MUSTALPHANUMBERIC,
                  patternMsg: 'Please enter valid passport number.',
                  minLength: 8,
                  minLenMsg: 'Passport number should be 8 characters.',
                  maxLength: 8,
                  maxLenMsg: 'Passport number should not more than 8 characters.',
                }
              },
              id_proof_url: {
                validation: {
                  isRequired: true,
                  requiredMsg: 'Please upload id proof image',
                }
              }
            }
          },
          'Driving License': {
            disable: {
              value: false,
              disableFields: ['id_proof_number', 'address_proof_number', 'address_proof_name', 'address_proof_url', 'address_proof_same_id_proof']
            },
            validation: {
              id_proof_number: {
                validation: {
                  isRequired: true,
                  requiredMsg: 'Please enter your id proof number.',
                  pattern: REGEX.ONLYCHARANDDIGITS,
                  patternMsg: 'Please enter valid driving license number.',
                  minLength: 16,
                  minLenMsg: 'Driving license number should be 16 characters.',
                  maxLength: 16,
                  maxLenMsg: 'Driving license number should not more than 16 characters.',
                }
              },
              id_proof_url: {
                validation: {
                  isRequired: true,
                  requiredMsg: 'Please upload id proof image',
                }
              }
            }
          },
          'Voter ID': {
            disable: {
              value: false,
              disableFields: ['id_proof_number', 'address_proof_number', 'address_proof_name', 'address_proof_url', 'address_proof_same_id_proof']
            },
            validation: {
              id_proof_number: {
                validation: {
                  isRequired: true,
                  requiredMsg: 'Please enter your id proof number.',
                  pattern: REGEX.ALPHANUMBERICWITHTWOMANDATORYLETTERS,
                  patternMsg: 'Please enter valid voter id number.'
                }
              },
              id_proof_url: {
                validation: {
                  isRequired: true,
                  requiredMsg: 'Please upload id proof image',
                }
              }
            }
          },
          // 'PAN Card': {
          //   disable: {
          //     value: false,
          //     disableFields: ['id_proof_number', 'address_proof_number', 'address_proof_name', 'address_proof_url', 'address_proof_same_id_proof']
          //   },
          //   validation: {
          //     id_proof_number: {
          //       validation: {
          //         isRequired: true,
          //         requiredMsg: 'Please enter your id proof number.',
          //         pattern: REGEX.PANCARD,
          //         patternMsg: 'Please enter valid pancard number.',
          //         maxLength: 10,
          //         maxLenMsg: 'PAN card number should not more than 10 characters.',
          //       }
          //     },
          //     id_proof_url: {
          //       validation: {
          //         isRequired: true,
          //         requiredMsg: 'Please upload id proof image',
          //       }
          //     }
          //   }
          // },
          'Aadhaar Card': {
            disable: {
              value: true,
              disableFields: ['id_proof_number']
            },
            validation: {
              id_proof_number: {
                validation: {
                  isRequired: true,
                  requiredMsg: 'Please enter your id proof number.'
                }
              },
              id_proof_url: {
                validation: {
                  isRequired: true,
                  requiredMsg: 'Please upload id proof image',
                  min: 2,
                  minMsg: 'Please capture both the front and back sides of Aadhaar ID.'
                }
              }
            }
          },
          'Government Issued ID Card': {
            disable: {
              value: false,
              disableFields: ['id_proof_number', 'address_proof_number', 'address_proof_name', 'address_proof_url', 'address_proof_same_id_proof']
            },
            validation: {
              id_proof_number: {
                validation: {
                  isRequired: true,
                  requiredMsg: 'Please enter your id proof number.'
                }
              },
              id_proof_url: {
                validation: {
                  isRequired: true,
                  requiredMsg: 'Please upload id proof image',
                }
              }
            }
          },
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please select your id proof.'
        },
      },
      // id proof previous
      // {
      //   name: 'id_proof_url',
      //   label: 'ID Proof (Multiple Upload)',
      //   type: 'file',
      //   filePath: `${CUSTOMER?.name}/${CUSTOMER?.details?.idProofUrl}`,
      //   identifier: IDENTIFIER.MULTIPLELIVEPHOTO,
      //   maxUploadCount: 5,
      //   isPreview: null,
      //   maxUploadMsg: 'Maximum 5 id proof capture allowed.',
      //   // condition: {
      //   //   type: 'multiShowOnValue',
      //   //   baseOn: 'id_proof_name',
      //   //   baseValue: IDPROOFBASEON
      //   // },
      //   validation: {
      //     isRequired: true,
      //     requiredMsg: 'Please upload id proof image',
      //   }
      // },

      {
        name: 'id_proof_url',
        label: 'ID Proof (Multiple Upload)',
        type: 'text',
        filePath: `${CUSTOMER?.name}/${CUSTOMER?.details?.idProofUrl}`,
        identifier: IDENTIFIER.MULTIPLELIVEPHOTOPREVIEW,
        enableMasking: false,
        configOnDelete: {
          resetFields: ['address_proof_number', 'address_proof_name', 'address_proof_url', 'address_proof_same_id_proof'],
          disable: {
            value: false,
            disableFields: ['address_proof_number', 'address_proof_name', 'address_proof_url', 'address_proof_same_id_proof'],
          }
        },
        imageDetails: [
          {
            name: 'ID Proof Front',
            mandatory: true,
            label: 'Front Side',
          },
          {
            name: 'ID Proof Back',
            label: 'Back Side',
            mandatory: true
          },
        ],
        success: {
          resetFields: ['address_proof_number', 'address_proof_name', 'address_proof_url', 'address_proof_same_id_proof'],
          disable: {
            value: false,
            disableFields: ['address_proof_number', 'address_proof_name', 'address_proof_url', 'address_proof_same_id_proof'],
          }
        },
        fail: {
          resetFields: ['address_proof_number', 'address_proof_name', 'address_proof_url', 'address_proof_same_id_proof'],
        },
        disable: false,
        onSaveHandler: onSaveClickHandlerID,
        onDeleteHandler: onDeleteHandlerId,
        validation: {
          isRequired: true,
          requiredMsg: 'Please upload id proof image',
        }
      },
      {
        name: 'id_proof_number',
        label: 'ID Proof Number',
        type: 'text',
        isUpperCase: true,
        defaultValue: customerDetails?.id_proof_number || '',
        identifier: IDENTIFIER.INPUTTEXT,
        onChangeHandler: resetFormValues,
        configOnChange: {
          updateFieldDetails: [{
            name: 'address_proof_name',
            key: 'disabled',
            value: false
          },
          {
            name: 'address_proof_url',
            key: 'disabled',
            value: false
          },
          {
            name: 'address_proof_number',
            key: 'disabled',
            value: false
          }
          ],
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter your id proof number.',
          pattern: REGEX.ALPHANUMERICTRIMSPACE,
          patternMsg: 'Please enter valid id proof number.',
          maxLength: 100,
          maxLenMsg: 'ID proof number should not more than 100 characters.',
        },
      },
      {
        name: 'id_proof_remarks',
        label: 'ID Proof remarks',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        validation: {
          pattern: REGEX.ALPHANUMERICTRIMSPACESTARTEND,
          patternMsg: 'Please enter valid id proof remarks.',
          maxLength: 150,
          maxLenMsg: 'Remarks length not be greater than 150 characters.',
        },
      },
      {
        name: 'id_proof_osv_done',
        label: 'ID Proof OSV Done',
        type: 'text',
        identifier: IDENTIFIER.RADIO,
        option: ['Yes', 'No'],
        inline: true,
        validation: {
          isRequired: true,
          requiredMsg: 'Please select id proof OSV.'
        }
      },
      {
        name: 'address_proof_same_id_proof',
        label: 'Is Address proof same as Id proof ?',
        type: 'text',
        identifier: IDENTIFIER.RADIO,
        option: ['Yes', 'No'],
        inline: true,
        onChangeHandler: onChangeKycHandler,
        onChangeConfig: {
          updateFieldDetails: [
            {
              name: 'address_proof_name',
              key: 'option',
              value: cloneDeep(ADDRESS_PROOF_NAME_LIST)
            }]
        },
        onChange: {
          No: {
            disable: {
              value: false,
              disableFields: ['address_proof_url', 'address_proof_number', 'address_proof_name'],
            },
            resetFields: ['address_proof_url', 'address_proof_number', 'address_proof_name']
          },
          Yes: {
            disable: {
              value: true,
              disableFields: ['address_proof_url', 'address_proof_number', 'address_proof_name'],
            },
            // resetFields: ['address_proof_url', 'address_proof_number', 'address_proof_name'],
          }
        },
        // dummy function
        // onToggle: idProofListHandler,
        validation: {
          isRequired: true,
          requiredMsg: 'Please select any of the above options',
        },
      },
      {
        name: 'address_proof_name',
        label: 'Address Proof',
        type: 'select',
        defaultValue: customerDetails?.address_proof_name || '',
        identifier: IDENTIFIER.SELECT,
        checkifExists: (field, value, getValues, setValue, additionalKey) => {
          preFillIfExists({
            fields: field,
            value,
            getValues,
            setValue,
            name: 'address_proof_name',
            additionalKey
          });
          // if (value !== 'Aadhaar Card') {
          //   preFillIfExists(field, value, getValues, setValue);
          // } else {
          //   resetField(field, value, getValues, setValue);
          // }
        },
        checkField: [{
          parent: 'id_proof_name',
          children: [{
            from: 'id_proof_url',
            to: 'address_proof_url'
          }, {
            from: 'id_proof_number',
            to: 'address_proof_number'
          }, {
            from: 'id_proof_remarks',
            to: 'address_proof_remarks'
          }
          ]
        }],
        maskingHandler: {
          updateFieldDetails: [{
            name: 'address_proof_url',
            key: 'enableMasking',
            value: true
          },
          {
            name: 'address_proof_number',
            key: 'disabled',
            value: false
          }
          ],
        },
        disablemaskingHandler: {
          updateFieldDetails: [{
            name: 'address_proof_url',
            key: 'enableMasking',
            value: false
          },
          {
            name: 'address_proof_number',
            key: 'disabled',
            value: false
          }
          ],
        },
        multiSelect: false,
        enableMasking: false,
        option: ADDRESS_PROOF_NAME_LIST,
        onChange: {
          resetFields: ['address_proof_url'],
          Passport: {
            // disable: {
            //   value: false,
            //   disableFields: ['address_proof_number']
            // },
            validation: {
              address_proof_number: {
                validation: {
                  isRequired: true,
                  requiredMsg: 'Please enter id proof number.',
                  pattern: REGEX.MUSTALPHANUMBERIC,
                  patternMsg: 'Please enter valid passport number.',
                  minLength: 8,
                  minLenMsg: 'Passport number should be 8 characters.',
                  maxLength: 8,
                  maxLenMsg: 'Passport number should not more than 8 characters.',
                }
              },
              address_proof_url: {
                validation: {
                  isRequired: true,
                  requiredMsg: 'Please upload address proof image'
                }
              }
            }
          },
          'Driving License': {
            // disable: {
            //   value: false,
            //   disableFields: ['address_proof_number']
            // },
            validation: {
              address_proof_number: {
                validation: {
                  isRequired: true,
                  requiredMsg: 'Please enter your id proof number.',
                  pattern: REGEX.ONLYCHARANDDIGITS,
                  patternMsg: 'Please enter valid driving license number.',
                  minLength: 16,
                  minLenMsg: 'Driving license number should be 16 characters.',
                  maxLength: 16,
                  maxLenMsg: 'Driving license number should not more than 16 characters.',
                }
              },
              address_proof_url: {
                validation: {
                  isRequired: true,
                  requiredMsg: 'Please upload address proof image'
                }
              }
            }
          },
          'Voter ID': {
            // disable: {
            //   value: false,
            //   disableFields: ['address_proof_number']
            // },
            validation: {
              address_proof_url: {
                validation: {
                  isRequired: true,
                  requiredMsg: 'Please upload address proof image',
                }
              },
              address_proof_number: {
                validation: {
                  isRequired: true,
                  requiredMsg: 'Please enter your id proof number.',
                  pattern: REGEX.ALPHANUMBERICWITHTWOMANDATORYLETTERS,
                  patternMsg: 'Please enter valid voter id number.'
                }
              }
            }
          },
          'Aadhaar Card': {
            // disable: {
            //   value: false,
            //   disableFields: ['address_proof_number']
            // },
            validation: {
              address_proof_number: {
                validation: {
                  isRequired: true,
                  requiredMsg: 'Please enter address proof number.'
                }
              },
              address_proof_url: {
                validation: {
                  isRequired: true,
                  requiredMsg: 'Please upload address proof image',
                  min: 2,
                  minMsg: 'Please capture both the front and back sides of Aadhaar ID.'
                }
              }
            }
          },
          'Government Issued ID Card': {
            // disable: {
            //   value: false,
            //   disableFields: ['address_proof_number']
            // },
            validation: {
              address_proof_number: {
                validation: {
                  isRequired: true,
                  requiredMsg: 'Please enter address proof number.'
                }
              },
              address_proof_url: {
                validation: {
                  isRequired: true,
                  requiredMsg: 'Please upload address proof image'
                }
              }
            }
          },
          // 'Electricity Bill': {
          //   // disable: {
          //   //   value: false,
          //   //   disableFields: ['address_proof_number']
          //   // },
          //   validation: {
          //     address_proof_number: {
          //       validation: {
          //         isRequired: true,
          //         requiredMsg: 'Please enter address proof number.'
          //       }
          //     },
          //     address_proof_url: {
          //       validation: {
          //         isRequired: true,
          //         requiredMsg: 'Please upload address proof image'
          //       }
          //     }
          //   }
          // },
          // 'Gas Bill': {
          //   // disable: {
          //   //   value: false,
          //   //   disableFields: ['address_proof_number']
          //   // },
          //   validation: {
          //     address_proof_number: {
          //       validation: {
          //         isRequired: true,
          //         requiredMsg: 'Please enter address proof number.'
          //       }
          //     },
          //     address_proof_url: {
          //       validation: {
          //         isRequired: true,
          //         requiredMsg: 'Please upload address proof image'
          //       }
          //     }
          //   }
          // },
          // 'Postpaid Mobile Bill': {
          //   // disable: {
          //   //   value: false,
          //   //   disableFields: ['address_proof_number']
          //   // },
          //   validation: {
          //     address_proof_number: {
          //       validation: {
          //         isRequired: true,
          //         requiredMsg: 'Please enter address proof number.'
          //       }
          //     },
          //     address_proof_url: {
          //       validation: {
          //         isRequired: true,
          //         requiredMsg: 'Please upload address proof image'
          //       }
          //     }
          //   }
          // },
          // 'Rent Agreement': {
          //   // disable: {
          //   //   value: false,
          //   //   disableFields: ['address_proof_number']
          //   // },
          //   validation: {
          //     address_proof_number: {
          //       validation: {
          //         isRequired: true,
          //         requiredMsg: 'Please enter address proof number.',
          //       }
          //     },
          //     address_proof_url: {
          //       validation: {
          //         isRequired: true,
          //         requiredMsg: 'Please upload address proof image',
          //         min: 2,
          //         minMsg: 'Upload atleast two documents.'
          //       }
          //     }
          //   }
          // }
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please select address proof status.',
        },
      },
      // previous
      // {
      //   name: 'address_proof_url',
      //   label: 'Address Proof (Multiple Upload)',
      //   type: 'file',
      //   identifier: IDENTIFIER.MULTIPLELIVEPHOTO,
      //   filePath: `${CUSTOMER?.name}/${CUSTOMER?.details?.addressProof}`,
      //   maxUploadCount: 5,
      //   maxUploadMsg: 'Maximum 5 address proof capture allowed.',
      //   // condition: {
      //   //   type: 'multiShowOnValue',
      //   //   baseOn: 'address_proof_name',
      //   //   baseValue: ADRESSPROOFBASEON
      //   // },
      //   validation: {
      //     isRequired: true,
      //     requiredMsg: 'Please upload address proof image',
      //   }
      // },

      {
        name: 'address_proof_url',
        label: 'Address Proof (Multiple Upload)',
        // type: 'text',
        filePath: `${CUSTOMER?.name}/${CUSTOMER?.details?.addressProof}`,
        identifier: IDENTIFIER.MULTIPLELIVEPHOTOPREVIEW,
        imageDetails: [
          {
            name: 'Address Proof Front',
            mandatory: true,
            label: 'Front Side',
          },
          {
            name: 'Address Proof Back',
            label: 'Back Side',
            mandatory: true
          }
        ],
        disable: false,
        onSaveHandler: onSaveClickHandlerAddress,
        // u will need to
        enableMasking: false,
        validation: {
          isRequired: true,
          requiredMsg: 'Please upload address proof image',
        }
      },
      {
        name: 'address_proof_number',
        label: 'Address Proof ID Number',
        type: 'text',
        isUpperCase: true,
        defaultValue: customerDetails?.address_proof_number || '',
        identifier: IDENTIFIER.INPUTTEXT,
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter address proof number',
          pattern: REGEX.ALPHANUMERICTRIMSPACE,
          patternMsg: 'Please enter valid address proof number',
        },
      },
      {
        name: 'address_proof_remarks',
        label: 'Address Proof remarks',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        validation: {
          pattern: REGEX.ALPHANUMERICTRIMSPACESTARTEND,
          patternMsg: 'Please enter valid address proof remarks.',
          maxLength: 150,
          maxLenMsg: 'Remarks length not be greater than 150 characters.',
        },
      },
      {
        name: 'address_proof_osv_done',
        label: 'Address Proof OSV Done',
        type: 'text',
        identifier: IDENTIFIER.RADIO,
        option: ['Yes', 'No'],
        inline: true,
        validation: {
          isRequired: true,
          requiredMsg: 'Please select address proof OSV.'
        }
      },
      {
        name: 'current_address_same_as_permanent',
        label: 'Current Address Same as Permanent Address',
        type: 'text',
        identifier: IDENTIFIER.RADIO,
        option: ['Yes', 'No'],
        inline: true,
        onChange: {
          Yes: {
            defaultValue: 'Yes',
            resetFields: ['current_address_1', 'current_address_2', 'current_pincode', 'current_city', 'current_state', 'current_address_proof_url'],
          },
          No: {
            defaultValue: 'No',
            resetFields: ['current_address_1', 'current_address_2', 'current_pincode', 'current_city', 'current_state', 'current_address_proof_url'],
          },
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please select current address same as permanent address.'
        }
      },
      {
        name: 'current_address_1',
        label: 'Address 1',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        defaultValue: '',
        condition: {
          type: 'showOnValue',
          baseOn: 'current_address_same_as_permanent',
          baseValue: 'No'
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter address 1.',
          pattern: REGEX.SPACESTARTEND,
          patternMsg: 'Please enter valid address 1.',
        }
      },
      {
        name: 'current_address_2',
        label: 'Address 2',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        defaultValue: '',
        condition: {
          type: 'showOnValue',
          baseOn: 'current_address_same_as_permanent',
          baseValue: 'No'
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter address 2',
          pattern: REGEX.SPACESTARTEND,
          patternMsg: 'Please enter valid address 2.',
        }
      },
      {
        name: 'current_pincode',
        label: 'Pincode',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        apiCallValidation: {
          pattern: REGEX.PINCODE,
        },
        functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE_SETTER,
        functionChangeBaseOn: 'current_pincode',
        customFunction: (value, callback) => pincodeVerificationHandler(value, callback, ['current_pincode']),
        defaultValue: '',
        setValueArr: [
          {
            apiKey: 'city',
            name: 'current_city'
          },
          {
            apiKey: 'state',
            name: 'current_state'
          }
        ],
        condition: {
          type: 'showOnValue',
          baseOn: 'current_address_same_as_permanent',
          baseValue: 'No'
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter pincode',
          pattern: REGEX.PINCODE,
          patternMsg: 'Please enter valid pincode.'
        }
      },
      {
        name: 'current_city',
        label: 'City',
        type: 'text',
        disabled: true,
        identifier: IDENTIFIER.INPUTTEXT,
        defaultValue: '',
        condition: {
          type: 'showOnValue',
          baseOn: 'current_address_same_as_permanent',
          baseValue: 'No'
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter city',
        },
      },
      {
        name: 'current_state',
        label: 'State',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        disabled: true,
        defaultValue: '',
        condition: {
          type: 'showOnValue',
          baseOn: 'current_address_same_as_permanent',
          baseValue: 'No'
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter state',
        },
      },
      {
        name: 'current_address_proof_url',
        label: 'Current Address Proof Upload',
        type: 'file',
        identifier: IDENTIFIER.LIVEPHOTO,
        filePath: `${CUSTOMER?.name}/${CUSTOMER?.details?.currentAddressProof}`,
        validation: {
          isRequired: true,
          requiredMsg: 'Please upload address proof image',
        },
        condition: {
          type: 'showOnValue',
          baseOn: 'current_address_same_as_permanent',
          baseValue: 'No'
        },
      },
      {
        name: 'customer_image_url',
        label: 'Customer Live Photo Upload',
        type: 'file',
        identifier: IDENTIFIER.LIVEPHOTO,
        filePath: `${CUSTOMER?.name}/${CUSTOMER?.details?.customerPicture}`,
        validation: {
          isRequired: true,
          requiredMsg: 'Please upload customer live image',
        }
      },
    ],
    initDefaultValueHandlerDisabled: true,
    dynamicValidation: handleDynamicKYCValidation,
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
  kycDocumentStep
};
