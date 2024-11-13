/* eslint-disable prefer-arrow-callback */
import styled from '@emotion/styled';
import { Grid } from '@mui/material';
import { CustomContainerStyled } from '../../../components/styledComponents/container';
import { HeadingMaster2 } from '../../userManagement/styled-components';
import { useScreenSize } from '../../../customHooks';

export const CustomContainer = styled(CustomContainerStyled)`
margin-top: 12px;
padding-bottom: 20px; 
`;

export const CustomForm = styled('form')(({ width }) => ({
  width: width || '500px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
}));

export const CustomGrid = styled(Grid)`
  align-self: flex-start;
`;

const CustomGridLabel = styled(Grid)`
  display: flex;
  font-size: 14px;
  padding: 5px !important;
`;

const CustomGridValue = styled(Grid)`
  font-size: 19px;
  word-break: break-word;
`;

export const invokeRazorPayment = (
  key,
  callbackUrl,
  orderId,
  amount,
  handleReset,
  setIsPaymentProcessing,
) => {
  const config = {
    key,
    amount,
    currency: 'INR',
    order_id: orderId,
    callback_url: callbackUrl,
    modal: {
      ondismiss() {
        setIsPaymentProcessing(false);
        handleReset({ message: 'You have cancelled the payment', alertType: 'error' });
      }
    },
    theme: {
      color: '#502A74'
    },
    retry: {
      enabled: false,
    },
    redirect: true
  };
  return config;
};

export const invokePaytmPayment = (
  orderId,
  handleReset,
  amount,
  token,
  setIsPaymentProcessing,
  setIsPageLoading
) => {
  const config = {
    merchant: {
      redirect: false
    },
    payMode: {
      order: ['UPI', 'CARD']
    },
    data: {
      orderId,
      amount,
      token,
      tokenType: 'TXN_TOKEN'
    },
    handler: {
      notifyMerchant(eventType) {
        if (eventType === 'APP_CLOSED') {
          setIsPaymentProcessing(false);
          handleReset({ message: 'You have cancelled the payment', alertType: 'error' });
        }
      },
      transactionStatus: function transactionStatus() {
        window.Paytm.CheckoutJS.close();
        setIsPageLoading(true);
      }
    }
  };
  return config;
};

export const showKeyValuePair = (customerData, paymentStatus = false) => {
  const screen = useScreenSize();
  return (
    <Grid container spacing={2}>
      {
        customerData?.map((item) => (
          <CustomGridLabel
            key={item.label}
            item
            xs={12}
            md={6}
          >
            <Grid item xs={6} sm={paymentStatus ? 6 : 5} lg={paymentStatus ? 6 : 4}>
              <HeadingMaster2 padding='0 !important'>{item.label}</HeadingMaster2>
            </Grid>
            <CustomGridValue
              item
              display='flex'
              xs={6}
              sm={paymentStatus ? 6 : 7}
              lg={paymentStatus ? 6 : 8}
            >
              <span style={{ marginRight: `${(['xs', 'sm'].includes(screen)) ? '0px' : '20px'}` }}>:</span>
            &nbsp;
              <span>{item.value}</span>
            </CustomGridValue>
          </CustomGridLabel>
        ))
      }
    </Grid>
  );
};

export const openPaytm = (
  res,
  mid,
  orderId,
  amount,
  txnToken,
  resetHandler,
  setPaymentStatus,
  handleScriptError,
  setIsPageLoading
) => {
  try {
    const script = document.createElement('script');
    script.src = `${process.env.REACT_APP_PAYTM_PAYMENT_HOST}/merchantpgpui/checkoutjs/merchants/${mid}.js`;
    script.async = true;
    document.body.appendChild(script);
    script.onerror = () => handleScriptError();
    script.onload = () => {
      const config = invokePaytmPayment(
        orderId,
        resetHandler,
        amount,
        txnToken,
        setPaymentStatus,
        setIsPageLoading
      );
      if (!window.Paytm || !window.Paytm.CheckoutJS) {
        handleScriptError();
      } else {
        window.Paytm.CheckoutJS.onLoad(function excecuteAfterCompleteLoad() {
          window.Paytm.CheckoutJS.init(config).then(function onSuccess() {
            window.Paytm.CheckoutJS.invoke();
            res({ isOpen: true, orderId });
          }).catch(function onError(error) {
            if (error.hasError) {
              handleScriptError(error.message);
            } else {
              handleScriptError();
            }
          });
        });
      }
    };
  } catch (err) {
    console.log('error in loading script', err);
  }
};

export const openRazorPay = (
  res,
  key,
  callbackUrl,
  orderid,
  amount,
  resetHandler,
  setPaymentStatus,
  handleScriptError
) => {
  const script = document.createElement('script');
  script.src = process.env.REACT_APP_RAZORPAY_PAYMENT_HOST;
  script.async = true;
  document.body.appendChild(script);
  script.onerror = () => handleScriptError();
  script.onload = () => {
    const config = invokeRazorPayment(
      key,
      callbackUrl,
      orderid,
      amount,
      resetHandler,
      setPaymentStatus
    );
    const intiate = new window.Razorpay(config);
    intiate.open();
    res();
  };
};

export const openCashfree = (
  res,
  txnToken,
  orderId,
  resetHandler,
  setPaymentStatus,
  handleScriptError,
  setIsPageLoading
) => {
  try {
    const script = document.createElement('script');
    script.src = process.env.REACT_APP_CASHFREE_JS;
    script.async = true;
    document.body.appendChild(script);
    script.onerror = () => handleScriptError();
    script.onload = () => {
      if (typeof window.Cashfree === 'function') { // Check to ensure Cashfree is availbled/defined as a global variable after script loaded completely
        const cashfree = window.Cashfree({ mode: process.env.REACT_APP_CASHFREE_MODE ? process.env.REACT_APP_CASHFREE_MODE : 'sandbox' });

        const checkoutOptions = {
          paymentSessionId: txnToken,
          redirectTarget: '_modal'
        };

        cashfree.checkout(checkoutOptions).then(function (result) {
          if (result.error) {
            setPaymentStatus(false);
            resetHandler({ message: 'You have cancelled the payment', alertType: 'error' });
          }
          if (result.redirect) {
            console.log('Payment will be redirected.');
            setPaymentStatus(false);
            resetHandler({ message: 'Issue with payment redirection. Please try another payment method.', alertType: 'error' });
          }
          if (result.paymentDetails) {
            setIsPageLoading(true);
          }
        });
        res({ isOpen: true, orderId });
      } else {
        handleScriptError('Issue loading Cashfree.js');
        console.error('Issue loading Cashfree.js');
      }
    };
  } catch (err) {
    console.log('error in loading script', err);
  }
};
