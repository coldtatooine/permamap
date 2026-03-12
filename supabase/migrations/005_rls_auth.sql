-- =====================
-- Migration 005: RLS baseado em auth.uid()
-- =====================
-- Substitui as políticas públicas do MVP por políticas restritas por usuário.
-- Cada usuário só acessa dados de suas próprias propriedades (e zonas/elementos
-- vinculados a elas transitivamente).

-- Remover políticas abertas do MVP
DROP POLICY IF EXISTS "public_all_properties" ON properties;
DROP POLICY IF EXISTS "public_all_zones"      ON zones;
DROP POLICY IF EXISTS "public_all_elements"   ON elements;

-- =====================
-- properties: acesso direto via user_id
-- =====================
CREATE POLICY "owner_select_properties" ON properties
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "owner_insert_properties" ON properties
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owner_update_properties" ON properties
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owner_delete_properties" ON properties
  FOR DELETE USING (auth.uid() = user_id);

-- =====================
-- zones: acesso transitivo via property
-- =====================
-- Usamos uma função auxiliar para evitar repetir o subquery e
-- garantir que o planner possa fazer cache do resultado por linha.
CREATE OR REPLACE FUNCTION is_zone_owner(p_property_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM properties
    WHERE id = p_property_id
      AND user_id = auth.uid()
  );
$$;

CREATE POLICY "owner_select_zones" ON zones
  FOR SELECT USING (is_zone_owner(property_id));

CREATE POLICY "owner_insert_zones" ON zones
  FOR INSERT WITH CHECK (is_zone_owner(property_id));

CREATE POLICY "owner_update_zones" ON zones
  FOR UPDATE USING (is_zone_owner(property_id))
  WITH CHECK (is_zone_owner(property_id));

CREATE POLICY "owner_delete_zones" ON zones
  FOR DELETE USING (is_zone_owner(property_id));

-- =====================
-- elements: acesso transitivo via zone → property
-- =====================
CREATE OR REPLACE FUNCTION is_element_owner(p_zone_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM zones z
    JOIN properties p ON p.id = z.property_id
    WHERE z.id = p_zone_id
      AND p.user_id = auth.uid()
  );
$$;

CREATE POLICY "owner_select_elements" ON elements
  FOR SELECT USING (is_element_owner(zone_id));

CREATE POLICY "owner_insert_elements" ON elements
  FOR INSERT WITH CHECK (is_element_owner(zone_id));

CREATE POLICY "owner_update_elements" ON elements
  FOR UPDATE USING (is_element_owner(zone_id))
  WITH CHECK (is_element_owner(zone_id));

CREATE POLICY "owner_delete_elements" ON elements
  FOR DELETE USING (is_element_owner(zone_id));
