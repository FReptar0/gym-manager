-- =====================================================
-- GYM MANAGER - COMPLETE FRESH DATABASE SCHEMA
-- Updated schema with mandatory plan selection in Spanish
-- Run this file to completely reset and recreate the database
-- =====================================================

-- Drop all existing tables and functions (for fresh start)
DROP TABLE IF EXISTS measurements CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS plans CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS freeze_expired_memberships() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_last_login() CASCADE;
DROP FUNCTION IF EXISTS validate_client_plan() CASCADE;

-- Drop existing views
DROP VIEW IF EXISTS active_clients_with_plans CASCADE;
DROP VIEW IF EXISTS monthly_revenue_summary CASCADE;

-- =====================================================
-- 1. PLANS TABLE (PLANES)
-- =====================================================
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  duration_days INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_duration CHECK (duration_days > 0),
  CONSTRAINT valid_price CHECK (price >= 0),
  CONSTRAINT unique_plan_name UNIQUE (name)
);

-- =====================================================
-- 2. CLIENTS TABLE (CLIENTES) - WITH MANDATORY PLAN
-- =====================================================
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(200) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  photo_url TEXT,
  birth_date DATE,
  blood_type VARCHAR(5),
  gender VARCHAR(25),
  medical_conditions TEXT,
  emergency_contact_name VARCHAR(200),
  emergency_contact_phone VARCHAR(20),
  registration_date DATE DEFAULT CURRENT_DATE,
  current_plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
  last_payment_date DATE,
  expiration_date DATE,
  status VARCHAR(20) DEFAULT 'inactive',
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('active', 'frozen', 'inactive')),
  CONSTRAINT valid_blood_type CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') OR blood_type IS NULL),
  CONSTRAINT valid_gender CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say') OR gender IS NULL),
  CONSTRAINT valid_phone CHECK (phone ~ '^[0-9]{10}$'),
  CONSTRAINT valid_email CHECK (email IS NULL OR email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  CONSTRAINT unique_phone UNIQUE (phone)
);

-- =====================================================
-- 3. PAYMENTS TABLE (PAGOS)
-- =====================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(20) NOT NULL,
  payment_date DATE DEFAULT CURRENT_DATE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_payment_method CHECK (payment_method IN ('cash', 'transfer')),
  CONSTRAINT valid_amount CHECK (amount > 0),
  CONSTRAINT valid_period CHECK (period_end >= period_start),
  CONSTRAINT valid_payment_date CHECK (payment_date <= CURRENT_DATE + INTERVAL '1 day')
);

-- =====================================================
-- 4. MEASUREMENTS TABLE (MEDICIONES)
-- =====================================================
CREATE TABLE measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  measurement_date DATE DEFAULT CURRENT_DATE,
  weight DECIMAL(5, 2),
  height DECIMAL(5, 2),
  bmi DECIMAL(4, 2) GENERATED ALWAYS AS (
    CASE 
      WHEN height > 0 AND weight > 0 THEN 
        ROUND((weight / POWER(height / 100, 2))::NUMERIC, 2)
      ELSE NULL
    END
  ) STORED,
  chest DECIMAL(5, 2),
  waist DECIMAL(5, 2),
  hips DECIMAL(5, 2),
  arms DECIMAL(5, 2),
  legs DECIMAL(5, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_weight CHECK (weight > 0 AND weight < 500),
  CONSTRAINT valid_height CHECK (height > 0 AND height < 300),
  CONSTRAINT valid_chest CHECK (chest IS NULL OR (chest > 0 AND chest < 200)),
  CONSTRAINT valid_waist CHECK (waist IS NULL OR (waist > 0 AND waist < 200)),
  CONSTRAINT valid_hips CHECK (hips IS NULL OR (hips > 0 AND hips < 200)),
  CONSTRAINT valid_arms CHECK (arms IS NULL OR (arms > 0 AND arms < 100)),
  CONSTRAINT valid_legs CHECK (legs IS NULL OR (legs > 0 AND legs < 100)),
  CONSTRAINT unique_client_date UNIQUE (client_id, measurement_date)
);

-- =====================================================
-- 5. USER PROFILES TABLE (PERFILES DE USUARIO)
-- =====================================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(200) NOT NULL,
  role VARCHAR(20) DEFAULT 'gym_admin',
  email VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_role CHECK (role IN ('gym_admin', 'gym_staff', 'super_admin')),
  CONSTRAINT valid_email CHECK (email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$')
);

-- =====================================================
-- 6. GUEST CLIENT FOR DAILY PAYMENTS
-- =====================================================
-- Exception: Allow guest client to have NULL plan for daily payments
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_current_plan_id_fkey;
ALTER TABLE clients ADD CONSTRAINT clients_current_plan_id_fkey 
  FOREIGN KEY (current_plan_id) REFERENCES plans(id) ON DELETE RESTRICT
  DEFERRABLE INITIALLY DEFERRED;

-- =====================================================
-- 7. INDEXES FOR PERFORMANCE
-- =====================================================

-- Plans indexes
CREATE INDEX idx_plans_active ON plans(is_active);
CREATE INDEX idx_plans_price ON plans(price);

-- Clients indexes
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_expiration ON clients(expiration_date);
CREATE INDEX idx_clients_deleted ON clients(is_deleted);
CREATE INDEX idx_clients_search ON clients(full_name);
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_clients_current_plan ON clients(current_plan_id);
CREATE INDEX idx_clients_registration_date ON clients(registration_date);

-- Payments indexes
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_payments_client ON payments(client_id);
CREATE INDEX idx_payments_plan ON payments(plan_id);
CREATE INDEX idx_payments_period ON payments(period_start, period_end);
CREATE INDEX idx_payments_method ON payments(payment_method);
CREATE INDEX idx_payments_amount ON payments(amount);

-- Measurements indexes
CREATE INDEX idx_measurements_client ON measurements(client_id);
CREATE INDEX idx_measurements_date ON measurements(measurement_date);

-- User profiles indexes
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_active ON user_profiles(is_active);

-- =====================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 9. RLS POLICIES
-- =====================================================

-- Plans policies
CREATE POLICY "Plans read access for authenticated users" ON plans
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Plans full access for gym admins" ON plans
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('gym_admin', 'super_admin')
      AND is_active = true
    )
  );

-- Clients policies
CREATE POLICY "Clients full access for gym staff" ON clients
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND is_active = true
    )
  );

-- Payments policies
CREATE POLICY "Payments full access for gym staff" ON payments
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND is_active = true
    )
  );

-- Measurements policies
CREATE POLICY "Measurements full access for gym staff" ON measurements
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND is_active = true
    )
  );

-- User profiles policies
CREATE POLICY "User profiles read own" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "User profiles update own" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- =====================================================
-- 10. TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to freeze expired memberships
CREATE OR REPLACE FUNCTION freeze_expired_memberships()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE clients
  SET status = 'frozen'
  WHERE status = 'active'
    AND expiration_date < CURRENT_DATE
    AND is_deleted = false
    AND id != '00000000-0000-0000-0000-000000000001';
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Function to create user profile when auth user is created
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'gym_admin')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on auth user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to validate plan assignment
CREATE OR REPLACE FUNCTION validate_client_plan()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow guest client to have NULL plan (will be set later)
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
-- 11. USEFUL VIEWS FOR REPORTING
-- =====================================================

-- View for active clients with their current plan details
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

-- View for monthly revenue summary
CREATE VIEW monthly_revenue_summary AS
SELECT 
  DATE_TRUNC('month', payment_date) as month,
  COUNT(*) as payment_count,
  SUM(amount) as total_revenue,
  AVG(amount) as avg_payment,
  COUNT(DISTINCT client_id) as unique_clients
FROM payments
GROUP BY DATE_TRUNC('month', payment_date)
ORDER BY month DESC;

-- =====================================================
-- 12. INITIAL SEED DATA (DATOS INICIALES)
-- =====================================================

-- Default Plans (Spanish)
INSERT INTO plans (id, name, duration_days, price, description, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Pase Diario', 1, 50.00, 'Entrada de un solo día - perfecto para probar el gimnasio', true),
  ('22222222-2222-2222-2222-222222222222', 'Semanal', 7, 150.00, 'Membresía semanal - ideal para compromisos a corto plazo', true),
  ('33333333-3333-3333-3333-333333333333', 'Mensual', 30, 500.00, 'Membresía mensual - la opción más popular', true),
  ('44444444-4444-4444-4444-444444444444', 'Trimestral', 90, 1350.00, 'Membresía trimestral - ahorra 10%', true),
  ('55555555-5555-5555-5555-555555555555', 'Anual', 365, 4800.00, 'Membresía anual - ahorra 20% (mejor valor)', true),
  ('00000000-0000-0000-0000-000000000002', 'Sin Plan', 1, 0.00, 'Cliente sin plan asignado - requiere asignación de plan', false);

-- Guest client for daily payments
INSERT INTO clients (
  id, 
  full_name, 
  phone, 
  email,
  registration_date,
  current_plan_id,
  status,
  is_deleted
) VALUES (
  '00000000-0000-0000-0000-000000000001', 
  'Invitado / Diario', 
  '0000000000', 
  NULL,
  CURRENT_DATE,
  '11111111-1111-1111-1111-111111111111', -- Daily plan for guests
  'active',
  false
);

-- =====================================================
-- SCHEMA COMPLETE
-- =====================================================

-- Print summary
DO $$
DECLARE
  plan_count INTEGER;
  client_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO plan_count FROM plans;
  SELECT COUNT(*) INTO client_count FROM clients;
  
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'ESQUEMA DE BASE DE DATOS COMPLETO:';
  RAISE NOTICE 'Planes creados: %', plan_count;
  RAISE NOTICE 'Clientes creados: %', client_count;
  RAISE NOTICE 'Selección de plan ahora es obligatoria';
  RAISE NOTICE 'Interfaz en español configurada';
  RAISE NOTICE '==============================================';
END $$;