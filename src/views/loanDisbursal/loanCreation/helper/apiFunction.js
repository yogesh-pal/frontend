/* eslint-disable no-else-return */
/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import moment from 'moment';
import { cloneDeep } from 'lodash';
import store from '../../../../redux/store';
import { Service } from '../../../../service';
import { numberFormat } from '../../../../utils';
import { ROUTENAME, SERVICEURL, COLENDERENUM } from '../../../../constants';
import { saveAppId, saveFormData } from '../../../../redux/reducer/loanMaker';

const getErrorMsg = (res) => {
  if (res?.data?.errors?.detail) {
    return res?.data?.errors?.detail;
  }
  return 'Something went wrong!.';
};
const handleReset = (formData, reset, submitedData, appidCreation = false) => {
  const state = store.getState();
  const { submitFormValues } = state.user;
  const customerSearchDetails = state.loanMaker;
  const { customerFullDetails } = customerSearchDetails.formData;
  const udyamData = customerFullDetails?.udyam_data;
  const data = Object.values(submitedData);
  let mergeData = {};
  data.forEach((item) => {
    mergeData = { ...mergeData, ...item };
  });
  const resetData = {
    ...mergeData,
    ...submitFormValues,
    consolidated_picture_of_ornament: formData?.items_pic,
    total_net_bread_stone_weight: formData?.total_stone_weight_gm,
    total_net_count_of_all_item: formData?.total_count,
    total_net_weight_of_all_item: formData?.total_net_weight_gm,
    net_weight_after_purity: mergeData?.net_weight_after_purity,
    // Gold information
    source_of_gold: formData?.source_of_gold,
    customer_photo: formData?.customer_photo,
    end_use_of_gold: formData?.end_use_loan,
    subpurpose: formData?.end_use_loan?.subpurpose,
    // Scheme Selection
    loan_tenure: formData?.tenure,
    maximum_loan_amount: formData?.scheme_max_loan_amount,
    minimum_loan_amount: formData?.scheme_min_loan_amount,
    rate_of_interest: formData?.rate_of_interest,
    repayment_frequency: formData?.repayment_frequency,
    scheme_type: formData?.scheme_type,
    eligible_gold_loan_amount: formData?.scheme_eligible_amount,
    requested_gold_loan_amount: formData?.requested_loan_amount,
    scheme_name: formData?.scheme_code,
    // Balance Transfer
    amount: formData?.balance_amount_transfer,
    utr_refrence_number: formData?.utr_reference_number,
    net_disbursment: formData?.net_disbursment,
    // bundled_insurance: formData?.bundled_insurance,
    sum_insured: formData?.insurance_details?.sum_insured,
    premium_amount: formData?.insurance_details?.premium,
    // Additional Gold Information
    gold_pouch_number: formData?.gold_pouch_number,
    tare_weight_of_gold_packet: formData?.tare_weight_gold_pouch,
    deviations: formData?.deviations,
    // Net Disbursement To Customer
    net_disbursment_mode: formData?.net_disbursment_mode,
  };

  if (!formData.end_use_loan) {
    resetData.subpurpose = null;
    if (udyamData?.proof) {
      resetData.udyam_fuzzy_score = udyamData?.fuzzy_match_score;
      resetData.udyam_requestId = udyamData?.request_id;
      resetData.udyam_otpVerifiedon = udyamData?.otp_verified_on;
      resetData.udyam_mobile_number = udyamData?.mobile_number;
      if (udyamData?.mode === 'Online') {
        resetData.udyam_registration_number = udyamData?.reg_no;
        resetData.udyam_certificate = udyamData?.proof;
        resetData.udyam_manual_upload = null;
        resetData.udyam_manual_upload_postotp = null;
      } else if (udyamData?.mobile_number) {
        resetData.udyam_registration_number = udyamData?.reg_no;
        resetData.udyam_manual_upload = null;
        resetData.udyam_manual_upload_postotp = true;
        resetData.udyam_certificate_manual_upload_postotp = udyamData?.proof;
      } else {
        resetData.udyam_registration_number_manual = udyamData?.reg_no;
        resetData.udyam_registration_number_manual_verify = true;
        resetData.udyam_certificate_manual = udyamData?.proof;
        resetData.udyam_manual_upload = true;
        resetData.udyam_manual_upload_postotp = null;
      }
    } else {
      resetData.udyam_registration_number = null;
      resetData.udyam_manual_upload = null;
      resetData.udyam_manual_upload_postotp = null;
      resetData.udyam_mobile_number = null;
      resetData.udyam_fuzzy_score = null;
      resetData.udyam_requestId = null;
      resetData.udyam_otpVerifiedon = null;
      resetData.udyam_certificate = null;
      resetData.udyam_certificate_manual_upload_postotp = null;
      resetData.udyam_registration_number_manual = null;
      resetData.udyam_certificate_manual = null;
      resetData.udyamOTP = null;
      resetData.udyam_failure_reason = null;
      resetData.udyam_certificate_postOTP = null;
      resetData.udyam_registration_number_manual_verify = null;
    }
  }
  if (formData.net_disbursment_mode === 'CASH_AND_ONLINE') {
    resetData.online_disbursment_CASH_ONLINE = formData?.online_disbursment;
    resetData.cash_disbursment_CASH_ONLINE = formData?.cash_disbursment;
    resetData.cash_disbursment_CASH = '';
    resetData.online_disbursment_online = '';
  } else if (formData.net_disbursment_mode === 'CASH') {
    resetData.cash_disbursment_CASH = formData?.cash_disbursment;
    resetData.online_disbursment_CASH_ONLINE = '';
    resetData.cash_disbursment_CASH_ONLINE = '';
    resetData.online_disbursment_online = '';
  } else if (formData.net_disbursment_mode === 'ONLINE') {
    resetData.online_disbursment_online = formData?.online_disbursment;
    resetData.online_disbursment_CASH_ONLINE = '';
    resetData.cash_disbursment_CASH_ONLINE = '';
    resetData.cash_disbursment_CASH = '';
  } else if (formData.net_disbursment_mode === 'UPI') {
    resetData.online_disbursment_online = formData?.online_disbursment;
    resetData.online_disbursment_CASH_ONLINE = '';
    resetData.cash_disbursment_CASH_ONLINE = '';
    resetData.cash_disbursment_CASH = '';
    resetData.upiId = formData?.upi_details?.vpa;
    resetData.upiToken = submitedData?.['Net Disbursement To Customer']?.upiToken;
    resetData.registered_name = formData?.upi_details?.name;
    resetData.upiIDverificationStatus = submitedData?.['Net Disbursement To Customer']?.upiIDverificationStatus;
  } else {
    resetData.online_disbursment_online = '';
    resetData.online_disbursment_CASH_ONLINE = '';
    resetData.cash_disbursment_CASH_ONLINE = '';
    resetData.cash_disbursment_CASH = '';
    resetData.upiId = null;
    resetData.upiToken = null;
    resetData.registered_name = null;
    resetData.upiIDverificationStatus = null;
  }
  // interAccount
  if (formData?.interaccounts !== null && formData?.interaccounts?.length > 0) {
    formData?.interaccounts?.forEach((item, index) => {
      const tempIndex = index > 0 ? `__${index}` : '';
      resetData[`loan_account_number${tempIndex}`] = item?.loan_account_no ?? '';
      resetData[`amount_to_transfer${tempIndex}`] = item?.loan_amount_transfer ?? '';
    });
  } else {
    resetData.loan_account_number = '';
    resetData.amount_to_transfer = '';
    resetData.activeAddMore = '';
    const keys = Object.keys(resetData);
    const findKeys = keys.filter((item) => item.includes('loan_account_number__'));
    findKeys.forEach((key, index) => {
      const tempIndex = `__${index + 1}`;
      resetData[`loan_account_number${tempIndex}`] = '';
      resetData[`amount_to_transfer${tempIndex}`] = '';
    });
  }
  if (appidCreation) {
    const keys = Object.keys(resetData);
    const collateralData = keys.filter((item) => item.includes('item_count'));
    collateralData?.forEach((item, index) => {
      const tempIndex = index > 0 ? `__${index}` : '';
      resetData[`breads_stone_weight${tempIndex}`] = null;
      resetData[`item_count${tempIndex}`] = null;
      resetData[`net_weight_after_purity${tempIndex}`] = null;
      resetData[`item_name${tempIndex}`] = null;
      resetData[`purity${tempIndex}`] = null;
      resetData[`total_weight${tempIndex}`] = null;
      resetData[`ornament_live_photo${tempIndex}`] = null;
    });
  }
  const stage = ['stage1', 'stage2', 'stage3', 'stage4', 'stage5', 'stage6', 'stage7', 'stage8', 'stage9'];
  const index = stage.findIndex((singleStage) => singleStage === formData?.application_stage);
  const step = index > -1 ? index : 0;
  if (step === 5) {
    resetData.bundled_insurance = 'YES';
  }

  reset(resetData);
};

const saveDataToRedux = (apiResponse) => {
  if (apiResponse.applied_loan_amount) {
    apiResponse.applied_loan_amount = numberFormat(apiResponse?.applied_loan_amount);
  }
  if (apiResponse.eligible_gold_loan_amount) {
    apiResponse.eligible_gold_loan_amount = numberFormat(apiResponse?.eligible_gold_loan_amount);
  }
  if (apiResponse.max_eligible_loan_amount) {
    apiResponse.max_eligible_loan_amount = numberFormat(apiResponse?.max_eligible_loan_amount);
  }
  if (apiResponse.scheme_eligible_amount) {
    apiResponse.scheme_eligible_amount = numberFormat(apiResponse?.scheme_eligible_amount);
  }
  if (apiResponse.requested_loan_amount) {
    apiResponse.requested_loan_amount = numberFormat(apiResponse?.requested_loan_amount);
  }
  if (apiResponse.scheme_max_loan_amount) {
    apiResponse.scheme_max_loan_amount = numberFormat(apiResponse?.scheme_max_loan_amount);
  }
  if (apiResponse.scheme_min_loan_amount) {
    apiResponse.scheme_min_loan_amount = numberFormat(apiResponse?.scheme_min_loan_amount);
  }
  if (apiResponse.net_disbursment) {
    apiResponse.net_disbursment = numberFormat(apiResponse?.net_disbursment);
  }
  if (apiResponse.cash_disbursment) {
    apiResponse.cash_disbursment = numberFormat(apiResponse?.cash_disbursment);
  }
  if (apiResponse.online_disbursment) {
    apiResponse.online_disbursment = numberFormat(apiResponse?.online_disbursment);
  }
  if (apiResponse.interaccounts) {
    apiResponse.interaccounts = apiResponse?.interaccounts?.map((item) => {
      item.loan_amount_transfer = numberFormat(item?.loan_amount_transfer);
      return item;
    });
  }
  if (apiResponse.balance_amount_transfer) {
    apiResponse.balance_amount_transfer = numberFormat(apiResponse?.balance_amount_transfer);
  }
  if (apiResponse.amount) {
    apiResponse.amount = numberFormat(apiResponse?.amount);
  }
  // if (apiResponse.bundled_insurance) {
  //   apiResponse.bundled_insurance = apiResponse.bundled_insurance;
  // }
  const state = store.getState();
  const { formData } = state.loanMaker;
  let isSummaryFieldsPresent = true;
  const primaryInformationKeys = ['active_loans', 'closed_loans', 'total_pos', 'total_interest_overdue', 'npa_status', 'count_of_default_account',
    'count_of_npa_account', 'count_of_auctioned_account', 'count_of_spurious_account', 'lien_status', 'legal_status', 'loan_detail', 'customerFullDetails', 'total_disbursed_amount',
    'customer_pan_no', 'rebateSlabDetails', 'rebateStepupSlabDetails', 'cust_dt'];
  primaryInformationKeys.forEach((item) => {
    if (!formData.hasOwnProperty(item)) {
      isSummaryFieldsPresent = false;
    }
  });
  const cloneRes = cloneDeep(apiResponse);
  if (apiResponse.insurance_details) {
    cloneRes.sum_insured = apiResponse.insurance_details?.sum_insured;
    cloneRes.premium_amount = apiResponse.insurance_details?.premium;
  }
  if (isSummaryFieldsPresent) {
    cloneRes.dob = formData.dob;
    cloneRes.primary_mobile_number = formData.primary_mobile_number;
    cloneRes.active_loans = formData.active_loans;
    cloneRes.closed_loans = formData.closed_loans;
    cloneRes.total_pos = formData.total_pos;
    cloneRes.total_interest_overdue = formData.total_interest_overdue;
    cloneRes.npa_status = formData.npa_status;
    cloneRes.count_of_default_account = formData.count_of_default_account;
    cloneRes.count_of_npa_account = formData.count_of_npa_account;
    cloneRes.count_of_auctioned_account = formData.count_of_auctioned_account;
    cloneRes.count_of_spurious_account = formData.count_of_spurious_account;
    cloneRes.lien_status = formData.lien_status;
    cloneRes.legal_status = formData.legal_status;
    cloneRes.loan_detail = formData.loan_detail;
    cloneRes.customerFullDetails = formData.customerFullDetails;
    cloneRes.total_disbursed_amount = formData.total_disbursed_amount;
    cloneRes.customer_pan_no = formData.customer_pan_no;
    cloneRes.rebateSlabDetails = formData.rebateSlabDetails;
    cloneRes.rebateStepupSlabDetails = formData.rebateStepupSlabDetails;
    cloneRes.cust_dt = formData.cust_dt;
  }
  store.dispatch(saveFormData(cloneRes));
};

const getData = async (reset, appNo) => {
  const { data } = await Service.get(`${process.env.REACT_APP_LOAN_LISTING}/${appNo}`);
  await handleReset(data, reset, [], true);
  saveDataToRedux(data);
};

const employeeDepupData = async (payload, setAlertShow) => {
  try {
    const empDedupeRes = await Service.post(process.env.REACT_APP_EMPLOYEE_DEDUPE, payload);
    if (empDedupeRes?.status === 200) {
      const data = {};
      data.employee_dedupe_token = empDedupeRes.data.data.employee_dedupe_token;
      return {
        status: true,
        data
      };
    }

    setAlertShow({ open: true, msg: 'Employee Dedupe API failed', alertType: 'error' });
    return {
      status: false,
      data: {}
    };
  } catch (err) {
    setAlertShow({ open: true, msg: 'Employee Dedupe API failed', alertType: 'error' });
    return { status: false, data: {} };
  }
};

const hitParallel = async (data) => {
  const promise = await Promise.all([
    Service.get(`${process.env.REACT_APP_USER_VIEW}?fc=1&token=1&is_cpv=1&isTopUp=1&is_deviation=1&customer_id=${data.customer_id}`),
    Service.get(`${process.env.REACT_APP_USER_VIEW}?customer_id=${data.customer_id}`)
  ]);
  console.log('promises', promise);
  return promise;
};

const isOccupationValid = (customerOccupation, colenderConfig, setAlertShow) => {
  const isValid = colenderConfig?.allowed_occupations?.includes(customerOccupation);
  if (!isValid) {
    setAlertShow({ open: true, msg: ` ${colenderConfig.display_name} schemes are available only to ${colenderConfig?.allowed_occupations?.join(', ')}.`, alertType: 'error' });
    return false;
  }
  return true;
};

const AppIdCreationAPi = async (data, setAlertShow, reset, isEmpDepupeEnabled) => {
  try {
    const state = store.getState();
    const { formData } = state.loanMaker;
    const { losConfigData, colender } = data;
    const colenderConfig = losConfigData[colender];
    if (!isOccupationValid(formData?.customerFullDetails?.customer_occupation, colenderConfig, setAlertShow)) return true;
    data.applied_loan_amount = parseFloat((data?.applied_loan_amount)?.replace(/,/g, ''));
    const employeeDedupe = {};
    if (!formData.cust_dt) {
      const [flexcubeCustomerRes, internalCustomerRes] = await hitParallel(data);
      employeeDedupe.pan_no = internalCustomerRes.data.data.pan_no;
      employeeDedupe.mobile_number = internalCustomerRes.data.data.primary_mobile_number;
      employeeDedupe.bank_account_number = internalCustomerRes.data.data.account_number;
      // to fix dt is required issue on stage 7
      const tempFormData = cloneDeep(formData);
      store.dispatch(saveFormData({ ...tempFormData, cust_id: flexcubeCustomerRes.data.data.dt }));
    } else {
      if (formData?.customerFullDetails?.pan_no) employeeDedupe.pan_card_number = formData.customerFullDetails.pan_no;
      if (formData?.customerFullDetails?.primary_mobile_number) employeeDedupe.mobile_number = formData.customerFullDetails.primary_mobile_number;
      if (formData?.customerFullDetails?.account_number) employeeDedupe.bank_account_number = formData.customerFullDetails.account_number;
    }

    if (data?.colender === COLENDERENUM.IOBAGRI) {
      const validateAmountReq = {
        lms_response: formData?.cust_dt,
        customer_id: data?.customer_id,
        colender: data?.colender,
        request_amount: data?.applied_loan_amount
      };
      if (!validateAmountReq?.lms_response) {
        const request2 = await Service.get(`${process.env.REACT_APP_USER_VIEW}?customer_id=${data.customer_id}&fc=1&token=1&is_deviation=1`);
        validateAmountReq.lms_response = request2?.data?.data?.dt;
      }
      const res = await Service.post(SERVICEURL.COLENDER.VALIDATEAMOUNT, validateAmountReq);

      const { success, message } = res.data;

      if (!success) {
        setAlertShow({ open: true, msg: message, alertType: 'error' });
        return true;
      }
    }

    if (isEmpDepupeEnabled) {
      const empRes = await employeeDepupData(employeeDedupe, setAlertShow);
      data = { ...data, ...empRes.data };
    }

    const res = await Service.post(`${process.env.REACT_APP_APPLICATION_ID_CREATION}`, data);
    if (res.status === 201) {
      store.dispatch(saveAppId(res?.data?.application_no));
      if (reset) {
        await getData(reset, res?.data?.application_no);
      }
      setAlertShow({ open: true, msg: `The Application Number is – ${res?.data?.application_no}`, alertType: 'success' });
      return false;
    }
  } catch (e) {
    console.log('Error', e);
    const errormsg = getErrorMsg(e.response);
    setAlertShow({ open: true, msg: errormsg, alertType: 'error' });
    return true;
  }
};

const pollStatus = async (n, applicationNo, setAlertShow, setIsLoading, navigate) => {
  try {
    const disbursementStatusRes = await Service.get(`${process.env.REACT_APP_BOB_COLENDER_SERVICE}/status/BOB/${applicationNo}`);
    if (disbursementStatusRes.status === 200) {
      if (disbursementStatusRes.data.status === 'SUCCESS') {
        setAlertShow({ open: true, msg: 'Success!', alertType: 'success' });
        setTimeout(() => navigate(ROUTENAME.loanCreationList), 2000);
      } else if (disbursementStatusRes.data.status === 'FAILURE' || (n === 3)) {
        setAlertShow({ open: true, msg: 'Unable to process at the moment, Please try after some time.', alertType: 'error' });
        setTimeout(() => navigate(ROUTENAME.loanCreationList), 2000);
      } else {
        setTimeout(() => {
          pollStatus(n + 1, applicationNo, setAlertShow, setIsLoading, navigate);
        }, 10000 * (n + 1));
      }
    }
  } catch (err) {
    console.log('error', err);
    setIsLoading({ loader: false, name: null });
    setAlertShow({
      open: true,
      msg: 'Something went wrong, Please try again.',
      alertType: 'error'
    });
  }
};

const UpdateData = async (request, setAlertShow, reset, data, setIsLoading, navigate) => {
  try {
    const state = store.getState();
    const { appId, formData } = state.loanMaker;
    if (formData.colender === 'BOB' && request?.application_stage === 'final') {
      setIsLoading({ loader: true, name: 'pageLoader', stage: request?.application_stage });
      const bobStatusRes = await Service.get(`${process.env.REACT_APP_BOB_COLENDER_SERVICE}/status/BOB/${appId}`);
      if (bobStatusRes.data.status === 'PENDING') {
        await Service.put(`${process.env.REACT_APP_LOAN_LISTING}/${appId}`, request);
        setTimeout(() => {
          pollStatus(1, appId, setAlertShow, setIsLoading, navigate);
        }, 10000);
      } else if (bobStatusRes.data.status === 'IN_PROGRESS') {
        setTimeout(() => {
          pollStatus(1, appId, setAlertShow, setIsLoading, navigate);
        }, 10000);
      }
      return true;
    }
    if (request?.application_stage === 'stage4' && request?.colender === 'IOB - BUSINESS') {
      setIsLoading({ loader: true, name: 'pageLoader', stage: request?.application_stage });
    }
    const res = await Service.put(`${process.env.REACT_APP_LOAN_LISTING}/${appId}`, request);
    res.interaccounts = (res.interaccounts)?.map((item) => {
      item.loan_amount_transfer = numberFormat(item?.loan_amount_transfer.toString());
      return item;
    });
    if (res.status === 200) {
      saveDataToRedux(res?.data);
      if (reset) {
        handleReset(res?.data, reset, data);
      }
      return false;
    }
  } catch (e) {
    console.log('Error', e);
    const errormsg = getErrorMsg(e.response);
    setAlertShow({ open: true, msg: errormsg, alertType: 'error' });
    return true;
  } finally {
    if (request?.application_stage === 'stage4' && request?.colender === 'IOB - BUSINESS') {
      setIsLoading({ loader: false, name: 'pageLoader' });
    }
  }
};

const CollateralDataSAveAPi = (data, setAlertShow, reset) => {
  const itemData = [];
  const formValues = data['Collateral Details'];
  const keys = Object.keys(formValues);
  const collateralData = keys.filter((item) => item.includes('item_count'));
  collateralData.forEach((item) => {
    const nameArray = item.split('__');
    const index = (nameArray.length > 1) ? `__${nameArray[nameArray.length - 1]}` : '';
    itemData.push({
      name: formValues[`item_name${index}`],
      item_count: parseFloat(formValues[`item_count${index}`]),
      stone_weight_gm: parseFloat(formValues[`breads_stone_weight${index}`]),
      net_weight_gm: parseFloat(formValues[`net_weight_after_purity${index}`]),
      total_weight_gm: parseFloat(formValues[`total_weight${index}`]),
      purity: `${formValues[`purity${index}`]}K`,
      item_pic: formValues[`ornament_live_photo${index}`],
      other_name: formValues[`other_item_name${index}`]
    });
  });
  return UpdateData({
    application_stage: 'stage2',
    items: itemData
  }, setAlertShow, reset, data);
};
const ConsolidateDataSAveAPi = (data, setAlertShow, reset) => {
  const formValues = data['Consolidated Collateral Details'];
  if (parseFloat(formValues.total_net_weight_after_purity) < 1) {
    setAlertShow({ open: true, msg: 'Consolidated Net Weight is less than 1 gram. Hence, loan is not allowed.', alertType: 'error' });
    return false;
  }
  return UpdateData({
    application_stage: 'stage3',
    total_weight_gm: parseFloat(formValues.total_net_weight_of_all_item),
    total_count: parseFloat(formValues.total_net_count_of_all_item),
    total_stone_weight_gm: parseFloat(formValues.total_net_bread_stone_weight),
    total_net_weight_gm: parseFloat(formValues.total_net_weight_after_purity),
    items_pic: formValues.consolidated_picture_of_ornament,
    max_eligible_loan_amount: parseFloat((formValues.max_eligible_loan_amount).replace(/,/g, ''))
  }, setAlertShow, reset, data);
};

const certificateProvider = (formValues, allStepsData) => {
  if (formValues.udyam_certificate) {
    if (Array.isArray(formValues.udyam_certificate)) return formValues.udyam_certificate;
    else return [formValues.udyam_certificate];
  }
  if (formValues.udyam_manual_upload) {
    const udyamCertificate = [];
    Object.keys(allStepsData).forEach((ele) => {
      if (ele.includes('udyam_certificate_manual') && allStepsData[ele]) {
        udyamCertificate.push(allStepsData[ele]);
      }
    });
    return udyamCertificate;
  }
  if (formValues.udyam_certificate_postOTP) {
    if (Array.isArray(formValues.udyam_certificate_postOTP)) return formValues.udyam_certificate_postOTP;
    else return [formValues.udyam_certificate_postOTP];
  }

  if (formValues.udyam_manual_upload_postotp) {
    const udyamCertificate = [];
    Object.keys(allStepsData).forEach((ele) => {
      if (ele.includes('udyam_certificate_manual_upload_postotp') && allStepsData[ele]) {
        udyamCertificate.push(allStepsData[ele]);
      }
    });
    return udyamCertificate;
  }
  // if (formValues.udyam_certificate_manual_upload_postotp) return formValues.udyam_certificate_manual_upload_postotp;
};
const GoldInfoDataSAveAPi = (data, setAlertShow, reset, allStepsData, setIsLoading) => {
  const state = store.getState();
  const { formData } = state.loanMaker;
  const udyamData = formData?.customerFullDetails?.udyam_data;
  const formValues = data['Gold Information'];
  const endUseLoanDetails = {};
  if (formValues.end_use_of_gold === 'AGR') {
    endUseLoanDetails.id = formValues.agriculture_record_number;
    endUseLoanDetails.subpurpose = formValues?.subpurpose;
    const agricultureProof = [];
    Object.keys(allStepsData).forEach((ele) => {
      if (ele.includes('agriculture_proof')) {
        agricultureProof.push(allStepsData[ele]);
      }
    });
    endUseLoanDetails.proof = agricultureProof;
  }
  if (formData.colender === 'IOB - BUSINESS' && formValues.end_use_of_gold === 'BNS') {
    const metaData = {};
    console.log('formValues ===', formValues, allStepsData);
    // if (allStepsData.hasOwnProperty('udyam_registration_number_verify')) {
    //   endUseLoanDetails.status = allStepsData.udyam_registration_number_verify;
    // } else {
    //   setAlertShow({ open: true, msg: 'Please verify udyam registration number.', alertType: 'error' });
    //   return false;
    // }
    // if (formData.colender === 'IOB - BUSINESS' && !allStepsData.udyam_registration_number_verify) {
    //   setAlertShow({ open: true, msg: 'Udyam registration number is not valid, Unable to proceed further.', alertType: 'error' });
    //   return false;
    // }
    // if ((!formValues.udyam_certificate && !formValues.udyam_certificate_postOTP)) {
    //   setAlertShow({ open: true, msg: formValues.udyam_failure_reason, alertType: 'error' });
    //   return false;
    // }
    if (formValues.udyam_manual_upload) {
      metaData.reg_no = formValues.udyam_registration_number_manual;
      metaData.mode = 'Offline';
      metaData.mobile_number = '';
      metaData.status = formValues.udyam_registration_number_manual_verify;
    } else {
      metaData.reg_no = formValues.udyam_registration_number;
      if (!formValues.udyam_manual_upload_postotp) {
        metaData.mode = 'Online';
        metaData.mobile_number = formValues.udyam_mobile_number;

        if (formValues.udyam_fuzzy_score < 40) {
          setAlertShow({ open: true, msg: 'Owner Name does not match with the Customer Name', alertType: 'error' });
          return true;
        }
      } else {
        metaData.mode = 'Offline';
        metaData.mobile_number = '';
      }
    }
    endUseLoanDetails.subpurpose = formValues?.subpurpose;
    metaData.fuzzy_match_score = formValues.udyam_fuzzy_score;
    metaData.request_id = formValues.udyam_requestId ?? null;
    if (udyamData?.proof) {
      metaData.otp_verified_on = formValues.udyam_otpVerifiedon;
      metaData.proof = udyamData.proof;
      metaData.mode = udyamData.mode;
    } else {
      metaData.otp_verified_on = new Date().getTime();
      metaData.proof = certificateProvider(formValues, allStepsData);
    }
    if (metaData.proof.length === 0) {
      setAlertShow({
        alertType: 'error',
        msg: 'Please upload Udyam Certificate',
        open: true
      });
      return true;
    }
    // endUseLoanDetails.proof = [formValues.udyam_certificate ?? formValues.udyam_certificate_postOTP];
    if (!udyamData?.proof) {
      endUseLoanDetails.udyam_meta_data = metaData;
    }
    if (formValues.udyam_manual_upload && (!formValues.udyam_registration_number_manual_verify)) {
      setAlertShow({ open: true, msg: 'Udyam registration number is not valid, Unable to proceed further.', alertType: 'error' });
      return true;
    }
    console.log('payload', endUseLoanDetails, formValues, allStepsData, allStepsData.udyam_registration_number_verify);
    // return true;
    // const udyamCertificate = [];
    // Object.keys(allStepsData).forEach((ele) => {
    //   if (ele.includes('udyam_certificate')) {
    //     udyamCertificate.push(allStepsData[ele]);
    //   }
    // });
    // endUseLoanDetails.proof = udyamCertificate;
  } else if (formValues.end_use_of_gold === 'BNS') {
    if (allStepsData.hasOwnProperty('udyam_registration_number_verify')) {
      endUseLoanDetails.status = allStepsData.udyam_registration_number_verify;
    } else {
      setAlertShow({ open: true, msg: 'Please verify udyam registration number.', alertType: 'error' });
      return false;
    }
    if (formData.colender === 'IOB - BUSINESS' && !allStepsData.udyam_registration_number_verify) {
      setAlertShow({ open: true, msg: 'Udyam registration number is not valid, Unable to proceed further.', alertType: 'error' });
      return false;
    }
    endUseLoanDetails.id = formValues.udyam_registration_number;
    endUseLoanDetails.subpurpose = formValues?.subpurpose;
    const udyamCertificate = [];
    Object.keys(allStepsData).forEach((ele) => {
      if (ele.includes('udyam_certificate_other')) {
        udyamCertificate.push(allStepsData[ele]);
      }
    });
    endUseLoanDetails.proof = udyamCertificate;
  }
  return UpdateData({
    application_stage: 'stage4',
    source_of_gold: formValues.source_of_gold,
    colender: formData.colender,
    crif_score: null,
    crif_url: null,
    end_use_loan: formValues.end_use_of_gold,
    customer_photo: formValues.customer_photo,
    end_use_loan_details: endUseLoanDetails,
    customer_city_of_birth: formValues?.customer_city_of_birth,
    current_date_of_residence: formValues?.current_date_of_residence ? moment(formValues?.current_date_of_residence).format('DD/MM/YYYY') : null,
    permanent_date_of_residence: formValues?.permanent_date_of_residence ? moment(formValues?.permanent_date_of_residence).format('DD/MM/YYYY') : null
  }, setAlertShow, reset, data, setIsLoading);
};
const schemeDataSAveAPi = (data, setAlertShow, reset) => {
  const formValues = data['Scheme Selection'];
  const state = store.getState();
  const { schemeData, submitFormValues } = state.user;
  const { formData } = state.loanMaker;
  if (formData.customer_pan_no?.trim().length === 0 && (formData.total_disbursed_amount + parseFloat((formValues.requested_gold_loan_amount).replace(/,/g, ''))) >= 200000) {
    setAlertShow({ open: true, msg: 'Customer’s total disbursement till date is above 2 Lacs, hence PAN card is mandatory.', alertType: 'error' });
    return false;
  }
  const keys = Object.keys(submitFormValues);
  const feeData = keys.filter((item) => item.includes('fee_name'));
  const fee = {};
  const feefinalArray = [];
  let scheme = '';
  feeData.forEach((item) => {
    const nameArray = item.split('__');
    const index = (nameArray.length > 1) ? `__${nameArray[nameArray.length - 1]}` : '';
    fee[submitFormValues[`fee_name${index}`]] = {
      amount: submitFormValues[`fee_amount${index}`],
      cgst: submitFormValues[`fee_tax_cgst${index}`] ?? 9,
      sgst: submitFormValues[`fee_tax_sgst${index}`] ?? 9
    };
  });
  schemeData.forEach((item) => {
    if (item.code === submitFormValues.scheme_name) {
      scheme = item?.name;
      let feeData2 = JSON.parse(item.fee);
      if (feeData2?.length > 0) {
        feeData2 = feeData2.filter((ele) => ele.name === 'PROCESSING');
        feeData2?.forEach((feesingle) => {
          feefinalArray.push({
            name: feesingle?.name,
            value: feesingle?.value,
            type: feesingle?.type,
            cgst: feesingle?.cgst,
            sgst: feesingle?.sgst,
            amount: fee[feesingle?.name]
          });
        });
      }
    }
  });
  return UpdateData({
    application_stage: 'stage5',
    scheme_code: formValues.scheme_name,
    scheme_name: scheme,
    scheme_min_loan_amount: parseFloat((formValues.minimum_loan_amount).replace(/,/g, '')),
    scheme_max_loan_amount: parseFloat((formValues.maximum_loan_amount).replace(/,/g, '')),
    rate_of_interest: formValues.rate_of_interest,
    additional_interest: formValues.additional_interest,
    tenure: formValues.loan_tenure,
    repayment_frequency: formValues.repayment_frequency,
    scheme_type: formValues.scheme_type,
    scheme_eligible_amount: parseFloat((formValues.eligible_gold_loan_amount).replace(/,/g, '')),
    requested_loan_amount: parseFloat((formValues.requested_gold_loan_amount).replace(/,/g, '')),
    fees: feefinalArray
  }, setAlertShow, reset, data);
};
const FeeDataSAveAPi = (data, setAlertShow, reset) => {
  const state = store.getState();
  const { chargerData, submitFormValues } = state.user;
  const { formData } = state.loanMaker;
  if (submitFormValues.total_fees >= submitFormValues.requested_gold_loan_amount) {
    setAlertShow({ open: true, msg: 'Total fees can not be greater than or equal to requested loan amount. Net disbursement cannot be negative.', alertType: 'error' });
    return false;
  }
  const keys = Object.keys(submitFormValues);
  const chargeData = keys.filter((item) => item.includes('charger_name'));
  const charge = {};
  const chargefinalArray = [];
  chargeData.forEach((item) => {
    const nameArray = item.split('__');
    const index = (nameArray.length > 1) ? `__${nameArray[nameArray.length - 1]}` : '';
    charge[submitFormValues[`charger_name${index}`]] = {
      amount: submitFormValues[`charger_amount${index}`],
      cgst: submitFormValues[`charger_tax_sgst${index}`] ?? 9,
      sgst: submitFormValues[`charger_tax_cgst${index}`] ?? 9
    };
  });
  chargerData.forEach((item) => {
    chargefinalArray.push({
      name: item?.name,
      id: item?.id,
      value: item?.value,
      type: item?.type,
      cgst: item?.cgst,
      sgst: item?.sgst,
      amount: charge[item?.name]
    });
  });
  return UpdateData({
    application_stage: 'stage6',
    charge: chargefinalArray,
    total_charge: formData.total_charge,
  }, setAlertShow, reset, data);
};
const InterAccountDataSAveAPi = (data, setAlertShow, reset, losConfigData) => {
  const formValues = data['Fund Transfer'];
  const keys = Object.keys(formValues);
  const collateralData = keys?.filter((item) => item.includes('amount_to_transfer'));
  const interaccounts = [];
  const state = store.getState();
  const { formData } = state.loanMaker;
  const premiumValues = losConfigData?.[formData?.colender]?.insurance;
  const insuranceValue = premiumValues?.find((item) => item?.sum_insured === Number(formValues.sum_insured));
  const dob = formData.dob.split('/');
  const dateofBirth = new Date(dob[2], dob[1] - 1, dob[0]);
  const diff = new Date() - dateofBirth;
  const currentAge = Math.floor(diff / 31557600000);
  if (formValues.bundled_insurance === 'YES' && (currentAge < 18 || currentAge > 60)) {
    setAlertShow({ open: true, msg: 'Applicant must be between 18 and 60 years old to select Loan Kavach.', alertType: 'error' });
    return true;
  }
  collateralData?.forEach((item) => {
    const nameArray = item.split('__');
    const index = (nameArray.length > 1) ? `__${nameArray[nameArray.length - 1]}` : '';
    if (formValues[`amount_to_transfer${index}`] !== '' && formValues[`loan_account_number${index}`] !== '') {
      interaccounts.push({
        loan_account_no: formValues[`loan_account_number${index}`],
        loan_amount_transfer: parseFloat((formValues[`amount_to_transfer${index}`].toString().replace(/,/g, ''))),
      });
    }
  });
  const custDT = {};
  if (formData?.cust_dt) {
    custDT.dt = formData.cust_dt;
  }
  return UpdateData({
    application_stage: 'stage7',
    interaccounts,
    balance_transfer_mode: formValues.balance_transfer_mode,
    balance_amount_transfer: (typeof formValues.amount === 'string') ? parseFloat((formValues.amount.replace(/,/g, ''))) : parseFloat((formValues.amount)),
    utr_reference_number: formValues.utr_refrence_number,
    bundled_insurance: formValues.bundled_insurance === 'YES',
    insurance_details: insuranceValue,
    ...custDT
  }, setAlertShow, reset, data);
};
const BalanceTransferDataSAveAPi = async (data, setAlertShow, reset, upiToken, losConfigData) => {
  const formValues = data['Net Disbursement To Customer'];
  let submitValues = {
    application_stage: 'stage8',
    net_disbursment_mode: formValues?.net_disbursment_mode,
    net_disbursment: Math.round(parseFloat(formValues?.net_disbursement_to_customer.replace(/,/g, '')))
  };
  if (['CASH', 'CASH_AND_ONLINE'].includes(formValues?.net_disbursment_mode)) {
    try {
      const response = await Service.get(`${process.env.REACT_APP_CASH_SERVICE}/cashandpacketsummary/cashpos`);
      if ((formValues?.net_disbursment_mode === 'CASH' && formValues?.cash_disbursment_CASH.replace(/,/g, '') > response?.data?.data?.closing_balance)
      || (formValues?.net_disbursment_mode === 'CASH_AND_ONLINE' && formValues?.cash_disbursment_CASH_ONLINE.replace(/,/g, '') > response?.data?.data?.closing_balance)) {
        setAlertShow({ open: true, msg: 'Branch Cash after this cash disbursement will be less than zero. Hence, this cash disbursement is not allowed.', alertType: 'error' });
        return true;
      }
      submitValues = {
        ...submitValues,
        cash_validation_token: response?.data?.data?.dt,
      };
    } catch (err) {
      console.log('Error', err);
      setAlertShow({ open: true, msg: 'Something went wrong while fetching branch cash details.', alertType: 'error' });
      return true;
    }
  }
  if (formValues?.net_disbursment_mode === 'CASH') {
    const cashHandlingCharge = parseInt(formValues.cash_handling_charges, 10);
    submitValues = {
      ...submitValues,
      cash_handling_charge: cashHandlingCharge,
      net_disbursment: Number(formValues?.cash_disbursment_CASH.replace(/,/g, '')),
      cash_disbursment: Number(formValues?.cash_disbursment_CASH.replace(/,/g, '')),
    };
  } else if (formValues?.net_disbursment_mode === 'ONLINE') {
    submitValues = {
      ...submitValues,
      online_disbursment: Number(formValues?.online_disbursment_online.replace(/,/g, '')),
    };
  } else if (formValues?.net_disbursment_mode === 'UPI') {
    if (formValues.upiFailureReason) {
      setAlertShow({ open: true, msg: formValues.upiFailureReason, alertType: 'error' });
      return true;
    }
    submitValues = {
      ...submitValues,
      upi_verify_token: formValues.upiToken ?? upiToken
    };
  } else {
    submitValues = {
      ...submitValues,
      online_disbursment: Number(formValues?.online_disbursment_CASH_ONLINE.replace(/,/g, '')),
      cash_disbursment: Number(formValues?.cash_disbursment_CASH_ONLINE.replace(/,/g, '')),
    };
  }
  return UpdateData(submitValues, setAlertShow, reset, data);
};
const AdditionalGoldDataSAveAPi = async (data, setAlertShow, reset) => {
  try {
    const formValues = data['Additional Gold Information'];
    const manualDeviations = [];
    Object.entries(formValues).forEach((ele) => {
      if (ele[0].includes('manual_deviation_file')) {
        const nameArray = ele[0].split('__');
        const index = (nameArray.length > 1) ? `__${nameArray[nameArray.length - 1]}` : '';
        if (Array.isArray(ele[1])) {
          const fileNameArray = ele[1][0][1].split('.');
          manualDeviations.push({
            file: ele[1][0][3],
            fileName: fileNameArray[0],
            fileType: ele[1][0][2],
            name: formValues[`manual_deviation_name${index}`]
          });
        } else if (formValues[`manual_deviation_name${index}`]) {
          manualDeviations.push({
            name: formValues[`manual_deviation_name${index}`],
            path: ele[1]
          });
        }
      }
    });

    const generateURLRequests = [];
    const fileUploadRequests = [];
    let isAnyApiFailed = false;

    manualDeviations.forEach((item) => {
      if (item?.fileName) {
        const request = Service.get(`${process.env.REACT_APP_GENERATE_S3_URL}?module=GOLD&doc=${item.fileName}`);
        generateURLRequests.push(request);
      } else {
        generateURLRequests.push(null);
      }
    });

    await Promise.all(generateURLRequests).then((generatedURLS) => {
      generatedURLS.forEach((ele, index) => {
        if (ele) {
          manualDeviations[index].putURL = ele.data?.data?.put;
          manualDeviations[index].path = ele.data?.data?.path;
        }
      });
    }).catch((err) => {
      console.log('Error', err);
      setAlertShow({ open: true, msg: 'Error while generating document url, Please try again', alertType: 'error' });
      isAnyApiFailed = true;
    });

    if (isAnyApiFailed) {
      return null;
    }

    manualDeviations.forEach((item) => {
      if (item?.putURL) {
        const request = Service.putWithFile(item.putURL, item.file, {
          headers: {
            'Content-Type': item.fileType,
            'Access-Control-Allow-Origin': '*'
          }
        });
        fileUploadRequests.push(request);
      }
    });
    await Promise.all(fileUploadRequests).then().catch((err) => {
      console.log('Error', err);
      setAlertShow({ open: true, msg: 'Error while uploading document, Please try again', alertType: 'error' });
      isAnyApiFailed = true;
    });

    if (isAnyApiFailed) {
      return null;
    }

    return UpdateData({
      application_stage: 'stage9',
      gold_pouch_number: formValues.gold_pouch_number,
      tare_weight_gold_pouch: parseFloat(formValues.tare_weight_of_gold_packet),
      deviations: Object.values(formValues.deviations) ?? [],
      manual_deviations: manualDeviations.map((ele) => ({ name: ele.name, file_url: ele.path }))
    }, setAlertShow, reset, data);
  } catch (err) {
    console.log('err', err);
    setAlertShow({ open: true, msg: 'Document could not be uploaded, Please try again', alertType: 'error' });
  }
};
const finalDataSAveAPi = async (data, setAlertShow, reset, setIsLoading, navigate) => {
  const formValues = data['Customer & Loan Details'];
  return UpdateData({
    application_stage: 'final',
    aadhar_no: formValues?.cam
  }, setAlertShow, reset, data, setIsLoading, navigate);
};

const isAllowed = (options) => {
  if (options.some((obj) => typeof (obj) === 'object' && obj.label === 'No Active Loan')) {
    return false;
  }
  return true;
};

export {
  AppIdCreationAPi,
  CollateralDataSAveAPi,
  ConsolidateDataSAveAPi,
  GoldInfoDataSAveAPi,
  schemeDataSAveAPi,
  FeeDataSAveAPi,
  InterAccountDataSAveAPi,
  BalanceTransferDataSAveAPi,
  AdditionalGoldDataSAveAPi,
  finalDataSAveAPi,
  isAllowed
};
