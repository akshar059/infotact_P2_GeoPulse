import { processRowObject, processGeojson } from '@kepler.gl/processors';
import { parseSpatialDataset, computeDataCenter } from './spatialParser';

export const CATCHMENT_DATASET_ID = 'mumbai_catchment_500m';

export const MUMBAI_FOOTFALL_DATA = [
  {
    id: 'MUM_001',
    store_name: 'Bandra Linking Road Flagship',
    category: 'Western Suburbs',
    latitude: 19.0607,
    longitude: 72.8362,
    value: 1420,
    timestamp: '2026-11-19 18:00:00',
  },
  {
    id: 'MUM_002',
    store_name: 'Lower Parel High Street',
    category: 'South Mumbai',
    latitude: 18.9953,
    longitude: 72.8266,
    value: 1890,
    timestamp: '2026-11-19 19:00:00',
  },
  {
    id: 'MUM_003',
    store_name: 'BKC Corporate Plaza',
    category: 'Central Suburbs',
    latitude: 19.0674,
    longitude: 72.8675,
    value: 1650,
    timestamp: '2026-11-19 13:00:00',
  },
  {
    id: 'MUM_004',
    store_name: 'Andheri West Lokhandwala',
    category: 'Western Suburbs',
    latitude: 19.1416,
    longitude: 72.8262,
    value: 1310,
    timestamp: '2026-11-19 20:00:00',
  },
  {
    id: 'MUM_005',
    store_name: 'Powai Galleria Hub',
    category: 'Eastern Suburbs',
    latitude: 19.1197,
    longitude: 72.9051,
    value: 1180,
    timestamp: '2026-11-19 17:00:00',
  },
  {
    id: 'MUM_006',
    store_name: 'Colaba Causeway Heritage',
    category: 'South Mumbai',
    latitude: 18.922,
    longitude: 72.8347,
    value: 1540,
    timestamp: '2026-11-19 16:00:00',
  },
  {
    id: 'MUM_007',
    store_name: 'Vashi Inorbit Sector 30',
    category: 'Navi Mumbai',
    latitude: 19.0658,
    longitude: 73.0012,
    value: 1260,
    timestamp: '2026-11-19 18:30:00',
  },
  {
    id: 'MUM_008',
    store_name: 'Thane Viviana Mall',
    category: 'Thane',
    latitude: 19.2089,
    longitude: 72.9718,
    value: 1720,
    timestamp: '2026-11-19 19:30:00',
  },
];

function createCirclePolygonGeoJSON(lng, lat, radiusMeters = 500, steps = 48) {
  const earthRadius = 6371000;
  const angularDistance = radiusMeters / earthRadius;
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;
  const ring = [];

  for (let i = 0; i <= steps; i++) {
    const bearing = (2 * Math.PI * i) / steps;
    const destLatRad = Math.asin(
      Math.sin(latRad) * Math.cos(angularDistance) +
        Math.cos(latRad) * Math.sin(angularDistance) * Math.cos(bearing)
    );
    const destLngRad =
      lngRad +
      Math.atan2(
        Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(latRad),
        Math.cos(angularDistance) - Math.sin(latRad) * Math.sin(destLatRad)
      );

    ring.push([(destLngRad * 180) / Math.PI, (destLatRad * 180) / Math.PI]);
  }

  return {
    type: 'Polygon',
    coordinates: [ring],
  };
}

export function buildCatchmentGeoJson(
  rawData = MUMBAI_FOOTFALL_DATA,
  radiusMeters = 500
) {
  return {
    type: 'FeatureCollection',
    features: rawData.map((row) => ({
      type: 'Feature',
      geometry: createCirclePolygonGeoJSON(
        Number(row.longitude),
        Number(row.latitude),
        radiusMeters
      ),
      properties: {
        id: row.id,
        store_name: row.store_name,
        category: row.category,
        value: Number(row.value),
        radius_m: radiusMeters,
        timestamp: row.timestamp,
      },
    })),
  };
}

export function getProcessedCatchmentDataset(
  rawData = MUMBAI_FOOTFALL_DATA,
  radiusMeters = 500
) {
  const featureCollection = buildCatchmentGeoJson(rawData, radiusMeters);
  const processedGeojson = processGeojson(featureCollection);

  return {
    datasets: {
      info: {
        label: '500m Store Catchments',
        id: CATCHMENT_DATASET_ID,
      },
      data: processedGeojson,
    },
    options: {
      centerMap: false,
      readOnly: false,
    },
  };
}

export function getProcessedFootfallDataset(rawData = MUMBAI_FOOTFALL_DATA) {
  const parsedPoints = parseSpatialDataset(rawData);
  const center = computeDataCenter(parsedPoints);
  const processedData = processRowObject(parsedPoints);

  return {
    center,
    payload: {
      datasets: {
        info: {
          label: 'Mumbai Retail Footfall',
          id: 'mumbai_footfall_data',
        },
        data: processedData,
      },
      options: {
        centerMap: false,
        readOnly: false,
      },
    },
  };
}