// store.js
import { createStore, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk'; // For async actions
import userReducer from './reducers';

const store = createStore(
  userReducer, 
  applyMiddleware(thunk),
  // Add Redux DevTools support
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;
