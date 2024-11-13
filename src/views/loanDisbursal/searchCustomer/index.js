/* eslint-disable no-unused-vars */
/* eslint-disable no-unreachable */
/* eslint-disable max-len */
import moment from 'moment';
import { useEffect, useState } from 'react';
import { cloneDeep } from 'lodash';
import styled from '@emotion/styled';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { CircularProgress, DialogContentText } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { Service } from '../../../service';
import { getUserPermissions } from '../../../utils';
import { PERMISSION, ROUTENAME } from '../../../constants';
import { saveCustomerId, saveFormData } from '../../../redux/reducer/loanMaker';
import {
  togglerGroup, navigationDetails, validation, formJsonDetails
} from './helper';
import {
  ToastMessage, MenuNavigation, MultiToggleButton, ErrorText, FormGenerator,
  DialogBox
} from '../../../components';
import {
  TextFieldStyled, CustomContainerStyled, LoadingButtonPrimary, BreadcrumbsWrapperContainerStyled,
  BreadcrumbsContainerStyled, HeadingMaster, HeaderContainer, ResetButton, ErrorMessageContainer,
  CenterContainerStyled, CenterContainer
} from '../../../components/styledComponents';
import Rekyc from '../loanCreation/rekyc';

const CustomForm = styled(({ isMobileView, ...other }) => <form {...other} />)`
  width: ${(props) => (props.isMobileView ? '100%' : '500px')};
  display: flex;
`;

const amountFormat = Intl.NumberFormat('en-IN');
export const REKYC_DUE = 'Re-Kyc Due';
export const REKYC_NOTDUE = 'KYC Compliant';

const LoanDisbursalSearch = () => {
  const [customerData, setCustomerData] = useState(null);
  const [formConfiguration, setFormConfiguration] = useState();
  const [validationErrors, setValidationErrors] = useState([]);
  const [searchTitle, setSearchTitle] = useState('Customer ID');
  const [paramsValue, setParamsValue] = useState('customer_id');
  const [customerDetails, setCustomerDetails] = useState('INITIAL');
  const [loading, setLoading] = useState({ loader: true, name: '' });
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [isHaveTopUpPermission, setIsHaveTopUpPermission] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    register, handleSubmit, setValue, formState: { errors }, reset
  } = useForm();

  useEffect(() => {
    const userPermissions = getUserPermissions();
    if (userPermissions.includes(PERMISSION.topUpMaker)) {
      setIsHaveTopUpPermission(true);
    }
  }, []);

  const returnKYCStatus = (rekycDueDate) => {
    if (!rekycDueDate) {
      return REKYC_NOTDUE;
    }
    // Epoch is in seconds, so multiply by 1000
    const rDD = moment(rekycDueDate * 1000);
    const today = moment();
    console.log('return fyc status', today, rDD);
    // isAfter return false for same date
    return rDD.isAfter(today) ? REKYC_NOTDUE : REKYC_DUE;
  };

  const fetchKYCStatus = async () => {
    try {
      const customerID = customerData?.customer_id;
      setCustomerDetails('SEARCH');
      const customerRes = await Service.get(`${process.env.REACT_APP_USER_VIEW}?customer_id=${customerID}`);
      const updatedDetails = {};
      updatedDetails.kyc_status = returnKYCStatus(customerRes.data.data.re_kyc_due_date);
      const newData = { ...customerData, ...updatedDetails };
      setCustomerData(newData);
      setFormConfiguration(null);
      setTimeout(() => setFormConfiguration(cloneDeep(formJsonDetails({ useDetails: newData })), 5000));
    } catch (err) {
      console.log('Error', err);
      if (err?.response?.data?.errors?.detail) {
        setAlertShow({ open: true, msg: err.response.data.errors.detail, alertType: 'error' });
      } else {
        setAlertShow({
          open: true,
          msg: 'Something went wrong while fetching customer details.',
          alertType: 'error'
        });
      }
      setCustomerDetails('ERROR');
    }
  };

  const searchDetailsHandler = async (value) => {
    try {
      setCustomerDetails('SEARCH');
      let url = `${process.env.REACT_APP_USER_VIEW}?fc=1&token=1&is_cpv=1&isTopUp=1&is_deviation=1`;
      url = `${url}&${paramsValue}=${value?.toUpperCase()}`;
      // const res = await Service.get(url);
      const request1 = await Service.get(url);
      const request2 = axios.get(process.env.REACT_APP_SCHEME_VALIDATION);
      await Promise.all([request1, request2]).then(async (response) => {
        const res = response[0];
        const rebateSlabDetails = cloneDeep(response[1].data.rebate_rate_chart);
        const customerInfo = cloneDeep(res.data.data);
        const customerRes = await Service.get(`${process.env.REACT_APP_USER_VIEW}?customer_id=${customerInfo.customer_id}`);
        const dataToSaveInRedux = {};
        const customerFullDetails = cloneDeep({
          ...customerRes.data.data,
        });
        dataToSaveInRedux.customerFullDetails = customerFullDetails;
        dataToSaveInRedux.first_name = customerInfo?.first_name;
        dataToSaveInRedux.middle_name = customerInfo?.middle_name;
        dataToSaveInRedux.last_name = customerInfo?.last_name;
        dataToSaveInRedux.rebateSlabDetails = rebateSlabDetails;
        if (customerInfo?.middle_name) {
          dataToSaveInRedux.full_name = `${customerInfo?.first_name} ${customerInfo?.middle_name} ${customerInfo?.last_name}`;
        } else if (customerInfo?.first_name) {
          dataToSaveInRedux.full_name = `${customerInfo?.first_name} ${customerInfo?.last_name}`;
        }
        dataToSaveInRedux.customer_id = customerInfo?.customer_id;
        dataToSaveInRedux.dob = customerInfo?.dob;
        dataToSaveInRedux.primary_mobile_number = customerInfo?.primary_mobile_number;
        dataToSaveInRedux.total_loan = customerInfo.loan_summary.total_loan;
        dataToSaveInRedux.active_loans = customerInfo.loan_summary.active_loan;
        dataToSaveInRedux.closed_loans = customerInfo.loan_summary.closed_loan;
        dataToSaveInRedux.total_pos = amountFormat.format(customerInfo.loan_summary.total_pos);
        dataToSaveInRedux.total_interest_overdue = amountFormat.format(customerInfo.loan_summary.total_interest_overdue);
        dataToSaveInRedux.npa_status = customerInfo.loan_summary.npa_status;
        dataToSaveInRedux.count_of_default_account = customerInfo.loan_summary.count_of_default_account;
        dataToSaveInRedux.count_of_npa_account = customerInfo.loan_summary.count_of_npa_account;
        dataToSaveInRedux.count_of_auctioned_account = customerInfo.loan_summary.count_of_auctioned_account;
        dataToSaveInRedux.count_of_spurious_account = customerInfo.loan_summary.count_of_spurious_account;
        dataToSaveInRedux.lien_status = customerInfo.loan_summary.lien_status === 'Y' ? 'Yes' : 'No';
        dataToSaveInRedux.legal_status = customerInfo.loan_summary.legal_status === 'Y' ? 'Yes' : 'No';
        dataToSaveInRedux.loan_detail = customerInfo?.loan_detail;
        dataToSaveInRedux.customer_pan_no = customerInfo?.pan_no;
        dataToSaveInRedux.total_disbursed_amount = customerInfo?.loan_detail.reduce((accumulator, currentValue) => accumulator + currentValue.disburshment_amout, 0);
        let activeLoanAccounts = (customerInfo.loan_detail.filter((ele) => ele.current_status_code === '8' && ele?.dpd === '0')).map((ele) => ele.lan);
        if (!activeLoanAccounts.length) {
          activeLoanAccounts = [{ label: 'No Active Loan', value: null, disabled: true }];
        }
        dataToSaveInRedux.activeLoanAccounts = activeLoanAccounts;
        dataToSaveInRedux.cust_dt = customerInfo.dt;
        dataToSaveInRedux.loan_summary = customerInfo?.loan_summary;
        dataToSaveInRedux.cpv_data = customerInfo?.cpv_data;
        dataToSaveInRedux.pan_no = customerInfo.pan_no;
        dataToSaveInRedux.account_number = customerInfo.account_number;
        dataToSaveInRedux.kyc_status = returnKYCStatus(customerFullDetails.re_kyc_due_date);
        setCustomerData(dataToSaveInRedux);
        dispatch(saveFormData(dataToSaveInRedux));
        if (res?.data?.data) {
          setLoading({ loader: false, name: '' });
          setFormConfiguration(cloneDeep(formJsonDetails({ useDetails: dataToSaveInRedux })));
          dispatch(saveCustomerId(dataToSaveInRedux?.customer_id));
          return;
        }
        setLoading({ loader: false, name: '' });
        if (res?.status_code !== 200) {
          setCustomerDetails('ERROR');
          setFormConfiguration('');
        }
      }).catch((err) => {
        console.log('Error', err);
        if (err?.response?.data?.errors?.detail) {
          setAlertShow({ open: true, msg: err.response.data.errors.detail, alertType: 'error' });
        } else {
          setAlertShow({
            open: true,
            msg: 'Something went wrong while fetching customer details.',
            alertType: 'error'
          });
        }
        setCustomerDetails('ERROR');
      });
    } catch (err) {
      console.log('Error', err);
      if (err?.response?.data?.errors?.detail) {
        setAlertShow({ open: true, msg: err.response.data.errors.detail, alertType: 'error' });
      } else {
        setAlertShow({
          open: true,
          msg: 'Something went wrong while fetching customer details.',
          alertType: 'error'
        });
      }
      setCustomerDetails('ERROR');
    }
  };

  const onSearchSubmit = async (value) => {
    try {
      setFormConfiguration('');
      const val = value[paramsValue];
      searchDetailsHandler(val);
    } catch (e) {
      console.log('Error', e);
    }
  };

  const searchResetHandler = () => {
    try {
      setFormConfiguration('');
      setCustomerDetails('INITIAL');
      reset({
        [paramsValue]: null
      });
    } catch (e) {
      console.log('Error', e);
    }
  };

  const seletedValueHandler = (value) => {
    try {
      setParamsValue(value);
      const searchTemp = togglerGroup.values.find((item) => item.value === value);
      setSearchTitle(searchTemp?.name);
      reset({
        [value]: null
      });
    } catch (e) {
      console.log('Error', e);
    }
  };

  const checkValidation = () => {
    const errorsArr = [];
    if (customerData.loan_detail.some((ele) => Number(ele.dpd) > 0 && ele.amount_paid_today < ele.total_outstanding_for_foreclosure)) {
      errorsArr.push('"Customer is in DPD", Are you sure you want to create the loan?');
    }
    if (customerData?.loan_summary?.npa_status?.toLowerCase() === 'suspended') {
      errorsArr.push('"Customer is in NPA", Are you sure you want to create the loan?');
    }
    if (customerData?.loan_summary?.count_of_auctioned_account > 0) {
      errorsArr.push('"Customer has Past Auctioned record", Are you sure you want to create the loan?');
    }
    if (customerData?.loan_summary?.count_of_spurious_account > 0) {
      errorsArr.push('"Customer has Spurious Account", Are you sure you want to create the loan?');
    }
    return errorsArr;
  };

  const checkRekycStatus = (func) => {
    // setOpen(true);
    // return;
    if (customerData?.kyc_status === REKYC_DUE) {
      if (!customerData?.customerFullDetails?.aadhaar_reference_number) {
        setAlertShow({
          open: true,
          msg: 'Unable to get Aadhaar ID of the customer.',
          alertType: 'error'
        });
        return;
      }
      setOpen(true);
      return;
    }
    func();
  };

  const addCustomerhandler = () => {
    try {
      if (moment().diff(moment(customerData.dob, 'DD/MM/YYYY'), 'years') > 80) {
        setAlertShow({
          open: true,
          msg: 'You are not eligible as your age does not come under decided criteria.',
          alertType: 'error'
        });
        return;
      }
      for (let ind = 0; ind < customerData?.cpv_data.length; ind += 1) {
        if (customerData?.cpv_data[ind].status === 'Pending') {
          setAlertShow({
            open: true,
            msg: 'Please complete CPV of the Customer to proceed further.',
            alertType: 'error'
          });
          return;
        }
        if (customerData?.cpv_data[ind].status === 'Negative') {
          setAlertShow({
            open: true,
            msg: 'Customer CPV status is Negative. Hence, loan creation not allowed.',
            alertType: 'error'
          });
          return;
        }
      }
      const errorsArr = checkValidation();
      if (errorsArr.length) {
        setValidationErrors(errorsArr);
      } else {
        navigate(ROUTENAME?.loanCreationMaker);
      }
    } catch (e) {
      console.log('Error', e);
    }
  };

  const handleTopUP = () => {
    if (customerData?.kyc_status === REKYC_DUE) {
      if (!customerData?.customerFullDetails?.aadhaar_reference_number) {
        setAlertShow({
          open: true,
          msg: 'Unable to get Aadhaar ID of the customer.',
          alertType: 'error'
        });
        return;
      }
      setOpen(true);
      return;
    }
    if (!customerData?.loan_detail.length) {
      setAlertShow({ open: true, msg: 'You don\'t have any existing loan account.', alertType: 'error' });
      return;
    }
    if (!customerData?.customerFullDetails?.is_bank_verified) {
      setAlertShow({ open: true, msg: 'Please add your active Bank account.', alertType: 'error' });
      return;
    }
    navigate(ROUTENAME.loanTopUp);
  };

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
        <HeaderContainer item xs={12} padding='20px 20px 0px 20px'>
          <HeadingMaster>
            Loan Disbursal Search
          </HeadingMaster>
        </HeaderContainer>
        <HeaderContainer item xs={12}>
          <CustomForm onSubmit={handleSubmit(onSearchSubmit)}>
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
            <LoadingButtonPrimary
              variant='contained'
              loading={loading?.loader && loading?.name === 'SEARCH'}
              type='submit'
            >
              Search
            </LoadingButtonPrimary>
            <ResetButton onClick={() => searchResetHandler()}>
              Reset
            </ResetButton>
          </CustomForm>
        </HeaderContainer>
        <ErrorMessageContainer>
          <ErrorText input={validation[paramsValue]} errors={errors} />
        </ErrorMessageContainer>
        <HeaderContainer padding='0px 20px 0px 20px'>
          <MultiToggleButton
            details={togglerGroup}
            seletedValueHandler={seletedValueHandler}
          />
        </HeaderContainer>

        {
            formConfiguration ? (
              <FormGenerator
                formDetails={formConfiguration}
              />
            ) : (
              customerDetails === 'SEARCH' && (
              <CenterContainerStyled padding='40px'>
                <CircularProgress color='secondary' />
              </CenterContainerStyled>
              ))
        }
        {
          customerDetails === 'ERROR' && (
            <CenterContainer padding='0 0 20px 0'>
              <h3>
                No record found for this customer.
                {' '}
                <Link to={ROUTENAME.customerSearchPosidex}>Proceed to create new Customer</Link>
              </h3>
            </CenterContainer>
          )
        }
        {
          formConfiguration ? (
            <CenterContainer padding='0 0 20px 0'>
              <LoadingButtonPrimary
                variant='contained'
                onClick={() => checkRekycStatus(addCustomerhandler)}
              >
                Create New Loan
              </LoadingButtonPrimary>
              {
              isHaveTopUpPermission
                ? (
                  <LoadingButtonPrimary
                    variant='contained'
                    onClick={() => checkRekycStatus(handleTopUP)}
                  >
                    Top UP
                  </LoadingButtonPrimary>
                ) : null
              }
            </CenterContainer>
          ) : null
        }
      </CustomContainerStyled>
      <DialogBox
        isOpen={validationErrors.length}
        title=''
        handleClose={() => setValidationErrors([])}
        width='auto'
        padding='30px'
      >
        <DialogContentText>
          {
            validationErrors.map((error, ind) => (
              <div>
                {validationErrors.length > 1 ? `${ind + 1}. ` : null}
                {error}
              </div>
            ))
          }
        </DialogContentText>
        <CenterContainerStyled flexDirection='row' padding='20px 0 0 0'>
          <LoadingButtonPrimary onClick={() => navigate(ROUTENAME?.loanCreationMaker)}>Yes</LoadingButtonPrimary>
          <LoadingButtonPrimary onClick={() => setValidationErrors([])}>No</LoadingButtonPrimary>
        </CenterContainerStyled>
      </DialogBox>
      <DialogBox
        isOpen={open}
        fullScreen
        title='Update Customer Details'
        handleClose={() => setOpen(false)}
        width='100%'
      >
        <Rekyc customerId={customerData?.customer_id} setAlertShow={setAlertShow} setIsOpen={setOpen} fetchKYCStatus={fetchKYCStatus} />
      </DialogBox>
    </>
  );
};

export default LoanDisbursalSearch;
