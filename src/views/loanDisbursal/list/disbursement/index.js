/* eslint-disable max-len */
import moment from 'moment';
import { cloneDeep } from 'lodash';
import styled from '@emotion/styled';
import React, { useState, useEffect, useRef } from 'react';
import {
  CircularProgress, Alert, Dialog, DialogActions,
  DialogContentText, DialogContent, Grid
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { Service } from '../../../../service';
import { errorMessageHandler, getDecodedToken, numberFormat } from '../../../../utils';
import { useScreenSize } from '../../../../customHooks';
import PageLoader from '../../../../components/PageLoader';
import { FormGenerator, ToastMessage } from '../../../../components';
import { resendReducer } from '../../../../redux/reducer/customerCreation';
import { viewDisbursementDetailsJson, otpFormJsonDetails } from '../helper';
import { LoadingButtonPrimary, CenterContainerStyled, TextFieldStyled } from '../../../../components/styledComponents';
import { COLENDERENUM, SERVICEURL } from '../../../../constants';
import store from '../../../../redux/store';

const CustomDiv = styled.div(() => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
}));
const DownLoadButtonDiv = styled.div(() => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: '20px'
}));
const CustomGrid = styled(Grid)(({ screen }) => ({
  padding: `20px ${['xs', 'sm'].includes(screen) ? '0px' : '5px'} 10px 0px !important`
}));

const OTPFormDiv = styled.div(({ padding }) => ({
  padding: padding || '0 20px'
}));

const DisbursementComponent = ({
  clickedRow, initalLoanDetailsHandler, setIsOpen,
  handleClose: handleClose2
}) => {
  const [customerInfo, setCustomerInfo] = useState(null);
  const [isOTPVerified, setIsOTPVerified] = useState(false);
  const [isShowPDFError, setIsShowPDFError] = useState(false);
  const [isCreatedToday, setIsCreatedToday] = useState(false);
  const [formConfiguration, setFormConfiguration] = useState(null);
  const [disbursementStatus, setDisbursementStatus] = useState(null);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [cashDisbursementAmt, setcashDisbursementAmt] = useState(null);
  const [otpFormConfiguration, setOTPFormConfiguration] = useState(null);
  const [isLoginUserLoanMaker, setIsLoginUserLoanMaker] = useState(false);
  const [isLoading, setIsLoading] = useState({ loader: false, name: null });
  const [isLoanDisbursed, setIsLoanDisbursed] = useState({ disbursed: false, loanAccountNo: null });
  const customerDetailsRef = useRef();

  const storeState = store.getState();
  const { selectedBranch } = storeState.user.userDetails;

  const dispatch = useDispatch();
  const screen = useScreenSize();
  const userData = getDecodedToken();
  const userOtp = useSelector((state) => state.user.submitFormValues);

  const pollStatus = async (n, applicationNo) => {
    try {
      const disbursementStatusRes = await Service.get(`${process.env.REACT_APP_DISBURSEMENT_STATUS}/${applicationNo}`);
      if (disbursementStatusRes.status === 200) {
        setDisbursementStatus(disbursementStatusRes.data.status);
        if (disbursementStatusRes.data.status === 'SUCCESS') {
          setIsLoading({ loader: false, name: null });
          setIsLoanDisbursed({ disbursed: true, loanAccountNo: disbursementStatusRes.data.loan_account_no });
        } else if (disbursementStatusRes.data.status === 'FAILURE' || (n === 3)) {
          let error = 'Not able to disburse loan at this moment, Please try after some time.';
          if (disbursementStatusRes?.data?.msg) {
            error = `${error}\n${disbursementStatusRes.data.msg}`;
          }
          setIsLoading({ loader: false, name: null });
          setAlertShow({ open: true, msg: errorMessageHandler(error, true), alertType: 'error' });
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
      const disbursementStatusRes = await Service.get(`${process.env.REACT_APP_DISBURSEMENT_STATUS}/${applicationNo}`);
      if (disbursementStatusRes.status === 200) {
        setDisbursementStatus(disbursementStatusRes.data.status);
        if (disbursementStatusRes.data.status === 'IN_PROGRESS') {
          setIsLoading({ loader: true, name: 'approve' });
          setTimeout(() => {
            pollStatus(1, applicationNo);
          }, 10000);
        }
      }
      const { status, data } = await Service.get(`${process.env.REACT_APP_LOAN_LISTING}/${applicationNo}`);
      if (userData?.email === data?.maker_email) {
        setIsLoginUserLoanMaker(true);
      }
      if (moment().isSame(data?.loan_creation_date, 'day')) {
        setIsCreatedToday(true);
      }
      if (status === 200) {
        const request1 = Service.get(`${process.env.REACT_APP_USER_VIEW}?customer_id=${data.customer_id}`);
        const request2 = Service.get(`${process.env.REACT_APP_USER_VIEW}?customer_id=${data.customer_id}&fc=1&token=1&is_deviation=1`);
        await Promise.all([request1, request2]).then(([response1, response2]) => {
          const customerData = {
            customerId: data?.customer_id,
            customerName: `${data?.first_name} ${data?.middle_name} ${data?.last_name}`,
            applicationNo: data?.application_no,
            schemeName: data?.scheme_name,
            roi: data?.rate_of_interest,
            disbursementAmt: data?.net_disbursment ? numberFormat(data.net_disbursment) : '0',
            cashDisbursementAmt: data?.cash_disbursment ? numberFormat(data.cash_disbursment) : '0',
            onlineDisbursementAmt: data?.online_disbursment ? numberFormat(data.online_disbursment) : '0',
            bankAccountNumber: response1.data?.data?.account_number,
            ifsc: response1.data?.data?.ifsc,
            bankName: response1.data?.data?.bank_name,
            branchName: response1.data?.data?.branch_name,
            bankVerificationStatus: response1.data?.data?.is_bank_verified ? 'VALID' : 'INVALID',
          };

          customerDetailsRef.current = {
            lms_response: response2?.data?.data?.dt,
            customer_id: data?.customer_id,
            colender: data?.colender,
            request_amount: data?.applied_loan_amount
          };
          const totalDisbursedAmount = response2?.data?.data?.loan_detail.reduce((accumulator, currentValue) => accumulator + currentValue.disburshment_amout, 0);
          setCustomerInfo({
            totalDisbursedAmount,
            loanDisbursementAmt: data.net_disbursment,
            panNo: response2?.data?.data?.pan_no,
            disbursementMode: data.net_disbursment_mode,
            vpa: data?.upi_details?.vpa
          });
          setcashDisbursementAmt(data?.cash_disbursment || 0);
          if (data?.is_otp_validated) {
            setIsOTPVerified(true);
          } else {
            const additionalInfo = {
              selectedBranch,
              branchLanguage: userData.branch_language_map
            };
            setOTPFormConfiguration(otpFormJsonDetails({
              applicationNo: data?.application_no,
              mobile: data?.customer_mobile_number,
              setAlertShow,
              dispatch,
              setIsOTPVerified,
              resendReducer,
              additionalInfo
            }));
          }
          setFormConfiguration(cloneDeep(viewDisbursementDetailsJson(customerData)));
        }).catch((err) => {
          console.log('Error', err);
          handleClose2('Something went wrong while fetching details. Try again.');
        });
      }
    } catch (e) {
      if (e?.response?.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      } else {
        handleClose2('Something went wrong while fetching details. Try again.');
      }
      console.log('Error', e);
    }
  };

  useEffect(() => {
    viewDetailsHandler(clickedRow?.application_no);
  }, []);

  const retryDisbursal = async (applicationNo, token) => {
    try {
      let reqPayload = {
        application_no: applicationNo,
        cash_validation_token: token
      };
      if (customerInfo.disbursementMode === 'UPI') {
        const limitPayload = {
          virtualAddress: customerInfo.vpa
        };
        const { data } = await Service.post(process.env.REACT_APP_CHECK_UPI_LIMIT, limitPayload);

        reqPayload = {
          ...reqPayload,
          upi_limit_token: data.data.upi_verify_token
        };
      }
      const { data, status } = await Service.post(`${process.env.REACT_APP_DISBURSAL_RETRY}`, reqPayload);
      if (status === 200) {
        setAlertShow({ open: true, msg: data?.msg, alertType: 'success' });
        setTimeout(() => {
          pollStatus(1, applicationNo);
        }, 10000);
      }
    } catch (err) {
      console.log('error', err);
      let errorMessage = 'Something went wrong, Please try again!';
      setIsLoading({ loader: false, name: null });
      if (err?.response?.data?.errors?.detail) {
        errorMessage = err?.response?.data?.errors?.detail;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setAlertShow({ open: true, msg: errorMessage, alertType: 'error' });
    }
  };

  const formHandler = async (approveOrReject) => {
    try {
      setIsLoading({ loader: true, name: approveOrReject });
      if (approveOrReject === 'approve') {
        const reqBodyAmtVal = customerDetailsRef.current;
        if (reqBodyAmtVal?.colender === COLENDERENUM.IOBAGRI) {
          const res = await Service.post(SERVICEURL.COLENDER.VALIDATEAMOUNT, reqBodyAmtVal);

          const { success, message } = res.data;

          if (!success) {
            setAlertShow({ open: true, msg: message, alertType: 'error' });
            return false;
          }
        }

        if (customerInfo.panNo.trim().length === 0 && (customerInfo.totalDisbursedAmount + customerInfo.loanDisbursementAmt) >= 200000) {
          setIsLoading({ loader: false, name: null });
          setAlertShow({ open: true, msg: 'Customer’s total disbursement till date is above 2 Lacs, hence PAN card is mandatory.', alertType: 'error' });
          return false;
        }
        const response = await Service.get(`${process.env.REACT_APP_CASH_SERVICE}/cashandpacketsummary/cashpos`);
        if (cashDisbursementAmt > response?.data?.data?.closing_balance) {
          setIsLoading({ loader: false, name: null });
          setAlertShow({ open: true, msg: 'Branch Cash after this cash disbursement will be less than zero. Hence, this cash disbursement is not allowed.', alertType: 'error' });
          return false;
        }
        if (disbursementStatus === 'PENDING') {
          let disbursePayload = {
            decision: 'approve',
            cash_validation_token: response.data?.data?.dt
          };
          if (customerInfo.disbursementMode === 'UPI') {
            const limitPayload = {
              virtualAddress: customerInfo.vpa
            };
            const { data } = await Service.post(process.env.REACT_APP_CHECK_UPI_LIMIT, limitPayload);
            disbursePayload = {
              ...disbursePayload,
              upi_limit_token: data.data.upi_verify_token
            };
          }

          const { data } = await Service.put(`${process.env.REACT_APP_APPLICATION_LOS_CHECKER}/${clickedRow.application_no}/disburse`, disbursePayload);
          if (data?.success) {
            setAlertShow({ open: true, msg: `Disburment is in progress for application number ${clickedRow.application_no} Please wait for few minutes`, alertType: 'success' });
            setTimeout(() => {
              pollStatus(1, clickedRow.application_no);
            }, 10000);
          }
        } else if (disbursementStatus === 'IN_PROGRESS') {
          setTimeout(() => {
            pollStatus(1, clickedRow.application_no);
          }, 10000);
        } else {
          retryDisbursal(clickedRow.application_no, response.data?.data?.dt);
        }
      } else {
        const { data } = await Service.get(`${process.env.REACT_APP_APPLICATION_LOS_CHECKER}/${clickedRow.application_no}/disburse/${approveOrReject}`);
        if (data?.success) {
          const successMsg = { open: true, msg: `Your Gold loan with application number ${clickedRow.application_no} has been rejected!`, alertType: 'success' };
          setIsLoading({ loader: false, name: null });
          setIsOpen({ isCheckerOpen: false, isDeviationOpen: false, isDisbursementOpen: false });
          initalLoanDetailsHandler(successMsg);
        }
      }
    } catch (err) {
      console.log('err', err);
      let errorMessage = 'Something went wrong, Please try again!';
      setIsLoading({ loader: false, name: null });
      if (err?.response?.data?.errors?.detail) {
        errorMessage = err?.response?.data?.errors?.detail;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setAlertShow({ open: true, msg: errorMessage, alertType: 'error' });
    }
  };

  const handleClose = (event, reason) => {
    if (reason && reason === 'backdropClick') {
      return;
    }
    setIsLoanDisbursed({ disbursed: false, loanAccountNo: null });
    setIsOpen({ isCheckerOpen: false, isDeviationOpen: false, isDisbursementOpen: false });
    initalLoanDetailsHandler();
  };
  const downloadFile = async (docName) => {
    try {
      setIsShowPDFError(false);
      setIsLoading({ loader: true, name: docName });
      const { data } = await Service.get(`${process.env.REACT_APP_APPLICATION_LOS_CHECKER}/${clickedRow.application_no}/documents/${docName === 'branchCopy' ? 3 : 2}`);
      if (data.success) {
        window.open(data?.data, '_self');
      } else {
        setIsShowPDFError(true);
      }
    } catch (err) {
      console.log('err', err);
      setIsShowPDFError(true);
    } finally {
      setTimeout(() => {
        setIsLoading({ loader: false, name: null });
      }, 1000);
    }
  };

  return (
    <>
      <ToastMessage
        alertShow={alertShow}
        setAlertShow={setAlertShow}
      />
      { isLoading.loader && (isLoading.name === 'approve' || isLoading.name === 'reject') ? <PageLoader /> : null}
      {formConfiguration ? (
        <>
          <FormGenerator
            formDetails={formConfiguration}
          />
          {
            isLoginUserLoanMaker && isCreatedToday
              ? (
                <>
                  <OTPFormDiv>
                    OTP Verification
                    {isOTPVerified ? (
                      <Grid container>
                        <CustomGrid item xl={6} lg={6} md={6} sm={12} xs={12} screen={screen}>
                          <TextFieldStyled
                            label='Status'
                            variant='outlined'
                            disabled
                            defaultValue='VALID'
                          />
                        </CustomGrid>
                      </Grid>
                    ) : (
                      <OTPFormDiv padding='20px 0px'>
                        <FormGenerator
                          formDetails={otpFormConfiguration}
                          setFormDetails={setOTPFormConfiguration}
                          formHandler={formHandler}
                          alertShow={alertShow}
                          setAlertShow={setAlertShow}
                          isLoading={isLoading}
                        />
                      </OTPFormDiv>
                    )}
                  </OTPFormDiv>
                  <Dialog
                    open={isLoanDisbursed.disbursed}
                    onClose={handleClose}
                    disableEscapeKeyDown
                  >
                    <DialogContent>
                      {isShowPDFError && <Alert severity='error' style={{ marginBottom: '10px' }}>Please try after 30 seconds.</Alert>}
                      <DialogContentText>
                        Congratulations, the loan account number
                        {' '}
                        {isLoanDisbursed.loanAccountNo}
                        {' '}
                        has been created and disbursed successfully!
                      </DialogContentText>
                      <DownLoadButtonDiv>
                        <LoadingButtonPrimary onClick={() => downloadFile('branchCopy')} loading={isLoading.loader && isLoading.name === 'branchCopy'}>View Branch Copy</LoadingButtonPrimary>
                        <LoadingButtonPrimary onClick={() => downloadFile('borrowerCopy')} loading={isLoading.loader && isLoading.name === 'borrowerCopy'}>Print Borrower Copy</LoadingButtonPrimary>
                      </DownLoadButtonDiv>
                    </DialogContent>
                    <DialogActions>
                      <LoadingButtonPrimary onClick={handleClose}>Okay</LoadingButtonPrimary>
                    </DialogActions>
                  </Dialog>
                  <CustomDiv>
                    <LoadingButtonPrimary
                      disabled={!isOTPVerified && userOtp?.OTPVerificationStatus !== 'VALID'}
                      onClick={() => formHandler('approve')}
                    >
                      Disburse
                    </LoadingButtonPrimary>
                    <LoadingButtonPrimary onClick={() => formHandler('reject')}>
                      Reject
                    </LoadingButtonPrimary>
                  </CustomDiv>
                </>
              )
              : null
}
        </>
      ) : (
        <CenterContainerStyled padding='40px'>
          <CircularProgress color='secondary' />
        </CenterContainerStyled>
      )}
    </>
  );
};
export default React.memo(DisbursementComponent);
