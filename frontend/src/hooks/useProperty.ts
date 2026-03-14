import { supabase } from '../lib/supabase';
import { useMapStore } from '../store/useMapStore';
import { useAuthStore } from '../store/useAuthStore';
import { ZONE_COLORS } from '../types';
import type { Property, Zone, Element, ZoneNumber, GeoJSONPolygon, GeoJSONGeometry, ElementType, ElementMetadata } from '../types';

export function useProperty() {
  const {
    property,
    zones,
    elements,
    setProperty,
    setZones,
    setElements,
    setLoading,
    setError,
  } = useMapStore();

  async function loadProperty(id: string) {
    setLoading(true);
    setError(null);

    try {
      const [propRes, zonesRes] = await Promise.all([
        supabase.from('properties').select('*').eq('id', id).single(),
        supabase.from('zones').select('*').eq('property_id', id).order('zone_number'),
      ]);

      if (propRes.error) throw propRes.error;
      if (zonesRes.error) throw zonesRes.error;

      setProperty(propRes.data as Property);
      setZones(zonesRes.data as Zone[]);

      if (zonesRes.data.length > 0) {
        const zoneIds = zonesRes.data.map((z: Zone) => z.id);
        const elemsRes = await supabase
          .from('elements')
          .select('*')
          .in('zone_id', zoneIds);
        if (elemsRes.error) throw elemsRes.error;
        setElements(elemsRes.data as Element[]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar propriedade.');
    } finally {
      setLoading(false);
    }
  }

  async function listProperties(): Promise<Property[]> {
    const res = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });
    if (res.error) throw res.error;
    return res.data as Property[];
  }

  async function saveProperty(): Promise<{ success: boolean; error?: string }> {
    if (!property) return { success: false, error: 'Nenhuma propriedade ativa.' };

    const hasZone0 = zones.some((z) => z.zone_number === 0);
    if (!hasZone0) {
      return { success: false, error: 'Zona 0 é obrigatória antes de salvar.' };
    }

    setLoading(true);
    setError(null);

    try {
      // Upsert property
      const propRes = await supabase
        .from('properties')
        .upsert(property)
        .select()
        .single();
      if (propRes.error) throw propRes.error;

      // Upsert zones
      for (const zone of zones) {
        const zoneRes = await supabase
          .from('zones')
          .upsert({ ...zone, property_id: propRes.data.id });
        if (zoneRes.error) throw zoneRes.error;
      }

      // Upsert elements
      for (const element of elements) {
        const elemRes = await supabase.from('elements').upsert(element);
        if (elemRes.error) throw elemRes.error;
      }

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }

  async function deleteElement(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await supabase.from('elements').delete().eq('id', id);
      if (res.error) throw res.error;
      useMapStore.getState().removeElement(id);
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao excluir elemento.';
      return { success: false, error: msg };
    }
  }

  async function deleteZone(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Elements are deleted via ON DELETE CASCADE on the database, but we must update the store
      const res = await supabase.from('zones').delete().eq('id', id);
      if (res.error) throw res.error;
      useMapStore.getState().removeZone(id);
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao excluir zona.';
      return { success: false, error: msg };
    }
  }

  async function updateElement(
    id: string,
    updates: { zone_id?: string; metadata_json?: import('../types').ElementMetadata },
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await supabase
        .from('elements')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (res.error) throw res.error;
      useMapStore.getState().updateElement(id, updates);
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao atualizar elemento.';
      return { success: false, error: msg };
    }
  }

  async function updateZone(
    id: string,
    updates: { name?: string; zone_number?: import('../types').ZoneNumber; color?: string },
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await supabase
        .from('zones')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (res.error) throw res.error;
      useMapStore.getState().updateZone(id, updates);
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao atualizar zona.';
      return { success: false, error: msg };
    }
  }

  async function deleteProperty(): Promise<{ success: boolean; error?: string }> {
    if (!property) return { success: false, error: 'Nenhuma propriedade ativa.' };

    setLoading(true);
    setError(null);

    try {
      // ON DELETE CASCADE no DB elimina zonas e elementos automaticamente
      const res = await supabase
        .from('properties')
        .delete()
        .eq('id', property.id);

      if (res.error) throw res.error;

      useMapStore.getState().clearProperty();
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao excluir propriedade.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }

  async function createZone(params: {
    zone_number: ZoneNumber;
    name: string;
    polygon_geojson: GeoJSONPolygon;
  }): Promise<{ success: boolean; error?: string }> {
    const { property, zones } = useMapStore.getState();
    if (!property) return { success: false, error: 'Nenhuma propriedade ativa.' };

    // Validações de negócio antes de ir ao banco
    if (zones.length >= 5) return { success: false, error: 'Máximo de 5 zonas por propriedade.' };
    if (zones.some((z) => z.zone_number === params.zone_number)) {
      return { success: false, error: `Zona ${params.zone_number} já existe nesta propriedade.` };
    }

    try {
      const res = await supabase
        .from('zones')
        .insert({
          property_id:    property.id,
          zone_number:    params.zone_number,
          name:           params.name,
          color:          ZONE_COLORS[params.zone_number],
          polygon_geojson: params.polygon_geojson,
        })
        .select()
        .single();

      if (res.error) throw res.error;

      // Adiciona ao store com o id real retornado pelo banco
      useMapStore.getState().addZone({
        ...params,
        id:          res.data.id,
        property_id: property.id,
        created_at:  res.data.created_at,
      });

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar zona.';
      return { success: false, error: msg };
    }
  }

  async function createElement(params: {
    zone_id:          string;
    type:             ElementType;
    geometry_geojson: GeoJSONGeometry;
    metadata_json:    ElementMetadata;
  }): Promise<{ success: boolean; error?: string }> {
    const { zones } = useMapStore.getState();
    const zone = zones.find((z) => z.id === params.zone_id);
    if (!zone) return { success: false, error: 'Zona não encontrada.' };
    if (zone.zone_number === 5 && (params.type === 'culture' || params.type === 'animal')) {
      return { success: false, error: 'Zona 5 (Silvestre) não permite culturas ou animais.' };
    }

    try {
      const res = await supabase
        .from('elements')
        .insert(params)
        .select()
        .single();

      if (res.error) throw res.error;

      // Adiciona ao store com o id real retornado pelo banco
      useMapStore.getState().addElement({
        ...params,
        id:         res.data.id,
        created_at: res.data.created_at,
      });

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar elemento.';
      return { success: false, error: msg };
    }
  }

  async function createProperty(name: string, lat?: number, lng?: number): Promise<Property> {
    const { user } = useAuthStore.getState();
    const payload: Partial<Property> = { name, user_id: user?.id };
    if (lat !== undefined && lng !== undefined) {
      payload.location = { type: 'Point', coordinates: [lng, lat] };
    }

    const res = await supabase
      .from('properties')
      .insert(payload)
      .select()
      .single();

    if (res.error) throw res.error;
    const created = res.data as Property;
    setProperty(created);
    return created;
  }

  return { loadProperty, saveProperty, createProperty, createZone, createElement, deleteProperty, deleteZone, deleteElement, updateZone, updateElement, listProperties, property };
}
