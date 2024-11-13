/* eslint-disable max-len */
import React, { useEffect, useState } from 'react';
import { cloneDeep } from 'lodash';
import { useDispatch } from 'react-redux';
import {
  CircularProgress
} from '@mui/material';
import {
  TableComponent,
  FormGenerator,
  DialogBox,
  ToastMessage
} from '../../../../components';
import {
  deviationFieldsColumns,
  viewDeviationDetailsJson
} from '../helper';
import {
  ButtonPrimary,
  CenterContainerStyled,
  LoadingButtonSecondaryPrimary,
} from '../../../../components/styledComponents';
import { Service } from '../../../../service';
import ApprovalComponent from './approvalComponent';

import { saveAppId, saveFormData } from '../../../../redux/reducer/loanMaker';
import { numberFormat } from '../../../../utils';
import { remarkJson } from './remarkJson';

const amountFormat = Intl.NumberFormat('en-IN');

const CheckerComponent = ({
  clickedRow, setIsOpen, initalLoanDetailsHandler, handleClose
}) => {
  const [formConfiguration, setFormConfiguration] = useState();
  const [showBtn, setShowBtn] = useState(false);
  const [loading, setLoading] = useState({
    name: 'INITIAL',
    loader: true
  });
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const dispatch = useDispatch();
  const [deviationDetails, setDeviationDetails] = useState([]);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [isCertificateViewed, setIsCertificateViewed] = useState(false);
  const [isSendBackOpen, setIsSendBackOpen] = useState(false);
  const statusEnum = {
    REJ: 'REJECT',
    OPN: 'PENDING',
    APV: 'APPROVE'
  };

  const openSendBackHandler = () => {
    setIsSendBackOpen(true);
  };

  const viewDeviationHandler = async (details) => {
    try {
      setLoading({
        name: 'TABLE',
        loader: true
      });
      const { status, data } = await Service.get(`${process.env.REACT_APP_APPLICATION_LOS_CHECKER}/${details?.application_no}/${details?.status === 'DVN' ? 'deviation_checker' : 'application_checker'}`);
      if (status === 200 && data?.deviations) {
        if (data.authorized_checker && data?.status === 'CHK') {
          setShowBtn(true);
        }
        const deviationDetailsTemp = data.deviations.map((item, index) => {
          if (item.authorized_checker && data?.status === 'DVN') {
            setShowBtn(true);
          }
          return {
            _id: index,
            index,
            currentStatus: statusEnum[item.status],
            ...item
          };
        });
        setDeviationDetails(deviationDetailsTemp);
      }
      setLoading({
        name: '',
        loader: false
      });
    } catch (e) {
      if (e?.response?.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      } else {
        setAlertShow({
          open: true,
          msg: 'Something went wrong while fetch checker details. Try again.',
          alertType: 'error'
        });
      }
      console.log('Error', e);
    }
  };

  const viewDetailsHandler = async (details) => {
    try {
      const request1 = Service.get(`${process.env.REACT_APP_LOAN_LISTING}/${details?.application_no}`);
      const request2 = Service.get(`${process.env.REACT_APP_USER_VIEW}?internal_lan=${clickedRow?.application_no}&fc=1`);
      const request3 = Service.get(`${process.env.REACT_APP_USER_VIEW}?customer_id=${clickedRow?.customer_id}`);
      await Promise.all([request1, request2, request3]).then((responses) => {
        viewDeviationHandler(details);
        dispatch(saveAppId(clickedRow?.application_no));
        const dataToSet = responses[0]?.data;
        const customerInfo = responses[1]?.data?.data;
        const customerFullDetails = cloneDeep(responses[2].data.data);
        dataToSet.customerFullDetails = customerFullDetails;
        dataToSet.interaccounts = dataToSet.interaccounts.map((item) => {
          item.loan_amount_transfer = numberFormat(item.loan_amount_transfer);
          return item;
        });
        if (dataToSet.applied_loan_amount) {
          dataToSet.applied_loan_amount = numberFormat(dataToSet?.applied_loan_amount);
        }
        if (dataToSet.balance_amount_transfer) {
          dataToSet.balance_amount_transfer = numberFormat(dataToSet?.balance_amount_transfer);
        }
        if (dataToSet.cash_disbursment) {
          dataToSet.cash_disbursment = numberFormat(dataToSet?.cash_disbursment);
        }
        if (dataToSet.max_eligible_loan_amount) {
          dataToSet.max_eligible_loan_amount = numberFormat(dataToSet?.max_eligible_loan_amount);
        }
        if (dataToSet.net_disbursment) {
          dataToSet.net_disbursment = numberFormat(dataToSet?.net_disbursment);
        }
        if (dataToSet.online_disbursment) {
          dataToSet.online_disbursment = numberFormat(dataToSet?.online_disbursment);
        }
        if (dataToSet.requested_loan_amount) {
          dataToSet.requested_loan_amount = numberFormat(dataToSet?.requested_loan_amount);
        }
        if (dataToSet.scheme_eligible_amount) {
          dataToSet.scheme_eligible_amount = numberFormat(dataToSet?.scheme_eligible_amount);
        }
        if (dataToSet.scheme_max_loan_amount) {
          dataToSet.scheme_max_loan_amount = numberFormat(dataToSet?.scheme_max_loan_amount);
        }
        if (dataToSet.scheme_min_loan_amount) {
          dataToSet.scheme_min_loan_amount = numberFormat(dataToSet?.scheme_min_loan_amount);
        }
        dataToSet.dob = customerInfo?.dob;
        dataToSet.primary_mobile_number = customerInfo?.primary_mobile_number;
        dataToSet.total_loan = customerInfo.loan_summary.total_loan;
        dataToSet.active_loans = customerInfo.loan_summary.active_loan;
        dataToSet.closed_loans = customerInfo.loan_summary.closed_loan;
        if (customerInfo.loan_summary.total_pos) {
          dataToSet.total_pos = amountFormat.format(customerInfo.loan_summary.total_pos);
        }
        if (customerInfo.loan_summary.total_interest_overdue) {
          dataToSet.total_interest_overdue = amountFormat.format(customerInfo.loan_summary.total_interest_overdue);
        }
        dataToSet.npa_status = customerInfo.loan_summary.npa_status;
        dataToSet.count_of_default_account = customerInfo.loan_summary.count_of_default_account;
        dataToSet.count_of_npa_account = customerInfo.loan_summary.count_of_npa_account;
        dataToSet.count_of_auctioned_account = customerInfo.loan_summary.count_of_auctioned_account;
        dataToSet.count_of_spurious_account = customerInfo.loan_summary.count_of_spurious_account;
        dataToSet.lien_status = customerInfo.loan_summary.lien_status === 'Y' ? 'Yes' : 'No';
        dataToSet.legal_status = customerInfo.loan_summary.legal_status === 'Y' ? 'Yes' : 'No';
        dispatch(saveFormData(dataToSet));
        setFormConfiguration(cloneDeep(viewDeviationDetailsJson(setIsCertificateViewed)));
      }).catch((e) => {
        console.log('error', e);
        if (e?.response?.status === 403) {
          handleClose('You do not have permission to perform this action.');
        } else {
          handleClose('Something went wrong while fetching loan details. Try again.');
        }
      });
    } catch (e) {
      console.log('Error', e);
      if (e?.response?.status === 403) {
        handleClose('You do not have permission to perform this action.');
      } else {
        handleClose('Something went wrong while fetching loan details. Try again.');
      }
      handleClose('Something went wrong while fetching loan details. Try again.');
    }
  };

  const submitDetailsHandler = async () => {
    try {
      setLoading({
        name: 'SUBMIT',
        loader: true
      });
      const filterApprove = [];
      let remarksStatus = false;
      deviationDetails.forEach((item) => {
        if (item.status === 'OPN'
          && (item.currentStatus === 'REJECT' || item.currentStatus === 'APPROVE' || item.currentStatus === 'PENDING' || item?.checker_remarks?.length)) {
          if ((!item?.checker_remarks?.length
            && (item.currentStatus === 'APPROVE' || item.currentStatus === 'REJECT'))
            || (item?.checker_remarks?.length && item.currentStatus === 'PENDING')
          ) {
            remarksStatus = true;
          }

          if (item?.checker_remarks?.length && (item.currentStatus === 'APPROVE' || item.currentStatus === 'REJECT')) {
            filterApprove.push({
              // eslint-disable-next-line no-underscore-dangle
              deviation_id: item?._id,
              checker_remarks: item?.checker_remarks,
              decision: item?.currentStatus
            });
          }
        }
      });

      if (remarksStatus || filterApprove?.length === 0) {
        setIsConfirmationOpen(false);
        setAlertShow({
          open: true,
          msg: 'Your decision or remarks missing for the case.',
          alertType: 'error'
        });
        setLoading({
          name: '',
          loader: false
        });
        return;
      }

      const { status } = await Service.put(`${process.env.REACT_APP_APPLICATION_LOS_CHECKER}/${clickedRow?.application_no}/deviation_checker`, {
        deviations: filterApprove
      });

      if (status === 200) {
        setAlertShow({
          open: true,
          msg: 'Deviation details updated successfully.',
          alertType: 'success'
        });
        setIsOpen({ isCheckerOpen: false, isDeviationOpen: false, isDisbursementOpen: false });
        setIsConfirmationOpen(false);
        initalLoanDetailsHandler();
        setLoading({
          name: '',
          loader: false
        });
        return;
      }
      setLoading({
        name: '',
        loader: false
      });
      setAlertShow({
        open: true,
        msg: 'Something went wrong while updating deviation details. Try again.',
        alertType: 'error'
      });
    } catch (e) {
      setLoading({
        name: '',
        loader: false
      });
      if (e?.response?.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      } else {
        setAlertShow({
          open: true,
          msg: 'Something went wrong while updating deviation details. Try again.',
          alertType: 'error'
        });
      }
      console.log('Error', e);
    }
  };

  const sendBackHandler = async (formValues) => {
    try {
      setLoading({
        name: '',
        loader: true
      });
      const {
        remarks
      } = formValues;

      const { status } = await Service.put(`${process.env.REACT_APP_APPLICATION_LOS_CHECKER}/${clickedRow?.application_no}/send_back`, {
        application_stage: 'stage6',
        send_back_history: {
          remarks
        }
      });

      if (status === 200) {
        setAlertShow({
          open: true,
          msg: 'Deviation details updated successfully.',
          alertType: 'success'
        });
        setIsOpen({ isCheckerOpen: false, isDeviationOpen: false, isDisbursementOpen: false });
        setIsConfirmationOpen(false);
        initalLoanDetailsHandler();
        setLoading({
          name: '',
          loader: false
        });
        return;
      }
      setLoading({
        name: '',
        loader: false
      });
      setAlertShow({
        open: true,
        msg: 'Something went wrong while send back. Try again.',
        alertType: 'error'
      });
    } catch (e) {
      setLoading({
        name: '',
        loader: false
      });
      if (e?.response?.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      } else {
        setAlertShow({
          open: true,
          msg: 'Something went wrong while send back. Try again.',
          alertType: 'error'
        });
      }
      console.log('Error', e);
    }
  };

  const onCancelHandler = () => {
    setIsSendBackOpen(false);
  };

  const remarkHandler = remarkJson(
    onCancelHandler,
  );

  const finalSubmitHandler = () => {
    submitDetailsHandler();
  };

  const handleClose2 = () => {
    setIsConfirmationOpen(false);
  };

  useEffect(() => {
    if (clickedRow) viewDetailsHandler(clickedRow);
  }, [clickedRow]);

  return (
    <>
      <ToastMessage
        alertShow={alertShow}
        setAlertShow={setAlertShow}
      />
      {
  clickedRow && formConfiguration ? (
    <>
      <DialogBox
        isOpen={isConfirmationOpen}
        title=''
        handleClose={handleClose2}
        width='auto'
        padding='40px'
      >
        Are you sure you want to submit your decision?
        <CenterContainerStyled flexDirection='row' padding='20px 0 0 0'>
          <LoadingButtonSecondaryPrimary
            onClick={finalSubmitHandler}
            variant='contained'
            loading={loading?.name === 'SUBMIT' && loading?.loader}
          >
            Yes
          </LoadingButtonSecondaryPrimary>
          <ButtonPrimary onClick={handleClose2}>No</ButtonPrimary>
        </CenterContainerStyled>
      </DialogBox>
      <DialogBox
        isOpen={isSendBackOpen}
        title=''
        handleClose={onCancelHandler}
        width='auto'
        padding='40px'
      >
        Are you sure you want to send back ?

        <FormGenerator
          formDetails={remarkHandler}
          setFormDetails={setFormConfiguration}
          formHandler={sendBackHandler}
          alertShow={alertShow}
          setAlertShow={setAlertShow}
        />
      </DialogBox>
      <FormGenerator
        formDetails={formConfiguration}
      />
      {
        clickedRow?.status !== 'CHK' ? (
          <>
            <TableComponent
              padding='0px 20px 20px'
              rows={deviationDetails}
              columns={deviationFieldsColumns(
                deviationDetails,
                setDeviationDetails
              )}
              checkboxAllowed={false}
              // handleCellClick={viewDetailsHandler}
              clientPaginationMode={false}
              loading={loading?.name === 'TABLE' && loading?.loader}
              cursor='pointer'
              display='none'
              hideFooterPagination
            />
            {
              clickedRow?.status === 'DVN' && showBtn && (
                <CenterContainerStyled flexDirection='row'>
                  <ButtonPrimary
                    onClick={() => setIsConfirmationOpen(true)}
                  >
                    Submit
                  </ButtonPrimary>
                  <ButtonPrimary
                    onClick={openSendBackHandler}
                  >
                    Send Back
                  </ButtonPrimary>
                  <ButtonPrimary onClick={() => setIsOpen({ isCheckerOpen: false, isDeviationOpen: false, isDisbursementOpen: false })}>Cancel</ButtonPrimary>
                </CenterContainerStyled>
              )
            }
          </>
        )
          : (
            <ApprovalComponent
              searchDetails={deviationDetails}
              setIsOpen={setIsOpen}
              initalLoanDetailsHandler={initalLoanDetailsHandler}
              clickedRow={clickedRow}
              loading={loading}
              showBtn={showBtn}
              openSendBackHandler={openSendBackHandler}
              isCertificateViewed={isCertificateViewed}
            />
          )
      }

    </>
  ) : (
    <CenterContainerStyled padding='40px'>
      <CircularProgress color='secondary' />
    </CenterContainerStyled>
  )
  }
    </>
  );
};

export default React.memo(CheckerComponent);
