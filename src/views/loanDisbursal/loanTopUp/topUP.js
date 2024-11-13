/* eslint-disable max-len */
import Decimal from 'decimal.js';
import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
  Grid, InputAdornment, FormHelperText, Dialog, DialogActions,
  DialogContentText, DialogContent, Alert
} from '@mui/material';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { Service } from '../../../service';
import { ToastMessage, LivePhoto } from '../../../components';
import { CustomForm, HeadingMaster, DownLoadButtonDiv } from './helper';
import { useScreenSize } from '../../../customHooks';
import {
  TextFieldStyled, LoadingButtonPrimary, FullSizeButton
} from '../../../components/styledComponents';
import {
  REGEX, FEE_ENUM_VALUES, MODULE, SENDOTPINTERVALSPOLLING
} from '../../../constants';
import PageLoader from '../../../components/PageLoader';
import { errorMessageHandler } from '../../../utils';

const amountFormat = Intl.NumberFormat('en-IN');

const TopUP = (props) => {
  const [timer, setTimer] = useState(0);
  const [topUpFees, setTopUpFees] = useState([]);
  const [topUpCharge, setTopUpCharge] = useState([]);
  const [otpTypeToSend, setOTPTypeToSend] = useState(null);
  const [isOTPVerified, setIsOTPVerified] = useState(false);
  const [netDisbursement, setNetDisbursement] = useState(0);
  const [isShowPDFError, setIsShowPDFError] = useState(false);
  const [intervalAddress, setIntervalAddress] = useState(null);
  const [consolidatedCharges, setConsolidatedCharges] = useState(0);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [loading, setLoading] = useState({ loader: false, name: null });
  const [isOTPSendSuccessfully, setIsOTPSendSuccessfully] = useState(false);
  const [triggerRetryAPIState, setTriggerRetryAPIState] = useState({ isTrigger: false, appNo: null });
  const [isLoanDisbursed, setIsLoanDisbursed] = useState({ disbursed: false, loanAccountNo: null, appNo: null });
  const componentRef = useRef({ timer: 1 });
  const intervalRef = useRef(null);

  const {
    register, handleSubmit, setValue, formState: { errors }, trigger, getValues,
    getFieldState
  } = useForm();
  const {
    lanData, formData, rateMasterToken, topUpLoanData, closeParentDialog,
    timeTakenByUser
  } = props;
  const screen = useScreenSize();

  const { LOS } = MODULE;

  useEffect(() => {
    if (!lanData.isHavePercentageCharge) {
      setTopUpCharge(lanData.charge);
      setTopUpFees(lanData.fees);
      setConsolidatedCharges(lanData.consolidated_fee_change);
    }
    return () => clearInterval(intervalAddress);
  }, []);

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

  const handleSendOTP = async (otpType) => {
    try {
      const result = await trigger(['requestedAmount', 'customer_live_photo']);
      if (result) {
        if (timer) {
          return;
        }
        setLoading((pre) => ({ ...pre, loader: true, name: otpType }));
        const { data } = await Service.post(`${process.env.REACT_APP_TOPUP_SERVICE}/send/otp`, {
          customer_token: formData?.cust_dt,
          lan_token: lanData?.dt,
          rate_token: rateMasterToken,
          audit_token: lanData?.audit_token,
          requested_loan_amount: Number(getValues('requestedAmount')),
          otp_type: otpType
        });
        if (data.success) {
          // setAlertShow({ open: true, msg: 'OTP send successfully.', alertType: 'success' });
          setTimer(1);
          intervalRef.current = setInterval(() => {
            const ref = componentRef.current;
            ref.timer += 1;
            setTimer((pre) => (pre + 1));
            if (ref.timer > 179) {
              clearInterval(intervalRef.current);
              componentRef.current.timer = 1;
              setTimer(0);
              setLoading((pre) => ({ ...pre, isEnableWhatsapp: true }));
            }
          }, 1000);
          setIntervalAddress(intervalRef.current);
          setOTPTypeToSend(otpType);
          setIsOTPSendSuccessfully(true);

          const id = data?.data?.otp_audit_log_id;
          setTimeout(() => {
            recursivePoll(1, id);
          }, SENDOTPINTERVALSPOLLING[0]);
        } else {
          setAlertShow({ open: true, msg: data?.msg, alertType: 'error' });
        }
      }
    } catch (err) {
      console.log('Error', err);
      if (err?.response?.data?.errors?.lan_details) {
        setAlertShow({ open: true, msg: err.response.data.errors.lan_details, alertType: 'error' });
      } else if (err?.response?.data?.data?.application_no) {
        setAlertShow({ open: true, msg: err.response.data.data.application_no, alertType: 'error' });
      } else if (err?.response?.data?.msg) {
        setAlertShow({ open: true, msg: err.response.data.msg, alertType: 'error' });
      } else if (err?.response?.data?.validation_errors) {
        setAlertShow({ open: true, msg: errorMessageHandler(err.response.data.validation_errors.join('\n')), alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong while sending OTP.', alertType: 'error' });
      }
      setLoading((pre) => ({
        ...pre,
        isEnableWhatsapp: true,
        loader: false,
        name: null
      }));
    } finally {
      setLoading((pre) => ({ ...pre, loader: false, name: null }));
    }
  };

  const handleValidateOTP = async () => {
    try {
      const result = await trigger(['enteredOTP']);
      if (result) {
        setLoading((pre) => ({ ...pre, loader: true, name: 'onValidateOTP' }));
        const { data } = await Service.post(`${process.env.REACT_APP_TOPUP_SERVICE}/validate/otp`, {
          application_no: lanData?.application_no,
          otp: getValues('enteredOTP')
        });
        if (data?.data?.is_validated) {
          setIsOTPVerified(true);
          setAlertShow({ open: true, msg: 'OTP validated successfully.', alertType: 'success' });
          componentRef.current.timer = 1;
          clearInterval(intervalAddress);
        } else {
          setAlertShow({ open: true, msg: data?.msg, alertType: 'error' });
        }
      }
    } catch (err) {
      console.log('Error', err);
      if (err?.response?.data?.errors?.lan_details) {
        setAlertShow({ open: true, msg: err.response.data.errors.lan_details, alertType: 'error' });
      } else if (err?.response?.data?.data?.application_no) {
        setAlertShow({ open: true, msg: err.response.data.data.application_no, alertType: 'error' });
      } else if (err?.response?.data?.msg) {
        setAlertShow({ open: true, msg: err.response.data.msg, alertType: 'error' });
      } else if (err?.response?.data?.validation_errors) {
        setAlertShow({ open: true, msg: errorMessageHandler(err.response.data.validation_errors.join('\n')), alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong while validating OTP.', alertType: 'error' });
      }
    } finally {
      setLoading((pre) => ({ ...pre, loader: true, name: null }));
    }
  };

  const pollStatus = async (n, applicationNo) => {
    try {
      const disbursementStatusRes = await Service.get(`${process.env.REACT_APP_DISBURSEMENT_STATUS}/${applicationNo}`);
      if (disbursementStatusRes.status === 200) {
        if (disbursementStatusRes.data.status === 'SUCCESS') {
          setLoading((pre) => ({ ...pre, loader: false, name: null }));
          setIsLoanDisbursed({ disbursed: true, loanAccountNo: disbursementStatusRes.data.loan_account_no, appNo: applicationNo });
        } else if (disbursementStatusRes.data.status === 'FAILURE' || (n === 3)) {
          setTriggerRetryAPIState({ isTrigger: true, appNo: applicationNo });
          let error = 'Not able to disburse top up loan at this moment, Please retry.';
          if (disbursementStatusRes?.data?.msg) {
            error = `${error}\n${disbursementStatusRes?.data?.msg}`;
          }
          setLoading((pre) => ({ ...pre, loader: false, name: null }));
          setAlertShow({ open: true, msg: errorMessageHandler(error, true), alertType: 'error' });
        } else {
          setTimeout(() => {
            pollStatus(n + 1, applicationNo);
          }, 10000 * (n + 1));
        }
      }
    } catch (err) {
      console.log('error', err);
      setLoading((pre) => ({ ...pre, loader: false, name: null }));
      setAlertShow({ open: true, msg: 'Something went wrong, Please try again.', alertType: 'error' });
    }
  };

  const retryDisbursal = async (applicationNo) => {
    try {
      const { data, status } = await Service.post(`${process.env.REACT_APP_DISBURSAL_RETRY}`, {
        application_no: applicationNo,
      });
      if (status === 200) {
        setAlertShow({ open: true, msg: data?.msg, alertType: 'success' });
        setTimeout(() => {
          pollStatus(1, applicationNo);
        }, 10000);
      }
    } catch (err) {
      console.log('error', err);
      setLoading((pre) => ({ ...pre, loader: false, name: null }));
      if (err?.response?.data?.errors?.detail) {
        setAlertShow({ open: true, msg: err.response.data.errors.detail, alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong, Please try again!', alertType: 'error' });
      }
    }
  };

  const onSubmit = async () => {
    try {
      const requestedAmt = Number(getValues('requestedAmount'));
      const totalPOS = topUpLoanData.existing_outstanding + topUpLoanData.existing_topup_amount + requestedAmt;
      if (totalPOS < lanData.scheme_min_loan_amount || totalPOS > lanData.scheme_max_loan_amount) {
        const activePOS = `Active POS: ${topUpLoanData.existing_outstanding}`;
        const existingTopup = `Existing topup amount: ${topUpLoanData.existing_topup_amount}`;
        const requestedTopup = `Requested topup amount: ${requestedAmt}`;
        const sumTotal = `Sum total: ${totalPOS} does not lie in scheme range ${lanData.scheme_min_loan_amount} - ${lanData.scheme_max_loan_amount}`;
        setAlertShow({ open: true, msg: errorMessageHandler(`Requested amount is not eligible for Top Up.\n${activePOS}\n${existingTopup}\n${requestedTopup}\n${sumTotal}`, true), alertType: 'error' });
        return null;
      }
      setLoading((pre) => ({ ...pre, loader: true, name: 'pageLoader' }));
      if (triggerRetryAPIState.isTrigger) {
        retryDisbursal(triggerRetryAPIState.appNo);
        return;
      }
      const { data } = await Service.post(`${process.env.REACT_APP_TOPUP_SERVICE}/create`, {
        customer_token: formData?.cust_dt,
        lan_token: lanData?.dt,
        rate_token: rateMasterToken,
        audit_token: lanData?.audit_token,
        customer_id: formData?.customer_id,
        parent_account_no: lanData?.lan?.trim(),
        total_eligible_value: topUpLoanData?.total_eligible_value,
        existing_outstanding: topUpLoanData?.existing_outstanding,
        existing_topup_amount: topUpLoanData?.existing_topup_amount,
        requested_amount: requestedAmt,
        net_disbursment: netDisbursement,
        total_charge: consolidatedCharges,
        time_taken_by_maker: timeTakenByUser,
        customer_photo: getValues('customer_live_photo'),
      });
      if (data?.success) {
        setAlertShow({ open: true, msg: `Disburment is in progress for application number ${data.data.application_no} Please wait for few minutes`, alertType: 'success' });
        setTimeout(() => {
          pollStatus(1, data.data.application_no);
        }, 10000);
      } else {
        setAlertShow({ open: true, msg: data?.msg, alertType: 'error' });
        setLoading((pre) => ({ ...pre, loader: false, name: null }));
      }
    } catch (err) {
      console.log('Error', err);
      setLoading((pre) => ({ ...pre, loader: false, name: null }));
      if (err?.response?.data?.msg) {
        setAlertShow({ open: true, msg: err.response.data.msg, alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong while creating Top Up loan.', alertType: 'error' });
      }
    }
  };

  const downloadFile = async (docName) => {
    try {
      setIsShowPDFError(false);
      setLoading((pre) => ({ ...pre, loader: true, name: docName }));
      const { data } = await Service.get(`${process.env.REACT_APP_APPLICATION_LOS_CHECKER}/${isLoanDisbursed.appNo}/documents/${docName === 'branchCopy' ? 2 : 2}`);
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
        setLoading((pre) => ({ ...pre, loader: false, name: null }));
      }, 1000);
    }
  };

  const handleClose = (event, reason) => {
    if (reason && reason === 'backdropClick') {
      return;
    }
    setIsLoanDisbursed({ disbursed: false, loanAccountNo: null, appNo: null });
    closeParentDialog();
  };

  const calculatePercentage = (percent, total) => Number(new Decimal((percent / 100) * total).toFixed(2));

  const calculateChargesAndFees = (requestedAmount) => {
    if (lanData.isHavePercentageCharge) {
      const allCharges = [];
      const allFees = [];
      let consolidatedAmount = 0;
      lanData.charge.forEach((ele) => {
        if (ele.type === 'PER') {
          const chargeOnAmount = Math.round(calculatePercentage(Number(ele.value), Number(requestedAmount)));
          const cgstOnAmount = calculatePercentage(Number(ele.cgst ?? 0), Number(chargeOnAmount));
          const sgstOnAmount = calculatePercentage(Number(ele.sgst ?? 0), Number(chargeOnAmount));
          allCharges.push({
            amount: {
              amount: chargeOnAmount,
              cgst: cgstOnAmount,
              sgst: sgstOnAmount
            },
            name: ele.name,
          });
          consolidatedAmount += chargeOnAmount + Math.ceil(cgstOnAmount + sgstOnAmount);
        } else {
          allCharges.push(ele);
          consolidatedAmount += ele.amount.amount + Math.ceil((ele.amount.cgst ?? 0) + (ele.amount.sgst ?? 0));
        }
      });
      lanData.fees.forEach((ele) => {
        if (ele.type === 'percentage_of_loan_amount') {
          const chargeOnAmount = Math.round(calculatePercentage(Number(ele.value), Number(requestedAmount)));
          const cgstOnAmount = calculatePercentage(Number(ele.cgst ?? 0), Number(chargeOnAmount));
          const sgstOnAmount = calculatePercentage(Number(ele.sgst ?? 0), Number(chargeOnAmount));
          allFees.push({
            amount: {
              amount: chargeOnAmount,
              cgst: cgstOnAmount,
              sgst: sgstOnAmount
            },
            name: ele.name,
          });
          consolidatedAmount += chargeOnAmount + Math.ceil(cgstOnAmount + sgstOnAmount);
        } else {
          allFees.push(ele);
          consolidatedAmount += ele.amount.amount + Math.ceil((ele.amount.cgst ?? 0) + (ele.amount.sgst ?? 0));
        }
      });
      setTopUpCharge(allCharges);
      setTopUpFees(allFees);
      setConsolidatedCharges(consolidatedAmount);
      setNetDisbursement(Math.floor(Number(requestedAmount) - consolidatedAmount));
    }
  };

  const renderError = (name) => {
    if (errors?.[name]) {
      return <FormHelperText error>{errors?.[name].message}</FormHelperText>;
    }
  };

  return (
    <>
      {loading.loader && loading.name === 'pageLoader' ? <PageLoader /> : null}
      <ToastMessage
        alertShow={alertShow}
        setAlertShow={setAlertShow}
      />
      <CustomForm onSubmit={handleSubmit(onSubmit)}>
        <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
          <Grid item xs={12} sm={6} md={4} lg={4} xl={4} padding='10px'>
            <HeadingMaster>Total Eligibility Value</HeadingMaster>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={4} xl={4} padding='10px'>
            <TextFieldStyled
              label=''
              defaultValue={amountFormat.format(Math.floor(topUpLoanData?.total_eligible_value))}
              disabled
              InputProps={{
                startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>
              }}
            />
          </Grid>
        </Grid>
        <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
          <Grid item xs={12} sm={6} md={4} lg={4} xl={4} padding='10px'>
            <HeadingMaster>Existing Outstanding</HeadingMaster>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={4} xl={4} padding='10px'>
            <TextFieldStyled
              label=''
              defaultValue={amountFormat.format(topUpLoanData?.existing_outstanding)}
              disabled
              InputProps={{
                startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>
              }}
            />
          </Grid>
        </Grid>
        <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
          <Grid item xs={12} sm={6} md={4} lg={4} xl={4} padding='10px'>
            <HeadingMaster>Available Top Up</HeadingMaster>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={4} xl={4} padding='10px'>
            <TextFieldStyled
              label=''
              disabled
              value={amountFormat.format(topUpLoanData?.existing_topup_amount)}
              InputProps={{
                startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>
              }}
            />
          </Grid>
        </Grid>
        <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
          <Grid item xs={12} sm={6} md={4} lg={4} xl={4} padding='10px'>
            <HeadingMaster>Requested Amount</HeadingMaster>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={4} xl={4} padding='10px'>
            <TextFieldStyled
              label=''
              placeholder='Requested Amount*'
              InputProps={{
                startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>
              }}
              {...register('requestedAmount', {
                onChange: (e) => {
                  const { value } = e.target;
                  setValue('requestedAmount', value.trim(), { shouldValidate: true });
                  if (!lanData.isHavePercentageCharge) {
                    setNetDisbursement(Math.floor(Number(value.trim()) - consolidatedCharges));
                  }
                },
                onBlur: (e) => {
                  if (e.target.value.trim().length && !getFieldState('requestedAmount').invalid) {
                    calculateChargesAndFees(e.target.value);
                  }
                },
                required: 'Please enter requested amount',
                pattern: { value: REGEX.AMOUNT, message: 'Please enter numeric digits only' },
                min: { value: 3000.01, message: 'Requested amount should be greater than 3,000' },
                max: { value: topUpLoanData.total_eligible_value, message: `Requested amount should be less or equal to than ${amountFormat.format(Math.floor(topUpLoanData.total_eligible_value))}` }
              })}
            />
            {renderError('requestedAmount')}
          </Grid>
        </Grid>
        {
          topUpCharge.map((charge) => (
            <>
              <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
                <Grid item xs={12} sm={6} md={4} lg={4} xl={4} padding='10px'>
                  <HeadingMaster>Charge Name</HeadingMaster>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={4} xl={4} padding='10px'>
                  <TextFieldStyled label='' disabled value={(charge?.name === 'STAMPDUTYRJ' ? 'Stamp Duty Rajasthan' : charge?.name) ?? 'NA'} />
                </Grid>
              </Grid>
              <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
                <Grid item xs={12} sm={6} md={4} lg={4} xl={4} padding='10px'>
                  <HeadingMaster>Charge Amount</HeadingMaster>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={4} xl={4} padding='10px'>
                  <TextFieldStyled
                    label=''
                    disabled
                    value={amountFormat.format(charge.amount.amount + (charge.amount.cgst ?? 0) + (charge.amount.sgst ?? 0))}
                    InputProps={{
                      startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>
                    }}
                  />
                </Grid>
              </Grid>
            </>
          ))
        }
        {
          topUpFees.map((fee) => (
            <>
              <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
                <Grid item xs={12} sm={6} md={4} lg={4} xl={4} padding='10px'>
                  <HeadingMaster>Fee Name</HeadingMaster>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={4} xl={4} padding='10px'>
                  <TextFieldStyled label='' disabled value={FEE_ENUM_VALUES[fee.name] ?? 'NA'} />
                </Grid>
              </Grid>
              <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
                <Grid item xs={12} sm={6} md={4} lg={4} xl={4} padding='10px'>
                  <HeadingMaster>Fee Amount</HeadingMaster>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={4} xl={4} padding='10px'>
                  <TextFieldStyled
                    label=''
                    disabled
                    value={amountFormat.format(fee.amount.amount + (fee.amount.cgst ?? 0) + (fee.amount.sgst ?? 0))}
                    InputProps={{
                      startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>
                    }}
                  />
                </Grid>
              </Grid>
            </>
          ))
        }
        <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
          <Grid item xs={12} sm={6} md={4} lg={4} xl={4} padding='10px'>
            <HeadingMaster>Consolidated Fees/Charges</HeadingMaster>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={4} xl={4} padding='10px'>
            <TextFieldStyled
              label=''
              disabled
              value={amountFormat.format(consolidatedCharges)}
              InputProps={{
                startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>
              }}
            />
          </Grid>
        </Grid>
        <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
          <Grid item xs={12} sm={6} md={4} lg={4} xl={4} padding='10px'>
            <HeadingMaster>Net Disbursement To Customer</HeadingMaster>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={4} xl={4} padding='10px'>
            <TextFieldStyled
              label=''
              disabled
              value={amountFormat.format(netDisbursement)}
              InputProps={{
                startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>
              }}
            />
          </Grid>
        </Grid>
        <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
          <Grid item xs={12} sm={6} md={4} lg={4} xl={4} padding='10px'>
            <HeadingMaster>Customer Live Photo</HeadingMaster>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={4} xl={4} padding='10px'>
            <LivePhoto
              register={register}
              errors={errors}
              setValue={setValue}
              getValues={getValues}
              input={{
                name: 'customer_live_photo',
                label: 'Customer Photo',
                filePath: `${LOS?.name}/${LOS?.details?.customerPicture}`,
                disable: isOTPSendSuccessfully,
                validation: {
                  isRequired: true,
                  requiredMsg: 'Please upload customer live photo',
                }
              }}
            />
          </Grid>
        </Grid>
        {
        !isOTPVerified
          ? (
            <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
              <Grid item xs={12} sm={6} md={4} lg={4} xl={8} padding='10px'>
                <HeadingMaster>Send OTP</HeadingMaster>
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={4} xl={8} padding='10px' display='flex'>
                <FullSizeButton
                  onClick={() => handleSendOTP('SMS')}
                  loading={loading.loader && loading.name === 'SMS'}
                  loadingPosition='start'
                  margin={['xs', 'sm'].includes(screen) ? '0px' : null}
                >
                  { timer && otpTypeToSend === 'SMS' ? `Resend OTP in ${180 - timer} sec` : 'Send OTP'}
                </FullSizeButton>
                <FullSizeButton
                  onClick={() => handleSendOTP('CALL')}
                  loading={loading.loader && loading.name === 'CALL'}
                  loadingPosition='start'
                  margin={['xs', 'sm'].includes(screen) ? '0px' : null}
                >
                  { timer && otpTypeToSend === 'CALL' ? `Resend OTP in ${180 - timer} sec` : 'Send OTP via Call'}
                </FullSizeButton>
                <FullSizeButton
                  onClick={() => handleSendOTP('WHATSAPP')}
                  loading={loading.loader && loading.name === 'WHATSAPP'}
                  loadingPosition='start'
                  disabled={!loading?.isEnableWhatsapp}
                  margin={['xs', 'sm'].includes(screen) ? '0px' : null}
                >
                  { timer && otpTypeToSend === 'WHATSAPP' ? `Resend OTP in ${180 - timer} sec` : 'OTP via Whatsapp'}
                </FullSizeButton>
              </Grid>
            </Grid>
          )
          : null
        }
        { isOTPSendSuccessfully && !isOTPVerified
          ? (
            <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
              <Grid item xs={12} sm={6} md={4} lg={4} xl={4} padding='10px'>
                <HeadingMaster>Enter OTP</HeadingMaster>
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={4} xl={4} padding='10px' display='flex'>
                <TextFieldStyled
                  label=''
                  placeholder='Enter OTP*'
                  {...register('enteredOTP', {
                    onChange: (e) => {
                      const value = e.target.value.replace(/[^0-9"]/g, '');
                      setValue('enteredOTP', value, { shouldValidate: true });
                    },
                    required: 'Please enter a valid OTP',
                    maxLength: { value: 8, message: 'Please enter a valid OTP' }
                  })}
                />
                <FullSizeButton
                  width='200px'
                  onClick={() => handleValidateOTP()}
                  disabled={false}
                  loading={loading.loader && loading.name === 'onValidateOTP'}
                  loadingPosition='start'
                  margin={['xs', 'sm'].includes(screen) ? '0px' : null}
                >
                  Validate OTP
                </FullSizeButton>
              </Grid>
            </Grid>
          )
          : null}
        <Grid container display='flex' alignItems='center' justifyContent='center'>
          <LoadingButtonPrimary
            variant='contained'
            type='submit'
            disabled={!isOTPVerified}
          >
            Confirm
          </LoadingButtonPrimary>
        </Grid>
      </CustomForm>
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
            <LoadingButtonPrimary onClick={() => downloadFile('branchCopy')} loading={loading.loader && loading.name === 'branchCopy'}>View Branch Copy</LoadingButtonPrimary>
            <LoadingButtonPrimary onClick={() => downloadFile('borrowerCopy')} loading={loading.loader && loading.name === 'borrowerCopy'}>Print Borrower Copy</LoadingButtonPrimary>
          </DownLoadButtonDiv>
        </DialogContent>
        <DialogActions>
          <LoadingButtonPrimary onClick={handleClose}>Okay</LoadingButtonPrimary>
        </DialogActions>
      </Dialog>
    </>
  );
};
export default TopUP;
