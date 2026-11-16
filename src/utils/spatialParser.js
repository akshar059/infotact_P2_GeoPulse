// src/utils/spatialParser.js

export function parseSpatialDataset(rawData = []) {
  if (!Array.isArray(rawData)) return [];

  return rawData
    .map((row, index) => {
      const lat = parseFloat(row.latitude ?? row.lat);
      const lng = parseFloat(row.longitude ?? row.lng ?? row.lon);

      // Invalid coordinates skip karne ke liye
      if (
        Number.isNaN(lat) ||
        Number.isNaN(lng) ||
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180
      ) {
        return null;
      }

      return {
        id: row.id ?? `point-${index}`,
        lat,
        lng,
        value: Number(row.value ?? row.metric ?? 0),
        category: row.category ?? 'Uncategorized',
        timestamp: row.timestamp ?? null,
      };
    })
    .filter(Boolean);
}

export function computeDataCenter(parsedPoints = []) {
  if (parsedPoints.length === 0) {
    return { latitude: 20.5937, longitude: 78.9629, zoom: 4 };
  }

  const total = parsedPoints.reduce(
    (acc, pt) => {
      acc.lat += pt.lat;
      acc.lng += pt.lng;
      return acc;
    },
    { lat: 0, lng: 0 }
  );

  return {
    latitude: total.lat / parsedPoints.length,
    longitude: total.lng / parsedPoints.length,
    zoom: 10,
  };
}