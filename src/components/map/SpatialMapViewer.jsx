// Core spatial map container layout for rendering Kepler.gl layers and footfall heatmaps.
import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import KeplerGl from '@kepler.gl/components';
import store from '../../store';

const SpatialMapViewer = ({ mapId = 'geopulse-map', mapboxToken = '' }) => {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth - 320,
    height: window.innerHeight - 160
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: Math.max(600, window.innerWidth - 320),
        height: Math.max(450, window.innerHeight - 160)
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Provider store={store}>
      <div className="spatial-map-wrapper" style={{ width: '100%', height: '100%' }}>
        <KeplerGl
          id={mapId}
          mapboxApiAccessToken={mapboxToken}
          width={dimensions.width}
          height={dimensions.height}
        />
      </div>
    </Provider>
  );
};

export default SpatialMapViewer;