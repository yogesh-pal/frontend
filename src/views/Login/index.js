import React, { useRef, useState } from 'react';
import styled from '@emotion/styled';
import { Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import jwtDecode from 'jwt-decode';
// Imports meant to create the OTP validation intermediatory view
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import { icons } from '../../components/icons';
import CustomToaster from '../../components/mesaageToaster'; // Custom Alert import
import { login, loginUserDetails, saveToken } from '../../redux/reducer/login';
import {
  IDENTIFIER,
  REGEX,
  ROUTENAME
} from '../../constants';
import { Service } from '../../service';
import FormGenerator from '../../components/formGenerator';
// import PublicRouteHeader from '../../components/header/publicRouteHeader';
// import FooterComponent from '../../components/footer';
import capriLogo from '../../assets/CGCL_logo.png';
import Layout from '../../layout/publicDashboard';
import {
  ButtonPrimary, ButtonSecondary, PasswordFormControl,
  PasswordLabelStyled
} from '../../components/styledComponents';
import { throttleFunction } from '../../utils/throttling'; // Throttling util import

const CustomGrid = styled(Grid)`
    min-height: calc(100% - 110px);
    display:flex;
    justify-content:center;
    align-items: center;
`;
const FormContainer = styled(Grid)`
    box-shadow: #00000033 0px 2px 8px;
    display:flex;
    flex-direction: column;
    justify-content:center;
    align-items: center;
    padding-top:20px !important;
`;

const Login = () => {
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [showValidateOTP, setShowValidateOTP] = useState(false);
  const [dtToken, setDtToken] = useState('');

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [showBackBtn, setShowBackBtn] = useState(false);
  const loaderRef = useRef(false);

  const formHandler = (formValues) => {
    setIsLoading(true);
    const payload = {
      app: 'Gold Loans',
      username: formValues?.username,
      password: formValues?.password
    };
    Service.postLogin(process.env.REACT_APP_LOGIN_SERVICE, payload).then((data) => {
      if (data.data.success === 'true') {
        if (data.data.hasOwnProperty('accessToken')) {
          setAlertShow({
            open: true,
            msg: 'Successfully Logged In!',
            alertType: 'success'
          });
          dispatch(login(true));
          dispatch(saveToken(data.data.accessToken));
          const decodeToken = jwtDecode(data.data.accessToken);
          const permissions = decodeToken?.permissions?.split(',');
          const perObj = {};
          permissions.forEach((item) => {
            perObj[item] = item;
          });
          dispatch(loginUserDetails({
            email: formValues?.username,
            empCode: decodeToken?.emp_code,
            branchCodes: data.data?.branchCodes,
            selectedBranch: data?.data?.branchCodes?.length === 1 ? data.data.branchCodes[0] : [],
            allBranchSelected: false,
            userPermission: perObj,
            name: decodeToken?.fullname,
            role: data?.data?.role
          }));
          navigate(ROUTENAME.selectBranch);
        } else {
          setDtToken(data.data?.dt ?? '');
          setShowValidateOTP(true);
        }
      } else {
        setAlertShow({
          open: true,
          msg: 'Invalid Credentials',
          alertType: 'error'
        });
      }
      setIsLoading(false);
    }).catch((error) => {
      if (error?.response?.status === 403) {
        setAlertShow({
          open: true,
          msg: 'Invalid Credentials',
          alertType: 'error'
        });
      } else {
        setAlertShow({
          open: true,
          msg: 'oops! Something went wrong',
          alertType: 'error'
        });
      }
      setIsLoading(false);
    });
  };

  const verifyOTP = (otp) => {
    loaderRef.current = true;
    const payload = {
      otp,
      dt: dtToken,
      email: jwtDecode(dtToken)?.email
    };

    Service.post(process.env.REACT_APP_MFA_VALIDATE_OTP, payload).then((data) => {
      if (data.data.success === 'true' && data.data.hasOwnProperty('accessToken')) {
        setAlertShow({
          open: true,
          msg: 'Successfully Logged In!',
          alertType: 'success'
        });
        dispatch(login(true));
        dispatch(saveToken(data.data.accessToken));
        const decodeToken = jwtDecode(data.data.accessToken);
        const permissions = decodeToken?.permissions?.split(',');
        const perObj = {};
        permissions.forEach((item) => {
          perObj[item] = item;
        });
        dispatch(loginUserDetails({
          email: jwtDecode(dtToken)?.email,
          empCode: decodeToken?.emp_code,
          branchCodes: data.data?.branchCodes,
          selectedBranch: data?.data?.branchCodes?.length === 1 ? data.data.branchCodes[0] : [],
          allBranchSelected: false,
          userPermission: perObj,
          name: decodeToken?.fullname,
          role: data?.data?.role
        }));

        setDtToken('');
        setShowValidateOTP(false);

        navigate(ROUTENAME.selectBranch);
      } else {
        setAlertShow({
          open: true,
          msg: data.data.msg,
          alertType: 'error'
        });
        setShowBackBtn(true);
      }
      loaderRef.current = false;
    }).catch((error) => {
      console.log('Error is :- ', error);
      if (error?.response?.status === 403) {
        setAlertShow({
          open: true,
          msg: 'OTP verification failed.',
          alertType: 'error'
        });
      } else {
        setAlertShow({
          open: true,
          msg: error.response.data.msg,
          alertType: 'error'
        });
      }
      loaderRef.current = false;
      setShowBackBtn(true);
    });
  };

  const otpFormHandler = () => {
    console.log('I am stuck in here .... otpFormHandler');
    const otpInput = document.getElementById('otp').value; // Replace with appropriate state management if needed

    // Validation rules
    const isRequired = otpInput.length > 0; // OTP is required
    const isCorrectLength = otpInput.length >= 4 && otpInput.length <= 6;
    const isValidPattern = /^\d{4,6}$/.test(otpInput); // OTP must contain only digits and must be either 4 or 6 digits long

    console.log(otpInput);
    console.log(isCorrectLength);
    console.log(isValidPattern);
    // Validation checks
    if (!isRequired) {
      setAlertShow({ open: true, msg: 'OTP is required.', alertType: 'error' });
      return;
    }
    if (!isCorrectLength) {
      setAlertShow({ open: true, msg: 'OTP must be 4 digits long.', alertType: 'error' });
      return;
    }
    if (!isValidPattern) {
      setAlertShow({ open: true, msg: 'OTP must only contain digits.', alertType: 'error' });
      return;
    }

    // If all validations pass, call the throttled handler
    throttleFunction(
      {
        args1: [parseInt(otpInput, 10)],
        function1: verifyOTP
      },
      loaderRef,
      setIsButtonDisabled
    );
  };

  const formConfiguration = {
    form: [
      {
        variant: 'outlined',
        input: [
          {
            name: 'username',
            type: 'text',
            label: 'Email',
            identifier: IDENTIFIER.INPUTTEXT,
            validation: {
              isRequired: true,
              requiredMsg: 'Please enter your Email',
              pattern: REGEX.EMAIL,
              patternMsg: 'Invalid Email address'
            }
          },
          {
            name: 'password',
            label: 'Password',
            type: 'password',
            identifier: IDENTIFIER.PASSWORD,
            validation: {
              isRequired: true,
              requiredMsg: 'Please enter your Password',
              // pattern: REGEX.PASSWORD,
              // patternMsg: 'Password must contain at least 1 Uppercase,1 Lowercase, 1 Number, 1
              // Symbol(!@#$%^&*_=+-) and 8 to 12 character length'
            }
          },
        ],
        buttonDetails: {
          alignment: 'center',
          name: 'Login',
          type: 'submit'
        },
        alignment: {
          xs: 12,
          sm: 12,
          md: 12,
          lg: 12,
          xl: 12
        }
      }
    ]
  };

  const [values, setValues] = useState({
    showPassword: false,
  });

  const handleClickShowPassword = () => {
    setValues({
      ...values,
      showPassword: !values.showPassword,
    });
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <>
      {
      !showValidateOTP ? (
        <Layout>
          {/* <PublicRouteHeader /> */}
          <CustomGrid
            container
          >
            <FormContainer
              container
              xs={11}
              sm={10}
              md={8}
              lg={6}
              xl={4}
            >

              <img
                height='70'
                src={capriLogo}
                alt=''
              />

              <FormGenerator
                isLoading={isLoading}
                formDetails={formConfiguration}
                formHandler={formHandler}
                alertShow={alertShow}
                setAlertShow={setAlertShow}
              />
            </FormContainer>
          </CustomGrid>
          {/* <FooterComponent /> */}
        </Layout>
      ) : null
}
      {
      showValidateOTP ? (
        <>
          <CustomToaster
            alertShow={alertShow}
            setAlertShow={setAlertShow}
          />
          <Layout>
            {/* <PublicRouteHeader /> */}
            <CustomGrid
              container
            >
              <FormContainer
                container
                xs={11}
                sm={10}
                md={8}
                lg={6}
                xl={4}
              >
                <img
                  height='70'
                  src={capriLogo}
                  alt=''
                />
                <div style={{ padding: '20px 30px' }}>
                  <PasswordFormControl variant='outlined'>
                    <PasswordLabelStyled htmlFor='outlined-adornment-password'>Enter OTP</PasswordLabelStyled>
                    <OutlinedInput
                      id='otp'
                      type={values.showPassword ? 'text' : 'password'}
                      endAdornment={
                            (
                              <InputAdornment position='end'>
                                <IconButton
                                  aria-label='toggle password visibility'
                                  onClick={handleClickShowPassword}
                                  onMouseDown={handleMouseDownPassword}
                                  edge='end'
                                >
                                  {values.showPassword ? icons.VisibilityOff : icons.Visibility}
                                </IconButton>
                              </InputAdornment>
                            )
                        }
                      label='Password'
                    />
                  </PasswordFormControl>
                  <small style={{ color: 'darkgrey' }}>To get otp, send a text message as “OTP” to the capri gold loan WhatsApp number.</small>
                  <div style={{
                    display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: '30px'
                  }}
                  >
                    {showBackBtn
                    && (
                    <ButtonSecondary onClick={() => { setShowValidateOTP(false); }}>
                      Back
                    </ButtonSecondary>
                    )}
                    <ButtonPrimary onClick={otpFormHandler} disabled={isButtonDisabled}>
                      Validate OTP
                    </ButtonPrimary>
                  </div>
                </div>
              </FormContainer>
            </CustomGrid>
            {/* <FooterComponent /> */}
          </Layout>
        </>
      ) : null
}
    </>
  );
};

export default Login;
