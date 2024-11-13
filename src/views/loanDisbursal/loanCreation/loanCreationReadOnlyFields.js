/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import __ from 'lodash';
import moment from 'moment';
import {
  IDENTIFIER,
  // REGEX
  FUNCTION_IDENTIFIER
} from '../../../constants';
import store from '../../../redux/store';

export const constData = {
  BLK: 'Bangle/Kada',
  ETP: 'Ear Tops',
  BBD: 'Baju Band',
  LKP: 'Locket/Pendant',
  OTH: 'Others',

  RNG: 'Ring',
  LOCKET: 'Locket',
  EARDROPS: 'Ear Drops',
  STUDS: 'Studs',
  ENG: 'Ear Ring',
  BANGLES: 'Bangles',
  BRL: 'Bracelet',
  KADA: 'Kada',
  CHN: 'Chain',
  CHAINWL: 'Chain with Locket',
  NKL: 'Necklace',
  MGS: 'Mangalsutra',
  SCHAIN: 'Satara Chain',
  BBANDPL: 'Baju Bandh Plain',
  BBANDRJ: 'Baju Bandh - Rajasthani',
  BANGADI: 'Bangadi',
  RUDRAKSH: 'Rudraksha/ Black beads',
  KNECKLACE: 'Kundan Necklace',
  HAMIL: 'Hamil',
  KASU: 'Kasu',
  WCHAIN: 'Kardhani (Girdle)/Waist Chain',
  CNECKLACE: 'Chokar Necklace',
  NATH: 'Nath',
  MTK: 'Mang Tikka',
  ANKLET: 'Anklet (Payal)',
  TRING: 'Toe Ring (Bichiya)',
  PENDANT: 'Pendant',
  POUNCHI: 'Pounchi',
  AAD: 'Aad - Rajasthani',
  LHAAR: 'Lakshmi Haar - Maharashtra',
  GALOBAND: 'Galoband',
  RAMRAMI: 'Ramrami/Jarmar - Kutch',
  NRING: 'Nose Ring',

  ATL: 'Ancestral',
  SPD: 'Self-Purchased',
  GFT: 'Gift',
  MRG: 'Marriage',
  PNL: 'Personal',
  BNS: 'Business',
  EDN: 'Education',
  IFT: 'Infrastructure',
  AGR: 'Agriculture',
  STD: 'Standard',
  ADV: 'UpFront Interest',
  REB: 'Rebate',
  RSU: 'Rebate Step Up',
  FLT: 'Flat',
  PER: 'Percentage',
  flat_value: 'Flat Value',
  percentage_of_loan_amount: 'Percentage of Loan Amount',
  CSH: 'Cash',
  OLN: 'Online',
  CASH: 'CASH',
  ONLINE: 'ONLINE',
  CASH_AND_ONLINE: 'CASH_AND_ONLINE',
  HOM: 'Home Renovation',
  MED: 'Medical Emergency',
  TRV: 'Travel',
};

const updateLabel = (string) => {
  const splitStr = string.toLowerCase().split(' ');
  for (let i = 0; i < splitStr.length; i += 1) {
    splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  return splitStr.join(' ');
};
const convertName = (name) => `${name.toLowerCase().replace(/ /g, '_').replace(/[ .,"'? +=-]/g, '')}`;
const convertName2 = (name) => `${name.toLowerCase().replace(/ /g, '_').replace(/[ .,"'? +=-]/g, '')}`;
const setValues = (formValues, callback, name) => {
  const state = store.getState();
  const { formData } = state.loanMaker;
  const res = __.get(formData, name.toString(), 'NA');
  // console.log(name, res);
  if (constData[res] !== undefined) {
    callback(constData[res]);
  } else {
    // eslint-disable-next-line no-lonely-if
    if (name === 'time_taken_by_maker') {
      callback(moment.utc(res * 1000).format('HH:mm:ss'));
    } else {
      callback(res?.toString());
    }
    // console.log(res, 'setValues2');
  }
};
const getCollateralfields = () => {
  const state = store.getState();
  const { formData } = state.loanMaker;
  const data = [];
  formData?.items?.forEach((item, index) => {
    data.push(
      {
        name: convertName(`Item Name${index}`),
        label: updateLabel('Item Name*'),
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT2,
        disabled: true,
        defaultValue: 'NA',
        customFunction: (formValues, callback) => setValues(formValues, callback, `items.[${index}].name`),
        functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
      },
      {
        name: convertName(`Count${index}`),
        label: updateLabel('Count*'),
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT2,
        disabled: true,
        defaultValue: 'NA',
        customFunction: (formValues, callback) => setValues(formValues, callback, `items.[${index}].item_count`),
        functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
      },
      {
        name: convertName(`sum weight of item (in gram)${index}`),
        label: updateLabel('Total weight of item (in gram)*'),
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT2,
        disabled: true,
        defaultValue: 'NA',
        customFunction: (formValues, callback) => setValues(formValues, callback, `items.[${index}].total_weight_gm`),
        functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
      },
      {
        name: convertName(`Beads/Stone weight (in gram)${index}`),
        label: 'Beads/Stone Weight (in Gram)*',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT2,
        disabled: true,
        defaultValue: 'NA',
        customFunction: (formValues, callback) => setValues(formValues, callback, `items.[${index}].stone_weight_gm`),
        functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
      },
      {
        name: convertName(`Purity (in Karat)${index}`),
        label: updateLabel('Purity (in Karat)*'),
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT2,
        disabled: true,
        defaultValue: 'NA',
        customFunction: (formValues, callback) => setValues(formValues, callback, `items.[${index}].purity`),
        functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
      },
      {
        name: convertName(`sum Weight after purity conversion (in gram)${index}`),
        label: updateLabel('Net Weight after purity conversion (in gram)'),
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT2,
        disabled: true,
        defaultValue: 'NA',
        customFunction: (formValues, callback) => setValues(formValues, callback, `items.[${index}].net_weight_gm`),
        functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
      },
      {
        name: `ornament_live_photo_readony${index}`,
        label: updateLabel('Ornament Live Photo'),
        type: 'file',
        identifier: IDENTIFIER.LIVEPHOTO,
        disable: true,
        customFunction: (formValues, callback) => setValues(formValues, callback, `items.[${index}].item_pic`),
        functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
      },
      {
        name: `linebrake${index}`,
        identifier: IDENTIFIER.SPERATOR,
        index: 0,
        label: '  '
      }
    );
  });
  return data;
};
const getFeefields = () => {
  const state = store.getState();
  const { formData } = state.loanMaker;
  const data = [];
  formData?.fees?.forEach((item, index) => {
    data.push(
      {
        name: convertName(`Fee Name${index}`),
        label: updateLabel('Fee Name'),
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT2,
        disabled: true,
        defaultValue: 'NA',
        customFunction: (formValues, callback) => setValues(formValues, callback, `fees.[${index}].name`),
        functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
      },
      {
        name: convertName(`Fee amount${index}`),
        label: updateLabel('Fee amount (in Rs)'),
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT2,
        disabled: true,
        defaultValue: 'NA',
        customFunction: (formValues, callback) => setValues(formValues, callback, `fees.[${index}].amount.amount`),
        functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
      },
      {
        name: convertName(`Fee CGST${index}`),
        label: 'Fee CGST (in Rs)',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT2,
        disabled: true,
        defaultValue: 'NA',
        customFunction: (formValues, callback) => setValues(formValues, callback, `fees.[${index}].amount.sgst`),
        functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
      },
      {
        name: convertName(`Fee SGST${index}`),
        label: 'Fee SGST (in Rs)',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT2,
        disabled: true,
        defaultValue: 'NA',
        customFunction: (formValues, callback) => setValues(formValues, callback, `fees.[${index}].amount.cgst`),
        functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
      }
    );
  });
  formData?.charge?.forEach((item, index) => {
    data.push(
      {
        name: convertName(`Charge Name${index}`),
        label: updateLabel('Charge Name'),
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT2,
        disabled: true,
        defaultValue: 'NA',
        customFunction: (formValues, callback) => setValues(formValues, callback, `charge.[${index}].name`),
        functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
      },
      {
        name: convertName(`Charge amount${index}`),
        label: updateLabel('Charge amount (in Rs)'),
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT2,
        disabled: true,
        defaultValue: 'NA',
        customFunction: (formValues, callback) => setValues(formValues, callback, `charge.[${index}].amount.amount`),
        functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
      },
      {
        name: convertName(`Charge CGST${index}`),
        label: 'CGST (in Rs)',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT2,
        disabled: true,
        defaultValue: 'NA',
        customFunction: (formValues, callback) => setValues(formValues, callback, `charge.[${index}].amount.cgst`),
        functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
      },
      {
        name: convertName(`Charge SGST${index}`),
        label: 'SGST (in Rs)',
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT2,
        disabled: true,
        defaultValue: 'NA',
        customFunction: (formValues, callback) => setValues(formValues, callback, `charge.[${index}].amount.sgst`),
        functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
      },
      {
        name: 'linebrake',
        identifier: IDENTIFIER.SPERATOR,
        index: 0,
        label: '  '
      }
    );
  });
  data.push({
    name: convertName('Consolidated Fees/Charges'),
    label: updateLabel('Consoldiated Fees/Charges (in Rs)'),
    type: 'text',
    identifier: IDENTIFIER.INPUTTEXT2,
    disabled: true,
    defaultValue: 'NA',
    customFunction: (formValues, callback) => setValues(formValues, callback, 'total_charge'),
    functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
  });
  return data;
};
const deviationFields = () => {
  const state = store.getState();
  const { formData } = state.loanMaker;
  const data = [];
  formData?.deviations?.forEach((item, index) => {
    data.push(
      {
        name: convertName(`Deviation Parameter${index}`),
        label: updateLabel('Deviation Parameter'),
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT2,
        disabled: true,
        defaultValue: 'NA',
        customFunction: (formValues, callback) => setValues(formValues, callback, `deviations.[${index}].deviation_type`),
        functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
      },
      {
        name: convertName(`role${index}`),
        label: updateLabel('role'),
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT2,
        disabled: true,
        defaultValue: 'NA',
        customFunction: (formValues, callback) => setValues(formValues, callback, `deviations.[${index}].primary_checker_role`),
        functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
      },
      {
        name: convertName(`Justification${index}`),
        label: updateLabel('Justification '),
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT2,
        disabled: true,
        defaultValue: 'NA',
        customFunction: (formValues, callback) => setValues(formValues, callback, `deviations.[${index}].maker_remarks`),
        functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
      }
    );
  });
  data.push(
    {
      name: convertName('Time Spent'),
      label: updateLabel('Time Spent'),
      type: 'text',
      identifier: IDENTIFIER.INPUTTEXT2,
      disabled: true,
      defaultValue: 'NA',
      customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('time_taken_by_maker')),
      functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
    }
  );
  return data;
};
const interfoundFields = () => {
  const state = store.getState();
  const { formData } = state.loanMaker;
  const data = [];
  if (formData?.interaccounts?.length > 0) {
    formData?.interaccounts?.forEach((item, index) => {
      data.push(
        {
          name: convertName(`Loan Account Number_readonly${index}`),
          label: updateLabel('Loan Account Number'),
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: 'NA',
          customFunction: (formValues, callback) => setValues(formValues, callback, convertName2(`interaccounts.[${index}].loan_account_no`)),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        },
        {
          name: convertName(`Amount to transfer${index}`),
          label: updateLabel('Amount to transfer (in Rs) '),
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: 'NA',
          customFunction: (formValues, callback) => setValues(formValues, callback, convertName2(`interaccounts.[${index}].loan_amount_transfer`)),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        },
        {
          name: 'linebrake',
          identifier: IDENTIFIER.SPERATOR,
          index: 0,
          label: '  '
        }
      );
    });
  } else {
    data.push(
      {
        name: convertName('Loan Account Number_readonly'),
        label: updateLabel('Loan Account Number'),
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT2,
        disabled: true,
        defaultValue: 'NA',
        customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('loan_account_no')),
        functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
      },
      {
        name: convertName('Amount to transfer'),
        label: updateLabel('Amount to transfer (in Rs) '),
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT2,
        disabled: true,
        defaultValue: 'NA',
        customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('loan_amount_transfer')),
        functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
      },
    );
  }

  data.push(
    {
      name: convertName('Balance Transfer Mode'),
      label: updateLabel('Balance Transfer Mode '),
      type: 'text',
      identifier: IDENTIFIER.INPUTTEXT2,
      disabled: true,
      defaultValue: 'NA',
      customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('balance_transfer_mode')),
      functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
    },
    {
      name: convertName('Amount_readonly'),
      label: updateLabel('Amount'),
      type: 'text',
      identifier: IDENTIFIER.INPUTTEXT2,
      disabled: true,
      defaultValue: 'NA',
      customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('balance_amount_transfer')),
      functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
    },
    {
      name: convertName('UTR Reference Number'),
      label: 'UTR Reference Number*',
      type: 'text',
      identifier: IDENTIFIER.INPUTTEXT2,
      disabled: true,
      defaultValue: 'NA',
      customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('utr_reference_number')),
      functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
    },
    {
      name: convertName('Net Disbursement To Customer'),
      label: updateLabel('Net Disbursement To Customer (in Rs)'),
      type: 'text',
      identifier: IDENTIFIER.INPUTTEXT2,
      disabled: true,
      defaultValue: 'NA',
      customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('net_disbursment')),
      functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
    },
    {
      name: 'net_disbursment_mode',
      label: updateLabel('disbursement mode'),
      type: 'text',
      identifier: IDENTIFIER.INPUTTEXT2,
      disabled: true,
      defaultValue: 'NA',
      customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('net_disbursment_mode')),
      functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
    },
  );
  if (formData?.net_disbursment_mode === 'ONLINE') {
    data.push(
      {
        name: 'online_disbursment_online_readonly',
        label: updateLabel('Online disbursement (in Rs)'),
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT2,
        disabled: true,
        customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('online_disbursment')),
        functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        condition: {
          type: 'showOnValue',
          baseOn: 'net_disbursment_mode',
          baseValue: 'ONLINE'
        },
      },
    );
  } else if (formData?.net_disbursment_mode === 'CASH') {
    data.push(
      {
        name: 'cash_disbursment_CASH_readonly',
        label: updateLabel('cash disbursement (in Rs)'),
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT2,
        disabled: true,
        customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('cash_disbursment')),
        functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        condition: {
          type: 'showOnValue',
          baseOn: 'net_disbursment_mode',
          baseValue: 'CASH'
        },
      },
    );
  } else {
    data.push(
      {
        name: 'cash_disbursment_CASH_ONLINE_readonly',
        label: updateLabel('cash disbursement (in Rs)'),
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT2,
        disabled: true,
        customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('cash_disbursment')),
        functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        condition: {
          type: 'showOnValue',
          baseOn: 'net_disbursment_mode',
          baseValue: 'CASH_AND_ONLINE'
        },
      },
      {
        name: 'online_disbursment_CASH_ONLINE_readonly',
        label: updateLabel('Online disbursement (in Rs)'),
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT2,
        disabled: true,
        customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('online_disbursment')),
        functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        condition: {
          type: 'showOnValue',
          baseOn: 'net_disbursment_mode',
          baseValue: 'CASH_AND_ONLINE'
        },
      },
    );
  }

  return data;
};

const manualDeviationFields = () => {
  const state = store.getState();
  const { formData } = state.loanMaker;
  const data = [];
  formData?.manual_deviations?.forEach((item, index) => {
    data.push(
      {
        name: 'linebrake',
        identifier: IDENTIFIER.SPERATOR,
        index: 0,
        label: '  '
      },
      {
        name: convertName(`Manual Deviation${index}`),
        label: updateLabel('Manual Deviation'),
        type: 'file',
        isMulti: false,
        identifier: IDENTIFIER.FILE,
        disabled: true,
        defaultValue: 'NA',
        customFunction: (formValues, callback) => setValues(formValues, callback, `manual_deviations.[${index}].file_url`),
        functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
      },
      {
        name: convertName(`Deviation Name${index}`),
        label: updateLabel('Deviation Name'),
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT2,
        multiline: true,
        disabled: true,
        defaultValue: 'NA',
        customFunction: (formValues, callback) => setValues(formValues, callback, `manual_deviations.[${index}].name`),
        functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
      }
    );
  });
  return data;
};

export const ReadOnlyFields = () => {
  const collateralData = getCollateralfields();
  const feeData = getFeefields();
  const deviationData = deviationFields();
  const interfound = interfoundFields();
  const manualDeviationData = manualDeviationFields();
  return ([
    {
      label: updateLabel('Credit Appraisal Memo'),
      data: [
        {
          name: convertName('Customer ID'),
          label: updateLabel('Customer ID'),
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: 'NA',
          customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('Customer ID')),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        },
        {
          name: convertName('First Name'),
          label: updateLabel('First Name'),
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: 'NA',
          customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('First Name')),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        },
        {
          name: convertName('Last Name'),
          label: updateLabel('Last Name'),
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: 'NA',
          customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('Last Name')),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        },
        {
          name: convertName('DOB'),
          label: 'DOB',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: 'NA',
          customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('dob')),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        },
        {
          name: convertName('Mobile Number'),
          label: updateLabel('Mobile Number'),
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: 'NA',
          customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('primary_mobile_number')),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        },
        {
          name: convertName('Active Loans'),
          label: updateLabel('Active Loans'),
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: 'NA',
          customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('active_loans')),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        },
        {
          name: convertName('Closed Loans'),
          label: updateLabel('Closed Loans'),
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: 'NA',
          customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('closed_loans')),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        },
        {
          name: convertName('Total Principal Outstanding'),
          label: updateLabel('Total Principal Outstanding'),
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: 'NA',
          customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('total_pos')),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        },
        {
          name: convertName('Total Interest Due'),
          label: updateLabel('Total Interest Due'),
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: 'NA',
          customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('total_interest_overdue')),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        },
        {
          name: convertName('NPA Status'),
          label: 'NPA Status',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: 'NA',
          customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('npa_status')),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        },
        {
          name: convertName('Count of accounts in default'),
          label: updateLabel('Count Of Accounts In Default'),
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: 'NA',
          customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('count_of_default_account')),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        },
        {
          name: convertName('Count of accounts in NPA'),
          label: 'Count Of Accounts In NPA',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: 'NA',
          customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('count_of_npa_account')),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        },
        {
          name: convertName('Count of accounts Auctioned'),
          label: updateLabel('Count Of Accounts Auctioned'),
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: 'NA',
          customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('count_of_auctioned_account')),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        },
        {
          name: convertName('Count of Spurious accounts'),
          label: updateLabel('Count of Spurious accounts'),
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: 'NA',
          customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('count_of_spurious_account')),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        },
        {
          name: convertName('Lien Status'),
          label: updateLabel('Lien Status'),
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: 'NA',
          customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('lien_status')),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        },
        {
          name: convertName('Legal Status'),
          label: updateLabel('Legal Status'),
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: 'NA',
          customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('legal_status')),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        },
        {
          name: convertName('Application Number'),
          label: updateLabel('Application Number'),
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: 'NA',
          customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('application_no')),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        },
        {
          name: convertName('Applied Loan Amount'),
          label: updateLabel('Applied Loan Amount (in Rs)*'),
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: 'NA',
          customFunction: (formValues, callback) => setValues(formValues, callback, 'applied_loan_amount'),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        },
      ]
    },
    {
      label: updateLabel('Collateral Details'),
      data: collateralData
    },
    {
      label: updateLabel('Consolidated Collateral Details'),
      data: [
        {
          name: convertName('total_net_weight_of_all_item'),
          label: updateLabel('Total Weight of All items (in gram)'),
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: 'NA',
          customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('total_weight_gm')),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        },
        {
          name: convertName('total_net_count_of_all_item'),
          label: updateLabel('Total count of All items'),
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: 'NA',
          customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('total_count')),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        },
        {
          name: convertName('total_net_bread_stone_weight'),
          label: 'Total Beads/Stone Weight (in Gram)',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: 'NA',
          customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('total_stone_weight_gm')),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        },
        // {
        //   name: convertName('total_net_weight_before_purity'),
        //   label: updateLabel('Total Net Weight before purity conversion (in gram)'),
        //   type: 'text',
        //   identifier: IDENTIFIER.INPUTTEXT2,
        //   disabled: true,
        //   defaultValue: 'test',
        //   customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('total_net_weight_before_purity')),
        //   functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        // },
        {
          name: convertName('total_net_weight_after_purity'),
          label: updateLabel('Total Net Weight after purity conversion (in gram)'),
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: 'NA',
          customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('total_net_weight_gm')),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        },
        {
          name: 'consolidated_picture_of_ornament',
          label: updateLabel('Consolidated Live Photo of Ornaments*'),
          type: 'file',
          disable: true,
          // defaultValue: store.getState()?.loanMaker?.formData?.items_pic,
          customFunction: (formValues, callback) => setValues(formValues, callback, 'items_pic'),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
          identifier: IDENTIFIER.LIVEPHOTO,
        },
      ]
    },
    {
      label: updateLabel('Gold Information'),
      data: [
        {
          name: convertName('Source of Gold'),
          label: updateLabel('Source of Gold*'),
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: 'NA',
          customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('Source of Gold')),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        },
        {
          name: convertName('Maker Name'),
          label: updateLabel('Maker Name'),
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: 'NA',
          customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('maker_name')),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        },
        {
          name: convertName('Maker Employee Code'),
          label: updateLabel('Maker Employee Code'),
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: 'NA',
          customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('maker_emp_code')),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        },
        {
          name: convertName('Customer Photo'),
          label: updateLabel('Customer Photo*'),
          type: 'text',
          disable: true,
          defaultValue: 'NA',
          identifier: IDENTIFIER.LIVEPHOTO,
          customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('Customer Photo')),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        },
        {
          name: convertName('End Use of Gold'),
          label: updateLabel('End Use of Gold*'),
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: 'NA',
          customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('end_use_loan')),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        }
      ]
    },
    {
      label: updateLabel('Scheme Name'),
      data: [
        {
          name: convertName('Scheme Name_readonly'),
          label: updateLabel('Scheme Name'),
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: 'NA',
          customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('scheme_name')),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        },
        {
          name: convertName('Minimum Loan Amount'),
          label: updateLabel('Minimum Loan Amount (in Rs)'),
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: 'NA',
          customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('scheme_min_loan_amount')),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        },
        {
          name: convertName('Maximum Loan Amount'),
          label: updateLabel('Maximum Loan Amount (in Rs)'),
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: 'NA',
          customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('scheme_max_loan_amount')),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        },
        {
          name: convertName('Loan Tenure (in months)'),
          label: updateLabel('Loan Tenure (in months)'),
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: 'NA',
          customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('tenure')),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        },
        {
          name: convertName('ROI'),
          label: updateLabel('Rate of Interest (in % p.a.)'),
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: 'NA',
          customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('rate_of_interest')),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        },
        {
          name: convertName('Additional Interest (in % p.a.)'),
          label: updateLabel('Additional Interest (in % p.a.)'),
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: 'NA',
          customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('additional_interest')),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        },
        {
          name: convertName('Repayment Frequency'),
          label: updateLabel('Repayment Frequency'),
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: 'NA',
          customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('repayment_frequency')),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        },
        {
          name: convertName('Scheme Type'),
          label: updateLabel('Scheme Type'),
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: 'NA',
          customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('scheme_type')),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        },
        {
          name: convertName('Scheme Eligible Amount (in Rs.)'),
          label: updateLabel('Scheme Eligible Amount (in Rs.) '),
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: 'NA',
          customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('scheme_eligible_amount')),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        },
        {
          name: convertName('Requested Gold Loan Amount'),
          label: updateLabel('Requested Gold Loan Amount (in Rs)*'),
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: 'NA',
          customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('requested_loan_amount')),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        },
        {
          name: convertName('Applied loan amount (in Rs.)'),
          label: updateLabel('Applied loan amount (in Rs.)*'),
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: 'NA',
          customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('applied_loan_amount')),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        },
        {
          name: convertName('Max Eligible Loan amount'),
          label: updateLabel('Max Eligible Loan amount (in Rs)'),
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: 'NA',
          customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('Max Eligible Loan amount')),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        },
        // {
        //   name: convertName('Scheme Eligible amount'),
        //   label: updateLabel('Scheme Eligible amount (in Rs)'),
        //   type: 'text',
        //   identifier: IDENTIFIER.INPUTTEXT2,
        //   disabled: true,
        //   defaultValue: 'test',
        //   customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('Scheme Eligible amount')),
        //   functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        // },
      ]
    },
    {
      label: updateLabel('Fees & Charges'),
      data: feeData
    },
    {
      label: updateLabel('Inter Account Fund Transfer'),
      data: interfound
    },
    {
      label: updateLabel('Additional Gold Information'),
      data: [
        {
          name: convertName('Gold Pouch No.'),
          label: updateLabel('Gold Pouch No.*'),
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: 'NA',
          customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('gold_pouch_number')),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        },
        {
          name: convertName('Tare Weight of Gold (in gram)'),
          label: updateLabel('Tare Weight of Gold (in gram)*'),
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: 'NA',
          customFunction: (formValues, callback) => setValues(formValues, callback, convertName2('tare_weight_gold_pouch')),
          functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
        },
        ...manualDeviationData
      ]
    },
    {
      label: updateLabel('Approval'),
      data: deviationData
    },
  ]);
};
