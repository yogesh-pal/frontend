import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  existingUser: {},
  externalUser: {},
};

export const userManagement = createSlice({
  name: 'userManagement',
  initialState,
  reducers: {
    existingUserDetails: (state, action) => {
      state.existingUser = action.payload;
    },
    externalUserDetails: (state, action) => {
      state.externalUser = action.payload;
    }
  },
});

export const { existingUserDetails, externalUserDetails } = userManagement.actions;

export default userManagement.reducer;
