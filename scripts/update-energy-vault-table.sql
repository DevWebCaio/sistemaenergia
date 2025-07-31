-- Drop existing energy_vault table if it exists
DROP TABLE IF EXISTS public.energy_vault CASCADE;

-- Create the updated energy_vault table with correct structure
CREATE TABLE public.energy_vault (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    consumer_unit_id UUID REFERENCES public.consumer_units(id) ON DELETE CASCADE NOT NULL,
    month VARCHAR(7) NOT NULL, -- formato: MM/YYYY
    received_kwh DECIMAL(10,2) NOT NULL DEFAULT 0,
    compensated_kwh DECIMAL(10,2) NOT NULL DEFAULT 0,
    balance_kwh DECIMAL(10,2) NOT NULL DEFAULT 0,
    pdf_filename VARCHAR(255),
    extraction_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_consumer_unit_month UNIQUE(consumer_unit_id, month)
);

-- Create indexes for better performance
CREATE INDEX idx_energy_vault_consumer_unit ON public.energy_vault(consumer_unit_id);
CREATE INDEX idx_energy_vault_month ON public.energy_vault(month);
CREATE INDEX idx_energy_vault_created_at ON public.energy_vault(created_at);

-- Enable Row Level Security
ALTER TABLE public.energy_vault ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view energy vault data" ON public.energy_vault
    FOR SELECT USING (true);

CREATE POLICY "Users can insert energy vault data" ON public.energy_vault
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update energy vault data" ON public.energy_vault
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete energy vault data" ON public.energy_vault
    FOR DELETE USING (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_energy_vault_updated_at 
    BEFORE UPDATE ON public.energy_vault 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO public.energy_vault (consumer_unit_id, month, received_kwh, compensated_kwh, balance_kwh, pdf_filename, extraction_data) VALUES
('11111111-1111-1111-1111-111111111111', '12/2024', 1250.50, 980.20, 270.30, 'demonstrativo_12_2024.pdf', '{"confidence": 95, "extracted_at": "2024-12-15T10:30:00Z"}'),
('22222222-2222-2222-2222-222222222222', '11/2024', 1180.00, 1200.50, -20.50, 'demonstrativo_11_2024.pdf', '{"confidence": 90, "extracted_at": "2024-11-15T09:15:00Z"}'),
('11111111-1111-1111-1111-111111111111', '10/2024', 1350.80, 890.30, 460.50, 'demonstrativo_10_2024.pdf', '{"confidence": 88, "extracted_at": "2024-10-15T14:20:00Z"}')
ON CONFLICT (consumer_unit_id, month) DO NOTHING;

COMMENT ON TABLE public.energy_vault IS 'Tabela para armazenar dados do cofre energético extraídos de PDFs de demonstrativos';
COMMENT ON COLUMN public.energy_vault.month IS 'Mês de referência no formato MM/YYYY';
COMMENT ON COLUMN public.energy_vault.received_kwh IS 'Energia recebida/injetada na rede em kWh';
COMMENT ON COLUMN public.energy_vault.compensated_kwh IS 'Energia compensada/consumida da rede em kWh';
COMMENT ON COLUMN public.energy_vault.balance_kwh IS 'Saldo de energia (recebido - compensado) em kWh';
COMMENT ON COLUMN public.energy_vault.pdf_filename IS 'Nome do arquivo PDF original';
COMMENT ON COLUMN public.energy_vault.extraction_data IS 'Dados adicionais da extração (confiança, metadados, etc.)';
