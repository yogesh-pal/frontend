/* eslint-disable max-len */
import moment from 'moment';
import { cloneDeep } from 'lodash';
import {
  IDENTIFIER,
} from '../../../../constants';

export const formJsonDetails = (userDetails) => {
  const formConfiguration = {
    form: [
      {
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
            defaultValue: ' ',
            disabled: true,
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
            name: 'pan_no',
            label: 'Pan Number',
            type: 'text',
            isUpperCase: true,
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
          },
          {
            name: 'pan_customer_name',
            label: 'PAN Customer Name',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true
          },
          {
            name: 'pan_url',
            label: 'Pan Card',
            type: 'file',
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            identifier: IDENTIFIER.MULTIPLELIVEPHOTO,
            disable: true,
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
            identifier: IDENTIFIER.MULTIPLELIVEPHOTOPREVIEW,
            disabled: true,
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
            disabled: true,
            readOnly: true,
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
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
          },
          {
            name: 'current_address_1',
            label: 'Address 1',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
            condition: {
              type: 'showOnValue',
              baseOn: 'current_address_same_as_permanent',
              baseValue: 'No'
            },
          },
          {
            name: 'current_address_2',
            label: 'Address 2',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
            condition: {
              type: 'showOnValue',
              baseOn: 'current_address_same_as_permanent',
              baseValue: 'No'
            },
          },
          {
            name: 'current_pincode',
            label: 'Pincode',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
            condition: {
              type: 'showOnValue',
              baseOn: 'current_address_same_as_permanent',
              baseValue: 'No'
            },
          },
          {
            name: 'current_city',
            label: 'City',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
            condition: {
              type: 'showOnValue',
              baseOn: 'current_address_same_as_permanent',
              baseValue: 'No'
            },
          },
          {
            name: 'current_state',
            label: 'State',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            InputProps: true,
            readOnly: true,
            disabled: true,
            defaultValue: ' ',
            condition: {
              type: 'showOnValue',
              baseOn: 'current_address_same_as_permanent',
              baseValue: 'No'
            },
          },
          {
            name: 'current_address_proof_url',
            label: 'Current Address Proof Upload',
            type: 'file',
            identifier: IDENTIFIER.LIVEPHOTO,
            defaultValue: ' ',
            disable: true,
            disabled: true,
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
      },
      {
        title: 'Personal Information',
        variant: 'outlined',
        input: [
          {
            name: 'no_years_current_residence',
            label: 'Number of years in current residence',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
          },
          {
            name: 'education',
            label: 'Education',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
          },
          {
            name: 'primary_mobile_number',
            label: 'Primary Contact Number',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
          },
          {
            name: 'secondary_mobile_number',
            label: 'Secondary Contact Number',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
          },
          {
            name: 'email_id',
            label: 'Email ID',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
          },
          {
            name: 'marital_status',
            label: 'Marital Status',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
          },
          {
            name: 'gender',
            label: 'Gender',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
          },
          {
            name: 'religion',
            label: 'Religion',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true
          },
          {
            name: 'mother_name',
            label: 'Mother\'s Name',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true
          },
          {
            name: 'social_status',
            label: 'Social Status',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true
          },
          {
            name: 'father_name',
            label: 'Father\'s Name',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true
          },
          {
            name: 'place_of_birth',
            label: 'Place of Birth',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            InputProps: true,
            defaultValue: ' ',
            readOnly: true,
            disabled: true
          }
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
      },
      {
        title: 'Employment Information',
        variant: 'outlined',
        input: [
          {
            name: 'customer_occupation',
            label: 'Customer Occupation',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
          },
          {
            name: 'annual_income',
            label: 'Annual Income',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
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
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
            condition: {
              type: 'multiShowOnValue',
              baseOn: 'customer_occupation',
              baseValue: ['Self Employed', 'Agriculturist'],
            },
          },
          {
            name: 'psl_category',
            label: 'PSL Category',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
            condition: {
              type: 'showOnValue',
              baseOn: 'psl_status',
              baseValue: 'Yes',
            },
          },
          {
            name: 'is_gst_applicable',
            label: 'Is GST Applicable for Customer?',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true
          },
          {
            name: 'customer_gst_number',
            label: 'Customer GST Number',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
            condition: {
              type: 'showOnValue',
              baseOn: 'is_gst_applicable',
              baseValue: 'Yes',
            },
          },
          {
            name: 'udyam_registration_number',
            label: 'Udyam Registration Number',
            disabled: true,
            identifier: IDENTIFIER.INPUTTEXT,
          },
          {
            name: 'udyam_mobile_number',
            label: 'Udyam Mobile Number',
            disabled: true,
            identifier: IDENTIFIER.INPUTTEXT,
            condition: {
              type: 'visible',
              isShow: userDetails?.udyam_data?.mode === 'Online'
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
            disable: true
          },
          {
            name: 'udyam_certificate',
            label: 'Udyam Certificate',
            identifier: IDENTIFIER.PDFFILEVIEWER,
            condition: {
              type: 'visible',
              isShow: userDetails?.udyam_data?.mode === 'Online'
            }
          }
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
      },
      {
        title: 'Occupation Address',
        variant: 'outlined',
        input: [
          {
            name: 'occupation_address',
            label: 'Occupation Address',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
          },
          {
            name: 'occupation_address_1',
            label: 'Address 1',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
            condition: {
              type: 'showOnValue',
              baseOn: 'occupation_address',
              baseValue: 'Yes',
            },
          },
          {
            name: 'occupation_address_2',
            label: 'Address 2',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
            condition: {
              type: 'showOnValue',
              baseOn: 'occupation_address',
              baseValue: 'Yes',
            },
          },
          {
            name: 'occupation_pincode',
            label: 'Pincode',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
            condition: {
              type: 'showOnValue',
              baseOn: 'occupation_address',
              baseValue: 'Yes',
            },
          },
          {
            name: 'occupation_city',
            label: 'City',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            InputProps: true,
            readOnly: true,
            disabled: true,
            defaultValue: ' ',
            condition: {
              type: 'showOnValue',
              baseOn: 'occupation_address',
              baseValue: 'Yes',
            },
          },
          {
            name: 'occupation_state',
            label: 'State',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            InputProps: true,
            readOnly: true,
            disabled: true,
            defaultValue: ' ',
            condition: {
              type: 'showOnValue',
              baseOn: 'occupation_address',
              baseValue: 'Yes',
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
      },
      {
        title: 'Customer & Nominee Details',
        variant: 'outlined',
        input: [
          {
            name: 'nominee_relationship',
            label: 'Nominee Relationship',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
          },
          {
            name: 'nominee_other_relation',
            label: 'Other Relation',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
            condition: {
              type: 'showOnValue',
              baseOn: 'nominee_relationship',
              baseValue: 'Other'
            },
          },
          {
            name: 'nominee_name',
            label: 'Nominee Name',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
          },
          {
            name: 'nominee_dob',
            label: 'Nominee Date of Birth',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
          },
          {
            name: 'nominee_mobile',
            label: 'Nominee Mobile Number',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
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
      },
      {
        title: 'Relationship Manager',
        variant: 'outlined',
        input: [
          {
            name: 'rm_name',
            label: 'RM Name',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
          },
          {
            name: 'rm_code',
            label: 'RM Employee Code',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
          },
          {
            name: 'rm_mobile_number',
            label: 'RM Mobile Number',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            InputProps: true,
            readOnly: true,
            disabled: true,
            defaultValue: ' ',
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
      },
      {
        title: 'Bank Details',
        variant: 'outlined',
        input: [
          {
            name: 'enter_bank_details',
            label: 'Enter Bank Details',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
          },
          {
            name: 'upi_ifsc',
            label: 'IFSC',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: '',
            disabled: true,
            condition: {
              type: 'visible',
              isShow: false
            },
          },
          {
            name: 'upi_bank_name',
            label: 'Bank Name',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: '',
            disabled: true,
            condition: {
              type: 'visible',
              isShow: false
            },
          },
          {
            name: 'upi_branch_name',
            label: 'Branch Name',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: '',
            disabled: true,
            condition: {
              type: 'visible',
              isShow: false
            },
          },
          {
            name: 'upi_account_number',
            label: 'Bank Account Number',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: '',
            disabled: true,
            condition: {
              type: 'visible',
              isShow: false
            },
          },
          {
            name: 'confirmed_with_customer',
            label: 'Confirmed with customer',
            type: 'text',
            identifier: IDENTIFIER.RADIO,
            option: ['Yes', 'No'],
            inline: true,
            disabled: true,
            defaultValue: 'Yes',
            condition: {
              type: 'visible',
              isShow: false
            },
          },
          {
            name: 'ifsc',
            label: 'IFSC',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
            condition: {
              type: 'visible',
              isShow: false
            },
          },
          {
            name: 'bank_name',
            label: 'Bank Name',
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
            name: 'branch_name',
            label: 'Branch Name',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
            condition: {
              type: 'visible',
              isShow: false
            },
          },
          {
            name: 'account_number',
            label: 'Bank Account Number',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
            condition: {
              type: 'visible',
              isShow: false
            },
          },
          {
            name: 'beneficiary_name',
            label: 'Beneficiary Name',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
            condition: {
              type: 'visible',
              isShow: false
            },
          },
          {
            name: 'bankAccountVerificationStatus',
            label: 'Bank Account Verification Status',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
            condition: {
              type: 'visible',
              isShow: false
            }
          },
          {
            name: 'passbook_cheque_url',
            label: 'Upload Cheque/Passbook',
            type: 'file',
            identifier: IDENTIFIER.LIVEPHOTO,
            disable: true,
            notUploaded: true,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
            condition: {
              type: 'showOnValue',
              baseOn: 'enter_bank_details',
              baseValue: 'Yes',
            },
            // condition: {
            //   type: 'showOnValue',
            //   baseOn: 'enter_bank_details',
            //   baseValue: 'Yes',
            // },
          },
          {
            name: 'proprietorship_proof',
            label: 'Upload Proprietorship Proof',
            type: 'file',
            identifier: IDENTIFIER.LIVEPHOTO,
            disable: true,
            notUploaded: true,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
            condition: {
              type: 'showOnValue',
              baseOn: 'enter_bank_details',
              baseValue: 'Yes',
            },
          },
          {
            name: 'proprietorship_proof',
            label: 'Upload Proprietorship Proof',
            type: 'file',
            identifier: IDENTIFIER.LIVEPHOTO,
            disable: true,
            notUploaded: true,
            defaultValue: ' ',
            InputProps: true,
            readOnly: true,
            disabled: true,
            condition: {
              type: 'showOnValue',
              baseOn: 'enter_bank_details',
              baseValue: 'Yes',
            },
          },
        ],
        alignment: {
          xs: 12,
          sm: 12,
          md: 6,
          lg: 6,
          xl: 6
        }
      },
    ],
    stepper: {
      steps: ['KYC Documents', 'Personal Information', 'Employment Information', 'Occupation Address', 'Nominee Details', 'Relationship Manager', 'Bank Details'],
      icons: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
      hide: ['xs', 'sm'],
      stepperDirection: 'horizontal',
    },
    dataFomat: 'SINGLE',
  };

  const tempForm = cloneDeep(formConfiguration);

  tempForm.form.forEach((item, index) => item.input
    .forEach((inputValue, inputIndex) => {
      if (['nominee_dob', 'dob'].includes(inputValue.name)) {
        tempForm.form[index].input[inputIndex].defaultValue = moment(userDetails[inputValue.name], 'DD-MM-YYYY').format('DD/MM/YYYY');
      // } else if (inputValue.name === 'bankAccountVerificationStatus') {
      //   tempForm.form[index].input[inputIndex].defaultValue = userDetails?.is_bank_verified ? 'VALID' : 'INVALID';
      } else if (inputValue.name === 'beneficiary_name') {
        tempForm.form[index].input[inputIndex].condition.isShow = userDetails.enter_bank_details === 'Yes';
        tempForm.form[index].input[inputIndex].defaultValue = userDetails[inputValue.name];
      } else if (inputValue.name === 'is_gst_applicable') {
        tempForm.form[index].input[inputIndex].defaultValue = userDetails[inputValue.name] ? 'Yes' : 'No';
      } else if ([
        'Qrcode',
        'upi_ifsc',
        'upi_bank_name',
        'upi_branch_name',
        'upi_account_number',
        'confirmed_with_customer',
        'ifsc',
        'bank_name',
        'branch_name',
        'account_number',
        'beneficiary_name',
        'bankAccountVerificationStatus',
        'passbook_cheque_url',
        'proprietorship_proof'
      ].includes(inputValue.name)) {
        if (userDetails.enter_bank_details === 'Yes') {
          if ([
            'ifsc',
            'bank_name',
            'branch_name',
            'account_number',
            'beneficiary_name',
            'passbook_cheque_url',
            'proprietorship_proof'
          ].includes(inputValue.name)) {
            tempForm.form[index].input[inputIndex].condition.isShow = true;
            tempForm.form[index].input[inputIndex].defaultValue = userDetails[inputValue.name];
          }

          if (['passbook_cheque_url', 'proprietorship_proof'].includes(inputValue.name) && userDetails?.is_bank_verified === false) {
            tempForm.form[index].input[inputIndex].condition.isShow = true;
            tempForm.form[index].input[inputIndex].defaultValue = userDetails[inputValue.name];
          }

          if (inputValue.name === 'bankAccountVerificationStatus') {
            tempForm.form[index].input[inputIndex].defaultValue = userDetails?.is_bank_verified ? 'VALID' : 'INVALID';
          }
          if ([
            'upi_ifsc',
            'upi_bank_name',
            'upi_branch_name',
            'upi_account_number',
            'confirmed_with_customer',
          ].includes(inputValue.name)) {
            tempForm.form[index].input[inputIndex].condition.isShow = false;
          }
        } else if (userDetails.enter_bank_details === 'UPI') {
          if (['passbook_cheque_url', 'proprietorship_proof'].includes(inputValue.name)) {
            tempForm.form[index].input[inputIndex].condition.isShow = false;
            tempForm.form[index].input[inputIndex].defaultValue = userDetails[inputValue.name];
          }

          if ([
            'ifsc',
            'bank_name',
            'branch_name',
            'account_number',
            'passbook_cheque_url',
            'proprietorship_proof'
          ].includes(inputValue.name)) {
            tempForm.form[index].input[inputIndex].condition.isShow = false;
          }
          if (inputValue.name === 'bankAccountVerificationStatus') {
            tempForm.form[index].input[inputIndex].defaultValue = userDetails?.is_bank_verified ? 'VALID' : 'INVALID';
          }
          if ([
            'upi_ifsc',
            'upi_bank_name',
            'upi_branch_name',
            'upi_account_number',
            'confirmed_with_customer',
            'beneficiary_name',
            'confirmed_with_customer',
          ].includes(inputValue.name)) {
            const mapping = {
              upi_ifsc: 'ifsc',
              upi_bank_name: 'bank_name',
              upi_branch_name: 'branch_name',
              upi_account_number: 'account_number',
              confirmed_with_customer: 'confirmed_with_customer',
              beneficiary_name: 'beneficiary_name',
            };
            if (inputValue.name === 'confirmed_with_customer' && userDetails?.is_bank_verified) {
              tempForm.form[index].input[inputIndex].defaultValue = 'Yes';
            } else {
              tempForm.form[index].input[inputIndex].defaultValue = userDetails[mapping[inputValue.name]];
            }

            tempForm.form[index].input[inputIndex].condition.isShow = true;
          }
        } else {
          console.log('NO case hit');
        }
      } else {
        if (['id_proof_url', 'address_proof_url'].includes(inputValue.name)) {
          if (userDetails[inputValue.name]?.length) {
            const pathPreview = Array.isArray(userDetails[inputValue.name]) ? userDetails[inputValue.name]?.[0].split('.') : userDetails[inputValue.name].split('.');
            tempForm.form[index].input[inputIndex].isPreview = pathPreview[pathPreview.length - 1];
          }
        }
        if (inputValue.name === 'ocr_image_url' && userDetails[inputValue.name] && userDetails[inputValue.name]?.length) {
          tempForm.form[index].input[inputIndex].defaultValue = {
            aadhaarFront: userDetails[inputValue.name][0],
            aadhaarBack: userDetails[inputValue.name][1]
          };
        } else if (inputValue.name === 'id_proof_url' && userDetails[inputValue.name] && userDetails[inputValue.name]?.length) {
          if (Array.isArray(userDetails[inputValue.name])) {
            if (userDetails[inputValue.name].length === 2) {
              tempForm.form[index].input[inputIndex].defaultValue = {
                'ID Proof Front': userDetails[inputValue.name][0],
                'ID Proof Back': userDetails[inputValue.name][1]
              };
            } else {
              tempForm.form[index].input[inputIndex].defaultValue = {
                'ID Proof': userDetails[inputValue.name][0],
              };
            }
          } else {
            tempForm.form[index].input[inputIndex].defaultValue = {
              'ID Proof': userDetails[inputValue.name],
            };
          }
        } else if (inputValue.name === 'address_proof_url' && userDetails[inputValue.name] && userDetails[inputValue.name]?.length) {
          if (Array.isArray(userDetails[inputValue.name])) {
            if (userDetails[inputValue.name].length === 2) {
              tempForm.form[index].input[inputIndex].defaultValue = {
                'Address Proof Front': userDetails[inputValue.name][0],
                'Address Proof Back': userDetails[inputValue.name][1]
              };
            } else {
              tempForm.form[index].input[inputIndex].defaultValue = {
                'Address Proof': userDetails[inputValue.name][0],
              };
            }
          } else {
            tempForm.form[index].input[inputIndex].defaultValue = {
              'Address Proof': userDetails[inputValue.name],
            };
          }
        } else {
          tempForm.form[index].input[inputIndex].defaultValue = userDetails[inputValue.name];
        }
      }
    }));
  return tempForm;
};
