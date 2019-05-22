import { applyMiddleware, combineReducers, createStore } from 'redux';
import { composeWithDevTools } from 'remote-redux-devtools';
import thunk from 'redux-thunk';

import { kubevirtReducer } from '../../utils/redux';

const reducers = combineReducers({
  kubevirt: kubevirtReducer,
});

const isProduction = process.env.NODE_ENV === 'production';

const store = createStore(
  reducers,
  {},
  isProduction ? applyMiddleware(thunk) : composeWithDevTools(applyMiddleware(thunk))
);
export default store;

// eslint-disable-next-line no-undef
if (!isProduction) {
  // Expose Redux store for debugging
  window.store = store;
}
