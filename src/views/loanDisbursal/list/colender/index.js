/* eslint-disable max-len */
import { cloneDeep } from 'lodash';
import styled from '@emotion/styled';
import { useDispatch } from 'react-redux';
import React, { useState, useEffect } from 'react';
import { CircularProgress, Alert, Grid } from '@mui/material';
import store from '../../../../redux/store';
import { Service } from '../../../../service';
import { ToastMessage } from '../../../../components';
import PageLoader from '../../../../components/PageLoader';
import CAM from '../../../../components/formFields/CAM/CAM';
import { saveFormData } from '../../../../redux/reducer/loanMaker';
import BoxFormat from '../../../../components/formFields/CAM/BoxFormat';
import { LoadingButtonPrimary, CenterContainerStyled, ButtonPrimary } from '../../../../components/styledComponents';

const CustomDiv = styled.div(() => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
}));

const ColenderComponent = ({
  clickedRow, initalLoanDetailsHandler, setIsColenderOpen,
  handleClose: handleClose2
}) => {
  const [error, setError] = useState(null);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [isLoading, setIsLoading] = useState({ loader: true, name: 'fetchInitialData' });
  const state = store.getState();
  const { formData } = state.loanMaker;
  const dispatch = useDispatch();

  const getLoanData = async (fullAPIURL) => {
    try {
      const { data } = await Service.get(fullAPIURL);
      return data;
    } catch (err) {
      console.log('Error', err);
      return null;
    }
  };

  const getCustomerData = async (custID) => {
    try {
      const { data } = await Service.get(`${process.env.REACT_APP_USER_VIEW}?customer_id=${custID}`);
      return data.data;
    } catch (err) {
      console.log('Error', err);
      setError('Something went wrong while fetching CAM details.');
      return null;
    }
  };

  const pollStatus = async (n, applicationNo) => {
    try {
      const colenderStatusRes = await Service.get(`${process.env.REACT_APP_BOB_COLENDER_SERVICE}/status/BOB/${applicationNo}`);
      if (colenderStatusRes.status === 200) {
        if (colenderStatusRes.data.status === 'SUCCESS') {
          setIsLoading({ loader: false, name: null });
          initalLoanDetailsHandler({ open: true, msg: 'Success!', alertType: 'success' });
        } else if (colenderStatusRes.data.status === 'FAILURE' || (n === 3)) {
          setIsLoading({ loader: false, name: null });
          setAlertShow({ open: true, msg: 'Unable to process at the moment, Please try after some time.', alertType: 'error' });
        } else {
          setTimeout(() => {
            pollStatus(n + 1, applicationNo);
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

  const viewDetailsHandler = async (applicationNo) => {
    try {
      let loanData = await getLoanData(`${process.env.REACT_APP_LOAN_LISTING}/${applicationNo}`);
      if (!loanData) {
        loanData = await getLoanData(`${process.env.REACT_APP_LOAN_LISTING}/${applicationNo}?old=1`);
      }
      if (loanData) {
        const custData = await getCustomerData(loanData.customer_id);
        if (custData) {
          const dataToSaveInRedux = cloneDeep(loanData);
          const customerFullDetails = cloneDeep(custData);
          dataToSaveInRedux.customerFullDetails = customerFullDetails;
          dispatch(saveFormData(dataToSaveInRedux));
        } else {
          setError('Something went wrong while fetching CAM details.');
        }
      } else {
        setError('Something went wrong while fetching CAM details.');
      }
      setIsLoading({ loader: false, name: null });
      const colenderStatusRes = await Service.get(`${process.env.REACT_APP_BOB_COLENDER_SERVICE}/status/BOB/${applicationNo}`);
      if (colenderStatusRes.status === 200) {
        if (colenderStatusRes.data.status === 'IN_PROGRESS') {
          setIsLoading({ loader: true, name: 'pageLoader' });
          setTimeout(() => {
            pollStatus(1, applicationNo);
          }, 10000);
        }
      }
    } catch (e) {
      if (e?.response?.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      } else {
        handleClose2('Something went wrong while fetching details. Try again.');
      }
      console.log('Error', e);
      setIsLoading({ loader: false, name: null });
    }
  };

  useEffect(() => {
    viewDetailsHandler(clickedRow?.application_no);
  }, []);

  const retryDisbursal = async () => {
    try {
      setIsLoading({ loader: true, name: 'pageLoader' });
      const colenderStatusRes = await Service.get(`${process.env.REACT_APP_BOB_COLENDER_SERVICE}/status/BOB/${clickedRow?.application_no}`);
      if (colenderStatusRes.status === 200) {
        if (colenderStatusRes.data.status === 'IN_PROGRESS') {
          setTimeout(() => {
            pollStatus(1, clickedRow?.application_no);
          }, 10000);
        } else {
          const reqPayload = {
            application_no: clickedRow?.application_no,
            colender: 'BOB'
          };
          const { data, status } = await Service.post(`${process.env.REACT_APP_BOB_COLENDER_SERVICE}/retry`, reqPayload);
          if (status === 200) {
            setAlertShow({ open: true, msg: data?.msg, alertType: 'success' });
            setTimeout(() => {
              pollStatus(1, clickedRow?.application_no);
            }, 10000);
          }
        }
      }
    } catch (err) {
      console.log('error', err);
      setIsLoading({ loader: false, name: null });
      if (err?.response?.data?.errors?.detail) {
        setAlertShow({ open: true, msg: err.response.data.errors.detail, alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong, Please try again!', alertType: 'error' });
      }
    }
  };

  const checkBankStatus = async () => {
    try {
      setIsLoading({ loader: true, name: 'pageLoader' });
      const { data } = await Service.get(`${process.env.REACT_APP_BOB_COLENDER_SERVICE}/get_status?colender_application_no=${formData?.colender_data?.colender_application_no}`);
      if (data.status === 'CDP') {
        setAlertShow({ open: true, msg: 'Bank Pending, Please try after some time.', alertType: 'success' });
      } else if (data.status === 'CDR') {
        initalLoanDetailsHandler({ open: true, msg: 'Bank Rejected', alertType: 'error' });
      } else {
        initalLoanDetailsHandler({ open: true, msg: 'Bank Success', alertType: 'success' });
      }
    } catch (err) {
      console.log('Error', err);
      setAlertShow({ open: true, msg: 'Something went wrong, Please try again!', alertType: 'error' });
    } finally {
      setIsLoading({ loader: false, name: null });
    }
  };

  return (
    <>
      <ToastMessage
        alertShow={alertShow}
        setAlertShow={setAlertShow}
      />
      { isLoading.loader && isLoading.name === 'pageLoader' ? <PageLoader /> : null}

      {isLoading.loader && isLoading.name === 'fetchInitialData' ? (
        <CenterContainerStyled padding='40px'>
          <CircularProgress color='secondary' />
        </CenterContainerStyled>
      ) : null}
      {
            !(isLoading.loader && isLoading.name === 'fetchInitialData') && !error ? (
              <Grid container padding='0px 10px' display='flex' justifyContent='center'>
                <CAM isAfterDisburse />
                {
                  ['CLR', 'CLP'].includes(clickedRow.status) ? (
                    <CustomDiv>
                      <LoadingButtonPrimary onClick={retryDisbursal}>
                        Retry
                      </LoadingButtonPrimary>
                      <ButtonPrimary onClick={() => setIsColenderOpen(false)}>
                        Cancel
                      </ButtonPrimary>
                    </CustomDiv>
                  ) : null
                }
                {
                  clickedRow.status === 'CDP' ? (
                    <>
                      <Grid container className='border-div'>
                        <BoxFormat
                          header='Bank Status'
                          data={[
                            {
                              label: 'Status',
                              value: <span>Pending</span>,
                              style: { xs: 12 }
                            },
                          ]}
                        />
                      </Grid>
                      <CustomDiv>
                        <LoadingButtonPrimary onClick={checkBankStatus}>
                          Check Status
                        </LoadingButtonPrimary>
                        <ButtonPrimary onClick={() => setIsColenderOpen(false)}>
                          Cancel
                        </ButtonPrimary>
                      </CustomDiv>
                    </>
                  ) : null
                }
                {
                  clickedRow.status === 'CDR' ? (
                    <Grid container className='border-div'>
                      <BoxFormat
                        header='Bank Status'
                        data={[
                          {
                            label: 'Status',
                            value: <span>Rejected</span>,
                            style: { xs: 12 }
                          },
                        ]}
                      />
                    </Grid>
                  ) : null
                }
              </Grid>
            ) : null
        }
      {
         error ? (
           <CenterContainerStyled padding='40px'>
             <Alert severity='error'>{error}</Alert>
           </CenterContainerStyled>
         ) : null
        }
    </>
  );
};
export default ColenderComponent;
