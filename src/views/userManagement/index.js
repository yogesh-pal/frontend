import {
  useEffect, useMemo, useRef, useState
} from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  Grid
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { MODULE_PERMISSION, NAVIGATION } from '../../constants';
import { useScreenSize } from '../../customHooks';
import { userColumnFields } from './constant';
import { FormViewer, MenuNavigation, ToastMessage } from '../../components';
import {
  ButtonPrimary, HeaderContainer, CustomContainerStyled, LoadingButtonPrimary,
  BreadcrumbsWrapperContainerStyled, BreadcrumbsContainerStyled,
  TextFieldStyled, HeadingMaster
} from '../../components/styledComponents';
import { CustomDiv } from './styled-components';
import { Service } from '../../service';
import { existingUserDetails } from '../../redux/reducer/userManagement';
import { throttleFunction } from '../../utils/throttling';
import { checkUserPermission } from '../../utils';

const UserManagement = () => {
  const [userData, setUserData] = useState(null);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [isLoading, setIsLoading] = useState({ loader: false, name: null });
  const [pageInfo, setPageInfo] = useState({ pageNumber: 1, pageSize: 10 });
  const [isSearchDisabled, setIsSearchDisabled] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const screen = useScreenSize();
  const loaderRef = useRef();
  const navigationDetails = useMemo(() => [
    { name: 'Dashboard', url: NAVIGATION.dashboard },
    { name: 'User Management', url: NAVIGATION.userManagement }
  ], [NAVIGATION]);

  useEffect(() => {
    dispatch(existingUserDetails({}));
  }, []);

  const onSearchSubmit = async ({ searchValue }) => {
    try {
      if (searchValue.trim().length) {
        loaderRef.current = true;
        setIsLoading({ loader: true, name: 'onSearch' });
        const { data } = await Service.get(`${process.env.REACT_APP_USER_SERVICE}/users/get/${searchValue.trim()}`);
        delete data.sub_department;
        // eslint-disable-next-line no-underscore-dangle
        data._id = 1;
        data.goldloan_status = data.goldloan_status ? 'ACTIVE' : 'INACTIVE';
        data.is_pan_india = data.is_pan_india ? 'YES' : 'NO';
        setUserData(data);
        setIsTableVisible(true);
      } else {
        setAlertShow({ open: true, msg: 'Invalid Search.', alertType: 'error' });
      }
    } catch (err) {
      if (err?.response?.status === 403) {
        setAlertShow({ open: true, msg: 'You do not have permission to perform this action.', alertType: 'error' });
      } else if (err?.response?.status === 404) {
        setAlertShow({ open: true, msg: 'User does not exist.', alertType: 'error' });
      } else {
        setAlertShow({ open: true, msg: 'Something went wrong, please try again.', alertType: 'error' });
      }
    } finally {
      loaderRef.current = false;
      setIsLoading({ loader: false, name: null });
    }
  };
  const onPageChange = (pageNumber) => {
    setPageInfo({ pageNumber, pageSize: pageInfo.pageSize });
  };

  const onPageSizeChange = (pageSize) => {
    setPageInfo({ pageNumber: pageInfo.pageNumber, pageSize });
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
          <HeadingMaster>User Management</HeadingMaster>
          {
            checkUserPermission(MODULE_PERMISSION.permission) && (
            <ButtonPrimary onClick={() => navigate('/permission-management')}>
              Permission Management
            </ButtonPrimary>
            )
          }
        </HeaderContainer>
        <Grid
          item
          xs={12}
          display='flex'
          justifyContent='center'
          padding='0 20px'
        >
          <form
            onSubmit={handleSubmit((values) => {
              throttleFunction(
                {
                  args1: [values],
                  function1: onSearchSubmit
                },
                loaderRef,
                setIsSearchDisabled
              );
            })}
            style={{ width: '100%' }}
          >
            <CustomDiv>
              <TextFieldStyled
                style={{ width: ['sm', 'xs'].includes(screen) ? '100%' : '30%' }}
                id='outlined-basic'
                label='Emp Code'
                required
                variant='outlined'
                {...register('searchValue')}
              />
            </CustomDiv>
            <CustomDiv>
              <LoadingButtonPrimary loading={isLoading.loader && isLoading.name === 'onSearch'} disabled={isSearchDisabled} type='submit'>
                Search
              </LoadingButtonPrimary>
            </CustomDiv>
          </form>
        </Grid>
        {
          isTableVisible
            ? (
              <FormViewer
                loading={isLoading.loader && isLoading.name !== 'onUpdate'}
                formMode={{ show: false }}
                rows={[userData]}
                columns={userColumnFields}
                checkboxAllowed={false}
                onPageSizeChange={onPageSizeChange}
                onPageChange={onPageChange}
                alertShow={alertShow}
                setAlertShow={setAlertShow}
                rowCount={0}
                handleCellClick={(cellValue, rowData) => navigate('/user-detail', { state: rowData })}
                hideFooterPagination
              />
            )
            : null
}
      </CustomContainerStyled>
    </>
  );
};
export default UserManagement;
