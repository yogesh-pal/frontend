/* eslint-disable max-len */
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Grid, Typography, FormHelperText, Box, CircularProgress
} from '@mui/material';
import styled from '@emotion/styled';
import moment from 'moment';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ToastMessage } from '../../../../../components';
import { useScreenSize } from '../../../../../customHooks';
import {
  CustomContainerStyled, LoadingButtonPrimary,
  TextFieldStyled, ResetButton
} from '../../../../../components/styledComponents';
import { makerDetailFormConfig } from '../constant';
import { Service } from '../../../../../service';

const FormHelperTextStyled = styled(FormHelperText)(() => ({
  marginLeft: '0 !important'
}));
const CustomText = styled(Typography)(() => ({
  fontSize: '18px',
  color: '#502A74',
  fontWeight: 700,
}));

const MakerUserDetail = (props) => {
  const [formDetails, setFormDetails] = useState([]);
  const [allBranches, setAllBranches] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isLoading, setIsLoading] = useState({ loader: false, name: null });
  const [deputationBranchName, setDeputationBranchName] = useState('');
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const screen = useScreenSize();
  const {
    handleSubmit, register, setValue, formState: { errors }, setError, clearErrors
  } = useForm();
  const { rowData, onSuccessClose } = props;

  const setFormConfig = async () => {
    try {
      setIsLoading({ loader: true, name: 'onLoad' });
      const { data } = await Service.get(`${process.env.REACT_APP_BRANCH_MASTER}`);
      if (data?.branches.length) {
        setAllBranches(data.branches);
        const hrmsBranch = data.branches.filter((ele) => ele.branchCode === rowData.hrms_branch_code);
        if (hrmsBranch.length) {
          rowData.hrms_branch_name = hrmsBranch[0].branchName;
        }
        const config = makerDetailFormConfig({
          ...rowData,
          goldloan_status: rowData.goldloan_status ? 'ACTIVE' : 'INACTIVE'
        });
        setFormDetails(config);
        register('start_date', { required: 'Please select start date.' });
        register('end_date', { required: 'Please select end date.' });
      }
    } catch (err) {
      setAlertShow({ open: true, msg: 'Something went wrong. Please try again.', alertType: 'error' });
    } finally {
      setIsLoading({ loader: false, name: null });
    }
  };

  useEffect(() => {
    setFormConfig();
  }, []);

  const formHandler = async (values) => {
    try {
      setIsLoading({ loader: true, name: 'onSubmit' });
      const branch = allBranches.filter((item) => item.branchCode.toLowerCase() === values.branch_code.trim().toLowerCase());
      if (!branch.length) {
        setAlertShow({ open: true, msg: 'Deputation branch code does not exist.', alertType: 'error' });
        return;
      }
      const deputationStartDate = moment(values.start_date).format('YYYY-MM-DD');
      const deputationEndDate = moment(values.end_date).format('YYYY-MM-DD');
      const requestBody = {
        uid: rowData.id,
        name: values.emp_name,
        emp_code: values.emp_code,
        email: values.email,
        branch_code: values.branch_code,
        hrms_branch_code: rowData.hrms_branch_code,
        type: 'DEPUT',
        remarks: null,
        status: 'OPEN',
        deputation_start_date: deputationStartDate,
        deputation_end_date: deputationEndDate
      };
      await Service.post(`${process.env.REACT_APP_USER_SERVICE}/deputation/create`, requestBody);
      onSuccessClose();
    } catch (err) {
      if (err?.response?.data?.deputation_start_date) {
        setAlertShow({ open: true, msg: err.response.data.deputation_start_date[0], alertType: 'error' });
      } else if (err?.response?.data?.deputation_end_date) {
        setAlertShow({ open: true, msg: err.response.data.deputation_end_date[0], alertType: 'error' });
      } else if (err?.response?.data?.uid) {
        setAlertShow({ open: true, msg: err.response.data.uid[0], alertType: 'error' });
      } else if (err?.response?.data?.branch_code) {
        setAlertShow({ open: true, msg: err.response.data.branch_code[0], alertType: 'error' });
      } else if (err?.response?.data?.detail) {
        setAlertShow({ open: true, msg: err?.response?.data?.detail, alertType: 'error' });
      } else if (err?.response?.data?.non_field_errors) {
        setAlertShow({ open: true, msg: err.response.data.non_field_errors[0], alertType: 'error' });
      } else if (err?.response?.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      } else if (err?.response?.data?.hrms_branch_code && err?.response?.data?.hrms_branch_code.length) {
        setAlertShow({ open: true, msg: err?.response?.data?.hrms_branch_code[0], alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong. Please try again.', alertType: 'error' });
      }
    } finally {
      setIsLoading({ loader: false, name: null });
    }
  };

  const handleDeputationBranchCode = ({ target }) => {
    if (target.value.trim().length) {
      const branch = allBranches.filter((item) => item.branchCode.toLowerCase() === target.value.trim().toLowerCase());
      if (branch.length) {
        setValue('branch_name', branch[0].branchName);
        setDeputationBranchName(branch[0].branchName);
        clearErrors('branch_code');
      } else {
        setValue('branch_name', null);
        setDeputationBranchName(null);
        setError('branch_code', { type: 'custom', message: 'Branch code does not exist.' });
      }
    } else {
      clearErrors('branch_code');
    }
  };

  const disableStartDates = (currentDate) => moment(currentDate).isAfter(moment().add(6, 'days'), 'day');

  const disableEndDates = (currentDate) => moment(currentDate).isAfter(moment(startDate).add(14, 'days'), 'day') || moment(currentDate).isBefore(moment(startDate), 'day');

  const renderError = (name) => {
    if (errors?.[name]) {
      return <FormHelperTextStyled error>{errors?.[name].message}</FormHelperTextStyled>;
    }
  };

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
    setValue('branch_code', null);
    setDeputationBranchName('');
    setValue('start_date', null);
    setValue('end_date', null);
    clearErrors();
  };

  return (
    <CustomContainerStyled padding='0 !important'>
      <ToastMessage
        alertShow={alertShow}
        setAlertShow={setAlertShow}
      />
      {
           isLoading.loader && isLoading.name === 'onLoad' ? (
             <Box sx={{
               display: 'flex', height: '100px', justifyContent: 'center', alignItems: 'center'
             }}
             >
               <CircularProgress style={{ color: '#502A74' }} />
             </Box>
           ) : (
             <form onSubmit={handleSubmit(formHandler)}>
               <Grid container display='flex' justifyContent='center' padding='20px 0px'>
                 {
            formDetails.map((item, ind) => (
              <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                <TextFieldStyled
                  id={ind}
                  label={item.label}
                  variant='outlined'
                  value={item.defaultValue}
                  disabled
                  {...register(item.name, { value: item.defaultValue })}
                />
              </Grid>
            ))
        }
                 <Grid item xl={6} lg={6} md={6} sm={12} xs={12} style={['xs', 'sm'].includes(screen) ? null : { padding: '10px 20px', display: 'flex' }}>
                   <Grid item xl={4} lg={4} md={4} sm={12} xs={12} padding='10px 20px' display='flex' alignItems='center'>
                     <CustomText>Current Branch</CustomText>
                   </Grid>
                   <div style={{ width: '100%' }}>
                     <Grid item xl={12} lg={12} md={12} sm={12} xs={12} padding='10px 20px'>
                       <TextFieldStyled
                         id='hrms_branch_code'
                         label='Branch Code'
                         variant='outlined'
                         value={rowData.branch_code}
                         disabled
                         {...register('hrms_branch_code', { value: rowData.branch_code })}
                       />
                     </Grid>
                     <Grid item xl={12} lg={12} md={12} sm={12} xs={12} padding='10px 20px'>
                       <TextFieldStyled
                         id='hrms_branch_name'
                         label='Branch Name'
                         variant='outlined'
                         value={rowData.branch_name}
                         disabled
                         {...register('hrms_branch_name', { value: rowData.branch_name })}
                       />
                     </Grid>
                   </div>
                 </Grid>
                 <Grid item xl={6} lg={6} md={6} sm={12} xs={12} style={['xs', 'sm'].includes(screen) ? null : { padding: '10px 20px', display: 'flex' }}>
                   <Grid item xl={4} lg={4} md={4} sm={12} xs={12} padding='10px 20px' display='flex' alignItems='center'>
                     <CustomText>Deputation Branch</CustomText>
                   </Grid>
                   <div style={{ width: '100%' }}>
                     <Grid item xl={12} lg={12} md={12} sm={12} xs={12} padding='10px 20px'>
                       <TextFieldStyled
                         id='branch_code'
                         label='Branch Code'
                         variant='outlined'
                         {...register('branch_code', { required: 'Please enter branch code.' })}
                         onChange={handleDeputationBranchCode}
                       />
                       {renderError('branch_code')}
                     </Grid>
                     <Grid item xl={12} lg={12} md={12} sm={12} xs={12} padding='10px 20px'>
                       <TextFieldStyled
                         id='branch_name'
                         label='Branch Name'
                         variant='outlined'
                         value={deputationBranchName}
                         isDisabled={!deputationBranchName}
                         disabled
                         {...register('branch_name')}
                       />
                     </Grid>
                   </div>
                 </Grid>
                 <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                   <LocalizationProvider dateAdapter={AdapterDateFns}>
                     <DatePicker
                       label='Start Date'
                       inputFormat='dd/MM/yyyy'
                       value={startDate}
                       onChange={(startDateValue) => {
                         setStartDate(startDateValue);
                         setValue('start_date', startDateValue, { shouldValidate: true, shouldDirty: true });
                         setEndDate(null);
                         setValue('end_date', null, { shouldValidate: true, shouldDirty: true });
                       }}
                       renderInput={(params) => (
                         <TextFieldStyled
                           onKeyDown={(e) => e.preventDefault()}
                           variant='outlined'
                           {...params}
                         />
                       )}
                       disablePast
                       shouldDisableDate={disableStartDates}
                     />
                   </LocalizationProvider>
                   {renderError('start_date')}
                 </Grid>
                 <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                   <LocalizationProvider dateAdapter={AdapterDateFns}>
                     <DatePicker
                       className='date-picker'
                       disableHighlightToday={false}
                       label='End Date'
                       inputFormat='dd/MM/yyyy'
                       value={endDate}
                       onChange={(endDateValue) => {
                         setEndDate(endDateValue);
                         setValue('end_date', endDateValue, { shouldValidate: true, shouldDirty: true });
                       }}
                       renderInput={(params) => (
                         <TextFieldStyled
                           onKeyDown={(e) => e.preventDefault()}
                           variant='outlined'
                           {...params}
                         />
                       )}
                       disablePast
                       shouldDisableDate={disableEndDates}
                     />
                   </LocalizationProvider>
                   {renderError('end_date')}
                 </Grid>
                 <Grid item xl={12} lg={12} md={12} sm={12} xs={12} display='flex' justifyContent='center'>
                   <LoadingButtonPrimary loading={isLoading.loader && isLoading.name === 'onSubmit'} type='submit'>
                     Submit
                   </LoadingButtonPrimary>
                   <ResetButton onClick={() => handleReset()}>
                     Reset
                   </ResetButton>
                 </Grid>
               </Grid>
             </form>
           )
}
    </CustomContainerStyled>
  );
};

export default React.memo(MakerUserDetail);
