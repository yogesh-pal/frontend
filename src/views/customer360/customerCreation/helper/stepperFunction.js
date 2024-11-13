/* eslint-disable no-unused-vars */
/* eslint-disable no-unreachable */
/* eslint-disable max-len */
/* eslint-disable no-promise-executor-return */
/* eslint-disable camelcase */
import moment from 'moment';
import jwtDecode from 'jwt-decode';
import { cloneDeep, throttle } from 'lodash';

import {
  SERVICEURL,
  PAYMENTSTATUS
} from '../../../../constants';
import {
  NAMEMAPPING,
  ID_PROOF_NAME_LIST,
  ID_PROOF_NAMELIST_WITHOUT_PAN,
  ID_PROOF_LIST,
  AADHAARVERFICATIONMODE,
  BIOMETRICSTATUS,
  BIOMETRICMODELSTATUS,
  VERIFICATIONKEY,
  ADDRESS_PROOF_NAME_LIST,
  ERRORMESSAGE,
  aadhaarMapping
} from './constant';
import { Service } from '../../../../service/index';
import { checkPanValidity, panAadharLinkStatus } from '../../utils';

export const useCreateCustomer = (props) => {
  const {
    customerID,
    setRedirect,
    setAlertShow,
    dispatch,
    resendReducer,
    setLoader,
    bankDetailsReducer,
    setIsLoading,
    fatherOrSpouseReducer,
    customerDetails,
    unmaskedAadhaarNoReducer,
    aadhaarCardTimeStampReducer,
    relationShipManagerDetails,
    customerHelperRef,
    poolingIntervalRef,
    errorMessageHandler,
    CONFIGURATION,
  } = props;

  let count = 0;
  const fibonacci = [1, 1, 2, 3, 5];
  let unmaskedAadhaarNumber = null;
  const IDMapping = {
    IdFront: 'ID Proof Front',
    IdBack: 'ID Proof Back',
    IDProof: 'ID Proof',
  };

  const AddressMapping = {
    AddressBack: 'Address Proof Back',
    AddressFront: 'Address Proof Front',
    AddressProof: 'Address Proof',
  };

  const IDMappingBiometric = {
    Id: 'ID Proof',
  };

  const AddressMappingBiometric = {
    Address: 'Address Proof',
  };

  const customerOccupationHandler = (values, callback, index, setValue) => {
    try {
      const { customer_occupation } = values;
      if (customer_occupation === 'Agriculturist') {
        setValue('psl_category', 'Agriculture');
        setValue('psl_status', 'Yes', { shouldValidate: true });
      } else if (['Homemaker', 'Unemployed', 'Student'].includes(customer_occupation)) {
        setValue('psl_status', 'No', { shouldValidate: true });
      }
    } catch (e) {
      console.log('Error', e);
    }
  };

  const currentTimestamp = () => {
    const currentTime = new Date();
    const uniquiVerificationId = currentTime.getTime() / 1000;

    return uniquiVerificationId;
  };

  const failureIncrementHandler = (mode) => {
    try {
      const failed = customerHelperRef.current.failureDetails[mode];
      customerHelperRef.current.failureDetails[mode] = failed + 1;
    } catch (err) {
      console.log('Err', err);
    }
  };

  const failureCountGetHandler = (mode) => {
    try {
      return customerHelperRef.current.failureDetails[mode];
    } catch (err) {
      console.log('Err', err);
      return 0;
    }
  };

  const updateCurrentTimestamp = (mode, key) => {
    try {
      customerHelperRef.current.verificationTimeStamp[mode][key] = currentTimestamp();
    } catch (e) {
      console.log('Error', e);
    }
  };

  const biometricEnableHandler = async (biometricEnableDetails) => {
    try {
      const { biometric } = CONFIGURATION;
      const { input, updateJsonHandler } = biometricEnableDetails;
      await new Promise((resolve) => setTimeout(resolve, 180000));
      if (
        customerHelperRef.current.enableBiometricReference
        && customerHelperRef.current.ONLINEOTPSEND === 1
        && failureCountGetHandler(AADHAARVERFICATIONMODE.ONLINE) === 0
      ) {
        failureIncrementHandler(AADHAARVERFICATIONMODE.ONLINE);
        setRedirect({
          message: biometric ? 'Request timed out. Bio metric is now enabled for Aadhaar verification' : 'Request timed out. Offline is now enabled for Aadhaar verification',
          isRedirect: true
        });
        updateJsonHandler(input, {
          dynamicKey: biometric ? 'enableBiometric' : 'enableOffline',
          success: true
        });
      }
    } catch (err) {
      console.log('Error', err);
    }
  };

  const exitingDetailsHandler = async (key, value) => {
    try {
      const obj = {
        fc: '1',
        [key]: value
      };
      const { data, status } = await Service.post(SERVICEURL.CUSTOMER.CUSTOMERSEARCHDETAILS, obj);
      if (status === 200) {
        let userDetail = null;
        let notPresentInGoldLoan = null;
        data.data.results.forEach((item) => {
          if (customerID) {
            if (customerID === item?.customer_id?.toString() && !item.exists_in_goldloan) {
              notPresentInGoldLoan = item;
            }
          } else if (item.exists_in_goldloan) {
            userDetail = item;
          }
        });

        if (customerID) {
          if (customerID && !notPresentInGoldLoan) {
            return {
              data: null,
              success: false,
              isError: true,
              message: `Please enter valid MSME Aadhaar Card Number against ${customerID}`
            };
          }
          return {
            data: null,
            success: true,
            isError: false,
            message: 'verified'
          };
        }

        if (userDetail) {
          return {
            data: userDetail,
            success: !userDetail,
            isShow: !!userDetail,
            message: `Details Already Present in goldloan for this customer with customer id ${userDetail?.customer_id}.`,
            source: NAMEMAPPING.GOLDLOAN,
            customer_id: userDetail?.customer_id
          };
        }
        return {
          data: userDetail,
          success: false,
          isShow: true,
          message: 'Details Present in flexcube for this customer.',
          source: NAMEMAPPING.FLEXCUBE,
          customer_id: data?.data?.results[0]?.customer_id
        };
      }
    } catch (e) {
      const tempResponse = e?.response;
      if ('status' in tempResponse) {
        const statusCode = e?.response?.status === 404;
        if (customerID && statusCode) {
          return {
            data: null,
            success: false,
            isError: true,
            message: `Please enter valid MSME Aadhaar Card Number against ${customerID}`
          };
        }
        return {
          data: null,
          success: statusCode,
          isError: !statusCode,
          message: statusCode ? 'verified' : e?.response?.data?.errors?.detail
        };
      }
      return {
        data: null,
        success: false,
        isError: true,
        message: 'Please retry!'
      };
    }
  };

  const existingCheckHandler = async (key, value) => {
    try {
      const {
        success, data, message, isShow, isError, source, customer_id
      } = await exitingDetailsHandler(key, value);
      if (isShow) {
        setRedirect({
          data,
          isRedirect: isShow,
          message,
          source,
          customer_id
        });
      }
      if (isError || message) {
        setAlertShow({
          open: true,
          msg: message,
          alertType: !isError ? 'success' : 'error'
        });
      }
      return { success, disabled: success, source };
    } catch (e) {
      console.log('Error', e);
      return { success: false, disabled: false };
    }
  };

  const otpHandler = async (apiDetails, name) => {
    try {
      if (name === 'CALL') {
        const { data } = await Service.get(`${process.env.REACT_APP_SEND_CALL_OTP}?dest=${apiDetails?.primary_mobile_number}&otplen=4`);
        if (data.status === 1) {
          dispatch(resendReducer('SEND'));
          data.success = true;
          data.disabled = true;
          return data;
        }
        setAlertShow({
          open: true,
          msg: data?.msg,
          alertType: 'error'
        });
        return { success: false, disabled: false };
      }
      if (name === 'WHATSAPP') {
        const { data } = await Service.get(`${process.env.REACT_APP_SEND_SMS_OTP}?dest=${apiDetails?.primary_mobile_number}&otplen=4&type=customer_creation&otp_type=WHATSAPP`);
        if (data.status === true) {
          dispatch(resendReducer('SEND'));
          data.success = true;
          data.disabled = true;
          return data;
        }
        setAlertShow({
          open: true,
          msg: data?.msg,
          alertType: 'error'
        });
        return { success: false, disabled: false };
      }

      const { data } = await Service.get(`${process.env.REACT_APP_SEND_SMS_OTP}?dest=${apiDetails?.primary_mobile_number}&otplen=4&type=customer_creation`);
      if (data.status === 1) {
        dispatch(resendReducer('SEND'));
        data.success = true;
        data.disabled = true;
        return data;
      }
      setAlertShow({
        open: true,
        msg: 'Invalid mobile number.',
        alertType: 'error'
      });
      return { success: false, disabled: false };
    } catch (e) {
      console.log(e);
      setAlertShow({
        open: true,
        msg: 'OTP send API failed. Try again.',
        alertType: 'error'
      });
      return { success: false, disabled: false };
    }
  };

  const otpMobileVerificationHandler = async (apiDetails) => {
    try {
      const { data } = await Service.get(`${process.env.REACT_APP_VERIFY_MOBILE_OTP}?dest=${apiDetails?.primary_mobile_number}&otp=${apiDetails.primaryContactNumberOTP}`);
      if (data?.msg === 'Verified OTP') {
        setAlertShow({
          open: true,
          msg: 'OTP verification successful.',
          alertType: 'success'
        });
        dispatch(resendReducer('VERIFIED'));
        data.success = true;
        return data;
      }
      setAlertShow({
        open: true,
        msg: 'OTP verification failed.',
        alertType: 'error'
      });
      return { success: false };
    } catch (e) {
      console.log(e);
      setAlertShow({
        open: true,
        msg: 'OTP verification API failed. Try again',
        alertType: 'error'
      });
      return { success: false };
    }
  };

  const panVerificationHandler = async (values, callback, bodyDetails, panAddhaarlinkingEnabled) => {
    try {
      setLoader(true);
      const pancardObj = {};
      bodyDetails.forEach((item) => {
        pancardObj.number = values[item];
      });
      if (pancardObj?.number.length !== 10) return;
      const panValidityStatus = await checkPanValidity(values, bodyDetails, setAlertShow);
      if (panAddhaarlinkingEnabled) {
        let aadharNo;
        let panNo;
        if (values?.aadhaar_verification_mode === 'Online') {
          aadharNo = unmaskedAadhaarNumber ?? values.aadharCardOnline;
        } else if (values?.aadhaar_verification_mode === 'Offline') {
          aadharNo = values?.aadharCardOffline;
        } else {
          const aadharRefNumber = customerHelperRef.current.biometricDetails.aadhaar_reference_number;
          const aadhaarReq = {
            reference: aadharRefNumber
          };
          const aadharData = await Service.post(`${SERVICEURL.CUSTOMER.VALIDATE_AADHAR_DECODE}`, aadhaarReq);
          aadharNo = aadharData?.data?.data?.data?.id;
        }

        if (values?.pancardNumberOffline) {
          panNo = values.pancardNumberOffline;
        } else if (values?.pancardNumberOnline) {
          panNo = values.pancardNumberOnline;
        }
        // if (values.first_name) {
        //   fullName = `${values.first_name}`;
        // }
        // if (values.middle_name) {
        //   fullName = `${fullName} ${values.middle_name}`;
        // }
        // if (values.last_name) {
        //   fullName = `${fullName} ${values.last_name}`;
        // }
        console.log('panValidityStatus', panValidityStatus);
        const panAadharLinkObj = {
          pan: panNo,
          aadhar_number: aadharNo,
          name: panValidityStatus?.full_name
        };
        const linkingStatus = await panAadharLinkStatus(panAadharLinkObj, setAlertShow);
        if (linkingStatus.status === 'INVALID') {
          callback(linkingStatus);
          return;
        }
      }
      callback(panValidityStatus);
    } catch (e) {
      console.log(e);
      setAlertShow({
        open: true,
        msg: 'Pancard verification API failed. Try again.',
        alertType: 'error'
      });
      callback({ status: 'INVALID', panCustomerNumber: '' });
    } finally {
      setLoader(false);
    }
  };

  const fuzzyMatch = async (name, matchName) => {
    const data = await Service.get(`${process.env.REACT_APP_FUZZY_LOGIC}?name1=${name}&name2=${matchName}`);
    return data;
  };

  const nameMatchHandler = async (values, fuzzyScore = 70) => {
    try {
      if (!values.beneficiary_name.length || count > 0) return;
      const {
        first_name, middle_name, last_name, beneficiary_name
      } = values;
      let name1 = '';
      if (middle_name) {
        name1 = `${first_name} ${middle_name} ${last_name}`;
      } else {
        name1 = `${first_name} ${last_name}`;
      }
      const { data } = await fuzzyMatch(name1, beneficiary_name);
      dispatch(bankDetailsReducer({
        is_bank_verified: true,
        fuzzy_match_status: data.data
      }));
      count += 1;
      if (data?.data > fuzzyScore) {
        setAlertShow({
          open: true,
          msg: 'Customer name matches with the beneficiary name.',
          alertType: 'success'
        });
        return {
          is_bank_verified: true,
          fuzzy_match_status: data.data
        };
      }
      setAlertShow({
        open: true,
        msg: `Bank Account Holder Name is different from the Customer name. The match score is ${data.data}.`,
        alertType: 'error'
      });
      return {
        is_bank_verified: true,
        fuzzy_match_status: data.data
      };
    } catch (e) {
      setAlertShow({
        open: true,
        msg: 'Fuzzy match API failed. Try again.',
        alertType: 'error'
      });
      return { success: false };
    }
  };

  const handleNomineeValidationHandler = async (values, setError) => {
    try {
      setIsLoading(true);
      const {
        nominee_name, first_name, middle_name, last_name
      } = values;
      const name1 = middle_name ? `${first_name} ${middle_name} ${last_name}` : `${first_name} ${last_name}`;
      const { data } = await fuzzyMatch(nominee_name, name1);
      if (data?.data === 100) {
        setError('nominee_name', { type: 'custom', customMsg: 'Nominee name is same as Customer name.' });
        setIsLoading(false);
        return true;
      }
      setIsLoading(false);
      return false;
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      return true;
    }
  };

  const InitiateBAVApi = async (values) => {
    try {
      const { account_number, ifsc } = values;
      const response = await Service.post(
        process.env.REACT_APP_BAV_INITIATE,
        { ifsc, account_number, customer_id: customerHelperRef.current?.customer_id }
      );
      if (response.status === 200) {
        customerHelperRef.current.isBankAccountDuplicate = false;
        const { data } = response;
        if (data?.data?.request_id) {
          return data.data.request_id;
        }
      }
      return null;
    } catch (error) {
      console.log(error);
      if (error?.response?.status === 409) {
        setAlertShow({
          open: true,
          msg: error?.response?.data?.errors,
          alertType: 'error'
        });
        customerHelperRef.current.isBankAccountDuplicate = true;
        return 'DUPLICATE_BANK_ACCOUNT';
      }
      customerHelperRef.current.isBankAccountDuplicate = false;
      return null;
    }
  };

  const statusApi = async (retryCount, id) => {
    try {
      const maxRetries = 5;
      if (retryCount < maxRetries) {
        const interval = fibonacci[retryCount] * 1000;
        await new Promise((resolve) => setTimeout(resolve, interval));
        let url = `${process.env.REACT_APP_BAV_STATUS}?pennyless_status_id=${id}`;
        url = customerHelperRef.current?.customer_id ? `${url}&customer_id=${customerHelperRef.current?.customer_id}` : url;
        const response = await Service.get(url);
        if (response.status === 200 && (response?.data?.data?.status === 'FAILED' || response?.data?.data?.status === 'SUCCESS')) {
          const res = {
            data: {
              verified: response?.data?.data?.status !== 'FAILED',
              beneficiary_name_with_bank: response?.data?.data?.bank_details?.beneficiary_name
            }
          };
          return res;
        }
        return statusApi(retryCount + 1, id);
      }
      return null;
    } catch (error) {
      if (error?.response?.status === 409) {
        setAlertShow({
          open: true,
          msg: error?.response?.data?.errors,
          alertType: 'error'
        });
        customerHelperRef.current.isBankAccountDuplicate = true;
        return { success: false };
      }
      return statusApi(retryCount + 1, id);
    }
  };

  const fetchDjioApi = async (values) => {
    try {
      const { account_number, ifsc } = values;
      const { data } = await Service.post(
        process.env.REACT_APP_BANK_ACCOUNT,
        { ifsc, account_number, customer_id: customerHelperRef.current?.customer_id }
      );
      customerHelperRef.current.isBankAccountDuplicate = false;
      if (data?.data?.verified === true) {
        return data;
      }
      return null;
    } catch (error) {
      console.log(error);
      if (error?.response?.status === 409) {
        setAlertShow({
          open: true,
          msg: error?.response?.data?.errors,
          alertType: 'error'
        });
        customerHelperRef.current.isBankAccountDuplicate = true;
      }
      return null;
    }
  };

  const handleResponse = async (values, data, source) => {
    if (data?.data?.verified === true) {
      const nameMatch = {
        beneficiary_name: data?.data?.beneficiary_name_with_bank.trim(),
        ...values
      };
      customerHelperRef.current.bankVerificationMode = source;
      count = 0;
      const nameMatchResult = await nameMatchHandler(nameMatch);
      // dispatch(bankDetailsReducer({
      //   is_bank_verified: true
      // }));
      data.data.success = true;
      customerHelperRef.current.isBankAccountDuplicate = false;
      return {
        ...data.data,
        beneficiary_name_with_bank: data?.data?.beneficiary_name_with_bank.trim(),
        nameMatchResult
      };
    }
    setAlertShow({
      open: true,
      msg: 'Account verification failed. Request has been sent to Checker for Verification of Account details.',
      alertType: 'error'
    });
    customerHelperRef.current.bankVerificationMode = source;
    dispatch(bankDetailsReducer({
      is_bank_verified: false,
    }));
    return { success: false };
  };

  const bankAccountVerificationHandler = async (values) => {
    try {
      const { ifsc } = values;
      setLoader(true);
      if (ifsc?.length !== 11) {
        setAlertShow({
          open: true,
          msg: 'Please enter correct IFSC code before verifying the bank account number.',
          alertType: 'error'
        });
        return { success: false, validation: true };
      }

      const id = await InitiateBAVApi(values);
      let resultData;
      if (id === 'DUPLICATE_BANK_ACCOUNT') {
        resultData = { success: false };
      } else if (id === null) {
        const masterData = await fetchDjioApi(values);
        resultData = await handleResponse(values, masterData, 'DIGIO');
      } else {
        const statusData = await statusApi(0, id);
        if (statusData?.success === false) {
          resultData = statusData;
        } else if (statusData) {
          resultData = await handleResponse(values, statusData, 'SETU');
        } else {
          const masterData = await fetchDjioApi(values);
          resultData = await handleResponse(values, masterData, 'DIGIO');
        }
      }

      // Check to handle the case :- Bank Verification successful but Fuzzy match failed
      if (resultData.hasOwnProperty('nameMatchResult') && resultData?.nameMatchResult?.fuzzy_match_status <= 70) return { success: false };

      if (!resultData) {
        setAlertShow({
          open: true,
          msg: 'Bank account verification failed after multiple attempts. Please try again later.',
          alertType: 'error'
        });
        dispatch(bankDetailsReducer({
          is_bank_verified: false
        }));
      }
      return resultData;
    } catch (e) {
      console.error(e);
      setAlertShow({
        open: true,
        msg: 'Bank account verification API failed. Try again.',
        alertType: 'error'
      });
      dispatch(bankDetailsReducer({
        is_bank_verified: false
      }));
      return { success: false };
    } finally {
      setLoader(false);
    }
  };

  const pincodeHandler = async (obj) => {
    try {
      const { data } = await Service.post(process.env.REACT_APP_PINCODE, obj);
      return {
        success: true,
        data: data?.data
      };
    } catch (err) {
      console.log('Error', err);
      return {
        success: false,
        data: {
          city: '',
          state: ''
        }
      };
    }
  };

  const pincodeVerificationHandler = async (values, callback, bodyDetails) => {
    try {
      const pincodeObj = {};
      bodyDetails.forEach((item) => {
        pincodeObj.pincode = values[item];
      });
      if (pincodeObj?.pincode.length === 6) {
        setLoader(true);
        const { data } = await Service.post(process.env.REACT_APP_PINCODE, pincodeObj);
        if (data?.data) {
          callback(data.data);
        } else {
          setAlertShow({
            open: true,
            msg: 'Invalid pincode.',
            alertType: 'error'
          });
        }
        setLoader(false);
      }
    } catch (e) {
      setLoader(false);
      console.log(e);
      setAlertShow({
        open: true,
        msg: 'Pincode API failed. Try again.',
        alertType: 'error'
      });
      return { success: false };
    }
  };

  const ifscDetailsHandler = async (values) => {
    try {
      const ifscObj = {
        ifsc: values.ifsc
      };

      if (ifscObj?.ifsc.length === 11) {
        const { data, status } = await Service.post(process.env.REACT_APP_IFSC, ifscObj);
        if (status === 200 && data?.data) {
          count = 0;
          data.data.success = true;
          return { ...data.data, bank: data.data.bank.trim(), branch: data.data.branch.trim() };
        }

        setAlertShow({
          open: true,
          msg: 'The bank name or branch name is not available in the IFSC database for the entered IFSC Code.',
          alertType: 'error'
        });
        return { success: false };
      }
    } catch (e) {
      setAlertShow({
        open: true,
        msg: 'IFSC API failed. Try again.',
        alertType: 'error'
      });
      console.log('Error', e);
      return { success: false };
    }
  };

  const aadhaarCardOtpHandler = async (value) => {
    // return { success: true };
    const { biometric } = CONFIGURATION;
    try {
      const { aadharCardOnline } = value;

      // if (failureCountGetHandler(AADHAARVERFICATIONMODE.ONLINE) >= 3) {
      //   setAlertShow({
      //     open: true,
      //     msg: 'Aadhaar validation max attempt reached.',
      //     alertType: 'error'
      //   });
      //   return;
      // }
      updateCurrentTimestamp(AADHAARVERFICATIONMODE.ONLINE, VERIFICATIONKEY.VERIFICATIONSTART);
      if (!customerHelperRef.current.isRekyc) {
        const res = await existingCheckHandler('aadhaar_number', aadharCardOnline);
        console.log('fdsafdsdfsa', res);
        if (!res?.success) return;
      }
      const { status, data } = await Service.post(process.env.REACT_APP_VALIDATE_AADHAAR_DOCUMENT, {
        number: aadharCardOnline,
        caseId: `IGL_${moment().format('YYYY-MM')}`,
        type: 'aadhar'
      });
      if (status === 200 && data?.data?.statusCode === 101) {
        customerHelperRef.current.enableBiometricReference = true;
        customerHelperRef.current.ONLINEOTPSEND += 1;
        setAlertShow({
          open: true,
          msg: data.data.result.message,
          alertType: 'success'
        });
        dispatch(resendReducer('SEND'));
        data.data.success = true;
        data.data.disabled = true;
        return data.data;
      }

      if (status === 200 && data?.data?.statusCode === 104) {
        setAlertShow({
          open: true,
          msg: 'OTP already send to the registered mobile number.',
          alertType: 'success'
        });
        dispatch(resendReducer('SEND'));
        data.data.success = true;
        data.data.disabled = true;
        return data.data;
      }

      setAlertShow({
        open: true,
        msg: 'Invalid Aadhaar Card Number.',
        alertType: 'error'
      });

      failureIncrementHandler(AADHAARVERFICATIONMODE.ONLINE);
      if (failureCountGetHandler(AADHAARVERFICATIONMODE.ONLINE) === 1) {
        if (biometric) {
          customerHelperRef.current.enableBiometricReference = false;
        }
        setRedirect({
          message: biometric ? ERRORMESSAGE.ONLINEBIOMETRICENABLE : ERRORMESSAGE.ONLINEOFFLINEENABLE,
          isRedirect: true
        });
      }
      return { success: false, disabled: true };
    } catch (e) {
      console.log('Error', e);
      if (failureCountGetHandler(AADHAARVERFICATIONMODE.ONLINE) === 1) {
        if (biometric) {
          customerHelperRef.current.enableBiometricReference = false;
        }
        setRedirect({
          message: biometric ? ERRORMESSAGE.ONLINEBIOMETRICENABLE : ERRORMESSAGE.ONLINEOFFLINEENABLE,
          isRedirect: true
        });
      }
      setAlertShow({
        open: true,
        msg: 'Aadhaar OTP API failed. Try again.',
        alertType: 'error'
      });
      failureIncrementHandler(AADHAARVERFICATIONMODE.ONLINE);

      return { success: false, disabled: true };
    }
  };

  const aadhaarOTPVerificationHandler = async (values) => {
    // const ct = new Date();
    // const ui = ct.getTime() / 1000;
    // dispatch(unmaskedAadhaarNoReducer('754545451234'));
    // dispatch(aadhaarCardTimeStampReducer(ui));
    // dispatch(resendReducer('VERIFIED'));
    // return {
    //   success: true,
    //   first_name: 'TEST1',
    //   middle_name: '',
    //   last_name: 'SINGH',
    //   father_or_spouse_name: 'TEST SPOUSE',
    //   dob: '1999-01-01',
    //   address_1: 'TEST ADDRESS 1',
    //   address_2: 'TEST ADDRESS 2',
    //   pincode: '110067',
    //   // city: dataFromAadhaar?.address?.splitAddress?.district?.trim() ?? '',
    //   // state: dataFromAadhaar?.address?.splitAddress?.state?.trim() ?? '',
    //   city: 'Delhi',
    //   state: 'FDSA',
    //   aadharCardOnline: 'XXXXXX1234',
    // };
    const { biometric } = CONFIGURATION;
    try {
      // if (failureCountGetHandler(AADHAARVERFICATIONMODE.ONLINE) >= 3) {
      //   setAlertShow({
      //     open: true,
      //     msg: 'Aadhaar validation max attempt reached.',
      //     alertType: 'error'
      //   });
      //   return;
      // }
      const { enterAadhaarOTP, aadharCardOnline } = values;

      const { data } = await Service.post(process.env.REACT_APP_VALIDATE_AADHAAR_OTP, {
        number: aadharCardOnline,
        caseId: `IGL_${moment().format('YYYY-MM')}`,
        type: 'aadhar',
        otp: enterAadhaarOTP
      });
      const name = data?.data?.result?.dataFromAadhaar?.name.split(' ');
      const fullName = (name.length && name.filter((item) => item.length > 0));
      const dataFromAadhaar = data?.data?.result?.dataFromAadhaar ?? 'NA';
      const dataFromAadhaarAddress = data?.data?.result?.dataFromAadhaar?.address?.splitAddress;
      let address1 = null;
      if (dataFromAadhaarAddress?.houseNumber && dataFromAadhaarAddress?.houseNumber.length) {
        address1 = dataFromAadhaarAddress?.houseNumber;
      }
      if (dataFromAadhaarAddress?.street && dataFromAadhaarAddress?.street.length) {
        address1 = `${address1 || ''} ${dataFromAadhaarAddress?.street}`;
      }
      let address2 = null;
      if (dataFromAadhaarAddress?.subdistrict && dataFromAadhaarAddress?.subdistrict.length) {
        address2 = dataFromAadhaarAddress?.subdistrict;
      }
      if (dataFromAadhaarAddress?.district && dataFromAadhaarAddress?.district.length) {
        address2 = `${address2 || ''} ${dataFromAadhaarAddress?.district}`;
      }
      if (dataFromAadhaarAddress?.vtcName && dataFromAadhaarAddress?.vtcName.length) {
        address2 = `${address2 || ''} ${dataFromAadhaarAddress?.vtcName}`;
      }
      if (dataFromAadhaarAddress?.location && dataFromAadhaarAddress?.location.length) {
        address2 = `${address2 || ''} ${dataFromAadhaarAddress?.location}`;
      }
      if (dataFromAadhaarAddress?.postOffice && dataFromAadhaarAddress?.postOffice.length) {
        address2 = `${address2 || ''} ${dataFromAadhaarAddress?.postOffice}`;
      }

      const key = dataFromAadhaar.hasOwnProperty('fatherName') ? 'fatherName' : 'spouseName';
      dispatch(fatherOrSpouseReducer(key));

      const tempAadhaarCard = aadharCardOnline.slice(-4);

      const pincode = dataFromAadhaar?.address?.splitAddress?.pincode?.trim();

      const response = await pincodeHandler({ pincode });
      const { city, state } = response.data;

      const newObj = {
        first_name: fullName.length ? fullName[0]?.trim() : '',
        middle_name: fullName.length >= 3 ? fullName.slice(1, fullName.length - 1).join(' ') : '',
        last_name: fullName.length >= 2 ? fullName[fullName.length - 1]?.trim() : '',
        father_or_spouse_name: dataFromAadhaar?.fatherName?.trim() ?? '',
        dob: dataFromAadhaar?.dob,
        address_1: address1 && address1.length ? address1.trim() : '',
        address_2: address2 && address2.length ? address2.trim() : '',
        pincode: city === '' || state === '' ? '' : dataFromAadhaar?.address?.splitAddress?.pincode?.trim(),
        // city: dataFromAadhaar?.address?.splitAddress?.district?.trim() ?? '',
        // state: dataFromAadhaar?.address?.splitAddress?.state?.trim() ?? '',
        city: city === '' ? ' ' : city,
        state: state === '' ? ' ' : state,
        aadharCardOnline: tempAadhaarCard.padStart(12, 'X')?.trim() ?? '',
      };

      if (customerDetails && Object.keys(customerDetails).length) {
        newObj.first_name = customerDetails.first_name;
        newObj.middle_name = customerDetails.middle_name;
        newObj.last_name = customerDetails.last_name;
        newObj.father_or_spouse_name = customerDetails.father_or_spouse_name;
        newObj.dob = customerDetails.dob;
        newObj.address_1 = customerDetails.address_1;
        newObj.address_2 = customerDetails.address_2;
        newObj.pincode = customerDetails.pincode;
        newObj.city = customerDetails.city;
        newObj.state = customerDetails.state;
        newObj.pincodeOnline = customerDetails.pin_code;
        newObj.pincode = customerDetails.pin_code;
        newObj.aadharCardOnline = tempAadhaarCard.padStart(12, 'X')?.trim() ?? '';
      }
      unmaskedAadhaarNumber = aadharCardOnline;
      if (newObj) {
        const currentTime = new Date();
        const uniquiId = currentTime.getTime() / 1000;
        dispatch(unmaskedAadhaarNoReducer(aadharCardOnline));
        dispatch(aadhaarCardTimeStampReducer(uniquiId));
        dispatch(resendReducer('VERIFIED'));
        updateCurrentTimestamp(AADHAARVERFICATIONMODE.ONLINE, VERIFICATIONKEY.VERIFICATIONEND);
        newObj.success = true;
        customerHelperRef.current.enableBiometricReference = false;
        return newObj;
      }
      setAlertShow({
        open: true,
        msg: 'Invalid aadhaar OTP.',
        alertType: 'error'
      });
      failureIncrementHandler(AADHAARVERFICATIONMODE.ONLINE);
      if (failureCountGetHandler(AADHAARVERFICATIONMODE.ONLINE) === 1) {
        if (biometric) {
          customerHelperRef.current.enableBiometricReference = false;
        }
        setRedirect({
          message: biometric ? ERRORMESSAGE.ONLINEBIOMETRICENABLE : ERRORMESSAGE.ONLINEOFFLINEENABLE,
          isRedirect: true
        });
      }

      newObj.success = false;
      return newObj;
    } catch (e) {
      console.log(e);
      setAlertShow({
        open: true,
        msg: 'Aadhaar OTP Verification API failed. Try again.',
        alertType: 'error'
      });
      failureIncrementHandler(AADHAARVERFICATIONMODE.ONLINE);
      if (failureCountGetHandler(AADHAARVERFICATIONMODE.ONLINE) === 1) {
        if (biometric) {
          customerHelperRef.current.enableBiometricReference = false;
        }
        setRedirect({
          message: biometric ? ERRORMESSAGE.ONLINEBIOMETRICENABLE : ERRORMESSAGE.ONLINEOFFLINEENABLE,
          isRedirect: true
        });
      }
      return { success: false };
    }
  };

  const rekycAadhaarOTPVerificationHandler = async (values, additionalDetals) => {
    const { biometric } = CONFIGURATION;
    const { input, updateJsonHandler } = additionalDetals;
    // console.log('fdsafdasf', additionalDetals, input, updateJsonHandler);
    // updateJsonHandler(input, {
    //   dynamicKey: 'rekyc_addhar',
    //   success: true
    // });
    // return {
    //   success: true,
    //   first_name: 'fdsafdsa',
    //   middle_name: 'f dsa',
    //   last_name: 'fdas',
    //   father_or_spouse_name: 'fdsafds',
    //   dob: 'fdasfdsa',
    //   address_1: 'fdasf',
    //   address_2: 'fdsaf',
    //   pincode: '201206',
    //   city: 'fdsaf',
    //   state: 'fdsaf',
    //   aadharCardOnline: 'fdsafads',
    // };
    try {
      const { enterAadhaarOTP, aadharCardOnline } = values;

      const { data } = await Service.post(process.env.REACT_APP_VALIDATE_AADHAAR_OTP, {
        number: aadharCardOnline,
        caseId: `IGL_${moment().format('YYYY-MM')}`,
        type: 'aadhar',
        otp: enterAadhaarOTP
      });
      const name = data?.data?.result?.dataFromAadhaar?.name.split(' ');
      const fullName = (name.length && name.filter((item) => item.length > 0));
      const dataFromAadhaar = data?.data?.result?.dataFromAadhaar ?? 'NA';
      const dataFromAadhaarAddress = data?.data?.result?.dataFromAadhaar?.address?.splitAddress;
      let address1 = null;
      if (dataFromAadhaarAddress?.houseNumber && dataFromAadhaarAddress?.houseNumber.length) {
        address1 = dataFromAadhaarAddress?.houseNumber;
      }
      if (dataFromAadhaarAddress?.street && dataFromAadhaarAddress?.street.length) {
        address1 = `${address1 || ''} ${dataFromAadhaarAddress?.street}`;
      }
      let address2 = null;
      if (dataFromAadhaarAddress?.subdistrict && dataFromAadhaarAddress?.subdistrict.length) {
        address2 = dataFromAadhaarAddress?.subdistrict;
      }
      if (dataFromAadhaarAddress?.district && dataFromAadhaarAddress?.district.length) {
        address2 = `${address2 || ''} ${dataFromAadhaarAddress?.district}`;
      }
      if (dataFromAadhaarAddress?.vtcName && dataFromAadhaarAddress?.vtcName.length) {
        address2 = `${address2 || ''} ${dataFromAadhaarAddress?.vtcName}`;
      }
      if (dataFromAadhaarAddress?.location && dataFromAadhaarAddress?.location.length) {
        address2 = `${address2 || ''} ${dataFromAadhaarAddress?.location}`;
      }
      if (dataFromAadhaarAddress?.postOffice && dataFromAadhaarAddress?.postOffice.length) {
        address2 = `${address2 || ''} ${dataFromAadhaarAddress?.postOffice}`;
      }

      const key = dataFromAadhaar.hasOwnProperty('fatherName') ? 'fatherName' : 'spouseName';
      dispatch(fatherOrSpouseReducer(key));

      const tempAadhaarCard = aadharCardOnline.slice(-4);

      const pincode = dataFromAadhaar?.address?.splitAddress?.pincode?.trim();

      const response = await pincodeHandler({ pincode });
      const { city, state } = response.data;

      const newObj = {
        first_name: fullName.length ? fullName[0]?.trim() : '',
        middle_name: fullName.length >= 3 ? fullName.slice(1, fullName.length - 1).join(' ') : '',
        last_name: fullName.length >= 2 ? fullName[fullName.length - 1]?.trim() : '',
        father_or_spouse_name: dataFromAadhaar?.fatherName?.trim() ?? '',
        dob: dataFromAadhaar?.dob,
        address_1: address1 && address1.length ? address1.trim() : customerHelperRef.current.addressDetails.address1,
        address_2: address2 && address2.length ? address2.trim() : customerHelperRef.current.addressDetails.address2,
        pincode: city === '' || state === '' ? '' : dataFromAadhaar?.address?.splitAddress?.pincode?.trim(),
        city: city === '' ? ' ' : city,
        state: state === '' ? ' ' : state,
        aadharCardOnline: tempAadhaarCard.padStart(12, 'X')?.trim() ?? '',
      };

      if (customerDetails && Object.keys(customerDetails).length) {
        newObj.first_name = customerDetails.first_name;
        newObj.middle_name = customerDetails.middle_name;
        newObj.last_name = customerDetails.last_name;
        newObj.father_or_spouse_name = customerDetails.father_or_spouse_name;
        newObj.dob = customerDetails.dob;
        newObj.address_1 = customerDetails.address_1;
        newObj.address_2 = customerDetails.address_2;
        newObj.pincode = customerDetails.pincode;
        newObj.city = customerDetails.city;
        newObj.state = customerDetails.state;
        newObj.pincodeOnline = customerDetails.pin_code;
        newObj.pincode = customerDetails.pin_code;
        newObj.aadharCardOnline = tempAadhaarCard.padStart(12, 'X')?.trim() ?? '';
      }
      unmaskedAadhaarNumber = aadharCardOnline;
      if (newObj) {
        const currentTime = new Date();
        const uniquiId = currentTime.getTime() / 1000;
        dispatch(unmaskedAadhaarNoReducer(aadharCardOnline));
        dispatch(aadhaarCardTimeStampReducer(uniquiId));
        dispatch(resendReducer('VERIFIED'));
        updateCurrentTimestamp(AADHAARVERFICATIONMODE.ONLINE, VERIFICATIONKEY.VERIFICATIONEND);
        newObj.success = true;
        customerHelperRef.current.enableBiometricReference = false;
        updateJsonHandler(input, {
          dynamicKey: 'rekyc_addhar',
          success: true
        });
        return newObj;
      }
      setAlertShow({
        open: true,
        msg: 'Invalid aadhaar OTP.',
        alertType: 'error'
      });
      failureIncrementHandler(AADHAARVERFICATIONMODE.ONLINE);
      if (failureCountGetHandler(AADHAARVERFICATIONMODE.ONLINE) === 1) {
        if (biometric) {
          customerHelperRef.current.enableBiometricReference = false;
        }
        setRedirect({
          message: biometric ? ERRORMESSAGE.ONLINEBIOMETRICENABLE : ERRORMESSAGE.ONLINEOFFLINEENABLE,
          isRedirect: true
        });
      }

      newObj.success = false;
      return newObj;
    } catch (e) {
      console.log(e);
      setAlertShow({
        open: true,
        msg: 'Aadhaar OTP Verification API failed. Try again.',
        alertType: 'error'
      });
      failureIncrementHandler(AADHAARVERFICATIONMODE.ONLINE);
      if (failureCountGetHandler(AADHAARVERFICATIONMODE.ONLINE) === 1) {
        if (biometric) {
          customerHelperRef.current.enableBiometricReference = false;
        }
        setRedirect({
          message: biometric ? ERRORMESSAGE.ONLINEBIOMETRICENABLE : ERRORMESSAGE.ONLINEOFFLINEENABLE,
          isRedirect: true
        });
      }
      return { success: false };
    }
  };

  const relationShipManagerCodeHandler = (values, callback) => {
    try {
      const rmInfo = relationShipManagerDetails.filter((ele) => ele.rm_name === values.rm_name);
      if (rmInfo.length) {
        callback(rmInfo[0]?.rm_code);
      } else {
        callback('');
      }
    } catch (e) {
      console.log('Error', e);
    }
  };

  const relationShipManagerMobileHandler = (values, callback) => {
    try {
      const rmInfo = relationShipManagerDetails.filter((ele) => ele.rm_name === values.rm_name);
      if (rmInfo.length) {
        callback(rmInfo[0]?.rm_mobile);
      } else {
        callback('');
      }
    } catch (e) {
      console.log('Error', e);
    }
  };

  const annualIncomeHandler = (values, callback, index, setValue, name) => {
    try {
      // const annual = name === 'annual_income_self_salaried' ? values.annual_income_self_salaried : values.annual_income_salaried;
      const annual = values[name];
      if (!values.customer_occupation || !annual) {
        return;
      }
      const risk = {
        'Less than 1 Lac': {
          'Self Employed': 1,
          Salaried: 1
        },
        '1 Lac to 5 Lacs': {
          'Self Employed': 1,
          Salaried: 1
        },
        '5 Lacs to 10 Lacs': {
          'Self Employed': 1,
          Salaried: 1
        },
        '10 Lacs to 25 Lacs': {
          'Self Employed': 1,
          Salaried: 1
        },
        '25 Lacs to 1 Crore': {
          'Self Employed': 2,
          Salaried: 1
        },
        'More than 1 Crore': {
          'Self Employed': 3,
          Salaried: 1
        },
        'More than 25 Lacs': {
          Salaried: 1
        }
      };

      const riskValue = {
        1: 'Low',
        2: 'Medium',
        3: 'High'
      };
      // const riskCal = risk[name === 'annual_income_self_salaried' ? values.annual_income_self_salaried : values.annual_income_salaried][values.customer_occupation];
      const riskCal = 1;
      setValue('risk_rating', riskValue[riskCal]);
    } catch (e) {
      console.log('Error', e);
    }
  };

  const resetField = (fields, value, getValues, setValue) => {
    try {
      fields.forEach((field) => {
        const matchedKeys = (
          Object.keys(getValues())).filter((ele) => ele.includes(field.children[0].to));
        matchedKeys.forEach((ele) => setValue(ele, null));
        field.children.forEach((child) => {
          setValue(child.to, null);
        });
      });
    } catch (e) {
      console.log('Error', e);
    }
  };

  const aadhaarPreFilledHanlder = (preFilledDetails) => {
    try {
      const {
        fields,
        value,
        getValues,
        setValue,
        name
      } = preFilledDetails;
      resetField(fields, value, getValues, setValue);
      const tempValue = getValues();
      console.log('tempValue', tempValue);
      if (name === 'id_proof_name' && tempValue?.ocr?.aadhaarFront && tempValue?.ocr?.aadhaarBack) {
        setValue('id_proof_url', {
          [IDMapping.IdFront]: tempValue?.ocr?.aadhaarFront,
          [IDMapping.IdBack]: tempValue?.ocr?.aadhaarBack
        }, { shouldValidate: true });
        setValue('id_proof_number', tempValue?.aadharCardOffline, { shouldValidate: true });
      } else if (name === 'address_proof_name' && tempValue?.ocr?.aadhaarFront && tempValue?.ocr?.aadhaarBack) {
        setValue('address_proof_url', {
          [AddressMapping.AddressFront]: tempValue?.ocr?.aadhaarFront,
          [AddressMapping.AddressBack]: tempValue?.ocr?.aadhaarBack
        }, { shouldValidate: true });
        setValue('address_proof_number', tempValue?.aadharCardOffline, { shouldValidate: true });
      }
    } catch (err) {
      console.log('Error', err);
    }
  };

  const preFillIfExists = (preFilledDetails) => {
    const {
      fields,
      value,
      getValues,
      setValue,
      additionalKey,
      name
    } = preFilledDetails;

    const {
      aadhaar_verification_mode,
      address_proof_name,
      id_proof_name,
      address_proof_same_id_proof
    } = getValues();
    const { updateJsonHandler, input } = additionalKey;

    const adhaarMaskingIndex = input?.maskingHandler?.updateFieldDetails.findIndex((item) => item.name === 'id_proof_url' && item.key === 'enableMasking');

    const disableAddressIndex = input?.maskingHandler?.updateFieldDetails.findIndex((item) => item.name === 'address_proof_number' && item.key === 'disabled');

    if (adhaarMaskingIndex >= 0) {
      if ([address_proof_name, id_proof_name].includes(ID_PROOF_LIST.AADHAAR)) {
        input.maskingHandler.updateFieldDetails[adhaarMaskingIndex].value = true;
      } else {
        input.maskingHandler.updateFieldDetails[adhaarMaskingIndex].value = false;
      }
    }

    if (disableAddressIndex >= 0 && (getValues('aadhaar_verification_mode') === 'Online' || getValues('aadhaar_verification_mode') === 'Offline') && getValues('address_proof_name') === ID_PROOF_LIST.AADHAAR) {
      input.maskingHandler.updateFieldDetails[disableAddressIndex].value = true;
    } else {
      setValue('address_proof_number', '');
      input.maskingHandler.updateFieldDetails[disableAddressIndex].value = false;
    }

    if (name === 'address_proof_name') {
      if (value !== 'Aadhaar Card') {
        updateJsonHandler(input, { success: true, dynamicKey: 'disablemaskingHandler' });
      } else {
        updateJsonHandler(input, { success: true, dynamicKey: 'maskingHandler' });
      }
      if (value === 'Aadhaar Card' && aadhaar_verification_mode === AADHAARVERFICATIONMODE.OFFLINE) {
        aadhaarPreFilledHanlder(preFilledDetails);
      }
      return;
    }
    if (name === 'id_proof_name') {
      const addressTemp = cloneDeep(ADDRESS_PROOF_NAME_LIST);
      const indexAddress = input?.maskingHandler?.updateFieldDetails.findIndex((item) => item.name === 'address_proof_name' && item.key === 'option');
      input.maskingHandler.updateFieldDetails[indexAddress].value = addressTemp;
    }

    updateJsonHandler(input, { success: true, dynamicKey: 'maskingHandler' });

    if (value === 'Aadhaar Card' && aadhaar_verification_mode === AADHAARVERFICATIONMODE.OFFLINE) {
      aadhaarPreFilledHanlder(preFilledDetails);
      return;
    }
    fields.forEach((field) => {
      const formValues = getValues();
      if (getValues(field.parent) === value) {
        field.children.forEach((child) => {
          const matchedKeys = (Object.keys(getValues())).filter((ele) => ele.includes(child.from));

          (Object.keys(getValues())).forEach(
            (ele) => ele.includes(child.to) && setValue(ele, null)
          );
          matchedKeys.forEach((ele, index) => {
            const tempValue = getValues(ele);
            if (ele.includes('id_proof_url') || ele.includes('address_proof_url')) {
              if (index) {
                setValue(`${child.to}_${index}`, tempValue, { shouldValidate: true });
              } else {
                setValue(child.to, tempValue, { shouldValidate: true });
              }
            } else {
              setValue(child.to, tempValue);
            }
          });
        });
      } else {
        field.children.forEach((child) => {
          setValue(child.to, '');
        });
        const matchedKeys = (Object.keys(getValues())).filter(
          (ele) => ele.includes(field.children[0].to)
        );
        matchedKeys.forEach((ele) => {
          setValue(ele, '');
        });
        if (formValues?.id_proof_name === ID_PROOF_LIST.PAN && formValues?.enter_pan_details === 'Yes' && formValues?.pancardNumberOnline) {
          setValue('id_proof_number', formValues?.pancardNumberOnline);
        }
      }
    });
  };

  const handleDynamicKYCValidation = async (values, setError) => {
    let response = false;
    const {
      pan_customer_name,
      first_name,
      middle_name,
      last_name,
      enter_pan_details
    } = values;

    if (pan_customer_name && enter_pan_details === 'Yes') {
      let aadhaarName = first_name;

      if (middle_name) {
        aadhaarName += ` ${middle_name} ${last_name}`;
      } else {
        aadhaarName += ` ${last_name}`;
      }
      const { data } = await fuzzyMatch(aadhaarName, pan_customer_name);

      if (data.data < 100) {
        setRedirect({
          message: 'Mismatch in name provided on Aadhaar ID and PAN ID',
          isRedirect: true
        });
      }
    }

    if (moment().diff(moment(values.dob), 'years') > 80) {
      setError('dob', { type: 'custom', customMsg: 'Customer\'s age must be less than 80 years' });
      response = true;
    }
    if (moment().diff(moment(values.dob), 'years') < 18) {
      setError('dob', { type: 'custom', customMsg: 'Customer\'s age must be greater than or equal to 18 years' });
      response = true;
    }

    if (values.id_proof_osv_done !== 'Yes') {
      setError('id_proof_osv_done', { type: 'custom', customMsg: 'OSV is mandatory' });
      response = true;
    }

    if (values.address_proof_osv_done !== 'Yes') {
      setError('address_proof_osv_done', { type: 'custom', customMsg: 'OSV is mandatory' });
      response = true;
    }

    if (values?.aadhaar_verification_mode === 'Offline' && values.aadhaar_osv_done === 'No') {
      setError('aadhaar_osv_done', { type: 'custom', customMsg: 'OSV is mandatory' });
      response = true;
    }

    if (values?.aadhaar_verification_mode === 'Offline') {
      if (!values?.ocr?.hasOwnProperty('aadhaarFront') || !values?.ocr?.hasOwnProperty('aadhaarBack')) {
        setError('ocr', { type: 'custom', customMsg: 'Please upload both front and back for aadhaar' });
        response = true;
      }
    }
    if (values?.aadhaar_verification_mode === 'Online' || values?.aadhaar_verification_mode === 'Offline') {
      if (!values?.id_proof_url.hasOwnProperty(IDMapping.IdFront) || !values?.id_proof_url.hasOwnProperty(IDMapping.IdBack)) {
        setError('id_proof_url', { type: 'custom', customMsg: 'Please upload both front and back for ID Proof' });
        response = true;
        if (customerHelperRef.current.isRekyc && values?.id_proof_url.hasOwnProperty(IDMapping.IDProof)) {
          setError('id_proof_url', '');
          response = false;
        }
      }
      if (!values?.address_proof_url.hasOwnProperty(AddressMapping.AddressFront) || !values?.address_proof_url.hasOwnProperty(AddressMapping.AddressBack)) {
        setError('address_proof_url', { type: 'custom', customMsg: 'Please upload both front and back for ID Proof' });
        response = true;
        if (customerHelperRef.current.isRekyc && values?.id_proof_url.hasOwnProperty(AddressMapping.AddressProof)) {
          setError('address_proof_url', '');
          response = false;
        }
      }
    }

    if (values?.aadhaar_verification_mode === 'Biometric') {
      if (!values?.id_proof_url.hasOwnProperty(IDMappingBiometric.Id)) {
        setError('id_proof_url', { type: 'custom', customMsg: 'Please upload ID Proof document' });
        response = true;
      }
      if (values?.address_proof_same_id_proof === 'Yes') {
        if (!values?.address_proof_url.hasOwnProperty(AddressMappingBiometric.Address)) {
          setError('address_proof_url', { type: 'custom', customMsg: 'Please upload Address Proof document' });
          response = true;
        }
      }
      if (values?.address_proof_same_id_proof === 'No') {
        if (!values?.address_proof_url.hasOwnProperty(AddressMapping.AddressFront) || !values?.address_proof_url.hasOwnProperty(AddressMapping.AddressBack)) {
          setError('address_proof_url', { type: 'custom', customMsg: 'Please upload both front and back for Address Proof' });
          response = true;
        }
      }
    }
    return response;
  };

  const aadhaarVerifyHandler = async (value) => {
    try {
      const { source, success } = await existingCheckHandler('aadhaar_number', value?.aadharCardOffline);
      updateCurrentTimestamp(AADHAARVERFICATIONMODE.OFFLINE, VERIFICATIONKEY.VERIFICATIONSTART);

      console.log('suucecc details', success);
      if (!success) return;
      const newObj = {
        success,
        disabled: success
      };

      if (customerID && customerDetails && source !== NAMEMAPPING.GOLDLOAN) {
        newObj.first_name = customerDetails.first_name;
        newObj.middle_name = customerDetails.middle_name;
        newObj.last_name = customerDetails.last_name;
        newObj.father_or_spouse_name = customerDetails.father_or_spouse_name;
        newObj.dob = customerDetails.dob;
        newObj.address_1 = customerDetails.address_1;
        newObj.address_2 = customerDetails.address_2;
        newObj.pincode = customerDetails.pincode;
        newObj.city = customerDetails.city;
        newObj.state = customerDetails.state;
        newObj.pincodeOnline = customerDetails.pin_code;
        newObj.pincode = customerDetails.pin_code;
        newObj.success = true;
        newObj.disabled = true;
      }

      return newObj;
    } catch (e) {
      return { success: false, disabled: false };
    }
  };

  // eslint-disable-next-line no-unused-vars
  const idProofListHandler = (values, callback, index, setValue) => {
    try {
      // const ID_PROOF = ID_PROOF_NAMELIST_WITHOUT_PAN;

      // if (values?.enter_pan_details === 'No') {
      //   ID_PROOF = ID_PROOF_NAMELIST_WITHOUT_PAN;
      // }
      callback(ID_PROOF_NAMELIST_WITHOUT_PAN);
    } catch (ex) {
      console.log('Error', ex);
    }
  };

  const proceedClickHandler = (proceedProps) => {
    try {
      const {
        getValues,
        setDetails,
        refComponent,
        setValue
      } = proceedProps;

      const {
        enter_bank_details,
        bankAccountVerificationStatus,
      } = getValues();

      if (enter_bank_details) {
        customerHelperRef.current.enter_bank_details = enter_bank_details;
      }

      if (enter_bank_details === 'Yes' && bankAccountVerificationStatus === 'VALID') {
        setValue('bankAccountVerificationStatus', null);
        setValue('beneficiary_name', null);
        setValue('confirmed_with_customer', null);
        const paymentCount = customerHelperRef.current.payment;
        customerHelperRef.current.payment = paymentCount + 1;
      }

      if (enter_bank_details === 'UPI' && customerHelperRef.current.successWithUPI >= 2) {
        setAlertShow({
          open: true,
          msg: ERRORMESSAGE.MAXRETRYREACH,
          alertType: 'error'
        });
        return;
      }

      if (customerHelperRef.current.payment >= 2) {
        refComponent.current = {
          modelDetails: {
            message: ERRORMESSAGE.UPIDISABLE
          }
        };
        setDetails({
          isShowComponent: true
        });
        return {
          dynamicKey: 'limitReact',
          success: true
        };
      }
      return {
        success: true
      };
    } catch (e) {
      console.log('Error', e);
      setAlertShow({
        open: true,
        msg: ERRORMESSAGE.SOMETHINGERROR,
        alertType: 'error'
      });
    }
  };

  const skipClickHandler = (proceedProps) => {
    try {
      const {
        setActiveFormIndex,
        setValue,
      } = proceedProps;

      setActiveFormIndex(7);
      // setValue('activeFormIndex', 7);
      setValue('enter_bank_details', 'No');
      return {
        success: true
      };
    } catch (e) {
      console.log('Error', e);
      setAlertShow({
        open: true,
        msg: ERRORMESSAGE.SOMETHINGERROR,
        alertType: 'error'
      });
    }
  };

  const paymentStatusHanlder = async (paymentData) => {
    try {
      const {
        refComponent,
        updateJsonHandler,
        input,
        timerIntervalRef,
        setQrData,
        getValues,
        setValue
      } = paymentData;
      const { qrData } = refComponent.current;
      const url = customerHelperRef.current?.customer_id ? `${SERVICEURL.CUSTOMER.UPISTATUS}?rpd_status_id=${qrData?.id}&customer_id=${customerHelperRef.current?.customer_id}` : `${SERVICEURL.CUSTOMER.UPISTATUS}?rpd_status_id=${qrData?.id}`;
      const { data } = await Service.get(url);

      const { bank_details, status } = data.data;

      const obj = {
        upi_account_number: bank_details?.bank_account_number,
        upi_branch_name: bank_details?.branch_name,
        upi_bank_name: bank_details?.bank_name,
        upi_ifsc: bank_details?.ifsc,
        beneficiary_name: bank_details?.beneficiary_name,
        success: true,
        dynamicKey: status === PAYMENTSTATUS.SUCCESS ? 'paymentSuccess' : ''
      };
      if ([PAYMENTSTATUS.SUCCESS, PAYMENTSTATUS.FAILED].includes(status)) {
        clearInterval(poolingIntervalRef.current);
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
        if (status === PAYMENTSTATUS.FAILED) {
          refComponent.current.modelDetails = {
            message: ERRORMESSAGE.NOTABLETOPROCESS
          };
          customerHelperRef.current.enter_bank_details = 'Yes';
          setQrData((pre) => ({
            ...pre,
            isShowComponent: true
          }));
          setAlertShow({
            open: true,
            msg: status === PAYMENTSTATUS.SUCCESS ? 'Payment success' : 'Payment failed',
            alertType: status === PAYMENTSTATUS.SUCCESS ? 'success' : 'error'
          });
        } else {
          if ('successWithUPI' in customerHelperRef.current) {
            const { successWithUPI } = customerHelperRef.current;
            customerHelperRef.current.successWithUPI = successWithUPI + 1;
          } else {
            customerHelperRef.current.successWithUPI = 1;
          }
          count = 0;
          const fromValues = getValues();
          const nameMatch = {
            beneficiary_name: bank_details?.beneficiary_name,
            ...fromValues
          };
          const { fuzzy_match_status } = await nameMatchHandler(nameMatch, 74);
          if (fuzzy_match_status < 75) {
            refComponent.current.modelDetails = {
              message: ERRORMESSAGE.BENEFICIARYNOTMATCH
            };
            setValue('enter_bank_details', 'Yes');
            setAlertShow({
              open: true,
              msg: ERRORMESSAGE.BENEFICIARYNOTMATCH,
              alertType: 'error'
            });
            obj.dynamicKey = 'redirect';
            customerHelperRef.current.enter_bank_details = 'Yes';
          }
        }
      } else {
        setAlertShow({
          open: true,
          msg: 'Payment in pending state',
          alertType: 'info'
        });
      }
      updateJsonHandler(input, obj);
    } catch (e) {
      console.log('Error', e);
      if (e?.response?.status === 409) {
        clearInterval(poolingIntervalRef.current);
        poolingIntervalRef.current = null;
        setAlertShow({
          open: true,
          msg: e?.response?.data?.errors,
          alertType: 'error'
        });
        customerHelperRef.current.isBankAccountDuplicate = true;
      } else {
        setAlertShow({
          open: true,
          msg: ERRORMESSAGE.SOMETHINGERROR,
          alertType: 'error'
        });
      }
    }
  };

  const paymentStatusCheckHandler = throttle(async (paymentData) => {
    try {
      const { setQrData, item, refComponent } = paymentData;
      const { qrData } = refComponent.current;
      setQrData((pre) => ({ ...pre, [item.name]: true }));
      await Service.get(`${SERVICEURL.CUSTOMER.UPIWEBHOOKSTATUS}?rpd_status_id=${qrData?.id}`);
      paymentStatusHanlder(paymentData);
      setTimeout(() => {
        setQrData((pre) => ({ ...pre, [item.name]: false }));
      }, 30000);
    } catch (e) {
      paymentStatusHanlder(paymentData);
      console.log('Error', e);
    }
  }, 30000);

  const poolingHandler = (paymentData) => {
    try {
      if (!poolingIntervalRef.current) {
        poolingIntervalRef.current = setInterval(() => {
          const formData = paymentData?.getValues();
          if (formData?.enter_bank_details === 'UPI') {
            paymentStatusHanlder(paymentData);
          }
        }, 45000);
      }
    } catch (e) {
      console.log('Error', e);
    }
  };

  const qrCodeHanlder = async (qrDetails) => {
    try {
      const {
        timerHandler,
        setQrData,
        updateJsonHandler,
        input,
        QRTYPE,
        refComponent,
        timerIntervalRef,
        getValues
      } = qrDetails;
      updateJsonHandler(input, { onClickUpdateJSON: true });
      const { data } = await Service.get(SERVICEURL.CUSTOMER.UPIINITIATE);
      refComponent.current.qrData = {
        id: data?.data?.id,
        url: data?.data?.url
      };
      setQrData((pre) => ({
        ...pre,
        isShowTimer: true,
        url: data?.data?.url,
        isShowButton: true
      }));
      setTimeout(() => {
        timerHandler();
      }, 5000);
      clearInterval(poolingIntervalRef.current);
      poolingIntervalRef.current = null;
      poolingHandler({
        refComponent,
        input,
        updateJsonHandler,
        timerIntervalRef,
        setQrData,
        getValues
      });
      if (QRTYPE === 'REGENERATE') {
        updateJsonHandler(input, { success: true });
      } else {
        return {
          success: true
        };
      }
    } catch (e) {
      console.log('Error for the intiate', e);
      const data = e.response;
      const msg = data?.data && errorMessageHandler(data.data.errors);
      if (e?.response?.status === 403) {
        setAlertShow({
          open: true,
          msg: ERRORMESSAGE.PERMISSIONNOT,
          alertType: 'error'
        });
      } else {
        setAlertShow({
          open: true,
          msg: msg || ERRORMESSAGE.INITIATEDQR,
          alertType: 'error'
        });
      }
      return {
        success: false
      };
    } finally {
      try {
        setTimeout(() => {
          const { setQrData } = qrDetails;
          setQrData((pre) => ({
            ...pre,
            isLoading: false
          }));
        }, 5000);
      } catch (e) {
        console.log('Error', e);
      }
    }
  };

  const timeoutQRHandler = async (data) => {
    try {
      const {
        input,
        qrData,
        setQrData,
        timerHandler,
        updateJsonHandler,
        refComponent,
        setTimer
      } = data;

      const { failedCount } = refComponent.current;

      if (failedCount) {
        if (failedCount >= 1) {
          refComponent.current.modelDetails = {
            message: ERRORMESSAGE.QRTIMEOUT
          };
          customerHelperRef.current.enter_bank_details = 'Yes';
          setQrData((pre) => ({
            ...pre,
            isShowComponent: true
          }));
          return;
        }
        setTimer(cloneDeep(input?.initiatTimer));
        refComponent.current.timer = cloneDeep(input?.initiatTimer);
        refComponent.current.failedCount = failedCount + 1;
      } else {
        setTimer(cloneDeep(input?.initiatTimer));
        refComponent.current.timer = cloneDeep(input?.initiatTimer);
        await input?.initialHandler({
          timerHandler,
          setQrData,
          qrData,
          updateJsonHandler,
          input,
          refComponent,
          QRTYPE: 'REGENERATE'
        });
        refComponent.current.failedCount = 1;
      }
    } catch (e) {
      console.log('Error', e);
      setAlertShow({
        open: true,
        msg: ERRORMESSAGE.SOMETHINGERROR,
        alertType: 'error'
      });
    }
  };

  const handleDynamicBankDetails = (values, setError) => {
    try {
      let response = false;
      if (values?.aadhaar_verification_mode === 'Offline' && values.aadhaar_osv_done === 'No') {
        setError('aadhaar_osv_done', { type: 'custom', customMsg: 'OSV is mandatory' });
        response = true;
      }

      if (
        values?.enter_bank_details === 'UPI'
        && (
          !values?.upi_ifsc?.trim()
          || !values?.upi_bank_name?.trim()
          || !values?.upi_branch_name?.trim()
          || !values?.upi_account_number?.trim()
        )
      ) {
        setAlertShow({
          open: true,
          msg: ERRORMESSAGE.PROCEED,
          alertType: 'error'
        });
        response = true;
      }

      if (
        values?.enter_bank_details === 'Yes'
        && (
          !values?.ifsc?.trim()
          || !values?.bank_name?.trim()
          || !values?.branch_name?.trim()
          || !values?.account_number?.trim()
        )
      ) {
        setAlertShow({
          open: true,
          msg: ERRORMESSAGE.PROCEED,
          alertType: 'error'
        });
        response = true;
      }
      return response;
    } catch (e) {
      console.log('Error', e);
    }
  };

  const nextValidateHandler = (nextData) => {
    try {
      const {
        setError,
        getValues,
        formData,
      } = nextData;
      const {
        enter_bank_details,
        bankAccountVerificationStatus,
        confirmed_with_customer
      } = getValues();
      let response = false;

      const qrCodeIndex = formData?.input?.findIndex((item) => item?.name === 'Qrcode');

      if (customerHelperRef.current.isBankAccountDuplicate) {
        response = true;
        setAlertShow({
          open: true,
          msg: 'Duplicate bank account number. Please enter a different bank account number.',
          alertType: 'error'
        });
      }
      if (
        ['UPI'].includes(enter_bank_details)
      && bankAccountVerificationStatus !== 'VALID' && !formData.input[qrCodeIndex]?.condition?.isShow
      ) {
        const msg = ERRORMESSAGE.VERIFYCLICKBUTTON;
        setAlertShow({
          open: true,
          msg,
          alertType: 'error'
        });
        response = true;
      }

      if (confirmed_with_customer === 'No') {
        setError('confirmed_with_customer', { type: 'custom', customMsg: 'Confirmed with customer must be yes.' });
        response = true;
      }

      if (
        ['Yes', 'UPI'].includes(enter_bank_details)
      && bankAccountVerificationStatus !== 'VALID' && formData.input[qrCodeIndex]?.condition?.isShow
      ) {
        setAlertShow({
          open: true,
          msg: ERRORMESSAGE.VERIFYPAYMENTDETAILS,
          alertType: 'error'
        });
        response = true;
      }

      if (
        ['Yes', 'UPI'].includes(enter_bank_details)
      && bankAccountVerificationStatus === 'VALID') {
        if (customerHelperRef.current.enter_bank_details !== enter_bank_details) {
          const msg = ERRORMESSAGE.PROCEEDMESSAGE;
          setAlertShow({
            open: true,
            msg,
            alertType: 'error'
          });
          response = true;
        }
      }

      if (!response) {
        clearInterval(poolingIntervalRef.current);
        poolingIntervalRef.current = null;
      }

      return response;
    } catch (e) {
      console.log('Error', e);
      setAlertShow({
        open: true,
        msg: 'Something went wrong.',
        alertType: 'error'
      });
    }
  };

  const onSaveClickHandlerAddress = async (details) => {
    try {
      const {
        imageDetails,
        updateJsonHandler,
        input,
        setValue,
        handleClose,
        setLoading,
        setImages,
        getValues
      } = details;
      setImages(imageDetails);
      setValue(input.name, {
        [AddressMapping.AddressFront]: imageDetails[AddressMapping.AddressFront].path,
        [AddressMapping.AddressBack]: imageDetails[AddressMapping.AddressBack].path,
      });

      if (getValues('aadhaar_verification_mode') === 'Online' && getValues('address_proof_name') === ID_PROOF_LIST.AADHAAR) {
        console.log('debug--address');
        setValue('address_proof_number', getValues('aadharCardOnline'));
      }
      handleClose();
      updateJsonHandler(input, { success: true, dynamicKey: 'success' });
    } catch (e) {
      console.log('Error', e);
      setAlertShow({
        open: true,
        msg: ERRORMESSAGE.SOMETHINGERROR,
        alertType: 'error'
      });
    } finally {
      details.setLoading({ loader: false, name: 'onUpload' });
    }
  };

  const onSaveClickHandlerID = async (details) => {
    try {
      const {
        imageDetails,
        updateJsonHandler,
        input,
        setValue,
        handleClose,
        setLoading,
        setImages,
        getValues
      } = details;
      setImages(imageDetails);
      setValue(input.name, {
        [IDMapping.IdFront]: imageDetails[IDMapping.IdFront].path,
        [IDMapping.IdBack]: imageDetails[IDMapping.IdBack].path,
      });

      if (getValues('aadhaar_verification_mode') === 'Online' && getValues('id_proof_name') === ID_PROOF_LIST.AADHAAR) {
        console.log('debug --- id');
        setValue('id_proof_number', getValues('aadharCardOnline'));
      }

      handleClose();
      updateJsonHandler(input, { success: true, dynamicKey: 'success' });
    } catch (e) {
      console.log('Error', e);
      setAlertShow({
        open: true,
        msg: ERRORMESSAGE.SOMETHINGERROR,
        alertType: 'error'
      });
    } finally {
      details.setLoading({ loader: false, name: 'onUpload' });
    }
  };

  const onSaveClickHandler = async (details) => {
    try {
      const { ocr } = CONFIGURATION;
      const { OCR, OCRDISABLE } = {
        OCR: {
          success: 'success',
          failed: 'fail',
        },
        OCRDISABLE: {
          failed: 'failOCRDisabled',
          success: 'successOCRDisabled'
        }
      };
      const {
        imageDetails,
        updateJsonHandler,
        input,
        setValue,
        handleClose,
        setLoading,
        setImages
      } = details;
      if (ocr) {
        updateCurrentTimestamp(AADHAARVERFICATIONMODE.OFFLINE, VERIFICATIONKEY.VERIFICATIONSTART);
      }
      const keyDetails = ocr ? OCR : OCRDISABLE;
      setLoading({ loader: true, name: 'onUpload' });
      const requestPayload = {
        url_front: imageDetails.aadhaarFront.url,
        url_back: imageDetails.aadhaarBack.url,
        fast_mode: false
      };

      let obj = {
        success: true,
        dynamicKey: keyDetails.success
      };

      if (ocr) {
        const { data } = await Service.post(SERVICEURL.CORE.OCR, requestPayload);

        const { aadhar } = data;
        const {
          name,
          id_no,
          address_information,
          fathers_name,
          dob,
          address,
        } = aadhar;
        const userName = name.split(' ');
        const userNameSize = userName.length;
        const addressDetails = address.split(' ');
        const addressDetailsSize = addressDetails.length;
        const res = await existingCheckHandler('aadhaar_number', id_no);
        if (!res?.success) {
          setLoader(false);
          return;
        }
        obj = {
          dynamicKey: keyDetails.success,
          first_name: userNameSize > 0 ? userName[0] : '',
          last_name: userNameSize > 1 ? userName[userNameSize - 1] : '',
          middle_name: userNameSize >= 3 ? userName.slice(1, userNameSize - 1).join(' ') : '',
          aadharCardOffline: id_no,
          pincode: address_information?.pincode,
          father_or_spouse_name: fathers_name,
          address_1: addressDetails?.slice(0, (addressDetailsSize / 2)).join(' '),
          address_2: addressDetails?.slice((addressDetailsSize / 2), addressDetailsSize).join(' '),
          dob: moment(dob ?? `01/01/${aadhar?.year_of_birth}`, 'DD/MM/YYYY').format('MM/DD/YYYY'),
          success: true
        };
      }
      updateCurrentTimestamp(AADHAARVERFICATIONMODE.OFFLINE, VERIFICATIONKEY.VERIFICATIONEND);
      setImages(imageDetails);
      setValue(input.name, {
        aadhaarFront: imageDetails.aadhaarFront.path,
        aadhaarBack: imageDetails.aadhaarBack.path,
      });
      handleClose();
      updateJsonHandler(input, obj);
    } catch (e) {
      console.log('Error', e);
      setAlertShow({
        open: true,
        msg: ERRORMESSAGE.SOMETHINGERROR,
        alertType: 'error'
      });
    } finally {
      details.setLoading({ loader: false, name: 'onUpload' });
    }
  };

  const biometicInitiateHandler = async (refComponent, setDetails) => {
    try {
      // eslint-disable-next-line no-promise-executor-return
      await new Promise((resolve) => setTimeout(resolve, 1000));
      let payload;
      if (customerHelperRef.current.isRekyc) {
        let encodedAadhar = '';
        payload = {};
        const unmaskedAadhar = customerHelperRef.current.unmaskerAadhaar;
        // eslint-disable-next-line no-plusplus
        for (let ind = 0; ind < unmaskedAadhar.length; ind++) {
          encodedAadhar += aadhaarMapping[unmaskedAadhar[ind]];
        }
        encodedAadhar = (encodedAadhar.padStart(18, 't#Lw=+')).padEnd(24, '(*@8g5)');
        payload.encoded_aadhaar_number = encodedAadhar;
        payload.is_re_kyc = true;
      }
      const { data } = await Service.post(SERVICEURL.CUSTOMER.BIOMETRICINITIATE, payload);

      const { token, url } = data.data;
      const { id } = jwtDecode(token);
      customerHelperRef.current.biometricDetails.id = id;
      customerHelperRef.current.biometricDetails.url = url;
      customerHelperRef.current.biometricDetails.modelStatus = BIOMETRICMODELSTATUS.INITIATED;
      customerHelperRef.current.biometricDetails.biometricStatus = BIOMETRICSTATUS.PENDING;
      refComponent.current = {
        id,
        url
        // url: 'https://ilos-dev.capriglobal.in/login'
      };
      setDetails((pre) => ({
        ...pre,
        isLoading: false
      }));
      return { id };
    } catch (err) {
      console.log(err);
      return { id: null };
    }
  };

  const pollingHandlerAadhaarVerifcation = async (
    pollingDetails,
    waitTime = 1000,
    failedCount = 0
  ) => {
    try {
      const {
        updateJsonHandler,
        input,
        setDetails,
      } = pollingDetails;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      if (customerHelperRef.current.biometricDetails.modelStatus === BIOMETRICMODELSTATUS.CLOSE) {
        return;
      }
      const { id } = customerHelperRef.current.biometricDetails;
      const { data } = await Service.get(`${SERVICEURL.CUSTOMER.BIOMETRICINITIATESTATUS}?id=${id}`);
      const { status } = data.data;
      if (status === BIOMETRICSTATUS.PENDING && failedCount < 4) {
        return pollingHandlerAadhaarVerifcation(
          pollingDetails,
          waitTime + waitTime,
          failedCount + 1
        );
      }

      let obj = {};

      const isValid = status === BIOMETRICSTATUS.SUCCESS;

      if (isValid) {
        updateCurrentTimestamp(AADHAARVERFICATIONMODE.BIOMETRIC, VERIFICATIONKEY.VERIFICATIONEND);
        const userDetails = data?.data?.data;
        const { Name, vaultData, aadhaar_print_file_path } = userDetails;

        const res = await existingCheckHandler('aadhaar_reference_number', vaultData?.reference);
        if (!res?.success) {
          setLoader(false);
          return;
        }

        const userName = Name.split(' ');
        const userNameSize = userName.length;
        const DOBDetails = userDetails.DOB.split('-');

        if (DOBDetails.length === 1) {
          if (!(moment().diff(moment(DOBDetails[0], 'YYYY'), 'years') < 81 && moment().diff(moment(DOBDetails[0], 'YYYY'), 'years') > 17)) {
            setAlertShow({
              open: true,
              msg: ERRORMESSAGE.DOBERROR,
              alertType: 'error'
            });
            setRedirect({
              message: ERRORMESSAGE.DOBERROR,
              isRedirect: true
            });
            return;
          }
          input.biomerticSuccess.updateFieldDetails.push({
            name: 'dob',
            key: 'disableYears',
            value: (currentDate) => currentDate.getFullYear() < parseInt(DOBDetails[0], 10) || currentDate.getFullYear() > parseInt(DOBDetails[0], 10)
          });
        }

        const pincode = userDetails?.PinCode;

        const response = await pincodeHandler({ pincode });
        const { city, state } = response.data;
        const address1 = `${userDetails?.House} ${userDetails?.Locality}`?.trim();
        const address2 = `${userDetails?.Street}`?.trim();
        const addressIdIndex = input.biomerticSuccess.updateFieldDetails.findIndex((item) => item.name === 'address_proof_same_id_proof' && item.key === 'disabled');
        const previewIndex = input.biomerticSuccess.updateFieldDetails.findIndex((item) => item.name === 'address_proof_url' && item.key === 'isPreview');
        input.biomerticSuccess.updateFieldDetails.push({
          name: 'id_proof_url',
          key: 'imageDetails',
          value: [{
            name: 'ID Proof',
            mandatory: true,
            label: 'Front Side',
          }]
        });
        if (address1 && address2 && addressIdIndex >= 0) {
          input.biomerticSuccess.updateFieldDetails[addressIdIndex].value = true;
          input.biomerticSuccess.updateFieldDetails.push({
            name: 'address_proof_url',
            key: 'imageDetails',
            value: [{
              name: 'Address Proof',
              mandatory: true,
              label: 'Front Side',
            }]
          });
          input.biomerticSuccess.updateFieldDetails.push({
            name: 'address_proof_url',
            key: 'disabled',
            value: true
          });
        } else if (previewIndex >= 0) {
          input.biomerticSuccess.updateFieldDetails[previewIndex].value = 'jpeg';
        }

        obj = {
          first_name: userNameSize > 0 ? userName[0] : '',
          last_name: userNameSize > 1 ? userName[userNameSize - 1] : '',
          middle_name: userNameSize >= 3 ? userName.slice(1, userNameSize - 1).join(' ') : '',
          father_or_spouse_name: userDetails?.CareOfPerson,
          dob: DOBDetails.length === 3 ? moment(userDetails?.DOB, 'DD-MM-YYYY').format('MM/DD/YYYY') : '',
          // dob: DOBDetails.length === 3 ? moment(userDetails?.DOB, 'DD-MM-YYYY').format('MM/DD/YYYY') : `01/01/${userDetails.DOB}`,
          address_1: address1,
          address_2: address2,
          pincode: city === '' || state === '' ? '' : userDetails?.PinCode,
          // city: dataFromAadhaar?.address?.splitAddress?.district?.trim() ?? '',
          // state: dataFromAadhaar?.address?.splitAddress?.state?.trim() ?? '',
          city: city === '' ? ' ' : city,
          state: state === '' ? ' ' : state,
          // pincode: userDetails?.PinCode,
          // city: city ?? '',
          // state: state ?? '',
          aadharCardBiometric: `XXXXXXXX${userDetails?.AadhaarNumber.slice(8, 12)}`,
          id_proof_number: `XXXXXXXX${userDetails?.AadhaarNumber.slice(8, 12)}`,
          id_proof_url: {
            'ID Proof': aadhaar_print_file_path
          },
          id_proof_name: ID_PROOF_LIST.AADHAAR,
          address_proof_same_id_proof: address2 && address1 ? 'Yes' : 'No'
        };

        if (address1.length > 0 && address2.length > 0) {
          obj.address_proof_name = ID_PROOF_LIST.AADHAAR;
          obj.address_proof_number = `XXXXXXXX${userDetails?.AadhaarNumber.slice(8, 12)}`;
          obj.address_proof_url = {
            'Address Proof': aadhaar_print_file_path
          };

          const tempArrSuccess = [
            {
              apiKey: 'address_proof_name',
              name: 'address_proof_name'
            },
            {
              apiKey: 'address_proof_number',
              name: 'address_proof_number'
            },
            {
              apiKey: 'address_proof_url',
              name: 'address_proof_url'
            }
          ];

          tempArrSuccess.forEach((item) => {
            input.biomerticSuccess.setValueArr.push(item);
          });
        } else {
          const addressProofList = cloneDeep(ADDRESS_PROOF_NAME_LIST);
          const findIndex = addressProofList.findIndex((item) => item === ID_PROOF_LIST.AADHAAR);
          if (findIndex >= 0) addressProofList.splice(findIndex, 1);
          input.biomerticSuccess.updateFieldDetails.push({
            name: 'address_proof_name',
            key: 'option',
            value: addressProofList
          });
        }
        customerHelperRef.current.biometricDetails.aadhaar_reference_number = vaultData?.reference;
      }
      customerHelperRef.current.biometricDetails.biometricStatus = isValid
        ? BIOMETRICSTATUS.SUCCESS : BIOMETRICSTATUS.FAILED;

      updateJsonHandler(input, {
        ...obj,
        success: true,
        dynamicKey: isValid ? 'biomerticSuccess' : 'biomerticFail'
      });
      setDetails((pre) => ({
        ...pre,
        isShowComponent: false,
        isLoading: false
      }));
      if (isValid) {
        setAlertShow({
          open: true,
          msg: ERRORMESSAGE.FETCHSUCCESSBIOMETRIC,
          alertType: 'success'
        });
        return;
      }
      failureIncrementHandler(AADHAARVERFICATIONMODE.BIOMETRIC);
      if (failureCountGetHandler(AADHAARVERFICATIONMODE.BIOMETRIC) === 1) {
        setRedirect({
          message: CONFIGURATION?.offline ? ERRORMESSAGE.OFFLINEBIOMETRICENABLE : ERRORMESSAGE.FAILEDFETCHERROR,
          isRedirect: true
        });
      }
      setAlertShow({
        open: true,
        msg: ERRORMESSAGE.FAILEDFETCHERROR,
        alertType: 'error'
      });
    } catch (err) {
      failureIncrementHandler(AADHAARVERFICATIONMODE.BIOMETRIC);
      if (failureCountGetHandler(AADHAARVERFICATIONMODE.BIOMETRIC) === 1) {
        setRedirect({
          message: CONFIGURATION?.offline ? ERRORMESSAGE.OFFLINEBIOMETRICENABLE : ERRORMESSAGE.FAILEDFETCHERROR,
          isRedirect: true
        });
      }
      setAlertShow({
        open: true,
        msg: ERRORMESSAGE.FETCHINGERROR,
        alertType: 'error'
      });
      console.log('Error', err);
    }
  };

  const rekycPollingHandlerAadhaarVerification = async (
    pollingDetails,
    waitTime = 1000,
    failedCount = 0
  ) => {
    try {
      const {
        updateJsonHandler,
        input,
        setDetails,
      } = pollingDetails;
      // const ad1 = '';
      // const temp = {
      //   first_name: 'ANOOP',
      //   last_name: 'JAIN',
      //   middle_name: '',
      //   father_or_spouse_name: 'fdsa',
      //   dob: '202020',
      //   address_1: ad1 || customerHelperRef.current.addressDetails.address1,
      //   address_2: 'Address2',
      //   pincode: '201206',
      //   city: ' ',
      //   state: ' ',
      //   aadharCardBiometric: 'fdsa',
      //   id_proof_number: 'XXXXXXX1234',
      //   id_proof_url: { [IDMapping.IDProof]: 'Loan/Udyam Certificate/2024/05/22/e1b63fa7-e1ca-4842-ac64-d5b02d4ee677.pdf' },
      //   address_proof_url: { [AddressMapping.AddressProof]: 'Loan/Udyam Certificate/2024/05/22/e1b63fa7-e1ca-4842-ac64-d5b02d4ee677.pdf' },
      //   id_proof_name: ID_PROOF_LIST.AADHAAR,
      // };

      // input.biomerticSuccess.updateFieldDetails = [{
      //   name: 'address_proof_url',
      //   key: 'isPreview',
      //   value: 'pdf'
      // }, {
      //   name: 'id_proof_url',
      //   key: 'isPreview',
      //   value: 'pdf'
      // }, {
      //   name: 'id_proof_name',
      //   key: 'onChange',
      //   value: {}
      // }, {
      //   name: 'address_proof_name',
      //   key: 'onChange',
      //   value: {}
      // }, {
      //   name: 'address_proof_same_id_proof',
      //   key: 'onChange',
      //   value: {}
      // }];
      // input.biomerticSuccess.setValueArr.push({ name: 'address_proof_same_id_proof', value: 'Yes' });

      // if (!ad1 || !temp.address_2) {
      //   console.log('input ===', input.biomerticSuccess);
      //   // input.biomerticSuccess.setValueArr.push({ name: 'address_proof_osv_done', value: '' });
      //   input.biomerticSuccess.disable.push({
      //     value: false,
      //     disableFields: ['address_proof_number', 'address_proof_url', 'address_proof_name', 'address_proof_remarks', 'address_proof_osv_done']
      //   });
      //   input.biomerticSuccess.setValueArr.push({ name: 'address_proof_same_id_proof', value: 'No' });
      //   input.biomerticSuccess.resetFields = ['address_proof_number', 'address_proof_url', 'address_proof_name', 'address_proof_remarks', 'address_proof_osv_done'];
      //   const newAddressOptions = ADDRESS_PROOF_NAME_LIST.filter((item) => item !== ID_PROOF_LIST.AADHAAR);
      //   console.log('new address options', newAddressOptions);
      //   input.biomerticSuccess.updateFieldDetails = [{
      //     name: 'address_proof_name',
      //     key: 'option',
      //     value: newAddressOptions
      //   }, {
      //     name: 'id_proof_url',
      //     key: 'isPreview',
      //     value: 'pdf'
      //   }, {
      //     name: 'id_proof_name',
      //     key: 'runonChange',
      //     value: true
      //   }, {
      //     name: 'address_proof_name',
      //     key: 'runonChange',
      //     value: true
      //   }];
      // }

      // updateJsonHandler(input, {
      //   ...temp,
      //   success: true,
      //   dynamicKey: 'biomerticSuccess'
      // });
      // setDetails((pre) => ({
      //   ...pre,
      //   isShowComponent: false,
      //   isLoading: false
      // }));
      // return;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      if (customerHelperRef.current.biometricDetails.modelStatus === BIOMETRICMODELSTATUS.CLOSE) {
        return;
      }
      const { id } = customerHelperRef.current.biometricDetails;
      console.log('Polling Handler ----');
      const { data } = await Service.get(`${SERVICEURL.CUSTOMER.BIOMETRICINITIATESTATUS}?id=${id}`);
      const { status } = data.data;
      console.log('Attempt-----', failedCount, status);
      if (status === BIOMETRICSTATUS.PENDING && failedCount < 4) {
        return rekycPollingHandlerAadhaarVerification(
          pollingDetails,
          waitTime + waitTime,
          failedCount + 1
        );
      }

      let obj = {};

      const isValid = status === BIOMETRICSTATUS.SUCCESS;

      if (isValid) {
        updateCurrentTimestamp(AADHAARVERFICATIONMODE.BIOMETRIC, VERIFICATIONKEY.VERIFICATIONEND);
        const userDetails = data?.data?.data;
        const { Name, vaultData, aadhaar_print_file_path } = userDetails;

        const userName = Name.split(' ');
        const userNameSize = userName.length;
        const DOBDetails = userDetails.DOB.split('-');

        const pincode = userDetails?.PinCode;

        const response = await pincodeHandler({ pincode });
        const { city, state } = response.data;
        const address1 = `${userDetails?.House} ${userDetails?.Locality}`?.trim();
        const address2 = `${userDetails?.Street}`?.trim();

        obj = {
          first_name: userNameSize > 0 ? userName[0] : '',
          last_name: userNameSize > 1 ? userName[userNameSize - 1] : '',
          middle_name: userNameSize > 1 ? userName.slice(1, userNameSize - 2).join(' ') : '',
          father_or_spouse_name: userDetails?.CareOfPerson,
          dob: DOBDetails.length === 3 ? moment(userDetails?.DOB, 'DD-MM-YYYY').format('MM/DD/YYYY') : '',
          address_1: address1 || customerHelperRef.current.addressDetails.address1,
          address_2: address2 || customerHelperRef.current.addressDetails.address2,
          pincode: city === '' || state === '' ? '' : userDetails?.PinCode,
          city: city === '' ? ' ' : city,
          state: state === '' ? ' ' : state,
          aadharCardBiometric: `XXXXXXXX${userDetails?.AadhaarNumber.slice(8, 12)}`,
          id_proof_number: `XXXXXXXX${userDetails?.AadhaarNumber.slice(8, 12)}`,
          id_proof_url: { [IDMapping.IDProof]: aadhaar_print_file_path },
          address_proof_url: { [AddressMapping.AddressProof]: aadhaar_print_file_path },
          id_proof_name: ID_PROOF_LIST.AADHAAR,
        };
        input.biomerticSuccess.updateFieldDetails = [{
          name: 'address_proof_url',
          key: 'isPreview',
          value: 'pdf'
        }, {
          name: 'id_proof_url',
          key: 'isPreview',
          value: 'pdf'
        }, {
          name: 'id_proof_name',
          key: 'onChange',
          value: {}
        }, {
          name: 'address_proof_name',
          key: 'onChange',
          value: {}
        }, {
          name: 'address_proof_same_id_proof',
          key: 'onChange',
          value: {}
        }];
        input.biomerticSuccess.setValueArr.push({ name: 'address_proof_same_id_proof', value: 'Yes' });

        if (!address1 || !address2) {
          console.log('input ===', input.biomerticSuccess);
          // input.biomerticSuccess.setValueArr.push({ name: 'address_proof_osv_done', value: '' });
          input.biomerticSuccess.disable.push({
            value: false,
            disableFields: ['address_proof_number', 'address_proof_url', 'address_proof_name', 'address_proof_remarks', 'address_proof_osv_done']
          });
          input.biomerticSuccess.setValueArr.push({ name: 'address_proof_same_id_proof', value: 'No' });
          input.biomerticSuccess.resetFields = ['address_proof_number', 'address_proof_url', 'address_proof_name', 'address_proof_remarks', 'address_proof_osv_done'];
          const newAddressOptions = ADDRESS_PROOF_NAME_LIST.filter((item) => item !== ID_PROOF_LIST.AADHAAR);
          console.log('new address options', newAddressOptions);
          input.biomerticSuccess.updateFieldDetails = [{
            name: 'address_proof_name',
            key: 'option',
            value: newAddressOptions
          }, {
            name: 'id_proof_url',
            key: 'isPreview',
            value: 'pdf'
          }, {
            name: 'id_proof_name',
            key: 'runonChange',
            value: true
          }, {
            name: 'address_proof_name',
            key: 'runonChange',
            value: true
          }];
        }
        customerHelperRef.current.biometricDetails.aadhaar_reference_number = vaultData?.reference;
      }
      customerHelperRef.current.biometricDetails.biometricStatus = isValid
        ? BIOMETRICSTATUS.SUCCESS : BIOMETRICSTATUS.FAILED;

      updateJsonHandler(input, {
        ...obj,
        success: true,
        dynamicKey: isValid ? 'biomerticSuccess' : 'biomerticFail'
      });
      setDetails((pre) => ({
        ...pre,
        isShowComponent: false,
        isLoading: false
      }));
      if (isValid) {
        setAlertShow({
          open: true,
          msg: ERRORMESSAGE.FETCHSUCCESSBIOMETRIC,
          alertType: 'success'
        });
        return;
      }
      failureIncrementHandler(AADHAARVERFICATIONMODE.BIOMETRIC);
      if (!customerHelperRef?.current?.isRekyc && failureCountGetHandler(AADHAARVERFICATIONMODE.BIOMETRIC) === 1) {
        setRedirect({
          message: CONFIGURATION?.offline ? ERRORMESSAGE.OFFLINEBIOMETRICENABLE : ERRORMESSAGE.FAILEDFETCHERROR,
          isRedirect: true
        });
      }
      setAlertShow({
        open: true,
        msg: ERRORMESSAGE.FAILEDFETCHERROR,
        alertType: 'error'
      });
    } catch (err) {
      failureIncrementHandler(AADHAARVERFICATIONMODE.BIOMETRIC);
      if (!customerHelperRef?.current?.isRekyc && failureCountGetHandler(AADHAARVERFICATIONMODE.BIOMETRIC) === 1) {
        setRedirect({
          message: CONFIGURATION?.offline ? ERRORMESSAGE.OFFLINEBIOMETRICENABLE : ERRORMESSAGE.FAILEDFETCHERROR,
          isRedirect: true
        });
      }
      setAlertShow({
        open: true,
        msg: ERRORMESSAGE.FETCHINGERROR,
        alertType: 'error'
      });
      console.log('Error', err);
    }
  };

  const closeHandlerAadhaarVerificationHandler = async (closeDetails) => {
    try {
      setLoader(true);
      if (customerHelperRef.current.isRekyc) {
        await rekycPollingHandlerAadhaarVerification(closeDetails);
      } else {
        await pollingHandlerAadhaarVerifcation(closeDetails);
      }
      customerHelperRef.current.biometricDetails.modelStatus = BIOMETRICMODELSTATUS.CLOSE;
    } catch (err) {
      console.log('Error', err);
    } finally {
      setLoader(false);
    }
  };

  const aadhaarVerificationModeHandler = async (addharVerificationDetails) => {
    try {
      const {
        // setValue,
        updateJsonHandler,
        input,
        // getValues,
        // details,
        setDetails,
        selectedValue,
        refComponent
      } = addharVerificationDetails;
      if (selectedValue === AADHAARVERFICATIONMODE.BIOMETRIC) {
        updateCurrentTimestamp(AADHAARVERFICATIONMODE.BIOMETRIC, VERIFICATIONKEY.VERIFICATIONSTART);
        setDetails((pre) => ({
          ...pre,
          isShowComponent: true,
          isLoading: true
        }));
        const { id } = await biometicInitiateHandler(refComponent, setDetails);
        if (!id) {
          updateJsonHandler(input, { success: true, dynamicKey: 'biomerticFail' });
          failureIncrementHandler(AADHAARVERFICATIONMODE.BIOMETRIC);
          if (!customerHelperRef?.current?.isRekyc && failureCountGetHandler(AADHAARVERFICATIONMODE.BIOMETRIC) === 1) {
            setRedirect({
              message: CONFIGURATION?.offline ? ERRORMESSAGE.OFFLINEBIOMETRICENABLE : ERRORMESSAGE.FAILEDFETCHERROR,
              isRedirect: true
            });
          }
        }
        console.log('Id not found');
        console.log('Verification Handler', addharVerificationDetails);
      }
    } catch (err) {
      console.log('error in verification handler', err);
      failureIncrementHandler(AADHAARVERFICATIONMODE.BIOMETRIC);
      if (!customerHelperRef?.current?.isRekyc && failureCountGetHandler(AADHAARVERFICATIONMODE.BIOMETRIC) === 1) {
        setRedirect({
          message: CONFIGURATION?.offline ? ERRORMESSAGE.OFFLINEBIOMETRICENABLE : ERRORMESSAGE.FAILEDFETCHERROR,
          isRedirect: true
        });
      }
      if (addharVerificationDetails && addharVerificationDetails?.updateJsonHandler) {
        addharVerificationDetails.updateJsonHandler(addharVerificationDetails.input, { success: true, dynamicKey: 'biomerticFail' });
      }
      console.log('Error', err);
    }
  };

  const onChangeKycHandler = ({
    setValue,
    updateJsonHandler,
    input,
    getValues
  }) => {
    const currentDict = getValues();
    if (currentDict?.address_proof_same_id_proof === 'Yes') {
      const obj = {};
      if (currentDict?.id_proof_url?.[IDMapping.IdFront]) {
        obj[AddressMapping.AddressFront] = currentDict?.id_proof_url?.[IDMapping.IdFront];
      }

      if (currentDict?.id_proof_url?.[IDMapping.IdBack]) {
        obj[AddressMapping.AddressBack] = currentDict?.id_proof_url?.[IDMapping.IdBack];
      }
      setValue('address_proof_name', currentDict?.id_proof_name);
      setValue('address_proof_number', currentDict?.id_proof_number);
      setValue('address_proof_url', Object.keys(obj).length ? obj : '');

      const addressTemp = cloneDeep(ADDRESS_PROOF_NAME_LIST);
      const indexAddress = input?.onChangeConfig?.updateFieldDetails.findIndex((item) => item.name === 'address_proof_name' && item.key === 'option');
      input.onChangeConfig.updateFieldDetails[indexAddress].value = addressTemp;
      updateJsonHandler(input, { success: true, dynamicKey: 'onChangeConfig' });
    } else {
      setValue('address_proof_number', '');
      setValue('address_proof_name', '');
      setValue('address_proof_url', '');
      const value = currentDict?.id_proof_name;
      const addressTemp = cloneDeep(ADDRESS_PROOF_NAME_LIST).filter((item) => item !== value);
      const indexAddress = input?.onChangeConfig?.updateFieldDetails.findIndex((item) => item.name === 'address_proof_name' && item.key === 'option');
      input.onChangeConfig.updateFieldDetails[indexAddress].value = addressTemp;
      updateJsonHandler(input, { success: true, dynamicKey: 'onChangeConfig' });
    }
  };
  const resetFormValues = ({ setValue, updateJsonHandler, input }) => {
    setValue('address_proof_number', '');
    setValue('address_proof_name', '');
    setValue('address_proof_url', '');
    setValue('address_proof_same_id_proof', '');
    updateJsonHandler(input, { success: true, dynamicKey: 'configOnChange' });
  };
  const onDeleteHandlerId = ({ updateJsonHandler, input }) => {
    updateJsonHandler(input, { success: true, dynamicKey: 'configOnDelete' });
  };

  return {
    nextValidateHandler,
    handleDynamicBankDetails,
    timeoutQRHandler,
    qrCodeHanlder,
    paymentStatusCheckHandler,
    skipClickHandler,
    proceedClickHandler,
    idProofListHandler,
    handleDynamicKYCValidation,
    aadhaarVerifyHandler,
    resetField,
    preFillIfExists,
    annualIncomeHandler,
    relationShipManagerMobileHandler,
    relationShipManagerCodeHandler,
    aadhaarOTPVerificationHandler,
    aadhaarCardOtpHandler,
    ifscDetailsHandler,
    handleNomineeValidationHandler,
    bankAccountVerificationHandler,
    pincodeVerificationHandler,
    panVerificationHandler,
    otpMobileVerificationHandler,
    otpHandler,
    onSaveClickHandler,
    onSaveClickHandlerID,
    onSaveClickHandlerAddress,
    aadhaarVerificationModeHandler,
    closeHandlerAadhaarVerificationHandler,
    biometricEnableHandler,
    fuzzyMatch,
    rekycAadhaarOTPVerificationHandler,
    onChangeKycHandler,
    resetFormValues,
    onDeleteHandlerId,
    customerOccupationHandler
  };
};
