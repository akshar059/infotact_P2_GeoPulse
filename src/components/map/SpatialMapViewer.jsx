import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import KeplerGl from '@kepler.gl/components';
import { useDispatch } from 'react-redux';
import { addDataToMap, layerConfigChange, updateMap } from '@kepler.gl/actions';
import {
  loadGeoPulseDatasets,
  FOOTFALL_DATASET_ID,
  CATCHMENT_DATASET_ID,
  H3_GRID_DATASET_ID,
} from '../../utils/spatialDataLoader';
import { createGeoPulseMapConfig } from '../../utils/mapConfig';

const H3_LAYER_ID = 'geopulse_h3_grid_res9';

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

const QUICK_CONTROLS_STYLE = {
  position: 'absolute',
  bottom: '12px',
  right: '12px',
  zIndex: 10,
  display: 'flex',
  gap: '6px',
  backgroundColor: 'rgba(15, 23, 42, 0.86)',
  padding: '6px',
  borderRadius: '8px',
  border: '1px solid rgba(148, 163, 184, 0.25)',
};

const getControlButtonStyle = (active) => ({
  padding: '5px 10px',
  borderRadius: '6px',
  border: '1px solid rgba(148, 163, 184, 0.35)',
  backgroundColor: active ? '#2563eb' : 'rgba(30, 41, 59, 0.9)',
  color: '#f8fafc',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
});

const SpatialMapViewer = () => {
  const dispatch = useDispatch();
  const controllerRef = useRef(null);
  const defaultCenterRef = useRef({
    latitude: 12.9279,
    longitude: 77.6271,
    zoom: 11,
  });

  const [dimensions, setDimensions] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [is3DMode, setIs3DMode] = useState(true);
  const [h3Visible, setH3Visible] = useState(true);
  const [metaInfo, setMetaInfo] = useState({
    recordCount: 0,
    h3Count: 0,
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
          h3Count: 0,
          sourceLabel: result?.sourceLabel || '',
          loadTimeMs: Math.round(performance.now() - startPerf),
        });
        setStatus('empty');
        return;
      }

      const {
        center,
        recordCount,
        h3Count = 0,
        sourceLabel,
        footfallPayload,
        catchmentPayload,
        h3Payload,
      } = result;

      defaultCenterRef.current = {
        latitude: center?.latitude ?? 12.9279,
        longitude: center?.longitude ?? 77.6271,
        zoom: center?.zoom ?? 11,
      };

      const dataId = footfallPayload?.datasets?.info?.id || FOOTFALL_DATASET_ID;
      const catchmentDataId =
        catchmentPayload?.datasets?.info?.id || CATCHMENT_DATASET_ID;
      const h3DataId = h3Payload?.datasets?.info?.id || H3_GRID_DATASET_ID;

      const mapConfig = createGeoPulseMapConfig(
        dataId,
        {
          latitude: center?.latitude,
          longitude: center?.longitude,
          zoom: center?.zoom,
          pitch: is3DMode ? 38 : 0,
          mapViewMode: is3DMode ? 'MODE_3D' : 'MODE_2D',
        },
        catchmentDataId,
        h3DataId
      );

      mapConfig.config.mapStyle.styleType = 'carto_voyager';
      mapConfig.config.mapStyle.mapStyles = MAP_STYLES_BY_ID;

      const datasetsToAdd = [footfallPayload.datasets, catchmentPayload.datasets];
      if (h3Payload?.datasets) {
        datasetsToAdd.push(h3Payload.datasets);
      }

      dispatch(
        addDataToMap({
          datasets: datasetsToAdd,
          config: mapConfig,
          options: {
            centerMap: false,
            readOnly: false,
          },
        })
      );

      setMetaInfo({
        recordCount,
        h3Count,
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
  }, [dispatch, is3DMode]);

  useEffect(() => {
    executeLoad();
    return () => {
      controllerRef.current?.abort();
    };
  }, [executeLoad]);

  const handleToggle3D = useCallback(() => {
    setIs3DMode((prev) => {
      const next3D = !prev;
      dispatch(
        updateMap({
          pitch: next3D ? 38 : 0,
          bearing: 0,
          mapViewMode: next3D ? 'MODE_3D' : 'MODE_2D',
        })
      );
      return next3D;
    });
  }, [dispatch]);

  const handleToggleH3Layer = useCallback(() => {
    setH3Visible((prev) => {
      const nextVisible = !prev;
      dispatch(
        layerConfigChange(
          { id: H3_LAYER_ID },
          {
            isVisible: nextVisible,
            visConfig: {
              enable3d: is3DMode && nextVisible,
            },
          }
        )
      );
      return nextVisible;
    });
  }, [dispatch, is3DMode]);

  const handleResetCamera = useCallback(() => {
    dispatch(
      updateMap({
        latitude: defaultCenterRef.current.latitude,
        longitude: defaultCenterRef.current.longitude,
        zoom: defaultCenterRef.current.zoom,
        pitch: is3DMode ? 38 : 0,
        bearing: 0,
        mapViewMode: is3DMode ? 'MODE_3D' : 'MODE_2D',
      })
    );
  }, [dispatch, is3DMode]);

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
        <>
          <div style={STATUS_BADGE_STYLE}>
            Stores: {metaInfo.recordCount} | H3 Cells: {metaInfo.h3Count} | Source:{' '}
            {metaInfo.sourceLabel} | Load: {metaInfo.loadTimeMs}ms
          </div>

          <div style={QUICK_CONTROLS_STYLE} role="group" aria-label="Map quick controls">
            <button
              type="button"
              style={getControlButtonStyle(is3DMode)}
              onClick={handleToggle3D}
            >
              {is3DMode ? '3D View' : '2D View'}
            </button>
            <button
              type="button"
              style={getControlButtonStyle(h3Visible)}
              onClick={handleToggleH3Layer}
            >
              {h3Visible ? 'H3 Grid: On' : 'H3 Grid: Off'}
            </button>
            <button
              type="button"
              style={getControlButtonStyle(false)}
              onClick={handleResetCamera}
            >
              Reset View
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SpatialMapViewer;