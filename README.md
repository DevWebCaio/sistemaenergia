# 🚀 Sistema Energia - Solar DG Platform

## 📋 Descrição

Sistema completo de gestão de energia solar distribuída desenvolvido com Next.js 15, TypeScript, TailwindCSS e Supabase. Plataforma moderna para controle de unidades consumidoras, usinas de energia, faturas, contratos e análise financeira.

## ✨ Funcionalidades

### 🏠 **Dashboard**
- Métricas em tempo real
- Gráficos de performance
- Atividades recentes
- Visão geral do sistema

### 🏢 **Unidades Consumidoras**
- CRUD completo de UCs
- Gestão de instalações
- Controle de distribuidoras
- Monitoramento de consumo

### ⚡ **Usinas de Energia**
- Cadastro de plantas solares
- Controle de potência instalada
- Gestão de CNPJ e operação
- Status de funcionamento

### 🔋 **Cofre Energético**
- Compensação de energia
- Upload de PDFs
- Extração automática de dados
- Histórico de transações

### 📄 **Contratos**
- Gestão de contratos
- Assinatura digital
- Controle de vigência
- Status de ativação

### 📊 **Faturas**
- Processamento automático
- Upload de PDFs
- Extração de dados
- Controle de vencimentos

### 💰 **Financeiro**
- Integração Banco do Brasil
- Geração de remessa CNAB240
- Controle de pagamentos
- Gestão de cobranças

### 👥 **CRM**
- Pipeline de vendas
- Gestão de clientes
- Controle de leads
- Follow-up automático

### 📈 **Relatórios**
- Analytics avançados
- Gráficos interativos
- Exportação de dados
- Métricas de performance

### ⚙️ **Configurações**
- Configurações do sistema
- Notificações
- Gateways de pagamento
- Segurança

## 🛠️ Tecnologias

- **Frontend:** Next.js 15, React 19, TypeScript
- **Styling:** TailwindCSS, ShadCN/UI
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Deploy:** Vercel
- **APIs:** WhatsApp Business, SendGrid, Twilio
- **Pagamentos:** Stripe, PagSeguro, MercadoPago

## 🚀 Deploy

### **Repositório GitHub:**
```
https://github.com/DevWebCaio/sistemaenergia
```

### **URL de Produção:**
```
https://sistemaenergia.vercel.app
```

## 📦 Instalação

### **Pré-requisitos:**
- Node.js 18+
- npm ou pnpm
- Conta Supabase

### **1. Clone o repositório:**
```bash
git clone https://github.com/DevWebCaio/sistemaenergia.git
cd sistemaenergia
```

### **2. Instale as dependências:**
```bash
npm install
```

### **3. Configure as variáveis de ambiente:**
```bash
cp env.example .env.local
```

Edite o `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
```

### **4. Execute o projeto:**
```bash
npm run dev
```

Acesse: `http://localhost:3000`

## 🔧 Configuração

### **Supabase:**
1. Crie um projeto no Supabase
2. Execute o script SQL: `scripts/create-complete-database-schema.sql`
3. Configure as variáveis de ambiente

### **APIs Externas:**
- **WhatsApp Business:** Para notificações
- **SendGrid:** Para emails
- **Twilio:** Para SMS
- **Stripe/PagSeguro/MercadoPago:** Para pagamentos

## 📊 Estrutura do Projeto

```
sistemaenergia/
├── app/                    # Páginas Next.js 15 (App Router)
│   ├── api/               # APIs serverless
│   ├── dashboard/         # Dashboard principal
│   ├── consumer-units/    # Unidades consumidoras
│   ├── power-plants/      # Usinas de energia
│   ├── energy-vault/      # Cofre energético
│   ├── contracts/         # Contratos
│   ├── invoices/          # Faturas
│   ├── financial/         # Sistema financeiro
│   ├── crm/              # CRM
│   ├── reports/          # Relatórios
│   └── settings/         # Configurações
├── components/            # Componentes React
│   ├── ui/               # Componentes UI (ShadCN)
│   └── layout/           # Layout components
├── lib/                  # Bibliotecas e utilitários
│   ├── supabase/         # Cliente Supabase
│   ├── automation.ts     # Sistema de automação
│   ├── notifications.ts  # Sistema de notificações
│   ├── payment-gateway.ts # Gateway de pagamento
│   └── pdf-parser.ts     # Parser de PDFs
├── scripts/              # Scripts SQL
└── public/               # Arquivos estáticos
```

## 🎨 Design System

### **Cores:**
- **Primária:** Azul (#3B82F6)
- **Secundária:** Cinza (#6B7280)
- **Sucesso:** Verde (#10B981)
- **Aviso:** Amarelo (#F59E0B)
- **Erro:** Vermelho (#EF4444)

### **Tipografia:**
- **Fonte:** Inter (Google Fonts)
- **Tamanhos:** 12px, 14px, 16px, 18px, 24px, 32px
- **Pesos:** 400, 500, 600, 700

### **Componentes:**
- **Cards:** Fundo branco, bordas suaves
- **Botões:** Hover cinza, transições suaves
- **Tabelas:** Linhas alternadas, hover effects
- **Formulários:** Validação em tempo real

## 🔒 Segurança

- **Autenticação:** Supabase Auth
- **RLS:** Row Level Security
- **HTTPS:** Forçado em produção
- **CORS:** Configurado adequadamente
- **Rate Limiting:** Implementado nas APIs

## 📈 Performance

- **Build:** Otimizado com Next.js 15
- **Images:** Otimização automática
- **Fonts:** Carregamento otimizado
- **Bundle:** Code splitting automático
- **Caching:** Estratégias implementadas

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes de integração
npm run test:integration

# Coverage
npm run test:coverage
```

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Start de produção
npm start

# Lint
npm run lint

# Type check
npm run type-check
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'feat: Adicionar nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

- **Email:** suporte@solardg.com
- **Documentação:** [docs.solardg.com](https://docs.solardg.com)
- **Issues:** [GitHub Issues](https://github.com/DevWebCaio/sistemaenergia/issues)

## 🚀 Roadmap

- [ ] **PWA:** Progressive Web App
- [ ] **Mobile:** App nativo React Native
- [ ] **AI:** Integração com IA para análise
- [ ] **IoT:** Conectividade com dispositivos
- [ ] **Multi-tenant:** Suporte a múltiplos clientes
- [ ] **API REST:** Documentação completa
- [ ] **Webhooks:** Integração com sistemas externos

---

**⭐ Se este projeto te ajudou, considere dar uma estrela no GitHub!**

**Desenvolvido com ❤️ pela equipe Solar DG Platform** 