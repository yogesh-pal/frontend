import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { PDFViewButton } from './styled-components';
import { ContainerButtonStyled } from '../../../components/styledComponents';
import { NAVIGATION, REGEX, IDENTIFIER } from '../../../constants';
import { constData } from '../../loanDisbursal/loanCreation/loanCreationReadOnlyFields';

export const branchTransactionNavigation = [
  { name: 'Dashboard', url: NAVIGATION.dashboard },
  { name: 'Transaction', url: NAVIGATION.transaction },
  { name: 'Branch Transaction', url: NAVIGATION.branchTransaction }
];

export const deputationNavigation = [
  ...branchTransactionNavigation,
  { name: 'Deputation', url: NAVIGATION.deputation }
];

export const deputationCasesNavigation = [
  ...deputationNavigation,
  { name: 'Deputation Cases', url: NAVIGATION.deputationCases }
];

export const cashPacketManageNavigation = [
  ...branchTransactionNavigation,
  { name: 'Cash & Packet Management', url: NAVIGATION.cashAndPacketManagement }
];

export const initiateCashTransactionNavigation = [
  ...cashPacketManageNavigation,
  { name: 'Initiate Cash Transaction', url: NAVIGATION.initiateCashTransaction }
];

export const initiatePacketTransactionNavigation = [
  ...cashPacketManageNavigation,
  { name: 'Initiate Packet Transaction', url: NAVIGATION.initiatePacketTransaction }
];

export const customerTransactionNavigation = [
  { name: 'Dashboard', url: NAVIGATION.dashboard },
  { name: 'Transaction', url: NAVIGATION.transaction },
  { name: 'Customer Transaction', url: NAVIGATION.customerTransaction },
];

export const receiptMakerNavigation = [
  ...customerTransactionNavigation,
  { name: 'Receipt Maker', url: NAVIGATION.receiptMaker },
];

export const receiptCheckerNavigation = [
  ...customerTransactionNavigation,
  { name: 'Receipt Checker', url: NAVIGATION.receiptChecker },
];

export const collateralReleaseNavigation = [
  ...customerTransactionNavigation,
  { name: 'Collateral Release', url: NAVIGATION.collateralRelease },
];

export const partReleaseNavigation = [
  ...customerTransactionNavigation,
  { name: 'Part Release', url: NAVIGATION.partRelease },
];

export const eCollectInvoice = [
  ...customerTransactionNavigation,
  { name: 'Generate E-Collect Invoice', url: NAVIGATION.generateECollectInvoice },
];

export const collateralReleaseMakerNavigation = [
  ...collateralReleaseNavigation,
  { name: 'Collateral Release Maker', url: NAVIGATION.collateralReleaseMaker },
];

export const collateralReleaseCheckerNavigation = [
  ...collateralReleaseNavigation,
  { name: 'Collateral Release Checker', url: NAVIGATION.collateralReleaseChecker },
];

export const receiptMakerTogglerGroup = {
  defaultValue: 'customer_id',
  values: [
    { name: 'Customer ID', value: 'customer_id' },
    { name: 'LAN', value: 'lan' },
    { name: 'Mobile NO', value: 'primary_mobile_number' }

  ]
};

export const receiptMakerValidation = {
  customer_id: {
    name: 'customer_id',
    validation: {
      isRequired: true,
      requiredMsg: 'Please enter customer id',
      pattern: REGEX.NUMBER,
      patternMsg: 'Please enter valid customer id',
      maxLength: 10,
      maxLenMsg: 'Customer id should not be more than 10 digits'
    },
  },
  colender: {
    name: 'colender',
    validation: {
      isRequired: true,
      requiredMsg: 'Please select type'
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
    },
  },
  primary_mobile_number: {
    name: 'primary_mobile_number',
    validation: {
      isRequired: true,
      requiredMsg: 'Please enter mobile number',
      pattern: REGEX.MOBILENUMBER,
      patternMsg: 'Please enter valid mobile number',
      maxLength: 10,
      maxLenMsg: 'Mobile number should not be more than 10 digits',
    }
  }
};

export const receiptCheckerTogglerGroup = {
  defaultValue: 'receipt_no',
  values: [
    { name: 'Receipt No', value: 'receipt_no' },
    { name: 'Customer ID', value: 'customer_id' },
    { name: 'Mobile NO', value: 'primary_mobile_number' }

  ]
};

export const receiptCheckerValidation = {
  receipt_no: {
    name: 'receipt_no',
    validation: {
      isRequired: true,
      requiredMsg: 'Please enter receipt no',
      pattern: REGEX.ALPHANUMERICTRIMSPACE,
      patternMsg: 'Please enter valid receipt no.',
      maxLength: 50,
      maxLenMsg: 'Receipt no should not be more than 50 characters.',
    },
  },
  customer_id: {
    name: 'customer_id',
    validation: {
      isRequired: true,
      requiredMsg: 'Please enter Customer ID',
      pattern: REGEX.NUMBER,
      patternMsg: 'Please enter valid Customer ID',
      maxLength: 10,
      maxLenMsg: 'Customer ID should not be more than 10 digits'
    },
  },
  primary_mobile_number: {
    name: 'primary_mobile_number',
    validation: {
      isRequired: true,
      requiredMsg: 'Please enter mobile number.',
      pattern: REGEX.MOBILENUMBER,
      patternMsg: 'Please enter valid mobile number.',
      maxLength: 10,
      maxLenMsg: 'Mobile number should not be more than 10 digits.',
    }
  }
};

export const deputationTogglerGroup = {
  defaultValue: 'emp_code',
  values: [
    { name: 'Emp Code', value: 'emp_code' },
    { name: 'Emp Name', value: 'emp_name' },
    { name: 'Branch Code', value: 'branch_code' }
  ]
};

export const deputationValidation = {
  emp_code: {
    name: 'emp_code',
    validation: {
      isRequired: true,
      requiredMsg: 'Please enter emp code',
      pattern: REGEX.ALPHANUMERICTRIMSPACE,
      patternMsg: 'Please enter valid emp code',
      maxLength: 10,
      maxLenMsg: 'Emp code should not be more than 10 characters'
    }
  },
  emp_name: {
    name: 'emp_name',
    validation: {
      isRequired: true,
      requiredMsg: 'Please enter emp name',
      pattern: REGEX.ALPHABETS,
      patternMsg: 'Please enter valid emp name',
      maxLength: 50,
      maxLenMsg: 'Emp name should not be more than 50 characters'
    }
  },
  branch_code: {
    name: 'branch_code',
    validation: {
      isRequired: true,
      requiredMsg: 'Please enter branch code',
      pattern: REGEX.ALPHANUMERICTRIMSPACE,
      patternMsg: 'Please enter valid branch code',
      maxLength: 10,
      maxLenMsg: 'Branch code should not be more than 10 characters'
    }
  }
};

export const pendingReleaseTableColumn = [
  {
    field: 'custmer_id',
    headerName: 'Customer Id',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'customer_name',
    headerName: 'Customer Name',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'loanAccountNo',
    headerName: 'LAN',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'total_dues',
    headerName: 'Total Dues',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'third_party_name',
    headerName: 'Third Party Name',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'branch_name',
    headerName: 'Branch Name',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'status',
    headerName: 'Status',
    minWidth: 100,
    sortable: false,
    flex: 1,
  },
  {
    field: 'satisfaction_letter',
    headerName: 'Satisfaction Letter',
    minWidth: 100,
    sortable: false,
    flex: 1,
    renderCell: ({ row }) => (
      row.status === 'Released'
        ? (
          <a
            href={`/file-viewer?lan=${row.lan}`}
            target='_blank'
            rel='noreferrer'
            style={{ color: '#502A74' }}
          >
            View
          </a>
        ) : 'NA'
    ),
  }
];

export const statusArray = [
  { label: 'All', value: 'All' },
  { label: 'Approved', value: 'APV' },
  { label: 'Pending', value: 'PND' },
  { label: 'Released', value: 'RLS' },
  { label: 'Rejected', value: 'REJ' }
];
export const getStatus = (status) => {
  const index = statusArray.findIndex((item) => item.value === status);
  if (index !== -1) {
    return statusArray[index].label;
  }
  return 'NA';
};

export const receiptStatus = {
  PND: 'Pending',
  APV: 'Approved',
  REJ: 'Rejected',
  FAILED: 'Failed',
  INPROGRESS: 'In-Progress',
  ATCL: 'Auto Closed'
};

export const receiptCheckerTableColumn = (downloadFile, loading) => [
  {
    field: 'customerId',
    headerName: 'Customer ID',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'customerName',
    headerName: 'Customer Name',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'receiptNo',
    headerName: 'Receipt No',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'totalAmount',
    headerName: 'Receipt Amount',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'status',
    headerName: 'Receipt Status',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'receiptPDF',
    headerName: 'Receipt PDF',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1,
    renderCell: ({ row }) => (
      row.isDocGenerated
        ? (
          <strong>
            <PDFViewButton
              variant='contained'
              size='small'
              onClick={() => downloadFile(row?.receiptNo)}
              loading={loading.loader && loading.name === row?.receiptNo}
            >
              Download
            </PDFViewButton>
          </strong>
        ) : 'NA'
    ),
  }
];

export const receiptCheckerTableColumn2 = [
  {
    field: 'customerId',
    headerName: 'Customer ID',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'lan',
    headerName: 'LAN',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'customerName',
    headerName: 'Customer Name',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'dueAmount',
    headerName: 'Due Amount',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'dpd',
    headerName: 'DPD',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'foreclosureAmount',
    headerName: 'Total Amount',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'paidAmount',
    headerName: 'Customer wishes to pay',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1,
  }
];

export const detailedBankTransactionsTableColumn = [
  {
    field: 'date',
    headerName: 'Date',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'eventType',
    headerName: 'Event Type',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'lan',
    headerName: 'LAN',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'narration',
    headerName: 'Narration',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 2,
  },
  {
    field: 'debit',
    headerName:
  <ContainerButtonStyled>
    Debit
    {' '}
    (₹)
  </ContainerButtonStyled>,
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1
  },
  {
    field: 'credit',
    headerName:
  <ContainerButtonStyled>
    Credit
    {' '}
    (₹)
  </ContainerButtonStyled>,
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1
  },
];

export const detailedTransactionsTableColumn = [
  {
    field: 'date',
    headerName: 'Date',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'eventType',
    headerName: 'Event Type',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'narration',
    headerName: 'Narration',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 2,
  },
  {
    field: 'debit',
    headerName:
  <ContainerButtonStyled>
    Debit
    {' '}
    (₹)
  </ContainerButtonStyled>,
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1
  },
  {
    field: 'credit',
    headerName:
  <ContainerButtonStyled>
    Credit
    {' '}
    (₹)
  </ContainerButtonStyled>,
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1
  },
  {
    field: 'netBalance',
    headerName:
  <ContainerButtonStyled>
    Net Cash Balance
    {' '}
    (₹)
  </ContainerButtonStyled>,
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1
  }
];

export const IBCTTransactionsTableColumn = [
  {
    field: 'type',
    headerName: 'Type',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'category',
    headerName: 'Category',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'cashFromBranch',
    headerName: 'Cash From Branch',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'cashToBranch',
    headerName: 'Cash To Branch',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'cashAmount',
    headerName:
  <ContainerButtonStyled>
    Cash Amount
    {' '}
    (₹)
  </ContainerButtonStyled>,
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'requestRaisedBy',
    headerName: 'Request Raised By',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'transactionNumber',
    headerName: 'Transaction Number',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 2,
  },
  {
    field: 'mode',
    headerName: 'Mode',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'status',
    headerName: 'Status',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1,
  }
];

export const IBGTTransactionsTableColumn = [
  {
    field: 'type',
    headerName: 'Type',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'category',
    headerName: 'Category',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'packetFromBranch',
    headerName: 'Packet From Branch',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'packetToBranch',
    headerName: 'Packet To Branch',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'packetQty',
    headerName: 'Packet Qty.',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'requestRaisedBy',
    headerName: 'Request Raised By',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'transactionNumber',
    headerName: 'Transaction Number',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 2,
  },
  {
    field: 'mode',
    headerName: 'Mode',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'status',
    headerName: 'Status',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1,
  }
];

export const IBCTStatusArray = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Request Approved', value: 'REQAPPV' },
  { label: 'Request Rejected', value: 'REQREJC' },
  { label: 'In-transit', value: 'HADAPPV' },
  { label: 'Handover Rejected', value: 'HADREJC' },
  { label: 'Acknowledge Approved', value: 'ACKAPPV' },
  { label: 'Acknowledge Rejected', value: 'ACKREJC' }
];

export const IBGTStatusArray = [
  // { label: '', value: '' },
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  // { label: 'In-transit', value: 'HADAPPV' },
  // { label: 'Handover Rejected', value: 'HADREJC' },
  { label: 'In-transit', value: 'REQAPPV' },
  { label: 'Request Rejected', value: 'REQREJC' },
  { label: 'Acknowledge Approved', value: 'ACKAPPV' },
  { label: 'Acknowledge Rejected', value: 'ACKREJC' },
  { label: 'Auto Rejected', value: 'ATR' },
  { label: 'Partial Acknowledged', value: 'PRACK' },
];

export const OtherCategoryStatusArray = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Auto Rejected', value: 'AUTOREJECTED' }
];

export const transactionValidation = {
  branch_code: {
    name: 'branch_code',
    validation: {
      isRequired: true,
      requiredMsg: 'Please enter branch id.',
      pattern: REGEX.ALPHANUMERICTRIMSPACE,
      patternMsg: 'Please enter valid branch id.'
    }
  },
  transaction_id: {
    name: 'transaction_id',
    validation: {
      isRequired: true,
      requiredMsg: 'Please enter transaction number.'
    }
  }
};

export const togglerGroup = {
  defaultValue: 'branch_code',
  values: [
    {
      name: 'Branch ID',
      value: 'branch_code',
    },
    {
      name: 'Transaction Number',
      value: 'transaction_id',
    }
  ]
};

export const IBCTStatus = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  AUTOREJECTED: 'Auto Rejected',
  REQAPPV: 'Request Approved',
  REQREJC: 'Request Rejected',
  HADAPPV: 'In-transit',
  HADREJC: 'Handover Rejected',
  ACKAPPV: 'Acknowledge Approved',
  ACKREJC: 'Acknowledge Rejected'
};

export const IBCTMode = {
  CAR: 'Car',
  TWH: 'Two Wheeler',
  PBTR: 'Public Transport'
};

export const IBGTStatus = {
  PENDING: 'Pending',
  // APPROVED: 'Approved',
  // REJECTED: 'Rejected',
  REQAPPV: 'In-transit',
  REQREJC: 'Request Rejected',
  // HADAPPV: 'In-transit',
  // HADREJC: 'Handover Rejected',
  ACKAPPV: 'Acknowledge Approved',
  ACKREJC: 'Acknowledge Rejected',
  ATR: 'Auto Rejected',
  PRACK: 'Partial Acknowledged'
};

export const IBGTMode = {
  CAR: 'Car',
  TWH: 'Two Wheeler',
  PBTR: 'Public Transport',
  HIRVEH: 'Hired Vehicle'
};

export const detailedPacketTransactionsTableColumn = [
  {
    field: 'date',
    headerName: 'Date',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'eventType',
    headerName: 'Event Type',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'narration',
    headerName: 'Narration',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'packetsAdded',
    headerName: 'Packets Added',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'packetsRemoved',
    headerName: 'Packets Removed',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1,
  },
  {
    field: 'netBalance',
    headerName: 'Net Packet Balance',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    minWidth: 100,
    flex: 1,
  }
];

export const transactionCategoryType = {
  FINO: 'FINO',
  PNEY: 'PayNearby',
  VEEF: 'Veefin',
  YESB: 'Yes Bank',
  HDFC: 'HDFC Bank',
  RECL: 'Reli-collect',
  IBCT: 'IBCT',
  CUST: 'Customer',
  OTBA: 'Other Bank',
  OTHR: 'Others'
};
export const validation = {
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
  checker_remarks: {
    name: 'checker_remarks',
    validation: {
      isRequired: true,
      requiredMsg: 'Please enter remarks',
      maxLenMsg: 'Remarks should not be more than 30 characters.',
      maxLength: 30
    }
  }
};

export const packetTransactionEventType = {
  DISB: 'Disbursement',
  CLOS: 'Closure',
  IBGT: 'IBGT'
};

export const bankTransactionEventType = {
  DISBURSEMENT: 'Disbursement',
  COLLECTION: 'Collection'
};

export const partReleaseReadOnlyFields = (loanInfo) => {
  const amountFormat = Intl.NumberFormat('en-IN');
  const formConfiguration = {
    form: [
      {
        title: '',
        variant: 'outlined',
        input: {
          readonlyData: [
            {
              label: '',
              data: [
                {
                  name: 'customerId',
                  label: 'Customer ID',
                  type: 'text',
                  identifier: IDENTIFIER.INPUTTEXT2,
                  disabled: true,
                  defaultValue: loanInfo.customerId
                },
                {
                  name: 'customerName',
                  label: 'Customer Name',
                  type: 'text',
                  identifier: IDENTIFIER.INPUTTEXT2,
                  disabled: true,
                  defaultValue: loanInfo.customerName
                },
                {
                  name: 'lan',
                  label: 'LAN',
                  type: 'text',
                  identifier: IDENTIFIER.INPUTTEXT2,
                  disabled: true,
                  defaultValue: loanInfo.loan_account_no,
                },
                {
                  name: 'packetID',
                  label: 'Packet ID',
                  type: 'text',
                  identifier: IDENTIFIER.INPUTTEXT2,
                  disabled: true,
                  defaultValue: loanInfo.packetId
                },
                {
                  name: 'pos',
                  label: 'POS',
                  type: 'text',
                  identifier: IDENTIFIER.INPUTTEXT2,
                  disabled: true,
                  defaultValue: amountFormat.format(loanInfo.pos),
                  InputProps: {
                    possition: 'start',
                    text: <CurrencyRupeeIcon />
                  }
                },
                {
                  name: 'totalDues',
                  label: 'Total Dues',
                  type: 'text',
                  identifier: IDENTIFIER.INPUTTEXT2,
                  disabled: true,
                  defaultValue: amountFormat.format(loanInfo.totalDues),
                  InputProps: {
                    possition: 'start',
                    text: <CurrencyRupeeIcon />
                  }
                },
                {
                  name: 'tareWeight',
                  label: 'TARE Weight',
                  type: 'text',
                  identifier: IDENTIFIER.INPUTTEXT2,
                  disabled: true,
                  defaultValue: loanInfo.tareWeight,
                  InputProps: {
                    possition: 'end',
                    text: 'gm'
                  }
                },
                {
                  name: 'totalWeight',
                  label: 'Total Weight',
                  type: 'text',
                  identifier: IDENTIFIER.INPUTTEXT2,
                  disabled: true,
                  defaultValue: loanInfo.totalWeight,
                  InputProps: {
                    possition: 'end',
                    text: 'gm'
                  }
                },
                {
                  name: 'numberOfItems',
                  label: 'Number Of Items',
                  type: 'text',
                  identifier: IDENTIFIER.INPUTTEXT2,
                  disabled: true,
                  defaultValue: loanInfo.numberOfItems
                },
                {
                  name: 'lastAppliedRPG',
                  label: 'Last Applied RPG',
                  type: 'text',
                  identifier: IDENTIFIER.INPUTTEXT2,
                  disabled: true,
                  defaultValue: amountFormat.format(loanInfo.lastAppliedRPG),
                  InputProps: {
                    possition: 'start',
                    text: <CurrencyRupeeIcon />
                  }
                },
                {
                  name: 'todayRPG',
                  label: 'Today\'s RPG',
                  type: 'text',
                  identifier: IDENTIFIER.INPUTTEXT2,
                  disabled: true,
                  defaultValue: amountFormat.format(loanInfo.todayRPG),
                  InputProps: {
                    possition: 'start',
                    text: <CurrencyRupeeIcon />
                  }
                },
                {
                  name: 'appliedRPG',
                  label: 'Applied RPG',
                  type: 'text',
                  identifier: IDENTIFIER.INPUTTEXT2,
                  disabled: true,
                  defaultValue: amountFormat.format(loanInfo.appliedRPG),
                  InputProps: {
                    possition: 'start',
                    text: <CurrencyRupeeIcon />
                  }
                },
                {
                  name: 'disbursedLoanAmount',
                  label: 'Disbursed Loan Amount',
                  type: 'text',
                  identifier: IDENTIFIER.INPUTTEXT2,
                  disabled: true,
                  defaultValue: amountFormat.format(loanInfo.disbursedLoanAmount),
                  InputProps: {
                    possition: 'start',
                    text: <CurrencyRupeeIcon />
                  }
                },
                {
                  name: 'eligibleValuation',
                  label: 'Eligible Valuation',
                  type: 'text',
                  identifier: IDENTIFIER.INPUTTEXT2,
                  disabled: true,
                  defaultValue: amountFormat.format(loanInfo.eligibleValuation),
                  InputProps: {
                    possition: 'start',
                    text: <CurrencyRupeeIcon />
                  }
                },
                {
                  name: 'branchCode',
                  label: 'Branch Code',
                  type: 'text',
                  identifier: IDENTIFIER.INPUTTEXT2,
                  disabled: true,
                  defaultValue: loanInfo.branchCode
                },
                {
                  name: 'branchName',
                  label: 'Branch Name',
                  type: 'text',
                  identifier: IDENTIFIER.INPUTTEXT2,
                  disabled: true,
                  defaultValue: loanInfo.branchName
                }
              ]
            }
          ],
          identifier: IDENTIFIER.READONLY,
        },
        type: 'readonly',
        alignment: {
          xs: 12,
          sm: 6,
          md: 4,
          lg: 4,
          xl: 4
        }
      }
    ],
  };
  return formConfiguration;
};

export const collateralPurityEnum = {
  '22K': 22,
  '21K': 21,
  '20K': 20,
  '19K': 19,
  '18K': 18
};

export const extractValidateApiErrors = (errors, tableData) => {
  let msg = '';
  if (errors && errors.hasOwnProperty('collateral_items') && errors.collateral_items.length) {
    errors.collateral_items.forEach((item, index) => {
      (Object.keys(item)).forEach((ele) => {
        msg += `${constData[tableData[index].name]} ${(item[ele])[0]} \n`;
      });
    });
  }
  if (errors) {
    (Object.keys(errors)).forEach((ele) => {
      if (typeof (errors[ele][0]) !== 'object') {
        msg += `${(errors[ele])[0]} \n`;
      }
    });
  }
  return msg;
};
