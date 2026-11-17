import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import keplerGlReducer from '@kepler.gl/reducers';

const reducers = combineReducers({
  keplerGl: keplerGlReducer
});

const middlewares = [];
const enhancers = [applyMiddleware(...middlewares)];

const store = createStore(reducers, {}, compose(...enhancers));

export default store;