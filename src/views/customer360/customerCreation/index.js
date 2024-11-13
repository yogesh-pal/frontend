/* eslint-disable max-len */
/* eslint-disable camelcase */
import {
  useEffect, useMemo, useRef, useState
} from 'react';
import styled from '@emotion/styled';
import moment from 'moment';
import { cloneDeep } from 'lodash';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import jwtDecode from 'jwt-decode';
import {
  FormGenerator,
  MenuNavigation,
  DialogBox,
  ToastMessage,
} from '../../../components';
import {
  ContainerStyled,
  BreadcrumbsContainerStyled,
  BreadcrumbsWrapperContainerStyled,
  CenterContainerStyled,
  ButtonPrimary
} from '../../../components/styledComponents';
import { NAMEMAPPING } from './helper/constant';

import {
  formJsonDetails,
  posidexObject,
  formLoan,
  aadhaarMapping,
  NAVIGATION_DETAILS,
  saveCustomerDetailsRedux,
  AADHAARVERFICATIONMODE,
  VERIFICATIONKEY
} from './helper';
import {
  NAVIGATION, ROUTENAME, ROLE,
} from '../../../constants';
import { Service } from '../../../service';
import { errorMessageHandler } from '../../../utils';
import {
  bankDetailsReducer,
  aadhaarCardTimeStampReducer,
  fatherOrSpouseReducer,
  resendReducer,
  unmaskedAadhaarNoReducer
} from '../../../redux/reducer/customerCreation';
import { saveFormData } from '../../../redux/reducer/loanMaker';
import PageLoader from '../../../components/PageLoader';
import { customerConfigHandler, getAnnualIncome } from '../utils';
import { amlHandler } from '../utils/aml';

export const InformationShow = styled.p`
  padding: 10px;
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  text-align: center;
  color: #502a74ab;

`;

export const InformationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 0 35px

`;

const CustomerCreation = () => {
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [loader, setLoader] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const { userDetails } = useSelector((state) => state.user);
  const {
    bankDetails, fatherOrSpouse, unmaskedAadhaarNo
  } = useSelector((state) => state.customerCreation);
  const [formConfiguration, setFormConfiguration] = useState();
  const [customerId, setCustomerId] = useState('');
  const [formLoanConfiguration, setFormLoanConfiguration] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const navigate = useNavigate();
  const { ucic, customerID } = useParams();
  const dispatch = useDispatch();
  const poolingIntervalRef = useRef(null);
  const customerHelperRef = useRef({
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
    customerConfig: {},
    isBankAccountDuplicate: false
  });
  const navigationDetails = useMemo(() => NAVIGATION_DETAILS, [NAVIGATION]);

  const amlValidateHandler = async (obj, unmaskedAadhar) => {
    try {
      const amlDetails = { pdf_aml_path: '' };

      const { isSuccess, token, message } = await amlHandler(obj, unmaskedAadhar);
      if (!isSuccess) {
        return { success: false, amlMessage: message };
      }
      amlDetails.token = token;
      const tokenDecode = jwtDecode(token);

      if (tokenDecode?.is_aml_positive) {
        return { success: false, amlMessage: message };
      }

      // if (!tokenDecode?.pdf_url?.trim()) {
      //   return { success: true, path: '', token };
      // }

      // const uploadDetails = await uploadFileHandler(tokenDecode.pdf_url);
      // if (!uploadDetails?.isSuccess) {
      //   return { success: false, amlMessage: uploadDetails?.message };
      // }
      // amlDetails.pdf_aml_path = uploadDetails.path;
      obj.aml_details = amlDetails;
      return { success: true, token };
    } catch (err) {
      return { success: false, amlMessage: 'Something went wrong!' };
    }
  };

  const createCustomerHandler = async (obj) => {
    try {
      if (['Yes', 'UPI'].includes(obj.enter_bank_details)) {
        obj.is_bank_verified = bankDetails?.is_bank_verified;
        if (!bankDetails?.is_bank_verified) {
          obj.approval_status = 'Pending';
        }
      } else {
        obj.is_bank_verified = false;
      }

      if (['Yes', 'UPI'].includes(obj.enter_bank_details) && bankDetails?.is_bank_verified) {
        obj.fuzzy_match_status = bankDetails?.fuzzy_match_status;
        if (bankDetails?.fuzzy_match_status < 70) {
          obj.approval_status = 'Pending';
        }
      }

      if (customerID) {
        obj.customer_id = customerID;
      }
      const vatCode = obj.encoded_aadhar;
      delete obj.encoded_aadhar;

      const { status, data } = await Service.post(process.env.REACT_APP_CUSTOMER_CREATION, obj, {
        vatcode: vatCode
      });

      if (status === 200) {
        const customerInfo = cloneDeep(obj);
        saveCustomerDetailsRedux(dispatch, saveFormData, customerInfo, data);
        setCustomerId(data?.data?.customer_id);
        setFormLoanConfiguration(cloneDeep(formLoan(data?.data?.customer_id, obj?.ucic)));
        setIsOpenModal(true);
        setAlertShow({
          open: true,
          msg: 'Customer created successfully',
          alertType: 'success'
        });
      } else {
        const msg = errorMessageHandler(data.errors);
        setAlertShow({
          open: true,
          msg: msg || 'Customer creation API failed. Try again.',
          alertType: 'error'
        });
      }
      setIsLoading(false);
    } catch (e) {
      const data = e.response;
      const msg = data?.data && errorMessageHandler(data.data.errors);
      if (e?.response?.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      } else {
        setAlertShow({
          open: true,
          msg: msg || 'Customer creation API failed. Try again.',
          alertType: 'error'
        });
      }
      setIsLoading(false);
      console.log('Error', e);
    }
  };

  const validateUser = async (mobileNumber) => {
    try {
      const { status } = await Service.get(`${process.env.REACT_APP_CUSTOMER_CREATION}/search?primary_mobile_number=${mobileNumber}`);
      if (status === 200) {
        return {
          valid: true,
          message: 'User already exist with the given primary number'
        };
      }
      return {
        valid: false,
        message: ''
      };
    } catch (e) {
      return {
        valid: e?.response?.status !== 404,
        message: 'Some problem occur while creating the user.'
      };
    }
  };

  const formHandler = async (formValues) => {
    try {
      setIsLoading(true);
      const details = cloneDeep(formValues);

      // details.annual_income = details.customer_occupation === 'Salaried' ? formValues.annual_income_salaried : formValues.annual_income_self_salaried;
      details.annual_income = getAnnualIncome(formValues);

      if (details?.aadhaar_verification_mode !== AADHAARVERFICATIONMODE.OFFLINE) {
        delete details.aadhaar_osv_done;
        delete details?.pincodeOnline;
      }

      if (details?.aadhaar_verification_mode === 'Offline') {
        delete details.pincode;
      }

      if (details.passbook_cheque_url === null) {
        delete details.passbook_cheque_url;
      }

      if (details.proprietorship_proof === null) {
        delete details.proprietorship_proof;
      }

      delete details.enter_pan_details;

      if (details.current_address_same_as_permanent === 'Yes') {
        delete details?.current_address_1;
        delete details.current_address_2;
        delete details.current_pincode;
        delete details.current_city;
        delete details.current_state;
        delete details.current_address_proof_url;
      }

      if (details.psl_status === 'No') {
        delete details.psl_category;
      }

      if (details.customer_occupation === 'Salaried') {
        delete details.psl_status;
        delete details.psl_category;
      }

      if (details.occupation_address === 'No') {
        delete details.occupation_address_1;
        delete details.occupation_address_2;
        delete details.occupation_pincode;
        delete details.occupation_city;
        delete details.occupation_state;
        delete details.occupation_city;
      }

      if (!(details.nominee_relationship === 'Other')) {
        delete details.nominee_other_relation;
      }

      if (details.enter_bank_details === 'No') {
        delete details.ifsc;
        delete details.bank_name;
        delete details.branch_name;
        delete details.account_number;
        delete details.beneficiary_name;
        delete details.passbook_cheque_url;
        delete details.proprietorship_proof;
      } else if (details.enter_bank_details === 'UPI') {
        details.ifsc = details.upi_ifsc;
        details.bank_name = details.upi_bank_name;
        details.branch_name = details.upi_branch_name;
        details.account_number = details.upi_account_number;
        delete details.passbook_cheque_url;
        delete details.proprietorship_proof;
      }

      delete details.bankAccountVerificationStatus;
      delete details.OTPVerificationStatus;
      delete details.panStatus;
      delete details.activeAddMore;
      delete details.activeFormIndex;
      delete details.annual_income_salaried;
      delete details.annual_income_self_salaried;
      delete details.annual_income_agriculturist;
      delete details.annual_income_homemaker;
      delete details.annual_income_student;
      delete details.annual_income_unemployed;

      if (details?.city) {
        details.city = details.city.toUpperCase();
      }

      if (details?.current_city) {
        details.current_city = details.current_city.toUpperCase();
      }

      if (details?.occupation_city) {
        details.occupation_city = details.occupation_city.toUpperCase();
      }

      if (details?.state) {
        details.state = details.state.toUpperCase();
      }

      if (details?.current_state) {
        details.current_state = details.current_state.toUpperCase();
      }

      if (details?.occupation_state) {
        details.occupation_state = details.occupation_state.toUpperCase();
      }

      if (!details.email_id) {
        delete details.email_id;
      }

      if (details?.proprietorship_proof) {
        details.proprietorship_proof = [details.proprietorship_proof];
      }

      const currentTime = new Date();
      const uniquiId = parseInt(currentTime.getTime() / 1000, 10);

      const unmaskedAadhar = details?.aadhaar_verification_mode === 'Offline' ? details.aadharCardOffline : unmaskedAadhaarNo;
      // const unmaskedAadhar = unmaskedAadhaarNo;
      let encodedAadhar = '';
      // eslint-disable-next-line no-plusplus
      for (let ind = 0; ind < unmaskedAadhar.length; ind++) {
        encodedAadhar += aadhaarMapping[unmaskedAadhar[ind]];
      }
      encodedAadhar = (encodedAadhar.padStart(18, 't#Lw=+')).padEnd(24, '(*@8g5)');
      const AADHAARMAAPING = {
        [AADHAARVERFICATIONMODE.BIOMETRIC]: details?.aadharCardBiometric?.slice(-4),
        [AADHAARVERFICATIONMODE.OFFLINE]: details?.aadharCardOffline?.slice(-4),
        [AADHAARVERFICATIONMODE.ONLINE]: details?.aadharCardOnline?.slice(-4)
      };
      const tempAadhaarCard = AADHAARMAAPING[details?.aadhaar_verification_mode];

      if (details?.id_proof_name === 'Aadhaar Card') {
        details.id_proof_number = tempAadhaarCard.padStart(12, 'X');
      }

      if (details?.address_proof_name === 'Aadhaar Card') {
        details.address_proof_number = tempAadhaarCard.padStart(12, 'X');
      }

      if (details?.middle_name && details?.middle_name === 'NA') {
        details.middle_name = null;
      }
      const idProofPathArray = Array.isArray(details?.id_proof_url) ? details?.id_proof_url : Object.values(details?.id_proof_url);

      const addressProofPathArray = Array.isArray(details?.address_proof_url)
        ? details?.address_proof_url : Object.values(details?.address_proof_url);

      // Object.keys(details).forEach((ele) => {
      //   if (ele.includes('id_proof_url') && details[ele] && !Array.isArray(details?.id_proof_url)) {
      //     idProofPathArray.push(details[ele]);
      //     delete details[ele];
      //   }
      //   if (ele !== 'current_address_proof_url' && ele.includes('address_proof_url') && details[ele] && !Array.isArray(details?.address_proof_url)) {
      //     addressProofPathArray.push(details[ele]);
      //     delete details[ele];
      //   }
      // });

      details.is_gst_applicable = details?.is_gst_applicable === 'Yes';
      if (!details.is_gst_applicable) {
        delete details.customer_gst_number;
      }

      const aadhaar_verification_timestamp = parseInt(customerHelperRef?.current?.verificationTimeStamp?.[details?.aadhaar_verification_mode]?.[VERIFICATIONKEY.VERIFICATIONEND], 10) || uniquiId;
      const aadhaar_initiate_timestamp = parseInt(customerHelperRef?.current?.verificationTimeStamp?.[details?.aadhaar_verification_mode]?.[VERIFICATIONKEY.VERIFICATIONSTART], 10) || uniquiId;

      const obj = {
        ...details,
        aadhaar_verification_timestamp,
        aadhaar_initiate_timestamp,
        aadhaar_no: tempAadhaarCard.padStart(12, 'X'),
        pan_no: details?.pancardNumberOnline,
        nominee_dob: moment(details.nominee_dob).format('DD-MM-YYYY'),
        dob: moment(details.dob).format('DD-MM-YYYY'),
        pincode: [AADHAARVERFICATIONMODE.BIOMETRIC, AADHAARVERFICATIONMODE.ONLINE].includes(details?.aadhaar_verification_mode) ? details?.pincode : details?.pincodeOnline,
        created_by: userDetails.empCode,
        requester: userDetails.empCode,
        updated_by: userDetails.empCode,
        verification_request_date: moment().format('DD-MM-YYYY'),
        approval_status: 'NA',
        encoded_aadhar: encodedAadhar,
        id_proof_url: idProofPathArray,
        address_proof_url: addressProofPathArray,
        customer_id: null,
        bank_verification_entity: customerHelperRef?.current?.bankVerificationMode || '',
      };

      if (details?.aadhaar_verification_mode === AADHAARVERFICATIONMODE.BIOMETRIC) {
        obj.aadhaar_no = details?.aadharCardBiometric;
        obj.ekyc_biometric_request_id = customerHelperRef?.current?.biometricDetails?.id;
        obj.aadhaar_reference_number = customerHelperRef?.current?.biometricDetails?.aadhaar_reference_number;
      }

      if (details?.aadhaar_verification_mode === AADHAARVERFICATIONMODE.OFFLINE) {
        obj.ocr_image_url = [details?.ocr?.aadhaarFront, details?.ocr?.aadhaarBack];
      }

      const response = await validateUser(obj.primary_mobile_number);

      if (response.valid) {
        setAlertShow({
          open: true,
          msg: response.message,
          alertType: 'error'
        });
        setIsLoading(false);
        return;
      }

      if (customerHelperRef.current.customerConfig?.aml) {
        const { success, amlMessage } = await amlValidateHandler(obj, unmaskedAadhar);

        if (!success) {
          setAlertShow({
            open: true,
            msg: amlMessage,
            alertType: 'error'
          });
          setIsLoading(false);
          return;
        }
      }

      if (ucic?.length) {
        obj.ucic = ucic;
        createCustomerHandler(obj);
        return;
      }

      try {
        const posidexObj = posidexObject(obj, fatherOrSpouse);
        const { data } = await Service.post(process.env.REACT_APP_SEARCH_POSIDEX, posidexObj);

        if (data?.POSIDEX_GENERATED_UCIC !== '0') {
          obj.ucic = data?.POSIDEX_GENERATED_UCIC;
        }

        if (data?.CUSTOMER_MATCH_COUNT > 0 && data?.POSIDEX_GENERATED_UCIC === '0') {
          obj.ucic = data?.CUSTOMER_MATCHES[0]?.UCIC;
        }
        createCustomerHandler(obj);
      } catch (e) {
        createCustomerHandler(obj);
        console.log('Error', e);
      }
    } catch (e) {
      console.log('Error', e);
      if (e?.response?.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      } else {
        setAlertShow({
          open: true,
          msg: 'Customer creation failed. Try again.',
          alertType: 'error'
        });
      }
      setIsLoading(false);
    }
  };

  const prefilledValue = async () => {
    try {
      if (!customerID) return;

      const { data } = await Service.post(`${process.env.REACT_APP_CUSTOMER_PREFILLED}`, { customer_id: customerID });
      return data?.data || {};
    } catch (err) {
      console.log(err);
    }
  };

  const relationShipMangerDetailsHandler = async () => {
    try {
      const configResponse = customerConfigHandler();
      const { status, data } = await Service.get(`${process.env.REACT_APP_USER_LIST}?branch_code=${userDetails?.selectedBranch}&func_des=${ROLE.RO},${ROLE.SRO},${ROLE.BM},${ROLE.ABM},${ROLE.GV}&page_size=10000&source=1&is_active=1`);
      const configDetails = await configResponse;
      customerHelperRef.current.customerConfig = configDetails;
      if (status === 200 && data?.results.length) {
        const rmInfoArray = [];
        data?.results?.forEach((item) => {
          rmInfoArray.push({
            rm_code: item?.emp_code,
            rm_name: item?.emp_name,
            rm_mobile: item?.mobile
          });
        });
        let customerDetails = {};
        if (customerID) {
          customerDetails = await prefilledValue();
          const { full_name } = customerDetails;
          const tempCustomerDetails = full_name.split(' ');
          const [first_name] = tempCustomerDetails;
          customerDetails.first_name = first_name;
          customerDetails.middle_name = tempCustomerDetails.slice(1, -1).join(' ');
          customerDetails.last_name = tempCustomerDetails[tempCustomerDetails.length - 1];
        }
        setFormConfiguration(cloneDeep(formJsonDetails({
          setLoader,
          setAlertShow,
          relationShipManagerDetails: rmInfoArray,
          dispatch,
          bankDetailsReducer,
          aadhaarCardTimeStampReducer,
          fatherOrSpouseReducer,
          resendReducer,
          unmaskedAadhaarNoReducer,
          customerDetails,
          setRedirect,
          customerID,
          setIsLoading,
          poolingIntervalRef,
          errorMessageHandler,
          customerHelperRef,
          bankDetails,
          CONFIGURATION: configDetails
        })));
        return;
      }
      setAlertShow({
        open: true,
        msg: 'Relationship manager details not found.',
        alertType: 'error'
      });
    } catch (e) {
      console.log('Error', e);
      const data = e.response;
      const msg = data?.data && errorMessageHandler(data.data.error);
      if (e?.response?.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      } else {
        setAlertShow({
          open: true,
          msg: msg || 'Relationship manager API failed. Try again.',
          alertType: 'error'
        });
      }
      console.log('Error', e);
    }
  };

  const loanAmountHandler = (values) => {
    try {
      setIsOpenModal(false);
      navigate(`${ROUTENAME.loanCreationMaker}?customer-id=${customerId}&loan-amount=${values.loanAmount}`, { replace: true });
    } catch (e) {
      console.log('Error', e);
    }
  };

  const closeModelHandler = () => {
    try {
      setIsOpenModal(false);
      navigate(ROUTENAME.customerSearch, { replace: true });
    } catch (e) {
      console.log('Error', e);
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

  const updateCustomerGoldhandler = () => {
    try {
      const { customer_id } = redirect;
      setFormConfiguration('');
      navigate(`${NAVIGATION.customerCreation}/update/${customer_id}`);
      closeRedirectModelHandler();
    } catch (e) {
      console.log('Error', e);
    }
  };

  useEffect(() => {
    dispatch(unmaskedAadhaarNoReducer(''));
    relationShipMangerDetailsHandler();
    setLoader(false);
  }, [ucic, customerID]);
  return (
    formConfiguration ? (
      <>
        {loader ? <PageLoader /> : null}
        <DialogBox
          width='500px'
          isOpen={redirect?.isRedirect}
          handleClose={closeRedirectModelHandler}
          title='Information'
        >
          <InformationContainer>
            <InformationShow>{redirect?.message || 'Information Already Present for customer'}</InformationShow>
            {
              redirect?.source === NAMEMAPPING.FLEXCUBE && redirect?.customer_id && (
                <ButtonPrimary onClick={updateCustomerGoldhandler}>REDIRECT TO EDIT</ButtonPrimary>
              )
            }
          </InformationContainer>
        </DialogBox>
        <DialogBox
          width='500px'
          isOpen={isOpenModal}
          handleClose={closeModelHandler}
          title='Loan Amount'
        >
          {
            formLoanConfiguration && (
              <FormGenerator
                formDetails={formLoanConfiguration}
                formHandler={loanAmountHandler}
              />
            )
          }
        </DialogBox>
        <BreadcrumbsWrapperContainerStyled>
          <BreadcrumbsContainerStyled>
            <MenuNavigation navigationDetails={navigationDetails} />
          </BreadcrumbsContainerStyled>
        </BreadcrumbsWrapperContainerStyled>
        <ContainerStyled padding='0 !important'>
          <FormGenerator
            formDetails={formConfiguration}
            setFormDetails={setFormConfiguration}
            formHandler={formHandler}
            alertShow={alertShow}
            setAlertShow={setAlertShow}
            isLoading={isLoading}
          />
        </ContainerStyled>
      </>
    )
      : (
        <>
          <ToastMessage
            alertShow={alertShow}
            setAlertShow={setAlertShow}
          />
          <CenterContainerStyled padding='40px'>
            <CircularProgress color='secondary' />
          </CenterContainerStyled>
        </>
      )
  );
};

export default CustomerCreation;
