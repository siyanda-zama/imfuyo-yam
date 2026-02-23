"use client";

import { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Map, { Source, Layer } from "react-map-gl";
import { generateCircleCoords, radiusToHectares } from "@/lib/geo";

const LocationPicker = dynamic(() => import("./LocationPicker"), { ssr: false });

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;
const TOTAL_STEPS = 4;

const boundaryFill = {
  id: "setup-boundary-fill",
  type: "fill" as const,
  paint: { "fill-color": "rgba(0,200,150,0.12)" },
};

const boundaryLine = {
  id: "setup-boundary-line",
  type: "line" as const,
  paint: {
    "line-color": "#00C896",
    "line-width": 2,
    "line-dasharray": [4, 3],
  },
};

export default function FarmSetupWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [farmName, setFarmName] = useState("");
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [radiusMeters, setRadiusMeters] = useState(500);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hectares = useMemo(() => radiusToHectares(radiusMeters), [radiusMeters]);

  const boundaryGeoJSON = useMemo(() => {
    if (!latitude || !longitude) return null;
    const coords = generateCircleCoords(latitude, longitude, radiusMeters);
    return {
      type: "Feature" as const,
      geometry: { type: "Polygon" as const, coordinates: [coords] },
      properties: {},
    };
  }, [latitude, longitude, radiusMeters]);

  const handleLocationChange = useCallback((lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  }, []);

  const handleCreate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/farms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: farmName,
          latitude,
          longitude,
          radiusMeters,
          hectares,
        }),
      });
      if (!res.ok) {
        let message = "Failed to create farm";
        try {
          const data = await res.json();
          message = data.error || message;
        } catch {}
        throw new Error(message);
      }
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return farmName.trim().length > 0;
    if (step === 2) return latitude !== 0 && longitude !== 0;
    return true;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 pt-6 pb-2">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              i + 1 <= step ? "bg-primary" : "bg-border"
            }`}
          />
        ))}
      </div>

      {/* Back button */}
      {step > 1 && (
        <button
          type="button"
          onClick={() => setStep((s) => s - 1)}
          className="self-start px-4 py-2 text-sm text-secondary flex items-center gap-1"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </button>
      )}

      {/* Step content */}
      <div className="flex-1 flex flex-col">
        {/* ---- Step 1: Farm Name ---- */}
        {step === 1 && (
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <h1 className="font-bold text-2xl text-center mb-2 text-white">
              What&apos;s your farm called?
            </h1>
            <p className="text-secondary text-sm mb-8">Give your farm a name</p>
            <input
              type="text"
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              placeholder="e.g. Ndlela Farm"
              className="w-full rounded-xl bg-surface-light p-4 min-h-[44px] text-base text-white placeholder-text-secondary outline-none border border-border focus:border-primary focus:ring-1 focus:ring-primary"
              autoFocus
            />
          </div>
        )}

        {/* ---- Step 2: Pick Location ---- */}
        {step === 2 && (
          <div className="flex-1 flex flex-col px-4 pb-4">
            <h1 className="font-bold text-xl text-center mb-1 text-white">
              Where is your farm?
            </h1>
            <p className="text-secondary text-sm text-center mb-3">
              Search or pan the map to your farm&apos;s location
            </p>
            <div className="rounded-xl overflow-hidden border border-primary/20" style={{ height: "calc(100vh - 280px)", minHeight: "350px" }}>
              <LocationPicker
                latitude={latitude}
                longitude={longitude}
                onLocationChange={handleLocationChange}
              />
            </div>
            {(latitude !== 0 || longitude !== 0) && (
              <p className="text-xs text-secondary text-center mt-2">
                {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </p>
            )}
          </div>
        )}

        {/* ---- Step 3: Set Radius ---- */}
        {step === 3 && (
          <div className="flex-1 flex flex-col px-4 pb-4">
            <h1 className="font-bold text-xl text-center mb-1 text-white">
              Set your farm boundary
            </h1>
            <p className="text-secondary text-sm text-center mb-3">
              Adjust the radius to cover your land
            </p>
            <div className="rounded-xl overflow-hidden border border-primary/20" style={{ height: "calc(100vh - 380px)", minHeight: "250px" }}>
              <Map
                initialViewState={{
                  latitude,
                  longitude,
                  zoom: 14,
                }}
                style={{ width: "100%", height: "100%" }}
                mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
                mapboxAccessToken={MAPBOX_TOKEN}
                attributionControl={false}
                interactive={false}
              >
                {boundaryGeoJSON && (
                  <Source id="setup-boundary" type="geojson" data={boundaryGeoJSON}>
                    <Layer {...boundaryFill} />
                    <Layer {...boundaryLine} />
                  </Source>
                )}
              </Map>
            </div>
            <div className="mt-4 px-2">
              <p className="text-sm font-semibold mb-2 text-white">Farm radius</p>
              <input
                type="range"
                min={100}
                max={2000}
                step={50}
                value={radiusMeters}
                onChange={(e) => setRadiusMeters(Number(e.target.value))}
                className="w-full h-2 rounded-full accent-primary"
              />
              <div className="flex justify-between text-xs text-secondary mt-1">
                <span>100m</span>
                <span className="font-semibold text-sm text-primary">
                  {radiusMeters}m &middot; {hectares} ha
                </span>
                <span>2000m</span>
              </div>
            </div>
          </div>
        )}

        {/* ---- Step 4: Confirm ---- */}
        {step === 4 && (
          <div className="flex-1 flex flex-col px-4 pb-4">
            <h1 className="font-bold text-xl text-center mb-4 text-white">
              Confirm your farm
            </h1>
            <div className="bg-surface-light rounded-2xl p-5 space-y-4 border border-primary/20">
              <div className="flex justify-between">
                <span className="text-sm text-secondary">Farm name</span>
                <span className="font-semibold text-white">{farmName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-secondary">Location</span>
                <span className="font-semibold text-sm text-white">
                  {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-secondary">Boundary</span>
                <span className="font-semibold text-white">{radiusMeters}m radius</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-secondary">Approx. area</span>
                <span className="font-semibold text-white">{hectares} hectares</span>
              </div>
            </div>
            {error && (
              <p className="text-danger text-sm text-center mt-3">{error}</p>
            )}
          </div>
        )}
      </div>

      {/* Bottom action button */}
      <div className="px-6 pb-8 pt-4">
        {step < 4 ? (
          <button
            type="button"
            disabled={!canProceed()}
            onClick={() => setStep((s) => s + 1)}
            className="w-full bg-primary text-background font-bold rounded-xl p-4 min-h-[44px] disabled:opacity-40 active:scale-[0.98] transition-transform"
          >
            {step === 2 ? "Confirm Location" : step === 3 ? "Confirm Boundary" : "Next"}
          </button>
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={handleCreate}
            className="w-full bg-primary text-background font-bold rounded-xl p-4 min-h-[44px] disabled:opacity-60 active:scale-[0.98] transition-transform"
          >
            {loading ? "Creating Farm..." : "Create Farm"}
          </button>
        )}
      </div>
    </div>
  );
}
