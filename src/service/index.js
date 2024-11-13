import axios from 'axios';
import store from '../redux/store';
import { VARIABLE } from '../constants';

export const Service = {
  getAPI: (apiUrl) => {
    const apiData = axios({
      method: 'get',
      url: apiUrl,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return apiData;
  },
  get: (apiUrl) => {
    const state = store.getState();
    const token = state.user.accessToken;
    const { selectedBranch, branchCodes } = state.user.userDetails;
    const apiData = axios({
      method: 'get',
      url: apiUrl,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`,
        branch: selectedBranch === VARIABLE.BRANCHALL ? branchCodes[0] : selectedBranch
      }
    });
    return apiData;
  },
  post: (apiUrl, data, headers) => {
    const state = store.getState();
    const token = state.user.accessToken;
    const { selectedBranch, branchCodes } = state.user.userDetails;
    const apiData = axios({
      method: 'post',
      url: apiUrl,
      data,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`,
        branch: selectedBranch === VARIABLE.BRANCHALL ? branchCodes[0] : selectedBranch,
        ...headers
      }
    });
    return apiData;
  },
  postLogin: (apiUrl, data) => {
    const apiData = axios({
      method: 'post',
      url: apiUrl,
      data,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return apiData;
  },
  put: (apiUrl, data, header) => {
    const state = store.getState();
    const token = state.user.accessToken;
    const { selectedBranch, branchCodes } = state.user.userDetails;
    const apiData = axios({
      method: 'put',
      url: apiUrl,
      data,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`,
        branch: selectedBranch === VARIABLE.BRANCHALL ? branchCodes[0] : selectedBranch,
        ...header
      }
    });
    return apiData;
  },
  patch: (apiUrl, data) => {
    const state = store.getState();
    const token = state.user.accessToken;
    const { selectedBranch, branchCodes } = state.user.userDetails;
    const apiData = axios({
      method: 'patch',
      url: apiUrl,
      data,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`,
        branch: selectedBranch === VARIABLE.BRANCHALL ? branchCodes[0] : selectedBranch
      }
    });
    return apiData;
  },
  postWithFile: (url, data) => {
    const state = store.getState();
    const token = state.user.accessToken;
    const { selectedBranch, branchCodes } = state.user.userDetails;
    return axios.post(
      url,
      data,
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          Authorization: `${token}`,
          branch: selectedBranch === VARIABLE.BRANCHALL ? branchCodes[0] : selectedBranch
        }
      }
    );
  },
  putWithFile: (url, data, header) => axios.put(
    url,
    data,
    header
  ),
  postTokenWithFile: (url, data) => {
    const state = store.getState();
    const token = state.user.accessToken;
    const { selectedBranch, branchCodes } = state.user.userDetails;
    return axios.post(
      url,
      data,
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          Authorization: `${token}`,
          branch: selectedBranch === VARIABLE.BRANCHALL ? branchCodes[0] : selectedBranch
        }
      }
    );
  },
  postToken: async (url, data) => {
    const state = store.getState();
    const token = state.user.accessToken;
    const { selectedBranch, branchCodes } = state.user.userDetails;
    return axios.post(
      url,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'Access-Control-Allow-Origin': '*',
          Authorization: `${token}`,
          branch: selectedBranch === VARIABLE.BRANCHALL ? branchCodes[0] : selectedBranch
        }
      }
    );
  },
};
