/* eslint-disable max-len */
import jwtDecode from 'jwt-decode';
import store from '../../redux/store';

export const checkUserPermission = (requiredPermissions) => {
  try {
    const state = store.getState();
    const decodedToken = jwtDecode(state.user.accessToken);
    const permissionsArray = decodedToken.permissions.split(',');
    return requiredPermissions?.every((ele) => permissionsArray.includes(ele)) || decodedToken.super_admin;
  } catch (e) {
    console.log('Error', e);
  }
};
