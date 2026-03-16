import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';
import { ZoneLayer } from './ZoneLayer';
import { ElementLayer } from './ElementLayer';
import { UserLocationMarker } from './UserLocationMarker';
import { DrawingToolbar } from './DrawingToolbar';
import { Icon } from '@permamap/ui';
import { ZoneForm } from '../Forms/ZoneForm';
import { POIForm } from '../Forms/POIForm';
import { useMapStore } from '../../store/useMapStore';
import { useGeolocation } from '../../hooks/useGeolocation';
import type { DrawingMode } from '../../store/useMapStore';
import type { GeoJSONGeometry, GeoJSONPolygon } from '../../types';

// Corrige ícones padrão do Leaflet no Vite
delete (L.Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const DEFAULT_CENTER: [number, number] = [-15.7801, -47.9292]; // Brasília

// Converte centro + raio (metros) em polígono GeoJSON aproximado
function circleToPolygon(lat: number, lng: number, radiusM: number, numPoints = 64): GeoJSONPolygon {
  const M_PER_DEG_LAT = 111319.5;
  const M_PER_DEG_LNG = 111319.5 * Math.cos(lat * Math.PI / 180);
  const coords: [number, number][] = [];
  for (let i = 0; i <= numPoints; i++) {
    const angle = (i * 2 * Math.PI) / numPoints;
    coords.push([
      lng + (radiusM / M_PER_DEG_LNG) * Math.sin(angle),
      lat + (radiusM / M_PER_DEG_LAT) * Math.cos(angle),
    ]);
  }
  return { type: 'Polygon', coordinates: [coords] };
}
const DEFAULT_ZOOM = 13;

export function MapView() {
  const { drawingMode, setDrawingMode, setPendingGeometry, property } = useMapStore();
  const { getCurrentPosition } = useGeolocation();
  const [showZoneForm, setShowZoneForm] = useState(false);
  const [showPOIForm, setShowPOIForm] = useState(false);
  const [locateError, setLocateError] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  const center: [number, number] = property?.location
    ? [property.location.coordinates[1], property.location.coordinates[0]]
    : DEFAULT_CENTER;

  function handleActivate(mode: DrawingMode) {
    setDrawingMode(mode);
  }

  function handleGeometryCreated(geom: GeoJSONGeometry) {
    if (drawingMode === 'zone' || drawingMode === 'zone-circle') {
      setPendingGeometry(geom);
      setShowZoneForm(true);
    } else if (drawingMode === 'poi') {
      setPendingGeometry(geom);
      setShowPOIForm(true);
    } else if (drawingMode === 'fence' && geom.type === 'Polygon') {
      // Cerca: adiciona diretamente à zona ativa (ou à primeira disponível)
      const { zones, activeZoneId, addElement } = useMapStore.getState();
      const zoneId = activeZoneId ?? zones[0]?.id;
      if (zoneId) {
        addElement({
          zone_id: zoneId,
          type: 'fence',
          geometry_geojson: geom,
          metadata_json: { name: 'Cerca' },
        });
      }
    }
    setDrawingMode(null);
  }

  async function handleLocateMe() {
    setIsLocating(true);
    setLocateError('');
    try {
      const { lat, lng } = await getCurrentPosition();
      useMapStore.getState().setUserLocation([lat, lng]);
      useMapStore.getState().setPendingFlyTo([lat, lng]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao obter localização.';
      setLocateError(msg);
      setTimeout(() => setLocateError(''), 4000);
    } finally {
      setIsLocating(false);
    }
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={center}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoneLayer />
        <ElementLayer />
        <UserLocationMarker />
        <DrawingController mode={drawingMode} onCreated={handleGeometryCreated} />
        <MapFlyController />
      </MapContainer>

      <DrawingToolbar onActivate={handleActivate} />

      {/* Botão de localização – canto inferior direito */}
      <div className="absolute right-4 z-1000 flex flex-col items-end gap-2 pm-map-controls">
        {locateError && (
          <div className="text-xs px-3 py-1.5 rounded-lg shadow max-w-48 text-right"
            style={{ background: 'var(--pm-panel)', border: '1px solid var(--pm-danger)', color: 'var(--pm-danger)' }}>
            {locateError}
          </div>
        )}
        <button
          onClick={handleLocateMe}
          disabled={isLocating}
          title="Ir para minha localização"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: isLocating ? 'var(--pm-accent-muted)' : 'var(--pm-panel)',
            border: `1.5px solid ${isLocating ? 'var(--pm-accent)' : 'var(--pm-border-bright)'}`,
            color: isLocating ? 'var(--pm-accent)' : 'var(--pm-text-2)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            cursor: isLocating ? 'wait' : 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {isLocating
            ? <Icon name="locate" size={18} color="var(--pm-accent)" className="animate-spin" />
            : <Icon name="locate" size={18} color="var(--pm-text-2)" />}
        </button>
      </div>

      {showZoneForm && <ZoneForm onClose={() => setShowZoneForm(false)} />}
      {showPOIForm && <POIForm onClose={() => setShowPOIForm(false)} />}
    </div>
  );
}

// Reage a pedidos de flyTo e a mudanças de localização da propriedade
function MapFlyController() {
  const map = useMap();
  const pendingFlyTo = useMapStore((s) => s.pendingFlyTo);
  const propertyLocation = useMapStore((s) => s.property?.location);
  const prevLocationKey = useRef<string | null>(null);

  // FlyTo explícito (botão "◎" no mapa)
  useEffect(() => {
    if (!pendingFlyTo) return;
    map.flyTo(pendingFlyTo, 16, { animate: true, duration: 1.2 });
    useMapStore.getState().setPendingFlyTo(null);
  }, [pendingFlyTo, map]);

  // FlyTo automático quando a localização da propriedade é definida (wizard / endereço)
  useEffect(() => {
    if (!propertyLocation) return;
    const key = propertyLocation.coordinates.join(',');
    if (key === prevLocationKey.current) return;
    prevLocationKey.current = key;
    const [lng, lat] = propertyLocation.coordinates;
    map.flyTo([lat, lng], 15, { animate: true, duration: 1.2 });
  }, [propertyLocation, map]);

  return null;
}

// Componente interno que controla o desenho via leaflet-draw
function DrawingController({
  mode,
  onCreated,
}: {
  mode: DrawingMode;
  onCreated: (geom: GeoJSONGeometry) => void;
}) {
  const map = useMapEvents({});
  const drawRef = useRef<L.Draw.Feature | null>(null);
  const featureGroupRef = useRef<L.FeatureGroup>(new L.FeatureGroup());

  useEffect(() => {
    if (!map) return;
    if (!map.hasLayer(featureGroupRef.current)) {
      map.addLayer(featureGroupRef.current);
    }
  }, [map]);

  useEffect(() => {
    if (!map) return;

    // Remove handler anterior
    map.off(L.Draw.Event.CREATED);

    // Cancela desenho anterior
    if (drawRef.current) {
      try { drawRef.current.disable(); } catch {}
      drawRef.current = null;
    }

    if (!mode) return;

    // Configura novo handler
    map.on(L.Draw.Event.CREATED, (e: L.LeafletEvent) => {
      const event = e as L.DrawEvents.Created;
      const layer = event.layer;

      let geom: GeoJSONGeometry | null = null;

      if (layer instanceof L.Circle) {
        const center = layer.getLatLng();
        geom = circleToPolygon(center.lat, center.lng, layer.getRadius());
      } else if (layer instanceof L.Polygon) {
        const latlngs = layer.getLatLngs()[0] as L.LatLng[];
        const coords = latlngs.map((ll) => [ll.lng, ll.lat] as [number, number]);
        coords.push(coords[0]); // fecha o anel
        geom = { type: 'Polygon', coordinates: [coords] } as GeoJSONPolygon;
      } else if (layer instanceof L.Marker) {
        const ll = layer.getLatLng();
        geom = { type: 'Point', coordinates: [ll.lng, ll.lat] };
      } else if (layer instanceof L.Polyline) {
        const latlngs = layer.getLatLngs() as L.LatLng[];
        const coords = latlngs.map((ll) => [ll.lng, ll.lat] as [number, number]);
        geom = { type: 'LineString', coordinates: coords };
      }

      if (geom) onCreated(geom);
    });

    // Inicia desenho
    if (mode === 'zone') {
      drawRef.current = new L.Draw.Polygon(map as L.DrawMap, {
        shapeOptions: { color: '#F7C35F', fillOpacity: 0.15 },
      });
    } else if (mode === 'zone-circle') {
      drawRef.current = new L.Draw.Circle(map as L.DrawMap, {
        shapeOptions: { color: '#F7C35F', fillOpacity: 0.15 },
      });
    } else if (mode === 'poi') {
      drawRef.current = new L.Draw.Marker(map as L.DrawMap);
    } else if (mode === 'fence') {
      drawRef.current = new L.Draw.Polygon(map as L.DrawMap, {
        shapeOptions: { color: '#92400e', fillOpacity: 0.08, dashArray: '6 4' },
      });
    }

    drawRef.current?.enable();

    return () => {
      map.off(L.Draw.Event.CREATED);
      try { drawRef.current?.disable(); } catch {}
      drawRef.current = null;
    };
  }, [mode, map]);

  return null;
}
