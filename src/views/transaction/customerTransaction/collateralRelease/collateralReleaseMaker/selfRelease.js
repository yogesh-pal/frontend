/* eslint-disable max-len */
import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Grid, FormHelperText, DialogContentText } from '@mui/material';
import { HeadingMaster2 } from '../../../helper';
import { Service } from '../../../../../service';
import { MODULE, SENDOTPINTERVALSPOLLING } from '../../../../../constants';
import { errorMessageHandler } from '../../../../../utils';
import { ToastMessage, LivePhoto, DialogBox } from '../../../../../components';
import {
  TextFieldStyled, FullSizeButton, LoadingButtonPrimary,
  CenterContainerStyled, ButtonPrimary
} from '../../../../../components/styledComponents';

const SelfRelease = ({ customerDetails, closeOnSuccess }) => {
  const [OTP, setOTP] = useState(null);
  const [formData, setFormData] = useState(null);
  const [OTPFieldError, setOTPFieldError] = useState(null);
  const [activeOtp, setActiveOtp] = useState(null);
  const [isOTPVerified, setIsOTPVerified] = useState(false);
  const [isOTPSendSuccessfully, setIsOTPSendSuccessfully] = useState(false);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [loading, setLoading] = useState({ loader: false, name: null });
  const [timer, setTimer] = useState(0);
  const [intervalAddress, setIntervalAddress] = useState(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState({ onSubmit: false, onSucces: false });
  const componentRef = useRef({ timer: 1 });
  const intervalRef = useRef(null);
  const {
    handleSubmit, register, formState: { errors }, setValue, getValues
  } = useForm();
  const OTPSENDVIACALL = 'onOTPSendViaCall';
  const OTPSENDVIASMS = 'onOTPSendViaSms';
  const OTPSENDVIAWHATAPP = 'WHATSAPP';
  const {
    amt_dt: amtDt,
    loan_dt: loanDt,
    application_no: lan,
    loan_account_no: loanAccountNo,
    customer_mobile_number: MobileNo
  } = customerDetails;

  const { COLLATERALRELEASE } = MODULE;

  useEffect(() => () => {
    clearInterval(intervalAddress);
  }, []);

  const finalSubmitHandler = async () => {
    try {
      setIsConfirmationOpen({ onSubmit: false, onSucces: false });
      setLoading({ loader: true, name: 'onSubmit' });
      const { status } = await Service.post(`${process.env.REACT_APP_COLLATERAL_SERVICE}/release/self`, {
        loan_account_no: loanAccountNo,
        dt: loanDt,
        amt_dt: amtDt,
        customer_live_pic: formData?.customer_live_photo
      });
      if (status === 200) {
        setIsConfirmationOpen({ onSubmit: false, onSucces: true });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong, Please try again.', alertType: 'error' });
      }
    } catch (err) {
      console.log('err', err);
      const msg = errorMessageHandler(err.response.data?.errors);
      if (msg) {
        setAlertShow({ open: true, msg, alertType: 'error' });
      } else if (err.response.data?.message) {
        setAlertShow({ open: true, msg: err.response.data.message, alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong.', alertType: 'error' });
      }
    } finally {
      setLoading({ loader: false, name: null });
    }
  };

  const recursivePoll = async (currentInterval, id) => {
    try {
      const pollingOtpRes = await Service.get(`${process.env.REACT_APP_LOS_OTP_SERVICE}/audit_log?otp_audit_log_id=${id}`);
      if (currentInterval >= SENDOTPINTERVALSPOLLING.length) {
        setAlertShow({ open: true, msg: 'Please try again after some time.', alertType: 'error' });
        return;
      }

      if (pollingOtpRes.data.status === 1) {
        if (pollingOtpRes.data.data.otp_status === 'FAILED') {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setTimer(0);
          setActiveOtp(null);
          setLoading((pre) => ({ ...pre, isEnableWhatsapp: true, loader: false }));
          setAlertShow({ open: true, msg: 'Unable to send OTP. Please try again later.', alertType: 'error' });
          return;
        }
        if (pollingOtpRes.data.data.otp_status === 'PENDING') {
          setTimeout(() => {
            recursivePoll(currentInterval + 1, id, SENDOTPINTERVALSPOLLING);
          }, SENDOTPINTERVALSPOLLING[currentInterval]);
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.msg || 'Something went wrong.';
      setAlertShow({ open: true, msg: errorMessage, alertType: 'error' });
    }
  };

  const handleSendOTP = async (values) => {
    const activeElemen = document.activeElement;
    const activeButton = activeElemen.getAttribute('name');
    try {
      if (timer) {
        return;
      }
      const PAYLOADMAPPING = {
        [OTPSENDVIACALL]: 'CALL',
        [OTPSENDVIAWHATAPP]: 'WHATSAPP',
        [OTPSENDVIASMS]: 'SMS'
      };
      setFormData(values);
      console.log('activeButton', activeButton);
      setLoading({ loader: true, name: activeButton });
      setActiveOtp(activeButton);
      const { data } = await Service.post(`${process.env.REACT_APP_COLLATERAL_SERVICE}/otp/send`, { application_no: lan, otp_type: PAYLOADMAPPING[activeButton] });
      if (data.status === 1) {
        setTimer(1);
        intervalRef.current = setInterval(() => {
          const ref = componentRef.current;
          ref.timer += 1;
          setTimer((pre) => (pre + 1));
          if (ref.timer > 179) {
            clearInterval(intervalRef.current);
            setActiveOtp(null);
            componentRef.current.timer = 1;
            setTimer(0);
            setLoading((pre) => ({ ...pre, isEnableWhatsapp: true, loader: false }));
          }
        }, 1000);
        setIntervalAddress(intervalRef.current);
        setIsOTPSendSuccessfully(true);

        const id = data.otp_audit_log_id;
        setTimeout(() => {
          recursivePoll(1, id);
        }, SENDOTPINTERVALSPOLLING[0]);
      } else {
        setAlertShow({ open: true, msg: 'Invalid mobile number.', alertType: 'error' });
      }
    } catch (err) {
      console.log('err', err);
      setActiveOtp(null);
      if (err?.response?.data?.errors?.lan_details) {
        setAlertShow({ open: true, msg: err.response.data.errors.lan_details, alertType: 'error' });
      } else if (err?.response?.data?.application_no) {
        setAlertShow({ open: true, msg: err.response.data.application_no, alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong.', alertType: 'error' });
      }
      setLoading((pre) => ({
        ...pre, loader: false, name: null, isEnableWhatsapp: true
      }));
    }
  };

  const handleValidateOTP = async () => {
    try {
      if (!OTP) {
        setOTPFieldError('Please enter OTP');
        return;
      }
      setLoading({ loader: true, name: 'onValidateOTP' });
      const { data } = await Service.post(`${process.env.REACT_APP_COLLATERAL_SERVICE}/otp/validate`, {
        application_no: lan,
        otp: OTP
      });
      if (data?.is_validated === 'True') {
        setAlertShow({ open: true, msg: 'OTP entered is validated successfully.', alertType: 'success' });
        setIsOTPVerified(true);
      } else {
        setAlertShow({ open: true, msg: 'Entered OTP is invalid, Please try again!', alertType: 'error' });
      }
    } catch (err) {
      if (err?.response?.data?.is_validated === 'False') {
        setAlertShow({ open: true, msg: 'Entered OTP is invalid, Please try again!', alertType: 'error' });
      } else if (err?.response?.data?.application_no) {
        setAlertShow({ open: true, msg: err.response.data.application_no, alertType: 'error' });
      } else if (err?.response?.data?.otp) {
        setAlertShow({ open: true, msg: err.response.data.otp, alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong.', alertType: 'error' });
      }
    } finally {
      setLoading({ loader: false, name: null });
    }
  };

  if (timer >= 180) {
    clearInterval(intervalAddress);
    setTimer(0);
    setActiveOtp(null);
  }

  const handleConfirmationClose = (event, reason) => {
    if (reason && ['escapeKeyDown', 'backdropClick'].includes(reason)) {
      return;
    }
    setIsConfirmationOpen({ onSubmit: false, onSucces: false });
  };

  return (
    <>
      <ToastMessage
        alertShow={alertShow}
        setAlertShow={setAlertShow}
      />
      <Grid container display='flex' justifyContent='center' padding='20px'>
        <Grid item xs={12} sm={12} md={10} lg={8} xl={8}>
          <form onSubmit={handleSubmit(handleSendOTP)}>
            <Grid container display='flex' alignItems='center'>
              <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
                <HeadingMaster2>Customer Live Photo</HeadingMaster2>
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6} xl={6} padding='20px 0px'>
                <LivePhoto
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  getValues={getValues}
                  input={{
                    name: 'customer_live_photo',
                    label: 'Customer Photo',
                    filePath: `${COLLATERALRELEASE.name}/${COLLATERALRELEASE.details.customerPicture}`,
                    disable: isOTPSendSuccessfully,
                    validation: {
                      isRequired: true,
                      requiredMsg: 'Please upload customer live photo',
                    }
                  }}
                />
              </Grid>
            </Grid>
            <Grid container display='flex' alignItems='center'>
              <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
                <HeadingMaster2>Mobile No</HeadingMaster2>
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6} xl={6} padding='20px 0px'>
                <TextFieldStyled
                  label=''
                  defaultValue={MobileNo}
                  disabled
                />
              </Grid>
            </Grid>
            { !isOTPVerified
              ? (
                <>
                  <Grid container padding='10px 0px' justifyContent='center'>
                    <Grid item xs={6} display='flex' justifyContent='center'>
                      {
                        (activeOtp === null || activeOtp === OTPSENDVIASMS)
                    && (
                    <FullSizeButton
                      type='submit'
                      name={OTPSENDVIASMS}
                      loading={loading.loader && loading.name === OTPSENDVIASMS && !timer}
                      loadingPosition='start'
                      margin='1px'
                      disabled={loading.loader && !timer}
                    >
                      { timer ? `Resend OTP in ${180 - timer} sec` : 'Send OTP'}
                    </FullSizeButton>
                    )
                      }
                      {
                      (activeOtp === null || activeOtp === OTPSENDVIACALL)
                      && (
                      <FullSizeButton
                        type='submit'
                        name={OTPSENDVIACALL}
                        loading={loading.loader && loading.name === OTPSENDVIACALL && !timer}
                        loadingPosition='start'
                        margin='1px'
                        disabled={loading.loader && !timer}
                      >
                        { timer ? `Resend OTP in ${10 - timer} sec` : 'OTP Via Call'}
                      </FullSizeButton>
                      )
                      }
                      {
                      (activeOtp === null || activeOtp === OTPSENDVIAWHATAPP)
                      && (
                      <FullSizeButton
                        type='submit'
                        loading={loading.loader && loading.name === OTPSENDVIAWHATAPP && !timer}
                        loadingPosition='start'
                        name={OTPSENDVIAWHATAPP}
                        disabled={(!loading?.isEnableWhatsapp && !timer) || (loading.loader && !timer)}
                        // margin={['xs', 'sm'].includes(screen) ? '1px' : null}
                      >
                        { timer ? `Resend OTP in ${180 - timer} sec` : 'OTP Via Whatsapp'}
                      </FullSizeButton>
                      )
                      }

                    </Grid>

                  </Grid>
                  { isOTPSendSuccessfully
            && (
            <>
              <Grid container display='flex' alignItems='center' padding='10px 0px'>
                <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
                  <HeadingMaster2>Enter OTP</HeadingMaster2>
                </Grid>
                <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
                  <TextFieldStyled
                    label=''
                    type='number'
                    onChange={(e) => {
                      setOTP(e.target.value);
                      if (e.target.value) {
                        setOTPFieldError(null);
                      } else {
                        setOTPFieldError('Please enter OTP');
                      }
                    }}
                  />
                  { OTPFieldError && <FormHelperText error>{OTPFieldError}</FormHelperText>}
                </Grid>
              </Grid>
              <Grid container padding='10px 0px'>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} display='flex' justifyContent='center'>
                  <FullSizeButton
                    width='200px'
                    onClick={handleValidateOTP}
                    disabled={false}
                    loading={loading.loader && loading.name === 'onValidateOTP'}
                    loadingPosition='start'
                  >
                    Validate OTP
                  </FullSizeButton>
                </Grid>
              </Grid>
            </>
            )}
                </>
              )
              : (
                <Grid container padding='0px 0px'>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12} display='flex' justifyContent='center'>
                    <LoadingButtonPrimary
                      onClick={() => setIsConfirmationOpen({ onSubmit: true, onSucces: false })}
                      disabled={false}
                      loading={loading.loader && loading.name === 'onSubmit'}
                      loadingPosition='start'
                    >
                      Submit
                    </LoadingButtonPrimary>
                  </Grid>
                </Grid>
              ) }
          </form>
        </Grid>
      </Grid>
      <DialogBox
        isOpen={isConfirmationOpen.onSubmit || isConfirmationOpen.onSucces}
        title=''
        handleClose={handleConfirmationClose}
        width={isConfirmationOpen.onSubmit ? 'auto' : '460px'}
        padding='40px'
      >
        <DialogContentText>
          {
                isConfirmationOpen.onSubmit ? `Are you sure you want to release collateral against LAN ${loanAccountNo}.`
                  : `The Collateral against the LAN ${loanAccountNo} has been released successfully and has been marked closed.`
            }
        </DialogContentText>
        <CenterContainerStyled flexDirection='row' padding='20px 0 0 0'>
          {
            isConfirmationOpen.onSubmit ? (
              <>
                <ButtonPrimary
                  onClick={finalSubmitHandler}
                  variant='contained'
                  loading={false}
                >
                  Yes
                </ButtonPrimary>
                <ButtonPrimary onClick={() => setIsConfirmationOpen({ onSubmit: false, onSucces: false })}>No</ButtonPrimary>
              </>
            )
              : (<ButtonPrimary onClick={() => closeOnSuccess()}>Okay</ButtonPrimary>)
          }
        </CenterContainerStyled>
      </DialogBox>
    </>
  );
};
export default React.memo(SelfRelease);
