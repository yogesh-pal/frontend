import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useScreenSize } from '../../../customHooks';
import {
  CustomContainerStyled, HeaderContainer, HeadingMaster, LoadingButtonPrimary,
  BreadcrumbsWrapperContainerStyled, BreadcrumbsContainerStyled, TextFieldStyled
} from '../../../components/styledComponents';
import { CustomDiv } from '../styled-components';
import { MenuNavigation, ToastMessage, FormViewer } from '../../../components';
import { NAVIGATION } from '../../../constants';
import { Service } from '../../../service';
import { userRoleColumnFields } from '../constant';

const FunctionalDesignation = () => {
  const [allRoles, setAllRoles] = useState([]);
  const [matchedRoles, setMatchedRoles] = useState([]);
  const [isLoading, setIsLoading] = useState({ loader: false, name: null });
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const { handleSubmit, register } = useForm();
  const screen = useScreenSize();
  const navigate = useNavigate();
  const navigationDetails = useMemo(() => [
    { name: 'Dashboard', url: NAVIGATION.dashboard },
    { name: 'User Management', url: NAVIGATION.userManagement },
    { name: 'Permission Management', url: NAVIGATION.functionalDesignation }
  ], [NAVIGATION]);

  const getRoles = async () => {
    try {
      setIsLoading({ loader: true, name: 'onLoad' });
      const { data } = await Service.get(`${process.env.REACT_APP_USER_SERVICE}/roles/list?page_size=1000`);
      if (data?.results.length) {
        setAllRoles(data?.results);
      }
    } catch (err) {
      if (err?.response?.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong, please try again.', alertType: 'error' });
      }
    } finally {
      setIsLoading({ loader: false, name: null });
    }
  };

  useEffect(() => {
    getRoles();
  }, []);
  const onSearchSubmit = ({ searchValue }) => {
    if (searchValue.trim().length) {
    // eslint-disable-next-line max-len
      const empRole = allRoles.filter((item) => item.name.toLowerCase().includes(searchValue.trim().toLowerCase()));
      if (empRole.length) {
      // eslint-disable-next-line no-underscore-dangle
        empRole.forEach((ele, ind) => { ele._id = ind; });
        setMatchedRoles(empRole);
      } else {
        setAlertShow({ open: true, msg: 'Functional Designation does not exist.', alertType: 'error' });
      }
    } else {
      setAlertShow({ open: true, msg: 'Invalid Search.', alertType: 'error' });
    }
  };

  const editPermissionHandler = ({ row }) => {
    navigate('/permissions', { state: row });
  };

  return (
    <>
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={navigationDetails} />
        </BreadcrumbsContainerStyled>
      </BreadcrumbsWrapperContainerStyled>
      <CustomContainerStyled padding='0 !important'>
        <ToastMessage
          alertShow={alertShow}
          setAlertShow={setAlertShow}
        />
        <HeaderContainer item xs={12}>
          <HeadingMaster>Permission Management</HeadingMaster>
        </HeaderContainer>
        <Grid container>
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
            <form onSubmit={handleSubmit(onSearchSubmit)} style={{ width: '100%' }}>
              <CustomDiv padding='0px 20px 0px'>
                <TextFieldStyled
                  style={{ width: ['sm', 'xs'].includes(screen) ? '100%' : '30%' }}
                  id='outlined-basic'
                  label='Functional Designation'
                  required
                  variant='outlined'
                  {...register('searchValue')}
                />
              </CustomDiv>
              <CustomDiv>
                <LoadingButtonPrimary loading={isLoading.loader && isLoading.name === 'onSearch'} type='submit'>
                  Search
                </LoadingButtonPrimary>
              </CustomDiv>
            </form>
          </Grid>
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12} display='flex' justifyContent='center'>
            {
            matchedRoles.length ? (
              <div style={{ width: ['sm', 'xs'].includes(screen) ? '100%' : '40%' }}>
                <FormViewer
                  loading={isLoading.loader && isLoading.name !== 'onUpdate'}
                  rows={isLoading.loader && isLoading.name !== 'onUpdate' ? [] : matchedRoles}
                  columns={userRoleColumnFields(editPermissionHandler)}
                  checkboxAllowed={false}
                  onPageSizeChange={() => null}
                  onPageChange={() => null}
                  alertShow={alertShow}
                  setAlertShow={setAlertShow}
                  rowCount={matchedRoles.length}
                  clientPaginationMode
                />
              </div>
            ) : null
        }
          </Grid>
        </Grid>
      </CustomContainerStyled>
    </>
  );
};

export default FunctionalDesignation;
