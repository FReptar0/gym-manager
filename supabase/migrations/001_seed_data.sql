-- =====================================================
-- GYM MANAGER - SEED DATA
-- Initial data for development and production
-- =====================================================

-- =====================================================
-- 1. DEFAULT PLANS
-- =====================================================
INSERT INTO plans (id, name, duration_days, price, description, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Per Class', 1, 50.00, 'Single class entry - perfect for trying out the gym', true),
  ('22222222-2222-2222-2222-222222222222', 'Weekly', 7, 150.00, 'Weekly membership - great for short-term commitments', true),
  ('33333333-3333-3333-3333-333333333333', 'Monthly', 30, 500.00, 'Monthly membership - most popular choice', true),
  ('44444444-4444-4444-4444-444444444444', 'Quarterly', 90, 1350.00, 'Quarterly membership - save 10%', true),
  ('55555555-5555-5555-5555-555555555555', 'Annual', 365, 4800.00, 'Annual membership - save 20% (best value)', true);

-- =====================================================
-- 2. SPECIAL GUEST CLIENT
-- =====================================================
-- This client is used for daily/per-class payments without creating a full client profile
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
  'Guest / Daily', 
  '0000000000', 
  NULL,
  CURRENT_DATE,
  NULL,
  'active',
  false
);

-- =====================================================
-- 3. SAMPLE CLIENTS (for development/demo)
-- =====================================================
-- Only insert sample clients if this is a development environment
-- Remove this section for production deployment

DO $$
BEGIN
  -- Check if we're in development (you can modify this condition)
  IF CURRENT_SETTING('application_name', true) LIKE '%development%' OR 
     CURRENT_SETTING('server_version', true) LIKE '%localhost%' THEN
    
    INSERT INTO clients (
      id,
      full_name, 
      phone, 
      email, 
      birth_date,
      blood_type,
      gender,
      registration_date,
      current_plan_id,
      last_payment_date,
      expiration_date,
      status
    ) VALUES
      (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'Ana García', 
        '5551234567', 
        'ana.garcia@email.com', 
        '1990-05-15',
        'O+',
        'female',
        CURRENT_DATE - INTERVAL '30 days',
        '33333333-3333-3333-3333-333333333333', -- Monthly plan
        CURRENT_DATE - INTERVAL '5 days',
        CURRENT_DATE + INTERVAL '25 days',
        'active'
      ),
      (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'Carlos Rodríguez', 
        '5559876543', 
        'carlos.rodriguez@email.com', 
        '1985-12-03',
        'A+',
        'male',
        CURRENT_DATE - INTERVAL '60 days',
        '22222222-2222-2222-2222-222222222222', -- Weekly plan
        CURRENT_DATE - INTERVAL '10 days',
        CURRENT_DATE - INTERVAL '3 days', -- Expired
        'frozen'
      ),
      (
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        'María López', 
        '5555555555', 
        'maria.lopez@email.com', 
        '1995-08-20',
        'B-',
        'female',
        CURRENT_DATE - INTERVAL '90 days',
        '55555555-5555-5555-5555-555555555555', -- Annual plan
        CURRENT_DATE - INTERVAL '2 days',
        CURRENT_DATE + INTERVAL '273 days',
        'active'
      ),
      (
        'dddddddd-dddd-dddd-dddd-dddddddddddd',
        'Pedro Martínez', 
        '5552468135', 
        NULL, -- No email
        '1988-03-10',
        NULL,
        'male',
        CURRENT_DATE - INTERVAL '15 days',
        NULL, -- No current plan
        NULL,
        NULL,
        'inactive'
      );

    -- =====================================================
    -- 4. SAMPLE PAYMENTS (for development/demo)
    -- =====================================================
    INSERT INTO payments (
      client_id,
      plan_id,
      amount,
      payment_method,
      payment_date,
      period_start,
      period_end,
      notes
    ) VALUES
      -- Ana's payment (monthly)
      (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '33333333-3333-3333-3333-333333333333',
        500.00,
        'transfer',
        CURRENT_DATE - INTERVAL '5 days',
        CURRENT_DATE - INTERVAL '5 days',
        CURRENT_DATE + INTERVAL '25 days',
        'Monthly membership renewal'
      ),
      -- Carlos's payment (weekly - expired)
      (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '22222222-2222-2222-2222-222222222222',
        150.00,
        'cash',
        CURRENT_DATE - INTERVAL '10 days',
        CURRENT_DATE - INTERVAL '10 days',
        CURRENT_DATE - INTERVAL '3 days',
        'Weekly membership'
      ),
      -- María's payment (annual)
      (
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        '55555555-5555-5555-5555-555555555555',
        4800.00,
        'transfer',
        CURRENT_DATE - INTERVAL '2 days',
        CURRENT_DATE - INTERVAL '2 days',
        CURRENT_DATE + INTERVAL '363 days',
        'Annual membership - full payment'
      ),
      -- Some guest payments
      (
        '00000000-0000-0000-0000-000000000001',
        '11111111-1111-1111-1111-111111111111',
        50.00,
        'cash',
        CURRENT_DATE - INTERVAL '3 days',
        CURRENT_DATE - INTERVAL '3 days',
        CURRENT_DATE - INTERVAL '3 days',
        'Daily visitor'
      ),
      (
        '00000000-0000-0000-0000-000000000001',
        '11111111-1111-1111-1111-111111111111',
        50.00,
        'cash',
        CURRENT_DATE - INTERVAL '1 day',
        CURRENT_DATE - INTERVAL '1 day',
        CURRENT_DATE - INTERVAL '1 day',
        'Daily visitor'
      );

    -- =====================================================
    -- 5. SAMPLE MEASUREMENTS (for development/demo)
    -- =====================================================
    INSERT INTO measurements (
      client_id,
      measurement_date,
      weight,
      height,
      chest,
      waist,
      hips,
      notes
    ) VALUES
      -- Ana's measurements
      (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        CURRENT_DATE - INTERVAL '30 days',
        65.5,
        168.0,
        90.0,
        75.0,
        95.0,
        'Initial measurements'
      ),
      (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        CURRENT_DATE - INTERVAL '15 days',
        64.8,
        168.0,
        89.5,
        74.0,
        94.5,
        'Progress check - lost some weight'
      ),
      -- Carlos's measurements
      (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        CURRENT_DATE - INTERVAL '45 days',
        82.0,
        175.0,
        105.0,
        95.0,
        102.0,
        'Starting measurements'
      ),
      -- María's measurements
      (
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        CURRENT_DATE - INTERVAL '60 days',
        58.0,
        162.0,
        85.0,
        68.0,
        88.0,
        'Initial assessment'
      );
      
    RAISE NOTICE 'Sample data inserted for development environment';
  ELSE
    RAISE NOTICE 'Production environment detected - skipping sample data';
  END IF;
END $$;

-- =====================================================
-- 6. SET SEQUENCES (if needed)
-- =====================================================
-- Note: Using UUIDs so no sequences needed

-- =====================================================
-- SEED DATA COMPLETE
-- =====================================================

-- Print summary
DO $$
DECLARE
  plan_count INTEGER;
  client_count INTEGER;
  payment_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO plan_count FROM plans;
  SELECT COUNT(*) INTO client_count FROM clients;
  SELECT COUNT(*) INTO payment_count FROM payments;
  
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'SEED DATA SUMMARY:';
  RAISE NOTICE 'Plans created: %', plan_count;
  RAISE NOTICE 'Clients created: %', client_count;
  RAISE NOTICE 'Payments created: %', payment_count;
  RAISE NOTICE '==============================================';
END $$;