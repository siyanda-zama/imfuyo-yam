const EARTH_RADIUS_M = 6371000;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Returns distance in meters between two lat/lng points using the Haversine formula */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_M * c;
}

/** Check if an animal's position is outside the farm geo-fence */
export function isOutsideBoundary(
  animalLat: number,
  animalLng: number,
  farmLat: number,
  farmLng: number,
  radiusMeters: number
): boolean {
  return haversineDistance(animalLat, animalLng, farmLat, farmLng) > radiusMeters;
}

/** Generate a circle of lat/lng points around a center for map rendering */
export function generateCircleCoords(
  centerLat: number,
  centerLng: number,
  radiusMeters: number,
  points: number = 64
): [number, number][] {
  const coords: [number, number][] = [];
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const dx = radiusMeters * Math.cos(angle);
    const dy = radiusMeters * Math.sin(angle);
    const lat = centerLat + (dy / EARTH_RADIUS_M) * (180 / Math.PI);
    const lng =
      centerLng +
      (dx / (EARTH_RADIUS_M * Math.cos(toRad(centerLat)))) * (180 / Math.PI);
    coords.push([lng, lat]);
  }
  return coords;
}

/** Convert a circular radius in meters to approximate hectares */
export function radiusToHectares(radiusMeters: number): number {
  const areaM2 = Math.PI * radiusMeters * radiusMeters;
  return Math.round((areaM2 / 10000) * 100) / 100;
}
