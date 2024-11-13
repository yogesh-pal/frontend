import { useMemo, useEffect, useState } from 'react';
import {
  Grid, Card, Typography, FormHelperText, DialogContentText
} from '@mui/material';
import styled from '@emotion/styled';
import TextField from '@mui/material/TextField';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useScreenSize } from '../../../../customHooks';
import { cashAndPacketNavigationDetails } from '../../helper';
import { NAVIGATION, REGEX, ROUTENAME } from '../../../../constants';
import { ToastMessage, MenuNavigation, DialogBox } from '../../../../components';
import {
  AutoCompleteStyled, BreadcrumbsWrapperContainerStyled, BreadcrumbsContainerStyled,
  CustomContainerStyled, HeaderContainer, HeadingMaster, LoadingButtonPrimary,
  TextFieldStyled, CenterContainerStyled, ButtonPrimary, ResetButton
} from '../../../../components/styledComponents';
import { Service } from '../../../../service';
import { CashAndPacketService } from '../constant';

const Li = styled.li`
    color: #502a74;
    &:hover{
      background-color: #502a741a !important;
    }
  `;

const PacketAudit = () => {
  const { branchCodes } = useSelector((state) => state.user.userDetails);
  const [branchOption, setBranchOption] = useState([]);
  const [branch, setBranch] = useState('');
  const screen = useScreenSize();
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [isLoading, setIsLoading] = useState({ loader: false, name: null });
  const today = new Date();
  const todayDate = today.toLocaleDateString();
  const [branchPacketCount, setBranchPacketCount] = useState(0);
  const [packetCount, setPacketCount] = useState(0);
  const navigate = useNavigate();
  const menuNavigations = useMemo(() => [...cashAndPacketNavigationDetails, { name: 'Packet Audit', url: NAVIGATION.PacketAudit }], [NAVIGATION]);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState({
    onSubmit: false,
    onCancel: false
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModal2Open, setisModal2Open] = useState(false);
  const {
    register, formState: { errors }, setValue, getValues, handleSubmit
  } = useForm();

  const {
    register: register2,
    formState: formState2,
    setValue: setValue2,
    getValues: getValues2,
    handleSubmit: handleSubmit2
  } = useForm();

  const fetchCashBranchDetails = async (value) => {
    try {
      setIsLoading({ loader: true, name: 'onSubmit' });
      const { data } = await CashAndPacketService.get(`${process.env.REACT_APP_CASH_SERVICE}/cashandpacketsummary/details`, value);
      setBranchPacketCount(data.data.closing_packets);
    } catch (err) {
      setAlertShow({ open: true, msg: 'Something went wrong, While fetching cash details.', alertType: 'error' });
    }
    setIsLoading({ loader: false, name: null });
  };

  const renderError = (name) => {
    if (errors?.[name]) {
      return <FormHelperText error>{errors?.[name].message}</FormHelperText>;
    }
  };

  const renderError2 = (name) => {
    if (formState2.errors?.[name]) {
      return <FormHelperText error>{formState2.errors?.[name].message}</FormHelperText>;
    }
  };

  const branchChangeHandler = (event, value) => {
    setBranch(value);
    fetchCashBranchDetails(value);
  };

  const handleCountChange = (inputCount) => {
    const count = parseInt(inputCount, 10);
    if (!Number.isNaN(count)) {
      setPacketCount(count);
    } else {
      setPacketCount(0);
    }
  };

  useEffect(() => {
    if (branchCodes.length) {
      const branches = [...branchCodes];
      setBranchOption(branches.sort());
    }
    setIsLoading({ loader: true, name: 'selectBranch' });
  }, []);

  const sendOTPToAuthEMP = async () => {
    try {
      setIsLoading({ loader: true, name: 'sendOTP' });
      const OTPRequestBody = {
        branch_code: branch,
        authorized_emp_code: getValues2('authorized_emp_code')
      };
      const { data } = await Service.post(
        `${process.env.REACT_APP_AUDIT_SERVICE}/audit/packet_otp`,
        OTPRequestBody
      );
      if (data?.success) {
        setIsModalOpen(false);
        setAlertShow({ open: true, msg: 'OTP sent successfully.', alertType: 'success' });
        setisModal2Open(true);
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong! Please try again.', alertType: 'error' });
      }
    } catch (err) {
      if (err?.response?.status === 400) {
        setAlertShow({ open: true, msg: err?.response?.data?.errors?.detail, alertType: 'error' });
      } else if (err?.response?.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong, please try again.', alertType: 'error' });
        setIsModalOpen(false);
      }
      setValue2('authorized_emp_code', null);
    } finally {
      setIsLoading({ loader: false, name: null });
    }
  };

  const createPacketAudit = async () => {
    try {
      setIsLoading({ loader: true, name: 'onCreate' });
      const packetAuditRequestBody = {
        branch_code: branch,
        packet_count: packetCount,
        branch_packet_count: branchPacketCount,
        OTP: getValues2('otp'),
        packet_difference: packetCount - branchPacketCount,
        authorized_emp_code: getValues2('authorized_emp_code'),
        auditor_remarks: getValues('auditor_remarks'),
        branch_remarks: getValues('branch_remarks')
      };

      const { data } = await Service.post(
        `${process.env.REACT_APP_AUDIT_SERVICE}/audit/packet`,
        packetAuditRequestBody
      );
      if (data?.success) {
        setIsModalOpen(false);
        setisModal2Open(false);
        setAlertShow({ open: true, msg: 'Packet Audit Created successfully.', alertType: 'success' });
        setTimeout(() => {
          navigate(ROUTENAME.cashAndPacketAudit);
        }, 1500);
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong! Please try again.', alertType: 'error' });
        setIsLoading({ loader: false, name: null });
      }
    } catch (err) {
      if (err?.response?.status === 400) {
        setAlertShow({ open: true, msg: err?.response?.data?.errors?.detail, alertType: 'error' });
      } else if (err?.response?.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
        setisModal2Open(false);
        setValue2('authorized_emp_code', null);
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong, please try again.', alertType: 'error' });
        setisModal2Open(false);
        setValue2('authorized_emp_code', null);
      }
      setValue2('otp', null);
      setIsLoading({ loader: false, name: null });
    }
  };

  const currencyDifference = () => {
    if ((packetCount - branchPacketCount) !== 0) {
      setIsModalOpen(true);
    } else {
      createPacketAudit();
    }
  };

  const handleConfirmationClose = (event, reason) => {
    if (reason && reason === 'backdropClick') {
      return;
    }
    setIsConfirmationOpen(false);
  };

  const closeModelHandler = () => {
    setIsModalOpen(false);
    setValue2('authorized_emp_code', null);
  };
  const closeModel2Handler = () => {
    setisModal2Open(false);
    setValue2('authorized_emp_code', null);
    setValue2('otp', null);
  };

  return (
    <>
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={menuNavigations} />
        </BreadcrumbsContainerStyled>
      </BreadcrumbsWrapperContainerStyled>
      <CustomContainerStyled padding='0px !important'>
        <ToastMessage
          alertShow={alertShow}
          setAlertShow={setAlertShow}
        />
        <HeaderContainer item xs={12}>
          <HeadingMaster>
            Packet Audit
          </HeadingMaster>
        </HeaderContainer>
        <form
          onSubmit={handleSubmit(currencyDifference)}
          width={['xs', 'sm'].includes(screen) ? '100%' : ''}
        >
          <Grid container padding='20px 20px' display='flex' justifyContent='space-between'>
            <Grid item xs={12} sm={5} md={3} lg={2} xl={2}>
              <AutoCompleteStyled
                disablePortal
                disableClearable
                id='combo-box-demo'
                options={branchOption}
                defaultValue={branch}
                onChange={(event, value) => branchChangeHandler(event, value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label='Branch ID*'
                  />
                )}
                renderOption={(props, option) => (
                  <Li
                    {...props}
                  >
                    {option}
                  </Li>
                )}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3} lg={2} xl={2} display='flex'>
              <TextFieldStyled
                label='Date'
                defaultValue={todayDate}
                disabled
              />
            </Grid>
          </Grid>
          <Grid container padding='0px 20px' display='flex'>
            <Grid item xs={12} sm={12} md={6} lg={6} xl={6} padding='0px 0px 20px 0px'>
              <Card style={{ boxShadow: 'rgb(183 151 193) 0px 1px 4px', padding: '0px !important' }}>
                <Typography style={{
                  background: '#502A74',
                  height: '56px',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px'
                }}
                >
                  Physical Verification Of Packets By Auditor
                </Typography>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} padding='10px 20px'>
                  <TextFieldStyled
                    type='number'
                    label='Count Of Packets*'
                    {...register('packet_count', {
                      onChange: (e) => {
                        if (e.target.value.trim().length) {
                          setValue('packet_count', e.target.value, { shouldValidate: true });
                          handleCountChange(e.target.value);
                        } else {
                          setValue('packet_count', null, { shouldValidate: true });
                        }
                      },
                      required: 'Please enter Count of Packets',
                      min: { value: 1, message: 'Count should be greater than 0' },
                      pattern: { value: REGEX.NUMBER, message: 'Please enter numeric digits only' }
                    })}
                  />
                  {renderError('packet_count')}
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} padding='10px 20px'>
                  <TextFieldStyled
                    label='Difference Packets Short/Excess'
                    value={packetCount - branchPacketCount}
                    disabled
                  />
                </Grid>
              </Card>
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={6} xl={6} padding='0px 0px 0px 20px'>
              <Card style={{ boxShadow: 'rgb(183 151 193) 0px 1px 4px', padding: '0px !important' }}>
                <Typography style={{
                  background: '#502A74',
                  height: '56px',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px'
                }}
                >
                  Packet As Per System (Real Time Number Of Packet)
                </Typography>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} padding='25px 20px 10px'>
                  <TextFieldStyled
                    label='Count of Branch Packets'
                    variant='outlined'
                    value={branchPacketCount}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} padding='10px 20px'>
                  <TextFieldStyled
                    label='Enter Branch Remarks*'
                    multiline
                    maxRows={3}
                    {...register('branch_remarks', {
                      onChange: (e) => {
                        if (e.target.value.trim().length) {
                          setValue('branch_remarks', e.target.value, { shouldValidate: true });
                        } else {
                          setValue('branch_remarks', null, { shouldValidate: true });
                        }
                      },
                      required: 'Please enter branch remarks',
                      maxLength: { value: 200, message: 'Maximum 200 characters allowed' }
                    })}
                  />
                  {renderError('branch_remarks')}
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} padding='10px 20px 20px'>
                  <TextFieldStyled
                    label='Enter Auditor Remarks*'
                    multiline
                    maxRows={3}
                    {...register('auditor_remarks', {
                      onChange: (e) => {
                        if (e.target.value.trim().length) {
                          setValue('auditor_remarks', e.target.value, { shouldValidate: true });
                        } else {
                          setValue('auditor_remarks', null, { shouldValidate: true });
                        }
                      },
                      required: 'Please enter auditor remarks',
                      maxLength: { value: 200, message: 'Maximum 200 characters allowed' }
                    })}
                  />
                  {renderError('auditor_remarks')}
                </Grid>
              </Card>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} padding='10px 0px' display='flex' alignItems='center' justifyContent='center'>
            <LoadingButtonPrimary
              disabled={(isLoading.loader && isLoading.name === 'onSubmit') || (isLoading.loader && isLoading.name === 'selectBranch')}
              type='submit'
              loading={(isLoading.loader && isLoading.name === 'sendOTP') || (isLoading.loader && isLoading.name === 'onCreate')}
            >
              Submit
            </LoadingButtonPrimary>
            <LoadingButtonPrimary
              onClick={() => setIsConfirmationOpen({
                onSubmit: false,
                onCancel: true
              })}
            >
              Cancel
            </LoadingButtonPrimary>
          </Grid>
        </form>
      </CustomContainerStyled>

      <DialogBox
        isOpen={isModalOpen || isModal2Open}
        handleClose={isModalOpen ? closeModelHandler : closeModel2Handler}
        title={isModalOpen ? `Difference of ${packetCount - branchPacketCount} available` : 'Packet Audit Verification'}
        padding='10px'
        width='600px'
      >
        <form onSubmit={
          isModalOpen
            ? handleSubmit2(sendOTPToAuthEMP)
            : handleSubmit2(createPacketAudit)
          }
        >
          { isModalOpen
            ? (
              <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px'>
                <TextFieldStyled
                  label='Enter Authorization EMP Code*'
                  multiline
                  {...register2('authorized_emp_code', {
                    onChange: (e) => {
                      if (e.target.value.trim().length) {
                        setValue2('authorized_emp_code', e.target.value.toUpperCase(), { shouldValidate: true });
                      } else {
                        setValue2('authorized_emp_code', null, { shouldValidate: true });
                      }
                    },
                    required: 'Please Enter Authorization EMP Code',
                    maxLength: { value: 20, message: 'Maximum 20 characters allowed' },
                  })}
                />
                {renderError2('authorized_emp_code')}
              </Grid>
            ) : null}
          { isModal2Open
            ? (
              <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px'>
                <TextFieldStyled
                  label='Enter OTP'
                  multiline
                  maxRows={3}
                  {...register2('otp', {
                    onChange: (e) => {
                      if (e.target.value.trim().length) {
                        setValue2('otp', e.target.value, { shouldValidate: true });
                      } else {
                        setValue2('otp', null, { shouldValidate: true });
                      }
                    },
                    required: 'Please OTP',
                    maxLength: { value: 4, message: 'Maximum 4 digits allowed' },
                    pattern: { value: REGEX.NUMBER, message: 'Please enter numeric digits only' }
                  })}
                />
                {renderError2('otp')}
              </Grid>
            ) : null}
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} display='flex' alignItems='center' justifyContent='center'>
            <LoadingButtonPrimary
              disabled={(isLoading.loader && isLoading.name === 'onSubmit') || (isLoading.loader && isLoading.name === 'selectBranch')}
              type='submit'
              loading={(isLoading.loader && isLoading.name === 'sendOTP') || (isLoading.loader && isLoading.name === 'onCreate')}
            >
              Submit
            </LoadingButtonPrimary>
          </Grid>
        </form>
      </DialogBox>
      <DialogBox
        isOpen={isConfirmationOpen.onCancel}
        title=''
        handleClose={handleConfirmationClose}
        width='auto'
        padding='40px'
      >
        <DialogContentText>
          Are you sure you want to cancel the Packet Audit informations?
        </DialogContentText>
        <CenterContainerStyled flexDirection='row' padding='20px 0 0 0'>
          <ResetButton onClick={() => navigate(ROUTENAME.cashAndPacketAudit)}>Yes</ResetButton>
          <ButtonPrimary onClick={handleConfirmationClose}>No</ButtonPrimary>
        </CenterContainerStyled>
      </DialogBox>
    </>
  );
};
export default PacketAudit;
