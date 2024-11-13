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
  first_name: {
    name: 'first_name',
    validation: {
      isRequired: true,
      requiredMsg: 'Please enter customer first name',
      pattern: REGEX.SPACESTARTEND,
      patternMsg: 'Please enter valid first name.',
      maxLength: 50,
      maxLenMsg: 'First name should not more than 50 characters.',
    }
  },
  last_name: {
    name: 'last_name',
    validation: {
      isRequired: true,
      requiredMsg: 'Please enter customer last name',
      pattern: REGEX.SPACESTARTEND,
      patternMsg: 'Please enter valid last name.',
      maxLength: 50,
      maxLenMsg: 'Last name should not more than 50 characters.',
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
      requiredMsg: 'Please Select customer date of birth',
    }
  }
};
