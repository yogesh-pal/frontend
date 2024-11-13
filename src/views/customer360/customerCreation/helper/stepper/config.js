/* eslint-disable no-unused-vars */
import {
  AADHAARVERFICATIONMODE
} from '../constant';
import {
  REGEX,
} from '../../../../../constants';

const CONFIGCUSTOMER = (props) => {
  const {
    biometricComponent,
    aadhaarVerificationModeHandler,
    closeHandlerAadhaarVerificationHandler,
    biometricEnableHandler,
    CONFIGURATION,
    customerID,
    customerDetails,
  } = props;

  const { ocr } = CONFIGURATION;

  return {
    BIOMETRIC: {
      OPTIONS: [{
        value: AADHAARVERFICATIONMODE.BIOMETRIC,
        label: AADHAARVERFICATIONMODE.BIOMETRIC,
        disabled: true,
      }],
      ONCHANGE: {
        [AADHAARVERFICATIONMODE.BIOMETRIC]: {
          showField: [
            {
              name: 'aadharCardOffline',
              condition: 'isShow',
              value: false
            },
            {
              name: 'aadharCardOfflineocr',
              condition: 'isShow',
              value: false
            },
            {
              name: 'enterAadhaarOTP',
              condition: 'isShow',
              value: false
            }
          ],
          defaultValue: AADHAARVERFICATIONMODE.BIOMETRIC,
          disable: {
            value: true,
            disableFields: ['aadhaarStatus', 'first_name', 'middle_name', 'last_name', 'father_or_spouse_name', 'dob', 'address_1', 'address_2', 'pincode'],
          },
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
            }
          },
          resetFields: [
            'aadharCardOnline',
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
        }
      },
      INPUTCONFIG: {
        component: biometricComponent,
        onChangeHandler: aadhaarVerificationModeHandler,
        onCloseHandler: closeHandlerAadhaarVerificationHandler,
        biomerticSuccess: {
          setValueArr: [{
            name: 'aadharCardBiometric',
            apiKey: 'aadharCardBiometric'
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
          {
            apiKey: 'id_proof_name',
            name: 'id_proof_name'
          },
          {
            apiKey: 'address_proof_name',
            name: 'address_proof_name'
          },
          {
            apiKey: 'id_proof_number',
            name: 'id_proof_number'
          },
          {
            apiKey: 'address_proof_number',
            name: 'address_proof_number'
          },
          {
            apiKey: 'id_proof_url',
            name: 'id_proof_url'
          },
          {
            apiKey: 'address_proof_url',
            name: 'address_proof_url'
          },
          {
            apiKey: 'address_proof_same_id_proof',
            name: 'address_proof_same_id_proof'
          },
          ],
          showField: [{
            name: 'aadhaarStatus',
            condition: 'isShow',
            value: true
          }],
          disable: {
            value: true,
            disableOnValue: true,
            disableFields: ['id_proof_url', 'address_proof_url', 'address_proof_name', 'id_proof_name', 'first_name', 'aadhaar_verification_mode', 'aadharCardOnline', 'middle_name', 'last_name', 'father_or_spouse_name', 'dob', 'address_1', 'address_2', 'pincode', 'city', 'state'],
          },
          updateFieldDetails: [{
            name: 'id_proof_url',
            key: 'isPreview',
            value: 'pdf'
          }, {
            name: 'address_proof_url',
            key: 'isPreview',
            value: 'pdf'
          }, {
            name: 'address_proof_same_id_proof',
            key: 'disabled',
            value: true
          },
          {
            name: 'id_proof_url',
            key: 'disabled',
            value: true
          }
          ],
          validation: {
            id_proof_url: {
              isRequired: true,
              requiredMsg: 'Please enter your aadhaar number',
            },
            address_proof_url: {
              isRequired: true,
              requiredMsg: 'Please enter your aadhaar number'
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
        biomerticFail: {
          disableOption: [
            {
              name: 'aadhaar_verification_mode',
              value: AADHAARVERFICATIONMODE.OFFLINE,
              disabled: false
            }
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
            },
          },
        },
      },
      OTHERINPUTCONFIG: {
        aadharCardOffline: {
          SUCCESS: {
            disableOption: [
              {
                name: 'aadhaar_verification_mode',
                value: AADHAARVERFICATIONMODE.BIOMETRIC,
                disabled: true
              },
              {
                name: 'aadhaar_verification_mode',
                value: AADHAARVERFICATIONMODE.OFFLINE,
                disabled: true
              }
            ]
          },
          FAILED: {
          }
        },
        aadharCardOnline: {
          SUCCESS: {
          },
          FAILED: {
            disableOption: [
              {
                name: 'aadhaar_verification_mode',
                value: AADHAARVERFICATIONMODE.BIOMETRIC,
                disabled: false
              }
            ]
          }
        },
        enterAadhaarOTP: {
          SUCCESS: {
            disableOption: [
              {
                name: 'aadhaar_verification_mode',
                value: AADHAARVERFICATIONMODE.BIOMETRIC,
                disabled: true
              }
            ]
          },
          FAILED: {
            disableOption: [
              {
                name: 'aadhaar_verification_mode',
                value: AADHAARVERFICATIONMODE.BIOMETRIC,
                disabled: false
              },
            ]
          }
        }
      }
    },
    NONBIOMETRIC: {
      OPTIONS: [],
      ONCHANGE: {},
      INPUTCONFIG: {},
      OTHERINPUTCONFIG: {
        aadharCardOffline: {
          SUCCESS: {
            disableOption: [
              {
                name: 'aadhaar_verification_mode',
                value: AADHAARVERFICATIONMODE.OFFLINE,
                disabled: true
              }
            ]
          },
          FAILED: {
          }
        },
        aadharCardOnline: {
          SUCCESS: {
          },
          FAILED: {
            disableOption: [
              {
                name: 'aadhaar_verification_mode',
                value: AADHAARVERFICATIONMODE.OFFLINE,
                disabled: false
              }
            ]
          }
        },
        enterAadhaarOTP: {
          SUCCESS: {
            disableOption: [
            ]
          },
          FAILED: {
            disableOption: [
              {
                name: 'aadhaar_verification_mode',
                value: AADHAARVERFICATIONMODE.OFFLINE,
                disabled: false
              },
            ]
          }
        }
      }
    },
    OFFLINEMODE: {
      OPTIONS: [
        {
          value: AADHAARVERFICATIONMODE.OFFLINE,
          label: AADHAARVERFICATIONMODE.OFFLINE,
          disabled: true
        }
      ],
      ONCHANGE: {
        [AADHAARVERFICATIONMODE.OFFLINE]: {
          validation: {
            father_or_spouse_name: {
              validation: {
                pattern: REGEX.SPACESTARTEND,
                patternMsg: 'Please enter valid customer father/spouse Name.',
                maxLength: 150,
                maxLenMsg: 'Father/Spouse Name should not more than 150 characters.',
              }
            },
            aadharCardOnline: {
              validation: {
                isRequired: true,
                requiredMsg: 'Please enter your aadhaar number',
                pattern: REGEX.AADHAAR,
                patternMsg: 'Please enter valid aadhaar number.'
              }
            }
          },
          defaultValue: AADHAARVERFICATIONMODE.OFFLINE,
          showField: [{
            name: 'enterAadhaarOTP',
            condition: 'isShow',
            value: false
          },
          {
            name: ocr ? 'aadharCardOfflineocr' : 'aadharCardOffline',
            condition: 'isShow',
            value: true
          },
          ],
          disable: {
            value: !!customerID || ocr,
            disableFields: customerDetails ? [
              'aadhaarStatus',
              'first_name',
              'middle_name',
              'last_name',
              'father_or_spouse_name',
              'dob',
              'address_1',
              'address_2'
            ] : [
              ocr ? 'aadharCardOfflineocr' : 'aadharCardOffline',
              'aadharCardOnline',
              'aadhaarStatus',
              'first_name',
              'middle_name',
              'last_name',
              'father_or_spouse_name',
              'dob',
              'address_1',
              'address_2',
              'enterAadhaarOTP'
            ],
          },
          resetFields: [
            !ocr ? 'aadharCardOfflineocr' : 'aadharCardOffline',
            'aadharCardOnline',
            'aadharCardBiometric',
            'aadhaarStatus',
            'first_name',
            'middle_name',
            'last_name',
            'father_or_spouse_name',
            'dob',
            'address_1',
            'address_2',
            'city',
            'state',
            'enterAadhaarOTP'
          ],
        },
      }
    },
    OFFLINEMODEDISABLED: {
      OPTIONS: [],
      ONCHANGE: {},
    }
  };
};

export {
  CONFIGCUSTOMER
};
