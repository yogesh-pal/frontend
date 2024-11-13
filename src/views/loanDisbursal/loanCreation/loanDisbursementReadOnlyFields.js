import { IDENTIFIER } from '../../../constants';

export const ReadOnlyFields = (customerDeatails) => ([
  {
    label: '',
    data: [
      {
        name: 'customerId',
        label: 'Customer ID',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT2,
        disabled: true,
        defaultValue: customerDeatails.customerId
      },
      {
        name: 'customerName',
        label: 'Customer Name',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT2,
        disabled: true,
        defaultValue: customerDeatails.customerName
      },
      {
        name: 'applicationNo',
        label: 'Application No',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT2,
        disabled: true,
        defaultValue: customerDeatails.applicationNo,
      },
      {
        name: 'schemeName',
        label: 'Scheme Name',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT2,
        disabled: true,
        defaultValue: customerDeatails.schemeName
      },
      {
        name: 'disbursementAmt',
        label: 'Disbursement Amount',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT2,
        disabled: true,
        defaultValue: customerDeatails.disbursementAmt
      },
      {
        name: 'roi',
        label: 'ROI (%)',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT2,
        disabled: true,
        defaultValue: customerDeatails.roi
      },
      {
        name: 'disbursementDate',
        label: 'Disbursement Date',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT2,
        disabled: true,
        defaultValue: new Date().toLocaleDateString()
      },
      {
        name: 'cashDisbursementAmt',
        label: 'Net Cash Disbursement Amount',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT2,
        disabled: true,
        defaultValue: customerDeatails.cashDisbursementAmt
      },
      {
        name: 'onlineDisbursementAmt',
        label: 'Online Disbursement Amount',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT2,
        disabled: true,
        defaultValue: customerDeatails.onlineDisbursementAmt
      },
    ]
  },
  {
    label: 'Bank Details',
    data: [
      {
        name: 'bankAccountNumber',
        label: 'Bank Account Number',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT2,
        disabled: true,
        defaultValue: customerDeatails.bankAccountNumber
      },
      {
        name: 'ifsc',
        label: 'IFSC',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT2,
        disabled: true,
        defaultValue: customerDeatails.ifsc
      },
      {
        name: 'bankName',
        label: 'Bank Name',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT2,
        disabled: true,
        defaultValue: customerDeatails.bankName
      },
      {
        name: 'branchName',
        label: 'Branch Name',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT2,
        disabled: true,
        defaultValue: customerDeatails.branchName
      },
      {
        name: 'bankVerificationStatus',
        label: 'Bank Verification Status',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT2,
        disabled: true,
        defaultValue: customerDeatails.bankVerificationStatus
      },
    ]
  }
]);
