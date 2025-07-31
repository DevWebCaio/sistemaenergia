-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (in correct order due to dependencies)
DROP TABLE IF EXISTS energy_readings CASCADE;
DROP TABLE IF EXISTS energy_vaults CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS contracts CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS power_plants CASCADE;

-- Create settings table first (no dependencies)
CREATE TABLE settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create power_plants table with correct column names
CREATE TABLE power_plants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) NOT NULL,
  installed_power_kwp DECIMAL(10,2) NOT NULL,
  operation_date DATE NOT NULL,
  linked_consumer_unit_id UUID REFERENCES consumer_units(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  address TEXT,
  distributor_company VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invoices table
CREATE TABLE invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  consumer_unit_id UUID REFERENCES consumer_units(id) ON DELETE CASCADE,
  reference_month DATE NOT NULL,
  energy_received DECIMAL(10,2) DEFAULT 0,
  energy_compensated DECIMAL(10,2) DEFAULT 0,
  balance_kwh DECIMAL(10,2) GENERATED ALWAYS AS (energy_received - energy_compensated) STORED,
  total_amount DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  due_date DATE,
  payment_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  consumer_unit_id UUID REFERENCES consumer_units(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  payment_date DATE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'scheduled')),
  payment_method VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contracts table
CREATE TABLE contracts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  contract_number VARCHAR(50) UNIQUE NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255),
  client_phone VARCHAR(20),
  consumer_unit_id UUID REFERENCES consumer_units(id) ON DELETE SET NULL,
  contract_type VARCHAR(20) DEFAULT 'generation' CHECK (contract_type IN ('generation', 'consumption', 'shared')),
  start_date DATE NOT NULL,
  end_date DATE,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_signature', 'active', 'cancelled', 'expired')),
  pdf_url TEXT,
  digital_signature_url TEXT,
  terms TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clients table for CRM
CREATE TABLE clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  company_name VARCHAR(255),
  cnpj VARCHAR(18),
  stage VARCHAR(20) DEFAULT 'lead' CHECK (stage IN ('lead', 'contacted', 'proposal_sent', 'contract_signed', 'activated')),
  source VARCHAR(100),
  notes TEXT,
  assigned_to VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create energy_readings table
CREATE TABLE energy_readings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  consumer_unit_id UUID REFERENCES consumer_units(id) ON DELETE CASCADE,
  reading_date DATE NOT NULL,
  energy_consumed DECIMAL(10,2) DEFAULT 0,
  energy_generated DECIMAL(10,2) DEFAULT 0,
  energy_injected DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create energy_vaults table for energy credits
CREATE TABLE energy_vaults (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  consumer_unit_id UUID REFERENCES consumer_units(id) ON DELETE CASCADE,
  balance_kwh DECIMAL(10,2) DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO settings (key, value, description, category) VALUES
('tariff_rate', '0.65', 'Taxa tarifária por kWh (R$)', 'billing'),
('compensation_rate', '0.95', 'Taxa de compensação de energia', 'billing'),
('invoice_due_days', '30', 'Dias para vencimento da fatura', 'billing'),
('auto_notifications', 'true', 'Ativar notificações automáticas', 'system'),
('whatsapp_api_key', '', 'Chave da API do WhatsApp', 'integrations'),
('email_api_key', '', 'Chave da API de Email', 'integrations'),
('payment_gateway_key', '', 'Chave do Gateway de Pagamento', 'integrations'),
('default_user_role', 'client', 'Função padrão para novos usuários', 'users'),
('require_2fa', 'true', 'Exigir autenticação de dois fatores', 'security'),
('auto_logout', 'true', 'Logout automático por inatividade', 'security');

-- Create indexes for better performance
CREATE INDEX idx_settings_category ON settings(category);
CREATE INDEX idx_settings_key ON settings(key);
CREATE INDEX idx_power_plants_status ON power_plants(status);
CREATE INDEX idx_power_plants_linked_consumer_unit ON power_plants(linked_consumer_unit_id);
CREATE INDEX idx_invoices_consumer_unit_id ON invoices(consumer_unit_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_payments_consumer_unit_id ON payments(consumer_unit_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_clients_stage ON clients(stage);
CREATE INDEX idx_energy_readings_uc_date ON energy_readings(consumer_unit_id, reading_date);

-- Enable RLS (Row Level Security)
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE power_plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_vaults ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all for now - adjust based on your auth requirements)
CREATE POLICY "Allow all operations" ON settings FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON power_plants FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON invoices FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON payments FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON contracts FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON clients FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON energy_readings FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON energy_vaults FOR ALL USING (true);
