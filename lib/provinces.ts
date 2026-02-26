export function getProvince(lat: number, lng: number): string {
  if (lat < -30 && lng > 27 && lng < 30) return 'Eastern Cape';
  if (lat > -30 && lat < -27 && lng > 29 && lng < 33) return 'KwaZulu-Natal';
  if (lat > -31 && lat < -28 && lng > 24 && lng < 28) return 'Free State';
  if (lat > -27 && lat < -24 && lng > 29 && lng < 32) return 'Mpumalanga';
  if (lat > -25 && lng > 28 && lng < 31) return 'Limpopo';
  if (lat > -29 && lat < -27 && lng > 29 && lng < 31) return 'KwaZulu-Natal';
  return 'Other';
}

export const SA_PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
  'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape',
] as const;

export const FMD_SYMPTOMS = [
  { key: 'blisters_mouth', label: 'Blisters/ulcers on tongue, gums, lips', icon: 'mouth' },
  { key: 'blisters_hooves', label: 'Blisters between/above hooves', icon: 'foot' },
  { key: 'blisters_teats', label: 'Blisters on teats', icon: 'circle' },
  { key: 'lameness', label: 'Limping, reluctance to move', icon: 'walk' },
  { key: 'drooling', label: 'Excessive salivation/drooling', icon: 'droplet' },
  { key: 'fever', label: 'High temperature/fever', icon: 'thermometer' },
  { key: 'weight_loss', label: 'Rapid weight loss', icon: 'trending-down' },
  { key: 'milk_drop', label: 'Sudden decrease in milk production', icon: 'milk' },
  { key: 'depression', label: 'Lethargy, depression', icon: 'moon' },
  { key: 'young_mortality', label: 'Deaths in young calves/lambs', icon: 'alert' },
] as const;

export const FMD_SUSCEPTIBLE_TYPES = ['COW', 'SHEEP', 'GOAT', 'PIG'] as const;

export type FmdSymptomKey = typeof FMD_SYMPTOMS[number]['key'];
