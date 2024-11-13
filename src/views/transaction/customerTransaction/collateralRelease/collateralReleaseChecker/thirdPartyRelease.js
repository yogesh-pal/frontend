/* eslint-disable max-len */
import moment from 'moment';
import {
  Grid, DialogContentText, FormHelperText,
  Typography
} from '@mui/material';
import styled from '@emotion/styled';
import List from '@mui/material/List';
import { useForm } from 'react-hook-form';
import ListItem from '@mui/material/ListItem';
import React, { useState, useRef } from 'react';
import {
  CustomText1, CustomText2, CustomDiv, HeadingMaster2
} from '../../../helper';
import { Service } from '../../../../../service';
import { useScreenSize } from '../../../../../customHooks';
import { DialogBox, ToastMessage } from '../../../../../components';
import {
  LoadingButtonPrimary, TextFieldStyled, CenterContainerStyled, ButtonPrimary, FullSizeButton
} from '../../../../../components/styledComponents';

const ListStyled = styled(List)(({ theme }) => ({
  marginTop: '10px',
  paddingTop: '0px',
  paddingBottom: '0px',
  backgroundColor: theme.input.secondary,
  borderRadius: '5px',
  width: '100%'
}));

const ListItemStyled = styled(ListItem)(() => ({
  paddingTop: '0px',
  paddingBottom: '0px',
  marginTop: '4px',
  marginBottom: '4px',
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between'
}));
const Text = styled(Typography)(() => ({
  padding: '5px 10px',
  fontSize: '17px',
  color: '#502A74',
  fontWeight: 400,
}));
const Atag = styled.a`
  padding: 5px 0px;
  text-decoration: underline;
  color: #502A74!important;
`;

const ThirdPartyRelease = ({ rowData, closeOnSuccess }) => {
  const [OTP, setOTP] = useState(null);
  const [timer, setTimer] = useState(0);
  const [OTPFieldError, setOTPFieldError] = useState(null);
  const [activeOtp, setActiveOtp] = useState(null);
  const [isOTPVerified, setIsOTPVerified] = useState(false);
  const [intervalAddress, setIntervalAddress] = useState(null);
  const [loading, setLoading] = useState({ loader: false, name: null });
  const [isOTPSendSuccessfully, setIsOTPSendSuccessfully] = useState(false);
  const [alertThirdPartyShow, setAlertThirdPartyShow] = useState({ open: false, msg: '' });
  const [isConfirmationOpen, setIsConfirmationOpen] = useState({
    onSubmit: false, onSucces: false
  });
  const { lan } = rowData;
  const loaderRef = useRef();
  const { handleSubmit } = useForm();
  const screen = useScreenSize();
  const componentRef = useRef({ timer: 1 });

  const handleConfirmationClose = (event, reason) => {
    if (reason && reason === 'backdropClick') {
      return;
    }
    setIsConfirmationOpen(false);
  };
  const getOtpMode = (type) => {
    if (type === 'onOTPSendViaWhatsapp') {
      return 'WHATSAPP';
    }
    return 'SMS';
  };

  const handleSendOTP = async () => {
    const activeElemen = document.activeElement;
    const activeButton = activeElemen.getAttribute('name');
    try {
      if (timer) {
        return;
      }
      setLoading({ loader: true, name: activeButton });
      setActiveOtp(activeButton);
      const otpMode = getOtpMode(activeButton);

      const { data } = await Service.post(`${process.env.REACT_APP_COLLATERAL_SERVICE}/otp/send`, { application_no: lan, otp_to: 'THIRDPERSON', otp_type: otpMode });

      if (data.status === 1) {
        setTimer(1);
        const interval = setInterval(() => {
          const ref = componentRef.current;
          ref.timer += 1;
          setTimer((pre) => (pre + 1));
          if (ref.timer > 179) {
            clearInterval(interval);
            setActiveOtp(null);
            componentRef.current.timer = 1;
            setTimer(0);
            setLoading((pre) => ({ ...pre, isEnableWhatsapp: true, loader: false }));
          }
        }, 1000);
        setIntervalAddress(interval);
        setIsOTPSendSuccessfully(true);
      } else {
        setAlertThirdPartyShow({ open: true, msg: 'Invalid mobile number.', alertType: 'error' });
      }
    } catch (err) {
      setActiveOtp(null);
      if (err?.response?.data?.errors?.lan_details) {
        setAlertThirdPartyShow({ open: true, msg: err.response.data.errors.lan_details, alertType: 'error' });
      } if (err?.response?.data?.application_no) {
        setAlertThirdPartyShow({ open: true, msg: err.response.data.application_no, alertType: 'error' });
      } else {
        setAlertThirdPartyShow({ open: true, msg: 'Something went wrong.', alertType: 'error' });
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
        setAlertThirdPartyShow({ open: true, msg: 'OTP entered is validated successfully.', alertType: 'success' });
        setIsOTPVerified(true);
      } else {
        setAlertThirdPartyShow({ open: true, msg: 'Entered OTP is invalid, Please try again!', alertType: 'error' });
      }
    } catch (err) {
      if (err?.response?.data?.is_validated === 'False') {
        setAlertThirdPartyShow({ open: true, msg: 'Entered OTP is invalid, Please try again!', alertType: 'error' });
      } else if (err?.response?.data?.application_no) {
        setAlertThirdPartyShow({ open: true, msg: err.response.data.application_no, alertType: 'error' });
      } else if (err?.response?.data?.otp) {
        setAlertThirdPartyShow({ open: true, msg: err.response.data.otp, alertType: 'error' });
      } else {
        setAlertThirdPartyShow({ open: true, msg: 'Something went wrong.', alertType: 'error' });
      }
    } finally {
      setLoading({ loader: false, name: null });
    }
  };

  if (timer >= 180) {
    clearInterval(intervalAddress);
    setActiveOtp(null);
    setTimer(0);
  }
  const handleRelease = async () => {
    try {
      loaderRef.current = true;
      setLoading({ loader: true, name: 'onRelease' });
      const url = `${process.env.REACT_APP_COLLATERAL_SERVICE}/third-party/release`;
      const requestBody = {
        loan_account_no: rowData.loanAccountNo
      };
      const { data } = await Service.post(url, requestBody);
      if (data?.success && data.success) {
        setIsConfirmationOpen({ onSubmit: false, onSucces: true });
      } else {
        setAlertThirdPartyShow({ open: true, msg: data?.message?.application_details?.[0], alertType: 'error' });
      }
    } catch (err) {
      if (err?.response?.status === 403) {
        setAlertThirdPartyShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      } else if (err?.response?.data?.errors && err.response.data.errors.length) {
        setAlertThirdPartyShow({ open: true, msg: err.response.data.errors[0], alertType: 'error' });
      } else {
        setAlertThirdPartyShow({ open: true, msg: 'Something went wrong, Please try again.', alertType: 'error' });
      }
    } finally {
      loaderRef.current = false;
      setLoading({ loader: false, name: null });
    }
  };
  return (
    <div>
      <ToastMessage
        alertShow={alertThirdPartyShow}
        setAlertShow={setAlertThirdPartyShow}
      />
      <Grid container display='flex' padding='10px 0px'>
        <CustomDiv>
          <CustomText1>Release to Third Party</CustomText1>
        </CustomDiv>
        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
          <TextFieldStyled
            id={rowData?.third_party_relationship === 'OTHERS' ? 'others' : 'thrid_party'}
            label='Third Party Relation'
            defaultValue={rowData?.third_party_relationship === 'OTHERS' ? rowData?.third_party_other_relation ?? 'NA' : rowData?.third_party_relationship ?? 'NA'}
            disabled
          />
        </Grid>
        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
          <TextFieldStyled
            id='applicationNo'
            label='LAN'
            defaultValue={rowData?.lan ?? 'NA'}
            disabled
          />
        </Grid>
      </Grid>
      <Grid container display='flex' padding='10px 0px'>
        <CustomDiv>
          <CustomText1>Third Party Details</CustomText1>
        </CustomDiv>

        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
          <TextFieldStyled
            id='name'
            label='Name'
            defaultValue={rowData?.third_party_name ?? 'NA'}
            disabled
          />
        </Grid>
        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
          <TextFieldStyled
            id='dob'
            label='DOB'
            defaultValue={moment(rowData?.third_party_dob, 'DD/MM/YYYY').format('DD/MM/YYYY')}
            disabled
          />
        </Grid>
        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
          <TextFieldStyled
            id='mobile'
            label='Mobile'
            defaultValue={rowData?.third_party_mobile ?? 'NA'}
            disabled
          />
        </Grid>
        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
          <TextFieldStyled
            id='id_proof'
            label='ID Proof'
            defaultValue={rowData?.third_party_id_type ?? 'NA'}
            disabled
          />
        </Grid>
        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
          <TextFieldStyled
            id='id_number'
            label='ID Number'
            defaultValue={rowData?.third_party_id_number ?? 'NA'}
            disabled
          />
        </Grid>
        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
          <TextFieldStyled
            id='osv'
            label='OSV Done'
            defaultValue={rowData?.nominee_osv_done ? 'Yes' : 'No'}
            disabled
          />
        </Grid>
        <Grid
          item
          display='flex'
          flexDirection='column'
          width={['xs', 'sm'].includes(screen) ? '100%' : '50%'}
          alignItems='start'
          padding='10px 20px 10px 20px'
        >
          <CustomText2>Third Party Live Photo</CustomText2>
          {rowData?.third_party_live_pic ? (
            <ListStyled dense={false}>
              <ListItemStyled>
                <Text>
                  {`Document
                  ${1}
                  `}
                </Text>
                <Atag href={`/file-preview?path=${rowData?.third_party_live_pic}&isPreSignedUrlRequired=true`} target='_blank'>
                  View
                </Atag>
              </ListItemStyled>
            </ListStyled>
          ) : 'Not Available'}

        </Grid>
        <Grid
          item
          display='flex'
          flexDirection='column'
          width={['xs', 'sm'].includes(screen) ? '100%' : '50%'}
          alignItems='start'
          padding='10px 20px 10px 20px'
        >
          <CustomText2>Multiple Document Live Photo</CustomText2>
          {rowData?.third_party_doc_live_pic?.split(',').length > 0 ? (
            <ListStyled dense={false}>
              {rowData?.third_party_doc_live_pic?.split(',').map((item, idx) => (
                <ListItemStyled>
                  <Text>
                    {`Document
                  ${idx + 1}
                  `}
                  </Text>
                  <Atag href={`/file-preview?path=${item}&isPreSignedUrlRequired=true`} target='_blank'>
                    View
                  </Atag>
                </ListItemStyled>
              ))}
            </ListStyled>
          ) : 'No Document Available'}

        </Grid>
        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
          <TextFieldStyled
            id='remarks'
            label='Remarks'
            defaultValue={rowData?.maker_remarks ?? 'NA'}
            disabled
          />
        </Grid>
        <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
          <TextFieldStyled
            id='approver_remarks'
            label='Approver Remarks'
            defaultValue={rowData?.checker_remarks ?? 'NA'}
            disabled
          />
        </Grid>
        <Grid container display='flex' justifyContent='center' padding='10px'>
          <Grid item xs={12} sm={12} md={10} lg={8} xl={8}>
            <form onSubmit={handleSubmit(handleSendOTP)}>
              <Grid container display='flex' justifyContent='flex-end' padding='30px 0px 0px 0px'>
                <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
                  <HeadingMaster2>Mobile No</HeadingMaster2>
                </Grid>
                <Grid item xs={12} sm={6} md={6} lg={6} xl={6} padding='10px 20px'>
                  <TextFieldStyled
                    label='Third Party Mobile'
                    defaultValue={rowData?.third_party_mobile ?? 'NA'}
                    disabled
                  />
                </Grid>
              </Grid>
              { !isOTPVerified
                ? (
                  <>
                    <Grid container padding='10px 0px' justifyContent='center'>
                      <Grid item xs={6} display='flex' justifyContent='center'>
                        {(activeOtp === null || activeOtp === 'onOTPSendViaSMS') && (
                        <FullSizeButton
                          type='submit'
                          name='onOTPSendViaSMS'
                          loading={loading.loader && loading.name === 'onOTPSendViaSMS'}
                          disabled={loading.loader && !timer}
                          loadingPosition='start'
                          margin='0px'
                        >
                          { timer ? `Resend OTP in ${180 - timer} sec` : 'Send OTP'}
                        </FullSizeButton>
                        )}
                        {(activeOtp === null || activeOtp === 'onOTPSendViaWhatsapp') && (
                        <FullSizeButton
                          type='submit'
                          name='onOTPSendViaWhatsapp'
                          disabled={(!loading?.isEnableWhatsapp && !timer) || (loading.loader && !timer)}
                          loading={loading.loader && loading.name === 'onOTPSendViaWhatsapp' && !timer}
                          loadingPosition='start'
                          margin='0px'
                        >
                          { timer ? `Resend OTP in ${180 - timer} sec` : 'OTP Via Whatsapp'}
                        </FullSizeButton>
                        )}
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
                  <Grid container padding='0px 0px' justifyContent='center'>

                    <LoadingButtonPrimary onClick={() => setIsConfirmationOpen({ onSubmit: true, onSucces: false })} loading={loading.loader && loading.name === 'onRelease'} type='submit' minWidth='110px'>
                      Release
                    </LoadingButtonPrimary>
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
                isConfirmationOpen.onSubmit ? `Are you sure you want to release collateral against LAN ${rowData.loanAccountNo}.`
                  : `The Collateral against the LAN ${rowData.loanAccountNo} has been released successfully and has been marked closed.`
            }
          </DialogContentText>
          <CenterContainerStyled flexDirection='row' padding='20px 0 0 0'>
            {
            isConfirmationOpen.onSubmit ? (
              <>
                <ButtonPrimary
                  onClick={handleRelease}
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
      </Grid>
    </div>
  );
};
export default React.memo(ThirdPartyRelease, (prevProps, nextProps) => {
  if (prevProps.rowData !== nextProps.rowData) {
    return false;
  }
  return true;
});
