import {
  Beef,
  Bird,
  Rabbit,
  Dog,
  Drumstick,
  ShieldAlert,
  BatteryLow,
  Moon,
  type LucideIcon,
} from "lucide-react";

export type AnimalType = "COW" | "SHEEP" | "GOAT" | "CHICKEN" | "HORSE" | "PIG";
export type AlertType = "BOUNDARY_EXIT" | "LOW_BATTERY" | "INACTIVITY";

export const ANIMAL_ICONS: Record<AnimalType, LucideIcon> = {
  COW: Beef,
  SHEEP: Dog,       // closest available - sheep silhouette
  GOAT: Rabbit,     // closest available
  CHICKEN: Bird,
  HORSE: Drumstick, // placeholder - lucide has limited animal icons
  PIG: Dog,         // placeholder
};

export const ANIMAL_LABELS: Record<AnimalType, string> = {
  COW: "Cow",
  SHEEP: "Sheep",
  GOAT: "Goat",
  CHICKEN: "Chicken",
  HORSE: "Horse",
  PIG: "Pig",
};

export const ALERT_ICONS: Record<AlertType, LucideIcon> = {
  BOUNDARY_EXIT: ShieldAlert,
  LOW_BATTERY: BatteryLow,
  INACTIVITY: Moon,
};

export const ALERT_LABELS: Record<AlertType, string> = {
  BOUNDARY_EXIT: "Boundary Exit",
  LOW_BATTERY: "Low Battery",
  INACTIVITY: "Inactivity",
};

export const STATUS_COLORS = {
  SAFE: "#00C896",
  WARNING: "#FFB020",
  ALERT: "#FF4757",
} as const;
