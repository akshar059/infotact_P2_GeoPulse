import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import KeplerGl from '@kepler.gl/components';
import { useDispatch } from 'react-redux';
import { addDataToMap } from '@kepler.gl/actions';
import {
  loadGeoPulseDatasets,
  FOOTFALL_DATASET_ID,
  CATCHMENT_DATASET_ID,
} from '../../utils/spatialDataLoader';
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

const MAP_STYLES_BY_ID = CUSTOM_MAP_STYLES.reduce((acc, style) => {
  acc[style.id] = style;
  return acc;
}, {});

const VIEWER_CONTAINER_STYLE = {
  width: '100vw',
  height: '100vh',
  margin: 0,
  padding: 0,
  overflow: 'hidden',
  position: 'relative',
  top: 0,
  left: 0,
};

const OVERLAY_STYLE = {
  position: 'absolute',
  inset: 0,
  zIndex: 20,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(15, 23, 42, 0.72)',
  color: '#f8fafc',
  gap: '12px',
  padding: '24px',
  textAlign: 'center',
};

const RETRY_BUTTON_STYLE = {
  padding: '8px 16px',
  borderRadius: '6px',
  border: 'none',
  backgroundColor: '#2563eb',
  color: '#ffffff',
  cursor: 'pointer',
  fontWeight: 600,
};

const STATUS_BADGE_STYLE = {
  position: 'absolute',
  bottom: '12px',
  left: '12px',
  zIndex: 10,
  backgroundColor: 'rgba(15, 23, 42, 0.82)',
  color: '#e2e8f0',
  padding: '6px 10px',
  borderRadius: '6px',
  fontSize: '12px',
  pointerEvents: 'none',
};

const SpatialMapViewer = () => {
  const dispatch = useDispatch();
  const controllerRef = useRef(null);

  const [dimensions, setDimensions] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [metaInfo, setMetaInfo] = useState({
    recordCount: 0,
    sourceLabel: '',
    loadTimeMs: 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const executeLoad = useCallback(async () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    const controller = new AbortController();
    controllerRef.current = controller;
    const { signal } = controller;

    setStatus('loading');
    setErrorMessage('');
    const startPerf = performance.now();

    try {
      const result = await loadGeoPulseDatasets({
        radiusMeters: 500,
        signal,
      });

      if (signal.aborted) return;

      if (!result || result.recordCount === 0) {
        setMetaInfo({
          recordCount: 0,
          sourceLabel: result?.sourceLabel || '',
          loadTimeMs: Math.round(performance.now() - startPerf),
        });
        setStatus('empty');
        return;
      }

      const { center, recordCount, sourceLabel, footfallPayload, catchmentPayload } =
        result;

      const dataId = footfallPayload?.datasets?.info?.id || FOOTFALL_DATASET_ID;
      const catchmentDataId =
        catchmentPayload?.datasets?.info?.id || CATCHMENT_DATASET_ID;

      const mapConfig = createGeoPulseMapConfig(
        dataId,
        {
          latitude: center?.latitude,
          longitude: center?.longitude,
          zoom: center?.zoom,
        },
        catchmentDataId
      );

      mapConfig.config.mapStyle.styleType = 'carto_voyager';
      mapConfig.config.mapStyle.mapStyles = MAP_STYLES_BY_ID;

      dispatch(
        addDataToMap({
          datasets: [footfallPayload.datasets, catchmentPayload.datasets],
          config: mapConfig,
          options: {
            centerMap: false,
            readOnly: false,
          },
        })
      );

      setMetaInfo({
        recordCount,
        sourceLabel,
        loadTimeMs: Math.round(performance.now() - startPerf),
      });
      setStatus('succeeded');
    } catch (err) {
      if (err?.name === 'AbortError' || signal.aborted) return;
      setErrorMessage(
        err?.message || 'Unable to load Bengaluru spatial dataset.'
      );
      setStatus('failed');
    }
  }, [dispatch]);

  useEffect(() => {
    executeLoad();
    return () => {
      controllerRef.current?.abort();
    };
  }, [executeLoad]);

  const keplerProps = useMemo(
    () => ({
      id: 'map',
      mapboxApiAccessToken: '',
      mapStyles: CUSTOM_MAP_STYLES,
      mapStylesReplaceDefault: true,
      width: dimensions.width,
      height: dimensions.height,
    }),
    [dimensions.width, dimensions.height]
  );

  return (
    <div style={VIEWER_CONTAINER_STYLE}>
      {status === 'loading' && (
        <div style={OVERLAY_STYLE} role="status" aria-live="polite">
          <div>Loading Bengaluru retail stores &amp; 500m catchments...</div>
        </div>
      )}

      {status === 'empty' && (
        <div style={OVERLAY_STYLE} role="status">
          <div>No retail store records found to display on the map.</div>
          <button type="button" style={RETRY_BUTTON_STYLE} onClick={executeLoad}>
            Reload Data
          </button>
        </div>
      )}

      {status === 'failed' && (
        <div style={OVERLAY_STYLE} role="alert">
          <div>Failed to load map data: {errorMessage}</div>
          <button type="button" style={RETRY_BUTTON_STYLE} onClick={executeLoad}>
            Retry
          </button>
        </div>
      )}

      <KeplerGl {...keplerProps} />

      {status === 'succeeded' && metaInfo.recordCount > 0 && (
        <div style={STATUS_BADGE_STYLE}>
          Stores: {metaInfo.recordCount} | Source: {metaInfo.sourceLabel} | Load:{' '}
          {metaInfo.loadTimeMs}ms
        </div>
      )}
    </div>
  );
};

export default SpatialMapViewer;