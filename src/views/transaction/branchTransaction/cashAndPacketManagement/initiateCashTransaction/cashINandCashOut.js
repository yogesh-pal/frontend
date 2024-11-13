/* eslint-disable no-nested-ternary */
/* eslint-disable max-len */
import moment from 'moment';
import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import {
  Grid, FormHelperText, DialogContentText, CircularProgress, InputAdornment
} from '@mui/material';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { ToastMessage, DialogBox } from '../../../../../components';
import { ROLE } from '../../../../../constants';
import { HeadingMaster2 } from '../../../helper';
import { Service } from '../../../../../service';
import {
  TextFieldStyled, LoadingButtonPrimary, ResetButton, ButtonPrimary,
  SelectMenuStyle, AutoCompleteStyled, CenterContainerStyled
} from '../../../../../components/styledComponents';

const CustomForm = styled.form`
  padding: 20px 0px;
`;

const amountFormat = Intl.NumberFormat('en-IN');

const CashINandCashOut = (props) => {
  const [branchOption, setBranchOption] = useState([]);
  const [formData, setFormData] = useState(null);
  const [transferringPersonList, setTransferringPersonList] = useState([]);
  const [transferringPersonName, setTransferringPersonName] = useState(null);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [loading, setLoading] = useState({ loader: false, name: null });
  const [transactionNumber, setTransactionNumber] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState({ onSubmit: false, onSucces: false });
  const {
    register, handleSubmit, setValue, getValues, formState: { errors }
  } = useForm();
  const { empCode, branchCodes } = useSelector((state) => state.user.userDetails);
  const {
    type, setAction, onSuccessClose, isRoleGVorABMorBM
  } = props;

  const onSubmit = (values) => {
    if (values?.category && values.category === 'select') {
      setValue('category', null, { shouldValidate: true });
      return;
    }
    setFormData(values);
    setIsConfirmationOpen({ onSubmit: true, onSucces: false });
  };

  const finalSubmitHandler = async () => {
    try {
      setIsConfirmationOpen({ onSubmit: false, onSucces: false });
      setLoading({ loader: true, name: 'onSubmit' });
      if (formData.category === 'IBCT') {
        const { status } = await Service.post(`${process.env.REACT_APP_CASH_SERVICE}/ibct/create`, {
          transaction_id: transactionNumber,
          amount: formData.cashAmount,
          request_branch_code: formData?.cashFromBranch,
          handler_emp_code: formData?.transferingPerson,
          mode: formData?.mode,
          maker_remarks: formData.remarks
        });
        if (status === 200) {
          setIsConfirmationOpen({ onSubmit: false, onSucces: true });
        }
      } else {
        const { status } = await Service.post(`${process.env.REACT_APP_CASH_SERVICE}/cash/create`, {
          transaction_id: transactionNumber,
          activity: type === 'CashIn' ? 'IN' : 'OT',
          amount: formData.cashAmount,
          category: formData.category,
          ref_no: formData.referenceNo,
          maker_remarks: formData.remarks
        });
        if (status === 200) {
          setIsConfirmationOpen({ onSubmit: false, onSucces: true });
        }
      }
    } catch (err) {
      console.log('err', err);
      if (err.response?.data?.data?.request_branch_code && err.response.data.data.request_branch_code.length) {
        setAlertShow({ open: true, msg: err.response.data.data.request_branch_code[0], alertType: 'error' });
      } else if (err.response?.data?.data?.net_balance && err.response.data.data.net_balance.length) {
        setAlertShow({ open: true, msg: err.response.data.data.net_balance[0], alertType: 'error' });
      } else if (err.response?.data?.data?.emp_code && err.response.data.data.emp_code.length) {
        setAlertShow({ open: true, msg: err.response.data.data.emp_code[0], alertType: 'error' });
      } else if (err.response?.data?.data?.transaction_id && err.response.data.data.transaction_id.length) {
        setAlertShow({ open: true, msg: err.response.data.data.transaction_id[0], alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong. Please try again.', alertType: 'error' });
      }
    } finally {
      setLoading({ loader: false, name: null });
    }
  };

  const getInitialData = async () => {
    try {
      setLoading({ loader: true, name: 'fetchInitialData' });
      const { data } = await Service.get(`${process.env.REACT_APP_BRANCH_MASTER}`);
      if (data?.branches.length) {
        let branches = data.branches.map((item) => item.branchCode);
        branches = branches.filter((item) => item !== branchCodes[0]);
        setBranchOption(branches.sort());
      }
      const response = await Service.get(`${process.env.REACT_APP_CASH_SERVICE}/cash/transaction/generate`);
      if (response.status === 200) {
        setTransactionNumber(response.data?.data?.transaction_id);
      }
    } catch (err) {
      console.log('err', err);
      setAlertShow({ open: true, msg: 'Something went wrong. Please try again.', alertType: 'error' });
    } finally {
      setLoading({ loader: false, name: null });
    }
  };

  useEffect(() => {
    getInitialData();
  }, []);

  const branchChangeHanlder = async (value) => {
    try {
      setValue('cashFromBranch', value, { shouldValidate: true });
      if (value) {
        const { data } = await Service.get(`${process.env.REACT_APP_USER_LIST}?page_size=1000&branch_code=${value},${branchCodes[0]}&func_des=${ROLE.BC},${ROLE.RO},${ROLE.SRO},${ROLE.GV},${ROLE.ABM},${ROLE.BM}&source=1&is_active=1`);
        if (data?.results && data?.results.length) {
          const empList = data?.results.map((item) => ({
            personCode: item.emp_code,
            personName: item.emp_name
          }));
          setTransferringPersonList(empList);
        }
      } else {
        setTransferringPersonList([]);
      }
    } catch (err) {
      console.log('err', err);
      if (err.response.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have get user permission.', alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong. Please try again.', alertType: 'error' });
      }
    }
  };

  const personChangeHandler = (personInfo) => {
    if (personInfo) {
      setTransferringPersonName(personInfo.personName);
      setValue('transferingPerson', personInfo.personCode, { shouldValidate: true });
    } else {
      setTransferringPersonName('');
      setValue('transferingPerson', null, { shouldValidate: true });
    }
  };

  const handleConfirmationClose = (event, reason) => {
    if (reason && ['escapeKeyDown', 'backdropClick'].includes(reason)) {
      return;
    }
    setIsConfirmationOpen({ onSubmit: false, onSucces: false });
  };

  const renderError = (name) => {
    if (errors?.[name]) {
      return <FormHelperText error>{errors?.[name].message}</FormHelperText>;
    }
  };

  return (
    <>
      <ToastMessage
        alertShow={alertShow}
        setAlertShow={setAlertShow}
      />
      {
        loading.loader && loading.name === 'fetchInitialData' ? (
          <CenterContainerStyled padding='40px'>
            <CircularProgress color='secondary' />
          </CenterContainerStyled>
        ) : (
          <CustomForm onSubmit={handleSubmit(onSubmit)}>
            <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
              <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                <HeadingMaster2>Transaction Number</HeadingMaster2>
              </Grid>
              <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                <TextFieldStyled
                  label=''
                  multiline
                  maxRows={2}
                  defaultValue={transactionNumber}
                  disabled
                />
              </Grid>
            </Grid>
            <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
              <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                <HeadingMaster2>Type</HeadingMaster2>
              </Grid>
              <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                <TextFieldStyled
                  label=''
                  defaultValue={type === 'CashIn' ? 'Cash In' : 'Cash Out'}
                  disabled
                />
              </Grid>
            </Grid>
            <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
              <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                <HeadingMaster2>Cash Amount</HeadingMaster2>
              </Grid>
              <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                <TextFieldStyled
                  label=''
                  placeholder='Cash Amount*'
                  InputProps={{
                    startAdornment: <InputAdornment position='start'><CurrencyRupeeIcon /></InputAdornment>
                  }}
                  {...register('cashAmount', {
                    onChange: (e) => {
                      const value = e.target.value.replace(/[^0-9"]/g, '');
                      setValue('cashAmount', value, { shouldValidate: true });
                    },
                    required: 'Please enter cash amount',
                    min: { value: 1, message: 'Cash amount should be greater than 0' },
                    max: { value: 100000000, message: 'Cash amount should be less than or equal to 10,00,00,000' }
                  })}
                />
                {renderError('cashAmount')}
              </Grid>
            </Grid>
            <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
              <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                <HeadingMaster2>Category</HeadingMaster2>
              </Grid>
              <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                <TextFieldStyled
                  label=''
                  select
                  defaultValue='select'
                  {...register('category', {
                    onChange: (e) => {
                      setValue('category', e.target.value);
                      setSelectedCategory(e.target.value);
                    },
                    required: 'Please select category'
                  })}
                >
                  <SelectMenuStyle value='select' disabled>Select</SelectMenuStyle>
                  {
                    isRoleGVorABMorBM ? <SelectMenuStyle value='FINO'>FINO</SelectMenuStyle> : null
                  }
                  {
                    isRoleGVorABMorBM ? <SelectMenuStyle value='PNEY'>PayNearby</SelectMenuStyle> : null
                  }
                  {
                    isRoleGVorABMorBM ? <SelectMenuStyle value='RECL'>Reli-collect</SelectMenuStyle> : null
                  }
                  {
                    type === 'CashIn' && isRoleGVorABMorBM ? <SelectMenuStyle value='VEEF'>Veefin</SelectMenuStyle> : null
                  }
                  {
                    type === 'CashIn' ? <SelectMenuStyle value='IBCT'>IBCT Cash IN</SelectMenuStyle> : null
                  }
                  {
                    type === 'CashOut' ? <SelectMenuStyle value='YESB'>Yes Bank</SelectMenuStyle> : null
                  }
                  {
                    type === 'CashOut' ? <SelectMenuStyle value='HDFC'>HDFC Bank</SelectMenuStyle> : null
                  }
                </TextFieldStyled>
                {renderError('category')}
              </Grid>
            </Grid>
            {['FINO', 'PNEY', 'RECL', 'VEEF'].includes(selectedCategory) || type === 'CashOut'
              ? (
                <>
                  <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
                    <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                      <HeadingMaster2>Date</HeadingMaster2>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                      <TextFieldStyled
                        label=''
                        defaultValue={moment().format('DD/MM/YYYY')}
                        disabled
                      />
                    </Grid>
                  </Grid>
                  <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
                    <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                      <HeadingMaster2>Maker Emp Code</HeadingMaster2>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                      <TextFieldStyled
                        label=''
                        defaultValue={empCode}
                        disabled
                      />
                    </Grid>
                  </Grid>
                  <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
                    <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                      <HeadingMaster2>Reference No</HeadingMaster2>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                      <TextFieldStyled
                        label=''
                        placeholder='Reference No'
                        {...register('referenceNo', {
                          onChange: (e) => setValue('referenceNo', e.target.value.trim(), { shouldValidate: true }),
                          required: false,
                          maxLength: { value: 30, message: 'Maximum 30 characters allowed' }
                        })}
                      />
                      {renderError('referenceNo')}
                    </Grid>
                  </Grid>
                  <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
                    <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                      <HeadingMaster2>Remarks</HeadingMaster2>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                      <TextFieldStyled
                        label=''
                        multiline
                        maxRows={3}
                        placeholder='Remarks*'
                        {...register('remarks', {
                          onChange: (e) => {
                            if (e.target.value.trim().length) {
                              setValue('remarks', e.target.value, { shouldValidate: true });
                            } else {
                              setValue('remarks', null, { shouldValidate: true });
                            }
                          },
                          required: 'Please enter remarks.',
                          maxLength: { value: 30, message: 'Maximum 30 characters allowed' }
                        })}
                      />
                      {renderError('remarks')}
                    </Grid>
                  </Grid>
                  <Grid container display='flex' alignItems='center' justifyContent='center'>
                    <LoadingButtonPrimary
                      variant='contained'
                      loading={loading?.loader && loading?.name === 'onSubmit'}
                      type='submit'
                    >
                      Submit
                    </LoadingButtonPrimary>
                    <ResetButton onClick={() => setAction(null)}>Cancel</ResetButton>
                  </Grid>
                </>
              )
              : null}
            {selectedCategory === 'IBCT'
              ? (
                <>
                  <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
                    <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                      <HeadingMaster2>Cash From Branch</HeadingMaster2>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                      <AutoCompleteStyled
                        {...register('cashFromBranch', {
                          required: 'Please select cash from branch'
                        })}
                        options={branchOption}
                        onChange={(event, newValue) => branchChangeHanlder(newValue)}
                        renderOption={(prop, item) => (
                          <SelectMenuStyle {...prop}>
                            {item}
                          </SelectMenuStyle>
                        )}
                        renderInput={(params) => <TextFieldStyled {...params} placeholder='Select' />}
                      />
                      {renderError('cashFromBranch')}
                    </Grid>
                  </Grid>
                  <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
                    <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                      <HeadingMaster2>Cash To Branch</HeadingMaster2>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                      <TextFieldStyled label='' disabled value={branchCodes.length ? branchCodes[0] : 'NA'} />
                    </Grid>
                  </Grid>
                  <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
                    <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                      <HeadingMaster2>Transferring Person Employee ID</HeadingMaster2>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                      <AutoCompleteStyled
                        {...register('transferingPerson', {
                          required: 'Please select transferring person employee id'
                        })}
                        getOptionLabel={(option) => option.personCode}
                        options={transferringPersonList}
                        onChange={(event, newValue) => personChangeHandler(newValue)}
                        renderOption={(prop, { personCode }) => (
                          <SelectMenuStyle {...prop}>
                            {personCode}
                          </SelectMenuStyle>
                        )}
                        renderInput={(params) => <TextFieldStyled {...params} placeholder='Select' />}
                      />
                      {renderError('transferingPerson')}
                    </Grid>
                  </Grid>
                  <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
                    <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                      <HeadingMaster2>Transferring Person Name</HeadingMaster2>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                      <TextFieldStyled label='' placeholder='Transferring Person Name' disabled value={transferringPersonName} />
                    </Grid>
                  </Grid>
                  <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
                    <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                      <HeadingMaster2>Mode</HeadingMaster2>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                      <TextFieldStyled
                        label=''
                        select
                        defaultValue='select'
                        {...register('mode', {
                          onChange: (e) => setValue('mode', e.target.value, { shouldValidate: true }),
                          required: 'Please select mode.'
                        })}
                      >
                        <SelectMenuStyle value='select' disabled>Select</SelectMenuStyle>
                        <SelectMenuStyle value='TWH'>Two-Wheeler</SelectMenuStyle>
                        <SelectMenuStyle value='CAR'>Car</SelectMenuStyle>
                        <SelectMenuStyle value='PBTR'>Public Transport</SelectMenuStyle>
                      </TextFieldStyled>
                      {renderError('mode')}
                    </Grid>
                  </Grid>
                  <Grid container display='flex' alignItems='center' justifyContent='center' padding='0px 10px'>
                    <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                      <HeadingMaster2>Remarks</HeadingMaster2>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} lg={3} xl={3} padding='10px'>
                      <TextFieldStyled
                        label=''
                        multiline
                        maxRows={3}
                        placeholder='Remarks*'
                        {...register('remarks', {
                          onChange: (e) => {
                            if (e.target.value.trim().length) {
                              setValue('remarks', e.target.value, { shouldValidate: true });
                            } else {
                              setValue('remarks', null, { shouldValidate: true });
                            }
                          },
                          required: 'Please enter remarks',
                          maxLength: { value: 30, message: 'Maximum 30 characters allowed' }
                        })}
                      />
                      {renderError('remarks')}
                    </Grid>
                  </Grid>
                  <Grid container display='flex' alignItems='center' justifyContent='center'>
                    <LoadingButtonPrimary
                      variant='contained'
                      loading={loading?.loader && loading?.name === 'onSubmit'}
                      type='submit'
                    >
                      Submit
                    </LoadingButtonPrimary>
                    <ResetButton onClick={() => setAction(null)}>Cancel</ResetButton>
                  </Grid>
                </>
              )
              : null}
          </CustomForm>
        )
      }
      <DialogBox
        isOpen={isConfirmationOpen.onSubmit || isConfirmationOpen.onSucces}
        title=''
        handleClose={handleConfirmationClose}
        width='460px'
        padding='30px'
      >
        <DialogContentText style={{ textAlign: 'center' }}>
          {
                isConfirmationOpen.onSubmit ? `Are you sure you want to Submit ${type === 'CashIn' ? (getValues('category') === 'IBCT' ? 'IBCT Cash In' : 'Cash In') : 'Cash Out'} transaction of Amount Rs. ${amountFormat.format(formData?.cashAmount)} for Branch ${branchCodes[0]} ${getValues('category') === 'IBCT' ? 'for Approval' : ''}?`
                  : `${type === 'CashIn' ? (getValues('category') === 'IBCT' ? `IBCT Cash In transaction of Amount Rs. ${amountFormat.format(formData?.cashAmount)} for Branch ${branchCodes[0]}  has been submitted for Approval.` : `Cash In transaction of Amount Rs. ${amountFormat.format(formData?.cashAmount)} for Branch ${branchCodes[0]} is successful.`)
                    : `Cash Out transaction of Amount Rs. ${amountFormat.format(formData?.cashAmount)} for Branch ${branchCodes[0]} is successful.`}`
            }
        </DialogContentText>
        <CenterContainerStyled flexDirection='row' padding='20px 0 0 0'>
          {
            isConfirmationOpen.onSubmit ? (
              <>
                <ButtonPrimary onClick={finalSubmitHandler}>Yes</ButtonPrimary>
                <ButtonPrimary onClick={() => setIsConfirmationOpen({ onSubmit: false, onSucces: false })}>No</ButtonPrimary>
              </>
            )
              : (
                <ButtonPrimary onClick={() => onSuccessClose(null)}>
                  Okay
                </ButtonPrimary>
              )
          }
        </CenterContainerStyled>
      </DialogBox>
    </>
  );
};
export default CashINandCashOut;
