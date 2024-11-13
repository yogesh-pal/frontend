/* eslint-disable max-len */
import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import {
  Grid, DialogContentText, FormHelperText, InputAdornment
} from '@mui/material';
import { useForm } from 'react-hook-form';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { ToastMessage, DialogBox } from '../../../../../components';
import { HeadingMaster2 } from '../../../helper';
import { Service } from '../../../../../service';
import {
  TextFieldStyled, LoadingButtonPrimary, CenterContainerStyled, ButtonPrimary
} from '../../../../../components/styledComponents';
import store from '../../../../../redux/store';

const CustomForm = styled.form`
  padding: 20px 0px;
`;

const initialConfirmationState = {
  onPendingApprove: false,
  onPendingReject: false,
  onPendingApproveSuccess: false,
  onPendingRejectSuccess: false,
  onHandoverApprove: false,
  onHandoverReject: false,
  onHandoverApproveSuccess: false,
  onHandoverRejectSuccess: false,
  onAcknowledgerApprove: false,
  onAcknowledgerReject: false,
  onAcknowledgerApproveSuccess: false,
  onAcknowledgerRejectSuccess: false,
};

const IBCTFlow = (props) => {
  const [formData, setFormData] = useState(null);
  const [requestStatus, setRequestStatus] = useState(null);
  const [clickedButton, setClickedButton] = useState(null);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [loading, setLoading] = useState({ loader: false, name: null });
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(initialConfirmationState);
  const { rowData, onSuccessClose } = props;
  const { currentCheckerRole, subroles } = rowData;
  const state = store.getState();
  const { role } = state.user.userDetails;
  const {
    register, handleSubmit, setValue, formState: { errors }
  } = useForm();

  // console.log('subroles', subroles);
  // console.log('role', role);
  // console.log('roleCurrentChecker', currentCheckerRole);

  useEffect(() => {
    setRequestStatus(rowData.status);
  }, []);

  const submitHandler = (values) => {
    setFormData(values);
    setIsConfirmationOpen({ ...isConfirmationOpen, [clickedButton]: true });
  };

  const finalSubmitHandler = async () => {
    try {
      setLoading({ loader: true, name: 'onSubmit' });
      let statusToSend = null;
      if (isConfirmationOpen.onPendingApprove) {
        statusToSend = 'REQAPPV';
      }
      if (isConfirmationOpen.onPendingReject) {
        statusToSend = 'REQREJC';
      }
      if (isConfirmationOpen.onHandoverApprove) {
        statusToSend = 'HADAPPV';
      }
      if (isConfirmationOpen.onHandoverReject) {
        statusToSend = 'HADREJC';
      }
      if (isConfirmationOpen.onAcknowledgerApprove) {
        statusToSend = 'ACKAPPV';
      }
      if (isConfirmationOpen.onAcknowledgerReject) {
        statusToSend = 'ACKREJC';
      }
      const revisedConfirmationState = {
        onPendingApprove: false,
        onPendingReject: false,
        onPendingApproveSuccess: isConfirmationOpen.onPendingApprove,
        onPendingRejectSuccess: isConfirmationOpen.onPendingReject,
        onHandoverApprove: false,
        onHandoverReject: false,
        onHandoverApproveSuccess: isConfirmationOpen.onHandoverApprove,
        onHandoverRejectSuccess: isConfirmationOpen.onHandoverReject,
        onAcknowledgerApprove: false,
        onAcknowledgerReject: false,
        onAcknowledgerApproveSuccess: isConfirmationOpen.onAcknowledgerApprove,
        onAcknowledgerRejectSuccess: isConfirmationOpen.onAcknowledgerReject,
      };
      setIsConfirmationOpen(initialConfirmationState);
      const { status } = await Service.post(`${process.env.REACT_APP_CASH_SERVICE}/ibct/checker`, {
        transaction_id: rowData.transactionNumber,
        current_checker_remarks: formData.currentCheckerRemarks,
        status: statusToSend
      });
      if (status === 200) {
        setIsConfirmationOpen(revisedConfirmationState);
      }
    } catch (err) {
      console.log('err', err);
      if (err?.response?.data?.message) {
        setAlertShow({ open: true, msg: err.response.data.message, alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong. Please try again.', alertType: 'error' });
      }
    } finally {
      setLoading({ loader: false, name: null });
    }
  };

  const handleConfirmationClose = (event, reason) => {
    if (reason && ['escapeKeyDown', 'backdropClick'].includes(reason)) {
      return;
    }
    setIsConfirmationOpen(initialConfirmationState);
  };

  const renderError = (name) => {
    if (errors?.[name]) {
      return <FormHelperText error>{errors?.[name].message}</FormHelperText>;
    }
  };

  return (
    <>
      <ToastMessage
        alertShow={alertShow}
        setAlertShow={setAlertShow}
      />
      <CustomForm onSubmit={handleSubmit(submitHandler)}>
        <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
            <HeadingMaster2>Transaction Number</HeadingMaster2>
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
            <TextFieldStyled
              label=''
              multiline
              maxRows={2}
              defaultValue={rowData.transactionNumber}
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
            <HeadingMaster2>Type</HeadingMaster2>
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
            <TextFieldStyled
              label=''
              defaultValue={rowData.type}
              disabled
            />
          </Grid>
        </Grid>
        <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
            <HeadingMaster2>Category</HeadingMaster2>
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
            <TextFieldStyled label='' disabled defaultValue='IBCT' />
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
            <HeadingMaster2>Cash Amount</HeadingMaster2>
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
            <TextFieldStyled
              label=''
              disabled
              defaultValue={rowData.cashAmount}
              InputProps={{
                startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>
              }}
            />
          </Grid>
        </Grid>
        <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
            <HeadingMaster2>Cash From Branch</HeadingMaster2>
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
            <TextFieldStyled label='' disabled defaultValue={rowData.cashFromBranch} />
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
            <HeadingMaster2>Cash To Branch</HeadingMaster2>
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
            <TextFieldStyled label='' disabled value={rowData.cashToBranch} />
          </Grid>
        </Grid>
        <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
            <HeadingMaster2>Mode</HeadingMaster2>
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
            <TextFieldStyled label='' disabled defaultValue={rowData.mode} />
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
            <HeadingMaster2>Maker Remarks</HeadingMaster2>
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
            <TextFieldStyled label='' disabled defaultValue={rowData.makerRemarks} />
          </Grid>
        </Grid>
        <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
            <HeadingMaster2>Transferring Person Employee ID</HeadingMaster2>
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
            <TextFieldStyled label='' disabled value={rowData.transferingPersonEmpId} />
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
            <HeadingMaster2>Transferring Person Name</HeadingMaster2>
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
            <TextFieldStyled label='' disabled value={rowData.transferingPersonName || 'NA'} />
          </Grid>
        </Grid>
        {
                requestStatus === 'Pending' && [...subroles, role].includes(currentCheckerRole) ? (
                  <>
                    <Grid container display='flex' alignItems='center' padding='0px 10px'>
                      <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                        <HeadingMaster2>Approver Remarks</HeadingMaster2>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                        <TextFieldStyled
                          label=''
                          placeholder='Approver Remarks*'
                          {...register('currentCheckerRemarks', {
                            onChange: (e) => {
                              if (e.target.value.trim().length) {
                                setValue('currentCheckerRemarks', e.target.value, { shouldValidate: true });
                              } else {
                                setValue('currentCheckerRemarks', null, { shouldValidate: true });
                              }
                            },
                            required: 'Please enter approver remarks.',
                            maxLength: { value: 30, message: 'Maximum 30 characters allowed' }
                          })}
                        />
                        {renderError('currentCheckerRemarks')}
                      </Grid>
                    </Grid>
                    <Grid container display='flex' alignItems='center' justifyContent='center'>
                      <LoadingButtonPrimary
                        onClick={() => setClickedButton('onPendingApprove')}
                        loading={loading?.loader && loading?.name === 'onSubmit'}
                        type='submit'
                      >
                        Approve
                      </LoadingButtonPrimary>
                      <LoadingButtonPrimary
                        onClick={() => setClickedButton('onPendingReject')}
                        loading={loading?.loader && loading?.name === 'onSubmit'}
                        type='submit'
                      >
                        Reject
                      </LoadingButtonPrimary>
                    </Grid>
                  </>
                ) : null
              }
        {
                requestStatus === 'Request Approved' ? (
                  <>
                    <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
                      <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                        <HeadingMaster2>Maker Remarks</HeadingMaster2>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                        <TextFieldStyled label='' disabled value={rowData.makerRemarks} />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                        <HeadingMaster2>Approver Remarks</HeadingMaster2>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                        <TextFieldStyled label='' disabled value={rowData.approverRemarks} />
                      </Grid>
                    </Grid>
                    <Grid container padding='0px 10px'>
                      <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                        <HeadingMaster2>Approver Name</HeadingMaster2>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                        <TextFieldStyled label='' disabled value={rowData.approverName} />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                        <HeadingMaster2>Handover Branch Remarks</HeadingMaster2>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                        <TextFieldStyled
                          label=''
                          placeholder='Handover Branch Remarks*'
                          {...register('currentCheckerRemarks', {
                            onChange: (e) => {
                              if (e.target.value.trim().length) {
                                setValue('currentCheckerRemarks', e.target.value, { shouldValidate: true });
                              } else {
                                setValue('currentCheckerRemarks', null, { shouldValidate: true });
                              }
                            },
                            required: 'Please enter handover branch remarks.',
                            maxLength: { value: 30, message: 'Maximum 30 characters allowed' }
                          })}
                        />
                        {renderError('currentCheckerRemarks')}
                      </Grid>
                    </Grid>
                    <Grid container display='flex' alignItems='center' justifyContent='center'>
                      <LoadingButtonPrimary
                        onClick={() => setClickedButton('onHandoverApprove')}
                        loading={loading?.loader && loading?.name === 'onSubmit'}
                        type='submit'
                      >
                        Handover
                      </LoadingButtonPrimary>
                      <LoadingButtonPrimary
                        onClick={() => setClickedButton('onHandoverReject')}
                        loading={loading?.loader && loading?.name === 'onSubmit'}
                        type='submit'
                      >
                        Reject
                      </LoadingButtonPrimary>
                    </Grid>
                  </>
                ) : null
              }
        {
            requestStatus === 'In-transit' ? (
              <>
                <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
                  <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                    <HeadingMaster2>Maker Remarks</HeadingMaster2>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                    <TextFieldStyled label='' disabled value={rowData.makerRemarks} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                    <HeadingMaster2>Approver Remarks</HeadingMaster2>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                    <TextFieldStyled label='' disabled value={rowData.approverRemarks} />
                  </Grid>
                </Grid>
                <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
                  <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                    <HeadingMaster2>Approver Name</HeadingMaster2>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                    <TextFieldStyled label='' disabled value={rowData.approverName} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                    <HeadingMaster2>Handover Branch Remarks</HeadingMaster2>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                    <TextFieldStyled label='' disabled value={rowData.handoverBranchRemarks} />
                  </Grid>
                </Grid>
                <Grid container display='flex' alignItems='center' padding='0px 10px'>
                  <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                    <HeadingMaster2>Acknowledger Remarks</HeadingMaster2>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                    <TextFieldStyled
                      label=''
                      placeholder='Acknowledger Remarks*'
                      {...register('currentCheckerRemarks', {
                        onChange: (e) => {
                          if (e.target.value.trim().length) {
                            setValue('currentCheckerRemarks', e.target.value, { shouldValidate: true });
                          } else {
                            setValue('currentCheckerRemarks', null, { shouldValidate: true });
                          }
                        },
                        required: 'Please enter acknowledger remarks.',
                        maxLength: { value: 30, message: 'Maximum 30 characters allowed' }
                      })}
                    />
                    {renderError('currentCheckerRemarks')}
                  </Grid>
                </Grid>
                <Grid container display='flex' alignItems='center' justifyContent='center'>
                  <LoadingButtonPrimary
                    onClick={() => setClickedButton('onAcknowledgerApprove')}
                    loading={loading?.loader && loading?.name === 'onSubmit'}
                    type='submit'
                  >
                    Acknowledge
                  </LoadingButtonPrimary>
                  <LoadingButtonPrimary
                    onClick={() => setClickedButton('onAcknowledgerReject')}
                    loading={loading?.loader && loading?.name === 'onSubmit'}
                    type='submit'
                  >
                    Reject
                  </LoadingButtonPrimary>
                </Grid>
              </>
            ) : null
        }
      </CustomForm>
      <DialogBox
        isOpen={Object.keys(isConfirmationOpen).some((ele) => isConfirmationOpen[ele])}
        title=''
        handleClose={handleConfirmationClose}
        width='460px'
        padding='30px'
      >
        <DialogContentText style={{ textAlign: 'center' }}>
          {isConfirmationOpen.onPendingApprove || isConfirmationOpen.onPendingReject ? `Are you sure you want to ${isConfirmationOpen.onPendingApprove ? 'Approve' : 'Reject'} IBCT Cash In transaction of Amount Rs. ${rowData?.cashAmount} for Branch ${rowData.cashToBranch}?` : null}
          {isConfirmationOpen.onPendingApproveSuccess || isConfirmationOpen.onPendingRejectSuccess ? `IBCT Cash In transaction of Amount Rs. ${rowData?.cashAmount} for Branch ${rowData.cashToBranch} has been ${isConfirmationOpen.onPendingApproveSuccess ? 'Approved' : 'Rejected'}.` : null}
          {isConfirmationOpen.onHandoverApprove || isConfirmationOpen.onHandoverReject ? `Are you sure you want to ${isConfirmationOpen.onHandoverApprove ? 'Hand Over' : 'Reject Hand Over'} Cash transaction of Amount Rs. ${rowData?.cashAmount} for Branch ${rowData.cashToBranch}?` : null}
          {isConfirmationOpen.onHandoverApproveSuccess || isConfirmationOpen.onHandoverRejectSuccess ? `Hand Over Cash transaction of Amount Rs. ${rowData?.cashAmount} for Branch ${rowData.cashToBranch} ${isConfirmationOpen.onHandoverApproveSuccess ? 'is successful.' : 'has been Rejected.'}.` : null}
          {isConfirmationOpen.onAcknowledgerApprove || isConfirmationOpen.onAcknowledgerReject ? `Are you sure you want to ${isConfirmationOpen.onAcknowledgerApprove ? 'Acknowledge' : 'Reject Acknowledge'} Cash In transaction of Amount Rs. ${rowData?.cashAmount} for Branch ${rowData.cashToBranch}?` : null}
          {isConfirmationOpen.onAcknowledgerApproveSuccess || isConfirmationOpen.onAcknowledgerRejectSuccess ? `${isConfirmationOpen.onAcknowledgerApproveSuccess ? 'Acknowledgement of' : 'Acknowledge'} Cash In transaction of Amount Rs. ${rowData?.cashAmount} for Branch ${rowData.cashToBranch} ${isConfirmationOpen.onAcknowledgerApproveSuccess ? 'is successful' : 'has been Rejected'}.` : null}
        </DialogContentText>
        <CenterContainerStyled flexDirection='row' padding='20px 0 0 0'>
          {isConfirmationOpen.onPendingApproveSuccess || isConfirmationOpen.onPendingRejectSuccess || isConfirmationOpen.onHandoverApproveSuccess
          || isConfirmationOpen.onHandoverRejectSuccess || isConfirmationOpen.onAcknowledgerApproveSuccess || isConfirmationOpen.onAcknowledgerRejectSuccess ? (<ButtonPrimary onClick={onSuccessClose}>Okay</ButtonPrimary>)
            : (
              <>
                <ButtonPrimary onClick={finalSubmitHandler}>Yes</ButtonPrimary>
                <ButtonPrimary onClick={() => setIsConfirmationOpen(initialConfirmationState)}>No</ButtonPrimary>
              </>
            )}
        </CenterContainerStyled>
      </DialogBox>
    </>
  );
};
export default IBCTFlow;
