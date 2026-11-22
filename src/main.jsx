if (import.meta.env.DEV) {
  const originalError = console.error;
  const originalWarn = console.warn;

  const ignoredPatterns = [
    'Accessing element.ref was removed in React 19',
    "Cannot register modal instance that's already open",
    'Mapbox Token not valid',
    'Binding weightsTexture not set',
    "several instances of 'styled-components'",
  ];

  console.error = (...args) => {
    const msg = args.map(String).join(' ');
    if (ignoredPatterns.some((p) => msg.includes(p))) return;
    originalError(...args);
  };

  console.warn = (...args) => {
    const msg = args.map(String).join(' ');
    if (ignoredPatterns.some((p) => msg.includes(p))) return;
    originalWarn(...args);
  };
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store';
import SpatialMapViewer from './components/map/SpatialMapViewer';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <SpatialMapViewer />
    </Provider>
  </React.StrictMode>
);