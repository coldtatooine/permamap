// =====================
// Tipos de Zona
// =====================

export type ZoneNumber = 0 | 1 | 2 | 3 | 4 | 5;

export const ZONE_COLORS: Record<ZoneNumber, string> = {
  0: '#ef4444', // Vermelho   – Casa / Centro
  1: '#f97316', // Laranja    – Jardim intensivo
  2: '#eab308', // Amarelo    – Uso frequente
  3: '#22c55e', // Verde      – Uso ocasional
  4: '#15803d', // Verde esc. – Uso mínimo
  5: '#3b82f6', // Azul       – Silvestre / preservação
};

export const ZONE_LABELS: Record<ZoneNumber, string> = {
  0: 'Zona 0 – Casa',
  1: 'Zona 1 – Jardim Intensivo',
  2: 'Zona 2 – Uso Frequente',
  3: 'Zona 3 – Uso Ocasional',
  4: 'Zona 4 – Uso Mínimo',
  5: 'Zona 5 – Silvestre',
};

// =====================
// Entidades do domínio
// =====================

export interface Property {
  id: string;
  name: string;
  location: GeoJSONPoint | null;
  created_at: string;
  user_id?: string;
}

export interface Zone {
  id: string;
  property_id: string;
  zone_number: ZoneNumber;
  name: string;
  color: string;
  polygon_geojson: GeoJSONPolygon;
  created_at: string;
}

export type ElementType = 'poi' | 'culture' | 'animal' | 'fence';

export const POI_TYPES = [
  'Casa',
  'Horta',
  'Agrofloresta',
  'Galinheiro',
  'Pasto',
  'Apiário',
  'Compostagem',
  'Reservatório',
  'Infraestrutura',
] as const;

export type POIType = typeof POI_TYPES[number];

export interface Element {
  id: string;
  zone_id: string;
  type: ElementType;
  geometry_geojson: GeoJSONGeometry;
  metadata_json: ElementMetadata;
  created_at: string;
}

export interface ElementMetadata {
  name?: string;
  poi_type?: POIType;
  notes?: string;
  area_m2?: number;
  // cultura
  culture?: string;
  intercrop?: string;
  planted_at?: string;
  cycle?: string;
  irrigated?: boolean;
  estimated_yield?: string;
  // animal
  species?: string;
  quantity?: number;
  system?: 'rotativo' | 'livre' | 'confinamento';
  // cerca
  fence_type?: 'viva' | 'elétrica' | 'madeira';
}

// =====================
// GeoJSON simplificado
// =====================

export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
}

export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: [number, number][][];
}

export type GeoJSONGeometry = GeoJSONPoint | GeoJSONPolygon | {
  type: 'LineString';
  coordinates: [number, number][];
};
