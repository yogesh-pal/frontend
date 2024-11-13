/* eslint-disable no-nested-ternary */
/* eslint-disable max-len */
import axios from 'axios';
import { cloneDeep } from 'lodash';
import { useState, useEffect } from 'react';
import { connect, useSelector, useDispatch } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import store from '../../../redux/store';
import { ROUTENAME } from '../../../constants';
import { Service } from '../../../service/index';
import PageLoader from '../../../components/PageLoader';
import { formJsonDetails, navigationDetails } from './helper';
import { saveCustomerId, saveFormData } from '../../../redux/reducer/loanMaker';
import { ToastMessage, MenuNavigation, FormGenerator } from '../../../components';
import { saveFormValues, setSchemeData, setChargerData } from '../../../redux/reducer/login';
import {
  ContainerStyled, BreadcrumbsContainerStyled, BreadcrumbsWrapperContainerStyled,
  CenterContainerStyled
} from '../../../components/styledComponents';
import { resendReducer } from '../../../redux/reducer/customerCreation';

const mapStateToProps = (state) => ({
  ...state,
});

const loanCreationMaker = (props) => {
  const { saveSchemeData, saveChargerData } = props;
  const [formDetails, setFormDetails] = useState(null);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [alertShow1, setAlertShow1] = useState({ open: false, msg: '' });
  const [isLoading, setIsLoading] = useState({ loader: false, name: null });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const userDetails = useSelector((state) => state.user.userDetails);

  const getData = () => {
    const selectedBranch = userDetails?.selectedBranch.length > 0 ? userDetails?.selectedBranch : [];
    const requestBody = {
      branches_code: Array.isArray(selectedBranch) ? selectedBranch : [selectedBranch],
      is_active: true,
      colender: 'CAPRI'
    };
    const request1 = Service.post(`${process.env.REACT_APP_CHARGE_GET}?page_size=${1000}&page=${1}`, requestBody);
    const request2 = axios.get(process.env.REACT_APP_SCHEME_VALIDATION);
    const request3 = axios.get(process.env.REACT_APP_LOS_CONFIG_SERVICE);
    const request4 = axios.get(`${process.env.REACT_APP_LOS_CONFIG_SERVICE}?key=ornament`);
    const request5 = axios.get(process.env.REACT_APP_CITY_MASTER_SERVICE);
    Promise.all([request1, request2, request3, request4, request5]).then(([response1, response2, response3, response4, response5]) => {
      const chargeArray = [];
      response1?.data?.results.forEach((scheme) => chargeArray.push(scheme.charge));
      const rebateSlabDetails = cloneDeep(response2.data.rebate_rate_chart);
      const rebateStepupSlabDetails = cloneDeep(response2.data.rebate_step_up_rate_chart);
      const state = store.getState();
      const { formData } = state.loanMaker;
      dispatch(saveFormData({ ...formData, rebateSlabDetails, rebateStepupSlabDetails }));
      saveChargerData(chargeArray);
      const ornamentsList = response4?.data?.map((ele) => ({ label: ele.name, value: ele.value }));
      const cityCodeMapping = response5?.data?.city_codes?.map((ele) => ({ label: ele.name, value: ele.name }));
      cityCodeMapping.sort((a, b) => ((a.label.toLowerCase() > b.label.toLowerCase()) ? 1 : ((b.label.toLowerCase() > a.label.toLowerCase()) ? -1 : 0)));
      setFormDetails(
        formJsonDetails(resendReducer, dispatch, setAlertShow, setFormDetails, searchParams.get('loan-amount')?.replace(/,/g, ''), response3.data, ornamentsList, saveSchemeData, setIsLoading, cityCodeMapping, navigate)
      );
    }).catch((err) => {
      console.log('Error', err);
      setAlertShow1({ open: true, msg: 'Something went wrong while fetching details.', alertType: 'error' });
    });
  };

  useEffect(() => {
    dispatch(resendReducer(''));
    const cid = searchParams.get('customer-id');
    if (cid) {
      dispatch(saveCustomerId(cid));
    }
    getData();
  }, []);

  const formHandler = () => {
    navigate(ROUTENAME?.loanCreationList);
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

  return (
    <>
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={navigationDetails} />
        </BreadcrumbsContainerStyled>
      </BreadcrumbsWrapperContainerStyled>
      {/* <div>
        <PageLoader message='Processing' />
        <CustomMessage>
          Please do not refresh or press back button.
        </CustomMessage>
      </div> */}
      {/* <PageLoader /> */}
      {pageLoaderProvider()}
      {/* { isLoading.loader && isLoading.name === 'pageLoader' ? <PageLoader /> : null} */}
      <ContainerStyled padding='0 !important'>
        <ToastMessage
          alertShow={alertShow1}
          setAlertShow={setAlertShow1}
        />
        {formDetails ? (
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
