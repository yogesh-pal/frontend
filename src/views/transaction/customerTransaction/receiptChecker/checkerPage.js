/* eslint-disable max-len */
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import {
  Grid,
  InputAdornment, FormHelperText, DialogContentText
} from '@mui/material';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { DialogBox } from '../../../../components';
import { LoadingButtonPrimary, TextFieldStyled, CenterContainerStyled } from '../../../../components/styledComponents';
import { receiptCheckerTableColumn2 } from '../../helper';
import TransactionTable from '../../table';
import { Service } from '../../../../service';
import PageLoader from '../../../../components/PageLoader';
import { errorMessageHandler, checkUserPermission } from '../../../../utils';
import { PERMISSION } from '../../../../constants';

const amountFormat = Intl.NumberFormat('en-IN');

const CheckerPage = (props) => {
  const [tableData, setTableData] = useState([]);
  const [clickedButton, setClickedButton] = useState(null);
  const [isHaveActionPermission, setIsHaveActionPermission] = useState(true);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState({ onApprove: false, onReject: false });
  const [isPageLoading, setIsPageLoading] = useState(false);
  const {
    rowData, setAlertShow, setIsOpen, fetchListingAfterApproveOrReject
  } = props;
  const {
    register, handleSubmit, formState: { errors }, setValue, getValues
  } = useForm();
  const selectedBranch = useSelector((state) => state.user.userDetails.selectedBranch);
  const loginUserEmail = useSelector((state) => state.user.userDetails.email);

  useEffect(() => {
    const tableDataArray = [];
    rowData.loanItems.forEach((item, ind) => {
      tableDataArray.push({
        id: ind,
        customerId: rowData?.customerId,
        lan: item?.loan_account_no,
        customerName: rowData?.customerName,
        dueAmount: item?.due_amount > 0 ? amountFormat.format(Number(item.due_amount).toFixed(2)) : 0,
        dpd: Number(item?.dpd),
        foreclosureAmount: amountFormat.format(Number(item.foreclosure_amount).toFixed(2)),
        paidAmount: amountFormat.format(item?.paid_amount)
      });
    });
    setTableData(tableDataArray);
    if (rowData?.createdBy === loginUserEmail) {
      setIsHaveActionPermission(false);
    }
    if (!checkUserPermission([PERMISSION.receiptChecker])) {
      setIsHaveActionPermission(false);
    }
  }, []);

  const formHandler = () => {
    if (clickedButton === 'Approve') {
      setIsConfirmationOpen({ onApprove: true, onReject: false });
    } else {
      setIsConfirmationOpen({ onApprove: false, onReject: true });
    }
  };
  const pollStatus = async (n, receiptNo) => {
    try {
      const approvalRejectionStatus = await Service.get(`${process.env.REACT_APP_RECEIPT_SERVICE}/fc-status/${receiptNo}`);
      if (approvalRejectionStatus.data.success === true) {
        if (approvalRejectionStatus.data.data.fc_status) {
          const isAllSucess = approvalRejectionStatus.data.data.success.length > 0 && approvalRejectionStatus.data.data.fail.length === 0;
          const isPartialSuccess = approvalRejectionStatus.data.data.success.length > 0 && approvalRejectionStatus.data.data.fail.length > 0;
          const isAllFailed = approvalRejectionStatus.data.data.success.length === 0 && approvalRejectionStatus.data.data.fail.length > 0;
          if (isAllSucess) {
            setAlertShow({ open: true, msg: `Successesfully Approved for - ${approvalRejectionStatus.data.data.success.map((e) => e.loan_account_no).join(', ')}`, alertType: 'success' });
          }
          if (isPartialSuccess) {
            setAlertShow({ open: true, msg: `Successesfully Approved for - ${approvalRejectionStatus.data.data.success.map((e) => e.loan_account_no).join(', ')}  Failed for - ${approvalRejectionStatus.data.data.fail.map((e) => e.loan_account_no).join(', ')}`, alertType: 'success' });
          }
          if (isAllFailed) {
            setAlertShow({ open: true, msg: `Failed for - ${approvalRejectionStatus.data.data.fail.map((e) => e.loan_account_no).join(', ')}`, alertType: 'error' });
          }
          setIsPageLoading(false);
          setIsOpen(false);
          fetchListingAfterApproveOrReject();
        } else if (n === 3) {
          setAlertShow({ open: true, msg: 'Receipt is not approved.', alertType: 'error' });
          setIsPageLoading(false);
          setIsOpen(false);
          fetchListingAfterApproveOrReject();
        } else {
          setTimeout(() => {
            pollStatus(n + 1, receiptNo);
          }, 10000 * (n + 1));
        }
      } else if (n === 3) {
        setAlertShow({ open: true, msg: 'Receipt is not approved.', alertType: 'error' });
        fetchListingAfterApproveOrReject();
        setIsOpen(false);
      } else {
        setTimeout(() => {
          pollStatus(n + 1, receiptNo);
        }, 10000 * (n + 1));
      }
    } catch (err) {
      console.log('error', err);
      setAlertShow({
        open: true,
        msg: 'Something went wrong, Please try again.',
        alertType: 'error'
      });
      fetchListingAfterApproveOrReject();
      setIsOpen(false);
      setIsPageLoading(false);
    }
  };

  const finalSubmitHandler = async () => {
    try {
      setIsConfirmationOpen({ onApprove: false, onReject: false });
      setIsPageLoading(true);
      let url = `${process.env.REACT_APP_RECEIPT_SERVICE}/checker`;
      if (selectedBranch !== 'All Branches') {
        url += `?branch_code=${selectedBranch}`;
      }
      const statusToSend = isConfirmationOpen.onApprove ? 'APV' : 'REJ';
      const res = await Service.put(url, {
        receipt_no: rowData.receiptNo,
        status: statusToSend,
        remarks: getValues('checkerRemark')
      });
      if (res.status === 200 && res.data.message === 'Request in Progress' && statusToSend === 'APV') {
        pollStatus(1, rowData.receiptNo);
      } else if (res.status === 200 && statusToSend === 'REJ') {
        setIsPageLoading(false);
        setIsOpen(false);
        fetchListingAfterApproveOrReject();
      }
    } catch (err) {
      console.log('err', err);
      setIsPageLoading(false);
      const msg = err?.response?.data?.error && errorMessageHandler(err.response.data.error);
      if (msg) {
        setAlertShow({ open: true, msg, alertType: 'error' });
      } else if (err.response?.data?.message) {
        setAlertShow({ open: true, msg: err.response.data.message, alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong, Please try again.', alertType: 'error' });
      }
    }
  };

  const handleConfirmationClose = (event, reason) => {
    if (reason && reason === 'backdropClick') {
      return;
    }
    setIsConfirmationOpen({ onApprove: false, onReject: false });
  };

  const renderError = (name) => {
    if (errors?.[name]) {
      return <FormHelperText error>{errors?.[name].message}</FormHelperText>;
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(formHandler)}>
        <Grid container padding='20px 0px 0px' display='flex' justifyContent='space-between'>
          <Grid item xl={3} lg={3} md={4} sm={12} xs={12} padding='0px 20px'>
            <TextFieldStyled
              label='Receipt No'
              disabled
              value={rowData?.receiptNo}
            />
          </Grid>
        </Grid>
        <Grid container padding='20px'>
          <TransactionTable
            rows={tableData}
            columns={receiptCheckerTableColumn2}
            hideFooter
          />
        </Grid>
        <Grid container padding='0px 10px' display='flex' justifyContent='space-between'>
          <Grid item xl={3} lg={3} md={4} sm={12} xs={12} padding='10px'>
            <TextFieldStyled
              label='Total Amount'
              InputProps={{
                startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>,
              }}
              disabled
              value={rowData?.totalAmount}
            />
          </Grid>
          <Grid item xl={3} lg={3} md={4} sm={12} xs={12} padding='10px'>
            <TextFieldStyled
              label='Mode'
              value={rowData?.paymentMode === 'CASH' ? 'Cash' : 'Online'}
              disabled
            />
          </Grid>
        </Grid>
        <Grid container padding='0px 10px' display='flex' justifyContent='space-between'>
          <Grid item xl={3} lg={3} md={4} sm={12} xs={12} padding='10px'>
            <TextFieldStyled
              label='Maker Remark'
              multiline
              maxRows={3}
              defaultValue={rowData?.makerRemark}
              disabled
            />
          </Grid>
          { rowData?.paymentMode === 'ONLN'
          && (
          <Grid item xl={3} lg={3} md={4} sm={12} xs={12} padding='10px'>
            <TextFieldStyled
              label='UTR Number'
              multiline
              maxRows={3}
              defaultValue={rowData?.utrNumber}
              disabled
            />
          </Grid>
          )}
        </Grid>
        <Grid container padding='0px 10px'>
          <Grid item xl={3} lg={3} md={4} sm={12} xs={12} padding='10px'>
            <TextFieldStyled
              label='Checker Remark*'
              multiline
              maxRows={3}
              {...register('checkerRemark', {
                onChange: (e) => {
                  if (e.target.value.trim().length) {
                    setValue('checkerRemark', e.target.value, { shouldValidate: true });
                    return;
                  }
                  setValue('checkerRemark', null, { shouldValidate: true });
                },
                required: 'Please enter checker remark',
                maxLength: { value: 200, message: 'Maximum 200 characters allowed' }
              })}
            />
            {renderError('checkerRemark')}
          </Grid>
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12} padding='10px 0px' display='flex' justifyContent='center'>
            <LoadingButtonPrimary
              type='submit'
              onClick={() => setClickedButton('Approve')}
              disabled={!isHaveActionPermission}
            >
              Approve
            </LoadingButtonPrimary>
            <LoadingButtonPrimary
              type='submit'
              onClick={() => setClickedButton('Reject')}
              disabled={!isHaveActionPermission}
            >
              Reject
            </LoadingButtonPrimary>
          </Grid>
        </Grid>
      </form>
      { isPageLoading ? <PageLoader /> : null}
      <DialogBox
        isOpen={isConfirmationOpen.onApprove || isConfirmationOpen.onReject}
        title=''
        handleClose={handleConfirmationClose}
        width='auto'
        padding='40px'
      >
        <DialogContentText>
          {isConfirmationOpen.onApprove ? `Are you sure you want to Approve the Receipt No. ${rowData?.receiptNo}?`
            : `Are you sure you want to reject the Receipt No. ${rowData?.receiptNo}?`}
        </DialogContentText>
        <CenterContainerStyled flexDirection='row' padding='20px 0 0 0'>
          <LoadingButtonPrimary
            onClick={finalSubmitHandler}
            variant='contained'
            loading={false}
          >
            Yes
          </LoadingButtonPrimary>
          <LoadingButtonPrimary onClick={() => setIsConfirmationOpen({ onApprove: false, onReject: false })}>No</LoadingButtonPrimary>
        </CenterContainerStyled>
      </DialogBox>
    </>
  );
};
export default React.memo(CheckerPage);
