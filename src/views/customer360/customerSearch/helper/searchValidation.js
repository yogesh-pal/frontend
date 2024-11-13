import {
  REGEX
} from '../../../../constants';

export const validation = {
  customer_id: {
    name: 'customer_id',
    validation: {
      isRequired: true,
      requiredMsg: 'Please enter Customer ID',
      pattern: REGEX.NUMBER,
      patternMsg: 'Please enter valid Customer ID',
      maxLength: 10,
      maxLenMsg: 'Customer ID should not be more than 10 digits'
    }
  },
  lan: {
    name: 'lan',
    validation: {
      isRequired: true,
      requiredMsg: 'Please enter LAN',
      pattern: REGEX.NUMBER,
      patternMsg: 'Please enter valid LAN',
      maxLength: 20,
      maxLenMsg: 'LAN should not be more than 20 digits'
    }
  },
  full_name: {
    name: 'full_name',
    validation: {
      isRequired: true,
      requiredMsg: 'Please enter customer full name',
      pattern: REGEX.SPACESTARTEND,
      patternMsg: 'Please enter valid full name.',
      maxLength: 227,
      maxLenMsg: 'Full name should not be more than 227 characters.',
    }
  },
  primary_mobile_number: {
    name: 'primary_mobile_number',
    validation: {
      isRequired: true,
      requiredMsg: 'Please enter mobile number.',
      pattern: REGEX.MOBILENUMBER,
      patternMsg: 'Please enter valid mobile number.',
    }
  },
  pan_no: {
    name: 'pan_no',
    validation: {
      isRequired: true,
      requiredMsg: 'Please enter pancard number.',
      pattern: REGEX.PANCARD,
      patternMsg: 'Please enter valid pancard number.'
    }
  },
  dob: {
    name: 'dob',
    validation: {
      isRequired: true,
      requiredMsg: 'Please select customer date of birth',
    }
  },
  aadhaar_number: {
    name: 'aadhaar_number',
    validation: {
      isRequired: true,
      requiredMsg: 'Please enter your aadhaar number',
      pattern: REGEX.AADHAAR,
      patternMsg: 'Please enter valid aadhaar number.'
    }
  }
};
