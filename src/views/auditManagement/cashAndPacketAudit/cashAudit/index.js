import { useEffect, useState, useMemo } from 'react';
import {
  Grid, TableBody, TableHead, TableRow, TableCell, FormHelperText,
  Card, Typography, DialogContentText
} from '@mui/material';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import TextField from '@mui/material/TextField';
import {
  AutoCompleteStyled, BreadcrumbsWrapperContainerStyled, BreadcrumbsContainerStyled,
  CustomContainerStyled, HeaderContainer, HeadingMaster, LoadingButtonPrimary, TextFieldStyled,
  CenterContainerStyled, ButtonPrimary, ResetButton
} from '../../../../components/styledComponents';
import { useScreenSize } from '../../../../customHooks';
import { NAVIGATION, REGEX, ROUTENAME } from '../../../../constants';
import { cashAndPacketNavigationDetails } from '../../helper';
import { ToastMessage, MenuNavigation, DialogBox } from '../../../../components';
import { CustomTableCell, CustomTable2 } from '../../../transaction/helper';
import { Service } from '../../../../service';
import { CashAndPacketService } from '../constant';

const Li = styled.li`
    color: #502a74;
    &:hover{
      background-color: #502a741a !important;
    }
  `;

const TableWrapper = styled('div')(() => ({
  overflow: 'auto',
  width: '100%'
}));

const StyledTableRow = styled(TableRow)(() => ({
  backgroundColor: '#f5f5f5 !important',
  color: 'black'
}));

const StyledTableCell = styled(TableCell)(() => ({
  color: '#502A74 !important',
  fontSize: '16px',
  fontWeight: 700,
}));

const CashAudit = () => {
  const { branchCodes } = useSelector((state) => state.user.userDetails);
  const [branchOption, setBranchOption] = useState([]);
  const [branch, setBranch] = useState('');
  const [isLoading, setIsLoading] = useState({ loader: false, name: null });
  const menuNavigations = useMemo(() => [...cashAndPacketNavigationDetails, { name: 'Cash Audit', url: NAVIGATION.CashAudit }], [NAVIGATION]);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const today = new Date();
  const todayDate = today.toLocaleDateString();
  const [isConfirmationOpen, setIsConfirmationOpen] = useState({
    onSubmit: false,
    onCancel: false
  });
  const [branchBalance, setBranceBalance] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModal2Open, setisModal2Open] = useState(false);
  const screen = useScreenSize();
  const [grandTotal, setGrandTotal] = useState(0);
  const navigate = useNavigate();

  const [currencyMap, setCurrencyMap] = useState([
    {
      type: 'note', currency: '500', count: null, totalValue: 0
    },
    {
      type: 'note', currency: '200', count: null, totalValue: 0
    },
    {
      type: 'note', currency: '100', count: null, totalValue: 0
    },
    {
      type: 'note', currency: '50', count: null, totalValue: 0
    },
    {
      type: 'note', currency: '20', count: null, totalValue: 0
    },
    {
      type: 'note', currency: '10', count: null, totalValue: 0
    },
    {
      type: 'coin', currency: '20', count: null, totalValue: 0
    },
    {
      type: 'coin', currency: '10', count: null, totalValue: 0
    },
    {
      type: 'coin', currency: '5', count: null, totalValue: 0
    },
    {
      type: 'coin', currency: '2', count: null, totalValue: 0
    },
    {
      type: 'coin', currency: '1', count: null, totalValue: 0
    }
  ]);

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
      const { data } = await CashAndPacketService.get(`${process.env.REACT_APP_CASH_SERVICE}/cashandpacketsummary/cashpos`, value);
      setBranceBalance(data.data.closing_balance);
    } catch (err) {
      setAlertShow({ open: true, msg: 'Something went wrong, While fetching cash details.', alertType: 'error' });
    }
    setIsLoading({ loader: false, name: null });
  };

  const branchChangeHandler = (event, value) => {
    setBranch(value);
    fetchCashBranchDetails(value);
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

  useEffect(() => {
    if (branchCodes.length) {
      const branches = [...branchCodes];
      setBranchOption(branches.sort());
    }
    setIsLoading({ loader: true, name: 'selectBranch' });
  }, []);

  const handleCountChange = (index, inputCount) => {
    const count = parseInt(inputCount, 10);
    const updatedCurrencyMap = [...currencyMap];
    if (!Number.isNaN(count)) {
      updatedCurrencyMap[index].count = count;
      const currencyValue = parseInt(updatedCurrencyMap[index].currency, 10);
      updatedCurrencyMap[index].totalValue = count * currencyValue;
    } else {
      updatedCurrencyMap[index].count = null;
      updatedCurrencyMap[index].totalValue = 0;
    }
    setCurrencyMap(updatedCurrencyMap);
    setGrandTotal(currencyMap.reduce((acc, currentValue) => acc + currentValue.totalValue, 0));
  };

  const sendOTPToAuthEMP = async () => {
    try {
      setIsLoading({ loader: true, name: 'sendOTP' });
      const OTPRequestBody = {
        authorized_emp_code: getValues2('authorized_emp_code'),
        branch_code: branch
      };
      const { data } = await Service.post(
        `${process.env.REACT_APP_AUDIT_SERVICE}/audit/cash_otp`,
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
        setIsModalOpen(false);
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong, please try again.', alertType: 'error' });
        setIsModalOpen(false);
      }
      setValue2('authorized_emp_code', null);
    } finally {
      setIsLoading({ loader: false, name: null });
    }
  };

  const createCashAudit = async () => {
    try {
      setIsLoading({ loader: true, name: 'onCreate' });
      const cashAuditrequestBody = {
        branch_code: branch,
        currency_count: currencyMap,
        grand_total: grandTotal,
        branch_balance: branchBalance,
        OTP: getValues2('otp'),
        cash_difference: grandTotal - branchBalance,
        authorized_emp_code: getValues2('authorized_emp_code'),
        auditor_remarks: getValues('auditor_remarks'),
        branch_remarks: getValues('branch_remarks')
      };
      const { data } = await Service.post(
        `${process.env.REACT_APP_AUDIT_SERVICE}/audit/cash`,
        cashAuditrequestBody
      );
      if (data?.success) {
        setIsModalOpen(false);
        setisModal2Open(false);
        setAlertShow({ open: true, msg: 'Cash Audit Created successfully.', alertType: 'success' });
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
    if ((grandTotal - branchBalance) !== 0) {
      setIsModalOpen(true);
    } else {
      createCashAudit();
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
            Cash Audit
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
            <Grid item xs={10} sm={10} md={6} lg={6} xl={6}>
              <TableWrapper style={{ borderRadius: '5px' }}>
                <CustomTable2>
                  <TableHead>
                    <TableRow>
                      <TableCell align='center' colSpan={3}>Physical Verification Of Cash By Auditor</TableCell>
                    </TableRow>
                    <StyledTableRow>
                      <StyledTableCell align='center'>Currency</StyledTableCell>
                      <StyledTableCell align='center'>Count</StyledTableCell>
                      <StyledTableCell align='center'>Total Value</StyledTableCell>
                    </StyledTableRow>
                  </TableHead>
                  <TableBody>
                    {currencyMap.map((item, index) => (
                      <TableRow colSpan={3}>
                        <CustomTableCell align='center'>
                          {item.type === 'note' ? '₹' : 'Coin'}
                          {' '}
                          {item.currency}
                        </CustomTableCell>
                        <TableCell align='center'>
                          <TextFieldStyled
                            type='number'
                            value={item.count}
                            placeholder='Enter count'
                            onChange={(e) => {
                              const inputValue = e.target.value;
                              if (inputValue === '' || (/^\d+$/.test(inputValue) && Number.isInteger(+inputValue) && +inputValue > 0)) {
                                handleCountChange(index, inputValue);
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell align='center'>
                          <TextFieldStyled
                            value={`₹ ${item.totalValue}`}
                            disabled
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableCell
                      colSpan={3}
                      align='right'
                      style={{
                        background: 'grey', color: '#fff', padding: '15px', fontSize: '15px'
                      }}
                    >
                      Grand Total:
                      {' ₹'}
                      {grandTotal}
                    </TableCell>
                  </TableBody>
                </CustomTable2>
              </TableWrapper>
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
                  Cash As Per System (Real Time Balance)
                </Typography>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} padding='25px 20px 10px'>
                  <TextFieldStyled
                    label='Cash Balance At System'
                    variant='outlined'
                    value={`₹${branchBalance}`}
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
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} padding='10px 20px'>
                  <TextFieldStyled
                    label='Difference Cash Short/Excess'
                    value={`₹${grandTotal - branchBalance}`}
                    disabled
                  />
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
        title={isModalOpen ? `Difference of ₹${grandTotal - branchBalance} available` : 'Cash Audit Verification'}
        padding='10px'
        width='600px'
      >
        <form onSubmit={
          isModalOpen
            ? handleSubmit2(sendOTPToAuthEMP)
            : handleSubmit2(createCashAudit)
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
          Are you sure you want to cancel the Cash Audit informations?
        </DialogContentText>
        <CenterContainerStyled flexDirection='row' padding='20px 0 0 0'>
          <ResetButton onClick={() => navigate(ROUTENAME.cashAndPacketAudit)}>Yes</ResetButton>
          <ButtonPrimary onClick={handleConfirmationClose}>No</ButtonPrimary>
        </CenterContainerStyled>
      </DialogBox>
    </>
  );
};
export default CashAudit;
