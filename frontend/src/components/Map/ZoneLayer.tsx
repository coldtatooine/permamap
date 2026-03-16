import { useState } from 'react';
import { Polygon, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { useMapStore } from '../../store/useMapStore';
import { ZONE_LABELS } from '../../types';
import type { Zone } from '../../types';

// Polígonos circulares têm exatamente 65 pontos (64 segmentos + fechamento)
const CIRCLE_POINT_COUNT = 65;

function isCircular(zone: Zone): boolean {
  return zone.polygon_geojson.coordinates[0].length === CIRCLE_POINT_COUNT;
}

// Centroide via média aritmética — exato para polígono regular
function centroid(zone: Zone): [number, number] {
  const pts = zone.polygon_geojson.coordinates[0].slice(0, -1); // remove ponto de fechamento
  const lng = pts.reduce((s, c) => s + c[0], 0) / pts.length;
  const lat = pts.reduce((s, c) => s + c[1], 0) / pts.length;
  return [lat, lng]; // Leaflet: [lat, lng]
}

function makeCrossIcon(color: string): L.DivIcon {
  const size   = 56;
  const half   = size / 2;
  const html = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"
         style="pointer-events:none;overflow:visible;display:block">
      <line x1="0"    y1="${half}" x2="${size}" y2="${half}"
            stroke="${color}" stroke-width="1.5" stroke-opacity="0.6"
            stroke-dasharray="4 3"/>
      <line x1="${half}" y1="0"    x2="${half}" y2="${size}"
            stroke="${color}" stroke-width="1.5" stroke-opacity="0.6"
            stroke-dasharray="4 3"/>
      <circle cx="${half}" cy="${half}" r="3"
              fill="${color}" fill-opacity="0.75"/>
    </svg>
  `;
  return L.divIcon({ html, className: '', iconSize: [size, size], iconAnchor: [half, half] });
}

export function ZoneLayer() {
  const { zones, setActiveZone } = useMapStore();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Z5→Z4→…→Z0: o último renderizado fica no topo do canvas Leaflet
  const sorted = [...zones].sort((a, b) => b.zone_number - a.zone_number);

  return (
    <>
      {sorted.map((zone) => {
        const positions = zone.polygon_geojson.coordinates[0].map(
          ([lng, lat]) => [lat, lng] as [number, number]
        );

        const showCross = zone.zone_number === 0
          && isCircular(zone)
          && hoveredId === zone.id;

        return (
          <>
            <Polygon
              key={zone.id}
              positions={positions}
              pathOptions={{
                color:       zone.color,
                fillColor:   zone.color,
                fillOpacity: 0.25,
                weight:      2,
              }}
              eventHandlers={{
                click:      () => setActiveZone(zone.id),
                mouseover:  () => setHoveredId(zone.id),
                mouseout:   () => setHoveredId(null),
              }}
            >
              <Tooltip sticky>
                <span className="font-semibold">{zone.name}</span>
                <br />
                <span className="text-xs text-gray-500">
                  {ZONE_LABELS[zone.zone_number]}
                </span>
              </Tooltip>
            </Polygon>

            {showCross && (
              <Marker
                key={`cross-${zone.id}`}
                position={centroid(zone)}
                icon={makeCrossIcon(zone.color)}
                interactive={false}
              />
            )}
          </>
        );
      })}
    </>
  );
}
