import axios from 'axios';
import store from '../../../redux/store';

export const CashAndPacketService = {
  get: (apiUrl, branch) => {
    const state = store.getState();
    const token = state.user.accessToken;
    const apiData = axios({
      method: 'get',
      url: apiUrl,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`,
        branch
      }
    });
    return apiData;
  }
};
