/* eslint-disable no-alert */
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import { login, loginUserDetails, logout } from '../redux/reducer/login';

const PrivateRoutes = () => {
  const isLogin = useSelector((state) => state.user.isLoggedIn);
  const accessToken = useSelector((state) => state.user.accessToken);
  const dispatch = useDispatch();
  const checkToken = () => {
    const token = (accessToken !== '') ? jwtDecode(accessToken) : null;
    if (token != null && !moment.unix(token.exp).isAfter(moment())) {
      dispatch(login(false));
      dispatch(loginUserDetails({ }));
      dispatch(logout());
      alert('Token Expire!!');
      return false;
    }
    return isLogin;
  };
  return checkToken() ? <Outlet /> : <Navigate to='/' />;
};

export default PrivateRoutes;
