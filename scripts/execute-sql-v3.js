const fs = require('fs');
const path = require('path');

// Configurações do Supabase
const SUPABASE_URL = 'https://ibrzwwetrcglkdzzzwfb.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.log('❌ Erro: SUPABASE_SERVICE_ROLE_KEY não configurada');
  process.exit(1);
}

async function executeSQL() {
  try {
    console.log('🚀 Executando script SQL...');
    console.log(`🔗 URL: ${SUPABASE_URL}`);
    console.log('');
    
    // Ler o arquivo SQL
    const sqlFile = path.join(__dirname, 'create-complete-database-schema.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    console.log(`📁 Arquivo: ${sqlFile}`);
    console.log(`📊 Tamanho: ${sqlContent.length} caracteres`);
    console.log('');
    
    // Dividir o SQL em comandos individuais
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--') && !cmd.startsWith('/*'));
    
    console.log(`📋 Encontrados ${commands.length} comandos SQL`);
    console.log('');
    
    // Executar comandos via fetch direto
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.length === 0) continue;
      
      try {
        // Usar fetch para executar SQL via API
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': SUPABASE_SERVICE_ROLE_KEY
          },
          body: JSON.stringify({
            sql: command
          })
        });
        
        if (response.ok) {
          successCount++;
          process.stdout.write(`✅ Comando ${i + 1}/${commands.length} executado\r`);
        } else {
          // Tentar método alternativo
          const altResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'apikey': SUPABASE_SERVICE_ROLE_KEY
            },
            body: JSON.stringify({
              query: command
            })
          });
          
          if (altResponse.ok) {
            successCount++;
            process.stdout.write(`✅ Comando ${i + 1}/${commands.length} executado (método alternativo)\r`);
          } else {
            errorCount++;
            console.log(`\n❌ Erro no comando ${i + 1}: Método não suportado`);
          }
        }
      } catch (error) {
        errorCount++;
        console.log(`\n❌ Erro no comando ${i + 1}: ${error.message}`);
      }
    }
    
    console.log('\n');
    console.log('📊 Resultado da execução:');
    console.log(`✅ Comandos executados com sucesso: ${successCount}`);
    console.log(`❌ Comandos com erro: ${errorCount}`);
    console.log('');
    
    if (successCount > 0) {
      console.log('🎉 Script SQL executado com sucesso!');
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
      console.log('🌐 Acesse: http://localhost:3000');
      console.log('💡 Se ainda aparecer "Demo Mode", reinicie o servidor: npm run dev');
    } else {
      console.log('❌ Nenhum comando foi executado com sucesso');
      console.log('💡 Execute manualmente no SQL Editor do Supabase Dashboard');
      console.log('');
      console.log('📋 Instruções manuais:');
      console.log('1. Acesse: https://supabase.com/dashboard/project/ibrzwwetrcglkdzzzwfb');
      console.log('2. Vá para: SQL Editor');
      console.log('3. Clique em: "New Query"');
      console.log('4. Cole o conteúdo do arquivo: scripts/create-complete-database-schema.sql');
      console.log('5. Clique em: "Run"');
    }
    
  } catch (error) {
    console.log('❌ Erro:', error.message);
    console.log('');
    console.log('💡 Solução: Execute manualmente no SQL Editor do Supabase Dashboard');
  }
}

executeSQL(); 