import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  customerId: '',
  appId: '',
  formData: {}
};

export const loanMaker = createSlice({
  name: 'loanMaker',
  initialState,
  reducers: {
    saveCustomerId: (state, action) => {
      state.customerId = action.payload;
    },
    saveAppId: (state, action) => {
      state.appId = action.payload;
    },
    saveFormData: (state, action) => {
      state.formData = action.payload;
    },
    loanlogoutReducer: (state) => {
      state.customerId = '';
      state.appId = '';
      state.formData = {};
    },
  },
});

export const {
  saveCustomerId,
  saveAppId,
  saveFormData,
  loanlogoutReducer
} = loanMaker.actions;

export default loanMaker.reducer;
