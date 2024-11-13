/* eslint-disable no-unreachable */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
import store from '../../../../redux/store';
import { getDecodedToken } from '../../../../utils';
import {
  IDENTIFIER, REGEX, FUNCTION_IDENTIFIER, MODULE
} from '../../../../constants';
import {
  purityCalculation, updateReadOnlyFields, handleScheme, handleLoanKawach, calculateRpa, generateFeeFields,
  calculateNetDisbursement, setValueInCollateral, updateFormState, handleLoanAccount, handleLoanAccountDelete,
  formulaOfNetDisbursement, updateLabel, calculateNetDisbursementOnline, upiVerify, upiOptionhandler, calculateCashHandlingCharge, calculateNetCashDisbursement, CASH_HANDLING
} from './helperFunction';
import {
  CollateralDataSAveAPi, ConsolidateDataSAveAPi, GoldInfoDataSAveAPi, finalDataSAveAPi,
  schemeDataSAveAPi, FeeDataSAveAPi, InterAccountDataSAveAPi, BalanceTransferDataSAveAPi,
  AdditionalGoldDataSAveAPi, isAllowed
} from './apiFunction';
import { Service } from '../../../../service';

const amountFormat = Intl.NumberFormat('en-IN');

const nextHandler = async (step, currentStep, setAlertShow, allStepsData, setIsLoading, navigate, losConfigData) => {
  try {
    const state = store.getState();
    const { formData } = state.loanMaker;
    let upiToken = null;
    if (currentStep === 6 && allStepsData.net_disbursment_mode === 'UPI' && !allStepsData.upiToken) {
      const firstName = formData.first_name ?? '';
      const middleName = formData.middle_name ? ` ${formData.middle_name}` : '';
      const lastName = formData.last_name ? ` ${formData.last_name}` : '';
      const customerName = firstName + middleName + lastName;

      const payload = {
        virtualAddress: allStepsData.upiId,
        customer_name: customerName,
      };
      const { data } = await Service.post(process.env.REACT_APP_VALIDATE_UPI, payload);
      upiToken = data.data.upi_verify_token;
      if (parseFloat(data.data.vpaDetails.limit) < allStepsData.online_disbursment_online) {
        const errorMessage = 'Max. 1Lac amount is allowed for disbursement on same UPI ID within 24hrs. The requested amount exceeds this limit';
        setAlertShow({
          open: true,
          msg: errorMessage,
          alertType: 'error'
        });
        return;
      }
    }
    switch (currentStep) {
      case 0:
        return CollateralDataSAveAPi(step, setAlertShow);
      case 1:
        return ConsolidateDataSAveAPi(step, setAlertShow);
      case 2:
        return GoldInfoDataSAveAPi(step, setAlertShow, null, allStepsData, setIsLoading);
      case 3:
        return schemeDataSAveAPi(step, setAlertShow);
      case 4:
        return FeeDataSAveAPi(step, setAlertShow);
      case 5:
        return InterAccountDataSAveAPi(step, setAlertShow, null, losConfigData);
      case 6:
        return BalanceTransferDataSAveAPi(step, setAlertShow, null, upiToken, losConfigData);
      case 7:
        return AdditionalGoldDataSAveAPi(step, setAlertShow);
      case 8:
        return finalDataSAveAPi(step, setAlertShow, null, setIsLoading, navigate);
      default:
        console.log('onNext', step, currentStep);
    }
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
  }
};

const backHandler = (step, currentStep) => {
  console.log('onback', step, currentStep);
};
const handleDynamicValidation = (values, setError, clearErrors) => {
  let response = false;
  if (parseFloat(values.requested_gold_loan_amount.replace(/,/g, '')) < parseFloat(values.minimum_loan_amount.replace(/,/g, ''))) {
    setError('requested_gold_loan_amount', { type: 'custom', customMsg: 'Requested Loan Amount cannot be less than Minimum loan amount' });
    response = true;
  } else if (parseFloat(values.requested_gold_loan_amount.replace(/,/g, ''))
  > parseFloat(values.eligible_gold_loan_amount.replace(/,/g, ''))) {
    setError('requested_gold_loan_amount', { type: 'custom', customMsg: 'Requested Loan Amount cannot be greater than Eligible Gold Loan Amount' });
    response = true;
  } else if (parseFloat(values.requested_gold_loan_amount.replace(/,/g, ''))
  > parseFloat(values.applied_laon_amount.replace(/,/g, ''))) {
    setError('requested_gold_loan_amount', { type: 'custom', customMsg: 'Requested Loan Amount cannot be greater than Applied Loan Amount' });
    response = true;
  } else if (parseFloat(values.requested_gold_loan_amount.replace(/,/g, ''))
  > parseFloat(values.maximum_loan_amount.replace(/,/g, ''))) {
    setError('requested_gold_loan_amount', { type: 'custom', customMsg: 'Requested Loan Amount cannot be greater than Eligible Gold Loan Amount' });
    response = true;
  } else {
    clearErrors('min_loan_amt');
  }
  return response;
};
const handleDynamicValidationAdditional = (values, setError) => {
  let response = false;
  const {
    total_net_weight_of_all_item, tare_weight_of_gold_packet,
    deviations
  } = values;
  if (parseFloat(total_net_weight_of_all_item) > parseFloat(tare_weight_of_gold_packet)) {
    setError('tare_weight_of_gold_packet', { type: 'custom', customMsg: 'TARE Weight of Gold Packet should be greater than or equal to Total Weight of All Items (in gram)' });
    response = true;
  } else if (Object.values(deviations).length > 0) {
    Object.values(deviations).forEach((item, index) => {
      if (item.maker_remarks === '') {
        setError(`justification${index}`, { type: 'custom', customMsg: 'Please enter justification.' });
        response = true;
      }
    });
  }
  return response;
};

const handleDynamicValidationInter = (values, setError, setAlertShow) => {
  let response = false;
  const state = store.getState();
  const { formData } = state.loanMaker;
  console.log('formData =====>', formData);
  const keys = Object.keys(values);
  let requestAmount = parseInt(values.requested_gold_loan_amount.replace(/,/g, ''), 10) - values.total_fees;
  const collateralData = keys.filter((item) => item.includes('amount_to_transfer'));
  collateralData.forEach((item) => {
    const nameArray = item.split('__');
    const index = (nameArray.length > 1) ? `__${nameArray[nameArray.length - 1]}` : '';
    if (!['', undefined, null].includes(values[`amount_to_transfer${index}`]) && (values[`loan_account_number${index}`] === '' || values[`loan_account_number${index}`] === undefined || values[`loan_account_number${index}`] === null)) {
      setError(`loan_account_number${index}`, { type: 'custom', customMsg: 'Loan Account Number is required!' });
      response = true;
    }
    if (!['', undefined, null].includes(values[`loan_account_number${index}`]) && (values[`amount_to_transfer${index}`] === '' || values[`amount_to_transfer${index}`] === undefined || values[`amount_to_transfer${index}`] === null)) {
      setError(`amount_to_transfer${index}`, { type: 'custom', customMsg: 'Amount to transfer is required!' });
      response = true;
    }
    const loanToCheck = formData?.loan_detail?.filter((loan) => loan.lan.trim() === values[`loan_account_number${index}`].trim());
    if (loanToCheck?.length && parseFloat(values[`amount_to_transfer${index}`].replace(/,/g, '')) > Math.ceil(loanToCheck[0].total_outstanding_for_foreclosure)) {
      setError(`amount_to_transfer${index}`, { type: 'custom', customMsg: `Amount to transfer must be less than equal to ${amountFormat.format(Math.ceil(loanToCheck[0].total_outstanding_for_foreclosure))}` });
      response = true;
    } else if (requestAmount < parseFloat(values[`amount_to_transfer${index}`].replace(/,/g, ''))) {
      setError(`amount_to_transfer${index}`, { type: 'custom', customMsg: 'Amount to transfer must be less than equal to requested loan amount' });
      response = true;
    } else {
      requestAmount -= (typeof values[`amount_to_transfer${index}`] === 'string') ? parseFloat(values[`amount_to_transfer${index}`].replace(/,/g, '')) : values[`amount_to_transfer${index}`];
    }
  });
  let totalAmountToFundTransfer = 0;
  collateralData.forEach((item) => {
    if (!['', undefined, null].includes(values[item]) && typeof values[item] === 'string') {
      totalAmountToFundTransfer += parseFloat(values[item].replace(/,/g, ''));
    }
  });

  const premiumAmount = values.premium_amount ? values.premium_amount : 0;
  const insuranceObj = formData?.charge?.filter((item) => item.name === 'INSURANCE')[0];
  const insuranceVal = insuranceObj?.value ?? 0;
  const netAmount = formulaOfNetDisbursement(values) + insuranceVal;
  if (typeof values?.amount === 'string') {
    values.amount = parseFloat(values.amount.replace(/,/g, ''));
  }
  totalAmountToFundTransfer += parseInt(values?.amount, 10);
  if (totalAmountToFundTransfer > parseInt((netAmount + values.amount), 10)) {
    setAlertShow({ open: true, msg: 'Fund transfer amounts cannot be greater than net disbursement to customer', alertType: 'error' });
    response = true;
  }
  if (netAmount - premiumAmount < 0) {
    setAlertShow({ open: true, msg: 'Net disbursement to customer cant be negative. Select lesser Sum Insured option.', alertType: 'error' });
    response = true;
  }
  return response;
};

const ChartDataProvider = (schemeType) => {
  const state = store.getState();
  const { formData } = state.loanMaker;
  if (schemeType === 'REB') {
    return formData.rebateSlabDetails;
  }
  return formData.rebateStepupSlabDetails;
};

const handleDynamicValidationBalance = (values, setError) => {
  let response = false;
  const state = store.getState();
  const { formData } = state.loanMaker;
  const cashCharge = formData?.charge?.find((ele) => ele.name === CASH_HANDLING);
  const total = formulaOfNetDisbursement(values);
  let netAmount = total;
  if (cashCharge) {
    netAmount += cashCharge?.amount?.amount;
    netAmount += cashCharge?.amount?.gst;
  }
  if (typeof values?.cash_disbursment_CASH === 'string') {
    values.cash_disbursment_CASH = parseFloat(values?.cash_disbursment_CASH.replace(/,/g, ''));
  }
  if (typeof values?.online_disbursment_online === 'string') {
    values.online_disbursment_online = parseFloat(values?.online_disbursment_online.replace(/,/g, ''));
  }
  if (typeof values?.cash_disbursment_CASH_ONLINE === 'string') {
    values.cash_disbursment_CASH_ONLINE = parseFloat(values?.cash_disbursment_CASH_ONLINE.replace(/,/g, ''));
  }
  switch (values.net_disbursment_mode) {
    case 'CASH':
      if (parseInt(values?.cash_disbursment_CASH, 10) > 19999) {
        setError('cash_disbursment_CASH', { type: 'custom', customMsg: 'Cash disbursement amount should be less than or equal to 19,999' });
        response = true;
        break;
      }
      if (parseInt(values?.cash_disbursment_CASH, 10) > parseInt((netAmount), 10)) {
        setError('cash_disbursment_CASH', { type: 'custom', customMsg: 'Cash Disbursement cannot be greater than net disbursement to customer' });
        response = true;
      }
      break;
    case 'ONLINE':
      if (parseInt(values?.online_disbursment_online, 10) > parseInt((netAmount), 10)) {
        setError('online_disbursment_online', { type: 'custom', customMsg: 'Online Disbursement cannot be greater than net disbursement to customer' });
        response = true;
      }
      break;
    case 'CASH_AND_ONLINE':
      if (parseInt(values?.cash_disbursment_CASH_ONLINE, 10) > 19999) {
        setError('cash_disbursment_CASH_ONLINE', { type: 'custom', customMsg: 'Cash disbursement amount should be less than or equal to 19,999' });
        response = true;
        break;
      }
      if (parseInt(values?.cash_disbursment_CASH_ONLINE, 10) > parseInt((netAmount), 10)) {
        setError('cash_disbursment_CASH_ONLINE', { type: 'custom', customMsg: 'Cash Disbursement cannot be greater than net disbursement to customer' });
        response = true;
      }
      break;
    default:
      break;
  }
  return response;
};

const handleDynamicValidationCollateral = (values, setError) => {
  let response = false;
  const keys = Object.keys(values);
  const collateralData = keys.filter((item) => item.includes('item_name'));
  collateralData.forEach((item) => {
    const nameArray = item.split('__');
    const index = (nameArray.length > 1) ? `__${nameArray[nameArray.length - 1]}` : '';
    if (parseFloat(values[`breads_stone_weight${index}`]) >= parseFloat(values[`total_weight${index}`])) {
      setError(`breads_stone_weight${index}`, { type: 'custom', customMsg: 'Beads/Stone weight cannot be greater than equal to total weight' });
      response = true;
    }
    if (!values[`ornament_live_photo${index}`]) {
      setError(`ornament_live_photo${index}`, { type: 'custom', customMsg: 'Please Capture Ornament live photo' });
      response = true;
    }
  });
  return response;
};

export const formJsonDetailsEdit = (dispatch, resendReducer, setAlertShow, setFormDetails, losConfigData, ornamentsList, cityCodeMapping, setIsLoading, navigate) => {
  const state = store.getState();
  const { schemeData } = state.user;
  const { formData } = state.loanMaker;
  const { customerFullDetails } = formData;
  const udyamData = customerFullDetails?.udyam_data;
  const { LOS } = MODULE;

  const insurance = [];
  Object.keys(losConfigData).forEach((ele) => {
    insurance.push({ label: ele, value: [losConfigData[ele].insurance] });
  });

  const sumInsuredSetter = (values, callback) => {
    try {
      const premiumValues = losConfigData?.[formData?.colender]?.insurance;
      const sumInsuredOptions = premiumValues?.map((ele) => (ele.sum_insured));
      callback(sumInsuredOptions ?? []);
    } catch (e) {
      console.log('Error', e);
    }
  };
  const udyamSendOtp = async (value) => {
    // return {
    //   success: false,
    //   failureResponse: 0
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
      setAlertShow({
        open: true,
        msg: 'Something went wrong. Please Verify Udyam Registration number and manually upload Udyam certificate.',
        alertType: 'error'
      });
      return {
        success: false,
        failureResponse: 0
      };
    }
  };

  const udyamValidateOtp = async (values) => {
    dispatch(resendReducer('VERIFIED'));
    try {
      const { udyamOTP, udyam_registration_number, udyam_requestId } = values;
      const firstName = formData.first_name ?? '';
      const middleName = formData.middle_name ? ` ${formData.middle_name}` : '';
      const lastName = formData.last_name ? ` ${formData.last_name}` : '';
      const customerName = firstName + middleName + lastName;

      const payload = {
        udyamRegistrationNo: udyam_registration_number,
        otp: udyamOTP,
        udyamResponseType: 'URL',
        requestId: udyam_requestId,
        customer_name: customerName,
      };

      const { data } = await Service.post(process.env.REACT_APP_UDYAM_VERIFY_OTP, payload);
      if (data.success) {
        dispatch(resendReducer('VERIFIED'));
        setAlertShow(
          {
            open: true,
            msg: 'Otp verified successfully',
          }
        );
        return {
          success: true,
          successResponse: 1,
          url: data.s3_file_path,
          fuzzyScore: data.fuzzy_score
        };
      }
      setAlertShow({
        open: true,
        msg: 'Udyam API failed',
        alertType: 'error'
      });
      dispatch(resendReducer('VERIFIED'));
      return {
        success: false,
        failureResponse: 0
      };
    } catch (e) {
      console.log('Error', e);
      let errorMsg = 'Something went wrong. Please try again!';
      const apiResponse = e?.response?.data;
      if (apiResponse?.hasOwnProperty('success')) {
        if (apiResponse?.data?.hasOwnProperty('errors')) {
          if (apiResponse?.data?.errors?.[0]) {
            errorMsg = apiResponse.data.errors[0];
          }
        } else {
          errorMsg = apiResponse.message;
        }
      }
      // const trimmedError = errorMsg.replace(/\s/g, '').toLowerCase();
      if (errorMsg === 'OTP_VERIFICATION_FAILED') {
        setAlertShow({
          open: true,
          msg: 'Invalid OTP. Please enter valid OTP.',
          alertType: 'error'
        });
        return {
          success: false,
          failureResponse: 1
        };
      }
      setAlertShow({
        open: true,
        msg: 'Validate OTP API failed. Please manually upload udyam certificate(s)',
        alertType: 'error'
      });
      dispatch(resendReducer('VERIFIED'));
      return {
        success: false,
        failureResponse: 0
      };
    }
  };
  const endUseAdditionFields = [
    {
      name: 'agriculture_record_number',
      label: 'Agriculture',
      identifier: IDENTIFIER.EndUseOfGoldGrid,
      condition: {
        type: 'showOnValue',
        baseOn: 'end_use_of_gold',
        baseValue: 'AGR'
      },
      isVerify: false,
      inputField: {
        name: 'agriculture_record_number',
        label: 'Agriculture Record Number',
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter agriculture record number'
        }
      },
      uploadField: {
        name: 'agriculture_proof',
        label: 'Upload Agriculture Proof ',
        filePath: `${LOS?.name}/${LOS?.details?.agricultureProof}`,
        validation: {
          isRequired: true,
          requiredMsg: 'Please upload agriculture proof',
          maxUploadCount: 5,
          maxUploadMsg: 'Maximum Upload limit reached for agriculture proof'
        }
      }
    }
  ];
  let endUseLoanOptions = [
    { value: 'MRG', label: 'Marriage' },
    { value: 'PNL', label: 'Personal' },
    { value: 'BNS', label: 'Business' },
    { value: 'EDN', label: 'Education' },
    { value: 'IFT', label: 'Infrastructure' },
    { value: 'AGR', label: 'Agriculture' }
  ];
  if (formData.colender === 'IOB - AGRI') {
    endUseLoanOptions = [
      { value: 'AGR', label: 'Agriculture' }
    ];
  }
  if (formData.colender === 'IOB - BUSINESS') {
    endUseLoanOptions = [
      { value: 'BNS', label: 'Business' }
    ];
  }
  if (formData.colender === 'BOB') {
    endUseLoanOptions = [
      { value: 'PNL', label: 'Personal' }
    ];
  }
  let endUseSubPurpose = [
    { value: 'Dairy', label: 'Dairy' },
    { value: 'Poultry', label: 'Poultry' },
    { value: 'Fisheries', label: 'Fisheries' },
    { value: 'Bee- keeping', label: 'Bee- keeping' },
    { value: 'Animal Husbandry', label: 'Animal Husbandry' },
    { value: 'Sericulture', label: 'Sericulture' }
  ];
  if (formData.colender === 'IOB - BUSINESS') {
    endUseSubPurpose = [
      { value: 'In Service', label: 'In Service' },
      { value: 'Trading', label: 'Trading' }
    ];
  }
  const goldInformation = {
    title: 'Gold Information',
    variant: 'outlined',
    input: [
      {
        name: 'source_of_gold',
        label: updateLabel('Source of Gold'),
        type: 'select',
        identifier: IDENTIFIER.SELECT,
        option: [
          { label: 'Ancestral', value: 'ATL' },
          { label: 'Self-Purchased', value: 'SPD' },
          { label: 'Gift', value: 'GFT' }
        ],
        validation: {
          isRequired: true,
          requiredMsg: 'Please select Source of Gold',
        }
      },
      {
        name: 'maker_name',
        label: updateLabel('Maker Name'),
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT2,
        disabled: true,
        defaultValue: getDecodedToken()?.fullname
      },
      {
        name: 'maker_emp_code',
        label: updateLabel('Maker Employee Code'),
        type: 'text',
        identifier: IDENTIFIER.INPUTTEXT2,
        disabled: true,
        defaultValue: getDecodedToken()?.emp_code
      },
      {
        name: 'customer_photo',
        label: updateLabel('Customer Photo'),
        type: 'file',
        identifier: IDENTIFIER.LIVEPHOTO,
        filePath: `${LOS?.name}/${LOS?.details?.customerPicture}`,
        validation: {
          isRequired: true,
          requiredMsg: 'Please Capture Customer Photo',
        }
      },
      {
        name: 'end_use_of_gold',
        label: updateLabel('End use of Gold'),
        type: 'select',
        identifier: IDENTIFIER.SELECT,
        option: endUseLoanOptions,
        onChange: {
          HOM: {
            unregisterFields: [
              'udyam_certificate_other',
              'udyam_certificate_other_1',
              'udyam_certificate_other_2',
              'udyam_certificate_other_3',
              'udyam_certificate_other_4',
              'agriculture_proof',
              'agriculture_proof_1',
              'agriculture_proof_2',
              'agriculture_proof_3',
              'agriculture_proof_4',
            ],
          },
          MED: {
            unregisterFields: [
              'udyam_certificate_other',
              'udyam_certificate_other_1',
              'udyam_certificate_other_2',
              'udyam_certificate_other_3',
              'udyam_certificate_other_4',
              'agriculture_proof',
              'agriculture_proof_1',
              'agriculture_proof_2',
              'agriculture_proof_3',
              'agriculture_proof_4',
            ],
          },
          TRV: {
            unregisterFields: [
              'udyam_certificate_other',
              'udyam_certificate_other_1',
              'udyam_certificate_other_2',
              'udyam_certificate_other_3',
              'udyam_certificate_other_4',
              'agriculture_proof',
              'agriculture_proof_1',
              'agriculture_proof_2',
              'agriculture_proof_3',
              'agriculture_proof_4',
            ],
          },
          MRG: {
            unregisterFields: [
              'udyam_certificate_other',
              'udyam_certificate_other_1',
              'udyam_certificate_other_2',
              'udyam_certificate_other_3',
              'udyam_certificate_other_4',
              'agriculture_proof',
              'agriculture_proof_1',
              'agriculture_proof_2',
              'agriculture_proof_3',
              'agriculture_proof_4',
            ],
          },
          PNL: {
            unregisterFields: [
              'udyam_certificate_other',
              'udyam_certificate_other_1',
              'udyam_certificate_other_2',
              'udyam_certificate_other_3',
              'udyam_certificate_other_4',
              'agriculture_proof',
              'agriculture_proof_1',
              'agriculture_proof_2',
              'agriculture_proof_3',
              'agriculture_proof_4',
            ],
          },
          BNS: {
            unregisterFields: [
              'agriculture_proof',
              'agriculture_proof_1',
              'agriculture_proof_2',
              'agriculture_proof_3',
              'agriculture_proof_4',
            ],
          },
          EDN: {
            unregisterFields: [
              'udyam_certificate_other',
              'udyam_certificate_other_1',
              'udyam_certificate_other_2',
              'udyam_certificate_other_3',
              'udyam_certificate_other_4',
              'agriculture_proof',
              'agriculture_proof_1',
              'agriculture_proof_2',
              'agriculture_proof_3',
              'agriculture_proof_4',
            ],
          },
          IFT: {
            unregisterFields: [
              'udyam_certificate_other',
              'udyam_certificate_other_1',
              'udyam_certificate_other_2',
              'udyam_certificate_other_3',
              'udyam_certificate_other_4',
              'agriculture_proof',
              'agriculture_proof_1',
              'agriculture_proof_2',
              'agriculture_proof_3',
              'agriculture_proof_4',
            ],
          },
          AGR: {
            unregisterFields: [
              'udyam_certificate_other',
              'udyam_certificate_other_1',
              'udyam_certificate_other_2',
              'udyam_certificate_other_3',
              'udyam_certificate_other_4',
            ],
          }
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please select End use of Gold',
        }
      }
    ],
    buttonDetails: {
      name: 'Next',
      previous: 'Back',
    },
    alignment: {
      xs: 12,
      sm: 12,
      md: 4,
      lg: 4,
      xl: 4
    }
  };
  if (formData.colender === 'BOB') {
    goldInformation.input.push(
      {
        name: 'customer_city_of_birth',
        label: updateLabel('Customer Place of Birth'),
        type: 'text',
        identifier: IDENTIFIER.AUTOCOMPLETE,
        option: cityCodeMapping,
        validation: {
          isRequired: true,
          requiredMsg: 'Please select Customer Place of Birth',
        }
      },
      {
        name: 'current_date_of_residence',
        label: 'Currrent Address Residing Since Date',
        type: 'date',
        identifier: IDENTIFIER.DATEPICKER,
        isFutureDateDisable: true,
        isPastDateDisable: false,
        readonly: true,
        greaterDateDisable: null,
        disableYears: (currentDate) => null,
        validation: {
          isRequired: true,
          requiredMsg: 'Please select current residing since date.',
        }
      },
      {
        name: 'permanent_date_of_residence',
        label: 'Permanent Address Residing Since Date',
        type: 'date',
        identifier: IDENTIFIER.DATEPICKER,
        isFutureDateDisable: true,
        isPastDateDisable: false,
        readonly: true,
        greaterDateDisable: null,
        disableYears: (currentDate) => null,
        validation: {
          isRequired: true,
          requiredMsg: 'Please select permanent residing since date.',
        }
      }
    );
  }
  const udyamField = {
    name: 'udyam_registration_number',
    label: 'Udyam',
    identifier: IDENTIFIER.EndUseOfGoldGrid,
    condition: {
      type: 'showOnValue',
      baseOn: 'end_use_of_gold',
      baseValue: 'BNS'
    },
    // condition: {
    //   type: 'doNotShowOn',
    //   baseOn: 'colender',
    //   baseValue: 'IOB - BUSINESS'
    // },
    isVerify: true,
    inputField: {
      name: 'udyam_registration_number',
      label: 'Udyam Registration Number',
      validation: {
        isRequired: true,
        requiredMsg: 'Please enter udyam registration number',
        pattern: REGEX.UDYAMNUMBER,
        patternMsg: 'Please enter valid udyam registration number'
      },
      alignment: {
        xs: 8,
        sm: 8,
        md: 8,
        lg: 8,
        xl: 8
      }
    },
    uploadField: {
      name: 'udyam_certificate_other',
      label: 'Udyam Certificate',
      filePath: `${LOS?.name}/${LOS?.details?.udyamCertificate}`,
      validation: {
        isRequired: true,
        requiredMsg: 'Please upload udyam certificate',
        maxUploadCount: 5,
        maxUploadMsg: 'Maximum Upload limit reached for udyam certificate'
      }
    }
  };
  console.log('---formData----', formData);

  if (['IOB - AGRI', 'IOB - BUSINESS'].includes(formData.colender)) {
    goldInformation.input.push({
      name: 'subpurpose',
      label: 'Sub Purpose',
      type: 'select',
      identifier: IDENTIFIER.SELECT,
      option: endUseSubPurpose,
      validation: {
        isRequired: true,
        requiredMsg: 'Please select Sub Purpose',
      },
    });
    goldInformation.input.push(...endUseAdditionFields);
    if (formData.colender === 'IOB - AGRI') {
      goldInformation.input.push(udyamField);
    }
  } else {
    goldInformation.input.push(...endUseAdditionFields);
    goldInformation.input.push(udyamField);
  }
  const goldInfoBackDynamicHandler = (unregister) => {
    if (!udyamData?.proof) {
      return {
        unregisterFields: [
          'udyam_certificate_manual',
          'udyam_certificate_manual_1',
          'udyam_certificate_manual_2',
          'udyam_certificate_manual_3',
          'udyam_certificate_manual_4',
          'udyam_certificate_other',
          'udyam_certificate_other_1',
          'udyam_certificate_other_2',
          'udyam_certificate_other_3',
          'udyam_certificate_other_4',
          'agriculture_proof',
          'agriculture_proof_1',
          'agriculture_proof_2',
          'agriculture_proof_3',
          'agriculture_proof_4',
        ],
        disable: {
          value: false,
          disableFields: ['udyam_registration_number', 'udyam_mobile_number'],
        },
        resetFieldValidation: {
          udyam_registration_number: {
            isRequired: true,
            requiredMsg: 'Please enter udyam registration number',
            pattern: REGEX.UDYAMNUMBER,
            patternMsg: 'Please enter valid udyam registration number'
          },
          udyam_mobile_number: {
            isRequired: true,
            requiredMsg: 'Please enter your Registered Udyam mobile number',
            pattern: REGEX.MOBILENUMBER,
            patternMsg: 'Please enter valid Mobile number.'
          },
          // udyam_certificate_manual_upload_postotp: {
          //   isRequired: false
          // }
        },
        // reset: {
        //   currentForm: [
        //     'udyam_manual_upload', 'udyam_manual_upload_postotp'
        //   ]
        // },
        condition: {
          currentForm: [
            {
              name: 'udyamOTP',
              condition: 'isShow',
              value: false
            },
            {
              name: 'udyam_certificate',
              condition: 'isShow',
              value: false
            },
            {
              name: 'udyam_certificate_manual_upload_postotp',
              condition: 'isShow',
              value: false
            },
            {
              name: 'udyam_registration_number_manual',
              condition: 'isShow',
              value: false
            },
            {
              name: 'udyam_registration_number',
              condition: 'isShow',
              value: true
            },
            {
              name: 'udyam_mobile_number',
              condition: 'isShow',
              value: true
            },
            {
              name: 'udyam_certificate_postOTP',
              condition: 'isShow',
              value: false
            }
          ]
        },
      };
    }
    return null;
  };
  if (formData.colender === 'IOB - BUSINESS') {
    // const IOBUdyamFields = [
    //   {
    //     name: 'udyam_registration_number',
    //     label: 'Udyam Registration Number',
    //     identifier: IDENTIFIER.INPUTTEXT,
    //     // condition: {
    //     //   type: 'showOnValue',
    //     //   baseOn: 'applied_for',
    //     //   baseValue: 'IOB - BUSINESS'
    //     // },
    //     disabled: !!formData?.end_use_loan_details?.id,
    //     validation: {
    //       isRequired: true,
    //       requiredMsg: 'Please enter udyam registration number',
    //       pattern: REGEX.UDYAMNUMBER,
    //       patternMsg: 'Please enter valid udyam registration number'
    //     },
    //   },
    //   {
    //     name: 'udyam_mobile_number',
    //     label: 'Udyam Registered Mobile Number',
    //     isErrorHandled: true,
    //     type: 'text',
    //     identifier: IDENTIFIER.INPUTBUTTONOTP,
    //     disabled: !!formData?.end_use_loan_details?.id,
    //     function: udyamSendOtp,
    //     apiBody: ['udyam_mobile_number', 'udyam_registration_number'],
    //     disableTime: 1000,
    //     count: 180,
    //     status: true,
    //     buttonDetails: {
    //       isCall: false,
    //       isOtp: true,
    //       callName: 'CALL',
    //       sendOTP: 'SEND OTP'
    //     },
    //     success: [{
    //       showField: [{
    //         name: 'udyamOTP',
    //         condition: 'isShow',
    //         value: true
    //       }],
    //       resetFields: ['udyamOTP'],
    //       status: true,
    //       setValueArr: [{
    //         apiKey: 'requestId',
    //         name: 'udyam_requestId'
    //       }],
    //     }, {
    //       showField: [{
    //         name: 'udyam_certificate',
    //         condition: 'isShow',
    //         value: true
    //       }],
    //       disable: {
    //         value: true,
    //         disableOnValue: true,
    //         disableFields: ['udyam_mobile_number', 'udyam_registration_number'],
    //       },
    //       setValueArr: [{
    //         apiKey: 'url',
    //         name: 'udyam_certificate'
    //       }, {
    //         apiKey: 'fuzzyScore',
    //         name: 'udyam_fuzzy_score'
    //       }],
    //     }],
    //     fail: [{
    //       resetFields: ['udyamOTP'],
    //       status: true,
    //       setValueArr: [{
    //         apiKey: 'error',
    //         name: 'udyam_failure_reason'
    //       }, {
    //         value: null,
    //         name: 'udyam_certificate'
    //       }, {
    //         value: null,
    //         name: 'udyam_certificate_postOTP'
    //       }]
    //     }, {
    //       resetFields: ['udyamOTP'],
    //       status: false,
    //       setValueArr: [{
    //         value: null,
    //         name: 'udyam_certificate'
    //       }, {
    //         value: null,
    //         name: 'udyam_certificate_postOTP'
    //       }]
    //     }],
    //     enablebutton: {
    //       length: 10
    //     },
    //     validation: {
    //       isRequired: true,
    //       requiredMsg: 'Please enter your Registered Udyam mobile number',
    //       pattern: REGEX.MOBILENUMBER,
    //       patternMsg: 'Please enter valid Mobile number.'
    //     },
    //   },
    //   {
    //     name: 'udyamOTP',
    //     label: 'Enter Udyam OTP',
    //     type: 'text',
    //     identifier: IDENTIFIER.INPUTOTP,
    //     show: 'initial',
    //     function: udyamValidateOtp,
    //     apiBody: ['udyamOTP', 'udyam_registration_number', 'udyam_requestId'],
    //     status: false,
    //     success: {
    //       showField: [{
    //         name: 'udyamOTP',
    //         condition: 'isShow',
    //         value: false
    //       }, {
    //         name: 'udyam_certificate_postOTP',
    //         condition: 'isShow',
    //         value: true
    //       }],
    //       setValueArr: [{
    //         apiKey: 'url',
    //         name: 'udyam_certificate_postOTP'
    //       }, {
    //         apiKey: 'fuzzyScore',
    //         name: 'udyam_fuzzy_score'
    //       }],
    //       disable: {
    //         value: true,
    //         disableOnValue: true,
    //         disableFields: ['udyam_mobile_number', 'udyam_registration_number'],
    //       },
    //       status: true,
    //     },
    //     fail: [{
    //       // resetFields: ['udyamOTP'],
    //       status: true,
    //       setValueArr: [{
    //         apiKey: 'error',
    //         name: 'udyam_failure_reason'
    //       }, {
    //         value: null,
    //         name: 'udyam_certificate'
    //       }, {
    //         value: null,
    //         name: 'udyam_certificate_postOTP'
    //       }]
    //     }, {
    //       // resetFields: ['udyamOTP'],
    //       status: false,
    //       setValueArr: [{
    //         value: null,
    //         name: 'udyam_certificate'
    //       }, {
    //         value: null,
    //         name: 'udyam_certificate_postOTP'
    //       }]
    //     }],
    //     enablebutton: {
    //       length: 6
    //     },
    //     condition: {
    //       type: 'visible',
    //       isShow: false,
    //       baseOn: 'udyam_mobile_number',
    //     },
    //     validation: {
    //       isRequired: true,
    //       requiredMsg: 'Please enter your Udyam OTP',
    //       pattern: REGEX.OTPVERIFICATION,
    //       patternMsg: 'Please enter valid OTP.'
    //     },
    //   },
    //   {
    //     name: 'udyam_requestId',
    //     label: 'Udyam request ID',
    //     identifier: IDENTIFIER.INPUTTEXT,
    //     condition: {
    //       type: 'visible',
    //       isShow: false,
    //       baseOn: 'udyam_mobile_number',
    //     },
    //   },
    //   {
    //     name: 'udyam_fuzzy_score',
    //     label: 'Udyam Fuzzy Score',
    //     identifier: IDENTIFIER.INPUTTEXT,
    //     condition: {
    //       type: 'visible',
    //       isShow: false,
    //       baseOn: 'udyam_mobile_number',
    //     },
    //   },
    //   {
    //     name: 'udyam_failure_reason',
    //     label: 'Udyam Failure REason',
    //     identifier: IDENTIFIER.INPUTTEXT,
    //     condition: {
    //       type: 'visible',
    //       isShow: false,
    //       baseOn: 'udyam_mobile_number',
    //     },
    //   },
    //   {
    //     name: 'udyam_certificate',
    //     label: 'Udyam Certificate',
    //     identifier: IDENTIFIER.PDFFILEVIEWER,
    //     condition: {
    //       type: 'visible',
    //       isShow: !!formData?.end_use_loan_details?.id,
    //       baseOn: 'udyam_mobile_number',
    //     },
    //   },
    //   {
    //     name: 'udyam_certificate_postOTP',
    //     label: 'Udyam Certificate On OTP',
    //     identifier: IDENTIFIER.PDFFILEVIEWER,
    //     condition: {
    //       type: 'visible',
    //       isShow: false,
    //       baseOn: 'udyamOTP',
    //     },
    //   },
    // ];

    const onlineMode = 'Online';
    const offlineMode = 'Offline';
    const showUdyamRegistration = (uD, endUseUdyamData) => {
      if (!endUseUdyamData) return true;
      if (uD?.mode === onlineMode) return true;
      if (uD?.mode === offlineMode) return !!uD?.mobile_number;
      if (endUseUdyamData?.mode === onlineMode) return true;
      if (endUseUdyamData?.mode === offlineMode) return !!endUseUdyamData?.mobile_number;
    };
    const isOfflineUploaded = (uD, endUseUdyamData) => {
      if (uD?.mode === offlineMode && uD?.mobile_number) return true;
      if (endUseUdyamData?.mode === offlineMode && endUseUdyamData?.mobile_number) return true;
      return false;
    };
    const isUdyamManualTotally = (uD, endUseUdyamData) => {
      if (uD?.mode === offlineMode && !uD?.mobile_number) return true;
      if (endUseUdyamData?.mode === offlineMode && !endUseUdyamData?.mobile_number) return true;
      return false;
    };
    const toShowUdyamMobile = (uD, endUseUdyamData) => {
      if (!endUseUdyamData) return true;
      if (uD?.mode === 'Online' && uD?.mobile_number) return true;
      if (endUseUdyamData?.mode === 'Online' && endUseUdyamData?.mobile_number) return true;
    };
    const isOnlineUdyamDoc = (uD, endUseUdyamData) => {
      if (uD?.mode === onlineMode && uD?.mobile_number) return true;
      if (endUseUdyamData?.mode === onlineMode && endUseUdyamData?.mobile_number) return true;
      return false;
    };
    const udyamFields = [
      {
        name: 'udyam_registration_number',
        label: 'Udyam Registration Number',
        identifier: IDENTIFIER.INPUTTEXT,
        disabled: udyamData?.reg_no || formData?.end_use_loan_details?.udyam_meta_data?.reg_no,
        condition: {
          type: 'visible',
          isShow: showUdyamRegistration(udyamData, formData?.end_use_loan_details?.udyam_meta_data),
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter udyam registration number',
          pattern: REGEX.UDYAMNUMBER,
          patternMsg: 'Please enter valid udyam registration number'
        },
      },
      {
        name: 'udyam_requestId',
        label: 'Udyam request ID',
        identifier: IDENTIFIER.INPUTTEXT,
        condition: {
          type: 'visible',
          isShow: false,
          baseOn: 'udyam_mobile_number',
        },
      },
      {
        name: 'udyam_fuzzy_score',
        label: 'Udyam Fuzzy Score',
        identifier: IDENTIFIER.INPUTTEXT,
        condition: {
          type: 'visible',
          isShow: false,
          baseOn: 'udyam_mobile_number',
        },
      },
      {
        name: 'udyam_otpVerifiedon',
        label: 'Udyam Certificate On OTP',
        identifier: IDENTIFIER.PDFFILEVIEWER,
        condition: {
          type: 'visible',
          isShow: false,
        },
      },
      {
        name: 'udyam_certificate_manual_upload_postotp',
        label: 'Udyam Certificate',
        identifier: IDENTIFIER.MULTIPLELIVEPHOTO,
        disable: isOfflineUploaded(udyamData, formData?.end_use_loan_details?.udyam_meta_data),
        filePath: `${LOS?.name}/${LOS?.details?.udyamCertificate}`,
        type: 'file',
        condition: {
          type: 'visible',
          isShow: isOfflineUploaded(udyamData, formData?.end_use_loan_details?.udyam_meta_data)
        },
        maxUploadCount: 5,
        maxUploadMsg: 'Maximum Upload limit reached for udyam certificate',
      },
      {
        name: 'udyam_registration_number_manual',
        label: 'Udyam',
        identifier: IDENTIFIER.EndUseOfGoldGrid,
        disabled: isUdyamManualTotally(udyamData, formData?.end_use_loan_details?.udyam_meta_data),
        condition: {
          type: 'visible',
          isShow: isUdyamManualTotally(udyamData, formData?.end_use_loan_details?.udyam_meta_data)
        },
        isVerify: true,
        inputField: {
          name: 'udyam_registration_number_manual',
          label: 'Udyam Registration Number',
          disabled: isUdyamManualTotally(udyamData, formData?.end_use_loan_details?.udyam_meta_data),
          validation: {
            isRequired: true,
            requiredMsg: 'Please enter udyam registration number',
            pattern: REGEX.UDYAMNUMBER,
            patternMsg: 'Please enter valid udyam registration number'
          },
          alignment: {
            xs: 8,
            sm: 8,
            md: 8,
            lg: 8,
            xl: 8
          }
        },
        uploadField: {
          name: 'udyam_certificate_manual',
          disabled: true,
          label: 'Udyam Certificate',
          fileSize: 5,
          isMulti: false,
          filePath: `${LOS?.name}/${LOS?.details?.udyamCertificate}`,
          validation: {
            isRequired: true,
            requiredMsg: 'Please upload udyam certificate',
            maxUploadCount: 5,
            maxUploadMsg: 'Maximum Upload limit reached for udyam certificate'
          }
        }
      },
      {
        name: 'udyam_registration_number_manual_verify',
        label: 'is udyam verified',
        identifier: IDENTIFIER.INPUTTEXT,
        condition: {
          type: 'visible',
          isShow: false
        }
      },
      {
        name: 'udyam_manual_upload',
        label: 'Udyam Manual Upload',
        identifier: IDENTIFIER.INPUTTEXT,
        condition: {
          type: 'visible',
          isShow: false,
        },
      },
      {
        name: 'udyam_manual_upload_postotp',
        label: 'Udyam Manual Upload',
        identifier: IDENTIFIER.INPUTTEXT,
        condition: {
          type: 'visible',
          isShow: false,
        },
      },
      {
        name: 'udyam_mobile_number',
        label: 'Udyam Registered Mobile Number',
        isErrorHandled: true,
        type: 'text',
        identifier: IDENTIFIER.INPUTBUTTONOTP,
        isPageLoaderRequired: {
          val: true,
          msg: 'Please do not refresh or press back button.'
        },
        function: udyamSendOtp,
        apiBody: ['udyam_mobile_number', 'udyam_registration_number'],
        // disabled: false,
        disableTime: 1000,
        count: 180,
        status: (udyamData?.mobile_number || formData?.end_use_loan_details?.udyam_meta_data?.mobile_number),
        buttonDetails: {
          isCall: false,
          isOtp: true,
          callName: 'CALL',
          sendOTP: 'SEND OTP'
        },
        success: [{
          showField: [{
            name: 'udyamOTP',
            condition: 'isShow',
            value: true
          }],
          resetFields: ['udyamOTP'],
          status: true,
          setValueArr: [{
            apiKey: 'requestId',
            name: 'udyam_requestId'
          }],
          disable: {
            value: true,
            disableOnValue: true,
            disableFields: ['udyam_mobile_number', 'udyam_registration_number'],
          },
        }, {
          showField: [{
            name: 'udyam_certificate',
            condition: 'isShow',
            value: true
          }],
          disable: {
            value: true,
            disableOnValue: true,
            disableFields: ['udyam_mobile_number', 'udyam_registration_number'],
          },
          setValueArr: [{
            apiKey: 'url',
            name: 'udyam_certificate'
          }, {
            apiKey: 'fuzzyScore',
            name: 'udyam_fuzzy_score'
          }],
        }],
        fail: [{
          resetFields: ['udyamOTP'],
          // showField: [{
          //   name: 'udyam_mobile_number',
          //   condition: 'isShow',
          //   value: false
          // }, {
          //   name: 'udyam_registration_number',
          //   condition: 'isShow',
          //   value: false
          // }],
          status: true,
          showField: [{
            name: 'udyam_mobile_number',
            condition: 'isShow',
            value: false
          }, {
            name: 'udyam_registration_number',
            condition: 'isShow',
            value: false
          }, {
            name: 'udyam_registration_number_manual',
            condition: 'isShow',
            value: true
          }
          ],
          setValueArr: [
            //   {
            //   apiKey: 'error',
            //   name: 'udyam_failure_reason'
            // },
            // {
            //   value: null,
            //   name: 'udyam_certificate'
            // }, {
            //   value: null,
            //   name: 'udyam_certificate_postOTP'
            // },
            {
              value: true,
              name: 'udyam_manual_upload'
            }]
        },
        ],
        enablebutton: {
          length: 10
        },
        disabled: udyamData?.mobile_number || formData?.end_use_loan_details?.udyam_meta_data?.mobile_number,
        condition: {
          type: 'visible',
          isShow: toShowUdyamMobile(udyamData, formData?.end_use_loan_details?.udyam_meta_data),
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter your Registered Udyam mobile number',
          pattern: REGEX.MOBILENUMBER,
          patternMsg: 'Please enter valid Mobile number.'
        },
      },
      {
        name: 'udyamOTP',
        label: 'Enter Udyam OTP',
        type: 'text',
        identifier: IDENTIFIER.INPUTOTP,
        show: 'initial',
        isPageLoaderRequired: {
          val: true,
          msg: 'Please do not refresh or press back button.'
        },
        function: udyamValidateOtp,
        apiBody: ['udyamOTP', 'udyam_registration_number', 'udyam_requestId'],
        status: true,
        success: {
          showField: [{
            name: 'udyamOTP',
            condition: 'isShow',
            value: false
          }, {
            name: 'udyam_certificate_postOTP',
            condition: 'isShow',
            value: true
          }],
          setValueArr: [{
            apiKey: 'url',
            name: 'udyam_certificate_postOTP'
          }, {
            apiKey: 'fuzzyScore',
            name: 'udyam_fuzzy_score'
          }],
          disable: {
            value: true,
            disableOnValue: true,
            disableFields: ['udyam_mobile_number', 'udyam_registration_number'],
          },
          status: true,
        },
        fail: [{
          // resetFields: ['udyamOTP'],
          status: true,
          showField: [{
            name: 'udyamOTP',
            condition: 'isShow',
            value: false
          }, {
            name: 'udyam_certificate_manual_upload_postotp',
            condition: 'isShow',
            value: true
          }
          ],
          setValueArr: [
            //   {
            //   apiKey: 'error',
            //   name: 'udyam_failure_reason'
            // },
            {
              value: true,
              name: 'udyam_manual_upload_postotp'
            },
          ]
        },
        {
          // resetFields: ['udyamOTP'],
          status: false,
          setValueArr: [{
            value: null,
            name: 'udyam_certificate'
          }, {
            value: null,
            name: 'udyam_certificate_postOTP'
          }]
        }
        ],
        enablebutton: {
          length: 6
        },
        condition: {
          type: 'visible',
          isShow: false,
          baseOn: 'udyam_mobile_number',
        },
        validation: {
          isRequired: true,
          requiredMsg: 'Please enter your Udyam OTP',
          pattern: REGEX.OTPVERIFICATION,
          patternMsg: 'Please enter valid OTP.'
        },
      },
      {
        name: 'udyam_failure_reason',
        label: 'Udyam Failure REason',
        identifier: IDENTIFIER.INPUTTEXT,
        condition: {
          type: 'visible',
          isShow: false,
          baseOn: 'udyam_mobile_number',
        },
      },
      {
        name: 'udyam_certificate',
        label: 'Udyam Certificate',
        identifier: IDENTIFIER.PDFFILEVIEWER,
        condition: {
          type: 'visible',
          isShow: isOnlineUdyamDoc(udyamData, formData?.end_use_loan_details?.udyam_meta_data),
          // baseOn: 'udyam_mobile_number',
        },
      },
      {
        name: 'udyam_certificate_postOTP',
        label: 'Udyam Certificate On OTP',
        identifier: IDENTIFIER.PDFFILEVIEWER,
        condition: {
          type: 'visible',
          isShow: false,
          baseOn: 'udyamOTP',
        },
      },
    ];
    goldInformation.onBack = {
      dynamicHandler: goldInfoBackDynamicHandler
    };
    goldInformation.input.push(...udyamFields);
  }

  const deviationData = [
    {
      name: 'gold_pouch_number',
      label: updateLabel('Gold Pouch Number'),
      type: 'text',
      // defaultValue: formData?.gold_pouch_number,
      identifier: IDENTIFIER.INPUTTEXT,
      validation: {
        isRequired: true,
        requiredMsg: 'Please enter Gold Pouch Number',
        pattern: formData.colender === 'SHIVALIK' ? REGEX.SHIVALIKGOLDPOUCHNUMBER : REGEX.GOLDPOUCHNUMBER,
        patternMsg: 'Gold pouch number is invalid!',
        maxLength: formData.colender === 'SHIVALIK' ? 10 : 11,
        maxLenMsg: 'Please enter valid Gold Pouch Number',
        minLength: formData.colender === 'SHIVALIK' ? 10 : 11,
        minLenMsg: 'Please enter valid Gold Pouch Number',
      },
      isUpperCase: true,
      alignment: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 6,
        xl: 6
      }
    },
    {
      name: 'tare_weight_of_gold_packet',
      label: updateLabel('TARE Weight of Gold Packet'),
      type: 'text',
      identifier: IDENTIFIER.INPUTTEXT,
      // defaultValue: formData?.tare_weight_gold_pouch,
      validation: {
        isRequired: true,
        requiredMsg: 'Please enter TARE Weight of Gold Packet',
        pattern: REGEX.TWODIGITDECIMAL,
        patternMsg: 'Please enter valid two digit decimal Value only'
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
      name: 'manual_deviation_file',
      type: 'file',
      label: 'Manual Deviation Upload (Max size 5 MB)',
      isMulti: false,
      defaultValue: null,
      identifier: IDENTIFIER.FILE,
      filePath: `${LOS?.name}/${LOS?.details?.deviationFile}`,
      changeValidationOnChangeInput: {
        validation: {
          manual_deviation_name: {
            isRequired: true,
            requiredMsg: 'Please enter deviation name',
            maxLength: 100,
            maxLenMsg: 'Deviation name should not be more than 100 characters',
          }
        }
      },
      validation: {
        isRequired: false,
      },
      fileSize: 5,
      alignment: {
        xs: 12,
        sm: 12,
        md: 6,
        lg: 6,
        xl: 6
      }
    },
    {
      name: 'manual_deviation_name',
      label: 'Deviation Name',
      type: 'text',
      identifier: IDENTIFIER.INPUTTEXT,
      multiline: true,
      validation: {
        isRequired: false,
        maxLength: 100,
        maxLenMsg: 'Deviation name should not be more than 100 characters',
      },
      changeValidationOnChangeInput: {
        validation: {
          manual_deviation_file: {
            isRequired: true,
            requiredMsg: 'Please upload deviation file',
          }
        }
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
      name: 'deviations',
      type: 'deviations',
      identifier: IDENTIFIER.DEVIATIONS,
      alignment: {
        xs: 12,
        sm: 12,
        md: 12,
        lg: 12,
        xl: 12
      }
    },
  ];
  const collateralDataBackup = [{
    name: 'item_name',
    label: updateLabel('Item Name'),
    type: 'select',
    identifier: IDENTIFIER.SELECT,
    multiSelect: false,
    customFunction: (formValues, callback, index, setValue) => {
      setValueInCollateral(formValues, callback, setValue);
    },
    functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
    option: ornamentsList,
    validation: {
      isRequired: true,
      requiredMsg: 'Please Select Item Name',
    }
  },
  {
    name: 'other_item_name',
    label: updateLabel('Other Item Name'),
    type: 'text',
    identifier: IDENTIFIER.INPUTTEXT,
    condition: {
      type: 'showOnValue',
      baseOn: 'item_name',
      baseValue: 'OTH'
    },
    copyCondition: true,
    validation: {
      isRequired: true,
      requiredMsg: 'Please enter Other Item Name',
    }
  },
  {
    name: 'item_count',
    label: updateLabel('Item Count'),
    type: 'text',
    identifier: IDENTIFIER.INPUTTEXT,
    validation: {
      isRequired: true,
      requiredMsg: 'Please enter Item Count',
      pattern: REGEX.NUMBER,
      patternMsg: 'Please enter numeric digits and positive number only',
      // min: 0,
      // minMsg: 'Item Count must be greater than 0'
    }
  },
  {
    name: 'total_weight',
    label: updateLabel('Total Weight of the item (in grams)'),
    type: 'text',
    identifier: IDENTIFIER.INPUTTEXT,
    customFunction: purityCalculation,
    functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE_SETTER,
    functionChangeBaseOn: 'total_weight',
    setValueArr: [
      {
        apiKey: 'net_weight_before_purity',
        name: 'net_weight_before_purity'
      },
      {
        apiKey: 'net_weight_after_purity',
        name: 'net_weight_after_purity'
      },
    ],
    setValueEnable: true,
    validation: {
      isRequired: true,
      requiredMsg: 'Please enter Total Weight of the item (in grams)',
      pattern: REGEX.TWODIGITDECIMAL,
      patternMsg: 'Please enter valid two digit decimal Value only',
      min: 0.01,
      minMsg: 'Net weight must be greater than 0'
    }
  },
  {
    name: 'breads_stone_weight',
    label: 'Beads/Stone Weight (in Grams)',
    type: 'text',
    identifier: IDENTIFIER.INPUTTEXT,
    customFunction: purityCalculation,
    functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE_SETTER,
    functionChangeBaseOn: 'breads_stone_weight',
    setValueArr: [
      {
        apiKey: 'net_weight_before_purity',
        name: 'net_weight_before_purity'
      },
      {
        apiKey: 'net_weight_after_purity',
        name: 'net_weight_after_purity'
      },
    ],
    setValueEnable: true,
    validation: {
      isRequired: true,
      requiredMsg: 'Please enter Beads/Stone Weight (in grams)',
      min: 0.00,
      minMsg: 'Net weight must be greater than 0',
      pattern: REGEX.TWODIGITDECIMAL,
      patternMsg: 'Please enter valid two digit decimal Value only',
    }
  },
  {
    name: 'purity',
    label: updateLabel('Purity (in Carat)'),
    type: 'select',
    identifier: IDENTIFIER.SELECT,
    multiSelect: false,
    option: [
      { label: '22K', value: '22' },
      { label: '21K', value: '21' },
      { label: '20K', value: '20' },
      { label: '19K', value: '19' },
      { label: '18K', value: '18' },
    ],
    customFunction: purityCalculation,
    functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE_SETTER,
    functionChangeBaseOn: 'purity',
    setValueArr: [
      // {
      //   apiKey: 'net_weight_before_purity',
      //   name: 'net_weight_before_purity'
      // },
      {
        apiKey: 'net_weight_after_purity',
        name: 'net_weight_after_purity'
      },
    ],
    setValueEnable: true,
    validation: {
      isRequired: true,
      requiredMsg: 'Please enter Purity (in Carat)',
    }
  },
  {
    name: 'net_weight_after_purity',
    label: updateLabel('Net Weight after purity Conversion'),
    type: 'text',
    identifier: IDENTIFIER.INPUTTEXT2,
    disabled: true,
    defaultValue: 0,
  },
  {
    name: 'ornament_live_photo',
    label: updateLabel('Ornament Live Photo'),
    type: 'file',
    identifier: IDENTIFIER.LIVEPHOTO,
    filePath: `${LOS?.name}/${LOS?.details?.ornamentPicture}`,
    validation: {
      isRequired: true,
      requiredMsg: 'Please Capture Ornament live photo',
    }
  },];

  const formConfiguration = {
    form: [
      {
        title: 'Collateral Details',
        variant: 'outlined',
        input: collateralDataBackup,
        buttonDetails: {
          name: 'Next',
          previous: 'Back',
        },
        onBack: {
          resetAdditionalForm: true
        },
        addMore: true,
        addMoreCopyDefaultValue: false,
        addMoreCallAuto: true,
        addMoreSperatorEnable: true,
        addMoreCallAutoCount: (formData?.items?.length > 1) ? formData?.items?.length : 0,
        dynamicValidation: handleDynamicValidationCollateral,
        alignment: {
          xs: 12,
          sm: 12,
          md: 3,
          lg: 3,
          xl: 3
        }
      },
      {
        title: 'Consolidated Collateral Details',
        variant: 'outlined',
        input: [
          {
            name: 'total_net_count_of_all_item',
            label: updateLabel('Total Count of All Items'),
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            disabled: true,
            customFunction: (formValues, callback) => { updateReadOnlyFields(formValues, callback, 'total_net_count_of_all_item'); },
            functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
          },
          {
            name: 'total_net_weight_of_all_item',
            label: updateLabel('Total Weight of all items (in Grams)'),
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT2,
            disabled: true,
            customFunction: (formValues, callback) => { updateReadOnlyFields(formValues, callback, 'total_net_weight_of_all_item'); },
            functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
          },
          // {
          //   name: 'total_net_weight_before_purity',
          //   label: updateLabel('Total Net weight of all items before purity (in grams)'),
          //   type: 'text',
          //   identifier: IDENTIFIER.INPUTTEXT,
          //   disabled: true,
          //   customFunction: (formValues, callback) => {
          // updateReadOnlyFields(formValues, callback, 'total_net_weight_before_purity'); },
          //   functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
          // },
          {
            name: 'total_net_bread_stone_weight',
            label: 'Total Net Beads/Stone Weight Of All Items (in Grams)',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT2,
            disabled: true,
            customFunction: (formValues, callback) => { updateReadOnlyFields(formValues, callback, 'total_net_bread_stone_weight'); },
            functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
          },
          {
            name: 'total_net_weight_after_purity',
            label: updateLabel('Total Net Weight of All Items (in Grams)'),
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT2,
            disabled: true,
            customFunction: (formValues, callback) => { updateReadOnlyFields(formValues, callback, 'total_net_weight_after_purity'); },
            functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
          },
          {
            name: 'consolidated_picture_of_ornament',
            label: updateLabel('Consolidated Live Photo of Ornaments'),
            type: 'file',
            // defaultValue: formData?.items_pic,
            identifier: IDENTIFIER.LIVEPHOTO,
            filePath: `${LOS?.name}/${LOS?.details?.cosolidatedOrnamentPicture}`,
            validation: {
              isRequired: true,
              requiredMsg: 'Please Capture Ornament live photo',
            }
          },
          {
            name: 'max_eligible_loan_amount',
            label: updateLabel('Max Eligible Loan Amount (in Rs)'),
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT2,
            disabled: true,
            customFunction: (formValues, callback, index, setValue) => {
              calculateRpa(
                formValues,
                callback,
                setAlertShow,
                setValue
              );
            },
            functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
          },
        ],
        buttonDetails: {
          name: 'Next',
          previous: 'Back',
        },
        alignment: {
          xs: 12,
          sm: 12,
          md: 4,
          lg: 4,
          xl: 4
        }
      },
      { ...goldInformation },
      {
        title: 'Scheme Selection',
        variant: 'outlined',
        input: [
          {
            name: 'scheme_name',
            label: updateLabel('Scheme Name'),
            type: 'select',
            identifier: IDENTIFIER.SELECT,
            option: [],
            customFunction: (formValues, callback, reqindex, setValue, formjson) => {
              handleScheme(formValues, callback, reqindex, setValue, formjson, setFormDetails);
            },
            functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE_SETTER,
            functioninitMethod: FUNCTION_IDENTIFIER.ON_INIT,
            custominitFunction: (values, callback, setValue) => {
              const filterScheme = [];
              if (schemeData?.length > 0) {
                schemeData?.forEach((item) => {
                  let schemeAmount = (parseFloat(((values?.max_eligible_loan_amount)?.toString()).replace(/,/g, '')) * item.rpg_ltv) / 100;
                  schemeAmount = Math.floor(schemeAmount);
                  if (schemeAmount >= item.min_loan_amount) {
                    filterScheme.push({ label: item.name, value: item.code });
                  }
                });
                if (filterScheme.length) {
                  callback(filterScheme);
                } else {
                  callback([{ label: 'No Scheme Matches', value: null, disabled: true }]);
                }
              } else {
                callback([{ label: 'No Scheme Found', value: null, disabled: true }]);
              }
            },
            // defaultValue: formData?.scheme_code,
            functionChangeBaseOn: 'scheme_name',
            validation: {
              isRequired: true,
              requiredMsg: `Please select End ${updateLabel('Scheme Name')}`,
            }
          },
          {
            name: 'minimum_loan_amount',
            label: updateLabel('Minimum Loan Amount (in Rs)'),
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT2,
            disabled: true,
            defaultValue: '',
          },
          {
            name: 'maximum_loan_amount',
            label: updateLabel('Maximum Loan Amount (in Rs)'),
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT2,
            disabled: true,
            defaultValue: '',
          },
          {
            name: 'loan_tenure',
            label: updateLabel('Loan Tenure (in months)'),
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT2,
            disabled: true,
            defaultValue: '',
          },
          {
            name: 'rate_of_interest',
            label: 'Rate Of Interest (in % p.a.)',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT2,
            disabled: true,
            InputProps: {
              possition: 'end',
              text: '%'
            },
            defaultValue: ''
          },
          {
            name: 'additional_interest',
            label: 'Additional Interest (in % p.a.)',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT2,
            disabled: true,
            InputProps: {
              possition: 'end',
              text: '%'
            },
            defaultValue: ''
          },
          // {
          //   name: 'ltv',
          //   label: updateLabel('LTV'),
          //   type: 'text',
          //   identifier: IDENTIFIER.INPUTTEXT,
          //   disabled: true,
          //   defaultValue: '',
          // },
          {
            name: 'repayment_frequency',
            label: updateLabel('Repayment Frequency'),
            type: 'select',
            identifier: IDENTIFIER.SELECT,
            defaultValue: '',
            option: [
              { value: '1', label: 'Monthly' },
              { value: '2', label: 'Bi-Monthly' },
              { value: '3', label: 'Quarterly' },
              { value: '6', label: 'Half Yearly' },
              { value: '12', label: 'Yearly' }
            ],
            disabled: true,
          },
          {
            name: 'scheme_type',
            label: updateLabel('Scheme Type'),
            type: 'select',
            identifier: IDENTIFIER.SELECT,
            defaultValue: '',
            option: [
              { label: 'Standard', value: 'STD' },
              { label: 'UpFront Interest', value: 'ADV' },
              { label: 'Rebate', value: 'REB' },
              { label: 'Rebate Step Up', value: 'RSU' }
            ],
            disabled: true,
          },
          {
            name: 'eligible_gold_loan_amount',
            label: updateLabel('Scheme Eligible Amount (in Rs.)'),
            type: 'text',
            isAmount: true,
            defaultValue: '',
            identifier: IDENTIFIER.INPUTTEXT2,
            disabled: true,
          },
          {
            name: 'requested_gold_loan_amount',
            label: updateLabel('Requested Gold Loan Amount (in Rs)'),
            type: 'text',
            isAmount: true,
            identifier: IDENTIFIER.INPUTTEXT,
            validation: {
              isRequired: true,
              requiredMsg: 'Please enter Requested Gold Loan Amount',
              pattern: REGEX.AMOUNT,
              patternMsg: 'Please enter numeric digits only',
              min: 1,
              minMsg: 'Please enter value greater than or equal to 1',
            }
          },
          {
            name: 'rate_chart_code_table',
            label: 'Rate Chart Code Table',
            // defaultValue: ChartDataProvider(),
            identifier: IDENTIFIER.RATECHARTCODETABLE,
            customFunction: (values, callback, index, setValue) => {
              setValue('rate_chart_code_table', ChartDataProvider(values.scheme_type));
            },
            functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE_SETTER,
            functionChangeBaseOn: 'scheme_type',

            condition: {
              type: 'multiShowOnValue',
              baseOn: 'scheme_type',
              baseValue: ['REB', 'RSU']
            },
            alignment: {
              xs: 12,
              sm: 12,
              md: 12,
              lg: 12,
              xl: 12
            }
          }
        ],
        dynamicValidation: handleDynamicValidation,
        buttonDetails: {
          name: 'Next',
          previous: 'Back',
        },
        alignment: {
          xs: 12,
          sm: 12,
          md: 4,
          lg: 4,
          xl: 4
        }
      },
      {
        title: 'Fee Information',
        variant: 'outlined',
        // input: () => generateFeeFields(),
        input: {
          readonlyData: () => generateFeeFields(),
          identifier: IDENTIFIER.READONLY,
        },
        type: 'readonly',
        buttonDetails: {
          name: 'Next',
          previous: 'Back',
        },
        alignment: {
          xs: 12,
          sm: 12,
          md: 4,
          lg: 4,
          xl: 4
        }
      },
      {
        title: 'Fund Transfer',
        variant: 'outlined',
        input: [
          {
            name: 'balance_transfer_mode',
            label: updateLabel('Balance Transfer Mode'),
            type: 'text',
            identifier: IDENTIFIER.RADIO,
            // defaultValue: formData?.balance_transfer_mode,
            option: [
              // { label: 'BT from VEEFIN', value: 'CSH' },
              { label: 'BT from Competitor Online', value: 'OLN' }
            ],
            onChange: {
              // CSH: {
              //   validation: {
              //     utr_refrence_number: {
              //       validation: {
              //         isRequired: true,
              //         requiredMsg: 'Please enter remarks.'
              //       },
              //     },
              //     amount: {
              //       validation: {
              //         isRequired: true,
              //         requiredMsg: 'Please enter amount.',
              //         pattern: REGEX.AMOUNT,
              //         patternMsg: 'Please enter numeric digits only',
              //         min: 1,
              //         minMsg: 'Amount cannot be 0.',
              //       }
              //     }
              //   }
              // },
              OLN: {
                validation: {
                  utr_refrence_number: {
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please enter remarks.'
                    }
                  },
                  amount: {
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please enter amount.',
                      pattern: REGEX.AMOUNT,
                      patternMsg: 'Please enter numeric digits only',
                      min: 1,
                      minMsg: 'Amount cannot be 0.',
                    }
                  }
                }
              },
            },
            inline: true,
            alignment: {
              xs: 12,
              sm: 12,
              md: 6,
              lg: 6,
              xl: 6
            }
          },
          {
            name: 'amount',
            label: updateLabel('Amount (in rs)'),
            type: 'text',
            isAmount: true,
            // defaultValue: formData?.balance_amount_transfer,
            identifier: IDENTIFIER.INPUTTEXT,
            customFunction: (formValues, callback, reqindex, setValue, formjson) => {
              calculateNetDisbursement(formValues, callback, reqindex, setValue);
            },
            functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE_SETTER,
            functionChangeBaseOn: 'amount',
            validation: {
              pattern: REGEX.AMOUNT,
              patternMsg: 'Please enter numeric digits only',
              min: 1,
              minMsg: 'Amount cannot be 0.',
            },
            alignment: {
              xs: 12,
              sm: 12,
              md: 3,
              lg: 3,
              xl: 3
            }
          },
          {
            name: 'utr_refrence_number',
            label: 'Remarks',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            validation: {
              isRequired: false
            },
            alignment: {
              xs: 12,
              sm: 12,
              md: 3,
              lg: 3,
              xl: 3
            }
          },
          {
            name: 'linebrake2',
            identifier: IDENTIFIER.SPERATOR,
            index: 0,
            label: '  '
          },
          {
            name: 'linebrake',
            identifier: IDENTIFIER.SPERATOR,
            index: 0,
            label: 'Inter Account Fund Transfer',
            style: {
              fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
              fontWeight: 400,
              lineHeight: '1.4375em',
              letterSpacing: '0.00938em',
              padding: 0,
              color: '#502A74',
              fontSize: '0.8em',
            }
          },
          {
            name: 'loan_account_number',
            label: updateLabel('Loan Account Number'),
            deselect: {
              allow: isAllowed(formData?.activeLoanAccounts ?? []),
              optionName: 'Select Loan Account'
            },
            type: 'select',
            identifier: IDENTIFIER.SELECT,
            defaultValue: '',
            option: formData?.activeLoanAccounts ?? [],
            isRemovePreviousSelectedOption: true,
            customFunction: (values, callback, index, setValue, formDetails, dump, fieldName) => {
              handleLoanAccount(values, callback, index, setValue, formDetails, fieldName);
            },
            functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE_SETTER,
            functionChangeBaseOn: 'loan_account_number',
            alignment: {
              xs: 12,
              sm: 12,
              md: 6,
              lg: 6,
              xl: 6
            }
          },
          {
            name: 'amount_to_transfer',
            label: updateLabel('Amount to transfer (in Rs)'),
            type: 'text',
            isAmount: true,
            identifier: IDENTIFIER.INPUTTEXT,
            validation: {
              pattern: REGEX.AMOUNT,
              patternMsg: 'Please enter numeric digits only',
              min: 0,
              minMsg: 'Amount cannot be 0.'
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
            name: 'linebrake3',
            identifier: IDENTIFIER.SPERATOR,
            index: 0,
            label: ' '
          },
          {
            name: 'bundled_insurance',
            label: updateLabel('Loan Kawach'),
            type: 'text',
            identifier: IDENTIFIER.RADIO,
            defaultValue: 'YES',
            option: ['YES', 'NO'],
            onChange: {
              YES: {
                disable: {
                  value: false,
                  disableFields: ['sum_insured'],
                },
                validation: {
                  sum_insured: {
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please select option from Sum Insured.'
                    }
                  },
                }
              },
              NO: {
                disable: {
                  value: true,
                  disableFields: ['sum_insured'],
                },
                resetFields: ['sum_insured', 'premium_amount'],
                validation: {
                  sum_insured: {
                    validation: {
                      isRequired: false
                    }
                  },
                }
              }
            },
            inline: true,
            alignment: {
              xs: 12,
              sm: 12,
              md: 6,
              lg: 6,
              xl: 6
            }
          },
          {
            name: 'sum_insured',
            label: updateLabel('Sum Insured'),
            type: 'select',
            identifier: IDENTIFIER.SELECT,
            defaultValue: '',
            option: [],
            customFunction: sumInsuredSetter,
            functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
            alignment: {
              xs: 12,
              sm: 12,
              md: 3,
              lg: 3,
              xl: 3
            },
          },
          {
            name: 'premium_amount',
            label: updateLabel('Premium Amount'),
            type: 'text',
            isAmount: true,
            identifier: IDENTIFIER.INPUTTEXT2,
            disabled: true,
            // defaultValue: '',
            functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE,
            customFunction: (formValues, callback) => {
              handleLoanKawach(formValues, callback, insurance?.find((item) => item.label && item.label.includes(formData.colender))?.value[0] || []);
            },
            functionChangeBaseOn: 'sum_insured',
            alignment: {
              xs: 12,
              sm: 12,
              md: 3,
              lg: 3,
              xl: 3
            }
          }
        ],
        onBack: {
          resetAdditionalForm: true,
          resetFieldValidation: {
            amount: {
              isRequired: false
            },
            utr_refrence_number: {
              isRequired: false
            }
          }
        },
        dynamicValidation: (values, setError) => handleDynamicValidationInter(values, setError, setAlertShow),
        addMore: true,
        addMoreCopyDefaultValue: false,
        addMoreCallAuto: true,
        addMoreSperatorEnable: true,
        addMoreCallAutoCount: (formData?.interaccounts?.length > 1)
          ? formData?.interaccounts?.length : 0,
        addMoreFields: ['loan_account_number', 'amount_to_transfer'],
        customFunctionOnDelete: handleLoanAccountDelete,
        buttonDetails: {
          name: 'Next',
          previous: 'Back',
        },
        alignment: {
          xs: 12,
          sm: 12,
          md: 6,
          lg: 4,
          xl: 4
        }
      },
      {
        title: updateLabel('Net disbursement to customer'),
        variant: 'outlined',
        onBack: {
          disable: {
            value: false,
            disableFields: ['upiId'],
          },
          reset: {
            currentForm: ['net_disbursment_mode']
          },
          resetFieldValidation: {
            upiId: {
              isRequired: true,
              requiredMsg: 'Please enter your UPI ID',
              pattern: REGEX.UPI,
              patternMsg: 'Please enter valid UPI ID.',
              verifyMsg: 'Please verify UPI ID to proceed further'
            },
          },
          condition: {
            currentForm: [
              {
                name: 'registered_name',
                condition: 'isShow',
                value: false
              },
              {
                name: 'upiIDverificationStatus',
                condition: 'isShow',
                value: false
              },
            ]
          },
        },
        input: [
          {
            name: 'net_disbursement_to_customer',
            label: updateLabel('Net Disbursement To Customer (in Rs)'),
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT2,
            disabled: true,
            customFunction: (formValues, callback, reqindex, setValue, formjson) => {
              calculateNetDisbursement(formValues, callback, reqindex, setValue);
            },
            functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
          },
          {
            name: 'linebrakenet',
            identifier: IDENTIFIER.SPERATOR,
            index: 0,
          },
          {
            name: 'net_disbursment_mode',
            label: updateLabel('disbursement mode'),
            type: 'select',
            identifier: IDENTIFIER.SELECT,
            defaultValue: '',
            option: [],
            functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE,
            customFunction: upiOptionhandler,
            functionChangeBaseOn: 'net_disbursement_to_customer',
            onChange: {
              CASH: {
                showField: [
                  {
                    name: 'upiIDverificationStatus',
                    condition: 'isShow',
                    value: false
                  }, {
                    name: 'registered_name',
                    condition: 'isShow',
                    value: false
                  }],
                disable: {
                  value: false,
                  disableOnValue: true,
                  disableFields: ['upiId'],
                },
                resetFields: ['upiIDverificationStatus', 'registered_name', 'upiFailureReason', 'upiId'],
              },
              ONLINE: {
                showField: [
                  {
                    name: 'upiIDverificationStatus',
                    condition: 'isShow',
                    value: false
                  }, {
                    name: 'registered_name',
                    condition: 'isShow',
                    value: false
                  }],
                disable: {
                  value: false,
                  disableOnValue: true,
                  disableFields: ['upiId'],
                },
                resetFields: ['upiIDverificationStatus', 'registered_name', 'upiFailureReason', 'upiId'],
              },
              UPI: {
                validation: {
                  upiId: {
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please enter your UPI ID',
                      pattern: REGEX.UPI,
                      patternMsg: 'Please enter valid UPI ID.',
                      verifyMsg: 'Please verify UPI ID to proceed further'
                    }
                  }
                }
              }
            },
            validation: {
              isRequired: true,
              requiredMsg: 'Please select disbursement mode',
            }
          },
          {
            name: 'online_disbursment_online',
            label: updateLabel('Online disbursement (in Rs)'),
            type: 'text',
            isAmount: true,
            identifier: IDENTIFIER.INPUTTEXT2,
            disabled: true,
            customFunction: (formValues, callback, reqindex, setValue, formjson) => {
              calculateNetDisbursement(formValues, callback, reqindex, setValue);
            },
            functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
            condition: {
              type: 'multiShowOnValue',
              baseOn: 'net_disbursment_mode',
              baseValue: ['ONLINE', 'UPI']
            },
          },
          // {
          //   name: 'upi_disbursment_online',
          //   label: updateLabel('UPI disbursement (in Rs)'),
          //   type: 'text',
          //   isAmount: true,
          //   identifier: IDENTIFIER.INPUTTEXT2,
          //   disabled: true,
          //   customFunction: (formValues, callback, reqindex, setValue, formjson) => {
          //     calculateNetDisbursement(formValues, callback, reqindex, setValue);
          //   },
          //   functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
          //   condition: {
          //     type: 'showOnValue',
          //     baseOn: 'net_disbursment_mode',
          //     baseValue: 'UPI'
          //   },
          // },
          {
            name: 'upiId',
            label: 'UPI ID',
            type: 'text',
            identifier: IDENTIFIER.INPUTOTP,
            function: (value) => upiVerify(value, formData, setAlertShow),
            apiBody: ['upiId', 'net_disbursement_to_customer'],
            disabled: !!formData?.upi_details?.vpa,
            status: !!formData?.upi_details?.vpa,
            buttonDetails: {
              isCall: false,
              isOtp: true,
              callName: 'CALL',
              sendOTP: 'Verify'
            },
            success: [{
              setValueArr: [{
                name: 'registered_name',
                apiKey: 'userName'
              },
              {
                value: 'VALID',
                name: 'upiIDverificationStatus'
              },
              {
                apiKey: 'error',
                name: 'upiFailureReason'
              },
              {
                apiKey: 'token',
                name: 'upiToken'
              }
              ],
              status: true,
              showField: [
                {
                  name: 'upiIDverificationStatus',
                  condition: 'isShow',
                  value: true
                }, {
                  name: 'registered_name',
                  condition: 'isShow',
                  value: true
                }],
              disable: {
                value: true,
                disableOnValue: true,
                disableFields: ['upiId'],
              },
              validation: {
                upiId: {
                  isRequired: true,
                  requiredMsg: 'Please enter your UPI ID',
                  pattern: REGEX.UPI,
                  patternMsg: 'Please enter valid UPI ID.',
                  verifyMsg: 'Please verify UPI ID to proceed further'
                },
              }
            }, {
              setValueArr: [{
                name: 'registered_name',
                apiKey: 'userName'
              },
              {
                value: 'VALID',
                name: 'upiIDverificationStatus'
              },
              {
                apiKey: 'error',
                name: 'upiFailureReason'
              },
              {
                apiKey: 'token',
                name: 'upiToken'
              }
              ],
              status: true,
              showField: [
                {
                  name: 'upiIDverificationStatus',
                  condition: 'isShow',
                  value: true
                }, {
                  name: 'registered_name',
                  condition: 'isShow',
                  value: true
                }],
              validation: {
                upiId: {
                  isRequired: true,
                  requiredMsg: 'Please enter your UPI ID',
                  pattern: REGEX.UPI,
                  patternMsg: 'Please enter valid UPI ID.',
                  verifyMsg: 'Please verify UPI ID to proceed further'
                },
              }
            }],
            fail: [{
              status: true,
              setValueArr: [
                {
                  value: 'INVALID',
                  name: 'upiIDverificationStatus'
                },
                {
                  name: 'upiFailureReason',
                  apiKey: 'error'
                }
              ],
              showField: [
                {
                  name: 'upiIDverificationStatus',
                  condition: 'isShow',
                  value: true
                },
                {
                  name: 'registered_name',
                  condition: 'isShow',
                  value: false
                },
              ]
            }, {
              status: false
            }],
            condition: {
              type: 'showOnValue',
              baseOn: 'net_disbursment_mode',
              baseValue: 'UPI'
            },
            validation: {
              isRequired: true,
              requiredMsg: 'Please enter your UPI ID',
              pattern: REGEX.UPI,
              patternMsg: 'Please enter valid UPI ID.',
              verifyMsg: 'Please verify UPI ID to proceed further'
            },
          },
          {
            name: 'registered_name',
            label: 'Registered Name',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            disabled: true,
            // defaultValue: customerDetails?.bank_name || '',
            condition: {
              type: 'visible',
              isShow: !!formData?.upi_details?.vpa
            }
            // validation: {
            //   isRequired: true,
            //   requiredMsg: 'Please enter bank name.',
            //   pattern: REGEX.SPACESTARTEND,
            //   patternMsg: 'Please enter valid bank name.',
            //   maxLength: 150,
            //   maxLenMsg: 'Bank name should not be more than 150 characters.',
            // },
          },
          {
            name: 'upiIDverificationStatus',
            label: 'UPI Status',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: '',
            disabled: true,
            condition: {
              type: 'visible',
              isShow: !!formData?.upi_details?.vpa
            }
          },
          {
            name: 'upiFailureReason',
            label: 'upiFailureReason',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: '',
            disabled: true,
            condition: {
              type: 'visible',
              isShow: false
            }
          },
          {
            name: 'upiToken',
            label: 'upiToken',
            type: 'text',
            identifier: IDENTIFIER.INPUTTEXT,
            defaultValue: '',
            disabled: true,
            condition: {
              type: 'visible',
              isShow: false
            }
          },
          {
            name: 'cash_disbursment_CASH',
            label: updateLabel('cash disbursement (in Rs)'),
            type: 'text',
            isAmount: true,
            identifier: IDENTIFIER.INPUTTEXT2,
            disabled: true,
            customFunction: (formValues, callback, reqindex, setValue, formjson) => {
              calculateNetCashDisbursement(formValues, callback, reqindex, setValue, losConfigData);
            },
            functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
            condition: {
              type: 'showOnValue',
              baseOn: 'net_disbursment_mode',
              baseValue: 'CASH'
            },
          },
          {
            name: 'cash_handling_charges',
            label: updateLabel('cash handling charge (in Rs)'),
            type: 'text',
            isAmount: true,
            identifier: IDENTIFIER.INPUTTEXT2,
            disabled: true,
            customFunction: (formValues, callback, reqindex, setValue, formjson) => {
              calculateCashHandlingCharge(formValues, callback, reqindex, setValue, losConfigData);
            },
            functionMethod: FUNCTION_IDENTIFIER.ON_INIT,
            condition: {
              type: 'showOnValue',
              baseOn: 'net_disbursment_mode',
              baseValue: 'CASH'
            },
          },
          {
            name: 'cash_disbursment_CASH_ONLINE',
            label: updateLabel('cash disbursement (in Rs)'),
            type: 'text',
            isAmount: true,
            identifier: IDENTIFIER.INPUTTEXT,
            validation: {
              isRequired: true,
              requiredMsg: 'Please enter Cash Disbursement',
              pattern: REGEX.AMOUNT,
              patternMsg: 'Please enter numeric digits only'
            },
            condition: {
              type: 'showOnValue',
              baseOn: 'net_disbursment_mode',
              baseValue: 'CASH_AND_ONLINE'
            },
          },
          {
            name: 'online_disbursment_CASH_ONLINE',
            label: updateLabel('Online disbursement (in Rs)'),
            type: 'text',
            isAmount: true,
            identifier: IDENTIFIER.INPUTTEXT2,
            disabled: true,
            customFunction: (formValues, callback, reqindex, setValue, formjson) => {
              calculateNetDisbursementOnline(formValues, callback, reqindex, setValue);
            },
            functionMethod: FUNCTION_IDENTIFIER.ON_CHANGE,
            functionChangeBaseOn: 'cash_disbursment_CASH_ONLINE',
            condition: {
              type: 'showOnValue',
              baseOn: 'net_disbursment_mode',
              baseValue: 'CASH_AND_ONLINE'
            },
          },
        ],
        dynamicValidation: handleDynamicValidationBalance,
        buttonDetails: {
          name: 'Next',
          previous: 'Back',
        },
        alignment: {
          xs: 12,
          sm: 12,
          md: 6,
          lg: 4,
          xl: 4
        }
      },
      {
        title: 'Additional Gold Information',
        variant: 'outlined',
        input: deviationData,
        // addMore: true,
        // addMoreCopyDefaultValue: false,
        // addMoreFields: ['deviation_parameter', 'role', 'justification'],
        onBack: {
          resetAdditionalForm: true
        },
        dynamicValidation: handleDynamicValidationAdditional,
        addMore: true,
        addMoreStepLimit: 5,
        addMoreCopyDefaultValue: false,
        addMoreCallAuto: true,
        addMoreSperatorEnable: false,
        addMoreCallAutoCount: (formData?.manual_deviations?.length > 1) ? formData?.manual_deviations?.length : 0,
        addMoreFields: ['manual_deviation_file', 'manual_deviation_name'],
        buttonDetails: {
          name: 'Next',
          previous: 'Back',
        },
        alignment: {
          xs: 12,
          sm: 12,
          md: 4,
          lg: 4,
          xl: 4
        }
      },
      {
        title: 'Customer & Loan Details',
        variant: 'outlined',
        input: [
          {
            name: 'cam',
            type: 'cam',
            variant: 'outlined',
            identifier: IDENTIFIER.CAMREPORT,
            alignment: {
              xs: 12,
              sm: 12,
              md: 12,
              lg: 12,
              xl: 12
            }
          },
        ],
        buttonDetails: {
          name: 'Final Submit',
          previous: 'Back',
          type: 'submit'
        },
        alignment: {
          xs: 12,
          sm: 12,
          md: 4,
          lg: 4,
          xl: 4
        }
      },
    ],
    stepper: {
      steps: ['Collateral Details', 'Consolidated Collateral Details', 'Gold Information',
        'Scheme Selection', 'Fee Information', 'Fund Transfer', updateLabel('Net disbursement to customer'), 'Additional Gold Information', 'Customer & Loan Details'
      ],
      icons: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      // hide: ['xs', 'sm'],
      stepperDirection: 'horizontal',
    },
    dataFormat: 'MULTI',
    nextFunction: (step, currentStep, reset, allStepsData) => nextHandler(step, currentStep, setAlertShow, allStepsData, setIsLoading, navigate, losConfigData),
    previousFunction: (step, currentStep) => {
      backHandler(step, currentStep, setAlertShow);
    },
    onLoadState: (setValue) => updateFormState(setValue)
  };
  return formConfiguration;
};
