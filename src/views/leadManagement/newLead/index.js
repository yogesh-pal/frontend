/* eslint-disable max-len */
/* eslint-disable object-shorthand */
/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import styled from '@emotion/styled';
import {
  Dialog, DialogActions, Typography, useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import {
  BreadcrumbsContainerStyled,
  BreadcrumbsWrapperContainerStyled,
  ButtonPrimary, CustomContainerStyled, HeaderContainer, HeadingMaster
} from '../../../components/styledComponents';
import { MenuNavigation, ToastMessage } from '../../../components';
import { navigationDetails } from './navigationDetail';
import FormGenerator from '../../../components/formGenerator';
import {
  createLeadJson,
  detailsJson, productConfigurationJson, verifyMobileJson, verifyOtpJson
} from './leadJson';
import FillOtp from './fillOtp';
import { Service } from '../../../service';
import { ROUTENAME, SERVICEURL } from '../../../constants';
import PageLoader from '../../../components/PageLoader';

const CustomDialog = styled(Dialog)(() => ({
  '.MuiDialog-paper': {
    minWidth: '200px',
    width: '400px',
    borderRadius: '10px'
  },
  '.MuiDialogContentText-root': {
    display: 'flex',
    justifyContent: 'center'
  }
}));

const TypographyStyled = styled(Typography)(() => ({
  textAlign: 'center',
  marginTop: '10px'
}));

const TypographyLeadStyled = styled(Typography)(() => ({
  textAlign: 'center',
  color: '#502a74'
}));

const NewLead = () => {
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [formConfiguration, setFormConfiguration] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [pType, setPtype] = useState(null);
  const [mobileNo, setMobileNo] = useState(null);
  const [enterdOtp, setEnteredOtp] = useState('');
  const [leadId, setLeadId] = useState('');
  const [branches, setBranches] = useState([]);
  const [resendTimer, setResendTimer] = useState(120);
  const [isLoading, setIsLoading] = useState(false);
  const [isDisable, setIsDisable] = useState(false);
  const { selectedBranch } = useSelector((state) => state.user.userDetails);

  const navigate = useNavigate();

  const theme1 = useTheme();
  const fullScreen = useMediaQuery(theme1.breakpoints.down('md'));

  const proceedSendOtpHandler = async () => {
    try {
      if (mobileNo?.length !== 10) {
        setAlertShow({
          open: true,
          msg: 'Please enter 10 digit mobile number',
          alertType: 'error'
        });
        return;
      }
      if (!pType) {
        setAlertShow({
          open: true,
          msg: 'Please Select Product Type',
          alertType: 'error'
        });
        return;
      }
      setIsLoading(true);
      const reqBody = {
        productType: pType,
        phoneNumber: mobileNo
      };
      const { data } = await Service.post(SERVICEURL.CIRCULAR.LEAD_SEND_OTP, reqBody);
      if (data?.status === 200 && pageIndex === 0) {
        setAlertShow({
          open: true,
          msg: data?.message || 'OTP sent successfully',
          alertType: 'success'
        });
        setIsDisable(true);
        setPageIndex((prev) => prev + 1);
      } else if (data?.status === 200 && pageIndex !== 0) {
        setAlertShow({
          open: true,
          msg: data?.message || 'OTP sent successfully',
          alertType: 'success'
        });
      } else {
        setAlertShow({
          open: true,
          msg: data?.message || 'Invalid OTP',
          alertType: 'error'
        });
      }
    } catch (e) {
      setAlertShow({
        open: true,
        msg: 'Something went wrong',
        alertType: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const proceedResendSendOtpHandler = async () => {
    setResendTimer(120);
    proceedSendOtpHandler();
  };

  const otpVerificationHandler = async () => {
    try {
      if (enterdOtp?.length !== 4) {
        setAlertShow({
          open: true,
          msg: 'Please enter 4 digit OTP',
          alertType: 'error'
        });
        return;
      }
      setIsLoading(true);
      const reqBody = {
        otp: enterdOtp,
        phoneNumber: mobileNo
      };
      const { data } = await Service.post(SERVICEURL.CIRCULAR.LEAD_VERIFY_OTP, reqBody);
      if (data?.status !== 200) {
        setAlertShow({
          open: true,
          msg: data?.message || 'Invalid OTP',
          alertType: 'error'
        });
      } else {
        setAlertShow({
          open: true,
          msg: data?.message || 'Otp Verified',
          alertType: 'success'
        });
        setPageIndex((prev) => prev + 1);
      }
    } catch (e) {
      console.log(e);
      setAlertShow({
        open: true,
        msg: e?.response?.data?.message || 'Something went wrong',
        alertType: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const productTypeHandler = (values) => {
    setPtype(values?.product_type);
  };

  const panChangeHandler = async (values, callback, index, setValue) => {
    if (values?.pan?.length === 10) {
      try {
        setIsLoading(true);
        const pancardObj = {
          type: 'pan',
          number: values?.pan
        };
        const { data } = await Service.post(`${process.env.REACT_APP_VALIDATE_PAN_DOCUMENT}`, pancardObj);
        if (data?.data?.status.toUpperCase() === 'VALID') {
          setAlertShow({
            open: true,
            msg: 'PAN Verified',
            alertType: 'success'
          });
          setValue('full_name', data?.data?.full_name, { shouldValidate: true });
        } else {
          setAlertShow({
            open: true,
            msg: 'Invalid pancard number.',
            alertType: 'error'
          });
          setValue('full_name', '', { shouldValidate: true });
        }
      } catch (e) {
        console.log(e);
        setAlertShow({
          open: true,
          msg: e?.response?.data?.message || 'Invalid PAN',
          alertType: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };
  const pinChangeHandler = async (values, callback, index, setValue) => {
    if (values?.pin_code?.length === 6) {
      try {
        setIsLoading(true);
        const
          { data } = await Service.get(`${SERVICEURL.CIRCULAR.LEAD_BRANCHES}/${values?.pin_code}/${pType}`);
        if (data?.status === 200) {
          setBranches(data?.result?.branchNames);
          setValue('city', data?.result?.city, { shouldValidate: true });
          setValue('state', data?.result?.state, { shouldValidate: true });
          setAlertShow({
            open: true,
            msg: data?.message || 'Data fetched successfully',
            alertType: 'success'
          });
        } else {
          setBranches([]);
          setValue('city', '', { shouldValidate: true });
          setValue('state', '', { shouldValidate: true });
          setAlertShow({
            open: true,
            msg: data?.message || 'Unable to fetch data at the moment',
            alertType: 'error'
          });
        }
      } catch (e) {
        console.log(e);
        setAlertShow({
          open: true,
          msg: e?.response?.data?.message || 'Unable to fetch data at the moment',
          alertType: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const pincodeVerificationHandler = async (values, callback, bodyDetails) => {
    try {
      const pincodeObj = {};
      bodyDetails.forEach((item) => {
        pincodeObj.pincode = values[item];
      });
      if (pincodeObj?.pincode.length === 6) {
        setIsLoading(true);
        const { data } = await Service.post(process.env.REACT_APP_PINCODE, pincodeObj);
        if (data?.data) {
          callback(data.data);
        } else {
          setAlertShow({
            open: true,
            msg: 'Invalid pincode.',
            alertType: 'error'
          });
        }
        setIsLoading(false);
      }
    } catch (e) {
      setIsLoading(false);
      console.log(e);
      setAlertShow({
        open: true,
        msg: 'Pincode API failed. Try again.',
        alertType: 'error'
      });
      return { success: false };
    }
  };

  const branchHandler = (values, callback, index, setValue) => {
    console.log('branch is', values);
  };

  const onCancelHandler = () => {
    navigate(ROUTENAME.leadManagement);
  };

  const productConfiguration = productConfigurationJson(productTypeHandler, isDisable);
  const verifyMobileConfiguration = verifyMobileJson(proceedSendOtpHandler, isLoading);
  const verifyOtpConfiguration = verifyOtpJson(otpVerificationHandler, isLoading);
  const verifyDetails = detailsJson(
    branches,
    branchHandler,
    pinChangeHandler,
    panChangeHandler,
    mobileNo,
    onCancelHandler
  );

  const createLeadHandler = createLeadJson(
    onCancelHandler,
    pincodeVerificationHandler
  );

  const mobileNoVerification = (name, type, value) => {
    if (value?.enter_mobile?.length === 10) {
      setMobileNo(value?.enter_mobile);
    }
  };

  const otpVerification = (name, type, value) => {
    if (value?.enter_otp?.length === 4) {
      setEnteredOtp(value?.enter_otp);
    }
  };

  const leadSubmitHandler = async (values) => {
    try {
      setIsLoading(true);
      const {
        aadhar_card,
        city,
        address,
        select_branch,
        full_name,
        loan_amount,
        pan,
        pin_code,
        state,
      } = values;
      const reqBody = {
        city: city,
        address: address,
        branchName: select_branch,
        fullName: full_name,
        loanAmount: loan_amount,
        mobileNumber: mobileNo,
        panNumber: pan,
        pinCode: pin_code,
        productType: pType,
        state: state,
        aadharNumber: aadhar_card.slice(0, -4).replace(/\d/g, 'X') + aadhar_card.slice(-4)
      };
      const { data } = await Service.post(SERVICEURL.CIRCULAR.LEAD_CREATE_LEAD, reqBody);
      if (data?.status === 400) {
        setAlertShow({
          open: true,
          msg: data?.message || 'Lead is not created at the moment. Please try again later',
          alertType: 'error'
        });
      } else {
        setLeadId(data?.result?.leadId);
        setOpen(true);
      }
    } catch (e) {
      console.log(e);
      setAlertShow({
        open: true,
        msg: e?.response?.data?.message || 'Something went wrong',
        alertType: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createLeadApiHanlder = async (reqBody) => {
    try {
      const { data } = await Service.post(SERVICEURL.CIRCULAR.LEAD_CREATE_LEAD, reqBody);
      if (data?.status === 400) {
        setAlertShow({
          open: true,
          msg: data?.message || 'Lead is not created at the moment. Please try again later',
          alertType: 'error'
        });
      } else {
        setLeadId(data?.result?.leadId);
        setOpen(true);
      }
    } catch (e) {
      console.log(e);
      setAlertShow({
        open: true,
        msg: e?.response?.data?.message || 'Something went wrong',
        alertType: 'error'
      });
    }
  };

  const createLeadSubmitHandler = async (formValues) => {
    const {
      customer_name,
      mobile_number,
      gold_loan_amount,
      city,
      pincode,
      state
    } = formValues;
    const reqBodyLeadCreate = {
      fullName: customer_name,
      mobileNumber: mobile_number,
      loanAmount: gold_loan_amount,
      city: city,
      productType: 'GOLD_LOAN',
      pinCode: pincode,
      state: state,
      appointmentDate: moment().format('YYYY-MM-DDTHH:mm:ss')
    };
    try {
      setIsLoading(true);
      const res = await Service.get(`${process.env.REACT_APP_USER_VIEW}?primary_mobile_number=${mobile_number}&branch_code=${selectedBranch}&fc=1&token=1&is_lead=1`);
      if (res?.data?.data?.loan_summary?.active_loan > 0) {
        setAlertShow({
          open: true,
          msg: 'A loan has already been disbursed for the provided mobile number. Kindly use a different number.',
          alertType: 'error'
        });
      } else {
        reqBodyLeadCreate.dt = res?.data?.data?.dt;
        await createLeadApiHanlder(reqBodyLeadCreate);
      }
    } catch (e) {
      console.log(e);
      reqBodyLeadCreate.dt = e?.response?.data?.errors?.dt;
      await createLeadApiHanlder(reqBodyLeadCreate);
    } finally {
      setIsLoading(false);
    }
  };

  const renderVerificationForm = () => {
    switch (pageIndex) {
      case 0:
        return (
          <FormGenerator
            formDetails={verifyMobileConfiguration}
            setFormDetails={setFormConfiguration}
            changeEvent={mobileNoVerification}
            alertShow={alertShow}
            setAlertShow={setAlertShow}
          />
        );
      case 1:
        return (
          <FillOtp
            verifyOtpConfiguration={verifyOtpConfiguration}
            setFormConfiguration={setFormConfiguration}
            otpVerification={otpVerification}
            alertShow={alertShow}
            setAlertShow={setAlertShow}
            proceedResendSendOtpHandler={proceedResendSendOtpHandler}
            resendTimer={resendTimer}
            setResendTimer={setResendTimer}
          />
        );
      case 2:
        return (
          <FormGenerator
            isLoading={isLoading}
            formDetails={verifyDetails}
            setFormDetails={setFormConfiguration}
            formHandler={leadSubmitHandler}
            alertShow={alertShow}
            setAlertShow={setAlertShow}
          />
        );
      default:
        return (
          <FormGenerator
            formDetails={verifyMobileConfiguration}
            setFormDetails={setFormConfiguration}
            formHandler={leadSubmitHandler}
            alertShow={alertShow}
            setAlertShow={setAlertShow}
          />
        );
    }
  };

  const redirectDashboard = () => {
    navigate(ROUTENAME.leadManagement);
    setOpen(false);
  };

  return (
    <>
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={navigationDetails} />
        </BreadcrumbsContainerStyled>
      </BreadcrumbsWrapperContainerStyled>
      <CustomContainerStyled padding='10px !important'>
        <ToastMessage
          alertShow={alertShow}
          setAlertShow={setAlertShow}
        />
        <HeaderContainer item xs={12}>
          <HeadingMaster>
            New Lead
          </HeadingMaster>
        </HeaderContainer>
        <FormGenerator
          formDetails={productConfiguration}
          setFormDetails={setFormConfiguration}
          formHandler={leadSubmitHandler}
          alertShow={alertShow}
          setAlertShow={setAlertShow}
        />
        {isLoading ? <PageLoader /> : null}
        {pType === 'GOLD_LOAN' && (
        <FormGenerator
          formDetails={createLeadHandler}
          setFormDetails={setFormConfiguration}
          formHandler={createLeadSubmitHandler}
          alertShow={alertShow}
          setAlertShow={setAlertShow}
        />
        ) }

        {pType !== 'GOLD_LOAN' && renderVerificationForm()}
        <CustomDialog
          fullScreen={fullScreen}
          open={open}
          disableEscapeKeyDown
          aria-labelledby='responsive-dialog-title'
        >
          <TypographyStyled>
            Your Lead is Successfully Created
          </TypographyStyled>
          <TypographyLeadStyled>
            {`Lead ID : ${leadId}`}
          </TypographyLeadStyled>
          <DialogActions sx={{ alignSelf: 'center' }}>
            <ButtonPrimary onClick={() => redirectDashboard()}>OK</ButtonPrimary>
          </DialogActions>
        </CustomDialog>
      </CustomContainerStyled>
    </>
  );
};

export default NewLead;
