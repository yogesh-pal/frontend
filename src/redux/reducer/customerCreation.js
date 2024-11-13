import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  bankDetails: {},
  aadhaarCardTimeStamp: '',
  fatherOrSpouse: '',
  unmaskedAadhaarNo: null,
};

export const customerCreation = createSlice({
  name: 'customerCreation',
  initialState,
  reducers: {
    bankDetailsReducer: (state, action) => {
      state.bankDetails = action.payload;
    },
    customerlogoutReducer: (state) => {
      state.bankDetails = {};
      state.aadhaarCardTimeStamp = '';
      state.fatherOrSpouse = '';
      state.unmaskedAadhaarNo = null;
    },
    aadhaarCardTimeStampReducer: (state, action) => {
      state.aadhaarCardTimeStamp = action.payload;
    },
    fatherOrSpouseReducer: (state, action) => {
      state.fatherOrSpouse = action.payload;
    },
    resendReducer: (state, action) => {
      state.resend = action.payload;
    },
    unmaskedAadhaarNoReducer: (state, action) => {
      state.unmaskedAadhaarNo = action.payload;
    },
  },
});

export const {
  bankDetailsReducer,
  aadhaarCardTimeStampReducer,
  fatherOrSpouseReducer,
  resendReducer,
  unmaskedAadhaarNoReducer,
  customerlogoutReducer
} = customerCreation.actions;

export default customerCreation.reducer;
