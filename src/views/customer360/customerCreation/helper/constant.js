import { NAVIGATION } from '../../../../constants';

const aadhaarMapping = {
  0: 'A',
  1: 'b',
  2: '$',
  3: '7',
  4: 'Z',
  5: '*',
  6: 'x',
  7: '@',
  8: '?',
  9: '1'
};

const NAVIGATION_DETAILS = [
  {
    name: 'Dashboard',
    url: NAVIGATION.dashboard
  },
  {
    name: 'Customer 360',
    url: NAVIGATION.customerDashboard
  },
  {
    name: 'Customer Search',
    url: NAVIGATION.customerSearch
  },
  {
    name: 'Customer Dedupe',
    url: NAVIGATION.customerSearchPosidex
  },
  {
    name: 'Customer Creation',
    url: NAVIGATION.customerCreation
  }
];

export const ID_PROOF_LIST = {
  PASSPORT: 'Passport',
  DRIVINGLICENSE: 'Driving License',
  VOTERID: 'Voter ID',
  PAN: 'PAN Card',
  AADHAAR: 'Aadhaar Card',
  GOVERNMENTISSUEDIDCARD: 'Government Issued ID Card',
  ELECTRICITYBILL: 'Electricity Bill',
  GASBILL: 'Gas Bill',
  POSTPAIDMOBILEBILL: 'Postpaid Mobile Bill',
  RENT: 'Rent Agreement'
};

export const GENDERLIST = {
  MALE: 'Male',
  FEMALE: 'Female',
  TRANSGENDER: 'Transgender'
};

export const GENDERENUM = [
  GENDERLIST.MALE,
  GENDERLIST.FEMALE,
  GENDERLIST.TRANSGENDER
];

export const KARZAGENDER = {
  [GENDERLIST.MALE]: 'MALE',
  [GENDERLIST.FEMALE]: 'FEMALE',
  [GENDERLIST.TRANSGENDER]: 'O',
};

export const IDPROOFBASEON = `${ID_PROOF_LIST.DRIVINGLICENSE},${ID_PROOF_LIST.PASSPORT},${ID_PROOF_LIST.VOTERID},${ID_PROOF_LIST.PAN},${ID_PROOF_LIST.GOVERNMENTISSUEDIDCARD}`;

const ID_PROOF_NAME_LIST = [
  ID_PROOF_LIST.PASSPORT,
  ID_PROOF_LIST.DRIVINGLICENSE,
  ID_PROOF_LIST.VOTERID,
  ID_PROOF_LIST.PAN,
  ID_PROOF_LIST.AADHAAR,
  ID_PROOF_LIST.GOVERNMENTISSUEDIDCARD
];

export const ADDRESS_PROOF_NAME_LIST = [
  ID_PROOF_LIST.PASSPORT,
  ID_PROOF_LIST.DRIVINGLICENSE,
  ID_PROOF_LIST.VOTERID,
  ID_PROOF_LIST.GOVERNMENTISSUEDIDCARD,
  ID_PROOF_LIST.AADHAAR,
  // ID_PROOF_LIST.ELECTRICITYBILL,
  // ID_PROOF_LIST.GASBILL,
  // ID_PROOF_LIST.POSTPAIDMOBILEBILL,
  // ID_PROOF_LIST.RENT,
];

const ID_PROOF_NAMELIST_WITHOUT_PAN = [
  ID_PROOF_LIST.PASSPORT,
  ID_PROOF_LIST.DRIVINGLICENSE,
  ID_PROOF_LIST.VOTERID,
  ID_PROOF_LIST.AADHAAR,
  ID_PROOF_LIST.GOVERNMENTISSUEDIDCARD
];

export const ADRESSPROOFBASEON = `${ID_PROOF_LIST.DRIVINGLICENSE},${ID_PROOF_LIST.PASSPORT},${ID_PROOF_LIST.VOTERID},${ID_PROOF_LIST.GOVERNMENTISSUEDIDCARD},${ID_PROOF_LIST.ELECTRICITYBILL},${ID_PROOF_LIST.GASBILL},${ID_PROOF_LIST.POSTPAIDMOBILEBILL},${ID_PROOF_LIST.RENT}`;

const NAMEMAPPING = {
  GOLDLOAN: 'GOLDLOAN',
  FLEXCUBE: 'FLEXCUBE',
};

const AADHAARVERFICATIONMODE = {
  OFFLINE: 'Offline',
  ONLINE: 'Online',
  BIOMETRIC: 'Biometric'
};

const BIOMETRICSTATUS = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  PENDING: 'PENDING'
};

const BIOMETRICMODELSTATUS = {
  INITIATED: 'INITIATED',
  CLOSE: 'CLOSE'
};

const VERIFICATIONKEY = {
  VERIFICATIONSTART: 'start',
  VERIFICATIONEND: 'end'
};

const ERRORMESSAGE = {
  OFFLINEBIOMETRICENABLE: 'Offline option enable due to biometric verification failure.',
  FETCHINGERROR: 'Something went wrong while fetching the details.',
  FAILEDFETCHERROR: 'Failed to fetch the biometri details.',
  FETCHSUCCESSBIOMETRIC: 'Biometric details fetched successfully.',
  DOBERROR: 'DOB must be between 18 to 80 years.',
  SOMETHINGERROR: 'Something went wrong.',
  PROCEEDMESSAGE: 'Please click on proceed',
  VERIFYPAYMENTDETAILS: 'Please verify the payment details first.',
  VERIFYCLICKBUTTON: 'Please click proceed or skip button.',
  QRTIMEOUT: 'Request timed out. Please add details manually.',
  INITIATEDQR: 'QR initiate API failed. Try again.',
  PERMISSIONNOT: 'You do not have permission to perform this action.',
  BENEFICIARYNOTMATCH: 'Beneficiary Name does not match with the Customer Name. Please add Bank Account details manually.',
  NOTABLETOPROCESS: 'Unable to process at the moment. Please try again later.',
  UPIDISABLE: 'UPI bank validate option disable for you now.',
  MAXRETRYREACH: 'Maximum retry limit exhausted. Please add details manually.',
  ONLINEBIOMETRICENABLE: 'Biometric option enable due to online verification failure.',
  ONLINEOFFLINEENABLE: 'Offline option enable due to online verification failure',
  PROCEED: 'Please click on proceed button'
};

export {
  aadhaarMapping,
  NAVIGATION_DETAILS,
  NAMEMAPPING,
  ID_PROOF_NAME_LIST,
  ID_PROOF_NAMELIST_WITHOUT_PAN,
  AADHAARVERFICATIONMODE,
  BIOMETRICSTATUS,
  BIOMETRICMODELSTATUS,
  VERIFICATIONKEY,
  ERRORMESSAGE
};
