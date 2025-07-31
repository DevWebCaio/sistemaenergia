# 🗄️ Configuração do Banco de Dados - Supabase

## Passo a Passo para Configurar o Banco

### 1. Acessar o Supabase Dashboard
- URL: https://supabase.com/dashboard/project/ibrzwwetrcglkdzzzwfb
- Faça login na sua conta

### 2. Executar Script SQL
1. **Vá para:** SQL Editor (no menu lateral)
2. **Clique em:** "New Query"
3. **Cole o conteúdo do arquivo:** `scripts/create-complete-database-schema.sql`
4. **Clique em:** "Run"

### 3. Verificar Tabelas Criadas
Após executar o script, você deve ver estas tabelas:
- ✅ settings
- ✅ profiles  
- ✅ consumer_units
- ✅ generating_units
- ✅ power_plants
- ✅ energy_readings
- ✅ invoices
- ✅ payments
- ✅ contracts
- ✅ clients
- ✅ energy_vault
- ✅ energy_compensation
- ✅ support_tickets

### 4. Configurar Row Level Security (RLS)
O script já inclui as políticas de segurança, mas você pode verificar em:
- **Authentication** → **Policies**

### 5. Testar a Conexão
Após executar o script, acesse:
- http://localhost:3000
- O aviso "Demo Mode" deve desaparecer
- Você poderá criar dados reais

## 📋 Checklist de Verificação

- [ ] Script SQL executado com sucesso
- [ ] Todas as 13 tabelas criadas
- [ ] Índices criados (25+ índices)
- [ ] Triggers automáticos funcionando
- [ ] Sistema funcionando sem "Demo Mode"
- [ ] Pode criar/editar dados reais

## 🚨 Solução de Problemas

### Erro: "relation does not exist"
- Execute o script novamente
- Verifique se não há erros de sintaxe

### Erro: "permission denied"
- Verifique se está logado no Supabase
- Confirme se tem permissões de admin no projeto

### Sistema ainda em "Demo Mode"
- Verifique se o .env.local está correto
- Reinicie o servidor: `npm run dev`
- Limpe o cache: `rm -rf .next && npm run dev` 