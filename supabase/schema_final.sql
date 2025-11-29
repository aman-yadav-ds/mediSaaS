-- ==============================================================================
-- FINAL CONSOLIDATED SCHEMA
-- This script prunes the existing public schema and rebuilds it from scratch.
-- ==============================================================================

-- 1. CLEANUP (Prune everything)
DROP TABLE IF EXISTS public.invoice_items CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.prescriptions CASCADE;
DROP TABLE IF EXISTS public.vitals CASCADE;
DROP TABLE IF EXISTS public.visits CASCADE;
DROP TABLE IF EXISTS public.patients CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.departments CASCADE;
DROP TABLE IF EXISTS public.hospitals CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.get_my_hospital_id();

-- ==============================================================================
-- 2. TABLE DEFINITIONS
-- ==============================================================================

-- 2.1 Hospitals (Tenants)
CREATE TABLE public.hospitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  subscription_status text DEFAULT 'active' -- 'active', 'past_due'
);

-- 2.2 Departments (New Table)
CREATE TABLE public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id uuid REFERENCES public.hospitals(id) NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(hospital_id, name)
);

-- 2.3 Profiles (Users)
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text,
  full_name text,
  hospital_id uuid REFERENCES public.hospitals(id),
  role text CHECK (role IN ('owner', 'doctor', 'nurse', 'receptionist')),
  department text, -- Added department column
  created_at timestamp with time zone DEFAULT now()
);

-- 2.3 Patients
CREATE TABLE public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id uuid REFERENCES public.hospitals(id) NOT NULL,
  full_name text NOT NULL,
  age int,
  gender text,
  contact_number text,
  aadhar_number text, -- Added for search functionality
  status text DEFAULT 'waiting_reception', -- 'waiting_vitals', 'waiting_doctor', 'completed'
  assigned_doctor_id uuid REFERENCES public.profiles(id),
  chief_complaint text,
  created_at timestamp with time zone DEFAULT now()
);

-- 2.4 Visits (New Table Definition)
CREATE TABLE public.visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id uuid REFERENCES public.hospitals(id) NOT NULL,
  patient_id uuid REFERENCES public.patients(id) NOT NULL,
  visit_id uuid REFERENCES public.visits(id), -- Optional link to visit
  recorded_by uuid REFERENCES public.profiles(id),
  blood_pressure text,
  heart_rate int,
  temperature decimal,
  oxygen_level int,
  visit_date timestamp with time zone DEFAULT now(),
  status text DEFAULT 'waiting_vitals' CHECK (status IN ('waiting_vitals', 'waiting_doctor', 'waiting_billing', 'completed', 'cancelled')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  chief_complaint text,
  is_emergency boolean DEFAULT false,
  recorded_at timestamp with time zone DEFAULT now()
);

-- 2.6 Prescriptions
CREATE TABLE public.prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id uuid REFERENCES public.hospitals(id) NOT NULL,
  patient_id uuid REFERENCES public.patients(id) NOT NULL,
  visit_id uuid REFERENCES public.visits(id), -- Optional link to visit
  doctor_id uuid REFERENCES public.profiles(id),
  diagnosis text,
  medications jsonb, -- [{"name": "Panadol", "dosage": "500mg"}]
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- 2.7 Invoices
CREATE TABLE public.invoices (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    hospital_id uuid REFERENCES public.hospitals(id) NOT NULL,
    visit_id uuid REFERENCES public.visits(id),
    patient_id uuid REFERENCES public.patients(id) NOT NULL,
    total_amount decimal(10, 2) NOT NULL DEFAULT 0.00,
    status text DEFAULT 'paid' CHECK (status IN ('paid', 'refunded')),
    payment_method text DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'upi', 'insurance'))
);

-- 2.8 Invoice Items
CREATE TABLE public.invoice_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    invoice_id uuid REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
    description text NOT NULL,
    quantity integer DEFAULT 1,
    unit_price decimal(10, 2) NOT NULL,
    total decimal(10, 2) NOT NULL
);

-- ==============================================================================
-- 3. SECURITY (RLS & Policies)
-- ==============================================================================

-- Enable RLS
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- 3.1 Helper Function (Prevents Recursion)
CREATE OR REPLACE FUNCTION public.get_my_hospital_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT hospital_id FROM public.profiles WHERE id = auth.uid();
$$;

-- 3.2 Profiles Policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can see coworkers" ON public.profiles
  FOR SELECT USING (hospital_id = get_my_hospital_id());

-- 3.3 Hospitals Policies
CREATE POLICY "Users can see own hospital" ON public.hospitals
  FOR SELECT USING (id = get_my_hospital_id());

-- 3.4 Departments Policies
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant Isolation for Departments" ON public.departments
  FOR ALL USING (hospital_id = get_my_hospital_id());

-- 3.5 Data Isolation Policies (Generic)
-- Applies to: patients, visits, vitals, prescriptions, invoices
-- We can use a shared logic: hospital_id must match user's hospital_id

CREATE POLICY "Tenant Isolation for Patients" ON public.patients
  FOR ALL USING (hospital_id = get_my_hospital_id());

CREATE POLICY "Tenant Isolation for Visits" ON public.visits
  FOR ALL USING (hospital_id = get_my_hospital_id());

CREATE POLICY "Tenant Isolation for Vitals" ON public.vitals
  FOR ALL USING (hospital_id = get_my_hospital_id());

CREATE POLICY "Tenant Isolation for Prescriptions" ON public.prescriptions
  FOR ALL USING (hospital_id = get_my_hospital_id());

CREATE POLICY "Tenant Isolation for Invoices" ON public.invoices
  FOR ALL USING (hospital_id = get_my_hospital_id());

-- 3.5 Invoice Items Policy (Indirect link via invoice)
CREATE POLICY "Tenant Isolation for Invoice Items" ON public.invoice_items
  FOR ALL USING (
    invoice_id IN (
      SELECT id FROM public.invoices WHERE hospital_id = get_my_hospital_id()
    )
  );

-- ==============================================================================
-- END OF SCHEMA
-- ==============================================================================
