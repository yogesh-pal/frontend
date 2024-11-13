/* eslint-disable no-unused-vars */
import { cloneDeep } from 'lodash';
import {
  FUNCTION_IDENTIFIER,
  IDENTIFIER,
  REGEX,
  MODULE
} from '../../../../../constants';
import {
  AADHAARVERFICATIONMODE, ADDRESS_PROOF_NAME_LIST, ID_PROOF_LIST, ID_PROOF_NAMELIST_WITHOUT_PAN
} from '../../../customerCreation/helper/constant';
import { CONFIGCUSTOMER } from '../../../customerCreation/helper/stepper/config';

const rekycDocumentStep = (props) => {
  const {
    userDetails,
    isPanMandatory,
    onChangeKycHandler,
    panVerificationHandler,
    nextHandler,
    preFillIfExists,
    pincodeVerificationHandler,
    onSaveClickHandlerAddress,
    CONFIGURATION,
    biometricComponent,
    aadhaarVerificationModeHandler,
    closeHandlerAadhaarVerificationHandler,
    biometricEnableHandler,
    aadhaarCardOtpHandler,
    aadhaarOTPVerificationHandler,
    idProofListHandler,
	  onSaveClickHandlerID,
	  onDeleteHandlerId,
	  resetFormValues,
    handleDynamicKYCValidation
  } = props;
  const setRunonchange = (formInput, name, setFormData) => {
    const isNeed = formInput?.input?.filter((item) => {
      if (['id_proof_name', 'address_proof_name', 'address_proof_same_id_proof'].includes(item.name)) {
        if (item.hasOwnProperty('runonChange') && item.runonChange === false) {
          return true;
        }
      }
      return false;
    });
    let newFormInput = null;
    if (isNeed.length > 0 && name === 'customer_image_url') {
      newFormInput = formInput.input.map((item) => {
        if (item.name === 'id_proof_name' && item.hasOwnProperty('runonChange')) {
          item.runonChange = true;
        }
        if (item.name === 'address_proof_name' && item.hasOwnProperty('runonChange')) {
          item.runonChange = true;
        }
        if (item.name === 'address_proof_same_id_proof' && item.hasOwnProperty('runonChange')) {
          item.runonChange = true;
        }
        return item;
      });
      if (newFormInput) setFormData(newFormInput);
      return newFormInput;
    }
  };

  const { CUSTOMER } = MODULE;

  const { biometric } = CONFIGURATION;
  const { BIOMETRIC, NONBIOMETRIC } = CONFIGCUSTOMER({
    biometricComponent,
    aadhaarVerificationModeHandler,
    closeHandlerAadhaarVerificationHandler,
    biometricEnableHandler,
    CONFIGURATION
  });

  const BIODETAILS = {
    OPTION: biometric ? BIOMETRIC.OPTIONS : NONBIOMETRIC.OPTIONS,
    ONCHANGE: biometric ? BIOMETRIC.ONCHANGE : NONBIOMETRIC.ONCHANGE,
    INPUTCONFIG: biometric ? BIOMETRIC.INPUTCONFIG : NONBIOMETRIC.INPUTCONFIG,
    OTHERINPUTCONFIG: biometric ? BIOMETRIC.OTHERINPUTCONFIG : NONBIOMETRIC.OTHERINPUTCONFIG
  };

  const rekycBIOdetailsHandler = (biodetailshandler) => {
    if (biometric) {
      biodetailshandler[AADHAARVERFICATIONMODE.BIOMETRIC].resetFields = [];
      biodetailshandler[AADHAARVERFICATIONMODE.BIOMETRIC].validation = {};
    }
    return biodetailshandler;
  };

  const rekycInputconfighandler = (inputconfig) => {
    if (biometric) {
      inputconfig.biomerticSuccess.disable = [{
        value: true,
        disableOnValue: true,
        disableFields: ['pincode', 'city', 'state', 'aadharCardOnline'],
      }];
      inputconfig.biomerticSuccess.setValueArr = [{
        value: 'VALID',
        name: 'aadhaarStatus'
      }, {
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
      }, {
        apiKey: 'first_name',
        name: 'rekyc_first_name'
      },
      {
        apiKey: 'middle_name',
        name: 'rekyc_middle_name'
      },
      {
        apiKey: 'last_name',
        name: 'rekyc_last_name'
      },
      {
        apiKey: 'id_proof_name',
        name: 'id_proof_name'
      },
      {
        apiKey: 'id_proof_url',
        name: 'id_proof_url'
      },
      {
        apiKey: 'id_proof_name',
        name: 'address_proof_name'
      },
      {
        apiKey: 'address_proof_url',
        name: 'address_proof_url'
      },
      {
        apiKey: 'id_proof_number',
        name: 'address_proof_number'
      },
      {
        apiKey: 'id_proof_number',
        name: 'id_proof_number'
      },
      ];
      inputconfig.biomerticFail = {
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
        status: false,
        validation: {
          aadharCardOnline: {
            isRequired: true,
            requiredMsg: 'Please enter your aadhaar number',
          },
        },
      };
    }
    return inputconfig;
  };

  let count = 0;

  return {
    title: 'KYC Documents',
    variant: 'outlined',
    input: [
      {
        name: 'ckyc',
        label: 'CKYC',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        InputProps: true,
        readOnly: true,
        disabled: true,
        defaultValue: ' '
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

        ],
        onChange: {
          [AADHAARVERFICATIONMODE.ONLINE]: {
            showField: [{
              name: 'enterAadhaarOTP',
              condition: 'isShow',
              value: false
            },
            ],
            defaultValue: AADHAARVERFICATIONMODE.ONLINE,
            disable: {
              value: true,
              disableFields: ['aadhaarStatus', 'first_name', 'middle_name', 'last_name', 'dob', 'address_1', 'address_2', 'pincode'],
            },
          },
          ...rekycBIOdetailsHandler(BIODETAILS.ONCHANGE)
        },
        ...rekycInputconfighandler(BIODETAILS.INPUTCONFIG),
        inline: true,
        validation: {
          isRequired: true,
          requiredMsg: 'Please select aadhaar card verfication type.',
        }
      },
      {
        name: 'aadharCardOnline',
        label: 'Aadhaar Card Number',
        type: 'text',
        identifier: IDENTIFIER.INPUTBUTTONOTP,
        onlytextinputDisabled: true,
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
        name: 'enterAadhaarOTP',
        label: 'Enter Aadhaar OTP',
        type: 'text',
        identifier: IDENTIFIER.INPUTOTP,
        show: 'initial',
        function: aadhaarOTPVerificationHandler,
        apiBody: ['enterAadhaarOTP', 'aadharCardOnline', 'aadhaar_verification_mode'],
        status: false,
        rekyc_addhar: {
          resetFields: ['id_proof_name',
            'id_proof_url',
            'id_proof_number',
            'id_proof_remarks',
            'id_proof_osv_done',
            'address_proof_name',
            'address_proof_url',
            'address_proof_number',
            'address_proof_remarks',
            'address_proof_osv_done',
            'address_proof_same_id_proof'
          ],
          disable: {
            value: false,
            disableFields: ['id_proof_name',
              'id_proof_url',
              'id_proof_number',
              'id_proof_remarks',
              'id_proof_osv_done',
              'address_proof_name',
              'address_proof_url',
              'address_proof_number',
              'address_proof_remarks',
              'address_proof_osv_done',
              'address_proof_same_id_proof'
            ]
          },
          updateFieldDetails: [{
            name: 'id_proof_name',
            key: 'runonChange',
            value: true
          }, {
            name: 'address_proof_name',
            key: 'runonChange',
            value: true
          }, {
            name: 'address_proof_same_id_proof',
            key: 'runonChange',
            value: true
          }]
        },
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
            name: 'rekyc_first_name'
          },
          {
            apiKey: 'middle_name',
            name: 'rekyc_middle_name'
          },
          {
            apiKey: 'last_name',
            name: 'rekyc_last_name'
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
            disableFields: ['pincode', 'aadharCardOnline'],
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
            disableFields: ['first_name', 'middle_name', 'last_name', 'dob', 'address_1', 'address_2'],
          },
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
        name: 'aadhaar_osv_done',
        label: 'Aadhaar OSV Done',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        defaultValue: ' ',
        InputProps: true,
        readOnly: true,
        disabled: true,
        condition: {
          type: 'showOnValue',
          baseOn: 'aadhaar_verification_mode',
          baseValue: 'Offline'
        },
      },
      {
        name: 'first_name',
        label: 'First Name',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        InputProps: true,
        readOnly: true,
        disabled: true,
        defaultValue: ' ',
      },
      {
        name: 'middle_name',
        label: 'Middle Name',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        InputProps: true,
        readOnly: true,
        disabled: true,
        defaultValue: ' ',
      },
      {
        name: 'last_name',
        label: 'Last Name',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        InputProps: true,
        readOnly: true,
        disabled: true,
        defaultValue: ' ',
      },
      {
        name: 'rekyc_first_name',
        label: 'First Name',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        InputProps: true,
        readOnly: true,
        disabled: true,
        defaultValue: ' ',
        condition: {
          type: 'visible',
          isShow: false
        },
      },
      {
        name: 'rekyc_middle_name',
        label: 'Middle Name',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        InputProps: true,
        readOnly: true,
        disabled: true,
        defaultValue: ' ',
        condition: {
          type: 'visible',
          isShow: false
        },
      },
      {
        name: 'rekyc_last_name',
        label: 'Last Name',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        InputProps: true,
        readOnly: true,
        disabled: true,
        defaultValue: ' ',
        condition: {
          type: 'visible',
          isShow: false
        },
      },
      {
        name: 'father_or_spouse_name',
        label: 'Father/Spouse Name',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        InputProps: true,
        readOnly: true,
        disabled: true,
        defaultValue: ' ',
      },
      {
        name: 'dob',
        label: 'DOB',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        InputProps: true,
        readOnly: true,
        disabled: true,
        defaultValue: ' ',
      },
      {
        name: 'address_1',
        label: 'Address 1',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        InputProps: true,
        readOnly: true,
        disabled: true,
        defaultValue: ' ',
      },
      {
        name: 'address_2',
        label: 'Address 2',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        InputProps: true,
        readOnly: true,
        disabled: true,
        defaultValue: ' ',
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
        defaultValue: '',
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
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter city',
        },
        disabled: true,
        identifier: IDENTIFIER.INPUTTEXT,
        defaultValue: ' ',
      },
      {
        name: 'state',
        label: 'State',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter state',
        },
        disabled: true,
        defaultValue: ' ',
      },
      {
        name: 'landmark',
        label: 'Landmark',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        InputProps: true,
        readOnly: true,
        disabled: true,
        defaultValue: ' ',
      },
      {
        name: 'update_pan_details',
        label: 'Update Pan Details',
        type: 'text',
        identifier: IDENTIFIER.RADIO,
        option: ['Yes', 'No'],
        disabled: isPanMandatory(),
        onChange: {
          No: {
            defaultValue: 'No',
            showField: [{
              name: 'pan_customer_name',
              condition: 'isShow',
              value: false
            }],
            disable: {
              value: true,
              disableFields: ['pan_no'],
            },
            resetFields: ['pan_customer_name', 'pan_no', 'pan_status', 'pan_url_edit'],
            unregisterFields: [
              'pan_url_edit'
            ],
          },
          Yes: {
            defaultValue: 'Yes',
            showField: [{
              name: 'pan_customer_name',
              condition: 'isShow',
              value: true
            },
            ],
            disable: {
              value: false,
              disableFields: ['pan_no'],
            },
            resetFields: ['pan_customer_name'],
          }
        },
        inline: true,
        defaultValue: isPanMandatory() ? 'Yes' : 'No',
        validation: {
          isRequired: true,
          requiredMsg: 'Please select any of the above options',
        },
      },
      {
        name: 'pan_no',
        label: 'Pan Number',
        type: 'text',
        isUpperCase: true,
        identifier: IDENTIFIER.INPUTTEXT,
        defaultValue: ' ',
        InputProps: true,
        readOnly: false,
        disabled: true,
        functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE_SETTER,
        functionChangeBaseOn: 'pan_no',
        condition: {
          type: 'visible,showOnValue',
          isShow: true,
          baseOn: 'update_pan_details',
          baseValue: 'Yes'
        },
        customFunction: (value, callback) => {
          if (count > 0 && value.pan_no.match(REGEX.PANCARD)) {
            panVerificationHandler(value, callback, ['pan_no']);
          } else {
            count = 1;
          }
        },
        setValueArr: [
          {
            apiKey: 'full_name',
            name: 'pan_customer_name'
          },
          {
            apiKey: 'status',
            name: 'pan_status'
          }
        ],
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter pan number',
          pattern: REGEX.PANCARD,
          patternMsg: 'Please enter valid pan number.',
          maxLength: 10,
          maxLenMsg: 'PAN card number should not more than 10 characters.',
        },
      },
      {
        name: 'org_pan_no',
        label: 'Pan Number',
        type: 'text',
        isUpperCase: true,
        identifier: IDENTIFIER.INPUTTEXT,
        defaultValue: ' ',
        InputProps: true,
        readOnly: false,
        disabled: true,
        condition: {
          type: 'visible,showOnValue',
          isShow: true,
          baseOn: 'update_pan_details',
          baseValue: 'No'
        },
        validation: {
          isRequired: false
        }
      },
      {
        name: 'org_pan_cust_name',
        label: 'Pan Customer Name',
        type: 'text',
        isUpperCase: true,
        identifier: IDENTIFIER.INPUTTEXT,
        defaultValue: ' ',
        InputProps: true,
        readOnly: false,
        disabled: true,
        condition: {
          type: 'visible,showOnValue',
          isShow: true,
          baseOn: 'update_pan_details',
          baseValue: 'No'
        },
        validation: {
          isRequired: false
        }
      },
      {
        name: 'pan_url_preview',
        label: 'Pan Card',
        type: 'file',
        defaultValue: ' ',
        InputProps: true,
        readOnly: !isPanMandatory(),
        disabled: !isPanMandatory(),
        identifier: IDENTIFIER.MULTIPLELIVEPHOTO,
        // disable: isPanMandatory(),
        condition: {
          type: 'visible,showOnValue',
          isShow: true,
          baseOn: 'update_pan_details',
          baseValue: 'No'
        },
      },
      {
        name: 'pan_customer_name',
        label: 'PAN Customer Name',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        disabled: true,
        defaultValue: '',
        condition: {
          type: 'visible,showOnValue',
          isShow: true,
          baseOn: 'update_pan_details',
          baseValue: 'Yes'
        },
      },
      {
        name: 'pan_status',
        label: 'PAN Status',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        disabled: true,
        defaultValue: ' ',
        onChange: {
          VALID: {
            disable: {
              value: true,
              disableFields: ['pan_no'],
            },
          }
        },
        condition: {
          type: 'visible,showOnValue',
          isShow: true,
          baseOn: 'update_pan_details',
          baseValue: 'Yes'
        },
      },
      {
        name: 'pan_url_edit',
        label: 'PAN Card',
        type: 'file',
        filePath: `${CUSTOMER?.name}/${CUSTOMER?.details?.panProof}`,
        identifier: IDENTIFIER.MULTIPLELIVEPHOTO,
        maxUploadCount: 1,
        isPreview: null,
        maxUploadMsg: 'Maximum 1 PAN Card image capture allowed.',
        condition: {
          type: 'visible,showOnValue',
          isShow: true,
          baseOn: 'update_pan_details',
          baseValue: 'Yes'
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please upload PAN Card image',
        }
      },
      {
        name: 'id_proof_name',
        label: 'ID Proof',
        type: 'select',
        defaultValue: '',
        identifier: IDENTIFIER.SELECT,
        disabled: true,
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
        runonChange: false,
        functionChangeBaseOn: 'enter_pan_details,id_proof_name',
        onChange: {
          // resetFields: ['address_proof_number', 'address_proof_name', 'address_proof_url',
          //   'address_proof_same_id_proof'],
          Passport: {
            resetFields: ['address_proof_number', 'address_proof_name', 'address_proof_url',
              'address_proof_same_id_proof'],
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
            resetFields: ['address_proof_number', 'address_proof_name', 'address_proof_url',
              'address_proof_same_id_proof'],
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
            resetFields: ['address_proof_number', 'address_proof_name', 'address_proof_url',
              'address_proof_same_id_proof'],
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
            resetFields: ['address_proof_number', 'address_proof_name', 'address_proof_url',
              'address_proof_same_id_proof'],
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
            resetFields: ['address_proof_number', 'address_proof_name', 'address_proof_url',
              'address_proof_same_id_proof'],
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
      {
        name: 'id_proof_url',
        label: 'ID Proof (Multiple Upload)',
        type: 'text',
        filePath: `${CUSTOMER?.name}/${CUSTOMER?.details?.idProofUrl}`,
        identifier: IDENTIFIER.MULTIPLELIVEPHOTOPREVIEW,
        enableMasking: false,
        disabled: true,
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
        defaultValue: '',
        identifier: IDENTIFIER.INPUTTEXT,
        disabled: true,
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
        disabled: true,
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
        disabled: true,
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
        runonChange: false,
        disabled: true,
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
        runonChange: false,
        defaultValue: '',
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
        // customFunction: addressOptionHandler,
        // functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE_SETTER,
        // functionChangeBaseOn: 'address_1',
        option: ADDRESS_PROOF_NAME_LIST,
        disabled: true,
        onChange: {
          // resetFields: ['address_proof_url'],
          Passport: {
            resetFields: ['address_proof_url'],
            disable: {
              value: false,
              disableFields: ['address_proof_number']
            },
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
            resetFields: ['address_proof_url'],
            disable: {
              value: false,
              disableFields: ['address_proof_number']
            },
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
            resetFields: ['address_proof_url'],
            disable: {
              value: false,
              disableFields: ['address_proof_number']
            },
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
            resetFields: ['address_proof_url'],
            disable: {
              value: true,
              disableFields: ['address_proof_number']
            },
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
                  // min: 2,
                  // minMsg: 'Please capture both the front and back sides of Aadhaar ID.'
                }
              }
            }
          },
          'Government Issued ID Card': {
            resetFields: ['address_proof_url'],
            disable: {
              value: false,
              disableFields: ['address_proof_number']
            },
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
          'Electricity Bill': {
            resetFields: ['address_proof_url'],
            disable: {
              value: false,
              disableFields: ['address_proof_number']
            },
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
          'Gas Bill': {
            resetFields: ['address_proof_url'],
            disable: {
              value: false,
              disableFields: ['address_proof_number']
            },
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
          'Postpaid Mobile Bill': {
            resetFields: ['address_proof_url'],
            disable: {
              value: false,
              disableFields: ['address_proof_number']
            },
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
          'Rent Agreement': {
            resetFields: ['address_proof_url'],
            disable: {
              value: false,
              disableFields: ['address_proof_number']
            },
            validation: {
              address_proof_number: {
                validation: {
                  isRequired: true,
                  requiredMsg: 'Please enter address proof number.',
                }
              },
              address_proof_url: {
                validation: {
                  isRequired: true,
                  requiredMsg: 'Please upload address proof image',
                  min: 2,
                  minMsg: 'Upload atleast two documents.'
                }
              }
            }
          }
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please select address proof status.',
        },
      },
      {
        name: 'address_proof_url',
        label: 'Address Proof (Multiple Upload)',
        type: 'text',
        filePath: `${CUSTOMER?.name}/${CUSTOMER?.details?.addressProof}`,
        identifier: IDENTIFIER.MULTIPLELIVEPHOTOPREVIEW,
        disabled: true,
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
        disabled: true,
        type: 'text',
        isUpperCase: true,
        defaultValue: '',
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
        disabled: true,
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
        disabled: true,
        identifier: IDENTIFIER.RADIO,
        option: ['Yes', 'No'],
        inline: true,
        validation: {
          isRequired: true,
          requiredMsg: 'Please select address proof OSV.'
        }
      },
      // {
      //   name: 'address_proof_name',
      //   label: 'Address Proof',
      //   type: 'text',
      //   identifier: IDENTIFIER.INPUTTEXT,
      //   defaultValue: ' ',
      //   InputProps: true,
      //   readOnly: true,
      //   disabled: true,
      // },
      // {
      //   name: 'address_proof_url',
      //   label: 'Address Proof Upload',
      //   type: 'file',
      //   identifier: IDENTIFIER.MULTIPLELIVEPHOTO,
      //   disable: true,
      //   defaultValue: ' ',
      //   InputProps: true,
      //   readOnly: true,
      //   disabled: true,
      // },
      // {
      //   name: 'address_proof_number',
      //   label: 'Address Proof ID Number',
      //   type: 'text',
      //   identifier: IDENTIFIER.INPUTTEXT,
      //   defaultValue: ' ',
      //   InputProps: true,
      //   readOnly: true,
      //   disabled: true,
      // },
      // {
      //   name: 'address_proof_remarks',
      //   label: 'Address Proof remarks',
      //   type: 'text',
      //   identifier: IDENTIFIER.INPUTTEXT,
      //   defaultValue: ' ',
      //   InputProps: true,
      //   readOnly: true,
      //   disabled: true,
      // },
      // {
      //   name: 'address_proof_osv_done',
      //   label: 'Address Proof OSV Done',
      //   type: 'text',
      //   identifier: IDENTIFIER.INPUTTEXT,
      //   defaultValue: ' ',
      //   InputProps: true,
      //   readOnly: true,
      //   disabled: true,
      // },
      {
        name: 'current_address_same_as_permanent',
        label: 'Current Address Same as Permanent Address',
        type: 'text',
        defaultValue: ' ',
        identifier: IDENTIFIER.RADIO,
        option: ['Yes', 'No'],
        inline: true,
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
        defaultValue: ' ',
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
        defaultValue: ' ',
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
        defaultValue: '',
        apiCallValidation: {
          pattern: REGEX.PINCODE,
        },
        functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE_SETTER,
        functionChangeBaseOn: 'current_pincode',
        customFunction: (value, callback) => pincodeVerificationHandler(value, callback, ['current_pincode']),
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
        defaultValue: ' ',
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
        defaultValue: ' ',
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
        defaultValue: ' ',
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
        disable: true,
        defaultValue: ' ',
        InputProps: true,
        readOnly: true,
        disabled: true,
      },
    ],
    dynamicValidation: handleDynamicKYCValidation,
    nextValidate: nextHandler,
    runonChangeSetter: setRunonchange,
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

export { rekycDocumentStep };
