import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoggedIn: false,
  accessToken: '',
  submitFormValues: {},
  stateData: {},
  schemeData: [],
  chargerData: [],
  userDetails: {},
  rpg: 0
};
export const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    login: (state, action) => {
      state.isLoggedIn = action.payload;
    },
    loginUserDetails: (state, action) => {
      state.userDetails = action.payload;
    },
    saveToken: (state, action) => {
      state.accessToken = action.payload;
    },
    logout: (state) => {
      state.accessToken = '';
    },
    saveFormValues: (state, action) => {
      state.submitFormValues = action.payload;
    },
    saveState: (state, action) => {
      state.stateData = action.payload;
    },
    saveRpg: (state, action) => {
      state.rpg = action.payload;
    },
    setSchemeData: (state, action) => {
      state.schemeData = action.payload;
    },
    setChargerData: (state, action) => {
      state.chargerData = action.payload;
    }
  },
});

// Action creators are generated for each case reducer function
export const {
  login, logout, saveFormValues, saveState, loginUserDetails, saveRpg, saveToken, setSchemeData,
  setChargerData
} = loginSlice.actions;

export default loginSlice.reducer;
