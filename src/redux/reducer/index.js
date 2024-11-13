/* eslint-disable import/no-extraneous-dependencies */
import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const persistConfig = {
  key: 'root',
  storage,
};
const appReducer = combineReducers({
});

const rootReducer = (state, action) => appReducer(state, action);

export default persistReducer(persistConfig, (state, action) => rootReducer(state, action));
