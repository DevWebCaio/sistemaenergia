-- Create power_plants table
CREATE TABLE power_plants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  cnpj TEXT NOT NULL,
  installed_power_kwp DECIMAL(10,2) NOT NULL,
  operation_date DATE NOT NULL,
  linked_consumer_unit_id UUID REFERENCES consumer_units(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('active', 'inactive', 'maintenance')) DEFAULT 'active',
  address TEXT,
  distributor_company TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_power_plants_cnpj ON power_plants(cnpj);
CREATE INDEX idx_power_plants_status ON power_plants(status);
CREATE INDEX idx_power_plants_linked_consumer_unit ON power_plants(linked_consumer_unit_id);

-- Enable RLS
ALTER TABLE power_plants ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view power plants" ON power_plants FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'distributor'))
);

CREATE POLICY "Admins can manage power plants" ON power_plants FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Distributors can manage their power plants" ON power_plants FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'distributor')
);
