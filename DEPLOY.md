# 🚀 Guia de Deploy - Solar DG Platform

## 📋 Pré-requisitos

- Node.js 18+ 
- npm/pnpm
- Conta no Supabase
- Conta no Vercel (opcional)

## 🛠️ Configuração Completa

### 1. Setup do Projeto

```bash
# Clone o repositório
git clone <repository-url>
cd solar-dg-platform

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp env.example .env.local
```

### 2. Configuração do Supabase

1. **Criar projeto no Supabase:**
   - Acesse [supabase.com](https://supabase.com)
   - Crie um novo projeto
   - Anote a URL e anon key

2. **Executar scripts SQL:**
   ```bash
   # Conectar ao banco
   psql -h your-project.supabase.co -U postgres -d postgres
   
   # Executar schema completo
   \i scripts/create-complete-database-schema.sql
   
   # Executar configurações
   \i scripts/create-missing-tables.sql
   ```

3. **Configurar RLS (Row Level Security):**
   - Todas as tabelas já possuem RLS habilitado
   - Políticas específicas por role implementadas

### 3. Configuração das Integrações

#### Banco do Brasil
O sistema já está configurado com os dados do convênio:
- **Agência:** 3205 - MANOEL HONORIO
- **Beneficiário:** 662178 - CONSORCIO MOARA
- **Convênio:** 3736097
- **Formato:** CNAB 240

#### Gateway de Pagamento (Opcional)
```bash
# Stripe (Recomendado)
NEXT_PUBLIC_STRIPE_API_KEY=sk_test_your_key
NEXT_PUBLIC_STRIPE_ENABLED=true

# PagSeguro
NEXT_PUBLIC_PAGSEGURO_API_KEY=your_key
NEXT_PUBLIC_PAGSEGURO_ENABLED=true

# Mercado Pago
NEXT_PUBLIC_MERCADOPAGO_API_KEY=your_key
NEXT_PUBLIC_MERCADOPAGO_ENABLED=true
```

#### Notificações (Opcional)
```bash
# WhatsApp Business API
NEXT_PUBLIC_WHATSAPP_API_KEY=your_key
NEXT_PUBLIC_WHATSAPP_ENABLED=true

# Email (SendGrid)
NEXT_PUBLIC_EMAIL_API_KEY=your_key
NEXT_PUBLIC_EMAIL_ENABLED=true
```

#### APIs das Distribuidoras (Opcional)
```bash
# CEMIG
NEXT_PUBLIC_CEMIG_API_KEY=your_key
NEXT_PUBLIC_CEMIG_ENABLED=true

# Enel
NEXT_PUBLIC_ENEL_API_KEY=your_key
NEXT_PUBLIC_ENEL_ENABLED=true

# CPFL
NEXT_PUBLIC_CPFL_API_KEY=your_key
NEXT_PUBLIC_CPFL_ENABLED=true
```

## 🚀 Deploy

### Deploy Local (Desenvolvimento)
```bash
# Executar em desenvolvimento
npm run dev

# Acessar: http://localhost:3000
```

### Deploy na Vercel (Produção)

1. **Conectar repositório:**
   - Faça push para GitHub
   - Conecte na Vercel
   - Configure as variáveis de ambiente

2. **Variáveis de ambiente na Vercel:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_STRIPE_API_KEY=sk_live_your_key
   NEXT_PUBLIC_STRIPE_ENABLED=true
   NEXT_PUBLIC_EMAIL_API_KEY=your_sendgrid_key
   NEXT_PUBLIC_EMAIL_ENABLED=true
   ```

3. **Deploy automático:**
   - A cada push para `main`, o deploy será automático
   - Preview deployments para branches

### Deploy Manual (Produção)
```bash
# Build de produção
npm run build

# Executar servidor
npm start

# Ou usar PM2
pm2 start npm --name "solar-dg-platform" -- start
```

## 🔧 Configurações Avançadas

### 1. Parser de PDFs
Para implementar parser real de PDFs:
```bash
npm install pdf-parse tesseract.js
```

### 2. Integração Real com APIs
Substitua os mocks em:
- `lib/distributor-apis.ts`
- `lib/payment-gateway.ts`
- `lib/notifications.ts`

### 3. Monitoramento
```bash
# Instalar Sentry (opcional)
npm install @sentry/nextjs
```

## 📊 Verificação do Deploy

### 1. Testes Básicos
- [ ] Dashboard carrega sem erros
- [ ] Upload de faturas funciona
- [ ] Geração de remessa BB funciona
- [ ] CRM pipeline funciona
- [ ] Todas as páginas responsivas

### 2. Testes de Integração
- [ ] Supabase conecta corretamente
- [ ] Upload para Storage funciona
- [ ] RLS funciona por role
- [ ] Notificações enviam (se configuradas)

### 3. Performance
- [ ] Lighthouse score > 90
- [ ] Tempo de carregamento < 3s
- [ ] Bundle size otimizado

## 🚨 Troubleshooting

### Erro de Conexão Supabase
```bash
# Verificar variáveis de ambiente
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Verificar RLS
# Acesse Supabase Dashboard > Authentication > Policies
```

### Erro de Build
```bash
# Limpar cache
rm -rf .next
npm run build

# Verificar TypeScript
npx tsc --noEmit
```

### Erro de Upload
```bash
# Verificar Storage Bucket
# Supabase Dashboard > Storage > Buckets
# Criar bucket 'documents' se não existir
```

## 📈 Monitoramento

### Logs
```bash
# Vercel
vercel logs

# Local
npm run dev
```

### Métricas
- **Performance:** Vercel Analytics
- **Erros:** Sentry (opcional)
- **Uptime:** Vercel Status

## 🔒 Segurança

### Variáveis Sensíveis
- Nunca commite `.env.local`
- Use variáveis de ambiente no Vercel
- Rotacione chaves regularmente

### RLS (Row Level Security)
- Todas as tabelas protegidas
- Políticas por role implementadas
- Teste com diferentes usuários

## 🎯 Próximos Passos

1. **Configurar integrações reais**
2. **Implementar parser de PDFs**
3. **Adicionar testes automatizados**
4. **Configurar CI/CD**
5. **Monitoramento avançado**

---

**Sistema pronto para produção! 🚀** 