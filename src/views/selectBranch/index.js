import styled from '@emotion/styled';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Grid, Box, Container, TextField, FormHelperText, CircularProgress
} from '@mui/material';
import { getDecodedToken } from '../../utils';
import { Service } from '../../service/index';
import { ToastMessage } from '../../components';
import { useScreenSize } from '../../customHooks';
import { VARIABLE, ROUTENAME } from '../../constants';
import { loginUserDetails } from '../../redux/reducer/login';
import { AutoCompleteStyled, ButtonPrimary, ContainerItemStyled } from '../../components/styledComponents';

const BranchSelectionContainer = styled(Box)`
display: flex;
align-items: center;
justify-content: center;
width: 100%;
min-height: 400px;
height: calc(100vh - 190px);
`;

const Li = styled.li`
  color: #502a74;
  &:hover{
    background-color: #502a741a !important;
  }
`;

const ContainerStyled = styled(Container)(({ theme, screen }) => ({
  boxShadow: `${theme?.boxShadow?.primary} 0px 2px 8px`,
  padding: '20px',
  width: ['xs', 'sm'].includes(screen) ? '350px' : '500px',
}));

const StyledText = styled.div`
 color: #502A74;
`;

const SelectBranch = () => {
  const screen = useScreenSize();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [branchCodes, setBranchCodes] = useState([]);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const { userDetails } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    register, handleSubmit, setValue, formState: { errors }
  } = useForm();

  const getBranchData = async () => {
    try {
      setIsLoading(true);
      const decodedToken = getDecodedToken();
      if (decodedToken.super_admin || decodedToken.pan_india) {
        const { data } = await Service.get(`${process.env.REACT_APP_BRANCH_MASTER}`);
        let branchData = data.branches.map((item) => item.branchCode);
        branchData = branchData.sort();
        dispatch(
          loginUserDetails({
            ...userDetails,
            branchCodes: branchData,
          })
        );
        setBranchCodes([VARIABLE.BRANCHALL, ...branchData]);
      } else if (userDetails?.branchCodes.length === 1) {
        setBranchCodes([...userDetails.branchCodes]);
      } else if (userDetails?.branchCodes.length > 0) {
        const branchData = [...userDetails.branchCodes].sort();
        setBranchCodes([VARIABLE.BRANCHALL, ...branchData]);
      } else {
        setBranchCodes([]);
      }
    } catch (e) {
      console.log('Error', e);
      setAlertShow({ open: true, msg: 'Something went wrong. Please try again!', alertType: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getBranchData();
  }, []);

  const handleChange = (event, value) => {
    setValue('branch', value, { shouldValidate: true });
  };

  const formHandler = (formValues) => {
    dispatch(
      loginUserDetails({
        ...userDetails,
        selectedBranch: formValues.branch,
        allBranchSelected: formValues.branch === VARIABLE.BRANCHALL
      })
    );
    navigate(ROUTENAME.goldLoanDashboard);
  };

  const renderError = (name) => {
    if (errors?.[name]) {
      return <FormHelperText error>{errors?.[name].message}</FormHelperText>;
    }
  };

  return (
    <BranchSelectionContainer>
      <ToastMessage
        alertShow={alertShow}
        setAlertShow={setAlertShow}
      />
      <ContainerStyled screen={screen}>
        <form onSubmit={handleSubmit(formHandler)}>
          <ContainerItemStyled><StyledText>Please select branch</StyledText></ContainerItemStyled>
          <Grid container display='flex' padding='10px 0px'>
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
              <AutoCompleteStyled
                disableClearable
                id='auto-complete'
                {...register('branch', {
                  required: 'Please select branch'
                })}
                noOptionsText='No branch'
                open={open}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
                onChange={handleChange}
                options={branchCodes}
                loading={isLoading}
                renderOption={(prop, option) => (
                  <Li
                    {...prop}
                  >
                    {option}
                  </Li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label='Branch*'
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {isLoading ? <CircularProgress color='inherit' size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      )
                    }}
                  />
                )}
              />
              {renderError('branch')}
            </Grid>
          </Grid>
          <Grid container>
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12} display='flex' justifyContent='center'>
              <ButtonPrimary type='submit'>Submit</ButtonPrimary>
            </Grid>
          </Grid>
        </form>
      </ContainerStyled>
    </BranchSelectionContainer>
  );
};
export default SelectBranch;
