"use client";

import { useMemo, useCallback, useRef, useEffect, lazy, Suspense } from "react";
import Map, { Marker, Source, Layer } from "react-map-gl";
import type { MapRef, LayerProps } from "react-map-gl";
import { generateCircleCoords } from "@/lib/geo";

const Animal3DMarker = lazy(() => import("./Animal3DMarker"));

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Farm {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  name: string;
}

interface Animal {
  id: string;
  name: string;
  tagId: string;
  type: "COW" | "SHEEP" | "GOAT" | "CHICKEN" | "HORSE" | "PIG";
  status: "SAFE" | "WARNING" | "ALERT";
  battery: number;
  latitude: number | null | undefined;
  longitude: number | null | undefined;
}

interface FarmMapProps {
  farm: Farm | null;
  animals: Animal[];
  selectedAnimalId: string | null;
  onSelectAnimal: (id: string | null) => void;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;
const MAP_STYLE = "mapbox://styles/mapbox/dark-v11";

// Types that have GLB 3D models
const TYPES_WITH_MODELS = new Set(["COW", "SHEEP", "CHICKEN"]);

const STATUS_COLORS: Record<Animal["status"], string> = {
  SAFE: "#00E5CC",
  WARNING: "#FFA502",
  ALERT: "#FF4757",
};

const ANIMAL_EMOJI: Record<Animal["type"], string> = {
  COW: "\u{1F404}",
  SHEEP: "\u{1F411}",
  GOAT: "\u{1F410}",
  CHICKEN: "\u{1F414}",
  HORSE: "\u{1F434}",
  PIG: "\u{1F437}",
};

/* ------------------------------------------------------------------ */
/*  Layer styles                                                       */
/* ------------------------------------------------------------------ */

const boundaryFillLayer: LayerProps = {
  id: "farm-boundary-fill",
  type: "fill",
  paint: {
    "fill-color": "rgba(0,229,204,0.08)",
  },
};

const boundaryLineLayer: LayerProps = {
  id: "farm-boundary-line",
  type: "line",
  paint: {
    "line-color": "#00E5CC",
    "line-width": 2,
    "line-dasharray": [4, 3],
  },
};

/* ------------------------------------------------------------------ */
/*  Bobbing animation CSS                                              */
/* ------------------------------------------------------------------ */

const bobbingCSS = `
@keyframes hg-bob {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-4px); }
}
.hg-marker {
  animation: hg-bob 2.4s ease-in-out infinite;
}
`;

/* ------------------------------------------------------------------ */
/*  Emoji Fallback Marker (for types without 3D model)                 */
/* ------------------------------------------------------------------ */

function EmojiMarker({
  animal,
  isSelected,
  onClick,
}: {
  animal: Animal;
  isSelected: boolean;
  onClick: () => void;
}) {
  const color = STATUS_COLORS[animal.status];
  const emoji = ANIMAL_EMOJI[animal.type] ?? "\u{1F4CD}";

  return (
    <div
      className="hg-marker"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: `radial-gradient(circle at 35% 35%, ${color}dd, ${color})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontSize: 20,
        lineHeight: 1,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        transform: isSelected ? "scale(1.2)" : "scale(1)",
        boxShadow: isSelected
          ? "0 0 0 3px white, 0 4px 12px rgba(0,0,0,0.3)"
          : "0 2px 6px rgba(0,0,0,0.25)",
        userSelect: "none",
      }}
      title={animal.name}
    >
      {emoji}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function FarmMap({
  farm,
  animals,
  selectedAnimalId,
  onSelectAnimal,
}: FarmMapProps) {
  const mapRef = useRef<MapRef>(null);

  /* ---------- Fly to farm when it changes ---------- */
  useEffect(() => {
    if (!farm || !mapRef.current) return;
    mapRef.current.flyTo({
      center: [farm.longitude, farm.latitude],
      zoom: 15,
      duration: 1500,
    });
  }, [farm?.latitude, farm?.longitude]);

  /* ---------- Farm boundary GeoJSON ---------- */
  const boundaryGeoJSON = useMemo(() => {
    if (!farm) return null;
    const coords = generateCircleCoords(
      farm.latitude,
      farm.longitude,
      farm.radiusMeters
    );
    return {
      type: "Feature" as const,
      geometry: {
        type: "Polygon" as const,
        coordinates: [coords],
      },
      properties: {},
    };
  }, [farm]);

  /* ---------- Filter animals with valid positions ---------- */
  const visibleAnimals = useMemo(
    () =>
      animals.filter(
        (a) =>
          a.latitude !== null &&
          a.latitude !== undefined &&
          a.longitude !== null &&
          a.longitude !== undefined
      ),
    [animals]
  );

  /* ---------- Select handler ---------- */
  const handleMarkerClick = useCallback(
    (id: string) => {
      onSelectAnimal(id);
    },
    [onSelectAnimal]
  );

  /* ---------- Initial view ---------- */
  const initialViewState = useMemo(
    () => ({
      latitude: farm?.latitude ?? -29.0,
      longitude: farm?.longitude ?? 28.0,
      zoom: 15,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <>
      <style>{bobbingCSS}</style>

      <Map
        ref={mapRef}
        initialViewState={initialViewState}
        style={{ width: "100%", height: "100%" }}
        mapStyle={MAP_STYLE}
        mapboxAccessToken={MAPBOX_TOKEN}
        attributionControl={false}
        onClick={() => onSelectAnimal(null)}
      >
        {/* ---- Farm boundary ---- */}
        {boundaryGeoJSON && (
          <Source id="farm-boundary" type="geojson" data={boundaryGeoJSON}>
            <Layer {...boundaryFillLayer} />
            <Layer {...boundaryLineLayer} />
          </Source>
        )}

        {/* ---- Animal markers ---- */}
        {visibleAnimals.map((animal) => {
          const isSelected = animal.id === selectedAnimalId;
          const has3DModel = TYPES_WITH_MODELS.has(animal.type);

          return (
            <Marker
              key={animal.id}
              latitude={animal.latitude as number}
              longitude={animal.longitude as number}
              anchor="center"
            >
              {has3DModel ? (
                <Suspense
                  fallback={
                    <EmojiMarker
                      animal={animal}
                      isSelected={isSelected}
                      onClick={() => handleMarkerClick(animal.id)}
                    />
                  }
                >
                  <Animal3DMarker
                    animal={animal}
                    isSelected={isSelected}
                    onClick={() => handleMarkerClick(animal.id)}
                  />
                </Suspense>
              ) : (
                <EmojiMarker
                  animal={animal}
                  isSelected={isSelected}
                  onClick={() => handleMarkerClick(animal.id)}
                />
              )}
            </Marker>
          );
        })}
      </Map>
    </>
  );
}
