# Peeeky Admin Dashboard — Design Spec

> 2026-03-29

---

## 1. Objetivo

Criar um painel administrativo para o dono do produto gerenciar o negócio Peeeky. O admin deve ter visibilidade total sobre usuários, organizações, receita, uso do produto, e poder tomar ações administrativas quando necessário.

O painel deve ser **extensível** para que no futuro possa gerenciar múltiplos produtos/negócios a partir da mesma interface.

---

## 2. Acesso e Segurança

### Autenticação
- Acesso restrito por **email whitelist** hardcoded (inicialmente só o email do dono)
- Verificação via session do NextAuth — se o email do user logado está na whitelist, acessa `/admin`
- Middleware bloqueia `/admin/*` para qualquer outro email
- Sem role "admin" no banco — a whitelist é suficiente para o estágio atual

### Configuração
```typescript
// src/config/admin.ts
export const ADMIN_EMAILS = [
  "guilherme@dattos.com.br", // ajustar para o email real
];
```

---

## 3. Estrutura de Páginas

```
/admin                    → Dashboard (métricas gerais)
/admin/organizations      → Lista de organizações
/admin/organizations/[id] → Detalhe de uma org
/admin/users              → Lista de usuários
/admin/revenue            → Receita e billing
/admin/usage              → Uso do produto (AI, storage, esignature)
/admin/referrals          → Programa de referral
```

---

## 4. Páginas — Especificação Detalhada

### 4.1 Dashboard (`/admin`)

**Métricas em cards:**

| Card | Query | Fórmula |
|------|-------|---------|
| Total Users | `prisma.user.count()` | Count |
| Total Organizations | `prisma.organization.count()` | Count |
| Total Documents | `prisma.document.count()` | Count |
| Total Views (all time) | `SUM(document.totalViews)` | Agregação |
| MRR | Orgs com plano PRO × $39 + BUSINESS × $129 | Cálculo |
| Active Users (7d) | Users com documents ou views nos últimos 7 dias | Count distinto |
| AI Chats (month) | `prisma.chatMessage.count()` where createdAt > início do mês | Count |
| Signature Requests | `prisma.signatureRequest.count()` | Count |

**Gráficos:**
- **Signups por dia** (últimos 30 dias) — bar chart com `user.createdAt` agrupado por dia
- **Views por dia** (últimos 30 dias) — bar chart com `view.createdAt` agrupado por dia
- **Revenue por plano** — pie chart (Free vs Pro vs Business count)

**Quick stats row:**
- Docs criados hoje
- Views hoje
- Novos signups hoje
- eSignatures completadas hoje

---

### 4.2 Organizations (`/admin/organizations`)

**Tabela com colunas:**

| Coluna | Fonte |
|--------|-------|
| Nome | `org.name` |
| Slug | `org.slug` |
| Plano | `org.plan` (badge colorido) |
| Membros | `COUNT(membership)` |
| Documentos | `COUNT(document)` |
| Views totais | `SUM(document.totalViews)` |
| Stripe Customer | `org.stripeCustomerId` (link para Stripe) |
| Criada em | `org.createdAt` |

**Filtros:**
- Por plano (Free / Pro / Business)
- Busca por nome

**Ações por org:**
- Ver detalhe
- Mudar plano manualmente (upgrade/downgrade forçado)
- Deletar org (com confirmação dupla)

### 4.3 Organization Detail (`/admin/organizations/[id]`)

**Seções:**

1. **Info** — nome, slug, plano, Stripe IDs, data de criação
2. **Membros** — tabela com email, role, data de entrada
3. **Documentos** — lista com nome, views, links, status
4. **Data Rooms** — lista com nome, docs, viewers
5. **eSignature Requests** — lista com título, status, signers
6. **Billing** — plano atual, Stripe subscription ID, histórico de mudanças
7. **Ações admin:**
   - Forçar upgrade/downgrade de plano
   - Resetar senha de links
   - Suspender org (desativar todos os links)

---

### 4.4 Users (`/admin/users`)

**Tabela com colunas:**

| Coluna | Fonte |
|--------|-------|
| Nome | `user.name` |
| Email | `user.email` |
| Organização | Via `membership.org.name` |
| Role | `membership.role` |
| Referral Code | `user.referralCode` |
| Stripe Connect | `user.stripeConnectId` (badge) |
| Cadastro | `user.createdAt` |

**Filtros:**
- Busca por email/nome
- Filtro por org

**Ações:**
- Ver org do user
- Deletar user (com confirmação)

---

### 4.5 Revenue (`/admin/revenue`)

**Métricas:**

| Métrica | Cálculo |
|---------|---------|
| MRR | (Pro orgs × $39) + (Business orgs × $129) |
| ARR | MRR × 12 |
| Orgs pagantes | Count where plan != FREE |
| Free → Paid conversion | Pagantes / Total |
| Churn risk | Orgs com stripeSubId = null E plan != FREE (grace period) |

**Tabela de orgs pagantes:**

| Coluna | Fonte |
|--------|-------|
| Org | `org.name` |
| Plano | `org.plan` |
| Receita mensal | $39 ou $129 |
| Stripe Sub ID | Link para Stripe |
| Desde | Data da primeira subscription |

**Tabela de referral payouts:**

| Coluna | Fonte |
|--------|-------|
| Referrer | `user.email` |
| Referred Org | `referral.referredOrg.name` |
| Plano | `referredOrg.plan` |
| Comissão/mês | 20% do plano |
| Status | PENDING/ACTIVE/PAID |

---

### 4.6 Usage (`/admin/usage`)

**Métricas:**

| Métrica | Query |
|---------|-------|
| Total documents | `document.count()` |
| Total R2 storage (estimado) | `document.count() × avg_size` |
| AI Chats este mês | `chatMessage.count()` no mês |
| AI Chats por org (top 10) | GroupBy orgId |
| eSignature requests | `signatureRequest.count()` |
| eSignatures completadas | Where status = COMPLETED |
| File requests recebidos | `fileRequest.count()` |

**Tabela de uso por org (top 20):**

| Coluna | Fonte |
|--------|-------|
| Org | Nome |
| Docs | Count |
| Views | Sum totalViews |
| AI Chats | Count chatMessages |
| eSignatures | Count signatureRequests |
| Plano | Plan |

---

### 4.7 Referrals (`/admin/referrals`)

**Métricas:**
- Total referrals criados
- Referrals ativos (convertidos)
- Total pago em comissões
- Top referrers (por count)

**Tabela:**

| Coluna | Fonte |
|--------|-------|
| Referrer | `user.email` |
| Referred Org | `org.name` |
| Plano referido | `org.plan` |
| Status | PENDING/ACTIVE/PAID |
| Comissão | 20% |
| Data | `referral.createdAt` |

---

## 5. Arquitetura Técnica

### Rotas API

Todas em `/api/admin/*`, protegidas pelo middleware de admin email check.

```
GET  /api/admin/stats          → métricas do dashboard
GET  /api/admin/organizations  → lista orgs com filtros
GET  /api/admin/organizations/[id] → detalhe de uma org
POST /api/admin/organizations/[id]/change-plan → forçar mudança de plano
GET  /api/admin/users          → lista users
GET  /api/admin/revenue        → métricas de receita
GET  /api/admin/usage          → métricas de uso
GET  /api/admin/referrals      → lista referrals
```

### Middleware

```typescript
// src/middleware.ts — adicionar:
if (pathname.startsWith("/admin")) {
  // Verificar se o email do user está na ADMIN_EMAILS
  // Se não, redirect para /documents
}
```

### UI

- Layout separado do dashboard (`/admin/layout.tsx`)
- Sidebar própria com links para cada seção
- Sem acesso ao sidebar do dashboard normal
- Design consistente com o resto do app (mesmas cores, fonts)
- Tabelas com paginação simples (limit/offset)
- Cards com números grandes e labels pequenos

---

## 6. Extensibilidade (Multi-negócio)

Para suportar múltiplos negócios no futuro:

- O admin dashboard é **independente** do dashboard do usuário
- Cada "negócio" seria um `Product` ou `Tenant` diferente
- Por agora, é um admin para o Peeeky apenas
- A estrutura de rotas `/admin` permite adicionar `/admin/products/[id]` depois
- Os queries Prisma não são filtrados por orgId (admin vê tudo)

---

## 7. O que NÃO faz parte deste módulo

- **CRM** — não é para gerenciar leads ou pipeline
- **Suporte** — não é helpdesk, não tem tickets
- **Logs de servidor** — usa Vercel/Sentry para isso
- **Deploy/infraestrutura** — usa Vercel dashboard
- **Edição de conteúdo** — blog é MDX no código

---

## 8. Prioridade de Implementação

**P0 (essencial):**
1. Dashboard com métricas gerais
2. Lista de organizações com plano e stats
3. Lista de usuários
4. Revenue overview (MRR, orgs pagantes)

**P1 (importante):**
5. Org detail com membros e docs
6. Usage metrics
7. Referrals overview

**P2 (nice to have):**
8. Gráficos de signups e views
9. Ações admin (change plan, suspend)
10. Filtros e busca avançada
