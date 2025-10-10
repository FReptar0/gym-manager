-- =====================================================
-- GYM MANAGER - Make Plan Selection Mandatory for Clients
-- Update schema to require plan selection
-- =====================================================

-- First, let's handle existing clients without plans by assigning a default plan
-- We'll create a "Sin Plan" (No Plan) option for existing clients
INSERT INTO plans (id, name, duration_days, price, description, is_active) VALUES
  ('00000000-0000-0000-0000-000000000002', 'Sin Plan', 1, 0.00, 'Cliente sin plan asignado - requiere asignación de plan', false)
ON CONFLICT (id) DO NOTHING;

-- Update existing clients that don't have a plan
UPDATE clients 
SET current_plan_id = '00000000-0000-0000-0000-000000000002'
WHERE current_plan_id IS NULL 
  AND id != '00000000-0000-0000-0000-000000000001'; -- Don't update the guest client

-- Now make the current_plan_id column NOT NULL for new clients
-- We'll add a constraint that requires a plan for all non-guest clients
ALTER TABLE clients 
ADD CONSTRAINT clients_must_have_plan 
CHECK (
  -- Guest client can have NULL plan
  id = '00000000-0000-0000-0000-000000000001' 
  OR 
  -- All other clients must have a plan
  current_plan_id IS NOT NULL
);

-- Add an index to improve performance on plan lookups
CREATE INDEX IF NOT EXISTS idx_clients_plan_requirement ON clients(current_plan_id) 
WHERE current_plan_id IS NOT NULL;

-- Update the view to reflect the new plan requirement
DROP VIEW IF EXISTS active_clients_with_plans;
CREATE VIEW active_clients_with_plans AS
SELECT 
  c.*,
  p.name as plan_name,
  p.duration_days,
  p.price as plan_price,
  CASE 
    WHEN c.current_plan_id = '00000000-0000-0000-0000-000000000002' THEN 'no_plan'
    WHEN c.expiration_date < CURRENT_DATE THEN 'expired'
    WHEN c.expiration_date <= CURRENT_DATE + INTERVAL '3 days' THEN 'expiring_soon'
    ELSE 'active'
  END as membership_status
FROM clients c
LEFT JOIN plans p ON c.current_plan_id = p.id
WHERE c.is_deleted = false
  AND c.id != '00000000-0000-0000-0000-000000000001';

-- Add a function to validate plan assignment when creating/updating clients
CREATE OR REPLACE FUNCTION validate_client_plan()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow guest client to have NULL plan
  IF NEW.id = '00000000-0000-0000-0000-000000000001' THEN
    RETURN NEW;
  END IF;
  
  -- For all other clients, require a valid plan
  IF NEW.current_plan_id IS NULL THEN
    RAISE EXCEPTION 'Todos los clientes deben tener un plan asignado';
  END IF;
  
  -- Check if the plan exists and is valid
  IF NOT EXISTS (SELECT 1 FROM plans WHERE id = NEW.current_plan_id) THEN
    RAISE EXCEPTION 'El plan seleccionado no existe';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate plan assignment
CREATE TRIGGER validate_client_plan_trigger
  BEFORE INSERT OR UPDATE ON clients
  FOR EACH ROW 
  EXECUTE FUNCTION validate_client_plan();

-- =====================================================
-- PRINT SUMMARY
-- =====================================================
DO $$
DECLARE
  clients_updated INTEGER;
  clients_with_plans INTEGER;
BEGIN
  SELECT COUNT(*) INTO clients_updated 
  FROM clients 
  WHERE current_plan_id = '00000000-0000-0000-0000-000000000002';
  
  SELECT COUNT(*) INTO clients_with_plans 
  FROM clients 
  WHERE current_plan_id IS NOT NULL 
    AND id != '00000000-0000-0000-0000-000000000001';
  
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'PLAN REQUIREMENT UPDATE COMPLETE:';
  RAISE NOTICE 'Clients assigned default "Sin Plan": %', clients_updated;
  RAISE NOTICE 'Total clients with plans: %', clients_with_plans;
  RAISE NOTICE 'Plan selection is now mandatory for new clients';
  RAISE NOTICE '==============================================';
END $$;