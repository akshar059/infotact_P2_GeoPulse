import { processRowObject, processGeojson } from '@kepler.gl/processors';
import { parseSpatialDataset, computeDataCenter } from './spatialParser';

export const CATCHMENT_DATASET_ID = 'bengaluru_catchment_500m';
export const FOOTFALL_DATASET_ID = 'bengaluru_retail_stores';
export const H3_GRID_DATASET_ID = 'bengaluru_h3_grid_res9';

export const BENGALURU_STORE_FALLBACK_DATA = [
  {
    id: 'STORE_001',
    store_name: 'Nexus Koramangala Mall',
    category: 'Mall & Entertainment',
    latitude: 12.9348,
    longitude: 77.6111,
    gross_area_sqft: 450000,
    value: 450000,
    timestamp: '2026-11-22 18:00:00',
  },
  {
    id: 'STORE_002',
    store_name: 'Decathlon Electronic City',
    category: 'Sports & Fitness',
    latitude: 12.8452,
    longitude: 77.6602,
    gross_area_sqft: 32000,
    value: 32000,
    timestamp: '2026-11-22 18:00:00',
  },
];

function createCirclePolygonGeoJSON(lng, lat, radiusMeters = 500, steps = 64) {
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

function splitCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseRetailStoresCsv(csvText) {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).map((line, index) => {
    const values = splitCsvLine(line);
    const row = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] ?? '';
    });

    const lat = Number(row.latitude);
    const lng = Number(row.longitude);
    const areaSqft = Number(row.gross_area_sqft);

    return {
      id: row.store_id || `STORE_${String(index + 1).padStart(3, '0')}`,
      store_name: row.store_name || `Store ${index + 1}`,
      category: row.category || 'Retail',
      latitude: Number.isFinite(lat) ? lat : 12.9716,
      longitude: Number.isFinite(lng) ? lng : 77.5946,
      gross_area_sqft: Number.isFinite(areaSqft) ? areaSqft : 0,
      value: Number.isFinite(areaSqft) ? areaSqft : 0,
      timestamp: '2026-11-22 18:00:00',
    };
  });
}

function sanitizeH3Rows(rows) {
  if (!Array.isArray(rows)) return [];
  return rows
    .filter((row) => row && typeof row.hex_id === 'string' && row.hex_id.trim().length > 0)
    .map((row) => ({
      hex_id: row.hex_id.trim(),
      ping_count: Number.isFinite(Number(row.ping_count)) ? Number(row.ping_count) : 0,
      unique_visitors: Number.isFinite(Number(row.unique_visitors))
        ? Number(row.unique_visitors)
        : 0,
      store_id: row.store_id ? String(row.store_id) : 'OUTSIDE',
    }));
}

export function buildCatchmentGeoJson(
  rawData = BENGALURU_STORE_FALLBACK_DATA,
  radiusMeters = 500
) {
  const safeRows = Array.isArray(rawData) ? rawData : [];
  return {
    type: 'FeatureCollection',
    features: safeRows.map((row) => ({
      type: 'Feature',
      geometry: createCirclePolygonGeoJSON(
        Number(row.longitude),
        Number(row.latitude),
        radiusMeters
      ),
      properties: {
        id: row.id,
        store_id: row.id,
        store_name: row.store_name,
        category: row.category,
        gross_area_sqft: Number(row.gross_area_sqft) || 0,
        value: Number(row.value) || 0,
        radius_m: radiusMeters,
        timestamp: row.timestamp,
      },
    })),
  };
}

export function getProcessedCatchmentDataset(
  rawData = BENGALURU_STORE_FALLBACK_DATA,
  radiusMeters = 500,
  externalGeoJson = null
) {
  const featureCollection =
    externalGeoJson &&
    externalGeoJson.type === 'FeatureCollection' &&
    Array.isArray(externalGeoJson.features) &&
    externalGeoJson.features.length > 0
      ? externalGeoJson
      : buildCatchmentGeoJson(rawData, radiusMeters);

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

export function getProcessedFootfallDataset(
  rawData = BENGALURU_STORE_FALLBACK_DATA
) {
  if (!Array.isArray(rawData) || rawData.length === 0) {
    throw new Error('No retail store records available to render.');
  }

  const parsedPoints = parseSpatialDataset(rawData);
  if (!Array.isArray(parsedPoints) || parsedPoints.length === 0) {
    throw new Error('Parsed retail store dataset is empty.');
  }

  const center = computeDataCenter(parsedPoints);
  const processedData = processRowObject(parsedPoints);

  return {
    center,
    recordCount: parsedPoints.length,
    payload: {
      datasets: {
        info: {
          label: 'Bengaluru Retail Stores',
          id: FOOTFALL_DATASET_ID,
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

export function getProcessedH3GridDataset(h3Rows = []) {
  const cleanRows = sanitizeH3Rows(h3Rows);
  if (cleanRows.length === 0) return null;

  return {
    hexCount: cleanRows.length,
    payload: {
      datasets: {
        info: {
          label: 'H3 Spatial Grid (Res 9)',
          id: H3_GRID_DATASET_ID,
        },
        data: processRowObject(cleanRows),
      },
      options: {
        centerMap: false,
        readOnly: false,
      },
    },
  };
}

export async function loadGeoPulseDatasets({ radiusMeters = 500, signal } = {}) {
  let sourceRows = BENGALURU_STORE_FALLBACK_DATA;
  let externalGeoJson = null;
  let h3Rows = [];
  let sourceLabel = 'Built-in Bengaluru Store Dataset';

  try {
    const [csvRes, geoRes, h3Res] = await Promise.allSettled([
      fetch('/data/raw/retail_stores.csv', { signal }),
      fetch('/data/raw/retail_stores_catchment_500m.geojson', { signal }),
      fetch('/data/h3_grid_summary.json', { signal }),
    ]);

    if (csvRes.status === 'fulfilled' && csvRes.value.ok) {
      const csvText = await csvRes.value.text();
      const parsedCsv = parseRetailStoresCsv(csvText);
      if (parsedCsv.length > 0) {
        sourceRows = parsedCsv;
        sourceLabel = 'data/raw/retail_stores.csv';
      }
    }

    if (geoRes.status === 'fulfilled' && geoRes.value.ok) {
      const geoJsonData = await geoRes.value.json();
      if (
        geoJsonData?.type === 'FeatureCollection' &&
        Array.isArray(geoJsonData.features) &&
        geoJsonData.features.length > 0
      ) {
        externalGeoJson = geoJsonData;
      }
    }

    if (h3Res.status === 'fulfilled' && h3Res.value.ok) {
      const h3Json = await h3Res.value.json();
      if (Array.isArray(h3Json)) {
        h3Rows = h3Json;
      }
    }
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw err;
    }
  }

  const footfallResult = getProcessedFootfallDataset(sourceRows);
  const catchmentPayload = getProcessedCatchmentDataset(
    sourceRows,
    radiusMeters,
    externalGeoJson
  );
  const h3Result = getProcessedH3GridDataset(h3Rows);

  return {
    center: footfallResult.center,
    recordCount: footfallResult.recordCount,
    h3Count: h3Result?.hexCount || 0,
    sourceLabel,
    footfallPayload: footfallResult.payload,
    catchmentPayload,
    h3Payload: h3Result?.payload || null,
  };
}