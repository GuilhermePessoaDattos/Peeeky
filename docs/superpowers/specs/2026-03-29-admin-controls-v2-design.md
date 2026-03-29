# Admin Controls V2 — Design Spec

> 2026-03-29

---

## 1. Objetivo

Incrementar o admin dashboard com controles operacionais que permitem gerenciar o negócio no dia a dia: bloquear/suspender usuários e orgs, monitorar trials, tomar ações em massa, e ter visibilidade granular sobre o uso do produto.

---

## 2. Novos Controles

### 2.1 Suspender/Bloquear Organização

**Comportamento:**
- Campo `suspended: Boolean @default(false)` na Organization
- Org suspensa: todos os links ficam inacessíveis (viewer mostra "This organization has been suspended")
- Membros da org veem banner "Your account has been suspended. Contact support."
- Documentos e dados preservados (não deletados)
- Admin pode reativar a qualquer momento

**Razões para suspender:**
- Violação de termos
- Conteúdo ilegal
- Chargeback/fraude
- Pedido do próprio usuário

**UI no admin:**
- Toggle "Suspend" na org detail page
- Campo "Reason" (texto) obrigatório ao suspender
- Badge "SUSPENDED" na lista de orgs
- Log de suspensão/reativação no audit trail

### 2.2 Bloquear Usuário

**Comportamento:**
- Campo `blocked: Boolean @default(false)` no User
- User bloqueado: login redirecionado para tela "Your account has been blocked"
- Sessões existentes invalidadas (user precisa relogar e será bloqueado)

**UI no admin:**
- Toggle "Block" na tabela de users
- Campo "Reason" obrigatório
- Badge "BLOCKED" na lista de users

### 2.3 Trial Tracking

**Problema atual:** Não temos conceito de "trial". O Free plan é permanente. Para competir com DocSend, podemos querer oferecer:
- Trial do Pro por 14 dias
- Depois volta ao Free

**Implementação:**
- Campo `trialEndsAt: DateTime?` na Organization
- Quando o user faz signup → `trialEndsAt = now + 14 days`
- Durante o trial, features do Pro ficam liberadas
- Cron job diário verifica trials expirados → volta ao FREE
- Admin vê dias restantes na lista de orgs
- Admin pode estender trial manualmente

**Métricas visíveis:**
- Orgs em trial ativo
- Dias médios de trial restante
- Taxa de conversão trial → paid
- Orgs com trial expirado (não converteram)

### 2.4 Org Activity Timeline

Visibilidade detalhada do que aconteceu em cada org:
- Últimos logins dos membros
- Documentos criados/deletados
- Links criados
- Views recebidas
- eSignatures enviadas
- Upgrade/downgrade de plano

Fonte: tabela `AuditEvent` + queries de atividade recente

### 2.5 Impersonação (Login como user)

**Para suporte:** Admin pode "logar como" qualquer user para ver o que ele vê e diagnosticar problemas.

- Botão "Impersonate" na lista de users
- Seta cookie especial `admin_impersonating={userId}`
- Barra amarela no topo: "You are impersonating [user]. Click to stop."
- Ao clicar, remove cookie e volta ao admin

### 2.6 Métricas de Engajamento por Org

Cards adicionais na org detail:
- **Último login:** data do último acesso de qualquer membro
- **Última view recebida:** quando foi o último viewer
- **Health score:** baseado em atividade nos últimos 7 dias
  - Green: ativo (criou docs ou recebeu views)
  - Yellow: baixa atividade (logou mas não criou nada)
  - Red: inativo (nenhum login em 7+ dias)
  - Gray: nunca usou

### 2.7 Ações em Massa

- Selecionar múltiplas orgs na lista
- Ações disponíveis:
  - Suspender todas
  - Mudar plano em massa
  - Enviar email customizado
  - Estender trial

### 2.8 Admin Activity Log

Registrar todas as ações do admin:
- Quem fez (email do admin)
- O que fez (suspend, block, change plan, impersonate, extend trial)
- Quando
- Em qual org/user

---

## 3. Schema Changes

```prisma
// Organization — adicionar:
suspended     Boolean   @default(false)
suspendedAt   DateTime?
suspendReason String?
trialEndsAt   DateTime?

// User — adicionar:
blocked       Boolean   @default(false)
blockedAt     DateTime?
blockReason   String?
lastLoginAt   DateTime?

// Novo modelo:
model AdminAction {
  id         String   @id @default(cuid())
  adminEmail String
  action     String   // SUSPEND_ORG, UNSUSPEND_ORG, BLOCK_USER, UNBLOCK_USER, CHANGE_PLAN, EXTEND_TRIAL, IMPERSONATE
  targetType String   // ORG, USER
  targetId   String
  reason     String?
  metadata   Json?
  createdAt  DateTime @default(now())
}
```

---

## 4. Novas API Routes

```
POST /api/admin/organizations/[id]/suspend   — { reason }
POST /api/admin/organizations/[id]/unsuspend
POST /api/admin/organizations/[id]/extend-trial — { days }
POST /api/admin/users/[id]/block    — { reason }
POST /api/admin/users/[id]/unblock
POST /api/admin/impersonate         — { userId }
POST /api/admin/stop-impersonate
GET  /api/admin/activity            — admin action log
```

---

## 5. UI Changes

### 5.1 Organization List — Novas colunas
- Trial (dias restantes ou "Expired" ou "—")
- Status (Active / Suspended / Trial)
- Health (🟢🟡🔴⚪)
- Last Activity

### 5.2 Organization Detail — Novas seções
- **Status bar** no topo: badge Suspended/Active com toggle
- **Trial info:** dias restantes, botão "Extend Trial"
- **Activity timeline:** últimas ações da org
- **Health score** com explicação

### 5.3 Users List — Novas colunas
- Status (Active / Blocked)
- Last Login
- Botão "Block" / "Impersonate"

### 5.4 Nova página: `/admin/activity`
- Log de todas as ações do admin
- Tabela: Admin, Action, Target, Reason, Date

---

## 6. Viewer/App Changes

### 6.1 Suspended Org Gate
No middleware ou layout do dashboard:
```typescript
if (org.suspended) {
  return <SuspendedBanner reason={org.suspendReason} />;
}
```

No viewer público:
```typescript
if (link.document.org.suspended) {
  return "This document is temporarily unavailable";
}
```

### 6.2 Blocked User Gate
No middleware:
```typescript
if (user.blocked) {
  redirect("/blocked");
}
```

Página `/blocked`:
"Your account has been blocked. Contact hello@peeeky.com for assistance."

---

## 7. Prioridade

**P0 (implementar agora):**
1. Suspend/unsuspend org (schema + API + UI + viewer gate)
2. Block/unblock user (schema + API + UI + login gate)
3. Trial tracking (schema + trial assignment + cron + admin UI)
4. Admin action log

**P1 (implementar depois):**
5. Impersonation
6. Health score
7. Activity timeline
8. Bulk actions
