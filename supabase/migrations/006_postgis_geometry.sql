-- =====================
-- Migration 006: Colunas PostGIS + Triggers de Sync + Índices Espaciais
-- =====================
-- Adiciona colunas geometry nativas para habilitar:
--   - ST_Contains (verificar se elemento está dentro da zona)
--   - ST_Intersects (sobreposição de zonas)
--   - ST_Area / ST_Perimeter (métricas por zona)
-- As colunas JSONB são mantidas como fonte de verdade para o REST API.
-- Os triggers sincronizam automaticamente ao gravar via PostgREST.

-- =====================
-- zones.polygon_geom
-- =====================
ALTER TABLE zones
  ADD COLUMN polygon_geom geometry(Geometry, 4326);

-- Backfill de dados existentes
UPDATE zones
  SET polygon_geom = ST_GeomFromGeoJSON(polygon_geojson::text)
  WHERE polygon_geojson IS NOT NULL
    AND polygon_geojson::text <> 'null';

-- Trigger: mantém polygon_geom sincronizado com polygon_geojson
CREATE OR REPLACE FUNCTION sync_zone_geometry()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.polygon_geojson IS NOT NULL AND NEW.polygon_geojson::text <> 'null' THEN
    NEW.polygon_geom := ST_GeomFromGeoJSON(NEW.polygon_geojson::text);
  ELSE
    NEW.polygon_geom := NULL;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_zone_geometry
  BEFORE INSERT OR UPDATE OF polygon_geojson ON zones
  FOR EACH ROW EXECUTE FUNCTION sync_zone_geometry();

-- Índice espacial GIST para buscas por área/interseção
CREATE INDEX idx_zones_polygon_geom ON zones USING GIST (polygon_geom);

-- =====================
-- elements.geom
-- =====================
ALTER TABLE elements
  ADD COLUMN geom geometry(Geometry, 4326);

-- Backfill de dados existentes
UPDATE elements
  SET geom = ST_GeomFromGeoJSON(geometry_geojson::text)
  WHERE geometry_geojson IS NOT NULL
    AND geometry_geojson::text <> 'null';

-- Trigger: mantém geom sincronizado com geometry_geojson
CREATE OR REPLACE FUNCTION sync_element_geometry()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.geometry_geojson IS NOT NULL AND NEW.geometry_geojson::text <> 'null' THEN
    NEW.geom := ST_GeomFromGeoJSON(NEW.geometry_geojson::text);
  ELSE
    NEW.geom := NULL;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_element_geometry
  BEFORE INSERT OR UPDATE OF geometry_geojson ON elements
  FOR EACH ROW EXECUTE FUNCTION sync_element_geometry();

-- Índice espacial GIST
CREATE INDEX idx_elements_geom ON elements USING GIST (geom);

-- =====================
-- View: zone_stats
-- =====================
-- Métricas por zona prontas para relatórios (Edge Function ou frontend).
CREATE OR REPLACE VIEW zone_stats AS
SELECT
  z.id                                           AS zone_id,
  z.property_id,
  z.zone_number,
  z.name                                         AS zone_name,
  COUNT(e.id)                                    AS element_count,
  -- Área em hectares (GEOGRAPHY para cálculo geodésico preciso)
  ROUND(
    (ST_Area(z.polygon_geom::geography) / 10000)::numeric,
    4
  )                                              AS area_ha,
  -- Perímetro em metros
  ROUND(
    ST_Perimeter(z.polygon_geom::geography)::numeric,
    2
  )                                              AS perimeter_m,
  COUNT(e.id) FILTER (WHERE e.type = 'poi')      AS poi_count,
  COUNT(e.id) FILTER (WHERE e.type = 'culture')  AS culture_count,
  COUNT(e.id) FILTER (WHERE e.type = 'animal')   AS animal_count,
  COUNT(e.id) FILTER (WHERE e.type = 'fence')    AS fence_count
FROM zones z
LEFT JOIN elements e ON e.zone_id = z.id
GROUP BY z.id, z.property_id, z.zone_number, z.name, z.polygon_geom;

-- =====================
-- Função utilitária: elementos fora da zona
-- =====================
-- Retorna elementos cujo centróide não está dentro do polígono da zona.
-- Útil para validação de integridade de dados.
CREATE OR REPLACE FUNCTION elements_outside_zone(p_zone_id UUID)
RETURNS TABLE (element_id UUID, element_type TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT e.id, e.type
  FROM elements e
  JOIN zones z ON z.id = e.zone_id
  WHERE e.zone_id = p_zone_id
    AND e.geom IS NOT NULL
    AND z.polygon_geom IS NOT NULL
    AND NOT ST_Contains(z.polygon_geom, ST_Centroid(e.geom));
$$;
