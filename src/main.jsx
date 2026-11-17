import React from 'react';
import ReactDOM from 'react-dom/client';
import SpatialMapViewer from './components/map/SpatialMapViewer';
import './index.css'; // <--- Make sure this line is added

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SpatialMapViewer />
  </React.StrictMode>
);