import React, { useEffect, useState } from 'react';
import KeplerGl from '@kepler.gl/components';
import { useDispatch } from 'react-redux';
import { updateMap, mapStyleChange } from '@kepler.gl/actions';

const CUSTOM_MAP_STYLES = [
  {
    id: 'carto_voyager',
    label: 'Carto Voyager (OSM)',
    url: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
    icon: 'https://carto.com/help/images/building-maps/basemaps/voyager_labels.png'
  },
  {
    id: 'carto_dark',
    label: 'Carto Dark Matter',
    url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    icon: 'https://carto.com/help/images/building-maps/basemaps/dark_labels.png'
  }
];

const SpatialMapViewer = () => {
  const dispatch = useDispatch();
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth - 10,
    height: window.innerHeight - 10
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    // Trigger a delayed resize event to force Kepler WebGL canvas to paint tiles
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 200);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    dispatch(
      updateMap({
        latitude: 19.0760,
        longitude: 72.8777,
        zoom: 11,
        pitch: 0,
        bearing: 0
      })
    );
    dispatch(mapStyleChange('carto_voyager'));
  }, [dispatch]);

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden', position: 'absolute', top: 0, left: 0 }}>
      <KeplerGl
        id="map"
        mapboxApiAccessToken=""
        mapStyles={CUSTOM_MAP_STYLES}
        mapStylesReplaceDefault={true}
        width={dimensions.width}
        height={dimensions.height}
      />
    </div>
  );
};

export default SpatialMapViewer;