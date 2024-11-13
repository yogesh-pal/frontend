/* eslint-disable camelcase */
/* eslint-disable max-len */
import React, { useEffect, useState } from 'react';
import { cloneDeep } from 'lodash';
import { useNavigate } from 'react-router-dom';
import {
  FormControlLabel, Grid, CircularProgress, Box
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { FormViewer, ToastMessage } from '../../../components';
import {
  LoadingButtonPrimary, CheckboxPrimary, ButtonPrimary
} from '../../../components/styledComponents';
import { CustomDiv } from '../styled-components';
import { branchFormConfig } from '../constant';
import { ROUTENAME } from '../../../constants';
import { Service } from '../../../service';
import { existingUserDetails } from '../../../redux/reducer/userManagement';

const UserBranch = ({ setActiveTabIndex }) => {
  const [isShowBranchModal, setIsShowBranchModal] = useState(false);
  const [branchOptions, setBranchOptions] = useState([]);
  const [stateDetails, setStateDetails] = useState();
  const [apiResponse, setApiREsponse] = useState([]);
  const [formDetails, setFormDetails] = useState(cloneDeep(branchFormConfig({ stateDetails })));
  const [isLoading, setIsLoading] = useState({ loader: false, name: null });
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const existingUser = useSelector((data) => data.userManagement.existingUser);
  const { email } = useSelector((state) => state.user.userDetails);
  const { register, handleSubmit } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const saveBranchHandler = ({ branchCode, is_pan_india }) => {
    const selectedBranches = [];
    if (is_pan_india === 'YES') {
      apiResponse.forEach((ele) => {
        if (ele.branchCode !== existingUser?.branch_code) {
          selectedBranches.push({
            branch_name: ele.branchName,
            branch_code: ele.branchCode,
            is_active: true
          });
        }
      });
      dispatch(existingUserDetails({ ...existingUser, mapped_branches: selectedBranches, is_pan_india: 'YES' }));
      setBranchOptions(selectedBranches);
    } else {
      (apiResponse.filter((ele) => branchCode.includes(ele.branchCode) && ele.branchCode !== existingUser?.branch_code)).forEach((ele) => {
        if (existingUser.is_pan_india === 'NO') {
          if (!existingUser.mapped_branches.some((item) => item.branch_code === ele.branchCode)) {
            selectedBranches.push({
              branch_name: ele.branchName,
              branch_code: ele.branchCode,
              is_active: true
            });
          }
        } else {
          selectedBranches.push({
            branch_name: ele.branchName,
            branch_code: ele.branchCode,
            is_active: true
          });
        }
      });
      const branchesToSet = existingUser.is_pan_india === 'YES' ? selectedBranches : [...branchOptions, ...selectedBranches];
      dispatch(existingUserDetails({ ...existingUser, mapped_branches: branchesToSet, is_pan_india: 'NO' }));
      setBranchOptions(branchesToSet);
    }
    setIsShowBranchModal(false);
  };

  const branchDetailsHandler = async () => {
    try {
      setIsLoading({ loader: true, name: 'onLoad' });
      const { data } = await Service.get(`${process.env.REACT_APP_BRANCH_MASTER}`);
      if (data?.branches) {
        setApiREsponse(data.branches);
        const branches = [];
        if (existingUser?.is_pan_india === 'YES') {
          data.branches.forEach((ele) => {
            if (ele.branchCode !== existingUser?.branch_code) {
              branches.push({
                branch_name: ele.branchName,
                branch_code: ele.branchCode,
                is_active: true
              });
            }
          });
        } else {
          existingUser.mapped_branches.forEach((item) => {
            const data1 = (data.branches.filter((ele) => ele.branchCode === item.branch_code));
            if (data1.length) {
              branches.push({ ...item, branch_name: data1[0].branchName });
            }
          });
        }
        setBranchOptions(branches);
      }
      const obj = {};
      data?.branches?.forEach((item) => {
        if (obj.hasOwnProperty(item?.stateName)) {
          if (obj[item?.stateName].hasOwnProperty(item?.locationName)) {
            obj[item?.stateName][item.locationName].push({
              label: item.branchName, value: item.branchCode
            });
          } else {
            obj[item?.stateName][item?.locationName] = [{
              label: item.branchName, value: item.branchCode
            }];
          }
        } else {
          obj[item?.stateName] = {};
          obj[item?.stateName][item?.locationName] = [{
            label: item.branchName, value: item.branchCode
          }];
        }
      });
      setStateDetails(obj);
      const tempForm = cloneDeep(branchFormConfig({ stateDetails: obj, existingUser }));
      setFormDetails({ ...tempForm });
    } catch (e) {
      console.log('Error', e);
    } finally {
      setIsLoading({ loader: false, name: null });
    }
  };

  const onSubmitDetails = async () => {
    try {
      setIsLoading({ loader: true, name: 'onSubmit' });
      const mappedBranches = [];
      branchOptions.forEach((item) => {
        if (item.is_active) {
          mappedBranches.push({ branch_code: item.branch_code, created_by: email });
        }
      });
      const is_pan_india = mappedBranches.length >= (apiResponse.length - 1) ? 'YES' : 'NO';
      const updatedUserData = {
        ...existingUser,
        goldloan_status: existingUser.goldloan_status === 'ACTIVE',
        is_pan_india: is_pan_india === 'YES',
        mapped_branches: mappedBranches,
        updated_by: email
      };
      await Service.put(`${process.env.REACT_APP_USER_SERVICE}/users/edit/${existingUser.emp_code}`, updatedUserData);
      dispatch(existingUserDetails({ ...existingUser, mapped_branches: branchOptions, is_pan_india }));
      setAlertShow({ open: true, msg: 'User updated successfully.', alertType: 'success' });
      setTimeout(() => {
        navigate(ROUTENAME.userManagement);
      }, 300);
    } catch (err) {
      if (err?.response?.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      } else if (err?.response?.data?.mapped_branches?.mapped_branches) {
        setAlertShow({ open: true, msg: err?.response?.data?.mapped_branches?.mapped_branches, alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong, please try again.', alertType: 'error' });
      }
    } finally {
      setIsLoading({ loader: false, name: null });
    }
  };

  useEffect(() => {
    branchDetailsHandler();
  }, []);

  useEffect(() => {
    const tempForm = cloneDeep(branchFormConfig({ stateDetails, existingUser }));
    setFormDetails({ ...tempForm });
  }, [isShowBranchModal]);

  const handleOnChange = (event) => {
    const upadtedBranches = [...branchOptions];
    const index = upadtedBranches.findIndex((item) => item.branch_code === event.target.name);
    if (index !== -1) {
      const updatedBranch = {
        branch_code: event.target.name,
        branch_name: upadtedBranches[index].branch_name,
        is_active: event.target.checked
      };
      upadtedBranches[index] = updatedBranch;
    }
    setBranchOptions([...upadtedBranches]);
  };

  return (
    isLoading.loader && isLoading.name === 'onLoad' ? (
      <Box sx={{
        display: 'flex', height: '100px', justifyContent: 'center', alignItems: 'center'
      }}
      >
        <CircularProgress style={{ color: '#502A74' }} />
      </Box>
    )
      : (
        <>
          <ToastMessage
            alertShow={alertShow}
            setAlertShow={setAlertShow}
          />
          <div style={{ display: 'flex', justifyContent: 'end' }}>
            <ButtonPrimary onClick={() => setIsShowBranchModal(true)}>
              Add Branch
            </ButtonPrimary>
          </div>
          <form onSubmit={handleSubmit(onSubmitDetails)}>
            <Grid container>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12} display='flex' justifyContent='center'>
                Default Branch:
                {' '}
                {existingUser?.branch_name}
              </Grid>
              {
              branchOptions.length ? (
                <Grid
                  item
                  xl={12}
                  lg={12}
                  md={12}
                  sm={12}
                  xs={12}
                  display='flex'
                  justifyContent='center'
                  alignItems='center'
                  flexWrap='wrap'
                >
                  Other Branches:
                  {' '}
                  {
                branchOptions.map((option) => (
                  <FormControlLabel
                    key={option.branch_name}
                    {...register(option.branch_code)}
                    control={(<CheckboxPrimary checked={option.is_active} onChange={handleOnChange} />)}
                    label={option.branch_name}
                    style={{ paddingLeft: '10px' }}
                  />
                ))
              }
                </Grid>
              ) : null
            }
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12} display='flex' justifyContent='center'>
                <CustomDiv>
                  <ButtonPrimary onClick={() => setActiveTabIndex((state) => state - 1)}>
                    Previous
                  </ButtonPrimary>
                  <LoadingButtonPrimary loading={isLoading.loader && isLoading.name === 'onSubmit'} type='submit'>
                    Submit
                  </LoadingButtonPrimary>
                </CustomDiv>
              </Grid>
            </Grid>
          </form>
          {
        isShowBranchModal ? (
          <FormViewer
            isLoading={isLoading.loader && isLoading.name === 'onBranchCreate'}
            formMode={{ show: true }}
            rows={[]}
            columns={[]}
            checkboxAllowed={false}
            formDetails={formDetails}
            setFormDetails={setFormDetails}
            formHandler={saveBranchHandler}
            closeModelHandler={() => setIsShowBranchModal(false)}
            alertShow={alertShow}
            setAlertShow={setAlertShow}
            modalTitle='Add Branch'
          />
        ) : null
      }
        </>
      )
  );
};

export default React.memo(UserBranch);
