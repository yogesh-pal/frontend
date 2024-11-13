/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import moment from 'moment';
import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Grid, FormHelperText, DialogContentText } from '@mui/material';
import { REGEX, MODULE, SENDOTPINTERVALSPOLLING } from '../../../../../constants';
import {
  ToastMessage, LivePhoto, MultipleLivePhoto, DialogBox
} from '../../../../../components';
import {
  TextFieldStyled, SelectMenuStyle, FullSizeButton,
  LoadingButtonPrimary, ButtonPrimary, CenterContainerStyled
} from '../../../../../components/styledComponents';
import { HeadingMaster2 } from '../../../helper';
import { Service } from '../../../../../service';
import { useScreenSize } from '../../../../../customHooks';
import { errorMessageHandler } from '../../../../../utils';

const NomineeRelease = ({ customerDetails, closeOnSuccess }) => {
  const [OTP, setOTP] = useState(null);
  const [timer, setTimer] = useState(0);
  const [activeOtp, setActiveOtp] = useState(null);
  const [formData, setFormData] = useState(null);
  const [OTPFieldError, setOTPFieldError] = useState(null);
  const [isOTPVerified, setIsOTPVerified] = useState(false);
  const [intervalAddress, setIntervalAddress] = useState(null);
  const [loading, setLoading] = useState({ loader: false, name: null });
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [isOTPSendSuccessfully, setIsOTPSendSuccessfully] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState({ onSubmit: false, onSucces: false });
  const {
    handleSubmit, register, unregister, setValue, getValues, formState: { errors }, setError
  } = useForm();
  const OTPSENDVIACALL = 'onOTPSendViaCall';
  const OTPSENDVIASMS = 'onOTPSendViaSms';
  const OTPSENDVIAWHATAPP = 'WHATSAPP';
  const screen = useScreenSize();
  const componentRef = useRef({ timer: 1 });
  const intervalRef = useRef(null);

  const {
    application_no: lan, loan_dt: loanDt, amt_dt: amtDt, nominee_name: nomineeName, nominee_mobile: nomineeMobileNo, nominee_dob: nomineeDOB,
    loan_account_no: loanAccountNo
  } = customerDetails;

  const IDPROOFValidations = {
    DRIVLIC: {
      pattern: { value: REGEX.ONLYCHARANDDIGITS, message: 'Please enter valid driving license number.' },
      minLength: {
        value: 16,
        message: 'Driving license number should be 16 characters.'
      },
      maxLength: {
        value: 16,
        message: 'Driving license number should not more than 16 characters.'
      },
    },
    PASSPORT: {
      pattern: { value: REGEX.MUSTALPHANUMBERIC, message: 'Please enter valid passport number.' },
      minLength: {
        value: 8,
        message: 'Passport number should be 8 characters.'
      },
      maxLength: {
        value: 8,
        message: 'Passport number should not more than 8 characters.'
      },
    },
    VOTERID: { pattern: { value: REGEX.ALPHANUMBERICWITHTWOMANDATORYLETTERS, message: 'Please enter valid voter id number.' } },
    PAN: {
      pattern: { value: REGEX.PANCARD, message: 'Please enter valid pancard number.' },
      maxLength: {
        value: 10,
        message: 'PAN card number should not more than 10 characters.'
      },
    },
  };

  const { COLLATERALRELEASE } = MODULE;

  const finalSubmitHandler = async () => {
    try {
      setIsConfirmationOpen({ onSubmit: false, onSucces: false });
      setLoading({ loader: true, name: 'onSubmit' });
      let nomineeDocs = '';
      Object.keys(formData).forEach((item) => {
        if (item.includes('document_live_photo')) {
          nomineeDocs += nomineeDocs.length ? `,${formData[item]}` : formData[item];
        }
      });
      const { status } = await Service.post(`${process.env.REACT_APP_COLLATERAL_SERVICE}/release/nominee`, {
        loan_account_no: loanAccountNo,
        dt: loanDt,
        amt_dt: amtDt,
        nominee_id_type: formData?.IdProof,
        nominee_doc_live_pic: nomineeDocs,
        nominee_live_pic: formData?.nominee_live_photo,
        nominee_osv_done: true,
        nominee_id_number: formData?.IdNumber
      });
      if (status === 200) {
        setIsConfirmationOpen({ onSubmit: false, onSucces: true });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong, Please try again.', alertType: 'error' });
      }
    } catch (err) {
      console.log('err', err);
      const msg = errorMessageHandler(err?.response?.data?.message);
      if (msg) {
        setAlertShow({ open: true, msg, alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong, Please try again.', alertType: 'error' });
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
            recursivePoll(currentInterval + 1, id);
          }, SENDOTPINTERVALSPOLLING[currentInterval]);
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.msg || 'Something went wrong.';
      setAlertShow({ open: true, msg: errorMessage, alertType: 'error' });
    }
  };

  const handleSendOTP = async (values) => {
    try {
      if (timer) {
        return;
      }
      const activeElemen = document.activeElement;
      const activeButton = activeElemen.getAttribute('name');
      setFormData(values);
      const PAYLOADMAPPING = {
        [OTPSENDVIACALL]: 'CALL',
        [OTPSENDVIAWHATAPP]: 'WHATSAPP',
        [OTPSENDVIASMS]: 'SMS'
      };
      setLoading({ loader: true, name: activeButton });
      setActiveOtp(activeButton);
      const { data } = await Service.post(`${process.env.REACT_APP_COLLATERAL_SERVICE}/otp/send`, { application_no: lan, otp_to: 'NOMINEE', otp_type: PAYLOADMAPPING[activeButton] });
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
      if (err?.response?.data?.application_no) {
        setAlertShow({ open: true, msg: err?.response?.data?.application_no, alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong.', alertType: 'error' });
      }
      setActiveOtp(null);
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
      <form onSubmit={handleSubmit(handleSendOTP)}>
        <Grid container padding='0px 10px'>
          <Grid item xs={12} sm={6} md={6} lg={6} xl={6} padding='10px'>
            <TextFieldStyled
              label='Nominee Name'
              defaultValue={nomineeName}
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={6} xl={6} padding='10px'>
            <TextFieldStyled
              label='Nominee DOB'
              defaultValue={moment(nomineeDOB, 'DD/MM/YYYY').format('DD/MM/YYYY')}
              disabled
            />
          </Grid>
        </Grid>
        <Grid container padding='10px'>
          <Grid item xs={12} sm={6} md={6} lg={6} xl={6} padding='0px 10px'>
            <TextFieldStyled
              label='Nominee Mobile Number'
              defaultValue={nomineeMobileNo}
              disabled
            />
          </Grid>
        </Grid>
        <Grid container padding='10px 20px'>
          <HeadingMaster2>Nominee Details section</HeadingMaster2>
        </Grid>
        <Grid container padding='0px 10px'>
          <Grid item xs={12} sm={6} md={6} lg={6} xl={6} padding='10px'>
            <TextFieldStyled
              label='ID Proof*'
              disabled={isOTPSendSuccessfully}
              select
              {...register('IdProof', {
                required: 'Please select id proof'
              })}
              onChange={(e) => {
                const selectedValue = e.target.value;
                // setValue('IdNumber', null, { shouldValidate: true });
                unregister('IdNumber');
                register('IdNumber', {
                  required: 'Please Enter Id Number',
                  value: null,
                  pattern: IDPROOFValidations?.[selectedValue]?.pattern ?? undefined,
                  minLength: IDPROOFValidations?.[selectedValue]?.minLength ?? undefined,
                  maxLength: IDPROOFValidations?.[selectedValue]?.maxLength ?? undefined,
                  onChange: (v) => {
                    if (v.target.value.trim().length) {
                      setValue('IdNumber', v.target.value, { shouldValidate: true });
                    } else {
                      setValue('IdNumber', null, { shouldValidate: true });
                    }
                  },
                });
              }}

            >
              <SelectMenuStyle key='PASSPORT' value='PASSPORT'>Passport</SelectMenuStyle>
              <SelectMenuStyle key='DRIVLIC' value='DRIVLIC'>Driving License</SelectMenuStyle>
              <SelectMenuStyle key='VOTERID' value='VOTERID'>Voter ID</SelectMenuStyle>
              <SelectMenuStyle key='PAN' value='PAN'>PAN Card</SelectMenuStyle>
              <SelectMenuStyle key='GID' value='GID'>Government Issued ID Card</SelectMenuStyle>
            </TextFieldStyled>
            {renderError('IdProof')}
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={6} xl={6} padding='10px'>
            <TextFieldStyled
              label='ID Number*'
              disabled={isOTPSendSuccessfully}
              {...register('IdNumber', {
                onChange: (e) => {
                  if (e.target.value.trim().length) {
                    setValue('IdNumber', e.target.value?.toUpperCase(), { shouldValidate: true });
                  } else {
                    setValue('IdNumber', null, { shouldValidate: true });
                  }
                },
                required: 'Please enter id number',
                // pattern: { value: REGEX.ALPHANUMERIC, message: 'Please enter valid id number' }
              })}
            />
            {renderError('IdNumber')}
          </Grid>
        </Grid>
        <Grid container padding='0px 10px'>
          <Grid item xs={12} sm={6} md={6} lg={6} xl={6} padding='10px'>
            <TextFieldStyled
              label='OSV Done?*'
              disabled={isOTPSendSuccessfully}
              select
              {...register('osvDone', {
                onChange: (e) => setValue('osvDone', e.target.value, { shouldValidate: true }),
                required: 'Please select osv done?'
              })}
            >
              <SelectMenuStyle key='yes' value='yes'>Yes</SelectMenuStyle>
              <SelectMenuStyle key='no' value='no'>No</SelectMenuStyle>
            </TextFieldStyled>
            {renderError('osvDone')}
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={6} xl={6} padding='10px'>
            <LivePhoto
              register={register}
              errors={errors}
              setValue={setValue}
              getValues={getValues}
              input={{
                name: 'nominee_live_photo',
                label: 'Nominee Photo',
                filePath: `${COLLATERALRELEASE.name}/${COLLATERALRELEASE.details.nomineePicture}`,
                disable: isOTPSendSuccessfully,
                validation: {
                  isRequired: true,
                  requiredMsg: 'Please upload nominee live photo',
                }
              }}
            />
          </Grid>
        </Grid>
        <Grid container padding='10px'>
          <Grid item xs={12} sm={6} md={6} lg={6} xl={6} padding='0px 10px'>
            <MultipleLivePhoto
              register={register}
              errors={errors}
              setValue={setValue}
              unregister={unregister}
              getValues={getValues}
              input={{
                name: 'document_live_photo',
                label: 'Document Live Photo',
                filePath: `${COLLATERALRELEASE.name}/${COLLATERALRELEASE.details.documentPicture}`,
                disable: isOTPSendSuccessfully,
                validation: {
                  isRequired: true,
                  requiredMsg: 'Please upload document live photo',
                }
              }}
            />
          </Grid>
        </Grid>
        { !isOTPVerified
          ? (
            <>
              <Grid container display='flex' alignItems='center' padding='0px 10px'>
                <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                  <HeadingMaster2>Nominee Mobile No</HeadingMaster2>
                </Grid>
                <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                  <TextFieldStyled
                    label=''
                    defaultValue={nomineeMobileNo}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6} xl={6} display='flex' justifyContent={['xs', 'sm'].includes(screen) ? 'center' : 'start'}>
                  {
                    (activeOtp === null || activeOtp === OTPSENDVIASMS)
                  && (
                  <FullSizeButton
                    type='submit'
                    loading={loading.loader && loading.name === OTPSENDVIASMS && !timer}
                    loadingPosition='start'
                    name={OTPSENDVIASMS}
                    disabled={loading.loader && !timer}
                    margin={['xs', 'sm'].includes(screen) ? '1px' : null}
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
                    loading={loading.loader && loading.name === OTPSENDVIACALL && !timer}
                    loadingPosition='start'
                    name={OTPSENDVIACALL}
                    disabled={loading.loader && !timer}
                    margin={['xs', 'sm'].includes(screen) ? '1px' : null}
                  >
                    { timer ? `Resend OTP in ${180 - timer} sec` : 'OTP Via Call'}
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
                    margin={['xs', 'sm'].includes(screen) ? '1px' : null}
                  >
                    { timer ? `Resend OTP in ${180 - timer} sec` : 'OTP Via Whatsapp'}
                  </FullSizeButton>
                  )
                  }

                </Grid>
              </Grid>
              { isOTPSendSuccessfully
            && (
            <Grid container display='flex' alignItems='center' padding='0px 10px'>
              <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                <HeadingMaster2>Enter OTP</HeadingMaster2>
              </Grid>
              <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
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
              <Grid item xs={12} sm={12} md={3} lg={3} xl={3} display='flex' justifyContent={['xs', 'sm'].includes(screen) ? 'center' : 'start'}>
                <FullSizeButton
                  width='200px'
                  onClick={handleValidateOTP}
                  disabled={false}
                  loading={loading.loader && loading.name === 'onValidateOTP'}
                  loadingPosition='start'
                  margin={['xs', 'sm'].includes(screen) ? '0px' : null}
                >
                  Validate OTP
                </FullSizeButton>
              </Grid>
            </Grid>
            )}
            </>
          )
          : (
            <>
              <Grid container display='flex' alignItems='center' padding='0px 10px'>
                <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                  <HeadingMaster2>Nominee Mobile No</HeadingMaster2>
                </Grid>
                <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                  <TextFieldStyled
                    label=''
                    defaultValue={nomineeMobileNo}
                    disabled
                  />
                </Grid>
              </Grid>
              <Grid container padding='0px 0px'>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} display='flex' justifyContent='center'>
                  <LoadingButtonPrimary
                    onClick={() => setIsConfirmationOpen({ onSubmit: true, onSucces: false })}
                    disabled={getValues('osvDone') !== 'yes'}
                    loading={loading.loader && loading.name === 'onSubmit'}
                    loadingPosition='start'
                  >
                    Submit
                  </LoadingButtonPrimary>
                </Grid>
              </Grid>
            </>
          )}
      </form>
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
export default React.memo(NomineeRelease);
