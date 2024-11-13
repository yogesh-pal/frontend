/* eslint-disable camelcase */
import React, { useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Grid, FormControl, FormControlLabel, RadioGroup, useMediaQuery
} from '@mui/material';
import jwtDecode from 'jwt-decode';
import { HeaderContainer } from '../../../../components/styledComponents/container';
import { HeadingMaster } from '../../../../components/styledComponents/heading';
import { ErrorText, DialogBox } from '../../../../components';
import { useScreenSize } from '../../../../customHooks';
import { RadiobuttonStyle, ButtonPrimary } from '../../../../components/styledComponents';
import { LoadingButtonPrimary } from '../../../../components/styledComponents/button';
import {
  CustomContainer, CustomForm, CustomGrid, openPaytm, showKeyValuePair, openRazorPay, openCashfree
} from '../common';
import CustomToaster from '../../../../components/mesaageToaster';
import { Service } from '../../../../service';
import { throttleFunction } from '../../../../utils/throttling';
import { handleEventLog } from '../../../../consumerFirebase';
import PreventScroll from '../../../../components/preventScroll';

const index = ({
  customerData, customerLan, customerBranch, handleReset, setIsPaymentProcessing,
  system, scriptRef,
  setIsPageLoading, paymentViaDashboardToken
}) => {
  const {
    register, handleSubmit, setValue, formState: { errors },
  } = useForm();
  const screen = useScreenSize();
  const [searchParams] = useSearchParams();
  const timerRef = useRef();
  const amountValueRef = useRef();
  const multipleTimers = useRef([]);
  // const amountFieldRef = useRef(null);
  const navigate = useNavigate();
  // const lanPrefilled = searchParams.get('lan');
  const timoutPrefilled = searchParams.get('timeout');
  const [loading, setLoading] = useState(false);
  const [errorState, setErrorState] = useState({
    open: false,
    msg: '',
    alertType: ''
  });
  const [isDisabled, setIsDisabled] = useState(false);

  const [paymentGatewayModelIsOpen, setPaymentGatewayModalIsOpen] = useState(false);
  const [amountData, setAmountData] = useState({
    amount: ''
  });

  const gatewayConfig = {
    PAYTM: 'PAYTM',
    RAZORPAY: 'RAZORPAY',
    CASHFREE: 'CASHFREE'
  };

  const [paymentGateway, setPaymentGateway] = useState({
    default: gatewayConfig.PAYTM,
    PAYTM: {
      enable: true
    },
    CASHFREE: {
      enable: true
    }
  });

  const isSmallScreen = useMediaQuery('(max-width: 280px)');

  const removeCashfreeFromDOM = () => {
    const srcSubstring = 'sdk.cashfree.com';

    const iframes = document.querySelectorAll('iframe');
    iframes.forEach((iframe) => {
      if (iframe.src.includes(srcSubstring)) {
        iframe.remove();
      }
    });

    const scripts = document.querySelectorAll('script');
    scripts.forEach((script) => {
      if (script.src.includes(srcSubstring)) {
        script.remove();
      }
    });

    const div = document.getElementById('cashfree-modal-container');
    if (div) {
      div.remove();
    }
  };

  const amountRef = useRef();
  const paymentMapper = {
    PAYTM: openPaytm,
    RAZORPAY: openRazorPay,
    CASHFREE: openCashfree,
  };
  const handleScriptError = (message = null) => {
    setLoading(false);
    scriptRef.current = false;
    amountRef.current = false;
    setErrorState({
      open: true,
      msg: message ?? 'Something went wrong. Please try again.',
      alertType: 'error'
    });
  };

  const loadScript = (src, args) => new Promise((resolve) => {
    paymentMapper[src.toUpperCase()](resolve, ...args);
  });

  const decodeTokenHandler = (sessionToken) => {
    try {
      const decodedToken = atob(sessionToken);
      const jwtDetails = jwtDecode(decodedToken);
      return jwtDetails?.request_details || {};
    } catch (err) {
      console.log('Error', err);
      return {};
    }
  };

  const eventHandler = (eventName, payload) => {
    try {
      const eventDetails = {
        lan: customerLan,
        amount: payload?.amount_to_pay,
        payment_gateway: paymentGateway.default.toUpperCase(),
        status: payload?.status
      };

      if (payload?.session_token) {
        const { branch_code = '', email = '', emp_code = '' } = decodeTokenHandler(payload?.session_token);
        const tempEmail = email.split('@');
        eventDetails.branch_code = branch_code;
        eventDetails.email = tempEmail.length > 0 ? tempEmail[0] : '';
        eventDetails.email_domain = tempEmail.length > 1 ? tempEmail[1] : '';
        eventDetails.emp_code = emp_code;
      }
      handleEventLog(eventName, eventDetails);
    } catch (err) {
      console.log('Error', err);
    }
  };

  const poolStatus = async (interval, count, orderId) => {
    if (!scriptRef.current) { return; }
    const newInterval = count === 6 ? interval + 5 : interval;
    const newCount = count === 6 ? 1 : count + 1;
    try {
      const { data } = await Service.getAPI(`${process.env.REACT_APP_FETCH_PAYMENT_STATUS}?order_id=${orderId}&payment_gateway=${paymentGateway.default.toUpperCase()}`);
      if (data.success && data.status === 'PENDING') {
        const timer = setTimeout(() => {
          poolStatus(newInterval, newCount, orderId);
        }, newInterval * 1000);
        multipleTimers.current.push(timer);
      } else {
        if (paymentGateway.default.toUpperCase() === gatewayConfig.PAYTM) {
          window.Paytm.CheckoutJS.close();
        } else removeCashfreeFromDOM();

        const payload = {
          account_number: customerLan,
          amount_to_pay: amountValueRef.current,
          payment_gateway: paymentGateway.default.toUpperCase(),
          ...(paymentViaDashboardToken !== null && paymentViaDashboardToken !== undefined && localStorage.getItem('onlinePaymentToken') === paymentViaDashboardToken
            ? { session_token: paymentViaDashboardToken } : {})
        };

        setIsPageLoading(true);

        if (!data.success) {
          payload.status = 'PENDING';
        } else {
          payload.status = data?.status;
        }

        eventHandler('PAYMENT_STATUS', payload);

        const notifyRes = await Service.postLogin(process.env.REACT_APP_NOTIFY_PAYMENT_STATUS, {
          order_id: orderId
        });
        const info = notifyRes?.data?.data;

        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }

        navigate(`/payment-status?data=${info}`);
      }
    } catch (err) {
      console.log(err);
      const timer = setTimeout(() => {
        poolStatus(newInterval, newCount, orderId);
      }, newInterval * 1000);
      multipleTimers.current.push(timer);
    }
  };

  const handleTimers = (isScriptLoaded) => {
    scriptRef.current = true;
    const poolTimeout = setTimeout(() => {
      poolStatus(10, 1, isScriptLoaded.orderId);
    }, 20000);
    multipleTimers.current.push(poolTimeout);
    timerRef.current = setTimeout(() => {
      if (paymentGateway.default.toUpperCase() === gatewayConfig.PAYTM) {
        window.Paytm.CheckoutJS.close();
      } else removeCashfreeFromDOM();
      if (multipleTimers.current.length > 0) {
        multipleTimers.current.forEach((currTimer) => clearTimeout(currTimer));
      }
      const statusKey = window.btoa('status=PENDING');
      navigate(`/payment-status?data=${statusKey}`);
    }, (timoutPrefilled ?? 900) * 1000);
  };

  const hitApi = async (values) => {
    try {
      const amount = parseInt(values.amount, 10);
      const payload = {
        lan_number: customerLan,
        amount
      };
      setLoading(true);
      amountRef.current = true;
      const { data } = await Service.postLogin(process.env.REACT_APP_INITIATE_PAYMENT, payload);
      if (data.success) {
        let args;
        const source = data?.source;
        if (source.toUpperCase() === gatewayConfig.PAYTM) {
          args = [data.mId,
            data.order_id, data.amount, data.txnToken, handleReset,
            setIsPaymentProcessing, handleScriptError, setIsPageLoading];
        } else if (source.toUpperCase() === gatewayConfig.RAZORPAY) {
          args = [data.mId,
            data.callbackUrl, data.order_id, data.amount, handleReset,
            setIsPaymentProcessing, handleScriptError];
        }

        const isScriptLoaded = await loadScript(
          source,
          args
        );
        if (isScriptLoaded.isOpen) {
          handleTimers(isScriptLoaded);
        }
      }
    } catch (err) {
      let errorMessage = 'Something Went Wrong. Please Try Again.';
      if (err?.response?.data && err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setErrorState({
        open: true,
        msg: errorMessage,
        alertType: 'error'
      });
    } finally {
      setLoading(false);
      amountRef.current = false;
    }
  };

  const hitFlexCube = async (values) => {
    console.log('flex cube amount method hit', values);
    try {
      const amount = parseInt(values.amount, 10);
      amountValueRef.current = amount;
      const payload = {
        account_number: customerLan,
        amount_to_pay: amount,
        payment_gateway: paymentGateway.default.toUpperCase(),
        ...(paymentViaDashboardToken !== null && paymentViaDashboardToken !== undefined && localStorage.getItem('onlinePaymentToken') === paymentViaDashboardToken
          ? { session_token: paymentViaDashboardToken } : {})
      };
      setLoading(true);
      amountRef.current = true;
      const { data } = await Service.postLogin(
        process.env.REACT_APP_FLEXCUBE_INITIATE_PAYTM,
        payload
      );

      eventHandler('PAYMENT_INITIATE', payload);

      if (data.success) {
        let args;
        const source = data?.source;
        if (source.toUpperCase() === gatewayConfig.PAYTM) {
          args = [data.mId,
            data.order_id, data.amount, data.txnToken, handleReset,
            setIsPaymentProcessing, handleScriptError, setIsPageLoading];
        } else if (source.toUpperCase() === gatewayConfig.RAZORPAY) {
          args = [data.mId,
            data.callbackUrl, data.order_id, data.amount, handleReset,
            setIsPaymentProcessing, handleScriptError];
        } else if (source.toUpperCase() === gatewayConfig.CASHFREE) {
          args = [data.txnToken, data.order_id, handleReset,
            setIsPaymentProcessing, handleScriptError, setIsPageLoading];
        }

        const isScriptLoaded = await loadScript(
          source,
          args
        );

        if (isScriptLoaded.isOpen) {
          handleTimers(isScriptLoaded);
        }
      }
    } catch (err) {
      console.log('erro in flexcube', err);
      let errorMessage = 'Something Went Wrong. Please Try Again.';
      if (err?.response?.data && err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setErrorState({
        open: true,
        msg: errorMessage,
        alertType: 'error'
      });
    } finally {
      setLoading(false);
      amountRef.current = false;
    }
  };

  const amountFunc = {
    veefin: hitApi,
    flexcube: hitFlexCube
  };

  const proceedForPaymentFormSubmit = async (values) => {
    const URL = `${process.env.REACT_APP_LOS_CONFIG_SERVICE}?key=payment_gateway_config`;
    const { data, status } = await Service.get(URL);

    if (data && status === 200) {
      let branchPaymentGatewayConfig = data.gateways;

      if (system === 'flexcube' && customerBranch in data.branch_mapping) {
        branchPaymentGatewayConfig = data.branch_mapping[customerBranch];
      }

      const defaultGateway = branchPaymentGatewayConfig.default;
      const isDefaultEnabled = branchPaymentGatewayConfig[defaultGateway]?.enable;

      const fallbackGateway = (defaultGateway === gatewayConfig.PAYTM)
        ? gatewayConfig.CASHFREE : gatewayConfig.PAYTM;
      const paymentGatewayDefault = isDefaultEnabled
        ? defaultGateway.toUpperCase() : fallbackGateway.toUpperCase();

      setPaymentGateway({
        default: paymentGatewayDefault,
        PAYTM: branchPaymentGatewayConfig.PAYTM,
        CASHFREE: (system === 'flexcube') ? branchPaymentGatewayConfig.CASHFREE : { ...branchPaymentGatewayConfig.CASHFREE, enable: false }
      });
    }

    setPaymentGatewayModalIsOpen(true);
    setAmountData(values);
  };

  const onAmountSubmit = async () => {
    const values = amountData;
    setPaymentGatewayModalIsOpen(false);
    setIsPaymentProcessing(true);
    throttleFunction(
      {
        args1: [values],
        function1: amountFunc[system]
      },
      amountRef,
      setIsDisabled
    );
  };
  const amountInput = {
    name: 'amount',
    validation: {
      isRequired: true,
      requiredMsg: 'Please enter Amount',
    }
  };

  return (
    <CustomContainer padding='12px' style={{ marginTop: '12px' }}>
      <CustomToaster alertShow={errorState} setAlertShow={setErrorState} />
      <HeaderContainer item xs={12}>
        <HeadingMaster>
          Customer Details
        </HeadingMaster>
      </HeaderContainer>
      <Grid container paddingLeft='32px'>
        { showKeyValuePair(customerData) }
      </Grid>
      <Grid container>
        <HeaderContainer
          item
          xs={12}
          flexDirection='row'
          justifyContent='center'
          marginTop='15px'
          padding='0 21px'
        >
          <CustomForm
            onSubmit={handleSubmit(proceedForPaymentFormSubmit)}
            width={['xs', 'sm'].includes(screen) ? '100%' : ''}
          >
            <PreventScroll
              id='ampunt'
              label='*Amount'
              variant='outlined'
              type='number'
              {...register('amount', {
                required: true,
              })}
              onChange={(e) => {
                const amountValue = e.target.value.replace(/[^0-9]/g, '');
                setValue('amount', amountValue, {
                });
              }}
            />
            <CustomGrid>
              <ErrorText input={amountInput} errors={errors} />
            </CustomGrid>
            <LoadingButtonPrimary
              variant='contained'
              type='submit'
              loading={loading}
              disabled={isDisabled}
              loadercolor='#502A74'
              loadingPosition='start'
            >
              {loading ? 'Processing...' : 'Proceed Now'}
            </LoadingButtonPrimary>
          </CustomForm>
        </HeaderContainer>
      </Grid>
      <DialogBox
        isOpen={paymentGatewayModelIsOpen}
        handleClose={() => { setPaymentGatewayModalIsOpen(false); }}
        padding='0px'
        title='Select Payment Gateway'
      >
        <Grid container display='flex' alignItems='center' justifyContent='center' sx={{ padding: '60px 10px 0px 10px' }}>
          <FormControl component='fieldset'>
            <RadioGroup
              row
              aria-labelledby='radio-buttons'
              name='radio-buttons-group'
              value={paymentGateway}
              onChange={(e) => setPaymentGateway((prev) => ({
                ...prev,
                default: e.target.value
              }))}
              sx={{ justifyContent: 'center' }}
            >
              <FormControlLabel
                value={gatewayConfig.PAYTM}
                disabled={!paymentGateway.PAYTM.enable}
                control={<RadiobuttonStyle />}
                label={<img src='https://coreui-dev.capriglobal.in/media/images/paytm.png' alt='Paytm' style={{ width: isSmallScreen ? '140px' : '175px', height: 'auto' }} />}
                checked={paymentGateway.default === gatewayConfig.PAYTM}
                sx={(!paymentGateway.CASHFREE.enable) ? {
                  '&.Mui-checked': {
                    color: 'grey.400',
                  },
                  color: 'grey.400',
                  '&.Mui-disabled': {
                    color: 'grey.400',
                    opacity: 0.5,
                  },
                } : {}}
              />
              <FormControlLabel
                value={gatewayConfig.CASHFREE}
                disabled={!paymentGateway.CASHFREE.enable}
                control={<RadiobuttonStyle />}
                label={<img src='https://coreui-dev.capriglobal.in/media/images/cashfree.png' alt='Cashfree' style={{ width: isSmallScreen ? '140px' : '175px', height: 'auto' }} />}
                checked={paymentGateway.default === gatewayConfig.CASHFREE}
                sx={(!paymentGateway.CASHFREE.enable) ? {
                  '&.Mui-checked': {
                    color: 'grey.400',
                  },
                  color: 'grey.400',
                  '&.Mui-disabled': {
                    color: 'grey.400',
                    opacity: 0.5,
                  },
                } : {}}
              />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid container display='flex' alignItems='center' justifyContent='center' padding='50px 10px'>
          <ButtonPrimary onClick={onAmountSubmit}>Pay</ButtonPrimary>
        </Grid>
      </DialogBox>
    </CustomContainer>
  );
};

export default index;
