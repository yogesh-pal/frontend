/* eslint-disable prefer-destructuring */
/* eslint-disable max-len */
/* eslint-disable camelcase */
/* eslint-disable no-unreachable */
import { cloneDeep } from 'lodash';
import moment from 'moment';
import { Service } from '../../../../service/index';
import { biometricComponent } from '../../customerCreation/helper/component';
// import { AADHAARVERFICATIONMODE } from '../../customerCreation/helper/constant';
import {
  kycDocumentStep,
  personalInformationStep,
  employmentInformationStep,
  occupationAddressStep,
  nomineeDetailsStep,
  relationshipManagerStep,
  bankDetailsStep,
  sendOtpStep,
} from './stepper';
import { REGEX, SERVICEURL } from '../../../../constants';
import { checkPanValidity, panAadharLinkStatus } from '../../utils';
import { rekycDocumentStep } from './stepper/rekycDocument';
import { useCreateCustomer } from '../../customerCreation/helper/stepperFunction';
import { updateFieldDetailsHandler } from '../../../../components/formGenerator/utils/filePreviewFields';

export const editFormJsonDetails = (props) => {
  const {
    setIsLoading,
    setAlertShow,
    dispatch,
    bankDetailsReducer,
    fatherOrSpouseReducer,
    unmaskedAadhaarNoReducer,
    aadhaarCardTimeStampReducer,
    userDetails,
    resendReducer,
    customerHelperRef,
    poolingIntervalRef,
    setLoader,
    bankDetails,
    configRes,
    setRedirect
  } = props;

  const {
    aadhaarVerificationModeHandler,
    closeHandlerAadhaarVerificationHandler,
    biometricEnableHandler,
    aadhaarCardOtpHandler,
    fuzzyMatch,
    rekycAadhaarOTPVerificationHandler,
    idProofListHandler,
	  onSaveClickHandlerID,
	  onDeleteHandlerId,
	  resetFormValues,
    preFillIfExists,
    onSaveClickHandlerAddress,
    handleDynamicKYCValidation,
    onChangeKycHandler,
    annualIncomeHandler,
    customerOccupationHandler
  } = useCreateCustomer({
    customerID: '',
    setRedirect,
    setAlertShow,
    dispatch,
    resendReducer,
    setLoader,
    bankDetailsReducer: '',
    setIsLoading: '',
    fatherOrSpouseReducer,
    customerDetails: '',
    unmaskedAadhaarNoReducer,
    aadhaarCardTimeStampReducer,
    relationShipManagerDetails: '',
    customerHelperRef,
    poolingIntervalRef: '',
    errorMessageHandler: '',
    bankDetails: '',
    CONFIGURATION: configRes
  });

  console.log('edit for m json', customerHelperRef);
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
        const { data } = await Service.get(`${process.env.REACT_APP_SEND_SMS_OTP}?dest=${apiDetails?.primary_mobile_number}&otplen=4&otp_type=WHATSAPP&type=${userDetails.primary_mobile_number === apiDetails?.primary_mobile_number ? 'details_update' : 'mobile_number'}`);
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
      const { data } = await Service.get(`${process.env.REACT_APP_SEND_SMS_OTP}?dest=${apiDetails?.primary_mobile_number}&otplen=4&type=${userDetails.primary_mobile_number === apiDetails?.primary_mobile_number ? 'details_update' : 'mobile_number'}`);
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
        msg: 'OTP verification API failed. Try again.',
        alertType: 'error'
      });
      return { success: false };
    }
  };

  const nameMatchHandler = async (values) => {
    try {
      const {
        first_name, middle_name, last_name, beneficiary_name
      } = values;
      let name1 = '';
      if (middle_name) {
        name1 = `${first_name} ${middle_name} ${last_name}`;
      } else {
        name1 = `${first_name} ${last_name}`;
      }
      const { data } = await Service.get(`${process.env.REACT_APP_FUZZY_LOGIC}?name1=${name1}&name2=${beneficiary_name}`);
      dispatch(bankDetailsReducer({
        is_bank_verified: true,
        fuzzy_match_status: data.data
      }));
      if (data?.data > 70) {
        setAlertShow({
          open: true,
          msg: 'customer name match with beneficiary name.',
          alertType: 'success'
        });
        return;
      }
      setAlertShow({
        open: true,
        msg: `Bank Account Holder Name is different from the Customer name. The match score is ${data.data}.`,
        alertType: 'error'
      });
    } catch (e) {
      console.log(e);
      setAlertShow({
        open: true,
        msg: 'Fuzzy match API failed. Try again.',
        alertType: 'error'
      });
      return { success: false };
    }
  };

  // const bankAccountVerificationHandler = async (values) => {
  //   try {
  //     const { account_number, ifsc } = values;
  //     if (ifsc?.length < 11 || ifsc?.length > 11) {
  //       setAlertShow({
  //         open: true,
  //         msg: 'Please enter correct ifsc code before verify bank account number.',
  //         alertType: 'error'
  //       });
  //       return { success: false, validation: true };
  //     }
  //     const { data } = await Service.post(process.env.REACT_APP_BANK_ACCOUNT, {
  //       ifsc,
  //       account_number
  //     });

  //     if (data?.data?.verified === true) {
  //       const nameMatch = {
  //         beneficiary_name: data?.data?.beneficiary_name_with_bank.trim(),
  //         ...values
  //       };
  //       nameMatchHandler(nameMatch);
  //       dispatch(bankDetailsReducer({
  //         is_bank_verified: true
  //       }));
  //       data.data.success = true;
  //       return { ...data.data, beneficiary_name_with_bank: data.data.beneficiary_name_with_bank.trim() };
  //     }
  //     setAlertShow({
  //       open: true,
  //       msg: 'Account verification failed. Request has been sent to Checker for Verification of Account details.',
  //       alertType: 'error'
  //     });
  //     dispatch(bankDetailsReducer({
  //       is_bank_verified: false
  //     }));
  //     data.success = false;
  //     return data;
  //   } catch (e) {
  //     console.log(e);
  //     dispatch(bankDetailsReducer({
  //       is_bank_verified: false
  //     }));
  //     setAlertShow({
  //       open: true,
  //       msg: 'Bank account verification API failed. Try again.',
  //       alertType: 'error'
  //     });
  //     return { success: false };
  //   }
  // };

  const pincodeVerificationHandler = async (values, callback, bodyDetails) => {
    try {
      const pincodeObj = {};
      bodyDetails.forEach((item) => {
        pincodeObj.pincode = values[item];
      });
      if (pincodeObj?.pincode.length === 6) {
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
      }
    } catch (e) {
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

  const panVerificationHandler = async (values, callback, bodyDetails) => {
    try {
      // setLoader(true);
      setIsLoading(true);
      const pancardObj = {};
      bodyDetails.forEach((item) => {
        pancardObj.number = values[item];
      });
      if (pancardObj?.number.length !== 10) return;
      const panValidityStatus = await checkPanValidity(values, bodyDetails, setAlertShow);

      if (configRes.aadhaarPanlinking) {
        const aadhaarReq = {
          reference: userDetails?.aadhaar_reference_number
        };
        const aadharData = await Service.post(`${SERVICEURL.CUSTOMER.VALIDATE_AADHAR_DECODE}`, aadhaarReq);
        const aadharNo = aadharData?.data?.data?.data?.id;
        const panNo = values?.pan_no;
        // let fullName = '';
        // if (values.first_name) {
        //   fullName = `${values.first_name}`;
        // }
        // if (values.middle_name) {
        //   fullName = `${fullName} ${values.middle_name}`;
        // }
        // if (values.last_name) {
        //   fullName = `${fullName} ${values.last_name}`;
        // }
        const panAadharLinkObj = {
          pan: panNo,
          aadhar_number: aadharNo,
          name: panValidityStatus?.full_name
        };
        const linkingStatus = await panAadharLinkStatus(panAadharLinkObj, setAlertShow);
        console.log('linking status ===>', linkingStatus);
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
      setIsLoading(false);
    }
  };

  const handleDynamicNomineeValidation = (values, setError) => {
    let response = false;
    if (moment().diff(moment(values.nominee_dob, 'YYYY-MM-DD'), 'years') < 18) {
      setError('nominee_dob', { type: 'custom', customMsg: 'Nominee age must be greater than or equal to 18 years' });
      response = true;
    }
    return response;
  };

  const udyamSendOtp = async (value) => {
    try {
      const {
        udyam_mobile_number, udyam_registration_number, first_name,
        middle_name,
        last_name
      } = value;
      if (!udyam_registration_number) {
        setAlertShow({ open: true, msg: 'Please enter Udyam Registration Number', alertType: 'error' });
        return;
      }
      if (!REGEX.UDYAMNUMBER.test(udyam_registration_number)) {
        setAlertShow({ open: true, msg: 'Please enter valid Udyam Registration Number', alertType: 'error' });
        return;
      }
      const customerName = first_name + middle_name + last_name;

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
          if (data?.fuzzy_score < 40) {
            setAlertShow({
              open: true,
              msg: 'Owner Name does not match with the Customer Name',
              alertType: 'error'
            });
          }
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
        failureResponse: 1
      };
    } catch (e) {
      console.log('Error', e);
      let errorMsg = 'Something went wrong. Please try again!';
      const apiResponse = e?.response?.data;
      if (apiResponse?.hasOwnProperty('success')) {
        if (apiResponse?.data?.hasOwnProperty('errors')) {
          // to handle null value
          if (apiResponse.data.errors?.[0]) {
            errorMsg = apiResponse.data.errors[0];
          }
        } else {
          errorMsg = apiResponse.message;
        }
      }
      const trimmedError = errorMsg.replace(/\s/g, '').toLowerCase();
      setAlertShow({
        open: true,
        msg: errorMsg,
        alertType: 'error'
      });
      if (['invalidinput', 'ownernamecannotbenull'].includes(trimmedError)) {
        if (trimmedError === 'invalidinput') {
          errorMsg = 'Udyam registration number is not valid, Unable to proceed further.';
        }
        return {
          success: false,
          errorMsg,
          failureResponse: 0
        };
      }
      return {
        success: false,
        failureResponse: 1
      };
    }
  };

  const rekycNextHandler = async (nextData) => {
    // const uf = [{
    //   name: 'id_proof_name',
    //   key: 'runonChange',
    //   value: false
    // }, {
    //   name: 'address_proof_name',
    //   key: 'runonChange',
    //   value: false
    // }, {
    //   name: 'address_proof_same_id_proof',
    //   key: 'runonChange',
    //   value: false
    // }];
    // const a = updateFieldDetailsHandler(
    //   uf,
    //   nextData.formData
    // );
    // nextData.setFormData(a);
    // return false;
    try {
      const {
        getValues,
        formData,
      } = nextData;
      const {
        first_name, middle_name, last_name, rekyc_first_name, rekyc_middle_name, rekyc_last_name,
        update_pan_details, pan_status
      } = getValues();
      const aadhaarStatusInput = formData.input.find((ele) => ele.name === 'aadhaarStatus');
      if (!aadhaarStatusInput.defaultValue || aadhaarStatusInput.defaultValue === 'INVALID') {
        setAlertShow({
          open: true,
          msg: 'Please verify Aadhaar Number to proceed further.',
          alertType: 'error'
        });
        return true;
      }
      if (update_pan_details === 'Yes') {
        if (!pan_status) {
          setAlertShow({
            open: true,
            msg: 'Please verify PAN to proceed further.',
            alertType: 'error'
          });
          return true;
        }
        if (pan_status !== 'VALID') {
          setAlertShow({
            open: true,
            msg: 'Please provide a valid PAN to proceed further.',
            alertType: 'error'
          });
          return true;
        }
      }
      const efirst_name = first_name ?? '';
      const emiddle_name = middle_name ? ` ${middle_name}` : '';
      const elast_name = last_name ? ` ${last_name}` : '';
      const erekyc_first_name = rekyc_first_name ?? '';
      const erekyc_middle_name = rekyc_middle_name ? ` ${rekyc_middle_name}` : '';
      const erekyc_last_name = rekyc_last_name ? ` ${rekyc_last_name}` : '';
      const previousValue = efirst_name + emiddle_name + elast_name;
      const updatedValue = erekyc_first_name + erekyc_middle_name + erekyc_last_name;
      const { data } = await fuzzyMatch(previousValue, updatedValue);
      if (data.data < 65) {
        setAlertShow({
          open: true,
          msg: 'There is a mismatch in Customer name. Unable to proceed further.',
          alertType: 'error'
        });
        return true;
      }
      const updateFields = [{
        name: 'id_proof_name',
        key: 'runonChange',
        value: false
      }, {
        name: 'address_proof_name',
        key: 'runonChange',
        value: false
      }, {
        name: 'address_proof_same_id_proof',
        key: 'runonChange',
        value: false
      }];
      const newFormData = updateFieldDetailsHandler(
        updateFields,
        nextData.formData
      );
      nextData.setFormData(newFormData);
      return false;
    } catch (err) {
      console.log(err);
      setAlertShow({
        open: true,
        msg: 'Something went wrong. Please try again.',
        alertType: 'error'
      });
      return false;
    }
  };

  const udyamValidateOtp = async (values) => {
    try {
      const {
        udyamOTP, udyam_registration_number, udyam_requestId, first_name,
        middle_name,
        last_name
      } = values;
      // const firstName = formData.first_name ?? '';
      // const middleName = formData.middle_name ? ` ${formData.middle_name}` : '';
      // const lastName = formData.last_name ? ` ${formData.last_name}` : '';
      const customerName = first_name + middle_name + last_name;

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
        if (data?.fuzzy_score < 40) {
          setAlertShow({
            open: true,
            msg: 'Owner Name does not match with the Customer Name',
            alertType: 'error'
          });
        }
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
      return {
        success: false,
        failureResponse: 1
      };
      // dispatch(resendReducer('VERIFIED'));
      // return {
      //   success: true,
      //   url: 'Loan/Ornament/2024/04/15/faa56bb9-f2e6-4631-9768-87f2b85f0acc.jpeg',
      //   // requestId: 'request ID fbabfdas'
      //   fuzzyScore: 89
      // };
    } catch (e) {
      console.log('Error', e);
      let errorMsg = 'Something went wrong. Please try again!';
      const apiResponse = e?.response?.data;
      if (apiResponse?.hasOwnProperty('success')) {
        if (apiResponse?.data?.hasOwnProperty('errors')) {
          // to handle null value
          if (apiResponse?.data?.errors?.[0]) {
            errorMsg = apiResponse.data.errors[0];
          }
        } else {
          errorMsg = apiResponse.message;
        }
      }
      const trimmedError = errorMsg.replace(/\s/g, '').toLowerCase();
      if (errorMsg === 'OTP_VERIFICATION_FAILED') {
        errorMsg = 'Invalid OTP. Please enter valid OTP.';
      }

      setAlertShow({
        open: true,
        msg: errorMsg,
        alertType: 'error'
      });
      if (['invalidinput', 'fuzzymatchscoreislow', 'ownernamecannotbenull'].includes(trimmedError)) {
        if (trimmedError === 'invalidinput') {
          errorMsg = 'Udyam registration number is not valid, Unable to proceed further.';
        }
        return {
          success: false,
          errorMsg,
          failureResponse: 0
        };
      }
      return {
        success: false,
        failureResponse: 1
      };
    }
  };

  const isPanMandatory = () => {
    if (userDetails.hasOwnProperty('pan_url')) {
      if (!userDetails.pan_url && userDetails.pan_no) {
        return true;
      }
      return false;
    } if (userDetails.pan_no) {
      return true;
    }
    return false;
  };

  const formConfiguration = {
    form: [
      customerHelperRef.current.isRekyc ? rekycDocumentStep({
        isPanMandatory,
        onChangeKycHandler,
        handleDynamicKYCValidation,
        panVerificationHandler,
        pincodeVerificationHandler,
        biometricComponent,
        aadhaarVerificationModeHandler,
        closeHandlerAadhaarVerificationHandler,
        biometricEnableHandler,
        aadhaarCardOtpHandler,
        aadhaarOTPVerificationHandler: rekycAadhaarOTPVerificationHandler,
        setRedirect,
        CONFIGURATION: configRes,
        nextHandler: rekycNextHandler,
        preFillIfExists,
        idProofListHandler,
	      onSaveClickHandlerID,
	      onDeleteHandlerId,
	      resetFormValues,
        onSaveClickHandlerAddress,
        userDetails
      })
        : kycDocumentStep({
          panVerificationHandler,
          pincodeVerificationHandler,
        }),
      personalInformationStep(),
      employmentInformationStep({
        udyamSendOtp, udyamValidateOtp, userDetails, annualIncomeHandler, customerOccupationHandler
      }),
      occupationAddressStep(),
      nomineeDetailsStep({
        handleDynamicNomineeValidation
      }),
      relationshipManagerStep(),
      bankDetailsStep({
        ifscDetailsHandler,
        userDetails,
        // bankAccountVerificationHandler,
        setAlertShow,
        customerHelperRef,
        poolingIntervalRef,
        bankDetailsReducer,
        nameMatchHandler,
        dispatch,
        setLoader,
        bankDetails
      }),
      sendOtpStep({
        otpMobileVerificationHandler,
        otpHandler
      }),
    ],
    stepper: {
      steps: ['KYC Documents', 'Personal Information', 'Employment Information', 'Occupation Address', 'Nominee Details', 'Relationship Manager', 'Bank Details', 'Send OTP'],
      icons: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
      hide: ['xs', 'sm'],
      stepperDirection: 'horizontal',
    },
    dataFomat: 'SINGLE',
  };

  const tempForm = cloneDeep(formConfiguration);

  console.log('userDetails', userDetails);

  tempForm.form.forEach((item, index) => item.input
    .forEach((inputValue, inputIndex) => {
      if (inputValue.name === 'nominee_dob') {
        tempForm.form[index].input[inputIndex].defaultValue = moment(userDetails[inputValue.name], 'DD-MM-YYYY').format('YYYY-MM-DD');
      } else if (inputValue.name === 'dob') {
        tempForm.form[index].input[inputIndex].defaultValue = moment(userDetails[inputValue.name], 'DD-MM-YYYY').format('DD/MM/YYYY');
      // } else if (inputValue.name === 'bankAccountVerificationStatus') {
      //   tempForm.form[index].input[inputIndex].defaultValue = userDetails?.is_bank_verified ? 'VALID' : 'INVALID';
      // } else if (inputValue.name === 'beneficiary_name') {
      //   tempForm.form[index].input[inputIndex].condition.isShow = userDetails.enter_bank_details === 'Yes';
      //   tempForm.form[index].input[inputIndex].defaultValue = userDetails[inputValue.name];
      } else if (inputValue.name === 'org_pan_no') {
        tempForm.form[index].input[inputIndex].defaultValue = userDetails.pan_no;
      } else if (inputValue.name === 'org_pan_cust_name') {
        tempForm.form[index].input[inputIndex].defaultValue = userDetails.pan_customer_name;
      } else if (inputValue.name === 'update_pan_details') {
        if (customerHelperRef.current.isRekyc) {
          tempForm.form[index].input[inputIndex].defaultValue = isPanMandatory() ? 'Yes' : 'No';
        } else {
          tempForm.form[index].input[inputIndex].defaultValue = 'No';
        }
      } else if (inputValue.name === 'pan_no') {
        if (isPanMandatory()) {
          tempForm.form[index].input[inputIndex].defaultValue = '';
        } else {
          tempForm.form[index].input[inputIndex].defaultValue = userDetails.pan_no;
        }
      } else if (inputValue.name === 'pan_url_preview') {
        tempForm.form[index].input[inputIndex].defaultValue = userDetails.pan_url;
      } else if (inputValue.name === 'is_gst_applicable') {
        tempForm.form[index].input[inputIndex].defaultValue = userDetails?.is_gst_applicable ? 'Yes' : 'No';
      } else if ([
        'Qrcode',
        'upi_ifsc',
        'upi_bank_name',
        'upi_branch_name',
        'upi_account_number',
        'confirmed_with_customer',
        'ifsc',
        'bank_name',
        'branch_name',
        'account_number',
        'beneficiary_name',
        'bankAccountVerificationStatus',
        'passbook_cheque_url',
        'proprietorship_proof'
      ].includes(inputValue.name)) {
        if (userDetails.enter_bank_details === 'Yes') {
          if ([
            'ifsc',
            'bank_name',
            'branch_name',
            'account_number',
            'beneficiary_name',
            'passbook_cheque_url',
            'proprietorship_proof'
          ].includes(inputValue.name)) {
            if (inputValue.name === 'account_number') {
              tempForm.form[index].input[inputIndex].status = true;
            }
            tempForm.form[index].input[inputIndex].condition.isShow = true;
            tempForm.form[index].input[inputIndex].defaultValue = userDetails[inputValue.name];
          }

          if (['passbook_cheque_url', 'proprietorship_proof'].includes(inputValue.name) && userDetails?.is_bank_verified === false) {
            tempForm.form[index].input[inputIndex].condition.isShow = true;
            tempForm.form[index].input[inputIndex].defaultValue = userDetails[inputValue.name];
          }

          if (inputValue.name === 'bankAccountVerificationStatus') {
            tempForm.form[index].input[inputIndex].defaultValue = userDetails?.is_bank_verified ? 'VALID' : 'INVALID';
          }
          if ([
            'upi_ifsc',
            'upi_bank_name',
            'upi_branch_name',
            'upi_account_number',
            'confirmed_with_customer',
          ].includes(inputValue.name)) {
            tempForm.form[index].input[inputIndex].condition.isShow = false;
          }
        } else if (userDetails.enter_bank_details === 'UPI') {
          if (['passbook_cheque_url', 'proprietorship_proof'].includes(inputValue.name)) {
            tempForm.form[index].input[inputIndex].condition.isShow = false;
            tempForm.form[index].input[inputIndex].defaultValue = userDetails[inputValue.name];
          }

          if ([
            'ifsc',
            'bank_name',
            'branch_name',
            'account_number',
            'passbook_cheque_url',
            'proprietorship_proof'
          ].includes(inputValue.name)) {
            tempForm.form[index].input[inputIndex].condition.isShow = false;
          }
          if (inputValue.name === 'bankAccountVerificationStatus') {
            tempForm.form[index].input[inputIndex].defaultValue = userDetails?.is_bank_verified ? 'VALID' : 'INVALID';
          }
          if ([
            'upi_ifsc',
            'upi_bank_name',
            'upi_branch_name',
            'upi_account_number',
            'confirmed_with_customer',
            'beneficiary_name',
            'confirmed_with_customer',
          ].includes(inputValue.name)) {
            const mapping = {
              upi_ifsc: 'ifsc',
              upi_bank_name: 'bank_name',
              upi_branch_name: 'branch_name',
              upi_account_number: 'account_number',
              confirmed_with_customer: 'confirmed_with_customer',
              beneficiary_name: 'beneficiary_name',
            };
            if (inputValue.name === 'confirmed_with_customer' && userDetails?.is_bank_verified) {
              tempForm.form[index].input[inputIndex].defaultValue = 'Yes';
            } else {
              tempForm.form[index].input[inputIndex].defaultValue = userDetails[mapping[inputValue.name]];
            }

            tempForm.form[index].input[inputIndex].condition.isShow = true;
          }
        } else {
          console.log('NO case hit');
        }
      } else {
        if (['id_proof_url', 'address_proof_url'].includes(inputValue.name)) {
          if (userDetails[inputValue.name]?.length) {
            const pathPreview = Array.isArray(userDetails[inputValue.name]) ? userDetails[inputValue.name]?.[0].split('.') : userDetails[inputValue.name].split('.');
            tempForm.form[index].input[inputIndex].isPreview = pathPreview[pathPreview.length - 1];
          }
        }
        if (inputValue.name === 'ocr_image_url' && userDetails[inputValue.name] && userDetails[inputValue.name]?.length) {
          tempForm.form[index].input[inputIndex].defaultValue = {
            aadhaarFront: userDetails[inputValue.name][0],
            aadhaarBack: userDetails[inputValue.name][1]
          };
        } else if (inputValue.name === 'id_proof_url' && userDetails[inputValue.name] && userDetails[inputValue.name]?.length) {
          if (Array.isArray(userDetails[inputValue.name])) {
            if (userDetails[inputValue.name].length === 2) {
              tempForm.form[index].input[inputIndex].defaultValue = {
                'ID Proof Front': userDetails[inputValue.name][0],
                'ID Proof Back': userDetails[inputValue.name][1]
              };
            } else {
              tempForm.form[index].input[inputIndex].defaultValue = {
                'ID Proof': userDetails[inputValue.name][0],
              };
            }
          } else {
            tempForm.form[index].input[inputIndex].defaultValue = {
              'ID Proof': userDetails[inputValue.name],
            };
          }
        } else if (inputValue.name === 'address_proof_url' && userDetails[inputValue.name] && userDetails[inputValue.name]?.length) {
          if (Array.isArray(userDetails[inputValue.name])) {
            if (userDetails[inputValue.name].length === 2) {
              tempForm.form[index].input[inputIndex].defaultValue = {
                'Address Proof Front': userDetails[inputValue.name][0],
                'Address Proof Back': userDetails[inputValue.name][1]
              };
            } else {
              tempForm.form[index].input[inputIndex].defaultValue = {
                'Address Proof': userDetails[inputValue.name][0],
              };
            }
          } else {
            tempForm.form[index].input[inputIndex].defaultValue = {
              'Address Proof': userDetails[inputValue.name],
            };
          }
        } else {
          tempForm.form[index].input[inputIndex].defaultValue = userDetails[inputValue.name];
        }
      }
    }));

  return tempForm;
};
