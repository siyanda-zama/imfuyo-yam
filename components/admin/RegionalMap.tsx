'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Map as MapIcon } from 'lucide-react';
import type { AdminFarm } from '@/lib/types';

interface RegionalMapProps {
  farms: AdminFarm[] | null;
}

export default function RegionalMap({ farms }: RegionalMapProps) {
  const [MapComponent, setMapComponent] = useState<any>(null);

  useEffect(() => {
    import('react-map-gl').then((mod) => {
      setMapComponent(() => mod.default);
    });
  }, []);

  if (!farms || farms.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <MapIcon size={16} className="text-primary" />
        <h2 className="font-display text-sm font-bold text-white">Regional Overview</h2>
        <span className="text-[10px] text-text-muted ml-auto">{farms.length} farms</span>
      </div>

      <div className="bg-surface rounded-xl border border-primary/10 overflow-hidden">
        <div className="h-[240px] lg:h-[400px] relative">
          {MapComponent ? (
            <MapComponent
              initialViewState={{
                latitude: -28.5,
                longitude: 28.5,
                zoom: 4.8,
              }}
              style={{ width: '100%', height: '100%' }}
              mapStyle="mapbox://styles/mapbox/dark-v11"
              mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
              interactive={true}
              attributionControl={false}
            />
          ) : (
            <div className="w-full h-full bg-surface-light flex items-center justify-center">
              <div className="text-center">
                <MapIcon size={24} className="text-text-muted mx-auto mb-2" />
                <p className="text-xs text-text-muted">Loading map...</p>
              </div>
            </div>
          )}
        </div>

        {/* Farm legend below map */}
        <div className="p-3 border-t border-border/30">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {farms.map((farm) => {
              const dotColor =
                farm.alertCount >= 3 ? '#FF4757' : farm.alertCount >= 1 ? '#FFB020' : '#00C896';
              return (
                <div key={farm.id} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
                  <span className="text-[11px] text-text-secondary flex-1 truncate">{farm.name}</span>
                  <span className="text-[10px] text-text-muted">{farm.province}</span>
                  <span className="text-[10px] font-semibold text-white">{farm.animalCount}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
