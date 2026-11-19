import { processRowObject } from '@kepler.gl/processors';
import { parseSpatialDataset, computeDataCenter } from './spatialParser';

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
    latitude: 18.9220,
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

export function getProcessedFootfallDataset(rawData = MUMBAI_FOOTFALL_DATA) {
  // Uses your existing untouched spatialParser.js functions
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