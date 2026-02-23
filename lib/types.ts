export type AnimalType = "COW" | "SHEEP" | "GOAT" | "CHICKEN" | "HORSE" | "PIG";
export type AnimalStatus = "SAFE" | "WARNING" | "ALERT";
export type AlertType = "BOUNDARY_EXIT" | "LOW_BATTERY" | "INACTIVITY";

export interface Animal {
  id: string;
  name: string;
  tagId: string;
  type: AnimalType;
  status: AnimalStatus;
  battery: number;
  latitude: number;
  longitude: number;
  lastSeenAt: string;
}

export interface Farm {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  hectares: number | null;
  _count?: { animals: number };
}

export interface Alert {
  id: string;
  animalId: string;
  type: AlertType;
  message: string;
  resolved: boolean;
  createdAt: string;
}
