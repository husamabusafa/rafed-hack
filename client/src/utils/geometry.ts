export type LonLat = [number, number];

const inBounds = (coords: LonLat[]): boolean => {
  if (!coords || coords.length === 0) return false;
  for (const [lon, lat] of coords) {
    if (!(lon > 34 && lon < 56 && lat > 15 && lat < 33)) return false;
  }
  return true;
};

export const decodePolyline = (encoded: string, factor: number = 1e5): LonLat[] => {
  if (!encoded) return [];
  const points: LonLat[] = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let b: number, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
    lat += dlat;
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
    lng += dlng;
    points.push([lng / factor, lat / factor]);
  }
  return points;
};

export const parseRouteGeometry = (geometry: string): LonLat[] => {
  if (!geometry) return [];
  const raw = String(geometry).trim();

  if (raw.startsWith('[') || raw.startsWith('{')) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0 && Array.isArray((parsed as unknown[])[0])) {
        const coords: LonLat[] = (parsed as unknown[]).map((p) => {
          const pair = p as unknown[];
          return [Number(pair[0]), Number(pair[1])] as LonLat;
        });
        if (inBounds(coords)) return coords;
      } else if (typeof parsed === 'object' && parsed !== null) {
        const obj = parsed as { type?: unknown; coordinates?: unknown };
        if (obj.type === 'LineString' && Array.isArray(obj.coordinates)) {
          const coords: LonLat[] = (obj.coordinates as unknown[]).map((p) => {
            const pair = p as unknown[];
            return [Number(pair[0]), Number(pair[1])] as LonLat;
          });
          if (inBounds(coords)) return coords;
        }
      }
    } catch {
      /* no-op */
    }
  }

  if (raw.startsWith('LINESTRING')) {
    const match = raw.match(/LINESTRING\s*\((.*)\)/i);
    if (match && match[1]) {
      const coords: LonLat[] = match[1].split(',').map(pair => {
        const parts = pair.trim().split(/\s+/).map(Number);
        return [parts[0], parts[1]] as LonLat;
      });
      if (inBounds(coords)) return coords;
    }
  }

  const tryPoly5 = decodePolyline(raw, 1e5);
  if (inBounds(tryPoly5)) return tryPoly5;
  const tryPoly6 = decodePolyline(raw, 1e6);
  if (inBounds(tryPoly6)) return tryPoly6;
  const swapped: LonLat[] = tryPoly5.map(([lon, lat]) => [lat, lon] as LonLat);
  if (inBounds(swapped)) return swapped;
  return tryPoly5;
};
