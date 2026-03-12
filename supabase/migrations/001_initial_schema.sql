-- Habilitar extensão PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- =====================
-- Tabela: properties
-- =====================
CREATE TABLE properties (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  location   GEOGRAPHY(Point, 4326),  -- ponto central da propriedade
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- Tabela: zones
-- =====================
-- Regras:
--   zone_number deve ser 0..5
--   não pode haver dois números iguais na mesma propriedade
CREATE TABLE zones (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id     UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  zone_number     INTEGER NOT NULL CHECK (zone_number BETWEEN 0 AND 5),
  name            TEXT NOT NULL,
  color           TEXT NOT NULL,
  polygon_geojson JSONB NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (property_id, zone_number)
);

-- Índice para buscas por propriedade
CREATE INDEX idx_zones_property_id ON zones (property_id);

-- =====================
-- Tabela: elements
-- =====================
-- Tipos: poi | culture | animal | fence
CREATE TABLE elements (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id          UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  type             TEXT NOT NULL CHECK (type IN ('poi', 'culture', 'animal', 'fence')),
  geometry_geojson JSONB NOT NULL,
  metadata_json    JSONB NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para buscas por zona
CREATE INDEX idx_elements_zone_id ON elements (zone_id);
