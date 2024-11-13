import React, { useEffect } from 'react';
import { Box, Typography, styled } from '@mui/material';
import FormGenerator from '../../../components/formGenerator';

const TypographyStyled = styled(Typography)(() => ({
  color: '#929292'
}));

const TypographyResendStyled = styled(Typography)(() => ({
  color: '#515151'
}));

const TypographyLinkStyled = styled(Typography)(() => ({
  color: '#7a5d95',
  cursor: 'pointer',
  textDecoration: 'underline'
}));

const ContainerStyled = styled(Box)(() => ({
  marginLeft: '20px'
}));

const TitleStyled = styled(Box)(() => ({
  marginBottom: '10px'
}));

const fillOtp = ({
  verifyOtpConfiguration,
  setFormConfiguration,
  leadSubmitHandler,
  otpVerification,
  alertShow,
  setAlertShow,
  proceedResendSendOtpHandler,
  resendTimer,
  setResendTimer
}) => {
  useEffect(() => {
    const myInterval = setInterval(() => {
      if (resendTimer > 0) {
        setResendTimer(resendTimer - 1);
      }
    }, 1000);
    return () => {
      clearInterval(myInterval);
    };
  });

  return (
    <>
      <FormGenerator
        formDetails={verifyOtpConfiguration}
        setFormDetails={setFormConfiguration}
        formHandler={leadSubmitHandler}
        changeEvent={otpVerification}
        alertShow={alertShow}
        setAlertShow={setAlertShow}
      />
      <ContainerStyled>
        <TitleStyled>
          <TypographyStyled>
            You will receive an OTP.
          </TypographyStyled>
          <TypographyStyled>
            {`Please wait for ${resendTimer} seconds.`}
          </TypographyStyled>
        </TitleStyled>
        <TypographyResendStyled display='inline'>
          Did not receive OTP?
          {' '}
        </TypographyResendStyled>
        <TypographyLinkStyled
          sx={{
            color: resendTimer > 0 && 'text.disabled',
            pointerEvents: resendTimer > 0 ? 'none' : 'auto'
          }}
          onClick={proceedResendSendOtpHandler}
          display='inline'
        >
          Resend OTP.
        </TypographyLinkStyled>
      </ContainerStyled>
    </>
  );
};

export default fillOtp;
