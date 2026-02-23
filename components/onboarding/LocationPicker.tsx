"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Map from "react-map-gl";
import type { MapRef } from "react-map-gl";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

interface SearchResult {
  id: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
}

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
}

export default function LocationPicker({
  latitude,
  longitude,
  onLocationChange,
}: LocationPickerProps) {
  const mapRef = useRef<MapRef>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---- Geocoding search ---- */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${MAPBOX_TOKEN}&limit=5&country=za&types=place,locality,neighborhood,address,poi`;
        const res = await fetch(url);
        const data = await res.json();
        setResults(
          (data.features || []).map((f: any) => ({
            id: f.id,
            place_name: f.place_name,
            center: f.center,
          }))
        );
        setShowResults(true);
      } catch {
        setResults([]);
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSelectResult = useCallback(
    (result: SearchResult) => {
      const [lng, lat] = result.center;
      onLocationChange(lat, lng);
      mapRef.current?.flyTo({ center: [lng, lat], zoom: 15, duration: 1500 });
      setQuery(result.place_name.split(",")[0]);
      setShowResults(false);
    },
    [onLocationChange]
  );

  /* ---- Map handlers ---- */
  const handleMoveEnd = useCallback(
    (e: any) => {
      onLocationChange(e.viewState.latitude, e.viewState.longitude);
    },
    [onLocationChange]
  );

  const handleLoad = useCallback(() => {
    const map = mapRef.current;
    if (map) {
      const center = map.getCenter();
      onLocationChange(center.lat, center.lng);
    }
  }, [onLocationChange]);

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        onLocationChange(lat, lng);
        mapRef.current?.flyTo({ center: [lng, lat], zoom: 15, duration: 1500 });
      },
      () => {
        // Silently fail — user denied location
      }
    );
  }, [onLocationChange]);

  const initLat = latitude || -29.0;
  const initLng = longitude || 28.0;

  return (
    <div className="relative w-full" style={{ height: "100%", minHeight: "400px" }}>
      {/* Search bar */}
      <div className="absolute top-3 left-3 right-3 z-20">
        <div className="relative">
          <div className="flex items-center bg-surface rounded-xl shadow-lg overflow-hidden border border-primary/20">
            <svg
              className="ml-3 shrink-0 text-secondary"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => results.length > 0 && setShowResults(true)}
              placeholder="Search for a place..."
              className="flex-1 px-3 py-3 text-sm outline-none bg-transparent min-h-[44px] text-white placeholder-text-secondary"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setResults([]);
                  setShowResults(false);
                }}
                className="px-3 text-secondary"
              >
                <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M1 1l12 12M13 1L1 13" />
                </svg>
              </button>
            )}
          </div>

          {/* Search results dropdown */}
          {showResults && results.length > 0 && (
            <div className="mt-1 bg-surface rounded-xl shadow-lg overflow-hidden max-h-[200px] overflow-y-auto border border-primary/20">
              {results.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleSelectResult(r)}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-surface-light active:bg-surface-light border-b border-border/30 last:border-0 flex items-start gap-2 text-white"
                >
                  <svg
                    className="mt-0.5 shrink-0 text-primary"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <span className="line-clamp-2">{r.place_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <Map
        ref={mapRef}
        initialViewState={{
          latitude: initLat,
          longitude: initLng,
          zoom: latitude ? 15 : 6,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        attributionControl={false}
        onMoveEnd={handleMoveEnd}
        onLoad={handleLoad}
      />

      {/* Fixed crosshair pin in center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-10 pointer-events-none">
        <svg width="36" height="48" viewBox="0 0 36 48" fill="none">
          <path
            d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 30 18 30s18-16.5 18-30C36 8.06 27.94 0 18 0z"
            fill="#00C896"
          />
          <circle cx="18" cy="18" r="7" fill="#0A1628" />
        </svg>
        {/* Pin shadow */}
        <div
          className="mx-auto mt-0.5 w-4 h-1 rounded-full bg-black/20"
          style={{ filter: "blur(2px)" }}
        />
      </div>

      {/* Use My Location button */}
      <button
        type="button"
        onClick={handleUseMyLocation}
        className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 bg-surface rounded-xl px-5 py-3 shadow-lg flex items-center gap-2 text-sm font-semibold text-primary active:scale-[0.97] transition-transform min-h-[44px] border border-primary/20"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        </svg>
        Use My Location
      </button>
    </div>
  );
}
