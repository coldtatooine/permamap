import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { useMapStore } from '../../store/useMapStore';

// Ícone com cross + círculos concêntricos — centralizado em [0,0]
const userLocationIcon = L.divIcon({
  html: `
    <div style="position:relative;width:0;height:0;overflow:visible;">
      <div class="user-loc-cross-h"></div>
      <div class="user-loc-cross-v"></div>
      <div class="user-loc-ring-pulse"></div>
      <div class="user-loc-ring-static"></div>
      <div class="user-loc-dot"></div>
    </div>
  `,
  className: '',
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});

export function UserLocationMarker() {
  const userLocation = useMapStore((s) => s.userLocation);

  if (!userLocation) return null;

  return (
    <Marker position={userLocation} icon={userLocationIcon} interactive={false}>
      <Tooltip direction="top" offset={[0, -8]} permanent={false}>
        Você está aqui
      </Tooltip>
    </Marker>
  );
}
