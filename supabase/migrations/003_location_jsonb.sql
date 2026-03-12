-- =====================
-- Migration 003: location GEOGRAPHY → JSONB
-- =====================
-- PostgREST não serializa colunas GEOGRAPHY via REST API sem configuração
-- adicional. Para o MVP, armazenar o GeoJSON como JSONB é suficiente e
-- elimina erros 500 em qualquer SELECT/INSERT na tabela properties.

ALTER TABLE properties
  ALTER COLUMN location TYPE JSONB
  USING CASE
    WHEN location IS NULL THEN NULL
    ELSE ST_AsGeoJSON(location)::JSONB
  END;
