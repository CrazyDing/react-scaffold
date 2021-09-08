// This file merely configures the store for hot reloading.
// This boilerplate file is likely to be the same for each project that uses Redux.
// With Redux, the actual stores are in /reducers.

import { createStore, applyMiddleware } from 'redux';
import rootReducer from '../reducers';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { createBrowserHistory } from 'history';
import { routerMiddleware } from 'react-router-redux';

const loggerMiddleware = createLogger();
const router = routerMiddleware(createBrowserHistory());

export default function configureStore() {
  const store = createStore(
    rootReducer,
    applyMiddleware(
      thunk,
      loggerMiddleware,
      router
    )
  );

  return store;
};
