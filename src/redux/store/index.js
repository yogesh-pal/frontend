/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import { encryptTransform } from 'redux-persist-transform-encrypt';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import loginReducer from '../reducer/login';
import userManagementReducer from '../reducer/userManagement';
import customerCreationReducer from '../reducer/customerCreation';
import loanMakerReducer from '../reducer/loanMaker';

// import counterReducer from '../features/counter/counterSlice';

const reducers = combineReducers({
  user: loginReducer,
  userManagement: userManagementReducer,
  customerCreation: customerCreationReducer,
  loanMaker: loanMakerReducer
});

const myEncryptor = encryptTransform({
  secretKey: 'CAPRI-GLOBAL-GOLD-LOAN-SECRET-KEY',
  onError(error) {
    // Handle the error.
    console.log('inside error funciton inside transform in redux store', error);
  },
});

const persistConfig = {
  key: 'root',
  storage,
  transforms: [myEncryptor],
};

const listenerMiddleware = createListenerMiddleware();
// update api return here
// listenerMiddleware.startListening({
//   // eslint-disable-next-line import/no-named-as-default-member
//   actionCreator: updateLeadDetailInfo,
//   effect: async (action, listenerApi) => {
//     console.log('listenerApi.getOriginalState()', listenerApi.getOriginalState());
//     console.log('action', action);
//     await listenerApi.delay(2000);
//     const updateState = listenerApi.getState();
//     console.log('listenerApi.getState()', updateState?.leadDetails?.leadDetails);
//   },
// });

const persistedReducer = persistReducer(persistConfig, reducers);

const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== 'production',
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(listenerMiddleware.middleware),

});

export default store;
