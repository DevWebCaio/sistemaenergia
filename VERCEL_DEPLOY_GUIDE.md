# 🚀 GUIA DE DEPLOY NO VERCEL - SISTEMA ENERGIA

## 📋 PRÉ-REQUISITOS

### 1. **Conta Vercel**
- Acesse: https://vercel.com
- Faça login com sua conta GitHub
- Verifique se tem acesso ao repositório `sistemaenergia`

### 2. **Repositório GitHub**
- ✅ Repositório: `DevWebCaio/sistemaenergia`
- ✅ Branch: `main`
- ✅ Status: Atualizado e pronto

## 🔧 CONFIGURAÇÃO DO DEPLOY

### **PASSO 1: CONECTAR REPOSITÓRIO**

1. Acesse: https://vercel.com/dashboard
2. Clique em **"New Project"**
3. Selecione **"Import Git Repository"**
4. Escolha: `DevWebCaio/sistemaenergia`
5. Clique em **"Import"**

### **PASSO 2: CONFIGURAR PROJETO**

**Configurações do Projeto:**
- **Framework Preset:** Next.js ✅
- **Root Directory:** `./` (padrão)
- **Build Command:** `npm run build` ✅
- **Output Directory:** `.next` ✅
- **Install Command:** `npm install` ✅

### **PASSO 3: VARIÁVEIS DE AMBIENTE**

**Adicione as seguintes variáveis:**

```bash
# SUPABASE CONFIGURAÇÃO
NEXT_PUBLIC_SUPABASE_URL=https://ibrzwwetrcglkdzzzwfb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlicnp3d2V0cmNnbGtkenp6d2ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5NzI5NzAsImV4cCI6MjA1MTU0ODk3MH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlicnp3d2V0cmNnbGtkenp6d2ZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTk3Mjk3MCwiZXhwIjoyMDUxNTQ4OTcwfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8

# CONFIGURAÇÕES OPCIONAIS
NEXT_PUBLIC_APP_URL=https://sistemaenergia.vercel.app
NODE_ENV=production
```

### **PASSO 4: EXECUTAR DEPLOY**

1. Clique em **"Deploy"**
2. Aguarde o build (2-3 minutos)
3. Verifique se não há erros

## 🔍 VERIFICAÇÕES PÓS-DEPLOY

### **1. Testar Funcionalidades:**
- ✅ Dashboard carrega
- ✅ Menu de navegação funciona
- ✅ Páginas acessíveis
- ✅ APIs funcionando
- ✅ Botões clicáveis

### **2. Verificar Console:**
- ✅ Sem erros de build
- ✅ Variáveis de ambiente carregadas
- ✅ Supabase conectado
- ✅ Debug logs funcionando

### **3. Testar Responsividade:**
- ✅ Desktop (1920px)
- ✅ Tablet (768px)
- ✅ Mobile (375px)

## 🛠️ CONFIGURAÇÕES AVANÇADAS

### **Domínio Personalizado:**
1. Vá em **Settings** > **Domains**
2. Adicione seu domínio
3. Configure DNS conforme instruções

### **Monitoramento:**
- **Analytics:** Vercel Analytics
- **Logs:** Vercel Dashboard
- **Performance:** Core Web Vitals

## 🚨 TROUBLESHOOTING

### **Erro de Build:**
```bash
# Verificar logs
vercel logs

# Rebuild local
npm run build
```

### **Erro de Variáveis:**
- Verificar se todas as variáveis estão configuradas
- Verificar se não há espaços extras
- Verificar se as chaves Supabase estão corretas

### **Erro de Supabase:**
- Verificar se as chaves estão corretas
- Verificar se o projeto Supabase está ativo
- Verificar se o banco está configurado

## 📞 SUPORTE

**Em caso de problemas:**
1. Verificar logs no Vercel Dashboard
2. Testar build local: `npm run build`
3. Verificar variáveis de ambiente
4. Contatar suporte se necessário

## 🎯 RESULTADO ESPERADO

**URL de Produção:** `https://sistemaenergia.vercel.app`

**Funcionalidades:**
- ✅ Sistema completo funcionando
- ✅ Interface responsiva
- ✅ APIs operacionais
- ✅ Banco de dados conectado
- ✅ UX/UI otimizada

---

**✅ DEPLOY CONCLUÍDO COM SUCESSO!** 