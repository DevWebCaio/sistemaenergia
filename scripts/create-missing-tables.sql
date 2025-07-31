-- Create clients table for CRM
CREATE TABLE clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  company_name TEXT,
  cnpj TEXT,
  stage TEXT CHECK (stage IN ('lead', 'contacted', 'proposal_sent', 'contract_signed', 'activated')) DEFAULT 'lead',
  source TEXT,
  notes TEXT,
  assigned_to UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table for financial tracking
CREATE TABLE payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  consumer_unit_id UUID REFERENCES consumer_units(id) ON DELETE CASCADE NOT NULL,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  payment_date DATE,
  status TEXT CHECK (status IN ('paid', 'pending', 'overdue', 'scheduled')) DEFAULT 'pending',
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system_settings table
CREATE TABLE system_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default system settings
INSERT INTO system_settings (key, value, description, category) VALUES
('default_tariff_rate', '0.65', 'Taxa tarifária padrão por kWh', 'billing'),
('compensation_rate', '0.95', 'Taxa de compensação de energia', 'billing'),
('invoice_due_days', '30', 'Dias para vencimento da fatura', 'billing'),
('whatsapp_api_key', '', 'Chave da API do WhatsApp', 'integrations'),
('email_api_key', '', 'Chave da API de email', 'integrations'),
('payment_gateway_key', '', 'Chave do gateway de pagamento', 'integrations');

-- Add indexes
CREATE INDEX idx_clients_stage ON clients(stage);
CREATE INDEX idx_clients_assigned_to ON clients(assigned_to);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_due_date ON payments(due_date);
CREATE INDEX idx_system_settings_category ON system_settings(category);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view clients" ON clients FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'distributor'))
);

CREATE POLICY "Users can manage clients" ON clients FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'distributor'))
);

CREATE POLICY "Users can view payments" ON payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'distributor'))
);

CREATE POLICY "Users can manage payments" ON payments FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'distributor'))
);

CREATE POLICY "Users can view settings" ON system_settings FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can manage settings" ON system_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
