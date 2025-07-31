const fs = require('fs');
const path = require('path');

// Configurações do Supabase
const SUPABASE_URL = 'https://ibrzwwetrcglkdzzzwfb.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.log('❌ Erro: SUPABASE_SERVICE_ROLE_KEY não configurada');
  console.log('');
  console.log('📋 Para configurar:');
  console.log('1. Acesse: https://supabase.com/dashboard/project/ibrzwwetrcglkdzzzwfb');
  console.log('2. Vá para: Settings → API');
  console.log('3. Copie a "service_role" key');
  console.log('4. Execute: SUPABASE_SERVICE_ROLE_KEY=sua_chave node scripts/execute-sql.js');
  console.log('');
  console.log('🔄 Ou execute manualmente no SQL Editor do Supabase Dashboard');
  process.exit(1);
}

async function executeSQL() {
  try {
    // Ler o arquivo SQL
    const sqlFile = path.join(__dirname, 'create-complete-database-schema.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('🚀 Executando script SQL...');
    console.log(`📁 Arquivo: ${sqlFile}`);
    console.log(`📊 Tamanho: ${sqlContent.length} caracteres`);
    console.log('');
    
    // Dividir o SQL em comandos individuais
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📋 Encontrados ${commands.length} comandos SQL`);
    console.log('');
    
    // Executar via fetch
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY
      },
      body: JSON.stringify({
        sql: sqlContent
      })
    });
    
    if (response.ok) {
      console.log('✅ Script SQL executado com sucesso!');
      console.log('');
      console.log('📊 Tabelas criadas:');
      console.log('- ✅ settings');
      console.log('- ✅ profiles');
      console.log('- ✅ consumer_units');
      console.log('- ✅ generating_units');
      console.log('- ✅ power_plants');
      console.log('- ✅ energy_readings');
      console.log('- ✅ invoices');
      console.log('- ✅ payments');
      console.log('- ✅ contracts');
      console.log('- ✅ clients');
      console.log('- ✅ energy_vault');
      console.log('- ✅ energy_compensation');
      console.log('- ✅ support_tickets');
      console.log('');
      console.log('🎉 Banco de dados configurado!');
      console.log('🌐 Acesse: http://localhost:3000');
    } else {
      const error = await response.text();
      console.log('❌ Erro ao executar SQL:');
      console.log(error);
    }
    
  } catch (error) {
    console.log('❌ Erro:', error.message);
    console.log('');
    console.log('💡 Solução: Execute manualmente no SQL Editor do Supabase Dashboard');
  }
}

executeSQL(); 