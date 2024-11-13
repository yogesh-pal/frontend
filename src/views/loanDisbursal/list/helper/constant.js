import { REGEX } from '../../../../constants';

export const stageName = {
  MKR: 'Maker Pending',
  DVN: 'Deviation Approval Pending',
  DVR: 'Deviation Rejected',
  CHK: 'Checker Approval Pending',
  CHR: 'Checker Rejected',
  DBT: 'Disbursement Pending',
  DBD: 'Fully Disbursed',
  DBR: 'Disbursement Rejected',
  CLO: 'Closed',
  DBP: 'Disbursement Processing',
  DBF: 'Disbursement Failed',
  ATR: 'Auto Rejected',
  CLP: 'Bank Processing',
  CLR: 'Bank Retry',
  CDP: 'Bank Pending',
  CDR: 'Bank Rejected',
  AUC: 'Auction Closed',
  CAN: 'Loan Cancelled'
};

export const losListingSearchValidation = {
  loan_account_no: {
    name: 'loan_account_no',
    validation: {
      isRequired: true,
      requiredMsg: 'Please enter loan account number',
      pattern: REGEX.NUMBER,
      patternMsg: 'Please enter valid loan account number',
      maxLength: 20,
      maxLenMsg: 'Loan account number should not be more than 20 digits'
    }
  },
  application_no: {
    name: 'application_no',
    validation: {
      isRequired: true,
      requiredMsg: 'Please enter application number',
      pattern: REGEX.ALPHANUMERICTRIMSPACE,
      patternMsg: 'Please enter valid application number',
      maxLength: 15,
      maxLenMsg: 'Application number should not be more than 15 characters'
    }
  },
  customer_mobile_number: {
    name: 'customer_mobile_number',
    validation: {
      isRequired: true,
      requiredMsg: 'Please enter mobile number.',
      pattern: REGEX.MOBILENUMBER,
      patternMsg: 'Please enter valid mobile number.',
    }
  },
};

export const togglerGroup = {
  defaultValue: 'loan_account_no',
  values: [
    {
      name: 'LAN',
      value: 'loan_account_no'
    },
    {
      name: 'Application No',
      value: 'application_no',
    },
    {
      name: 'Mobile No',
      value: 'customer_mobile_number',
    }
  ]
};
