import React, { useEffect, useRef, useState } from 'react';
/* eslint-disable camelcase */
/* eslint-disable max-len */
/* eslint-disable no-unreachable */
import moment from 'moment';
import { CircularProgress } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { cloneDeep } from 'lodash';
import FormGenerator from '../../../components/formGenerator';
import { CenterContainerStyled, ContainerStyled } from '../../../components/styledComponents';
import PageLoader from '../../../components/PageLoader';
import { Service } from '../../../service';
import { customerConfigHandler } from '../../customer360/utils';
import {
  bankDetailsReducer, aadhaarCardTimeStampReducer, fatherOrSpouseReducer, resendReducer, unmaskedAadhaarNoReducer
} from '../../../redux/reducer/customerCreation';
import { errorMessageHandler } from '../../../utils';
import { editFormJsonDetails } from '../../customer360/customerSearch/helper';
import { DialogBox } from '../../../components';
import { InformationContainer, InformationShow } from '../../customer360/customerCreation';
import { AADHAARVERFICATIONMODE, VERIFICATIONKEY } from '../../customer360/customerCreation/helper';

const rekyc = ({
  customerId, setIsOpen, setAlertShow, fetchKYCStatus
}) => {
  const [pageLoading, setPageLoading] = useState(true);
  const [loader, setLoader] = useState(false);
  const [currentUserDetails, setCurrentUserDetails] = useState();
  const [formConfiguration, setFormConfiguration] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const { userDetails } = useSelector((state) => state.user);
  const {
    bankDetails
  } = useSelector((state) => state.customerCreation);
  const dispatch = useDispatch();
  console.log(currentUserDetails);
  const poolingIntervalRef = useRef(null);
  const customerHelperRef = useRef({
    isRekyc: true,
    payment: 0,
    biometricDetails: {},
    failureDetails: {
      [AADHAARVERFICATIONMODE.BIOMETRIC]: 0,
      [AADHAARVERFICATIONMODE.OFFLINE]: 0,
      [AADHAARVERFICATIONMODE.ONLINE]: 0,

    },
    verificationTimeStamp: {
      [AADHAARVERFICATIONMODE.BIOMETRIC]: {
        [VERIFICATIONKEY.VERIFICATIONSTART]: 0,
        [VERIFICATIONKEY.VERIFICATIONEND]: 0,
      },
      [AADHAARVERFICATIONMODE.OFFLINE]: {
        [VERIFICATIONKEY.VERIFICATIONSTART]: 0,
        [VERIFICATIONKEY.VERIFICATIONEND]: 0,
      },
      [AADHAARVERFICATIONMODE.ONLINE]: {
        [VERIFICATIONKEY.VERIFICATIONSTART]: 0,
        [VERIFICATIONKEY.VERIFICATIONEND]: 0,
      }
    },
    bankVerificationMode: '',
    enableBiometricReference: null,
    ONLINEOTPSEND: 0,
    customerConfig: {}
  });

  const updateCustomerDetailsHandler = async (formValues) => {
    try {
      setLoader(true);
      const currentTime = new Date();
      const uniquiId = parseInt(currentTime.getTime() / 1000, 10);
      const aadhaar_verification_timestamp = parseInt(customerHelperRef?.current?.verificationTimeStamp?.[formValues?.aadhaar_verification_mode]?.[VERIFICATIONKEY.VERIFICATIONEND], 10) || uniquiId;
      const aadhaar_initiate_timestamp = parseInt(customerHelperRef?.current?.verificationTimeStamp?.[formValues?.aadhaar_verification_mode]?.[VERIFICATIONKEY.VERIFICATIONSTART], 10) || uniquiId;
      const obj = {
        aadhaar_verification_timestamp,
        aadhaar_initiate_timestamp,
        aadhaar_verification_mode: formValues.aadhaar_verification_mode,
        customer_id: currentUserDetails.customer_id,
        address_1: formValues.address_1,
        address_2: formValues.address_2,
        pincode: formValues.pincode,
        city: formValues.city,
        state: formValues.state,
        nominee_relationship: formValues.nominee_relationship,
        nominee_name: formValues.nominee_name,
        nominee_dob: moment(formValues.nominee_dob, 'YYYY-MM-DD').format('DD-MM-YYYY'),
        nominee_mobile: formValues.nominee_mobile,
        secondary_mobile_number: formValues.secondary_mobile_number,
        current_address_same_as_permanent: formValues.current_address_same_as_permanent,
        religion: formValues.religion,
        mother_name: formValues.mother_name,
        father_name: formValues.father_name,
        social_status: formValues.social_status,
        place_of_birth: formValues.place_of_birth,
        is_gst_applicable: formValues.is_gst_applicable === 'Yes',
        customer_gst_number: formValues.is_gst_applicable === 'Yes' ? formValues.customer_gst_number : null,
        bank_verification_entity: customerHelperRef?.current?.bankVerificationMode || '',
        address_proof_same_id_proof: formValues.address_proof_same_id_proof,
      };
      const idProofPathArray = Array.isArray(formValues?.id_proof_url) ? formValues?.id_proof_url : Object.values(formValues?.id_proof_url);
      const addressProofPathArray = Array.isArray(formValues?.address_proof_url) ? formValues?.address_proof_url : Object.values(formValues?.address_proof_url);

      if (formValues.aadhaar_verification_mode === AADHAARVERFICATIONMODE.ONLINE) {
        obj.id_proof_name = formValues.id_proof_name;
        obj.id_proof_url = idProofPathArray;
        obj.id_proof_number = formValues.id_proof_number;
        obj.id_proof_remarks = formValues.id_proof_remarks;
        obj.id_proof_osv_done = formValues.id_proof_osv_done;
        obj.address_proof_name = formValues.address_proof_name;
        obj.address_proof_url = addressProofPathArray;
        obj.address_proof_number = formValues.address_proof_number;
        obj.address_proof_remarks = formValues.address_proof_remarks;
        obj.address_proof_osv_done = formValues.address_proof_osv_done;
      } else {
        obj.ekyc_biometric_request_id = customerHelperRef?.current?.biometricDetails?.id;
        obj.id_proof_name = formValues.id_proof_name;
        obj.id_proof_url = idProofPathArray;
        obj.id_proof_number = formValues.id_proof_number;
        obj.address_proof_name = formValues.address_proof_name;
        obj.address_proof_url = addressProofPathArray;
        obj.address_proof_number = formValues.address_proof_number;
        obj.address_proof_remarks = formValues.address_proof_remarks;
        obj.address_proof_osv_done = formValues.address_proof_osv_done;
      }

      if (currentUserDetails?.primary_mobile_number !== formValues?.primary_mobile_number) {
        obj.primary_mobile_number = formValues.primary_mobile_number;
      }

      if (formValues?.nominee_relationship === 'Other') {
        obj.nominee_other_relation = formValues.nominee_other_relation;
      }

      if (formValues.current_address_same_as_permanent === 'No') {
        obj.current_address_same_as_permanent = formValues.current_address_same_as_permanent;
        obj.current_address_1 = formValues.current_address_1;
        obj.current_address_2 = formValues.current_address_2;
        obj.current_pincode = formValues.current_pincode;
        obj.current_city = formValues.current_city.toUpperCase();
        obj.current_state = formValues.current_state.toUpperCase();
        obj.current_address_proof_url = formValues.current_address_proof_url;
      } else {
        obj.current_address_same_as_permanent = formValues.current_address_same_as_permanent;
        obj.current_address_1 = formValues.address_1;
        obj.current_address_2 = formValues.address_2;
        obj.current_pincode = formValues.pincode;
        obj.current_city = formValues.city.toUpperCase();
        obj.current_state = formValues.state.toUpperCase();
        obj.current_address_proof_url = addressProofPathArray;
      }
      const passUrl = formValues.passbook_cheque_url ?? '';

      if (formValues.enter_bank_details === 'No') {
        obj.enter_bank_details = formValues.enter_bank_details;
      }

      if (formValues.enter_bank_details === 'Yes' && (currentUserDetails?.ifsc !== formValues.ifsc
        || currentUserDetails?.bank_name !== formValues.bank_name
        || currentUserDetails?.branch_name !== formValues.branch_name
        || currentUserDetails?.account_number !== formValues.account_number
        || currentUserDetails?.beneficiary_name !== formValues.beneficiary_name
        || currentUserDetails?.passbook_cheque_url !== passUrl)) {
        obj.ifsc = formValues.ifsc;
        obj.bank_name = formValues.bank_name;
        obj.branch_name = formValues.branch_name;
        obj.account_number = formValues.account_number;
        obj.passbook_cheque_url = passUrl;
        obj.enter_bank_details = formValues.enter_bank_details;
        obj.beneficiary_name = formValues.beneficiary_name;
      }

      if (formValues.enter_bank_details === 'UPI' && (currentUserDetails?.ifsc !== formValues.upi_ifsc
        || currentUserDetails?.bank_name !== formValues.upi_bank_name
        || currentUserDetails?.branch_name !== formValues.upi_branch_name
        || currentUserDetails?.account_number !== formValues.upi_account_number
        || currentUserDetails?.beneficiary_name !== formValues.beneficiary_name)) {
        obj.ifsc = formValues.upi_ifsc;
        obj.bank_name = formValues.upi_bank_name;
        obj.branch_name = formValues.upi_branch_name;
        obj.account_number = formValues.upi_account_number;
        obj.enter_bank_details = formValues.enter_bank_details;
        obj.beneficiary_name = formValues.beneficiary_name;
      }

      if (['Yes', 'UPI'].includes(obj.enter_bank_details)) {
        obj.is_bank_verified = bankDetails?.is_bank_verified;
        if (!bankDetails?.is_bank_verified) {
          obj.approval_status = 'Pending';
        }
      }

      if (['Yes', 'UPI'].includes(obj.enter_bank_details) && bankDetails?.is_bank_verified) {
        obj.fuzzy_match_status = bankDetails?.fuzzy_match_status;
        if (bankDetails?.fuzzy_match_status < 70) {
          obj.approval_status = 'Pending';
        }
      }

      if (['Yes', 'UPI'].includes(obj.enter_bank_details) && !bankDetails?.is_bank_verified) {
        obj.fuzzy_match_status = 69;
        obj.approval_status = 'Pending';
      }
      if (formValues.update_pan_details === 'Yes' && formValues.pan_status === 'VALID') {
        obj.pan_no = formValues.pan_no;
        obj.pan_customer_name = formValues.pan_customer_name;
        obj.pan_url = formValues.pan_url_edit;
      }
      if (currentUserDetails?.udyam_data?.reg_no) {
        const currentUdyamData = currentUserDetails?.udyam_data;
        const udyamData = {};
        udyamData.mode = currentUdyamData?.mode;
        udyamData.request_id = currentUdyamData?.request_id;
        udyamData.fuzzy_match_score = currentUdyamData?.fuzzy_match_score;
        udyamData.otp_verified_on = currentUdyamData?.otp_verified_on;
        udyamData.mobile_number = currentUdyamData?.mobile_number;
        udyamData.reg_no = currentUdyamData?.reg_no;
        udyamData.proof = currentUdyamData?.proof;
        obj.udyam_data = udyamData;
      } else if (formValues.udyam_fuzzy_score && formValues.udyam_fuzzy_score > 40
        && (formValues.udyam_certificate || formValues.udyam_certificate_postOTP)) {
        const udyamData = {};
        udyamData.mode = 'Online';
        udyamData.request_id = formValues.udyam_requestId;
        udyamData.fuzzy_match_score = formValues.udyam_fuzzy_score;
        udyamData.otp_verified_on = new Date().getTime();
        udyamData.mobile_number = formValues.udyam_mobile_number;
        udyamData.reg_no = formValues.udyam_registration_number;
        udyamData.proof = [formValues.udyam_certificate ?? formValues.udyam_certificate_postOTP];
        obj.udyam_data = udyamData;
      }
      obj.is_re_kyc = true;
      const { data, status } = await Service.put(process.env.REACT_APP_CUSTOMER_UPDATE, obj);
      if (status === 201) {
        setFormConfiguration('');
        setIsOpen(false);
        fetchKYCStatus();
        return;
      }

      const error = data.errors;
      setAlertShow({
        open: true,
        msg: error || 'Customer update API failed. Try again.',
        alertType: 'error'
      });
      setLoader(false);
    } catch (e) {
      const error = errorMessageHandler(e?.response?.data?.errors);
      setLoader(false);
      if (e?.response?.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      } else {
        setAlertShow({
          open: true,
          msg: error || 'Customer update API failed. Try again.',
          alertType: 'error'
        });
      }
      console.log('Error', e);
    }
  };

  const userDetailsHandler = async (custId) => {
    try {
      // setIsOpen(true);
      // serCustomerID(customerId);
      const [customerRes, configRes] = await Promise.all([Service.get(`${process.env.REACT_APP_USER_VIEW}?customer_id=${custId}&branch_code=${userDetails?.selectedBranch}&page_size=10000`),
        customerConfigHandler()]);
      console.log('user details handler', configRes);
      const { status, data } = customerRes;
      if (status === 200 && data?.data) {
        console.log('customer details', data.data);
        const aadharData = await Service.post(
          `${process.env.REACT_APP_CUSTOMER_SERVICE}/api/aadhar-vault-decode`,
          { reference: data.data.aadhaar_reference_number }
        );
        if (aadharData?.data?.data?.data?.Message === 'An error has occurred.') {
          setAlertShow({
            open: true,
            msg: 'Unable to get Aadhaar ID of the customer.',
            alertType: 'error'
          });
          setIsOpen(false);
          return;
        }
        const aadharNo = aadharData?.data?.data?.data?.id;
        setCurrentUserDetails(data.data);
        const finalObj = data.data;
        finalObj.aadhaar_verification_mode = AADHAARVERFICATIONMODE.ONLINE;
        // finalObj.aadharCardOnline = '801322407948';
        // finalObj.aadharCardBiometric = '801322407948';
        finalObj.aadharCardOnline = aadharNo;
        finalObj.aadharCardBiometric = aadharNo;
        console.log('final object', finalObj);
        if (data?.data?.udyam_data) {
          finalObj.udyam_registration_number = data.data?.udyam_data?.reg_no;
          finalObj.udyam_mobile_number = data.data?.udyam_data?.mobile_number;
          finalObj.udyam_requestId = data.data?.udyam_data?.request_id;
          finalObj.udyam_fuzzy_score = data.data?.udyam_data?.udyam_fuzzy_score;
          finalObj.udyam_verification_mode = data.data?.udyam_data?.fuzzy_match_score;
          finalObj.udyam_verified_on = data.data?.udyam_data?.otp_verified_on;
          if (data.data.udyam_data?.mode === 'Online') {
            finalObj.udyam_certificate = data.data.udyam_data?.proof;
          } else {
            finalObj.udyam_proof = data.data?.udyam_data?.proof;
          }
        }
        customerHelperRef.current.enter_bank_details = data?.data?.enter_bank_details;
        customerHelperRef.current.unmaskerAadhaar = aadharNo;
        customerHelperRef.current.addressDetails = {
          address1: finalObj.address_1,
          address2: finalObj.address_2,
          pincode: finalObj.pincode,
          city: finalObj.city,
          state: finalObj.state
        };
        console.log('final object values', finalObj);
        finalObj.address_proof_same_id_proof = finalObj.id_proof_name === finalObj.address_proof_name ? 'Yes' : 'No';
        setFormConfiguration(cloneDeep(editFormJsonDetails({
          setIsLoading,
          setAlertShow,
          dispatch,
          bankDetailsReducer,
          aadhaarCardTimeStampReducer,
          fatherOrSpouseReducer,
          userDetails: finalObj,
          resendReducer,
          customerHelperRef,
          unmaskedAadhaarNoReducer,
          poolingIntervalRef,
          setLoader,
          bankDetails,
          configRes,
          setRedirect
        })));
      }
    } catch (err) {
      console.log('Error', err);
      const error = errorMessageHandler(err?.response?.data?.errors);
      if (err?.response?.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      } else {
        setAlertShow({
          open: true,
          msg: error || 'Something went wrong while fetching details. Please Try again.',
          alertType: 'error'
        });
      }
      setIsOpen(false);
    }
  };

  const closeRedirectModelHandler = (event, reason) => {
    try {
      if (reason && reason === 'backdropClick') {
        return;
      }
      setRedirect({});
    } catch (e) {
      console.log('Error', e);
    }
  };

  useEffect(() => {
    userDetailsHandler(customerId);
  }, [customerId]);
  console.log(pageLoading, setPageLoading, useEffect, setLoader);
  return (
    <>
      { loader ? <PageLoader /> : null}
      <DialogBox
        width='500px'
        isOpen={redirect?.isRedirect}
        handleClose={closeRedirectModelHandler}
        title='Information'
      >
        <InformationContainer>
          <InformationShow>{redirect?.message || 'Information Already Present for customer'}</InformationShow>
        </InformationContainer>
      </DialogBox>
      <ContainerStyled>
        {
          formConfiguration ? (
            <>
              {isLoading ? <PageLoader /> : null}
              <FormGenerator
                formDetails={formConfiguration}
                formHandler={updateCustomerDetailsHandler}
                // isLoading={isLoading || (loading?.loader === true && loading?.name === 'SUBMIT')}
                isLoading={isLoading || loader}
              />
            </>
          ) : (
            <CenterContainerStyled padding='40px'>
              <CircularProgress color='secondary' />
            </CenterContainerStyled>
          )
        }

      </ContainerStyled>
    </>
  );
};

export default rekyc;
