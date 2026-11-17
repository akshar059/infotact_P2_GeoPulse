import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import KeplerGl from '@kepler.gl/components';
import store from '../../store';

const SpatialMapViewer = ({ mapId = 'geopulse-map' }) => {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Provider store={store}>
      <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
        <KeplerGl
          id={mapId}
          width={dimensions.width}
          height={dimensions.height}
        />
      </div>
    </Provider>
  );
};

export default SpatialMapViewer;