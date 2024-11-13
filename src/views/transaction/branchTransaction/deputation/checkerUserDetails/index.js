/* eslint-disable max-len */
import React, { useEffect, useState } from 'react';
import {
  Grid, Typography, Box, CircularProgress
} from '@mui/material';
import moment from 'moment';
import styled from '@emotion/styled';
import { ToastMessage } from '../../../../../components';
import { useScreenSize } from '../../../../../customHooks';
import {
  CustomContainerStyled, LoadingButtonPrimary,
  TextFieldStyled
} from '../../../../../components/styledComponents';
import { checkerDetailFormConfig } from '../constant';
import { Service } from '../../../../../service';
import { getDecodedToken } from '../../../../../utils';

const CustomText = styled(Typography)(() => ({
  fontSize: '18px',
  color: '#502A74',
  fontWeight: 700,
}));

const CheckerUserDetail = (props) => {
  const [formDetails, setFormDetails] = useState([]);
  const [isButtonsVisibles, setIsButtonsVisibles] = useState(false);
  const [isLoading, setIsLoading] = useState({ loader: false, name: null });
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const screen = useScreenSize();
  const { rowData, onSuccessClose } = props;

  const setFormConfig = async () => {
    try {
      setIsLoading({ loader: true, name: 'onLoad' });
      const token = getDecodedToken();
      const { data } = await Service.get(`${process.env.REACT_APP_BRANCH_MASTER}`);
      if (data?.branches.length) {
        const branch = data.branches.filter((ele) => ele.branchCode === rowData.branch_code);
        if (branch.length) {
          rowData.branch_name = branch[0].branchName;
        }
        const hrmsBranch = data.branches.filter((ele) => ele.branchCode === rowData.hrms_branch_code);
        if (hrmsBranch.length) {
          rowData.hrms_branch_name = hrmsBranch[0].branchName;
        }
        if (rowData?.status === 'Open' && (token.super_admin || token.permissions.includes('deputation_checker'))) {
          setIsButtonsVisibles(true);
        }
        const currentBranch = data.branches.filter((ele) => ele.branchCode === rowData.current_branch_code);
        if (currentBranch.length) {
          rowData.current_branch_name = currentBranch[0].branchName;
        }
        const config = checkerDetailFormConfig(rowData);
        setFormDetails(config);
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

  const formHandler = async (status) => {
    try {
      setIsLoading({ loader: true, name: status });
      const requestBody = {
        deputation_id: rowData.id,
        status
      };
      await Service.post(`${process.env.REACT_APP_USER_SERVICE}/deputation/update`, requestBody);
      setIsButtonsVisibles(false);
      onSuccessClose(`${rowData.type} ${status === 'APPV' ? 'approved' : 'rejected'} successfully.`);
    } catch (err) {
      if (err?.response?.data?.non_field_errors) {
        setAlertShow({ open: true, msg: err?.response?.data?.non_field_errors[0], alertType: 'error' });
      } else if (err?.response?.data?.detail) {
        setAlertShow({ open: true, msg: err?.response?.data?.detail, alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong. Please try again.', alertType: 'error' });
      }
    } finally {
      setIsLoading({ loader: false, name: null });
    }
  };

  const handleDetachment = async () => {
    try {
      setIsLoading({ loader: true, name: 'onDetach' });
      const requestBody = {
        name: rowData.name,
        emp_code: rowData.emp_code,
        email: rowData.email,
        branch_code: rowData.branch_code,
        hrms_branch_code: rowData.hrms_branch_code,
        type: 'DETAC',
        remarks: null,
        status: 'OPEN',
        user_deputation: rowData.id
      };
      await Service.post(`${process.env.REACT_APP_USER_SERVICE}/deputation/create`, requestBody);
      onSuccessClose('Detachment request raised successfully.');
    } catch (err) {
      if (err?.response?.data?.user_deputation) {
        setAlertShow({ open: true, msg: err?.response?.data?.user_deputation[0], alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong. Please try again.', alertType: 'error' });
      }
    } finally {
      setIsLoading({ loader: false, name: null });
    }
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
             <form>
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
                         id='current_branch_code'
                         label='Branch Code'
                         variant='outlined'
                         value={rowData.current_branch_code}
                         disabled
                       />
                     </Grid>
                     <Grid item xl={12} lg={12} md={12} sm={12} xs={12} padding='10px 20px'>
                       <TextFieldStyled
                         id='current_branch_name'
                         label='Branch Name'
                         variant='outlined'
                         value={rowData.current_branch_name}
                         disabled
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
                         value={rowData.branch_code}
                         disabled
                       />
                     </Grid>
                     <Grid item xl={12} lg={12} md={12} sm={12} xs={12} padding='10px 20px'>
                       <TextFieldStyled
                         id='branch_name'
                         label='Branch Name'
                         variant='outlined'
                         value={rowData.branch_name}
                         disabled
                       />
                     </Grid>
                   </div>
                 </Grid>
                 {
                  rowData.type === 'Deputation' && (
                  <>
                    <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                      <TextFieldStyled
                        id='start_date'
                        label='Start Date'
                        variant='outlined'
                        value={moment(rowData.deputation_start_date).format('DD/MM/YYYY')}
                        disabled
                      />
                    </Grid>
                    <Grid item xl={6} lg={6} md={6} sm={12} xs={12} padding='10px 20px'>
                      <TextFieldStyled
                        id='end_date'
                        label='End Date'
                        variant='outlined'
                        value={moment(rowData.deputation_end_date).format('DD/MM/YYYY')}
                        disabled
                      />
                    </Grid>
                  </>
                  )
                 }

                 {
                  isButtonsVisibles && (
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12} display='flex' justifyContent='center'>
                      <LoadingButtonPrimary loading={isLoading.loader && isLoading.name === 'APPV'} onClick={() => formHandler('APPV')}>
                        Approve
                      </LoadingButtonPrimary>
                      <LoadingButtonPrimary loading={isLoading.loader && isLoading.name === 'REJC'} onClick={() => formHandler('REJC')}>
                        Reject
                      </LoadingButtonPrimary>
                    </Grid>
                  )
                 }
                 {
                  rowData.status === 'Approved' && rowData.type === 'Deputation' && (
                    <Grid item xl={6} lg={6} md={6} sm={12} xs={12} display='flex' justifyContent='center'>
                      <LoadingButtonPrimary loading={isLoading.loader && isLoading.name === 'onDetach'} onClick={() => handleDetachment()}>
                        Detach
                      </LoadingButtonPrimary>
                    </Grid>
                  )
                 }
               </Grid>
             </form>
           )
}
    </CustomContainerStyled>
  );
};

export default React.memo(CheckerUserDetail);
