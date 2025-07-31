-- Create test data for energy vault functionality
-- This script creates sample consumer units and energy vault records

-- Insert sample consumer units if they don't exist
INSERT INTO consumer_units (id, name, installation_number, address, city, state, created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'UC Matriz - Centro', '12345678', 'Rua Principal, 123', 'São Paulo', 'SP', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'UC Filial - Norte', '87654321', 'Av. Norte, 456', 'São Paulo', 'SP', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440003', 'UC Filial - Sul', '11223344', 'Rua Sul, 789', 'São Paulo', 'SP', NOW(), NOW())
ON CONFLICT (installation_number) DO NOTHING;

-- Insert sample energy vault records
INSERT INTO energy_vault (id, consumer_unit_id, month, received_kwh, compensated_kwh, balance_kwh, pdf_filename, created_at, updated_at)
VALUES 
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '12/2024', 1250.50, 980.20, 270.30, 'demonstrativo_12_2024.pdf', '2024-12-15 10:30:00', '2024-12-15 10:30:00'),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '11/2024', 1180.00, 1200.50, -20.50, 'demonstrativo_11_2024.pdf', '2024-11-15 09:15:00', '2024-11-15 09:15:00'),
  ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '10/2024', 1350.80, 890.30, 460.50, 'demonstrativo_10_2024.pdf', '2024-10-15 14:20:00', '2024-10-15 14:20:00'),
  ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', '09/2024', 980.25, 1050.75, -70.50, 'demonstrativo_09_2024.pdf', '2024-09-15 16:45:00', '2024-09-15 16:45:00'),
  ('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', '08/2024', 1420.60, 750.30, 670.30, 'demonstrativo_08_2024.pdf', '2024-08-15 11:20:00', '2024-08-15 11:20:00')
ON CONFLICT (id) DO UPDATE SET
  received_kwh = EXCLUDED.received_kwh,
  compensated_kwh = EXCLUDED.compensated_kwh,
  balance_kwh = EXCLUDED.balance_kwh,
  updated_at = NOW();

-- Display summary of inserted data
SELECT 
  'Energy Vault Records' as table_name,
  COUNT(*) as total_records,
  SUM(received_kwh) as total_received_kwh,
  SUM(compensated_kwh) as total_compensated_kwh,
  SUM(balance_kwh) as total_balance_kwh
FROM energy_vault;

SELECT 
  'Consumer Units' as table_name,
  COUNT(*) as total_records
FROM consumer_units;

-- Show sample data with consumer unit details
SELECT 
  ev.month,
  cu.name as consumer_unit_name,
  cu.installation_number,
  ev.received_kwh,
  ev.compensated_kwh,
  ev.balance_kwh,
  ev.pdf_filename,
  ev.created_at
FROM energy_vault ev
JOIN consumer_units cu ON ev.consumer_unit_id = cu.id
ORDER BY ev.created_at DESC;
