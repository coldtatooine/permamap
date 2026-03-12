import { Polygon, Tooltip } from 'react-leaflet';
import { useMapStore } from '../../store/useMapStore';
import { ZONE_LABELS } from '../../types';

export function ZoneLayer() {
  const { zones, setActiveZone } = useMapStore();

  return (
    <>
      {zones.map((zone) => {
        const positions = zone.polygon_geojson.coordinates[0].map(
          ([lng, lat]) => [lat, lng] as [number, number]
        );

        return (
          <Polygon
            key={zone.id}
            positions={positions}
            pathOptions={{
              color: zone.color,
              fillColor: zone.color,
              fillOpacity: 0.25,
              weight: 2,
            }}
            eventHandlers={{
              click: () => setActiveZone(zone.id),
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
        );
      })}
    </>
  );
}
