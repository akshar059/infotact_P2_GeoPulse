import { configureStore } from '@reduxjs/toolkit';
import keplerGlReducer, { enhanceReduxMiddleware } from '@kepler.gl/reducers';

const customizedKeplerGlReducer = keplerGlReducer.initialState({
  mapState: {
    latitude: 19.0760,
    longitude: 72.8777,
    zoom: 11,
    pitch: 0,
    bearing: 0,
    dragRotate: true
  }
});

export const store = configureStore({
  reducer: {
    keplerGl: customizedKeplerGlReducer
  },
  middleware: (getDefaultMiddleware) =>
    enhanceReduxMiddleware(
      getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false
      })
    )
});

export default store;