import { useEffect, useRef, useState } from 'react';
import { debounce } from 'lodash';
import { styled } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import { FullSizeButton, TextFieldStyled } from '../../styledComponents';
import ErrorText from '../errorHandler';
import PageLoader from '../../PageLoader';

const FieldWrapper = styled('div')(({ theme, show }) => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: '100%',
  borderRadius: '8px',
  background: show === 'fail' ? theme.text.secondary : '',
}));

const InputButtonOtp = (props) => {
  const {
    register,
    errors,
    input,
    variant,
    defaultValue,
    setValue,
    getValues,
    updateJsonHandler,
    setError
  } = props;
  const [loading, setLoading] = useState();
  const [count, showCount] = useState(input?.count);
  const [isShow, setIsShow] = useState(true);
  const intervalRef = useRef(null);
  const [whatsappVisibility, setWhatssappVisiblity] = useState({
    disableWhatsapp: input?.buttonDetails?.disableWhatsapp,
    maxAttempt: input?.buttonDetails?.attemptWhatsapp,
    currentAttempt: 0,
  });
  const { resend } = useSelector((state) => state.customerCreation);

  const resetfunction = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsShow(true);
  };

  const clickHandler = async (name) => {
    try {
      setLoading(name);
      showCount(input?.count);
      if (input?.onOTPSendHandler) {
        input.onOTPSendHandler({
          input,
          updateJsonHandler
        });
      }
      const formValue = getValues();
      const obj = {};
      input?.apiBody?.forEach((item) => {
        obj[item] = formValue[item];
      });
      const val = await input.function(obj, name, resetfunction);
      if (val.success) {
        setError(input.name, '');
        updateJsonHandler(input, val);
        if (val.stopTimer) {
          setIsShow(true);
        } else
          if (input?.disableTime) {
            setIsShow(() => false);
            intervalRef.current = setInterval(() => {
              if (count > 0) {
                showCount((pre) => (
                  pre - 1
                ));
              }
            }, input?.disableTime);
            setTimeout(() => {
              setIsShow(() => true);
              if (input?.timerExpireHandler) {
                input.timerExpireHandler(input, updateJsonHandler);
              }
              clearInterval(intervalRef.current);
              showCount(input?.count);
            }, input.disableTime * input.count);

            if (count <= 0) {
              clearTimeout(intervalRef.current);
            }
          }
        const newCurrentAttempt = whatsappVisibility.currentAttempt + 1;
        if (
          newCurrentAttempt >= whatsappVisibility.maxAttempt
        ) {
          setWhatssappVisiblity((prev) => ({
            ...prev,
            disableWhatsapp: false,
          }));
        } else {
          setWhatssappVisiblity((prev) => ({
            ...prev,
            currentAttempt: newCurrentAttempt,
          }));
        }
      } else if (!val.success && input?.isErrorHandled) {
        updateJsonHandler(input, val);
      } else if (!val.success) {
        setWhatssappVisiblity((prev) => ({
          ...prev,
          ...input?.buttonDetails?.fail
        }));
      }
      setLoading('');
    } catch (e) {
      console.log('Error', e);
      setWhatssappVisiblity((prev) => ({
        ...prev,
        ...input?.buttonDetails?.fail
      }));
      setLoading('');
    }
  };

  const disableHandler = () => {
    try {
      if (input?.isButtonEnable && getValues('OTPVerificationStatus') !== 'VALID') return false;
      if (loading || input?.disabled) return true;
      if (input?.enablebutton) {
        if (input.enablebutton?.length) {
          if (defaultValue?.length === input?.enablebutton?.length) {
            if (input?.validation?.pattern
              && new RegExp(input?.validation?.pattern).test(getValues(input.name))) {
              return false;
            }
            if (input?.validation?.hasOwnProperty('pattern')) {
              return true;
            }
            return false;
          }
          return true;
        }
      }
    } catch (e) {
      console.log('Error', e);
    }
  };

  useEffect(() => {
    console.log('resend value', resend);
    if (resend === 'VERIFIED') {
      setIsShow(() => true);
      showCount(input?.count);
    }
  }, [resend]);

  const handleChange = (event) => {
    const { value } = event.target;
    setValue(input?.name, value, {
      shouldValidate: true
    });
  };
  const debouncedOnChange = debounce(handleChange, 300);
  return (
    <>
      {(loading && input?.isPageLoaderRequired?.val)
        ? <PageLoader msg={input?.isPageLoaderRequired?.msg} /> : null}
      <FieldWrapper>
        <TextFieldStyled
          id={`${input?.id}-basic`}
          label={input?.validation?.isRequired ? `${input?.label}*` : input?.label}
          variant={variant}
          defaultValue={defaultValue || ''}
          disabled={!isShow || input?.disabled || input?.onlytextinputDisabled}
          {...register(
            input?.name,
            {
              required: input?.validation?.isRequired,
              pattern: (input?.validation?.pattern)
                ? new RegExp(input?.validation?.pattern) : undefined,
            }
          )
          }
          onChange={debouncedOnChange}
        />
        {input?.buttonDetails && isShow ? (
          <>
            {
              input.buttonDetails?.isOtp && (
                <FullSizeButton
                  width='300px'
                  onClick={() => clickHandler('SENDOTP')}
                  disabled={disableHandler()}
                  loading={loading === 'SENDOTP'}
                  loadingPosition='start'
                >
                  {input.buttonDetails?.sendOTP ? input.buttonDetails?.sendOTP : 'Send OTP'}
                </FullSizeButton>
              )
            }
            {
              input.buttonDetails?.isCall && (
                <FullSizeButton
                  onClick={() => clickHandler('CALL')}
                  disabled={disableHandler()}
                  loading={loading === 'CALL'}
                  width='500px'
                  loadingPosition='start'
                >
                  {input.buttonDetails?.callName ? input.buttonDetails?.callName : 'Call'}
                </FullSizeButton>
              )
            }
            {input.buttonDetails?.isWhatsapp && (
              <FullSizeButton
                width='450px'
                onClick={() => clickHandler('WHATSAPP')}
                disabled={disableHandler() || whatsappVisibility?.disableWhatsapp}
                loading={loading === 'WHATSAPP'}
                loadingPosition='start'
              >
                {input.buttonDetails?.whatsappOTP
                  ? input.buttonDetails?.whatsappOTP
                  : 'OTP Via Whatsapp'}
              </FullSizeButton>
            )}
          </>
        ) : (
          <FullSizeButton
            width='300px'
            fontSize='14px'
          >
            {`Resend OTP in ${count} sec`}

          </FullSizeButton>
        )}
      </FieldWrapper>
      <ErrorText input={input} errors={errors} />
    </>
  );
};

export default InputButtonOtp;
