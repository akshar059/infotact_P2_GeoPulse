import React, { useEffect, useState } from 'react';
import KeplerGl from '@kepler.gl/components';
import { useDispatch } from 'react-redux';
import {
  updateMap,
  mapStyleChange,
  addDataToMap,
} from '@kepler.gl/actions';
import { getProcessedFootfallDataset } from '../../utils/spatialDataLoader';
import { createGeoPulseMapConfig } from '../../utils/mapConfig';

const CUSTOM_MAP_STYLES = [
  {
    id: 'carto_voyager',
    label: 'Carto Voyager (OSM)',
    url: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
    icon: 'https://carto.com/help/images/building-maps/basemaps/voyager_labels.png',
  },
  {
    id: 'carto_dark',
    label: 'Carto Dark Matter',
    url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    icon: 'https://carto.com/help/images/building-maps/basemaps/dark_labels.png',
  },
];

const mapStylesById = CUSTOM_MAP_STYLES.reduce((acc, style) => {
  acc[style.id] = style;
  return acc;
}, {});

const SpatialMapViewer = () => {
  const dispatch = useDispatch();
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 200);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const { center, payload } = getProcessedFootfallDataset();
    const dataId = payload.datasets.info.id;
    const mapConfig = createGeoPulseMapConfig(dataId, center);

    mapConfig.config.mapStyle.mapStyles = mapStylesById;

    dispatch(
      addDataToMap({
        ...payload,
        config: mapConfig,
      })
    );

    const styleTimer = setTimeout(() => {
      dispatch(mapStyleChange('carto_voyager'));
      dispatch(
        updateMap({
          latitude: center.latitude,
          longitude: center.longitude,
          zoom: center.zoom,
          pitch: 0,
          bearing: 0,
        })
      );
    }, 150);

    return () => clearTimeout(styleTimer);
  }, [dispatch]);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    >
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