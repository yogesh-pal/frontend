import {
  FUNCTION_IDENTIFIER,
  IDENTIFIER,
  REGEX,
  MODULE
} from '../../../../../constants';

const kycDocumentStep = (props) => {
  const {
    panVerificationHandler,
    pincodeVerificationHandler,
  } = props;

  const { CUSTOMER } = MODULE;

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
        label: 'Aadhaar Verification',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        defaultValue: ' ',
        InputProps: true,
        readOnly: true,
        disabled: true,
      },
      {
        name: 'aadhaar_no',
        label: 'Aadhaar Card Number',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        defaultValue: ' ',
        InputProps: true,
        readOnly: true,
        disabled: true,
      },
      {
        name: 'ocr_image_url',
        label: 'Aadhaar(Multiple Upload)',
        type: 'file',
        identifier: IDENTIFIER.MULTIPLELIVEPHOTOPREVIEW,
        defaultValue: ' ',
        disabled: true,
        condition: {
          type: 'showOnValue',
          baseOn: 'aadhaar_verification_mode',
          baseValue: 'Offline'
        },
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
        InputProps: true,
        readOnly: true,
        disabled: true,
        defaultValue: ' ',
      },
      {
        name: 'city',
        label: 'City',
        type: 'text',
        InputProps: true,
        readOnly: true,
        disabled: true,
        identifier: IDENTIFIER.INPUTTEXT,
        defaultValue: ' ',
      },
      {
        name: 'state',
        label: 'State',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        InputProps: true,
        readOnly: true,
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
        defaultValue: 'No',
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
        readOnly: true,
        disabled: true,
        identifier: IDENTIFIER.MULTIPLELIVEPHOTO,
        disable: true,
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
        type: 'text',
        defaultValue: ' ',
        InputProps: true,
        readOnly: true,
        disabled: true,
        identifier: IDENTIFIER.INPUTTEXT
      },
      {
        name: 'id_proof_url',
        label: 'ID Proof Upload',
        type: 'text',
        defaultValue: ' ',
        InputProps: true,
        readOnly: true,
        disabled: true,
        identifier: IDENTIFIER.MULTIPLELIVEPHOTOPREVIEW,
        disable: true,
      },
      {
        name: 'id_proof_number',
        label: 'ID Proof Number',
        type: 'text',
        defaultValue: ' ',
        InputProps: true,
        readOnly: true,
        disabled: true,
        identifier: IDENTIFIER.INPUTTEXT,
      },
      {
        name: 'id_proof_remarks',
        label: 'ID Proof remarks',
        type: 'text',
        defaultValue: ' ',
        InputProps: true,
        readOnly: true,
        disabled: true,
        identifier: IDENTIFIER.INPUTTEXT,
      },
      {
        name: 'id_proof_osv_done',
        label: 'ID Proof OSV Done',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        defaultValue: ' ',
        InputProps: true,
        readOnly: true,
        disabled: true,
      },
      {
        name: 'address_proof_name',
        label: 'Address Proof',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        defaultValue: ' ',
        InputProps: true,
        readOnly: true,
        disabled: true,
      },
      {
        name: 'address_proof_url',
        label: 'Address Proof Upload',
        type: 'text',
        identifier: IDENTIFIER.MULTIPLELIVEPHOTOPREVIEW,
        disable: true,
        defaultValue: ' ',
        InputProps: true,
        readOnly: true,
        disabled: true,
      },
      {
        name: 'address_proof_number',
        label: 'Address Proof ID Number',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        defaultValue: ' ',
        InputProps: true,
        readOnly: true,
        disabled: true,
      },
      {
        name: 'address_proof_remarks',
        label: 'Address Proof remarks',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        defaultValue: ' ',
        InputProps: true,
        readOnly: true,
        disabled: true,
      },
      {
        name: 'address_proof_osv_done',
        label: 'Address Proof OSV Done',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT,
        defaultValue: ' ',
        InputProps: true,
        readOnly: true,
        disabled: true,
      },
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

export { kycDocumentStep };
