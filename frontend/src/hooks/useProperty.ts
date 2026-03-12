import { supabase } from '../lib/supabase';
import { useMapStore } from '../store/useMapStore';
import type { Property, Zone, Element } from '../types';

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

  async function createProperty(name: string, lat?: number, lng?: number): Promise<Property> {
    const payload: Partial<Property> = { name };
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

  return { loadProperty, saveProperty, createProperty, deleteProperty, deleteElement, updateElement, listProperties, property };
}
