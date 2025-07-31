-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'distributor', 'client', 'beneficiary')) DEFAULT 'client',
  company_name TEXT,
  cnpj TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create consumer_units table
CREATE TABLE consumer_units (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  installation_number TEXT UNIQUE NOT NULL,
  distributor_id TEXT NOT NULL,
  monthly_consumption DECIMAL(10,2) NOT NULL DEFAULT 0,
  tariff_class TEXT NOT NULL,
  status TEXT CHECK (status IN ('active', 'inactive', 'pending')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create generating_units table
CREATE TABLE generating_units (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  capacity_kw DECIMAL(10,2) NOT NULL,
  distributor_id TEXT NOT NULL,
  status TEXT CHECK (status IN ('active', 'inactive', 'maintenance')) DEFAULT 'active',
  installation_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create energy_readings table
CREATE TABLE energy_readings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  generating_unit_id UUID REFERENCES generating_units(id) ON DELETE CASCADE NOT NULL,
  reading_date DATE NOT NULL,
  generated_kwh DECIMAL(10,2) NOT NULL DEFAULT 0,
  injected_kwh DECIMAL(10,2) NOT NULL DEFAULT 0,
  consumed_kwh DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(generating_unit_id, reading_date)
);

-- Create invoices table
CREATE TABLE invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  consumer_unit_id UUID REFERENCES consumer_units(id) ON DELETE CASCADE NOT NULL,
  invoice_number TEXT UNIQUE NOT NULL,
  reference_month TEXT NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  energy_consumed DECIMAL(10,2) NOT NULL DEFAULT 0,
  energy_compensated DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')) DEFAULT 'pending',
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create energy_compensation table
CREATE TABLE energy_compensation (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  consumer_unit_id UUID REFERENCES consumer_units(id) ON DELETE CASCADE NOT NULL,
  generating_unit_id UUID REFERENCES generating_units(id) ON DELETE CASCADE NOT NULL,
  reference_month TEXT NOT NULL,
  allocated_kwh DECIMAL(10,2) NOT NULL DEFAULT 0,
  compensation_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(consumer_unit_id, generating_unit_id, reference_month)
);

-- Create energy_vault table (cofre de energia)
CREATE TABLE energy_vault (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  consumer_unit_id UUID REFERENCES consumer_units(id) ON DELETE CASCADE NOT NULL,
  month_year TEXT NOT NULL,
  available_kwh DECIMAL(10,2) NOT NULL DEFAULT 0,
  used_kwh DECIMAL(10,2) NOT NULL DEFAULT 0,
  expired_kwh DECIMAL(10,2) NOT NULL DEFAULT 0,
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(consumer_unit_id, month_year)
);

-- Create contracts table
CREATE TABLE contracts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  contract_number TEXT UNIQUE NOT NULL,
  contract_type TEXT CHECK (contract_type IN ('generation', 'consumption', 'shared')) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT CHECK (status IN ('draft', 'pending_signature', 'active', 'cancelled', 'expired')) DEFAULT 'draft',
  digital_signature_url TEXT,
  pdf_url TEXT,
  terms TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create support_tickets table
CREATE TABLE support_tickets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT CHECK (category IN ('technical', 'billing', 'general', 'urgent')) DEFAULT 'general',
  status TEXT CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  assigned_to UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumer_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE generating_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_compensation ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Consumer units policies
CREATE POLICY "Users can view own consumer units" ON consumer_units FOR SELECT USING (
  profile_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'distributor'))
);

-- Add indexes for performance
CREATE INDEX idx_consumer_units_profile_id ON consumer_units(profile_id);
CREATE INDEX idx_energy_readings_generating_unit_id ON energy_readings(generating_unit_id);
CREATE INDEX idx_energy_readings_date ON energy_readings(reading_date);
CREATE INDEX idx_invoices_consumer_unit_id ON invoices(consumer_unit_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
