/* eslint-disable max-len */
import moment from 'moment';
import styled from '@emotion/styled';
import jwtDecode from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import LogoutIcon from '@mui/icons-material/Logout';
import { useDispatch, useSelector } from 'react-redux';
import {
  Popover, Divider, Button, CircularProgress
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { login, loginUserDetails, logout } from '../../redux/reducer/login';
import { customerlogoutReducer } from '../../redux/reducer/customerCreation';
import { loanlogoutReducer } from '../../redux/reducer/loanMaker';
import { useScreenSize } from '../../customHooks';
import capriLogo from '../../assets/CGCL_logo.png';
import { Service } from '../../service';
import CustomToaster from '../mesaageToaster';
import { CenterContainerStyled } from '../styledComponents';

const WrapperRow = styled.div`
  height: 110px;
  position: sticky;
  top: 0;
  z-index: 50;
  background-color: #ffffff;
  box-shadow: 0 2px 10px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: end;
  align-items:center;
`;

const ImageContainer = styled('img')(({ screen }) => ({
  height: ['xs', 'sm'].includes(screen) ? '40%' : '70%'
}));

const WrapperDiv = styled.div`
  padding: 15px;
  font-family: "Roboto","Helvetica","Arial","sans-serif";
`;
const CustomSpan = styled.span`
  color: rgb(0 0 0 / 38%);
`;
const CustomDiv = styled.div`
  padding: 5px 0px;
`;
const LogOutDiv = styled.div`
  color: red;
  padding: 10px 0px;
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const CustomButton = styled(Button)`
  border: 1px solid #502A74;
  background-color: #ede9f1;
  color: #502A74;
`;

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [branchName, setBranchName] = useState(null);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [isLoading, setIsLoading] = useState({ loader: false, name: null });

  const open = Boolean(anchorEl);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const screen = useScreenSize();
  const accessToken = useSelector((state) => state.user.accessToken);
  const token = (accessToken !== '') ? jwtDecode(accessToken) : null;

  const logoutHandler = () => {
    try {
      dispatch(login(false));
      dispatch(loginUserDetails({ }));
      dispatch(logout());
      dispatch(customerlogoutReducer());
      dispatch(loanlogoutReducer());
      navigate('/', { replace: true });
    } catch (e) {
      console.log('Error', e);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      logoutHandler();
    }, moment.unix(token?.exp).diff(moment()));
  }, [accessToken]);

  const onOpen = async (event) => {
    try {
      setAnchorEl(event.currentTarget);
      setIsLoading({ loader: true, name: 'onBranchFetch' });
      if (!branchName) {
        const { data } = await Service.get(process.env.REACT_APP_BRANCH_MASTER);
        const branchInfo = data?.branches?.filter((item) => item.branchCode === token.default_branch);
        if (branchInfo.length) {
          setBranchName(branchInfo[0].branchName);
        } else {
          setAlertShow({ open: true, msg: 'Something went wrong while fetching branch details', alertType: 'error' });
        }
      }
      setIsLoading({ loader: false, name: null });
    } catch (err) {
      setAlertShow({ open: true, msg: 'Something went wrong while fetching branch details', alertType: 'error' });
    }
  };

  return (
    <WrapperRow>
      {
        location.pathname !== '/' && location.pathname !== '/file-viewer' && (
        <CustomButton onClick={(event) => onOpen(event)}>
          <AccountCircleIcon style={{ marginRight: '10px' }} />
          {token?.fullname?.split(' ')[0]}
        </CustomButton>
        )
      }
      <CustomToaster
        alertShow={alertShow}
        setAlertShow={setAlertShow}
      />
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        {
        isLoading.loader && isLoading.name === 'onBranchFetch'
          ? (
            <CenterContainerStyled padding='40px'>
              <CircularProgress color='secondary' />
            </CenterContainerStyled>
          ) : (
            <WrapperDiv>
              <CustomDiv>
                <CustomSpan>Employee Code </CustomSpan>
                <b>
                  -
                  {' '}
                  {token?.emp_code}
                </b>
              </CustomDiv>
              <CustomDiv>
                <CustomSpan>Designation </CustomSpan>
                <b>
                  -
                  {' '}
                  {token?.role}
                </b>
              </CustomDiv>
              <CustomDiv>
                <CustomSpan>Email ID </CustomSpan>
                <b>
                  -
                  {' '}
                  {token?.email}
                </b>
              </CustomDiv>
              <CustomDiv>
                <CustomSpan>Branch ID </CustomSpan>
                <b>
                  -
                  {' '}
                  {token?.default_branch}
                </b>
              </CustomDiv>
              <CustomDiv>
                <CustomSpan>Branch Name </CustomSpan>
                <b>
                  -
                  {' '}
                  {branchName}
                </b>
              </CustomDiv>
              <CustomDiv>
                <Divider />
                <LogOutDiv onClick={logoutHandler}>
                  <LogoutIcon color='red' />
                  &nbsp;
                  Log Out
                </LogOutDiv>
                <Divider />
              </CustomDiv>
            </WrapperDiv>
          )
        }
      </Popover>
      <ImageContainer
        src={capriLogo}
        alt=''
        screen={screen}
      />
    </WrapperRow>
  );
};
export default Header;
