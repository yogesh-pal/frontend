import { IconButton } from '@mui/material';
import { CustomDeleteIcon } from '../../../../../components/formFields/fileInput/customfileList';

const MAKER = 'MAKER'; const ACKNOWLEDGER = 'ACKNOWLEDGER'; const
  APPROVER = 'APPROVER';
const GOLDVALUER = 'Gold Valuer';
const BRANCHMANAGER = 'Branch Manager';
const ASSISTANTBRANCHMANAGER = 'Assistant Branch Manager';
const REGIONALMANAGER = 'Regional Manager';
const AREAMANAGER = 'Area Manager';
const CASHPACKET = '/cash-packet-management';
const ModesofTransprt = {
  'Two-Wheeler': 'TWH', 'Public Transport': 'PBTR', 'Own Car': 'CAR', 'Hired Vehicle': 'HIRVEH'
};

const TransferingPersonColumns = (userType, handleEmpdeletion, isPreviewOnly) => ([{
  field: 'empID',
  headerName: 'EmployeeID',
  align: 'center',
  headerAlign: 'center',
  sortable: false,
  minWidth: 100,
  flex: 1,
},
{
  field: 'empName',
  headerName: 'Employee Name',
  align: 'center',
  headerAlign: 'center',
  sortable: false,
  minWidth: 100,
  flex: 2,
}, {
  field: 'funcDesignation',
  headerName: 'Functional Designation',
  align: 'center',
  headerAlign: 'center',
  sortable: false,
  minWidth: 100,
  flex: 2,
}, {
  field: 'action',
  headerName: 'Action',
  align: 'center',
  headerAlign: 'center',
  sortable: false,
  minWidth: 100,
  flex: 1,
  renderCell: (params) => (
    <IconButton edge='end' disabled={userType !== MAKER || isPreviewOnly} aria-label='delete'>
      <CustomDeleteIcon className={(userType !== MAKER || isPreviewOnly) ? 'disableIcon' : null} onClick={() => handleEmpdeletion(params)} />
    </IconButton>
  )
}
]);

const GoldPacketColumns = (userType, handleLandeletion, isPreviewOnly) => ([{
  field: 'lan',
  headerName: 'LAN',
  align: 'center',
  headerAlign: 'center',
  sortable: false,
  minWidth: 100,
  flex: 1,
},
{
  field: 'action',
  headerName: 'Action',
  align: 'center',
  headerAlign: 'center',
  sortable: false,
  minWidth: 100,
  flex: 1,
  renderCell: (params) => (
    <IconButton edge='end' aria-label='delete' disabled={userType !== MAKER || isPreviewOnly}>
      <CustomDeleteIcon className={(userType !== MAKER || isPreviewOnly) ? 'disableIcon' : null} onClick={() => handleLandeletion(params)} />
    </IconButton>
  )
},
]);

const remarkHeader = {
  MAKER: 'Remarks',
  ACKNOWLEDGER: 'Acknowledgement Remarks',
  APPROVER: 'Approver Remarks'
};

const handleError = (errObj) => {
  let msg = 'Something went wrong. Please try again.';
  if (errObj?.response?.data?.message) {
    msg = errObj.response.data.message;
  }
  if (errObj?.response?.data?.detail) {
    msg = errObj.response.data.detail;
  }
  return msg;
};
const getCount = (source, param, val) => source.filter((item) => item[param] === val).length;
const getTotalPOS = (packets) => {
  let total = 0;
  packets.forEach((item) => {
    total += item.pos;
  });
  return total;
};

const alreadyExists = (source, param, val) => source.some((item) => item[param] === val);

const isGuardRequired = (gdPackets) => {
  const totalPOS = getTotalPOS(gdPackets);
  if (totalPOS <= 1000000) return false;
  return true;
};

const statuses = {
  APPROVER_APPROVED: 'REQAPPV',
  APPROVER_REJECTED: 'REQREJC',
  ACKNOWLEDGER_APPROVED: 'ACKAPPV',
  ACKNOWLEDGER_REJECTED: 'ACKREJC',
  ACKNOWLEDGER_PARTIAL_APPROVED: 'PRACK',
};

const customIBGTStaus = {
  PENDING: 'Pending',
  INTRANSIT: 'In-transit',
  AUTOREJECTED: 'Auto Rejected'
};
const IBGTcategory = 'IBGT';

export {
  MAKER, ACKNOWLEDGER, APPROVER, GOLDVALUER, BRANCHMANAGER, ASSISTANTBRANCHMANAGER,
  REGIONALMANAGER, AREAMANAGER, CASHPACKET, ModesofTransprt, alreadyExists,
  TransferingPersonColumns, GoldPacketColumns, remarkHeader, handleError, getCount,
  getTotalPOS, isGuardRequired, statuses, IBGTcategory, customIBGTStaus
};
