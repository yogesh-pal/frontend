/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */
/* eslint-disable camelcase */
import moment from 'moment';
import Decimal from 'decimal.js';
import store from '../../../../redux/store';
import { Service } from '../../../../service';
import {
  IDENTIFIER, FEE_ENUM_VALUES, CHARGES_ENUM_VALUES, REGEX
} from '../../../../constants';
import { numberFormat } from '../../../../utils';

const chargeTypeData = {
  FLT: 'Flat',
  PER: 'Percentage',
};
const amountFormat = Intl.NumberFormat('en-IN');

const purityCalculation = (formValues, callback, index, setValue) => {
  const totalWeight = new Decimal(formValues[`total_weight${index}`] || 0);
  const breadsStoneWeight = new Decimal(formValues[`breads_stone_weight${index}`] || 0);
  const purity = new Decimal(formValues[`purity${index}`] || 0);
  const weightMultiplyPurity = parseFloat(Decimal.mul((totalWeight - breadsStoneWeight - (0.01 * (totalWeight - breadsStoneWeight))), purity));
  let weightafterpurity = parseFloat(Decimal.div(weightMultiplyPurity, 22));
  // eslint-disable-next-line no-restricted-globals
  weightafterpurity = isNaN(weightafterpurity) ? 0 : weightafterpurity;
  const rounded = new Decimal(weightafterpurity).toFixed(2);
  callback({
    [`net_weight_after_purity${index}`]: rounded
  });
  setValue(`net_weight_after_purity${index}`, rounded);
};

const formulaOfNetDisbursement = (formValues) => {
  const state = store.getState();
  const { formData } = state.loanMaker;
  const requestAmount = parseFloat(formValues?.requested_gold_loan_amount?.replace(/,/g, ''));
  const total_fees = parseFloat(formData?.total_charge ?? 0);
  const amount = parseFloat((formValues.amount !== '' && formValues.amount !== undefined && formValues.amount !== null) ? formValues?.amount?.replace(/,/g, '') : 0);
  let interaccountsAmount = 0;
  formData?.interaccounts?.forEach((item) => {
    interaccountsAmount += parseFloat(item?.loan_amount_transfer?.replace(/,/g, '') ?? 0);
  });
  // eslint-disable-next-line no-restricted-globals
  const total = parseFloat(requestAmount) - (parseFloat(total_fees) + parseFloat((isNaN(amount) === false && amount !== '') ? amount : 0) + interaccountsAmount);
  return total;
};

const formulaOfCashHandlingCharge = (amount, colender, config) => {
  try {
    const state = store.getState();
    const { formData } = state.loanMaker;
    let colenderName = colender ?? formData?.colender;
    if (config && Object.keys(config).findIndex((ele) => ele === colenderName) === -1) {
      colenderName = config._default;
    }
    const cashHandlingChargeConfig = config?.[colenderName]?.cash_handling_charge;
    const total = Math.ceil(parseFloat(amount) * (cashHandlingChargeConfig.max_percent / 100));
    return Math.max(total, cashHandlingChargeConfig.min_amount);
  } catch (err) {
    console.log(err);
  }
};

const CASH_HANDLING = 'CASH HANDLING';

const calculateNetDisbursement = (formValues, callback, reqindex, setValue) => {
  const total = formulaOfNetDisbursement(formValues);
  let finalAmount = total;
  const state = store.getState();
  const { formData } = state.loanMaker;
  const cashCharge = formData?.charge?.find((ele) => ele.name === CASH_HANDLING);
  if (cashCharge) {
    finalAmount += cashCharge.amount.amount;
    finalAmount += cashCharge.amount.gst;
  }
  callback(numberFormat(Math.round(finalAmount).toString()));
  setValue('net_disbursement_to_customer', numberFormat(Math.round(finalAmount).toString()));
};

const calculateNetCashDisbursement = (formValues, callback, reqindex, setValue, losConfigData) => {
  const state = store.getState();
  const { formData } = state.loanMaker;
  const disbursementToCustomer = Math.round(formulaOfNetDisbursement(formValues));
  const cashHandlingCharges = formulaOfCashHandlingCharge(disbursementToCustomer, formValues?.applied_for, losConfigData);
  let netCashDisbursement = disbursementToCustomer;
  if (formData?.charge?.findIndex((ele) => ele.name === CASH_HANDLING) === -1) {
    netCashDisbursement -= cashHandlingCharges;
  }
  callback('cash_disbursment_CASH', numberFormat(netCashDisbursement));
  setValue('cash_disbursment_CASH', numberFormat(netCashDisbursement));
};

const calculateCashHandlingCharge = (formValues, callback, reqindex, setValue, losConfigData) => {
  const total = formulaOfNetDisbursement(formValues);
  const totalDisbursementAmount = Math.round(total);
  const cashCharge = formulaOfCashHandlingCharge(totalDisbursementAmount, formValues?.applied_for, losConfigData);
  const commaSeparated = numberFormat(cashCharge.toString());
  callback(commaSeparated);
  setValue('cash_handling_charge', commaSeparated);
  console.log('totalDisbursementAmount', totalDisbursementAmount, Math.round(total).toString(), cashCharge, commaSeparated);
};

const calculateNetDisbursementOnline = (formValues, callback) => {
  const total = formulaOfNetDisbursement(formValues);
  let finalTotal;
  if (typeof formValues.cash_disbursment_CASH_ONLINE === 'string') {
    finalTotal = total - parseFloat(formValues.cash_disbursment_CASH_ONLINE.replace(/,/g, ''));
  } else {
    finalTotal = total - parseFloat(formValues.cash_disbursment_CASH_ONLINE);
  }
  if (Math.round(finalTotal) > 0) {
    callback(numberFormat(Math.round(finalTotal)));
  } else {
    callback('0');
  }
};

const handleScheme = (formValues, callback, reqindex, setValue) => {
  const state = store.getState();
  const { schemeData } = state.user;
  const setValueArr = [
    { apiKey: 'roi', name: 'rate_of_interest' },
    { apiKey: 'additional_interest', name: 'additional_interest' },
    { apiKey: 'min_loan_amount', name: 'minimum_loan_amount' },
    { apiKey: 'max_loan_amount', name: 'maximum_loan_amount' },
    { apiKey: 'loan_tenure', name: 'loan_tenure' },
    { apiKey: 'rpg_ltv', name: 'ltv' },
    { apiKey: 'repayment_frequency', name: 'repayment_frequency' },
    { apiKey: 'type', name: 'scheme_type' },
    { apiKey: 'fc_rebate_rate_chart_code', name: 'rate_chart_code' }
  ];
  schemeData.forEach((item) => {
    if (item.code === formValues.scheme_name) {
      setValueArr.forEach((val) => {
        if (val.name === 'minimum_loan_amount' || val.name === 'maximum_loan_amount') {
          setValue(val.name, amountFormat.format(item[val.apiKey]));
        } else {
          setValue(val.name, item[val.apiKey]);
        }
      });
      if (formValues.max_eligible_loan_amount !== undefined) {
        let eligibleAmount;
        if (typeof formValues.max_eligible_loan_amount === 'string') {
          eligibleAmount = (parseFloat((formValues?.max_eligible_loan_amount)?.replace(/,/g, '')) * item.rpg_ltv) / 100;
        } else {
          // eslint-disable-next-line no-unsafe-optional-chaining
          eligibleAmount = ((formValues?.max_eligible_loan_amount) * item.rpg_ltv) / 100;
        }
        setValue('eligible_gold_loan_amount', amountFormat.format(Math.floor(eligibleAmount)));
      }
    }
  });
};

const handleLoanKawach = (formValues, callback, premium_table) => {
  const { sum_insured } = formValues;
  const sumInsuredNumber = Number(sum_insured);

  const matchingItem = premium_table.find((item) => {
    const isMatch = Number(item.sum_insured) === sumInsuredNumber;
    return isMatch;
  });
  if (matchingItem) {
    callback(matchingItem.premium);
  }
};

const generateFeeFields = () => {
  const state = store.getState();
  const input = [
    {
      name: 'applied_laon_amount',
      label: 'Applied Loan Amount (in Rs)',
      type: 'text',
      identifier: IDENTIFIER.INPUTTEXT2,
      disabled: true
    },
    {
      name: 'max_eligible_loan_amount',
      label: 'Max Eligible Loan amount (in Rs)',
      type: 'text',
      identifier: IDENTIFIER.INPUTTEXT2,
      disabled: true
    },
    {
      name: 'eligible_gold_loan_amount',
      label: 'Scheme Eligible amount (in Rs)',
      type: 'text',
      identifier: IDENTIFIER.INPUTTEXT2,
      disabled: true,
    },
    {
      name: 'requested_gold_loan_amount',
      label: 'Requested Loan Amount (in Rs)',
      type: 'text',
      identifier: IDENTIFIER.INPUTTEXT2,
      disabled: true
    }
  ];
  const feeDataInput = [];
  const chargeDataInput = [];
  const { formData } = state.loanMaker;
  const feeData = formData?.fees;
  if (feeData?.length > 0) {
    feeData?.forEach((fee, feeIndex) => {
      feeDataInput.push(
        {
          name: `fee_name${(feeIndex > 0) ? `__${feeIndex}` : ''}`,
          label: 'Fee Name',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: FEE_ENUM_VALUES[fee?.name]
        },
        {
          name: `fee_amount${(feeIndex > 0) ? `__${feeIndex}` : ''}`,
          label: 'Fee Amount (in Rs)',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: fee?.amount?.amount.toString()
        },
        {
          name: `fee_tax_cgst${(feeIndex > 0) ? `__${feeIndex}` : ''}`,
          label: 'Fee Tax (CGST) (in Rs)',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: fee?.amount?.cgst.toString()
        },
        {
          name: `fee_tax_sgst${(feeIndex > 0) ? `__${feeIndex}` : ''}`,
          label: 'Fee Tax (SGST) (in Rs)',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: fee?.amount?.sgst.toString()
        },
        {
          name: `sperator__${feeIndex}`,
          identifier: IDENTIFIER.SPERATOR,
          index: feeIndex,
        }
      );
    });
  }
  const getChargeAmount = (ch) => {
    if (ch?.name === 'CASH HANDLING') {
      let cashCharge = ch?.amount?.amount;
      cashCharge += ch.amount.gst;
      return cashCharge.toString();
    }
    return ch?.amount?.amount?.toString();
  };
  const chargerData = formData?.charge;
  if (chargerData?.length > 0) {
    chargerData?.forEach((charger, chargerIndex) => {
      chargeDataInput.push(
        {
          name: `charger_name${(chargerIndex > 0) ? `__${chargerIndex}` : ''}`,
          label: 'Charge Name',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: CHARGES_ENUM_VALUES[charger?.name]
        },
        {
          name: `charger_type${(chargerIndex > 0) ? `__${chargerIndex}` : ''}`,
          label: 'Charge Type',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: chargeTypeData[charger?.type]
        },
        {
          name: `charger_amount${(chargerIndex > 0) ? `__${chargerIndex}` : ''}`,
          label: 'Charge Amount (in Rs)',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: getChargeAmount(charger)
        },
        {
          name: `charger_tax_cgst${(chargerIndex > 0) ? `__${chargerIndex}` : ''}`,
          label: 'Cow Protection Cess On Stamp Duty (in Rs)',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: charger?.amount?.cgst?.toString()
        },
        {
          name: `charger_tax_sgst${(chargerIndex > 0) ? `__${chargerIndex}` : ''}`,
          label: 'Surcharge on Stamp Duty (in Rs)',
          type: 'text',
          identifier: IDENTIFIER.INPUTTEXT2,
          disabled: true,
          defaultValue: charger?.amount?.sgst?.toString()
        },
        {
          name: `sperator__${chargerIndex}`,
          identifier: IDENTIFIER.SPERATOR,
          index: chargerIndex,
        }
      );
    });
  }
  const finalInput = [];
  finalInput.push(
    {
      name: 'total_fees',
      label: 'Total Fees (in Rs)',
      type: 'text',
      identifier: IDENTIFIER.INPUTTEXT2,
      defaultValue: String(formData?.total_charge),
      disabled: true,
    },
  );
  return [
    { label: ' ', data: input },
    { label: ' ', data: feeDataInput },
    { label: ' ', data: chargeDataInput },
    { label: ' ', data: finalInput }
  ];
};

const getAllValuesBaseonKey = (formValues, key) => {
  const keys = Object.keys(formValues);
  const searchKeyArray = keys.filter((item) => item.includes(key));
  let total = 0;
  searchKeyArray.forEach((item) => {
    // eslint-disable-next-line no-restricted-globals
    if (['total_net_weight_after_purity', 'total_net_weight_before_purity'].includes(item)) {
      total += 0;
    } else {
      total += parseFloat(formValues[item]);
    }
  });
  return total;
};

const updateReadOnlyFields = (formValues, callback, name) => {
  switch (name) {
    case 'total_net_weight_of_all_item':
      callback(getAllValuesBaseonKey(formValues, 'total_weight').toFixed(2));
      break;
    case 'total_net_count_of_all_item':
      callback(getAllValuesBaseonKey(formValues, 'item_count'));
      break;
    case 'total_net_weight_before_purity':
      callback(getAllValuesBaseonKey(formValues, 'net_weight_before_purity'));
      break;
    case 'total_net_weight_after_purity':
      callback(getAllValuesBaseonKey(formValues, 'net_weight_after_purity').toFixed(2));
      break;
    case 'total_net_bread_stone_weight':
      callback(getAllValuesBaseonKey(formValues, 'breads_stone_weight').toFixed(2));
      break;
    default:
      break;
  }
};

const calculateRpa = async (formValues, callback, setAlertShow) => {
  try {
    const { data } = await Service.get(`${process.env.REACT_APP_SCHEME_RPA}`);
    if (data.success) {
      const keys = Object.keys(formValues);
      const searchKeyArray = keys.filter((item) => item.includes('net_weight_after_purity'));
      let maxloan = 0;
      searchKeyArray.forEach((item) => {
        if (['total_net_weight_after_purity', 'total_net_weight_before_purity'].includes(item)) {
          maxloan += 0;
        } else {
          maxloan += Math.floor(parseFloat((formValues[item]) * parseFloat(data.price)).toFixed(2));
        }
      });
      callback(numberFormat(Math.floor(maxloan)));
    } else {
      setAlertShow({ open: true, msg: 'oops! Something went wrong fetching RPG', alertType: 'error' });
      callback(0);
    }
  } catch (e) {
    console.log('Error', e);
    callback(0);
    setAlertShow({ open: true, msg: 'oops! Something went wrong fetching RPG', alertType: 'error' });
  }
};

const udyamSendOtp = async (value, setAlertShow, formData, dispatch, resendReducer) => {
  // return {
  //   success: false,
  //   failureResponse: 0
  // };
  // return {
  //   success: true,
  //   successResponse: 1,
  //   url: 'https://www.clickdimensions.com/links/TestPDFfile.pdf',
  //   fuzzyScore: 99,
  //   stopTimer: true
  // };
  // return {
  //   success: true,
  //   successResponse: 0,
  //   requestId: 'fdasfads',
  // };
  try {
    const { udyam_mobile_number, udyam_registration_number } = value;
    if (!udyam_registration_number) {
      setAlertShow({ open: true, msg: 'Please enter Udyam Registration Number', alertType: 'error' });
      return;
    }
    if (!REGEX.UDYAMNUMBER.test(udyam_registration_number)) {
      setAlertShow({ open: true, msg: 'Please enter valid Udyam Registration Number', alertType: 'error' });
      return;
    }
    // const customerName = [formData.first_name, formData.middle_name, formData.last_name].join(' ');
    // const customerName = `${formData.first_name ?? ''} ${formData.middle_name ?? ''} ${formData.last_name ?? ''}`;
    const firstName = formData.first_name ?? '';
    const middleName = formData.middle_name ? ` ${formData.middle_name}` : '';
    const lastName = formData.last_name ? ` ${formData.last_name}` : '';
    const customerName = firstName + middleName + lastName;

    const payload = {
      udyamRegistrationNo: udyam_registration_number,
      mobile: udyam_mobile_number,
      udyamResponseType: 'URL',
      customer_name: customerName,
    };
    const { data } = await Service.post(process.env.REACT_APP_UDYAM_SEND_OTP, payload);
    if (data.success) {
      dispatch(resendReducer('SEND'));
      if (data.data.udyamRequestId) {
        setAlertShow(
          {
            open: true,
            msg: 'Otp sent successfully',
          }
        );
        return {
          success: true,
          successResponse: 0,
          requestId: data.data.udyamRequestId,
        };
      }
      if (data.s3_file_path) {
        dispatch(resendReducer('VERIFIED'));
        return {
          success: true,
          successResponse: 1,
          url: data.s3_file_path,
          fuzzyScore: data.fuzzy_score,
          stopTimer: true
        };
      }
    }
    setAlertShow({
      open: true,
      msg: 'Udyam API failed',
      alertType: 'error'
    });
    return {
      success: false,
      failureResponse: 0
    };
  } catch (e) {
    console.log('Error', e);
    // let errorMsg = 'Something went wrong. Please try again!';
    // const apiResponse = e?.response?.data;
    // if (apiResponse?.hasOwnProperty('success')) {
    //   if (apiResponse?.data?.hasOwnProperty('errors')) {
    //     errorMsg = apiResponse.data.errors?.[0];
    //   } else {
    //     errorMsg = apiResponse?.message;
    //   }
    // }
    // const trimmedError = errorMsg?.replace(/\s/g, '')?.toLowerCase();
    // if (errorMsg) {
    //   setAlertShow({
    //     open: true,
    //     msg: errorMsg,
    //     alertType: 'error'
    //   });
    // }
    setAlertShow({
      open: true,
      msg: 'Something went wrong. Please Verify Udyam Registration number and manually upload Udyam certificate.',
      alertType: 'error'
    });

    // if (['invalidinput', 'ownernamecannotbenull'].includes(trimmedError)) {
    //   if (trimmedError === 'invalidinput') {
    //     errorMsg = 'Udyam registration number is not valid, Unable to proceed further.';
    //   }
    //   // return {
    //   //   success: false,
    //   //   errorMsg,
    //   //   failureResponse: 0
    //   // };
    // }
    return {
      success: false,
      failureResponse: 0
    };
  }
};

const VALIDUPISTATUS = 'VE';
const upiVerify = async (value, formData, setAlertShow) => {
  try {
    const { upiId } = value;
    const netDisbursementtocus = parseFloat(value.net_disbursement_to_customer.replace(/,/g, ''));
    const firstName = formData.first_name ?? '';
    const middleName = formData.middle_name ? ` ${formData.middle_name}` : '';
    const lastName = formData.last_name ? ` ${formData.last_name}` : '';
    const customerName = firstName + middleName + lastName;

    const payload = {
      virtualAddress: upiId,
      customer_name: customerName,
    };
    const { data } = await Service.post(process.env.REACT_APP_VALIDATE_UPI, payload);
    if (data?.data?.status === VALIDUPISTATUS) {
      if (!data?.data?.fuzzy_match) {
        const errorMessage = 'UPI Beneficiary Name does not match with the Customer Name. Funds can only be transferred to Customer linked UPI ID';
        setAlertShow({
          open: true,
          msg: errorMessage,
          alertType: 'error'
        });
        return {
          success: true,
          error: errorMessage,
          userName: data.data.Name,
          successResponse: 1
        };
      }

      if (parseFloat(data?.data?.vpaDetails?.limit) >= netDisbursementtocus) {
        return {
          success: true,
          userName: data?.data?.Name,
          error: null,
          token: data?.data?.upi_verify_token,
          successResponse: 0
        };
      }
      const errorMessage = 'Max. 1Lac amount is allowed for disbursement on same UPI ID within 24hrs. The requested amount exceeds this limit';
      setAlertShow({
        open: true,
        msg: errorMessage,
        alertType: 'error'
      });
      return {
        success: true,
        error: errorMessage,
        userName: data?.data?.Name,
        successResponse: 1
      };
    }
    const invalidUpi = 'Invalid UPI ID. Please re-initiate with another UPI';
    setAlertShow({
      open: true,
      msg: invalidUpi,
      alertType: 'error'
    });
    return {
      success: false,
      error: invalidUpi,
      failureResponse: 0
    };
  } catch (err) {
    console.log(err);
    let errorMsg = 'Unable to process at the moment. Please try again later.';
    if (err?.response?.data?.message) {
      errorMsg = err.response.data.message;
    }
    setAlertShow({
      open: true,
      msg: errorMsg,
      alertType: 'error'
    });
    return {
      success: false,
      failureResponse: 1
    };
  }
};

const upiOptionhandler = (values, callback) => {
  const netDisbursementtocus = parseFloat(values?.net_disbursement_to_customer?.replace(/,/g, ''));
  let disbursementModes = [
    { label: 'Cash', value: 'CASH' },
    { label: 'Online', value: 'ONLINE' },
    { label: 'UPI', value: 'UPI' },
  ];
  if (netDisbursementtocus > 100000) {
    disbursementModes = [
      { label: 'Cash', value: 'CASH' },
      { label: 'Online', value: 'ONLINE' },
    ];
  }
  callback(disbursementModes);
};

const updateFormState = (setValue) => {
  const state = store.getState();
  const { submitFormValues } = state.user;
  const { formData } = state.loanMaker;
  formData?.items?.forEach((item, index) => {
    setValue(`item_name${index > 0 ? `__${index}` : ''}`, item.name);
    setValue(`other_item_name${index > 0 ? `__${index}` : ''}`, item.other_name);
    setValue(`item_count${index > 0 ? `__${index}` : ''}`, item.item_count);
    setValue(`total_weight${index > 0 ? `__${index}` : ''}`, item.total_weight_gm);
    setValue(`breads_stone_weight${index > 0 ? `__${index}` : ''}`, item.stone_weight_gm);
    setValue(`purity${index > 0 ? `__${index}` : ''}`, item.purity?.replace('K', ''));
    setValue(`net_weight_after_purity${index > 0 ? `__${index}` : ''}`, item.net_weight_gm);
    setValue(`ornament_live_photo${index > 0 ? `__${index}` : ''}`, item.item_pic);
  });

  if (formData?.manual_deviations && formData?.manual_deviations !== null && formData.manual_deviations.length) {
    formData.manual_deviations.forEach((item, index) => {
      setValue(`manual_deviation_name${index > 0 ? `__${index}` : ''}`, item.name);
      setValue(`manual_deviation_file${index > 0 ? `__${index}` : ''}`, item.file_url);
    });
  }

  if (formData?.interaccounts !== null && formData?.interaccounts?.length > 0) {
    formData?.interaccounts?.forEach((item, index) => {
      const tempIndex = index > 0 ? `__${index}` : '';
      setValue(`loan_account_number${tempIndex}`, item?.loan_account_no ?? '');
      if (typeof item?.loan_amount_transfer !== 'string') {
        setValue(`amount_to_transfer${tempIndex}`, numberFormat(item?.loan_amount_transfer) ?? '');
      } else {
        setValue(`amount_to_transfer${tempIndex}`, (item?.loan_amount_transfer) ?? '');
      }
    });
  } else {
    setValue('loan_account_number', '');
    setValue('amount_to_transfer', '');
    const keys = Object.keys(submitFormValues);
    const findKeys = keys.filter((item) => item.includes('loan_account_number__'));
    findKeys.forEach((key, index) => {
      const tempIndex = `__${index + 1}`;
      setValue(`loan_account_number${tempIndex}`, '');
      setValue(`amount_to_transfer${tempIndex}`, '');
    });
  }
  const dataArray = [
    { datakey: 'total_net_weight_of_all_item', apiKey: 'total_weight_gm' },
    { datakey: 'total_net_count_of_all_item', apiKey: 'total_count' },
    { datakey: 'total_net_weight_after_purity', apiKey: 'total_net_weight_gm' },
    { datakey: 'total_net_bread_stone_weight', apiKey: 'total_stone_weight_gm' },
    { datakey: 'consolidated_picture_of_ornament', apiKey: 'items_pic' },
    { datakey: 'max_eligible_loan_amount', apiKey: 'max_eligible_loan_amount' },

    { datakey: 'source_of_gold', apiKey: 'source_of_gold' },
    { datakey: 'customer_photo', apiKey: 'customer_photo' },
    { datakey: 'end_use_of_gold', apiKey: 'end_use_loan' },

    { datakey: 'scheme_name', apiKey: 'scheme_code' },
    { datakey: 'minimum_loan_amount', apiKey: 'scheme_min_loan_amount' },
    { datakey: 'maximum_loan_amount', apiKey: 'scheme_max_loan_amount' },
    { datakey: 'loan_tenure', apiKey: 'tenure' },
    { datakey: 'rate_of_interest', apiKey: 'rate_of_interest' },
    { datakey: 'additional_interest', apiKey: 'additional_interest' },
    { datakey: 'repayment_frequency', apiKey: 'repayment_frequency' },
    { datakey: 'scheme_type', apiKey: 'scheme_type' },
    { datakey: 'eligible_gold_loan_amount', apiKey: 'scheme_eligible_amount' },
    { datakey: 'requested_gold_loan_amount', apiKey: 'requested_loan_amount' },
    { datakey: 'applied_laon_amount', apiKey: 'applied_loan_amount' },
    { datakey: 'total_fees', apiKey: 'total_charge' },

    { datakey: 'balance_transfer_mode', apiKey: 'balance_transfer_mode' },
    { datakey: 'amount', apiKey: 'balance_amount_transfer' },
    { datakey: 'utr_refrence_number', apiKey: 'utr_reference_number' },
    { datakey: 'net_disbursement_to_customer', apiKey: 'net_disbursment' },
    { datakey: 'net_disbursment_mode', apiKey: 'net_disbursment_mode' },
    { datakey: 'gold_pouch_number', apiKey: 'gold_pouch_number' },
    { datakey: 'tare_weight_of_gold_packet', apiKey: 'tare_weight_gold_pouch' },
  ];
  // const netDisbursementVal = parseFloat(formData?.net_disbursment?.replace(/,/g, ''));
  // const cashHandlingChargeFromapi = formData?.charge?.find((ele) => ele.name === 'CASH_HANDLING')?.amount?.amount ?? 0;
  // const totalAmount = netDisbursementVal + cashHandlingChargeFromapi;
  // console.log('cash handling charge fdasfadsfads', totalAmount, netDisbursementVal, cashHandlingChargeFromapi, formData.net_disbursement);
  // setValue('net_disbursement_to_customer', amountFormat.format(totalAmount));
  if (formData.net_disbursment_mode === 'CASH_AND_ONLINE') {
    dataArray.push(
      { datakey: 'online_disbursment_CASH_ONLINE', apiKey: 'online_disbursment' },
      { datakey: 'cash_disbursment_CASH_ONLINE', apiKey: 'cash_disbursment' },
      // remove previous value
      { datakey: 'cash_disbursment_CASH', apiKey: 'cash_disbursment2' },
      { datakey: 'online_disbursment_online', apiKey: 'online_disbursment2' },
    );
  } else if (formData.net_disbursment_mode === 'CASH') {
    dataArray.push(
      { datakey: 'cash_disbursment_CASH', apiKey: 'cash_disbursment' },
      // remove previous value
      { datakey: 'online_disbursment_CASH_ONLINE', apiKey: 'online_disbursment2' },
      { datakey: 'cash_disbursment_CASH_ONLINE', apiKey: 'cash_disbursment2' },
      { datakey: 'online_disbursment_online', apiKey: 'online_disbursment2' },
    );
  } else if (formData.net_disbursment_mode === 'UPI') {
    dataArray.push(
      { datakey: 'online_disbursment_online', apiKey: 'online_disbursment' },
      // remove previous value
      { datakey: 'online_disbursment_CASH_ONLINE', apiKey: 'online_disbursment2' },
      { datakey: 'cash_disbursment_CASH_ONLINE', apiKey: 'cash_disbursment2' },
      { datakey: 'cash_disbursment_CASH', apiKey: 'cash_disbursment2' },
    );
    setValue('upiId', formData?.upi_details?.vpa);
    setValue('upiToken', null);
    setValue('registered_name', formData?.upi_details?.name);
    setValue('upiIDverificationStatus', 'VALID');
  } else {
    dataArray.push(
      { datakey: 'online_disbursment_online', apiKey: 'online_disbursment' },
      // remove previous value
      { datakey: 'online_disbursment_CASH_ONLINE', apiKey: 'online_disbursment2' },
      { datakey: 'cash_disbursment_CASH_ONLINE', apiKey: 'cash_disbursment2' },
      { datakey: 'cash_disbursment_CASH', apiKey: 'cash_disbursment2' },
    );
    setValue('upiId', null);
    setValue('upiToken', null);
    setValue('registered_name', null);
    setValue('upiIDverificationStatus', null);
  }
  if (formData.end_use_loan === 'AGR') {
    setValue('agriculture_record_number', formData.end_use_loan_details.id);
    setValue('subpurpose', formData.end_use_loan_details.subpurpose);
    formData?.end_use_loan_details?.proof?.forEach((ele, ind) => {
      if (ind) {
        setValue(`agriculture_proof_${ind}`, ele);
      } else {
        setValue('agriculture_proof', ele);
      }
    });
  }
  if (formData.end_use_loan === 'BNS') {
    setValue('subpurpose', formData.end_use_loan_details.subpurpose);
    // setValue('udyam_registration_number', formData.end_use_loan_details.id);
    setValue('udyam_mobile_number', formData.end_use_loan_details.udyam_meta_data.mobile_number);
    setValue('udyam_fuzzy_score', formData.end_use_loan_details.udyam_meta_data.fuzzy_match_score);
    if (formData.colender === 'IOB - BUSINESS') {
      if (formData?.end_use_loan_details?.udyam_meta_data?.mode === 'Offline') {
        if (formData?.end_use_loan_details?.udyam_meta_data?.mobile_number) {
          setValue('udyam_manual_upload_postotp', true);
          setValue('udyam_manual_upload', null);
          setValue('udyam_registration_number', formData?.end_use_loan_details?.udyam_meta_data?.reg_no);
          setValue('udyam_mobile_number', formData?.end_use_loan_details?.udyam_meta_data?.mobile_number);
          setValue('udyam_certificate_manual_upload_postotp', formData?.end_use_loan_details?.udyam_meta_data?.proof);
          // formData?.end_use_loan_details?.udyam_meta_data?.proof?.forEach((ele, ind) => {
          //   if (ind) {
          //     setValue(`udyam_certificate_manual_upload_postotp_${ind}`, ele);
          //   } else {
          //     setValue('udyam_certificate_manual_upload_postotp', ele);
          //   }
          // });
        } else {
          setValue('udyam_manual_upload', true);
          setValue('udyam_manual_upload_postotp', null);
          setValue('udyam_registration_number_manual', formData?.end_use_loan_details?.udyam_meta_data?.reg_no);
          setValue('udyam_registration_number_manual_verify', formData?.end_use_loan_details?.udyam_meta_data?.status);

          // udyam_certificate_manual
          formData?.end_use_loan_details?.udyam_meta_data?.proof?.forEach((ele, ind) => {
            if (ind) {
              setValue(`udyam_certificate_manual_${ind}`, ele);
            } else {
              setValue('udyam_certificate_manual', ele);
            }
          });
        }
      } else {
        setValue('udyam_registration_number', formData?.end_use_loan_details?.udyam_meta_data?.reg_no);
        setValue('udyam_mobile_number', formData?.end_use_loan_details?.udyam_meta_data?.mobile_number);
        setValue('udyam_manual_upload_postotp', null);
        setValue('udyam_manual_upload', null);
        setValue('udyam_certificate', formData?.end_use_loan_details?.udyam_meta_data?.proof);
        // setValue('udyma_certificate', formData?.end_use_loan_details?.udyam_meta_data?.proof[0]);
      }
    } else {
      formData?.end_use_loan_details?.proof?.forEach((ele, ind) => {
        if (ind) {
          setValue(`udyam_certificate_other_${ind}`, ele);
        } else {
          setValue('udyam_certificate_other', ele);
        }
      });
    }
  }
  if (formData.colender === 'BOB') {
    setValue('customer_city_of_birth', formData?.colender_data?.customer_city_of_birth ?? null);
    if (formData?.colender_data?.current_date_of_residence) {
      setValue('current_date_of_residence', moment(formData?.colender_data?.current_date_of_residence, 'DD/MM/YYYY').format('MM/DD/YYYY'));
    } else {
      setValue('current_date_of_residence', null);
    }
    if (formData?.colender_data?.permanent_date_of_residence) {
      setValue('permanent_date_of_residence', moment(formData?.colender_data?.permanent_date_of_residence, 'DD/MM/YYYY').format('MM/DD/YYYY'));
    } else {
      setValue('permanent_date_of_residence', null);
    }
  }
  if (!formData.end_use_loan) {
    setValue('subpurpose', null);
    const udyamData = formData?.customerFullDetails?.udyam_data;
    if (udyamData?.proof) {
      setValue('udyam_fuzzy_score', udyamData?.fuzzy_match_score);
      setValue('udyam_requestId', udyamData?.request_id);
      setValue('udyam_otpVerifiedon', udyamData?.otp_verified_on);
      setValue('udyam_mobile_number', udyamData?.mobile_number);
      // setValue('udyam_certificate_manual_upload_postotp', udyamData?.proof);

      if (udyamData?.mode === 'Online') {
        setValue('udyam_registration_number', udyamData?.reg_no);
        setValue('udyam_certificate', udyamData?.proof);
        setValue('udyam_manual_upload', null);
        setValue('udyam_manual_upload_postotp', null);
      } else {
        setValue('udyam_registration_number_manual', udyamData?.reg_no);
        if (udyamData?.mobile_number) {
          setValue('udyam_manual_upload', null);
          setValue('udyam_manual_upload_postotp', true);
          setValue('udyam_certificate_manual_upload_postotp', udyamData?.proof);
        } else {
          setValue('udyam_certificate_manual', udyamData?.proof);
          setValue('udyam_registration_number_manual_verify', true);
          setValue('udyam_manual_upload', true);
          setValue('udyam_manual_upload_postotp', null);
        }
      }
    } else {
      setValue('udyam_registration_number', null);
      setValue('udyam_mobile_number', null);
      setValue('udyam_fuzzy_score', null);
      setValue('udyam_requestId', null);
      setValue('udyam_otpVerifiedon', null);
      setValue('udyam_certificate', '');
      setValue('udyam_certificate_manual_upload_postotp', '');
      setValue('udyam_registration_number_manual', null);
      setValue('udyam_certificate_manual', null);
      setValue('udyamOTP', null);
      setValue('udyam_failure_reason', null);
      setValue('udyam_certificate_postOTP', null);
      setValue('udyam_manual_upload', null);
      setValue('udyam_manual_upload_postotp', null);
      setValue('udyam_registration_number_manual_verify', null);
    }
  }
  dataArray.forEach((data) => {
    if (data?.datakey === 'total_fees' && formData[data.apiKey] === 0) {
      setValue(data.datakey, '0');
    } else {
      setValue(data.datakey, formData[data.apiKey]);
    }
  });
  setValue('sum_insured', formData?.insurance_details?.sum_insured);
  setValue('premium_amount', formData?.insurance_details?.premium);
  const stage = ['stage1', 'stage2', 'stage3', 'stage4', 'stage5', 'stage6', 'stage7', 'stage8', 'stage9'];
  const index = stage.findIndex((singleStage) => singleStage === formData?.application_stage);
  const step = index > -1 ? index : 0;
  if (step === 5) {
    setValue('bundled_insurance', 'YES');
  } else {
    setValue('bundled_insurance', formData?.bundled_insurance ? 'YES' : 'NO');
  }
  return step !== (stage.length - 1) ? step : step;
};

const setValueInCollateral = (formValues, callback, setValue) => {
  const state = store.getState();
  const { formData } = state.loanMaker;
  formData?.items?.forEach((item, index) => {
    setValue(`item_name${index > 0 ? `__${index}` : ''}`, item.name);
    setValue(`other_item_name${index > 0 ? `__${index}` : ''}`, item.other_name);
    setValue(`item_count${index > 0 ? `__${index}` : ''}`, item.item_count);
    setValue(`total_weight${index > 0 ? `__${index}` : ''}`, item.total_weight_gm);
    setValue(`breads_stone_weight${index > 0 ? `__${index}` : ''}`, item.stone_weight_gm?.toString());
    setValue(`purity${index > 0 ? `__${index}` : ''}`, item.purity?.replace('K', ''));
    setValue(`net_weight_after_purity${index > 0 ? `__${index}` : ''}`, item.net_weight_gm);
    setValue(`ornament_live_photo${index > 0 ? `__${index}` : ''}`, item.item_pic);
  });
};

const handleReset = (data, reset) => {
  const state = store.getState();
  const { formData } = state.loanMaker;
  const resetData = {
    ...data,
    consolidated_picture_of_ornament: formData?.items_pic,
    total_net_bread_stone_weight: formData?.total_stone_weight_gm,
    total_net_count_of_all_item: formData?.total_count,
    total_net_weight_of_all_item: formData?.total_net_weight_gm,
    net_weight_after_purity: data?.net_weight_after_purity,
    source_of_gold: formData?.source_of_gold,
    customer_photo: formData?.customer_photo,
    end_use_of_gold: formData?.end_use_loan,
  };
  reset(resetData);
};

const updateLabel = (string) => {
  const splitStr = string.toLowerCase().split(' ');
  for (let i = 0; i < splitStr.length; i += 1) {
    splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  return splitStr.join(' ');
};

const handleLoanAccount = (values, callback, index, setValue, formDetails, fieldName) => {
  const allLoanAccountToSelect = formDetails.form[values?.activeFormIndex]?.input.filter((item) => item.name.includes('loan_account_number'));
  const currentSelectedLoanAcc = allLoanAccountToSelect.filter((item) => item.name === fieldName);
  if (allLoanAccountToSelect.length && currentSelectedLoanAcc.length) {
    const availableOptions = currentSelectedLoanAcc[0]?.option.filter((opt) => opt !== currentSelectedLoanAcc[0].defaultValue);
    allLoanAccountToSelect.forEach((item) => {
      item.option = [item.defaultValue, ...availableOptions];
    });
  }
};

const handleLoanAccountDelete = (value, formDetails) => {
  const currentLoanAccountToSelect = formDetails.form[value?.activeFormIndex]?.input.filter((item) => item.name.includes('loan_account_number'));
  if (currentLoanAccountToSelect.length) {
    const lastRow = currentLoanAccountToSelect[currentLoanAccountToSelect.length - 1];
    if (lastRow.defaultValue) {
      currentLoanAccountToSelect.forEach((item) => {
        item.option = [...item.option, lastRow.defaultValue];
      });
    }
  }
};

export {
  purityCalculation, handleScheme, handleLoanKawach, updateReadOnlyFields, calculateRpa, generateFeeFields,
  calculateNetDisbursement, setValueInCollateral, updateFormState, handleLoanAccount, handleLoanAccountDelete,
  formulaOfNetDisbursement, handleReset, updateLabel, calculateNetDisbursementOnline, upiVerify, upiOptionhandler, udyamSendOtp,
  calculateCashHandlingCharge, calculateNetCashDisbursement, formulaOfCashHandlingCharge, CASH_HANDLING
};
