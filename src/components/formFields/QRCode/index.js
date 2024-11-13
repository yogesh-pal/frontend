import { CircularProgress } from '@mui/material';
import styled from '@emotion/styled';
import { useEffect, useState, useRef } from 'react';
import { cloneDeep } from 'lodash';
import { timerUpdateHandler } from './utils';
import StopWatch from './utils/stopWatchComp';
import { ButtonPrimary } from '../../styledComponents';

const WrapperDiv = styled('div')(({ marginTop }) => ({
  marginTop: marginTop ?? '25px'
}));

const LoadingContainer = styled('div')(() => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  padding: '40px 0'
}));

const TextStyled = styled('p')(() => ({
  padding: '20px',
  fontSize: '17px',
  fontWeight: 600,
  color: '#502a74ab'
}));

const QRCodeInput = (props) => {
  const {
    input,
    updateJsonHandler,
    setValue,
    getValues
  } = props;
  const [timer, setTimer] = useState(cloneDeep(input?.initiatTimer));
  const qrCodeRef = useRef({ timer: cloneDeep(input?.initiatTimer) });
  const timerIntervalRef = useRef(null);
  const [qrData, setQrData] = useState({
    isShowTimer: false,
    isShowButton: false,
    isShowComponent: false,
    isLoading: true,
  });

  const timerHandler = async () => {
    try {
      timerIntervalRef.current = setInterval(async () => {
        timerUpdateHandler(setTimer, qrCodeRef);
        const qrCodeRefTemp = qrCodeRef.current?.timer;
        if (qrCodeRefTemp?.min === 0 && qrCodeRefTemp.hr === 0 && qrCodeRefTemp?.sec === 0) {
          if (input?.timeoutHandler) {
            await input?.timeoutHandler({
              qrData,
              setQrData,
              timer,
              updateJsonHandler,
              input,
              timerHandler,
              refComponent: qrCodeRef,
              setTimer,
              getValues,
              setValue
            });
          }
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
      }, 1000);
    } catch (e) {
      console.log('Error', e);
    }
  };

  const qrInitialHandler = async () => {
    try {
      if (input?.initialHandler) {
        const val = await input?.initialHandler({
          timerHandler,
          setQrData,
          qrData,
          updateJsonHandler,
          input,
          refComponent: qrCodeRef,
          timerIntervalRef,
          getValues,
          setValue
        });

        updateJsonHandler(input, val);
      }
    } catch (e) {
      console.log('Error', e);
    }
  };

  const componentRenderHandler = () => {
    try {
      console.log('Component details handler');
      return input.component({
        setValue,
        setDetails: setQrData,
        details: qrData,
        getValues,
        updateJsonHandler,
        input,
        refComponent: qrCodeRef
      });
    } catch (e) {
      console.log('Error', e);
    }
  };

  const btnClickHandler = (item) => {
    try {
      const { clickHandler } = item;

      if (clickHandler) {
        clickHandler({
          refComponent: qrCodeRef,
          item,
          updateJsonHandler,
          input,
          timerIntervalRef,
          setQrData,
          getValues,
          setValue
        });
      }
    } catch (e) {
      console.log('Error', e);
    }
  };

  useEffect(() => {
    if (input?.showTimerInitially) {
      timerHandler();
    }
    qrInitialHandler();
    return () => {
      timerIntervalRef.current = null;
      clearInterval(timerIntervalRef.current);
    };
  }, []);

  return (
    <WrapperDiv style={input?.style?.parent}>
      {qrData?.isShowTimer && !qrData?.isLoading && <StopWatch input={input} timer={timer} />}
      {qrData?.url && !qrData?.isLoading && (
        <iframe src={qrData?.url} style={input?.style?.iframe} title={input?.name} />
      )}
      {
        qrData?.isLoading && (
        <LoadingContainer>
          <CircularProgress color='secondary' />
          <TextStyled>{input?.loadingMessage}</TextStyled>
        </LoadingContainer>
        )
      }
      {
        input?.buttonDetails && qrData?.isShowButton && !qrData?.isLoading && (
          input?.buttonDetails?.btn.map((item) => (
            <ButtonPrimary
              disabled={qrData[item?.name]}
              onClick={() => btnClickHandler(item)}
            >
              {item?.name}
            </ButtonPrimary>
          ))
        )
      }
      {qrData?.isShowComponent && !qrData?.isLoading && componentRenderHandler()}
    </WrapperDiv>
  );
};
export default QRCodeInput;
