-- =====================
-- Migration 007: Trigger de segurança — preenche user_id automaticamente
-- =====================
-- Garante que properties sempre tenham user_id = auth.uid() no INSERT,
-- mesmo que o frontend esqueça de enviar o campo.

CREATE OR REPLACE FUNCTION set_property_user_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_set_property_user_id
  BEFORE INSERT ON properties
  FOR EACH ROW EXECUTE FUNCTION set_property_user_id();
