import { createStore, applyMiddleware, Store, compose, Middleware } from 'redux'
import { routerMiddleware } from 'react-router-redux';
import { rootReducer, IAppStore } from '../reducers';
import rootSaga from '../sagas';
import createSagaMiddleware, { END } from 'redux-saga';

const configureStore = (initialState: IAppStore, history: any) => {
  const sagaMiddleware = createSagaMiddleware();
  const middlewares: Middleware[] = [sagaMiddleware, routerMiddleware(history)];

  if (process.env.NODE_ENV === `development`) {
    const { logger } = require(`redux-logger`);

    middlewares.push(logger);
  }

  let store: any = createStore(
    rootReducer,
    initialState,
    compose(applyMiddleware(...middlewares)),
  )

  store.runSaga = sagaMiddleware.run;
  store.close = () => store.dispatch(END);

  return store;
}

export default configureStore;
