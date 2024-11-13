import jwtDecode from 'jwt-decode';
import store from '../../redux/store';

export const getUserPermissions = () => {
  try {
    const state = store.getState();
    const token = state.user.accessToken;
    const decodedToken = jwtDecode(token);
    return decodedToken.permissions.split(',');
  } catch (e) {
    console.log('Error', e);
  }
};
export const getDecodedToken = () => {
  try {
    const state = store.getState();
    const token = state.user.accessToken;
    const decodedToken = jwtDecode(token);
    return decodedToken;
  } catch (e) {
    console.log('Error', e);
  }
};
export const getUserRole = () => {
  try {
    const state = store.getState();
    const user = state.user?.userDetails;
    const role = user?.role;
    return role;
  } catch (e) {
    console.log('Error', e);
  }
};
