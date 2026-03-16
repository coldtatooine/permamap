import { create } from 'zustand';
import type {
  Property,
  Zone,
  Element,
  ZoneNumber,
  GeoJSONPolygon,
  GeoJSONGeometry,
  ElementMetadata,
  ElementType,
} from '../types';
import { ZONE_COLORS as COLORS } from '../types';

export type DrawingMode = 'zone' | 'zone-circle' | 'poi' | 'fence' | null;
export type WizardStep = 'property' | 'location' | 'zone0' | 'zones' | 'elements' | 'done';

interface MapStore {
  // Estado
  property: Property | null;
  zones: Zone[];
  elements: Element[];
  activeZoneId: string | null;
  drawingMode: DrawingMode;
  wizardStep: WizardStep;
  isWizardOpen: boolean;
  pendingGeometry: GeoJSONGeometry | null;
  pendingFlyTo: [number, number] | null;   // [lat, lng] para o mapa voar
  userLocation: [number, number] | null;   // posição GPS do usuário
  isLoading: boolean;
  error: string | null;

  // Propriedade
  setProperty: (property: Property) => void;
  clearProperty: () => void;

  // Zonas
  addZone: (params: {
    zone_number: ZoneNumber;
    name: string;
    polygon_geojson: GeoJSONPolygon;
    id?: string;
    property_id?: string;
    created_at?: string;
  }) => { success: boolean; error?: string };
  updateZone: (id: string, updates: Partial<Zone>) => void;
  removeZone: (id: string) => void;
  setZones: (zones: Zone[]) => void;
  setActiveZone: (id: string | null) => void;

  // Elementos
  addElement: (params: {
    zone_id: string;
    type: ElementType;
    geometry_geojson: GeoJSONGeometry;
    metadata_json: ElementMetadata;
    id?: string;
    created_at?: string;
  }) => { success: boolean; error?: string };
  updateElement: (id: string, updates: Partial<Pick<Element, 'zone_id' | 'metadata_json'>>) => void;
  removeElement: (id: string) => void;
  setElements: (elements: Element[]) => void;

  // Modo de desenho
  setDrawingMode: (mode: DrawingMode) => void;
  setPendingGeometry: (geom: GeoJSONGeometry | null) => void;
  setPendingFlyTo: (latlng: [number, number] | null) => void;
  setUserLocation: (latlng: [number, number] | null) => void;

  // Wizard
  setWizardStep: (step: WizardStep) => void;
  openWizard: () => void;
  closeWizard: () => void;

  // UI
  setLoading: (v: boolean) => void;
  setError: (msg: string | null) => void;
}

export const useMapStore = create<MapStore>((set, get) => ({
  property: null,
  zones: [],
  elements: [],
  activeZoneId: null,
  drawingMode: null,
  wizardStep: 'property',
  isWizardOpen: false,
  pendingGeometry: null,
  pendingFlyTo: null,
  userLocation: null,
  isLoading: false,
  error: null,

  setProperty: (property) => set({ property }),
  clearProperty: () => set({ property: null, zones: [], elements: [] }),

  addZone: ({ zone_number, name, polygon_geojson, id, property_id, created_at }) => {
    const { zones, property } = get();

    if (zones.length >= 5) {
      return { success: false, error: 'Máximo de 5 zonas por propriedade.' };
    }
    if (zones.some((z) => z.zone_number === zone_number)) {
      return { success: false, error: `Zona ${zone_number} já existe nesta propriedade.` };
    }
    if (zone_number > 5) {
      return { success: false, error: 'Número de zona não pode ser maior que 5.' };
    }

    const newZone: Zone = {
      id: id ?? crypto.randomUUID(),
      property_id: property_id ?? property?.id ?? '',
      zone_number,
      name,
      color: COLORS[zone_number],
      polygon_geojson,
      created_at: created_at ?? new Date().toISOString(),
    };

    set({ zones: [...zones, newZone] });
    return { success: true };
  },

  updateZone: (id, updates) => {
    set((state) => ({
      zones: state.zones.map((z) => (z.id === id ? { ...z, ...updates } : z)),
    }));
  },

  removeZone: (id) => {
    set((state) => ({
      zones: state.zones.filter((z) => z.id !== id),
      elements: state.elements.filter((e) => e.zone_id !== id),
    }));
  },

  setZones: (zones) => set({ zones }),

  setActiveZone: (id) => set({ activeZoneId: id }),

  addElement: ({ zone_id, type, geometry_geojson, metadata_json, id, created_at }) => {
    const { zones, elements } = get();
    const zone = zones.find((z) => z.id === zone_id);

    if (!zone) {
      return { success: false, error: 'Zona não encontrada.' };
    }
    if (zone.zone_number === 5 && (type === 'culture' || type === 'animal')) {
      return { success: false, error: 'Zona 5 (Silvestre) não permite culturas ou animais.' };
    }

    const newElement: Element = {
      id: id ?? crypto.randomUUID(),
      zone_id,
      type,
      geometry_geojson,
      metadata_json,
      created_at: created_at ?? new Date().toISOString(),
    };

    set({ elements: [...elements, newElement] });
    return { success: true };
  },

  updateElement: (id, updates) => {
    set((state) => ({
      elements: state.elements.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
  },

  removeElement: (id) => {
    set((state) => ({ elements: state.elements.filter((e) => e.id !== id) }));
  },

  setElements: (elements) => set({ elements }),

  setDrawingMode: (mode) => set({ drawingMode: mode }),
  setPendingGeometry: (pendingGeometry) => set({ pendingGeometry }),
  setPendingFlyTo: (pendingFlyTo) => set({ pendingFlyTo }),
  setUserLocation: (userLocation) => set({ userLocation }),

  setWizardStep: (wizardStep) => set({ wizardStep }),
  openWizard: () => set({ isWizardOpen: true, wizardStep: 'property' }),
  closeWizard: () => set({ isWizardOpen: false }),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
