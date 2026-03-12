-- =====================
-- Row Level Security
-- =====================
-- MVP: acesso público irrestrito (sem autenticação)
-- V1: substituir por políticas baseadas em auth.uid()

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones      ENABLE ROW LEVEL SECURITY;
ALTER TABLE elements   ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas para MVP (sem auth)
CREATE POLICY "public_all_properties" ON properties FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_zones"      ON zones      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_elements"   ON elements   FOR ALL USING (true) WITH CHECK (true);
