import { Marker, Polygon, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { useMapStore } from '../../store/useMapStore';
import { POI_TYPE_DEFINITIONS } from '../../types';
import type { Element, GeoJSONPoint, GeoJSONPolygon } from '../../types';

const FALLBACK_EMOJI = '📍';

function makeIcon(emoji: string) {
  const html = `
    <div style="
      position: relative;
      display: inline-block;
      filter: drop-shadow(0 3px 8px rgba(0,0,0,0.28));
    ">
      <div style="
        background: #ffffff;
        border-radius: 10px;
        width: 36px;
        height: 34px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        line-height: 1;
      ">${emoji}</div>
      <div style="
        position: absolute;
        bottom: -7px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 7px solid transparent;
        border-right: 7px solid transparent;
        border-top: 7px solid #ffffff;
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'pm-poi-icon',
    iconSize:   [36, 41],
    iconAnchor: [18, 41],
    popupAnchor: [0, -41],
  });
}

export function ElementLayer() {
  const { elements } = useMapStore();

  return (
    <>
      {elements.map((el) => {
        if (el.type === 'poi') return <POIMarker key={el.id} element={el} />;
        if (el.type === 'fence') return <FencePolyline key={el.id} element={el} />;
        return null;
      })}
    </>
  );
}

function POIMarker({ element }: { element: Element }) {
  const geom = element.geometry_geojson as GeoJSONPoint;
  const [lng, lat] = geom.coordinates;
  const poiType = element.metadata_json.poi_type;
  const emoji   = poiType ? (POI_TYPE_DEFINITIONS[poiType]?.emoji ?? FALLBACK_EMOJI) : FALLBACK_EMOJI;

  return (
    <Marker position={[lat, lng]} icon={makeIcon(emoji)}>
      <Tooltip>
        <span className="font-semibold">{element.metadata_json.name ?? poiType}</span>
        {element.metadata_json.notes && (
          <>
            <br />
            <span className="text-xs text-gray-500">{element.metadata_json.notes}</span>
          </>
        )}
      </Tooltip>
    </Marker>
  );
}

function FencePolyline({ element }: { element: Element }) {
  const geom = element.geometry_geojson as GeoJSONPolygon;
  const positions = geom.coordinates[0].map(([lng, lat]) => [lat, lng] as [number, number]);

  const color =
    element.metadata_json.fence_type === 'elétrica'
      ? '#facc15'
      : element.metadata_json.fence_type === 'viva'
      ? '#4ade80'
      : '#92400e';

  return (
    <Polygon
      positions={positions}
      pathOptions={{ color, weight: 2.5, dashArray: '7 5', fillOpacity: 0.07 }}
    >
      <Tooltip>
        <span>Cerca {element.metadata_json.fence_type ?? ''}</span>
      </Tooltip>
    </Polygon>
  );
}
