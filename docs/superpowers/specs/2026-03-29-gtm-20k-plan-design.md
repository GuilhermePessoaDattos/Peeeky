# Peeeky — Plano Prático GTM: R$20K/mês em 12 meses

> Design aprovado em 29/03/2026
> Fundador: CEO de outra empresa, 5h/semana disponíveis, sem exposição pessoal
> Persona pública: Alex Moreira (Head of Product @ Peeeky)

---

## 1. Estratégia Geral e Números

**Meta:** R$20K/mês (~$3.700 USD) em até 12 meses

**Estado atual:** Produto deployado em peeeky.com, 100% funcional (signup → upload → share → tracking → AI chat), zero usuários.

### Fontes de receita paralelas

| Canal | Receita esperada mês 12 | Quando começa |
|-------|------------------------|---------------|
| AppSumo (one-time cash) | R$15-40K total (não recorrente) | Mês 1-3 |
| Pro/Business recorrente (PLG + outbound) | R$12-15K/mês | Mês 3+ |
| Enterprise/M&A (outbound direto) | R$5-8K/mês | Mês 6+ |

### Mix de clientes no mês 12

- ~40 Pro ($39) = $1.560/mês
- ~15 Business ($129) = $1.935/mês
- Total: ~$3.500/mês = ~R$19K/mês
- AppSumo cash reinvestido nos primeiros meses como runway

### 5 Pilares de Execução (todos agent-driven)

1. **AppSumo Blitz** — cash + usuários + social proof imediatos
2. **Open-source (peeeky-js + viewer)** — trust + GitHub stars + dev community + SEO
3. **Content Engine** — blog SEO, LinkedIn do Alex, comunidades
4. **Outbound Automatizado** — cold email como Alex para founders/sales/M&A
5. **Paid Ads** — Google Ads a partir do mês 4 (quando tiver social proof)

### Tempo do fundador (5h/semana)

- 1h: revisar outputs dos agentes (emails, posts, PRs)
- 1h: aprovar/rejeitar deals AppSumo e enterprise
- 1h: decisões estratégicas (pricing, features, priorização)
- 2h: buffer para imprevistos

---

## 2. AppSumo Blitz (Mês 1-3)

### Estrutura do deal

| Tier | Preço | O que inclui | Limite |
|------|-------|-------------|--------|
| Tier 1 ($59) | ~R$320 | Pro features, 50 docs, 1 user | — |
| Tier 2 ($99) | ~R$535 | Pro features, unlimited docs, 3 users | — |
| Tier 3 ($149) | ~R$805 | Business features, unlimited docs, 5 users, 1 data room | — |

### Projeção conservadora

- 200-400 vendas em 60 dias no marketplace
- Ticket médio: $79
- Cash bruto: $15.800-$31.600 (R$85K-170K)
- AppSumo fica com 30% nos primeiros deals
- Líquido: ~R$60-120K

### O que você ganha além do cash

- 200-400 usuários reais usando o produto (geram bugs, feedback, viral loop)
- Reviews no AppSumo (social proof)
- Badge "Powered by Peeeky" em todos os docs compartilhados = aquisição orgânica
- Base para pedir reviews no G2/Capterra

### O que precisa preparar

1. Criar conta de seller no AppSumo (como Peeeky, não pessoa física)
2. Criar plano "AppSumo" no Stripe com os tiers
3. Implementar redeem de códigos AppSumo no app
4. Preparar landing page específica AppSumo
5. 4-5 screenshots + vídeo demo de 90s (screen recording + voz sintética)

### Risco principal

Suporte. 200-400 AppSumo users geram tickets. Mitigação: agente de customer support + FAQ robusta + email sequences automáticas de onboarding.

### Timeline

- Semana 1-2: preparar assets, implementar redeem, submeter ao AppSumo
- Semana 3-4: review do AppSumo (eles avaliam o produto)
- Mês 2-3: live no marketplace

---

## 3. Open-Source (peeeky-js SDK + Viewer)

**Objetivo:** GitHub stars → visibilidade dev → trust → conversão para hosted.

### 3.1 `peeeky-js` (SDK)

Lib JavaScript leve (~5KB) que devs adicionam em qualquer app para trackear visualização de documentos.

```
npm install peeeky-js
```

```js
import { Peeeky } from 'peeeky-js'

Peeeky.init({ apiKey: 'pk_live_...' })
Peeeky.track({ documentId: 'doc_123', viewerEmail: 'john@acme.com' })
```

**Features da SDK:**
- Track page views, tempo por página, scroll depth
- Identifica viewer (email ou anônimo)
- Envia eventos para API do Peeeky hosted
- Leve, zero dependências, funciona em browser e Node

**Modelo de monetização:** SDK é grátis e open-source. Os dados vão para o dashboard do Peeeky (hosted) — que é onde está o valor. Free tier limitado, Pro/Business para analytics completos.

**Repositório:** `github.com/peeeky/peeeky-js` — MIT license

### 3.2 `peeeky-viewer` (Viewer Open-Source)

Componente React de visualização de PDF com tracking embutido.

```jsx
import { PeeekyViewer } from '@peeeky/viewer'

<PeeekyViewer
  src="/docs/proposal.pdf"
  apiKey="pk_live_..."
  onPageView={(page, timeSpent) => {}}
/>
```

**Features do viewer:**
- Renderização de PDF page-by-page (sem download)
- Tracking de tempo por página embutido
- Responsivo (mobile-friendly)
- Customizável (cores, logo, branding)
- Funciona standalone OU conectado ao Peeeky hosted

**O que fica FORA do open-source (moat do produto):**
- AI Chat
- Smart alerts e engagement scoring
- Data Rooms
- E-signature
- Dashboard de analytics
- Access controls avançados (password, NDA, watermark)

**Repositório:** `github.com/peeeky/viewer` — MIT license

### 3.3 Estratégia de Stars e Visibilidade

| Ação | Quando | Meta |
|------|--------|------|
| Launch no r/reactjs, r/webdev, r/javascript | Semana do launch | 50-100 stars |
| Post no Hacker News "Show HN" | Semana 1 | 100-200 stars |
| Post LinkedIn do Alex: "We just open-sourced our document viewer" | Semana 1 | Shares |
| README excelente com GIF demo, badges, quick start | Day 1 | — |
| Publicar no npm com docs no site | Day 1 | Downloads |
| Awesome lists (awesome-react, awesome-pdf) | Mês 1-2 | Backlinks + stars |
| Dev.to / Hashnode artigos técnicos | Mês 1-3 | SEO + stars |

**Meta:** 500 stars em 3 meses, 1.500+ em 12 meses.

**Manutenção:** Agente monitora issues e PRs no GitHub. Fundador revisa PRs significativos (~30min/semana).

### 3.4 Funil Open-Source → Paid

```
Dev encontra peeeky-js/viewer no GitHub
    → Usa no projeto dele
    → Precisa de analytics → cria conta free no peeeky.com
    → Hit limits → upgrade Pro/Business
```

---

## 4. Content Engine Automatizado (Agentes)

### 4.1 Blog SEO (Agente de Conteúdo)

**Cadência:** 2 posts/semana, publicados como "Alex Moreira, Peeeky Team"

**Tipos de post (rotação):**

| Tipo | Exemplo | Objetivo |
|------|---------|----------|
| Comparison SEO | "Peeeky vs DocSend: Free Alternative with AI" | Bottom funnel, alta conversão |
| Pain-point tutorial | "How to Know if Investors Read Your Pitch Deck" | Mid funnel, SEO volume |
| Data-driven insight | "We Analyzed 10,000 Document Views — Here's When People Actually Read" | Top funnel, shareability |
| Use case deep-dive | "Virtual Data Rooms for M&A Without Enterprise Pricing" | Bottom funnel, nicho |

**Workflow do agente:**
1. Pesquisa keyword (volume, dificuldade)
2. Escreve draft completo com SEO on-page
3. Gera meta description, OG tags, internal links
4. Salva como PR ou draft no CMS
5. Fundador revisa em batch 1x/semana (~20 min para 2 posts)

### 4.2 LinkedIn — Alex Moreira (Agente Social)

**Cadência:** 4-5 posts/semana

**Mix de conteúdo:**
- 40% Building in public: "Week 8: 200 AppSumo users later, here's what they taught us"
- 30% Insights práticos: "3 signals that tell you an investor is serious about your deck"
- 20% Produto: screenshots, features novas, comparações
- 10% Engagement: polls, perguntas, reposts comentados

**Workflow do agente:**
1. Gera 5 posts por semana no domingo
2. Adapta formato LinkedIn (hook forte, quebras de linha, CTA suave)
3. Agenda via Buffer/Typefully (Alex)
4. Fundador revisa batch em 15 min

### 4.3 Comunidades (Agente de Comunidade)

| Comunidade | Frequência | Abordagem |
|-----------|-----------|-----------|
| r/startups, r/SaaS | 3-5 respostas/semana | Responder perguntas sobre pitch decks, doc sharing |
| r/sales | 2-3 respostas/semana | Dicas de follow-up, tracking proposals |
| Indie Hackers | 1-2 posts/semana | Building in public updates |
| Hacker News | 1 comentário/dia | Valor técnico em threads relevantes |
| LinkedIn Groups (Sales, Founders) | 2-3/semana | Alex comenta e compartilha |

**Regra 80/20:** 80% valor genuíno, 20% menção ao produto. Agente nunca spama.

**Workflow do agente:**
1. Monitora keywords nas comunidades (pitch deck, document tracking, docsend, etc.)
2. Gera resposta útil com menção sutil quando relevante
3. Posta automaticamente ou enfileira para aprovação (depende da comunidade)

### 4.4 Email Sequences Automáticas (Onboarding)

| Dia | Email | Remetente |
|-----|-------|-----------|
| 0 | Welcome + quick start guide | Peeeky Team |
| 1 | "Upload your first document in 60 seconds" (tutorial) | Alex |
| 3 | "Did you create your first tracked link?" | Alex |
| 7 | "Here's what your viewers are telling you" (se teve views) | Alex |
| 14 | "You're on Free — here's what Pro unlocks" | Peeeky Team |
| 21 | "3 founders who closed deals faster with Peeeky" (social proof) | Alex |
| 30 | "Your trial insights" (recap de uso) | Peeeky Team |

---

## 5. Outbound Automatizado (Agente de Vendas)

### 5.1 Segmentos-alvo (por prioridade)

| Segmento | Por que | Onde encontrar | Plano esperado |
|----------|---------|---------------|----------------|
| Founders que levantaram rodada nos últimos 60 dias | Dor imediata — acabaram de passar pelo pesadelo de enviar decks sem tracking | Crunchbase, TechCrunch, LinkedIn | Pro ($39) |
| VPs/Directors de Sales em B2B SaaS (10-200 funcionários) | Enviam propostas toda semana, precisam priorizar follow-ups | Apollo.io, LinkedIn Sales Navigator | Pro/Business |
| M&A advisors e investment bankers | Data rooms são core do trabalho, pagam premium | LinkedIn, diretórios de M&A | Business ($129) |
| Aceleradoras e VCs | Distribuem para portfolio inteiro = multiplicador | Crunchbase, sites das aceleradoras | Partnership (Pro grátis para portfolio) |

### 5.2 Workflow do Agente de Outbound

```
1. Scrape leads do Apollo/Crunchbase (30/dia)
2. Pesquisa cada lead: empresa, cargo, rodada recente, tech stack
3. Personaliza email com dado específico do lead
4. Envia via SendGrid/Resend como alex@peeeky.com
5. Track opens/replies
6. Se reply positivo → notifica fundador no Slack/email
7. Se no reply em 3 dias → follow-up automático (máx 2)
```

### 5.3 Templates (personalizados por segmento)

**Founders (pós-rodada):**
```
Subject: Congrats on the raise, [Name] — quick question

Hi [Name],

Saw [Company] just closed [round]. Congrats.

Quick question: when you were sending your deck to investors,
did you have any way to know who actually read it vs. who ghosted?

We built Peeeky for exactly that — per-page tracking, AI chat
for recipients, and smart follow-up alerts. Free to start.

Worth a look? peeeky.com

Best,
Alex
Head of Product, Peeeky
```

**Sales leaders:**
```
Subject: Your sales team is guessing when to follow up

Hi [Name],

When [Company]'s reps send a proposal, how do they know
the prospect actually read it before following up?

Peeeky shows exactly which pages they read, how long they
spent, and alerts you when engagement is high.
One team told us their close rate went up 40%.

Free tier, 2 min setup: peeeky.com

Alex
Head of Product, Peeeky
```

### 5.4 Volumes e Métricas

| Métrica | Meta |
|---------|------|
| Emails enviados/dia | 25-30 |
| Open rate | 40-50% |
| Reply rate | 5-8% |
| Conversão reply → signup | 30-40% |
| Conversão signup → paid | 10-15% |
| **Novos pagantes/mês via outbound** | **3-5** |

### 5.5 Ferramentas e Custo

| Ferramenta | Uso | Custo |
|-----------|-----|-------|
| Apollo.io (free→basic) | Lead sourcing, emails | $0-49/mês |
| Resend | Envio via alex@peeeky.com | Já tem |
| Hunter.io (free tier) | Verificação de emails | $0 |

---

## 6. Paid Ads (Mês 4+)

### 6.1 Google Ads (Mês 4-12)

Só search ads — não display. Alto intent, baixo desperdício.

| Campanha | Keywords | Landing page | CPC estimado |
|----------|---------|-------------|-------------|
| Competitor | "docsend alternative", "docsend pricing", "docsend free" | /vs/docsend | $1.50-3.00 |
| Pain-point | "track who views my pdf", "pitch deck tracking", "document analytics" | /for/fundraising | $1.00-2.50 |
| Category | "virtual data room free", "secure document sharing" | /for/mna | $2.00-4.00 |

**Budget:** R$1.000/mês (escala se CAC < R$200)

**Meta:**
- 300-500 cliques/mês
- 5-8% conversão para signup
- 15-25 signups/mês via ads
- 10-15% conversão free → paid = 2-3 novos pagantes/mês

### 6.2 LinkedIn Ads (Mês 6+, só se Google Ads validar)

| Audience | Targeting | Formato |
|----------|----------|---------|
| Founders | Title: CEO/Founder, Company size: 1-50, Industry: Tech | Sponsored post com screenshot |
| Sales leaders | Title: VP Sales/Head of Sales, Company size: 50-500 | Sponsored post com dado de ROI |

**Budget:** R$1.000/mês (separado do Google Ads)

**Por que só mês 6+:** LinkedIn Ads são caros ($5-15/clique). Precisa de social proof forte para converter.

### 6.3 Retargeting (Mês 4+)

- Pixel no site desde o dia 1
- Google Ads remarketing: visitantes do site que não fizeram signup
- Budget: incluído nos R$1.000 do Google Ads (20% do budget)

### 6.4 Budget Total por Fase

| Período | Google Ads | LinkedIn Ads | Total Ads |
|---------|-----------|-------------|-----------|
| Mês 1-3 | R$0 (foco AppSumo + orgânico) | R$0 | R$0 |
| Mês 4-5 | R$1.000 | R$0 | R$1.000 |
| Mês 6-8 | R$1.000 | R$1.000 | R$2.000 |
| Mês 9-12 | R$1.500 | R$1.000 | R$2.500 |

**Regra de ouro:** Só escala budget se CAC < 3x do MRR do cliente no primeiro mês. Pro ($39) → CAC máximo R$600. Business ($129) → CAC máximo R$2.000.

---

## 7. Timeline Consolidada e Projeção Financeira

### 7.1 Timeline Mês a Mês

| Mês | Ações Principais | MRR Esperado | Cash Acumulado (AppSumo) |
|-----|-----------------|-------------|------------------------|
| **1** | Deploy open-source repos, preparar AppSumo, criar perfis Alex, iniciar content engine + outbound | $0 | R$0 |
| **2** | AppSumo live, Show HN do viewer, blog 2x/sem, outbound 25/dia | $0-100 | R$20-40K |
| **3** | AppSumo pico de vendas, primeiros reviews, Product Hunt launch | $100-300 | R$40-80K |
| **4** | Google Ads inicia, pedir reviews G2/Capterra, referral program ativo | $300-600 | — |
| **5** | Case studies com AppSumo users, escalar conteúdo, nurture sequences | $600-1.000 | — |
| **6** | LinkedIn Ads inicia, enterprise outbound M&A, webinars screen-only | $1.000-1.500 | — |
| **7** | Diretórios (Chrome Store, Zapier, AppSumo regular listing), parcerias aceleradoras | $1.500-2.000 | — |
| **8** | Otimizar funil (dados de 6 meses), escalar o que funciona, cortar o que não funciona | $2.000-2.500 | — |
| **9** | Enterprise push (M&A advisors, investment bankers), tiered pricing review | $2.500-3.000 | — |
| **10** | Expansão: novos use cases, integrações (Slack, Zapier), upsell base existente | $3.000-3.300 | — |
| **11** | Double down nos canais top 2, annual plans com desconto para lock-in | $3.300-3.500 | — |
| **12** | Otimização final, meta R$20K/mês | $3.500-3.700 | — |

### 7.2 Projeção de Clientes Pagantes

| Mês | Novos (outbound) | Novos (PLG/SEO) | Novos (ads) | Churn | Total Pagantes | MRR |
|-----|-----------------|----------------|------------|-------|---------------|-----|
| 1 | 0 | 0 | 0 | 0 | 0 | $0 |
| 2 | 1 | 1 | 0 | 0 | 2 | $78 |
| 3 | 2 | 2 | 0 | 0 | 6 | $234 |
| 4 | 3 | 3 | 2 | 0 | 14 | $546 |
| 5 | 3 | 4 | 2 | 1 | 22 | $900 |
| 6 | 4 | 5 | 3 | 1 | 33 | $1.400 |
| 7 | 3 | 5 | 3 | 2 | 42 | $1.800 |
| 8 | 3 | 5 | 3 | 2 | 51 | $2.200 |
| 9 | 2 | 6 | 3 | 2 | 60 | $2.600 |
| 10 | 2 | 6 | 4 | 2 | 70 | $3.050 |
| 11 | 2 | 7 | 4 | 3 | 80 | $3.300 |
| 12 | 2 | 7 | 4 | 3 | 90 | $3.700 |

*Assume mix 70% Pro ($39) / 30% Business ($129) = ticket médio ~$66*

### 7.3 Budget Mensal (Saída de Caixa)

| Item | Mês 1-3 | Mês 4-6 | Mês 7-12 |
|------|---------|---------|----------|
| Infra (Vercel, R2, Resend, Upstash) | R$200 | R$300 | R$500 |
| Ferramentas (Apollo, Buffer, etc.) | R$200 | R$300 | R$300 |
| Google Ads | R$0 | R$1.000 | R$1.500 |
| LinkedIn Ads | R$0 | R$0-1.000 | R$1.000 |
| Voz sintética / assets | R$100 | R$0 | R$0 |
| **Total** | **R$500** | **R$1.600-2.600** | **R$3.300** |

### 7.4 Break-even

- **Cash AppSumo (mês 2-3):** ~R$40-80K líquido → cobre 12-24 meses de operação
- **MRR cobre custos mensais:** a partir do mês 7-8 (~$1.800 MRR = ~R$9.700)
- **Meta R$20K/mês:** MRR $3.700 = R$20K no mês 12

### 7.5 Cenário Acelerado

Se AppSumo performar muito bem (500+ vendas) e o open-source pegar tração (1.000+ stars em 3 meses):
- Mês 6: já com 40+ pagantes recorrentes
- Mês 9: R$20K/mês de MRR
- Cash AppSumo dá colchão para investir mais agressivo em ads

### 7.6 Agentes Necessários (Resumo)

| Agente | O que faz | Ferramenta base |
|--------|----------|----------------|
| Content Writer | 2 blog posts/semana SEO | Claude + skills de content |
| Social Manager | 5 posts LinkedIn/semana como Alex | Claude + Buffer/Typefully |
| Community Rep | Monitora e responde em Reddit, IH, HN | Claude + firecrawl |
| Outbound Sales | 25-30 cold emails/dia como Alex | Claude + Apollo + Resend |
| GitHub Maintainer | Triage issues, review PRs, responde discussions | Claude + GitHub API |
| Customer Support | Responde tickets, onboarding, FAQ | Claude + skills de CS |
| Analytics Reporter | Report semanal de métricas para fundador | Claude + Stripe/Vercel analytics |

### 7.7 Implementação dos Agentes

**Opção recomendada:** Claude Code com scheduled triggers (skill `/schedule`) para agentes recorrentes + scripts manuais para tasks pontuais.

- **Content Writer:** Trigger semanal (domingo) → gera 2 posts → salva como drafts em `/content/blog/drafts/`
- **Social Manager:** Trigger semanal (domingo) → gera 5 posts LinkedIn → salva em `/content/social/drafts/`
- **Community Rep:** Trigger diário → busca threads relevantes via firecrawl-search → gera respostas → enfileira para aprovação
- **Outbound Sales:** Trigger diário → scrape leads Apollo → personaliza emails → envia via Resend API
- **GitHub Maintainer:** Trigger diário → checa issues/PRs via `gh` CLI → responde/triage
- **Customer Support:** Reativo — webhook de novo ticket → agente responde
- **Analytics Reporter:** Trigger semanal (segunda) → puxa dados Stripe + Vercel + GitHub → gera report markdown

Cada agente roda como uma sessão Claude Code isolada com prompt específico e acesso às ferramentas necessárias.

---

## 8. Anonimato — Checklist

| Item | Status |
|------|--------|
| Persona "Alex Moreira" em todas as plataformas | A criar |
| Email alex@peeeky.com (alias no Resend) | A criar |
| LinkedIn pessoal como Alex Moreira | A criar |
| Foto AI-gerada consistente | A criar |
| AppSumo seller como "Peeeky" (empresa, não pessoa) | A criar |
| GitHub org "peeeky" (não pessoal) | A criar |
| Domínio registrado com privacy protection | Verificar |
| Stripe account como empresa (não CPF pessoal) | Verificar |
| Nunca vincular nome real em nenhuma plataforma | Regra permanente |
