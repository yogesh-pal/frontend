/* eslint-disable camelcase */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import {
  Fragment, useState, useRef, useMemo
} from 'react';
import jwtDecode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { Grid, CircularProgress, Container } from '@mui/material';
import { useForm } from 'react-hook-form';
import styled from '@emotion/styled';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import moment from 'moment';
import { cloneDeep } from 'lodash';
import { useSelector, useDispatch } from 'react-redux';
import store from '../../../redux/store';
import PageLoader from '../../../components/PageLoader';

import {
  ToastMessage,
  MenuNavigation,
  TableComponent,
  MultiToggleButton,
  ErrorText,
  DialogBox,
  FormGenerator
} from '../../../components';
import {
  ButtonPrimary,
  TextFieldStyled,
  CustomContainerStyled,
  LoadingButtonPrimary,
  BreadcrumbsWrapperContainerStyled,
  BreadcrumbsContainerStyled,
  HeadingMaster,
  HeaderContainer,
  ResetButton,
  ErrorMessageContainer,
  CenterContainerStyled,
  ContainerStyled
} from '../../../components/styledComponents';
import {
  columnFields, togglerGroup, navigationDetails, validation, formJsonDetails, editFormJsonDetails
} from './helper';
import { Service } from '../../../service';
import {
  bankDetailsReducer, aadhaarCardTimeStampReducer, fatherOrSpouseReducer, resendReducer
} from '../../../redux/reducer/customerCreation';
import { errorMessageHandler } from '../../../utils';
import { VARIABLE, NAVIGATION, PERMISSION } from '../../../constants';
import { useScreenSize } from '../../../customHooks';
import { throttleFunction } from '../../../utils/throttling';
import { customerConfigHandler, getAnnualIncome, occupationMapping } from '../utils';
import { REKYC_DUE, REKYC_NOTDUE } from '../../loanDisbursal/searchCustomer';

const CustomForm = styled('form')(({ width, flexDirection, justifyItems }) => ({
  width: width || '500px',
  display: 'flex',
  flexDirection,
  justifyItems
}));

export const InputWrapper = styled(Container)(({
  justifyContent, marginTop, flexDirection, height, padding
}) => ({
  display: 'flex',
  justifyContent,
  marginTop,
  flexDirection,
  height,
  padding,
}));
const disableDOBDates = (currentDate) => moment().diff(moment(currentDate), 'years') < 18;

const CustomerSearch = () => {
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [searchTitle, setSearchTitle] = useState('Customer ID');
  const [paramsValue, setParamsValue] = useState('customer_id');
  const [formDetails, setFormDetails] = useState();
  const [currentUserDetails, setCurrentUserDetails] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const [customerID, serCustomerID] = useState();
  const [formTitle, setFormTitle] = useState('');
  const [loader, setLoader] = useState(false);
  const [loading, setLoading] = useState({
    loader: true,
    name: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [dob, setDob] = useState('');
  const [formConfiguration, setFormConfiguration] = useState();
  const [isSearchDisabled, setIsSearchDisabled] = useState(false);
  const [searchDetails, setSearchDetails] = useState({
    data: [],
    rowCount: 0,
    pageNumber: 1,
    pageSize: 10
  });
  const poolingIntervalRef = useRef(null);
  const customerHelperRef = useRef({
    payment: 0,
    isBankAccountDuplicate: false
  });
  const {
    bankDetails
  } = useSelector((state) => state.customerCreation);
  const dispatch = useDispatch();
  const { userDetails } = useSelector((state) => state.user);
  const screen = useScreenSize();
  const loaderRef = useRef();

  const {
    register, handleSubmit, setValue, formState: { errors }, reset
  } = useForm();

  const navigate = useNavigate();

  const addCustomerhandler = () => {
    try {
      navigate(NAVIGATION.customerSearchPosidex);
    } catch (e) {
      console.log('Error', e);
    }
  };

  const updateCustomerGoldhandler = (cellValues) => {
    try {
      const { customer_id } = cellValues.row;
      navigate(`${NAVIGATION.customerCreation}/update/${customer_id}`);
    } catch (e) {
      console.log('Error', e);
    }
  };

  const fetchKYCDate = (lastKYCDateTime, reKYCDUEDate, cuidCreationDate) => {
    if (!cuidCreationDate) return 'NA';
    const cuidCreation = moment(cuidCreationDate * 1000);

    if (!reKYCDUEDate) {
      return cuidCreation.format('DD-MM-YYYY');
    }
    const rekycDueDate = moment(reKYCDUEDate * 1000);
    const today = moment();
    if (rekycDueDate.isSameOrBefore(today)) {
      return 'Pending Re-KYC';
    }
    if (!lastKYCDateTime) {
      return cuidCreation.format('DD-MM-YYYY');
    }
    const lastKYC = moment(lastKYCDateTime * 1000);
    return lastKYC.format('DD-MM-YYYY');
  };

  const searchDetailsHandler = async (pageNumber, pageSize, value, name) => {
    try {
      setLoading({
        loader: true,
        name
      });
      loaderRef.current = true;
      let url = `${process.env.REACT_APP_CUSTOMER_CREATION}/search?page=${pageNumber}&page_size=${pageSize}&fc=1`;
      if (paramsValue === 'full_name_dob') {
        url = `${url}&full_name=${value.full_name}&dob=${moment(value.dob, 'DD-MM-YYYY').format('DD/MM/YYYY')}`;
      } else {
        url = `${url}&${paramsValue}=${value?.toUpperCase()}`;
      }
      const { data, status } = await Service.get(url);
      if (status === 200) {
        const userDetail = data.data.results.map((item, index) => ({
          _id: index + 1,
          ...item,
          dob: moment(item.dob, 'DD-MM-YYYY').format('DD/MM/YYYY'),
          kyc_date: fetchKYCDate(item.last_kyc_date, item.re_kyc_due_date, item.customer_created_on),

        }));
        setSearchDetails((pre) => ({
          ...pre,
          data: userDetail || [],
          rowCount: data.data.count
        }));
        setLoading({
          loader: false,
          name: ''
        });
        return;
      }
      setSearchDetails({
        data: [],
        rowCount: 0,
        pageNumber: 1,
        pageSize: 10
      });
      setLoading({
        loader: false,
        name: ''
      });
    } catch (e) {
      const error = e?.response?.data?.errors?.detail;
      if (e?.response?.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      } else {
        setAlertShow({
          open: true,
          msg: error || 'Customer API failed. Try again.',
          alertType: 'error'
        });
      }
      setSearchDetails({
        data: [],
        rowCount: 0,
        pageNumber: 1,
        pageSize: 10
      });
      setLoading({
        loader: false,
        name: ''
      });
      console.log('Error', e);
    } finally {
      loaderRef.current = false;
    }
  };

  const onSearchSubmit = async (value) => {
    try {
      let val = '';
      setSearchDetails({
        data: [],
        rowCount: 0,
        pageNumber: 1,
        pageSize: 10
      });
      if (value.hasOwnProperty('full_name') && value.hasOwnProperty('dob')) {
        val = value;
      } else {
        val = value[paramsValue];
      }
      setFormDetails(val);
      throttleFunction(
        {
          args1: [1, searchDetails.pageSize, val, 'SEARCH'],
          function1: searchDetailsHandler
        },
        loaderRef,
        setIsSearchDisabled
      );
    } catch (e) {
      console.log('Error', e);
    }
  };

  const updateCustomerDetailsHandler = async (formValues) => {
    try {
      setLoading({
        loader: true,
        name: 'SUBMIT'
      });

      const obj = {
        customer_id: customerID,
        customer_occupation: formValues.customer_occupation,
        annual_income: getAnnualIncome(formValues),
        risk_rating: formValues.risk_rating,
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
      };

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
        obj.current_address_1 = '';
        obj.current_address_2 = '';
        obj.current_pincode = '';
        obj.current_city = '';
        obj.current_state = '';
        obj.current_address_proof_url = [];
      }
      const passUrl = formValues.passbook_cheque_url ?? '';
      let proprietorshipUrl;

      if (Array.isArray(formValues.proprietorship_proof)) {
        proprietorshipUrl = formValues.proprietorship_proof;
      } else if (formValues.proprietorship_proof != null) {
        proprietorshipUrl = [formValues.proprietorship_proof];
      } else {
        proprietorshipUrl = [];
      }

      if (formValues.enter_bank_details === 'No') {
        obj.enter_bank_details = formValues.enter_bank_details;
      }

      if (formValues.enter_bank_details === 'Yes' && (currentUserDetails?.ifsc !== formValues.ifsc
        || currentUserDetails?.bank_name !== formValues.bank_name
        || currentUserDetails?.branch_name !== formValues.branch_name
        || currentUserDetails?.account_number !== formValues.account_number
        || currentUserDetails?.beneficiary_name !== formValues.beneficiary_name
        || currentUserDetails?.passbook_cheque_url !== passUrl
        || currentUserDetails?.proprietorship_proof !== proprietorshipUrl)) {
        obj.ifsc = formValues.ifsc;
        obj.bank_name = formValues.bank_name;
        obj.branch_name = formValues.branch_name;
        obj.account_number = formValues.account_number;
        obj.passbook_cheque_url = passUrl;
        obj.proprietorship_proof = proprietorshipUrl;
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
      } else if (formValues.udyam_fuzzy_score && formValues.udyam_fuzzy_score > 40 && (formValues.udyam_certificate || formValues.udyam_certificate_postOTP)) {
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

      if (['Self Employed', 'Agriculturist'].includes(obj.customer_occupation)) {
        if (formValues.psl_status === 'No') {
          obj.psl_status = formValues.psl_status;
        } else {
          obj.psl_status = formValues.psl_status;
          obj.psl_category = formValues.psl_category;
        }
      } else {
        obj.psl_status = '';
        obj.psl_category = '';
      }

      const { data, status } = await Service.put(process.env.REACT_APP_CUSTOMER_UPDATE, obj);
      if (status === 201) {
        searchDetailsHandler(searchDetails?.pageNumber, searchDetails?.pageSize, formDetails, 'TABLE');
        setLoading({
          loader: false,
          name: ''
        });
        setFormConfiguration('');
        setIsOpen(false);
        return;
      }

      const error = data.errors;
      setAlertShow({
        open: true,
        msg: error || 'Customer update API failed. Try again.',
        alertType: 'error'
      });
      setLoading({
        loader: false,
        name: ''
      });
    } catch (e) {
      const error = errorMessageHandler(e?.response?.data?.errors);
      setLoading({
        loader: false,
        name: ''
      });
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

  const onPageSizeChange = (pageSize) => {
    try {
      setSearchDetails((pre) => ({
        ...pre,
        pageSize
      }));
      searchDetailsHandler(searchDetails.pageNumber, pageSize, formDetails, 'TABLE');
    } catch (e) {
      console.log(e);
    }
  };

  const onPageChange = (pageNumber) => {
    try {
      setSearchDetails((pre) => ({
        ...pre,
        pageNumber
      }));
      searchDetailsHandler(pageNumber, searchDetails.pageSize, formDetails, 'TABLE');
    } catch (e) {
      console.log(e);
    }
  };

  const searchResetHandler = () => {
    try {
      if (paramsValue === 'full_name_dob') {
        reset({ full_name: '', dob: '' });
        setDob(null);
      } else {
        reset({
          [paramsValue]: null
        });
      }

      setSearchDetails({
        data: [],
        rowCount: 0,
        pageNumber: 1,
        pageSize: 10
      });
      setFormConfiguration('');
    } catch (e) {
      console.log('Error', e);
    }
  };

  const seletedValueHandler = (value) => {
    try {
      console.log('value ----', value);
      setParamsValue(value);
      const searchTemp = togglerGroup.values.find((item) => item.value === value);
      setSearchTitle(searchTemp?.name);
      reset({
        [value]: null
      });
      setDob(null);
    } catch (e) {
      console.log('Error', e);
    }
  };

  const handleClose = () => {
    try {
      setIsOpen(false);
      setFormConfiguration('');
    } catch (e) {
      console.log('Error', e);
    }
  };

  const userDetailsHandler = async (mode, customerId) => {
    try {
      setIsOpen(true);
      serCustomerID(customerId);
      const [customerRes, configRes] = await Promise.all([Service.get(`${process.env.REACT_APP_USER_VIEW}?customer_id=${customerId}&branch_code=${userDetails?.selectedBranch}&page_size=10000`), customerConfigHandler()]);
      // const { status, data } = await Service.get(`${process.env.REACT_APP_USER_VIEW}?customer_id=${customerId}&branch_code=${userDetails?.selectedBranch}&page_size=10000`);
      const { status, data } = customerRes;
      if (status === 200 && data?.data) {
        setCurrentUserDetails(data.data);
        const finalObj = data.data;
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
        finalObj.proprietorship_proof = Array.isArray(data.data?.proprietorship_proof) ? data.data?.proprietorship_proof.toString() : data.data?.proprietorship_proof;

        // Fix for existing bug :- Dispatching the value of is_bank_verified and fuzzy_match_status when a record is opened

        if (finalObj.hasOwnProperty('is_bank_verified')) {
          dispatch(bankDetailsReducer({
            is_bank_verified: finalObj.is_bank_verified ?? false,
            fuzzy_match_status: finalObj.fuzzy_match_status ?? 0
          }));
        }

        if (mode === 'EDIT') {
          customerHelperRef.current.customer_id = customerId;
          customerHelperRef.current.enter_bank_details = data?.data?.enter_bank_details;
          if (customerRes?.data?.data?.customer_occupation && Object.keys(occupationMapping).includes(customerRes.data.data.customer_occupation)) {
            finalObj[occupationMapping[customerRes.data.data.customer_occupation]] = customerRes.data.data.annual_income;
          }
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
            poolingIntervalRef,
            setLoader,
            bankDetails,
            configRes
          })));
        } else {
          setFormConfiguration(cloneDeep(formJsonDetails(finalObj)));
        }
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

  const editCustomerDetailsHandler = (cellValues) => {
    try {
      setFormTitle('Update Customer Details');
      userDetailsHandler('EDIT', cellValues.row.customer_id);
      setIsOpen(true);
    } catch (e) {
      console.log('Error', e);
    }
  };

  const viewCustomerDetailsHandler = (cellValues) => {
    try {
      setFormTitle('Customer Details');
      userDetailsHandler('VIEW', cellValues.row.customer_id);
      setIsOpen(true);
    } catch (e) {
      console.log('Error', e);
    }
  };
  const state = store.getState();
  const decodedToken = jwtDecode(state.user.accessToken);
  const permissionsArray = decodedToken.permissions.split(',');

  const customerSearchColumns = useMemo(() => columnFields({
    viewCustomerDetailsHandler,
    editCustomerDetailsHandler,
    userDetails,
    updateCustomerGoldhandler
  }), [userDetails]);
  return (
    <>
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={navigationDetails} />
        </BreadcrumbsContainerStyled>
      </BreadcrumbsWrapperContainerStyled>
      <CustomContainerStyled padding='0px 0px 20px 0px !important'>
        <ToastMessage
          alertShow={alertShow}
          setAlertShow={setAlertShow}
        />
        <HeaderContainer item xs={12}>
          <HeadingMaster>
            Customer Search
          </HeadingMaster>
        </HeaderContainer>
        <HeaderContainer
          item
          xs={12}
          padding='0 20px 0px 20px'
          flexDirection={['xs', 'sm'].includes(screen) ? 'column-reverse' : 'row'}
          justifyItems={['xs', 'sm'].includes(screen) ? 'flex-end' : ''}
        >
          <CustomForm
            onSubmit={handleSubmit(onSearchSubmit)}
            width={['xs', 'sm'].includes(screen) ? '100%' : 'auto'}
            flexDirection={['xs', 'sm'].includes(screen) ? 'column' : 'row'}
            justifyItems={['xs', 'sm'].includes(screen) ? 'space-between' : 'space-between'}
          >
            {paramsValue === 'full_name_dob'
              ? (
                <>
                  <InputWrapper flexDirection='column' padding={['xs', 'sm'].includes(screen) ? 'auto' : '0px 20px 0px 0px !important'}>
                    <TextFieldStyled
                      id='outlined-basic'
                      label='Full Name *'
                      variant='outlined'
                      defaultValue=''
                      {...register('full_name', {
                        required: true,
                        pattern: (validation.full_name?.validation?.pattern)
                          ? new RegExp(validation.full_name?.validation?.pattern) : undefined,
                        min: (validation.full_name?.validation?.min)
                          ? validation.full_name?.validation?.min : undefined,
                        max: (validation.full_name?.validation?.max)
                          ? validation.full_name?.validation?.max : undefined,
                        maxLength: (validation.full_name?.validation?.maxLength)
                          ? validation.full_name?.validation?.maxLength : undefined,
                        minLength: (validation.full_name?.validation?.minLength)
                          ? validation.full_name?.validation?.minLength : undefined,
                      })}
                      onChange={(e) => {
                        setValue('full_name', e.target.value, {
                          shouldValidate: true
                        });
                      }}
                    />
                    <ErrorMessageContainer padding='0px'>
                      <ErrorText input={validation.full_name} errors={errors} />
                    </ErrorMessageContainer>
                  </InputWrapper>
                  <InputWrapper flexDirection='column' justifyContent='start' marginTop={['xs', 'sm'].includes(screen) ? '10px' : '0px'} padding={['xs', 'sm'].includes(screen) ? 'auto' : '0px 0px 0px 0px !important'}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        className='date-picker'
                        label='DOB*'
                        inputFormat='dd/MM/yyyy'
                        value={dob}
                        renderInput={(params) => (
                          <TextFieldStyled
                            onKeyDown={(e) => {
                              e.preventDefault();
                            }}
                            variant='outlined'
                            {...params}
                          />
                        )}
                        {...register('dob', {
                          required: true,
                        })}
                        onChange={(v) => {
                          setDob(v);
                          setValue(
                            'dob',
                            v,
                            { shouldValidate: true, shouldDirty: true }
                          );
                        }}
                        disableFuture
                        shouldDisableYear={disableDOBDates}
                        shouldDisableDate={disableDOBDates}
                      />
                    </LocalizationProvider>
                    <ErrorMessageContainer padding='0px'>
                      <ErrorText input={validation.dob} errors={errors} />
                    </ErrorMessageContainer>
                  </InputWrapper>

                </>
              )
              : (
                <TextFieldStyled
                  id='outlined-basic'
                  label={`${searchTitle} *`}
                  variant='outlined'
                  defaultValue=''
                  {...register(paramsValue, {
                    required: true,
                    pattern: (validation[paramsValue]?.validation?.pattern)
                      ? new RegExp(validation[paramsValue]?.validation?.pattern) : undefined,
                    min: (validation[paramsValue]?.validation?.min)
                      ? validation[paramsValue]?.validation?.min : undefined,
                    max: (validation[paramsValue]?.validation?.max)
                      ? validation[paramsValue]?.validation?.max : undefined,
                    maxLength: (validation[paramsValue]?.validation?.maxLength)
                      ? validation[paramsValue]?.validation?.maxLength : undefined,
                    minLength: (validation[paramsValue]?.validation?.minLength)
                      ? validation[paramsValue]?.validation?.minLength : undefined,
                  })}
                  onChange={(e) => {
                    setValue(paramsValue, paramsValue === 'pan_no' ? e.target.value.toUpperCase() : e.target.value, {
                      shouldValidate: true
                    });
                  }}
                />
              )}
            <InputWrapper
              justifyContent='center'
              height='fit-content'
              marginTop={['xs', 'sm'].includes(screen) ? '10px' : '0px'}
              padding='0px !important'
            >
              <LoadingButtonPrimary
                variant='contained'
                loading={loading?.loader && loading?.name === 'SEARCH'}
                disabled={isSearchDisabled}
                type='submit'
              >
                Search
              </LoadingButtonPrimary>
              <ResetButton onClick={() => searchResetHandler()}>
                Reset
              </ResetButton>
            </InputWrapper>
          </CustomForm>
          <ButtonPrimary
            margin={['xs', 'sm'].includes(screen) ? '0 0 20px 0' : ''}
            onClick={addCustomerhandler}
            disabled={!permissionsArray.includes(PERMISSION.customerCreate) && !permissionsArray.includes(PERMISSION.customerMaker)}
          >
            Create Customer
          </ButtonPrimary>
        </HeaderContainer>
        <ErrorMessageContainer>
          <ErrorText input={validation[paramsValue]} errors={errors} />
        </ErrorMessageContainer>
        <HeaderContainer padding='20px 20px 0px 20px'>
          <MultiToggleButton
            orientation={screen === 'xs' ? 'vertical' : 'horizontal'}
            details={togglerGroup}
            seletedValueHandler={seletedValueHandler}
          />
        </HeaderContainer>
        {
          searchDetails?.data?.length ? (
            <>
              <DialogBox
                isOpen={isOpen}
                fullScreen
                title={formTitle}
                width='100%'
                handleClose={handleClose}
              >
                { loader ? <PageLoader /> : null}
                <ContainerStyled>

                  {
                  formConfiguration ? (
                    <>
                      {isLoading ? <PageLoader /> : null}
                      <FormGenerator
                        formDetails={formConfiguration}
                        formHandler={updateCustomerDetailsHandler}
                        isLoading={isLoading || (loading?.loader === true && loading?.name === 'SUBMIT')}
                      />
                    </>
                  ) : (
                    <CenterContainerStyled padding='40px'>
                      <CircularProgress color='secondary' />
                    </CenterContainerStyled>
                  )
                  }
                </ContainerStyled>
              </DialogBox>
              <Grid item xs={12}>
                <TableComponent
                  rows={searchDetails?.data}
                  columns={customerSearchColumns}
                  checkboxAllowed={false}
                  clientPaginationMode={false}
                  loading={loading?.loader && loading?.name === 'TABLE'}
                  onPageChange={onPageChange}
                  onPageSizeChange={onPageSizeChange}
                  rowCount={searchDetails?.rowCount}
                />
              </Grid>
            </>
          ) : null
        }
      </CustomContainerStyled>
    </>
  );
};
export default CustomerSearch;
