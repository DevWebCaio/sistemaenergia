-- Create settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings (only if they don't exist)
INSERT INTO settings (key, value, description, category) 
SELECT * FROM (VALUES
  ('tariff_rate', '0.65', 'Taxa tarifária por kWh (R$)', 'billing'),
  ('compensation_rate', '0.95', 'Taxa de compensação de energia', 'billing'),
  ('invoice_due_days', '30', 'Dias para vencimento da fatura', 'billing'),
  ('auto_notifications', 'true', 'Ativar notificações automáticas', 'system'),
  ('whatsapp_api_key', '', 'Chave da API do WhatsApp', 'integrations'),
  ('email_api_key', '', 'Chave da API de Email', 'integrations'),
  ('payment_gateway_key', '', 'Chave do Gateway de Pagamento', 'integrations'),
  ('default_user_role', 'client', 'Função padrão para novos usuários', 'users'),
  ('require_2fa', 'true', 'Exigir autenticação de dois fatores', 'security'),
  ('auto_logout', 'true', 'Logout automático por inatividade', 'security')
) AS v(key, value, description, category)
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE settings.key = v.key);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
DROP POLICY IF EXISTS "Allow all operations" ON settings;
CREATE POLICY "Allow all operations" ON settings FOR ALL USING (true);
