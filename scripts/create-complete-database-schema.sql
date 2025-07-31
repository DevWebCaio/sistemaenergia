-- ============================================
-- SISTEMA DE GESTÃO DE ENERGIA SOLAR - SCHEMA COMPLETO
-- ============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- REMOVER TABELAS EXISTENTES (se necessário)
-- ============================================
-- Descomente as linhas abaixo se precisar recriar as tabelas
-- DROP TABLE IF EXISTS support_tickets CASCADE;
-- DROP TABLE IF EXISTS energy_compensation CASCADE;
-- DROP TABLE IF EXISTS energy_vault CASCADE;
-- DROP TABLE IF EXISTS energy_readings CASCADE;
-- DROP TABLE IF EXISTS payments CASCADE;
-- DROP TABLE IF EXISTS invoices CASCADE;
-- DROP TABLE IF EXISTS contracts CASCADE;
-- DROP TABLE IF EXISTS clients CASCADE;
-- DROP TABLE IF EXISTS power_plants CASCADE;
-- DROP TABLE IF EXISTS generating_units CASCADE;
-- DROP TABLE IF EXISTS consumer_units CASCADE;
-- DROP TABLE IF EXISTS settings CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================
-- 1. TABELA DE CONFIGURAÇÕES DO SISTEMA
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. TABELA DE PERFIS DE USUÁRIOS
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'distributor', 'client', 'beneficiary')) DEFAULT 'client',
  company_name TEXT,
  cnpj VARCHAR(18),
  phone VARCHAR(20),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. TABELA DE UNIDADES CONSUMIDORAS
-- ============================================
CREATE TABLE IF NOT EXISTS consumer_units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  installation_number VARCHAR(50) UNIQUE NOT NULL,
  distributor_id VARCHAR(100) NOT NULL,
  monthly_consumption DECIMAL(10,2) NOT NULL DEFAULT 0,
  tariff_class VARCHAR(50) NOT NULL,
  connection_type VARCHAR(50) DEFAULT 'monofásico',
  voltage_level VARCHAR(20) DEFAULT 'baixa',
  status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'pending', 'suspended')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. TABELA DE UNIDADES GERADORAS
-- ============================================
CREATE TABLE IF NOT EXISTS generating_units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  capacity_kw DECIMAL(10,2) NOT NULL,
  distributor_id VARCHAR(100) NOT NULL,
  technology VARCHAR(50) DEFAULT 'solar_photovoltaic',
  status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'maintenance', 'suspended')) DEFAULT 'active',
  installation_date DATE NOT NULL,
  commissioning_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. TABELA DE USINAS/PLANTAS DE ENERGIA
-- ============================================
CREATE TABLE IF NOT EXISTS power_plants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) NOT NULL,
  capacity_kwp DECIMAL(10,2) NOT NULL,
  start_date DATE NOT NULL,
  linked_uc_id UUID REFERENCES consumer_units(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'construction')),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  zip_code VARCHAR(10),
  distributor_company VARCHAR(255),
  technology VARCHAR(50) DEFAULT 'solar_photovoltaic',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. TABELA DE LEITURAS DE ENERGIA
-- ============================================
CREATE TABLE IF NOT EXISTS energy_readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  generating_unit_id UUID REFERENCES generating_units(id) ON DELETE CASCADE,
  consumer_unit_id UUID REFERENCES consumer_units(id) ON DELETE CASCADE,
  reading_date DATE NOT NULL,
  energy_generated DECIMAL(10,2) DEFAULT 0,
  energy_consumed DECIMAL(10,2) DEFAULT 0,
  energy_injected DECIMAL(10,2) DEFAULT 0,
  energy_received DECIMAL(10,2) DEFAULT 0,
  peak_power DECIMAL(10,2) DEFAULT 0,
  reading_type VARCHAR(20) DEFAULT 'automatic' CHECK (reading_type IN ('automatic', 'manual', 'estimated')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_reading_per_unit_date UNIQUE(generating_unit_id, consumer_unit_id, reading_date)
);

-- ============================================
-- 7. TABELA DE FATURAS
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consumer_unit_id UUID REFERENCES consumer_units(id) ON DELETE CASCADE NOT NULL,
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  reference_month DATE NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  energy_consumed DECIMAL(10,2) NOT NULL DEFAULT 0,
  energy_compensated DECIMAL(10,2) NOT NULL DEFAULT 0,
  energy_injected DECIMAL(10,2) DEFAULT 0,
  tariff_rate DECIMAL(10,4) DEFAULT 0.65,
  taxes DECIMAL(10,2) DEFAULT 0,
  fees DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled', 'partially_paid')) DEFAULT 'pending',
  pdf_url TEXT,
  payment_method VARCHAR(50),
  payment_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 8. TABELA DE PAGAMENTOS
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consumer_unit_id UUID REFERENCES consumer_units(id) ON DELETE CASCADE NOT NULL,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  payment_date DATE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'scheduled', 'cancelled')),
  payment_method VARCHAR(50),
  transaction_id VARCHAR(100),
  gateway_response TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 9. TABELA DE CONTRATOS
-- ============================================
CREATE TABLE IF NOT EXISTS contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  contract_number VARCHAR(100) UNIQUE NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255),
  client_phone VARCHAR(20),
  consumer_unit_id UUID REFERENCES consumer_units(id) ON DELETE SET NULL,
  contract_type VARCHAR(20) DEFAULT 'generation' CHECK (contract_type IN ('generation', 'consumption', 'shared', 'lease')),
  start_date DATE NOT NULL,
  end_date DATE,
  monthly_value DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_signature', 'active', 'cancelled', 'expired', 'suspended')),
  pdf_url TEXT,
  digital_signature_url TEXT,
  terms TEXT,
  auto_renewal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 10. TABELA DE CLIENTES (CRM)
-- ============================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  company_name VARCHAR(255),
  cnpj VARCHAR(18),
  cpf VARCHAR(14),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  zip_code VARCHAR(10),
  stage VARCHAR(20) DEFAULT 'lead' CHECK (stage IN ('lead', 'contacted', 'qualified', 'proposal_sent', 'negotiation', 'contract_signed', 'activated', 'lost')),
  source VARCHAR(100),
  monthly_consumption DECIMAL(10,2) DEFAULT 0,
  interest_level VARCHAR(20) DEFAULT 'medium' CHECK (interest_level IN ('low', 'medium', 'high')),
  budget_range VARCHAR(50),
  notes TEXT,
  assigned_to UUID REFERENCES profiles(id),
  last_contact DATE,
  next_followup DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 11. TABELA DE COFRE DE ENERGIA
-- ============================================
CREATE TABLE IF NOT EXISTS energy_vault (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consumer_unit_id UUID REFERENCES consumer_units(id) ON DELETE CASCADE NOT NULL,
  month_year VARCHAR(7) NOT NULL, -- formato: YYYY-MM
  available_kwh DECIMAL(10,2) NOT NULL DEFAULT 0,
  used_kwh DECIMAL(10,2) NOT NULL DEFAULT 0,
  expired_kwh DECIMAL(10,2) NOT NULL DEFAULT 0,
  injected_kwh DECIMAL(10,2) NOT NULL DEFAULT 0,
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_consumer_unit_month UNIQUE(consumer_unit_id, month_year)
);

-- ============================================
-- 12. TABELA DE COMPENSAÇÃO DE ENERGIA
-- ============================================
CREATE TABLE IF NOT EXISTS energy_compensation (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consumer_unit_id UUID REFERENCES consumer_units(id) ON DELETE CASCADE NOT NULL,
  generating_unit_id UUID REFERENCES generating_units(id) ON DELETE CASCADE NOT NULL,
  reference_month VARCHAR(7) NOT NULL, -- formato: YYYY-MM
  allocated_kwh DECIMAL(10,2) NOT NULL DEFAULT 0,
  compensation_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  compensation_rate DECIMAL(10,4) DEFAULT 0.95,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_compensation_per_month UNIQUE(consumer_unit_id, generating_unit_id, reference_month)
);

-- ============================================
-- 13. TABELA DE TICKETS DE SUPORTE
-- ============================================
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) CHECK (category IN ('technical', 'billing', 'general', 'urgent', 'feature_request', 'bug_report')) DEFAULT 'general',
  status VARCHAR(20) CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'pending_customer')) DEFAULT 'open',
  priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  assigned_to UUID REFERENCES profiles(id),
  consumer_unit_id UUID REFERENCES consumer_units(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  estimated_resolution DATE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INSERIR CONFIGURAÇÕES PADRÃO DO SISTEMA
-- ============================================
INSERT INTO settings (key, value, description, category) 
SELECT * FROM (VALUES
  -- Configurações de Faturamento
  ('tariff_rate', '0.65', 'Taxa tarifária por kWh (R$)', 'billing'),
  ('compensation_rate', '0.95', 'Taxa de compensação de energia injetada', 'billing'),
  ('invoice_due_days', '30', 'Dias para vencimento da fatura', 'billing'),
  ('late_fee_rate', '0.02', 'Taxa de multa por atraso (2%)', 'billing'),
  ('interest_rate', '0.01', 'Taxa de juros mensal (1%)', 'billing'),
  
  -- Configurações do Sistema
  ('auto_notifications', 'true', 'Ativar notificações automáticas', 'system'),
  ('backup_frequency', 'daily', 'Frequência de backup automático', 'system'),
  ('maintenance_mode', 'false', 'Modo de manutenção do sistema', 'system'),
  ('max_file_size', '10', 'Tamanho máximo de arquivo em MB', 'system'),
  ('session_timeout', '60', 'Timeout de sessão em minutos', 'system'),
  
  -- Configurações de Integrações
  ('whatsapp_api_key', '', 'Chave da API do WhatsApp Business', 'integrations'),
  ('whatsapp_enabled', 'false', 'Ativar integração WhatsApp', 'integrations'),
  ('email_api_key', '', 'Chave da API de Email (SendGrid/Mailgun)', 'integrations'),
  ('email_enabled', 'true', 'Ativar envio de emails', 'integrations'),
  ('sms_api_key', '', 'Chave da API de SMS', 'integrations'),
  ('sms_enabled', 'false', 'Ativar envio de SMS', 'integrations'),
  ('payment_gateway_key', '', 'Chave do Gateway de Pagamento', 'integrations'),
  ('payment_gateway_enabled', 'false', 'Ativar gateway de pagamento', 'integrations'),
  
  -- Configurações de Usuários
  ('default_user_role', 'client', 'Função padrão para novos usuários', 'users'),
  ('allow_registration', 'true', 'Permitir auto-registro de usuários', 'users'),
  ('require_email_verification', 'true', 'Exigir verificação de email', 'users'),
  ('password_min_length', '8', 'Comprimento mínimo da senha', 'users'),
  
  -- Configurações de Segurança
  ('require_2fa', 'false', 'Exigir autenticação de dois fatores', 'security'),
  ('auto_logout', 'true', 'Logout automático por inatividade', 'security'),
  ('max_login_attempts', '5', 'Máximo de tentativas de login', 'security'),
  ('lockout_duration', '30', 'Duração do bloqueio em minutos', 'security'),
  ('password_expiry_days', '90', 'Expiração da senha em dias', 'security'),
  
  -- Configurações de Relatórios
  ('report_retention_days', '365', 'Retenção de relatórios em dias', 'reports'),
  ('auto_generate_reports', 'true', 'Gerar relatórios automaticamente', 'reports'),
  ('report_format', 'pdf', 'Formato padrão dos relatórios', 'reports')
) AS v(key, value, description, category)
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE settings.key = v.key);

-- ============================================
-- CRIAR ÍNDICES PARA MELHOR PERFORMANCE
-- ============================================

-- Índices da tabela settings
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- Índices da tabela profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_company ON profiles(company_name);

-- Índices da tabela consumer_units
CREATE INDEX IF NOT EXISTS idx_consumer_units_profile_id ON consumer_units(profile_id);
CREATE INDEX IF NOT EXISTS idx_consumer_units_status ON consumer_units(status);
CREATE INDEX IF NOT EXISTS idx_consumer_units_installation_number ON consumer_units(installation_number);

-- Índices da tabela generating_units
CREATE INDEX IF NOT EXISTS idx_generating_units_status ON generating_units(status);
CREATE INDEX IF NOT EXISTS idx_generating_units_installation_date ON generating_units(installation_date);

-- Índices da tabela power_plants
CREATE INDEX IF NOT EXISTS idx_power_plants_status ON power_plants(status);
CREATE INDEX IF NOT EXISTS idx_power_plants_linked_uc ON power_plants(linked_uc_id);
CREATE INDEX IF NOT EXISTS idx_power_plants_cnpj ON power_plants(cnpj);

-- Índices da tabela energy_readings
CREATE INDEX IF NOT EXISTS idx_energy_readings_generating_unit_id ON energy_readings(generating_unit_id);
CREATE INDEX IF NOT EXISTS idx_energy_readings_consumer_unit_id ON energy_readings(consumer_unit_id);
CREATE INDEX IF NOT EXISTS idx_energy_readings_date ON energy_readings(reading_date);

-- Índices da tabela invoices
CREATE INDEX IF NOT EXISTS idx_invoices_consumer_unit_id ON invoices(consumer_unit_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_reference_month ON invoices(reference_month);

-- Índices da tabela payments
CREATE INDEX IF NOT EXISTS idx_payments_consumer_unit_id ON payments(consumer_unit_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payments(due_date);

-- Índices da tabela contracts
CREATE INDEX IF NOT EXISTS idx_contracts_profile_id ON contracts(profile_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_type ON contracts(contract_type);

-- Índices da tabela clients
CREATE INDEX IF NOT EXISTS idx_clients_stage ON clients(stage);
CREATE INDEX IF NOT EXISTS idx_clients_assigned_to ON clients(assigned_to);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_last_contact ON clients(last_contact);

-- Índices da tabela energy_vault
CREATE INDEX IF NOT EXISTS idx_energy_vault_consumer_unit_id ON energy_vault(consumer_unit_id);
CREATE INDEX IF NOT EXISTS idx_energy_vault_month_year ON energy_vault(month_year);

-- Índices da tabela energy_compensation
CREATE INDEX IF NOT EXISTS idx_energy_compensation_consumer_unit_id ON energy_compensation(consumer_unit_id);
CREATE INDEX IF NOT EXISTS idx_energy_compensation_generating_unit_id ON energy_compensation(generating_unit_id);
CREATE INDEX IF NOT EXISTS idx_energy_compensation_reference_month ON energy_compensation(reference_month);

-- Índices da tabela support_tickets
CREATE INDEX IF NOT EXISTS idx_support_tickets_profile_id ON support_tickets(profile_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON support_tickets(assigned_to);

-- ============================================
-- HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumer_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE generating_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE power_plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_compensation ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CRIAR POLÍTICAS DE SEGURANÇA (RLS POLICIES)
-- ============================================

-- Políticas para settings (apenas admins)
DROP POLICY IF EXISTS "Admin can manage settings" ON settings;
CREATE POLICY "Admin can manage settings" ON settings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Políticas para profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Políticas para consumer_units
DROP POLICY IF EXISTS "Users can view own consumer units" ON consumer_units;
DROP POLICY IF EXISTS "Users can manage own consumer units" ON consumer_units;

CREATE POLICY "Users can view own consumer units" ON consumer_units FOR SELECT USING (
  profile_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'distributor'))
);

CREATE POLICY "Users can manage own consumer units" ON consumer_units FOR ALL USING (
  profile_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'distributor'))
);

-- Políticas para generating_units
DROP POLICY IF EXISTS "Users can view generating units" ON generating_units;
DROP POLICY IF EXISTS "Admins can manage generating units" ON generating_units;

CREATE POLICY "Users can view generating units" ON generating_units FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'distributor'))
);

CREATE POLICY "Admins can manage generating units" ON generating_units FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'distributor'))
);

-- Políticas para power_plants
DROP POLICY IF EXISTS "Users can view power plants" ON power_plants;
DROP POLICY IF EXISTS "Admins can manage power plants" ON power_plants;

CREATE POLICY "Users can view power plants" ON power_plants FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'distributor'))
);

CREATE POLICY "Admins can manage power plants" ON power_plants FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'distributor'))
);

-- Políticas para energy_readings
DROP POLICY IF EXISTS "Users can view energy readings" ON energy_readings;
DROP POLICY IF EXISTS "Admins can manage energy readings" ON energy_readings;

CREATE POLICY "Users can view energy readings" ON energy_readings FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'distributor')) OR
  EXISTS (SELECT 1 FROM consumer_units WHERE id = energy_readings.consumer_unit_id AND profile_id = auth.uid())
);

CREATE POLICY "Admins can manage energy readings" ON energy_readings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'distributor'))
);

-- Políticas para invoices
DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;
DROP POLICY IF EXISTS "Admins can manage invoices" ON invoices;

CREATE POLICY "Users can view own invoices" ON invoices FOR SELECT USING (
  EXISTS (SELECT 1 FROM consumer_units WHERE id = invoices.consumer_unit_id AND profile_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'distributor'))
);

CREATE POLICY "Admins can manage invoices" ON invoices FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'distributor'))
);

-- Políticas para payments
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Admins can manage payments" ON payments;

CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM consumer_units WHERE id = payments.consumer_unit_id AND profile_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'distributor'))
);

CREATE POLICY "Admins can manage payments" ON payments FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'distributor'))
);

-- Políticas para contracts
DROP POLICY IF EXISTS "Users can view own contracts" ON contracts;
DROP POLICY IF EXISTS "Admins can manage contracts" ON contracts;

CREATE POLICY "Users can view own contracts" ON contracts FOR SELECT USING (
  profile_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'distributor'))
);

CREATE POLICY "Admins can manage contracts" ON contracts FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'distributor'))
);

-- Políticas para clients
DROP POLICY IF EXISTS "Users can view clients" ON clients;
DROP POLICY IF EXISTS "Users can manage clients" ON clients;

CREATE POLICY "Users can view clients" ON clients FOR SELECT USING (
  assigned_to = auth.uid() OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'distributor'))
);

CREATE POLICY "Users can manage clients" ON clients FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'distributor'))
);

-- Políticas para energy_vault
DROP POLICY IF EXISTS "Users can view own energy vault" ON energy_vault;
DROP POLICY IF EXISTS "Admins can manage energy vault" ON energy_vault;

CREATE POLICY "Users can view own energy vault" ON energy_vault FOR SELECT USING (
  EXISTS (SELECT 1 FROM consumer_units WHERE id = energy_vault.consumer_unit_id AND profile_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'distributor'))
);

CREATE POLICY "Admins can manage energy vault" ON energy_vault FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'distributor'))
);

-- Políticas para energy_compensation
DROP POLICY IF EXISTS "Users can view energy compensation" ON energy_compensation;
DROP POLICY IF EXISTS "Admins can manage energy compensation" ON energy_compensation;

CREATE POLICY "Users can view energy compensation" ON energy_compensation FOR SELECT USING (
  EXISTS (SELECT 1 FROM consumer_units WHERE id = energy_compensation.consumer_unit_id AND profile_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'distributor'))
);

CREATE POLICY "Admins can manage energy compensation" ON energy_compensation FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'distributor'))
);

-- Políticas para support_tickets
DROP POLICY IF EXISTS "Users can view own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can create tickets" ON support_tickets;
DROP POLICY IF EXISTS "Admins can manage tickets" ON support_tickets;

CREATE POLICY "Users can view own tickets" ON support_tickets FOR SELECT USING (
  profile_id = auth.uid() OR 
  assigned_to = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'distributor'))
);

CREATE POLICY "Users can create tickets" ON support_tickets FOR INSERT WITH CHECK (
  profile_id = auth.uid()
);

CREATE POLICY "Admins can manage tickets" ON support_tickets FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'distributor'))
);

-- ============================================
-- CRIAR TRIGGERS PARA UPDATED_AT
-- ============================================

-- Função para atualizar o campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_consumer_units_updated_at BEFORE UPDATE ON consumer_units FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_generating_units_updated_at BEFORE UPDATE ON generating_units FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_power_plants_updated_at BEFORE UPDATE ON power_plants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_energy_vault_updated_at BEFORE UPDATE ON energy_vault FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CRIAR VIEWS ÚTEIS PARA RELATÓRIOS
-- ============================================

-- View para resumo de unidades consumidoras
CREATE OR REPLACE VIEW consumer_units_summary AS
SELECT 
    cu.id,
    cu.name,
    cu.installation_number,
    cu.monthly_consumption,
    cu.status,
    p.full_name as owner_name,
    p.email as owner_email,
    COUNT(i.id) as total_invoices,
    SUM(i.amount) as total_amount_invoiced,
    COALESCE(ev.available_kwh, 0) as energy_vault_balance
FROM consumer_units cu
LEFT JOIN profiles p ON cu.profile_id = p.id
LEFT JOIN invoices i ON cu.id = i.consumer_unit_id
LEFT JOIN energy_vault ev ON cu.id = ev.consumer_unit_id AND ev.month_year = TO_CHAR(NOW(), 'YYYY-MM')
GROUP BY cu.id, cu.name, cu.installation_number, cu.monthly_consumption, cu.status, p.full_name, p.email, ev.available_kwh;

-- View para resumo financeiro
CREATE OR REPLACE VIEW financial_summary AS
SELECT 
    DATE_TRUNC('month', i.reference_month) as month,
    COUNT(i.id) as total_invoices,
    SUM(i.amount) as total_invoiced,
    SUM(CASE WHEN i.status = 'paid' THEN i.amount ELSE 0 END) as total_paid,
    SUM(CASE WHEN i.status = 'overdue' THEN i.amount ELSE 0 END) as total_overdue,
    SUM(i.energy_consumed) as total_energy_consumed,
    SUM(i.energy_compensated) as total_energy_compensated
FROM invoices i
GROUP BY DATE_TRUNC('month', i.reference_month)
ORDER BY month DESC;

-- ============================================
-- FINALIZAÇÃO
-- ============================================

-- Verificar se todas as tabelas foram criadas
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
        'settings', 'profiles', 'consumer_units', 'generating_units',
        'power_plants', 'energy_readings', 'invoices', 'payments',
        'contracts', 'clients', 'energy_vault', 'energy_compensation',
        'support_tickets'
    );
    
    RAISE NOTICE '============================================';
    RAISE NOTICE 'SCHEMA CRIADO COM SUCESSO!';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Total de tabelas criadas: %', table_count;
    RAISE NOTICE 'Configurações padrão inseridas';
    RAISE NOTICE 'Índices criados para melhor performance';
    RAISE NOTICE 'Políticas de segurança (RLS) configuradas';
    RAISE NOTICE 'Triggers de updated_at configurados';
    RAISE NOTICE 'Views de relatórios criadas';
    RAISE NOTICE '============================================';
END $$;
