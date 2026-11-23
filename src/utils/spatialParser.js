export function parseSpatialDataset(rawData = []) {
  if (!Array.isArray(rawData)) return [];

  return rawData
    .map((row, index) => {
      if (!row || typeof row !== 'object') return null;

      const lat = Number(row.latitude ?? row.lat);
      const lng = Number(row.longitude ?? row.lng ?? row.lon);

      if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng) ||
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180
      ) {
        return null;
      }

      const rawValue = Number(row.value ?? row.metric ?? 0);
      const value = Number.isFinite(rawValue) ? rawValue : 0;

      return {
        id: row.id ?? row.store_id ?? `point-${index}`,
        store_name: row.store_name ?? null,
        lat,
        lng,
        value,
        category: row.category ?? 'Uncategorized',
        timestamp: row.timestamp ?? null,
      };
    })
    .filter(Boolean);
}

export function computeDataCenter(parsedPoints = []) {
  if (!Array.isArray(parsedPoints) || parsedPoints.length === 0) {
    return { latitude: 20.5937, longitude: 78.9629, zoom: 4 };
  }

  let latSum = 0;
  let lngSum = 0;
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  for (const pt of parsedPoints) {
    latSum += pt.lat;
    lngSum += pt.lng;
    if (pt.lat < minLat) minLat = pt.lat;
    if (pt.lat > maxLat) maxLat = pt.lat;
    if (pt.lng < minLng) minLng = pt.lng;
    if (pt.lng > maxLng) maxLng = pt.lng;
  }

  const spread = Math.max(maxLat - minLat, maxLng - minLng);
  let zoom = 11;
  if (spread > 1.0) zoom = 8;
  else if (spread > 0.35) zoom = 10;
  else if (spread > 0.12) zoom = 11;
  else if (parsedPoints.length > 1) zoom = 12;

  return {
    latitude: latSum / parsedPoints.length,
    longitude: lngSum / parsedPoints.length,
    zoom,
  };
}