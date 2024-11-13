/* eslint-disable no-nested-ternary */
/* eslint-disable max-len */
import { cloneDeep } from 'lodash';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { CircularProgress } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { connect, useSelector, useDispatch } from 'react-redux';
import { ROUTENAME } from '../../../constants';
import { Service } from '../../../service/index';
import PageLoader from '../../../components/PageLoader';
import { formJsonDetailsEdit, navigationDetailsEdit } from './helper';
import { saveAppId, saveFormData } from '../../../redux/reducer/loanMaker';
import {
  ToastMessage, MenuNavigation, FormGenerator
} from '../../../components';
import {
  saveFormValues, setSchemeData, setChargerData
} from '../../../redux/reducer/login';
import {
  ContainerStyled, BreadcrumbsContainerStyled, BreadcrumbsWrapperContainerStyled,
  CenterContainerStyled
} from '../../../components/styledComponents';
import { numberFormat } from '../../../utils';
import { resendReducer } from '../../../redux/reducer/customerCreation';

const mapStateToProps = (state) => ({
  ...state,
});
const amountFormat = Intl.NumberFormat('en-IN');

const loanCreationMaker = (props) => {
  const {
    saveSchemeData, saveChargerData
  } = props;
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [alertShow1, setAlertShow1] = useState({ open: false, msg: '' });
  const [isLoading, setIsLoading] = useState({ loader: false, name: null });
  const [formDetails, setFormDetails] = useState();
  const [formShow, setFormShow] = useState(false);
  const { appNo } = useParams();
  const [applicationNo, customerID] = appNo.split('-');
  const dispatch = useDispatch();
  const userDetails = useSelector((state) => state.user.userDetails);
  const navigate = useNavigate();

  const getData = async () => {
    try {
      const selectedBranch = userDetails?.selectedBranch.length > 0 ? userDetails?.selectedBranch : [];
      const requestBody = {
        branches_code: Array.isArray(selectedBranch) ? selectedBranch : [selectedBranch],
        is_active: true
      };
      const request1 = Service.get(`${process.env.REACT_APP_USER_VIEW}?internal_lan=${applicationNo}&fc=1&token=1&is_deviation=1`);
      const request2 = Service.get(`${process.env.REACT_APP_LOAN_LISTING}/${applicationNo}`);
      const request3 = Service.get(`${process.env.REACT_APP_USER_VIEW}?customer_id=${customerID}`);
      const request4 = axios.get(process.env.REACT_APP_SCHEME_VALIDATION);
      const request5 = Service.post(`${process.env.REACT_APP_CHARGE_GET}?page_size=${1000}&page=${1}`, requestBody);
      const request6 = axios.get(`${process.env.REACT_APP_LOS_CONFIG_SERVICE}?key=ornament`);
      const request7 = axios.get(process.env.REACT_APP_CITY_MASTER_SERVICE);
      const request8 = axios.get(process.env.REACT_APP_LOS_CONFIG_SERVICE);
      await Promise.all([request1, request2, request3, request4, request5, request6, request7, request8]).then(async (response) => {
        const dataToSaveInRedux = cloneDeep(response[1].data);
        const { data } = await Service.post(`${process.env.REACT_APP_SCHEME_LIST}?page_size=${1000}&page=${1}`, {
          ...requestBody,
          colender: dataToSaveInRedux.colender
        });
        const customerInfo = cloneDeep(response[0].data.data);
        const customerFullDetails = cloneDeep(response[2].data.data);
        const rebateSlabDetails = cloneDeep(response[3].data.rebate_rate_chart);
        const rebateStepupSlabDetails = cloneDeep(response[3].data.rebate_step_up_rate_chart);
        dataToSaveInRedux.rebateStepupSlabDetails = rebateStepupSlabDetails;
        dataToSaveInRedux.customerFullDetails = customerFullDetails;
        dataToSaveInRedux.rebateSlabDetails = rebateSlabDetails;
        if (customerInfo?.middle_name) {
          dataToSaveInRedux.full_name = `${customerInfo?.first_name} ${customerInfo?.middle_name} ${customerInfo?.last_name}`;
        } else if (customerInfo?.first_name) {
          dataToSaveInRedux.full_name = `${customerInfo?.first_name} ${customerInfo?.last_name}`;
        }
        if (dataToSaveInRedux.scheme_eligible_amount) {
          dataToSaveInRedux.scheme_eligible_amount = numberFormat(response[1].data.scheme_eligible_amount);
        }
        if (dataToSaveInRedux.applied_loan_amount) {
          dataToSaveInRedux.applied_loan_amount = numberFormat(response[1].data.applied_loan_amount);
        }
        if (dataToSaveInRedux.max_eligible_loan_amount) {
          dataToSaveInRedux.max_eligible_loan_amount = numberFormat(response[1].data.max_eligible_loan_amount);
        }
        if (dataToSaveInRedux.requested_loan_amount) {
          dataToSaveInRedux.requested_loan_amount = numberFormat(response[1].data.requested_loan_amount);
        }
        if (dataToSaveInRedux.scheme_max_loan_amount) {
          dataToSaveInRedux.scheme_max_loan_amount = numberFormat(response[1].data.scheme_max_loan_amount);
        }
        if (dataToSaveInRedux.scheme_min_loan_amount) {
          dataToSaveInRedux.scheme_min_loan_amount = numberFormat(response[1].data.scheme_min_loan_amount);
        }
        if (dataToSaveInRedux.requested_gold_loan_amount) {
          dataToSaveInRedux.requested_gold_loan_amount = numberFormat(response[1].data.requested_gold_loan_amount);
        }
        if (dataToSaveInRedux.balance_amount_transfer) {
          dataToSaveInRedux.balance_amount_transfer = numberFormat(response[1].data.balance_amount_transfer);
        }
        dataToSaveInRedux.interaccounts = response[1].data?.interaccounts?.map((item) => {
          item.loan_amount_transfer = numberFormat(item?.loan_amount_transfer);
          return item;
        });
        if (dataToSaveInRedux.amount) {
          dataToSaveInRedux.amount = numberFormat(response[1].data.amount);
        }
        if (dataToSaveInRedux.cash_disbursment) {
          dataToSaveInRedux.cash_disbursment = numberFormat(response[1].data.cash_disbursment);
        }
        if (dataToSaveInRedux.net_disbursment) {
          dataToSaveInRedux.net_disbursment = numberFormat(response[1].data.net_disbursment);
        }
        if (dataToSaveInRedux.total_principal_outstanding) {
          dataToSaveInRedux.total_principal_outstanding = numberFormat(response[1].data.total_principal_outstanding);
        }
        dataToSaveInRedux.dob = customerInfo?.dob;
        dataToSaveInRedux.primary_mobile_number = customerInfo?.primary_mobile_number;
        dataToSaveInRedux.total_loan = customerInfo.loan_summary.total_loan;
        dataToSaveInRedux.active_loans = customerInfo.loan_summary.active_loan;
        dataToSaveInRedux.closed_loans = customerInfo.loan_summary.closed_loan;
        if (customerInfo.loan_summary.total_pos) {
          dataToSaveInRedux.total_pos = amountFormat.format(customerInfo.loan_summary.total_pos);
        } else {
          dataToSaveInRedux.total_pos = 0;
        }
        if (customerInfo.loan_summary.total_interest_overdue) {
          dataToSaveInRedux.total_interest_overdue = amountFormat.format(customerInfo.loan_summary.total_interest_overdue);
        } else {
          dataToSaveInRedux.total_interest_overdue = 0;
        }
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
        const schemeArray = data.results.map((scheme) => scheme.scheme);
        saveSchemeData(schemeArray);
        const chargeArray = response[4].data.results.map((charge) => charge.charge);
        saveChargerData(chargeArray);
        // console.log('dataToSaveInRedux before: ', dataToSaveInRedux);
        // dataToSaveInRedux.loan_kawach = formValues?.loan_kawach;
        // console.log('dataToSaveInRedux after: ', dataToSaveInRedux);
        dispatch(saveFormData(dataToSaveInRedux));
        dispatch(saveAppId(applicationNo));
        const ornamentsList = response[5]?.data?.map((ele) => ({ label: ele.name, value: ele.value }));
        const cityCodeMapping = response[6]?.data?.city_codes?.map((ele) => ({ label: ele.name, value: ele.name }));
        cityCodeMapping.sort((a, b) => ((a.label.toLowerCase() > b.label.toLowerCase()) ? 1 : ((b.label.toLowerCase() > a.label.toLowerCase()) ? -1 : 0)));
        setFormDetails(formJsonDetailsEdit(dispatch, resendReducer, setAlertShow, setFormDetails, ornamentsList, cityCodeMapping, setIsLoading, navigate, response[7].data));
        setFormShow(true);
      }).catch((err) => {
        console.log('error', err);
        if (err?.response?.data?.errors?.detail && typeof err?.response?.data?.errors?.detail === 'string') {
          setAlertShow1({ open: true, msg: err.response.data.errors.detail, alertType: 'error' });
        } else {
          setAlertShow1({ open: true, msg: 'Somthing went wrong while fetching loan details.', alertType: 'error' });
        }
      });
    } catch (e) {
      setAlertShow1({ open: true, msg: 'Somthing went wrong while fetching loan details.', alertType: 'error' });
      return true;
    }
  };

  const pageLoaderProvider = () => {
    try {
      if (isLoading.loader && isLoading.name === 'pageLoader') {
        if (isLoading?.stage === 'stage4') {
          return (
            <PageLoader msg='Please do not refresh or press back button.' />
          );
        }
        return (<PageLoader />);
      }
      return null;
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    dispatch(resendReducer(''));
    getData();
  }, []);
  const formHandler = () => {
    navigate(ROUTENAME?.loanCreationList);
  };
  return (
    <>
      {/* { isLoading.loader && isLoading.name === 'pageLoader' ? <PageLoader /> : null}
       */}
      {pageLoaderProvider()}
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={navigationDetailsEdit} />
        </BreadcrumbsContainerStyled>
      </BreadcrumbsWrapperContainerStyled>
      <ContainerStyled padding='0 !important'>
        <ToastMessage
          alertShow={alertShow1}
          setAlertShow={setAlertShow1}
        />
        {formShow ? (
          <FormGenerator
            formDetails={formDetails}
            formHandler={formHandler}
            alertShow={alertShow}
            setAlertShow={setAlertShow}
            setFormDetails={setFormDetails}
          />
        ) : (
          <CenterContainerStyled padding='40px'>
            <CircularProgress color='secondary' />
          </CenterContainerStyled>
        )}
      </ContainerStyled>
    </>
  );
};

const mapDispatchToProps = (dispatch) => ({
  saveFormValuesInRedux: (payload) => dispatch(saveFormValues(payload)),
  saveSchemeData: (payload) => dispatch(setSchemeData(payload)),
  saveChargerData: (payload) => dispatch(setChargerData(payload)),
});
export default connect(mapStateToProps, mapDispatchToProps)(loanCreationMaker);
