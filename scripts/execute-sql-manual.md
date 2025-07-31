# 🗄️ Execução Manual do Script SQL - Supabase

## 📋 Passo a Passo

### 1. Acessar o Supabase Dashboard
- **URL:** https://supabase.com/dashboard/project/ibrzwwetrcglkdzzzwfb
- **Login:** Use suas credenciais

### 2. Abrir SQL Editor
- **Menu lateral:** Clique em "SQL Editor"
- **Nova query:** Clique em "New Query"

### 3. Copiar o Script SQL
Execute este comando para copiar o conteúdo:

```bash
cat scripts/create-complete-database-schema.sql
```

### 4. Colar no SQL Editor
- **Cole todo o conteúdo** do arquivo no editor
- **Verifique** se não há caracteres especiais

### 5. Executar o Script
- **Clique em:** "Run" (botão azul)
- **Aguarde** a execução (pode demorar alguns segundos)

### 6. Verificar Resultado
Após executar, você deve ver:
- ✅ **13 tabelas criadas**
- ✅ **25+ índices** de performance
- ✅ **Triggers automáticos** funcionando

## 📊 Tabelas que serão criadas:

1. ✅ **settings** - Configurações do sistema
2. ✅ **profiles** - Perfis de usuários
3. ✅ **consumer_units** - Unidades consumidoras
4. ✅ **generating_units** - Unidades geradoras
5. ✅ **power_plants** - Usinas de energia
6. ✅ **energy_readings** - Leituras de energia
7. ✅ **invoices** - Faturas
8. ✅ **payments** - Pagamentos
9. ✅ **contracts** - Contratos
10. ✅ **clients** - Clientes (CRM)
11. ✅ **energy_vault** - Cofre energético
12. ✅ **energy_compensation** - Compensação energética
13. ✅ **support_tickets** - Tickets de suporte

## 🎯 Resultado Esperado

Após executar o script:
- ✅ Sistema funcionando com banco real
- ✅ "Demo Mode" desaparece
- ✅ Pode criar/editar dados reais
- ✅ Todas as funcionalidades ativas

## 🚨 Solução de Problemas

### Erro: "relation already exists"
- **Solução:** Ignore, as tabelas já existem

### Erro: "permission denied"
- **Solução:** Verifique se está logado como admin

### Erro: "syntax error"
- **Solução:** Verifique se copiou todo o conteúdo corretamente

## 🌐 Teste Final

Após executar o script:
1. **Acesse:** http://localhost:3000
2. **Verifique:** Se "Demo Mode" desapareceu
3. **Teste:** Criar uma usina ou cliente
4. **Confirme:** Dados persistindo no banco

---

**💡 Dica:** Se preferir, posso te ajudar a executar via API, mas o método manual é mais confiável e visual. 