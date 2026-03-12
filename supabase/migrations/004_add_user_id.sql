-- =====================
-- Migration 004: user_id em properties
-- =====================
-- Adiciona vínculo entre propriedade e usuário autenticado.
-- Nullable para não quebrar dados de teste existentes do MVP.
-- A constraint NOT NULL pode ser adicionada após limpeza de dados legados.

ALTER TABLE properties
  ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Índice para filtros por usuário (SELECT WHERE user_id = auth.uid())
CREATE INDEX idx_properties_user_id ON properties (user_id);
