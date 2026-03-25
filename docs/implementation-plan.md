# Peeeky — Implementation Plan

> Technical execution plan. Each step has clear inputs, outputs, and dependencies.

---

## Phase 1 — MVP (Month 1-2)

### Sprint 1: Project Setup & Auth (Week 1)

#### 1.1 Project Scaffolding
```
Dependencies: none
Output: running Next.js project with all tooling configured
```

- [ ] `npx create-next-app@latest peeeky --typescript --tailwind --app --src-dir`
- [ ] Configure TypeScript strict mode in `tsconfig.json`
- [ ] Install core dependencies:
  ```
  prisma @prisma/client next-auth@5 @auth/prisma-adapter
  @upstash/redis @upstash/ratelimit
  zod nanoid bcryptjs
  ```
- [ ] Setup path aliases (`@/*` → `./src/*`)
- [ ] Create folder structure per architecture doc:
  ```
  src/app/(auth)/ (dashboard)/ (viewer)/ api/
  src/components/ui/ dashboard/ viewer/ analytics/
  src/modules/auth/ orgs/ documents/ links/ tracking/ ai/ billing/ notifications/ domains/ audit/
  src/jobs/
  src/lib/
  src/config/
  ```
- [ ] Create `.env.example` with all required env vars
- [ ] Setup ESLint + Prettier
- [ ] Init git, connect to GitHub, first push
- [ ] Setup Vercel project + auto-deploy from `main`

#### 1.2 Database & Prisma
```
Dependencies: 1.1
Output: Prisma schema deployed, seed script working
```

- [ ] Create Supabase project
- [ ] Write full `prisma/schema.prisma` (all models from architecture doc)
- [ ] Run `prisma db push` to create tables
- [ ] Enable pgvector extension in Supabase: `CREATE EXTENSION IF NOT EXISTS vector`
- [ ] Write seed script: create test Organization + User + Membership
- [ ] Create `src/lib/prisma.ts` (singleton pattern)
- [ ] Create `src/lib/redis.ts` (Upstash client)
- [ ] Create `src/lib/tenant.ts` (orgId extraction + RLS setup)

#### 1.3 Authentication
```
Dependencies: 1.2
Output: users can sign up, log in, and land on dashboard
```

- [ ] Configure NextAuth v5 in `src/modules/auth/`
  - Google OAuth provider
  - Email magic link provider (via Resend)
  - Prisma adapter
  - JWT strategy with `orgId` in token
- [ ] Create auth API route: `src/app/api/auth/[...nextauth]/route.ts`
- [ ] Implement signup flow:
  - On first login → auto-create Organization + Membership (OWNER)
  - Set `orgId` in JWT claims
- [ ] Create login page: `src/app/(auth)/login/page.tsx`
  - Google button + email input
  - Clean, minimal design
- [ ] Create auth middleware: protect `(dashboard)` routes
- [ ] Create org switcher logic (store active orgId in cookie)
- [ ] Test: signup → land on dashboard → refresh → still authenticated

---

### Sprint 2: Document Upload & Storage (Week 2)

#### 2.1 File Storage (R2)
```
Dependencies: 1.2
Output: files upload to R2, signed URLs work
```

- [ ] Create Cloudflare R2 bucket (`peeeky-documents`)
- [ ] Create `src/lib/r2.ts`:
  - `uploadFile(buffer, key)` → upload to R2
  - `getSignedUrl(key, expiresIn)` → presigned URL (1 hour)
  - `deleteFile(key)` → delete from R2
- [ ] Configure R2 credentials in `.env`
- [ ] Test: upload a PDF → get signed URL → open in browser → works

#### 2.2 Document Upload API
```
Dependencies: 1.3, 2.1
Output: authenticated user can upload PDF/PPTX via API
```

- [ ] Create upload API: `POST /api/documents`
  - Zod validation: file type (PDF/PPTX), max size (50MB)
  - Extract orgId from session
  - Upload to R2 with key: `{orgId}/{documentId}/{filename}`
  - Create Document record (status: PROCESSING)
  - Return document with id and status
- [ ] Create `src/modules/documents/` with CRUD functions:
  - `createDocument(orgId, file)`
  - `getDocuments(orgId)` — list with pagination
  - `getDocument(orgId, documentId)` — single doc
  - `deleteDocument(orgId, documentId)` — cascade delete (links, views, R2 file, embeddings)
- [ ] Plan limit check: Free = max 5 docs
- [ ] Audit log: `document.created`, `document.deleted`

#### 2.3 Document Processing (Async)
```
Dependencies: 2.2
Output: uploaded PDFs are processed async, text extracted, status updated
```

- [ ] Setup Trigger.dev project and configure
- [ ] Create `src/jobs/process-document.ts`:
  - If PPTX: convert to PDF (libreoffice CLI or pdf-lib)
  - Extract text per page using pdfjs-dist
  - Count pages → update `Document.pageCount`
  - Update status: READY (or ERROR with message)
- [ ] Embedding generation (separate job, can be deferred to Phase 3):
  - Chunk text per page (~500 tokens per chunk)
  - Generate embeddings via OpenAI
  - Store in DocumentEmbedding table
- [ ] Test: upload PDF → status goes PROCESSING → READY within 10s

---

### Sprint 3: Link System & Viewer (Week 3-4)

#### 3.1 Link Management
```
Dependencies: 2.2
Output: users can create, list, and manage shareable links
```

- [ ] Create `src/modules/links/`:
  - `createLink(orgId, documentId, options)` — generates nanoid(8) slug
  - `getLinks(orgId, documentId)` — list links for a doc
  - `updateLink(orgId, linkId, options)` — toggle active, update settings
  - `deleteLink(orgId, linkId)` — cascade delete views
  - `getLinkBySlug(slug)` — public, for viewer (no orgId needed)
- [ ] Create link API routes:
  - `POST /api/documents/[id]/links` — create
  - `GET /api/documents/[id]/links` — list
  - `PATCH /api/links/[id]` — update
  - `DELETE /api/links/[id]` — delete
- [ ] Free plan: max 3 links per document
- [ ] Audit log: `link.created`, `link.revoked`, `link.deleted`

#### 3.2 Document Viewer (Core)
```
Dependencies: 3.1, 2.1
Output: recipients can view documents via shareable link
```

- [ ] Create viewer page: `src/app/(viewer)/view/[slug]/page.tsx`
- [ ] Implement viewer flow:
  1. Fetch link by slug (server-side)
  2. Validate: active? not expired? under max views?
  3. If valid → serve PDF viewer
  4. If invalid → error page with appropriate message
- [ ] Build PDF viewer component: `src/components/viewer/PDFViewer.tsx`
  - react-pdf with pdf.js worker
  - Page navigation (arrows, keyboard, swipe on mobile)
  - Current page / total pages indicator
  - Zoom controls
  - Full-screen toggle
  - Responsive: adapts to mobile viewport
- [ ] PDF loading:
  - Server generates signed R2 URL
  - Pass to client via server component props (never in client-visible URL)
- [ ] Add "Secured by Peeeky" badge footer (all plans, removable on Pro+)
- [ ] Error states: expired, deactivated, not found, max views reached
- [ ] Test: create link → open in incognito → view all pages → works on mobile

#### 3.3 Page Tracking
```
Dependencies: 3.2
Output: page views tracked and visible in dashboard
```

- [ ] Create tracking API: `POST /api/track`
  - Accepts: `{ linkId, viewId, pageNumber, duration }`
  - Rate limited: 100 req/min per IP
  - Writes to Redis buffer (LPUSH `track:{date}`)
  - Creates/updates View record on first call per session
- [ ] Client-side tracking in PDFViewer:
  - On mount: generate viewId (nanoid)
  - On page change: record time on previous page
  - Batch send every 3 seconds
  - On unmount/tab close: `navigator.sendBeacon()` final batch
- [ ] Capture viewer metadata:
  - User-Agent parsing → device, browser, OS
  - IP geolocation → country, city (MaxMind GeoLite2)
  - Email (if provided via email verification gate)
- [ ] Create `src/jobs/flush-analytics.ts` (Trigger.dev cron, every 10s):
  - RPOP batch from Redis
  - Bulk insert PageView records
  - Update View aggregates (duration, completionRate)
  - Increment Document.totalViews
- [ ] Create materialized view:
  ```sql
  CREATE MATERIALIZED VIEW mv_document_analytics AS
  SELECT
    d.id as document_id,
    d."orgId",
    COUNT(DISTINCT v.id) as total_views,
    COUNT(DISTINCT v."viewerEmail") as unique_viewers,
    AVG(v.duration) as avg_duration,
    AVG(v."completionRate") as avg_completion
  FROM "Document" d
  LEFT JOIN "Link" l ON l."documentId" = d.id
  LEFT JOIN "View" v ON v."linkId" = l.id
  GROUP BY d.id, d."orgId";
  ```
- [ ] Create `src/jobs/refresh-materialized.ts` (cron, every 60s)

---

### Sprint 4: Dashboard UI (Week 4-5)

#### 4.1 Layout & Navigation
```
Dependencies: 1.3
Output: authenticated layout with sidebar and navigation
```

- [ ] Create dashboard layout: `src/app/(dashboard)/layout.tsx`
  - Sidebar: Documents, Settings
  - Header: org name, user avatar, org switcher
  - Responsive: sidebar collapses to hamburger on mobile
- [ ] Design system basics in `src/components/ui/`:
  - Button (primary, secondary, ghost, destructive)
  - Input, Textarea, Select
  - Dialog (confirmation modals)
  - Badge (status indicators)
  - Card
  - Table (sortable, filterable)
  - Dropdown menu
  - Toast notifications
- [ ] Empty states for all list views

#### 4.2 Documents Page
```
Dependencies: 2.2, 4.1
Output: users can see, upload, and manage documents
```

- [ ] Documents list page: `src/app/(dashboard)/documents/page.tsx`
  - Grid view (document cards) with: name, page count, views, status, created date
  - Upload button → drag-and-drop zone or file picker
  - Upload progress bar
  - Status badges: PROCESSING (yellow), READY (green), ERROR (red)
  - Inline rename (click on name → edit)
  - Delete button → confirmation dialog
  - Upgrade CTA when at plan limit
- [ ] Document detail page: `src/app/(dashboard)/documents/[id]/page.tsx`
  - Tabs: Overview | Analytics | Links
  - Overview: document preview (thumbnail), metadata
  - Quick "Create link" button

#### 4.3 Links Management UI
```
Dependencies: 3.1, 4.2
Output: users can create and manage links from the dashboard
```

- [ ] Links tab in document detail page
  - List of links: name, slug, views, status, created date
  - "Create Link" button → opens dialog with options:
    - Name (optional)
    - Copy link button (copies `peeeky.com/view/{slug}`)
  - Each link row: copy URL, toggle active/inactive, delete
- [ ] Link detail expandable: shows all settings (password, email req, etc.) — Phase 2 features greyed out with "Pro" badge

#### 4.4 Analytics Dashboard
```
Dependencies: 3.3, 4.2
Output: users can see who viewed their documents and how
```

- [ ] Analytics tab in document detail page
  - Summary cards: total views, unique viewers, avg time, avg completion
  - "Currently viewing" real-time indicator
  - Viewers table: email/IP, device, location, duration, completion %, date
  - Per-page bar chart: time spent per page (using a lightweight chart lib like recharts)
  - Filter by link dropdown
- [ ] Free plan limitations:
  - Only total views visible
  - Viewer list and per-page analytics blurred with upgrade CTA overlay

---

## Phase 2 — Monetize (Month 3)

### Sprint 5: Billing (Week 6-7)

#### 5.1 Stripe Integration
```
Dependencies: Sprint 4 complete
Output: users can upgrade, downgrade, manage billing
```

- [ ] Create Stripe account and configure products:
  - Pro Monthly ($39), Pro Annual ($390)
  - Business Monthly ($129), Business Annual ($1,290)
- [ ] Create `src/lib/stripe.ts` (Stripe client singleton)
- [ ] Create `src/modules/billing/`:
  - `createCheckoutSession(orgId, priceId)` → Stripe Checkout URL
  - `createPortalSession(orgId)` → Stripe Customer Portal URL
  - `syncSubscription(stripeEvent)` → update org plan from webhook
- [ ] Webhook handler: `POST /api/webhooks/stripe`
  - `checkout.session.completed` → upgrade org plan
  - `customer.subscription.updated` → sync plan changes
  - `customer.subscription.deleted` → downgrade to FREE (3-day grace)
  - `invoice.payment_failed` → send warning email
  - Verify webhook signature
- [ ] Settings/billing page: `src/app/(dashboard)/settings/billing/page.tsx`
  - Current plan display with usage meters
  - Upgrade buttons → Stripe Checkout
  - "Manage subscription" → Stripe Portal
  - Invoice history link
- [ ] Plan enforcement: `src/config/plans.ts`
  ```typescript
  export const PLAN_LIMITS = {
    FREE:     { documents: 5,  linksPerDoc: 3,  members: 1,  aiChats: 0,   dataRetentionDays: 30 },
    PRO:      { documents: -1, linksPerDoc: -1, members: 3,  aiChats: 50,  dataRetentionDays: 365 },
    BUSINESS: { documents: -1, linksPerDoc: -1, members: 10, aiChats: -1,  dataRetentionDays: -1 },
  } // -1 = unlimited
  ```
- [ ] `checkPlanLimit(orgId, feature)` utility with Redis cache (TTL 5 min)
- [ ] Upgrade prompts at every limit boundary

#### 5.2 Access Controls
```
Dependencies: 5.1, 3.2
Output: links have password, email verification, expiry, download, watermark options
```

- [ ] Update Link settings UI with access control options
- [ ] Password protection:
  - Password input in link settings → bcrypt hash stored on Link
  - Viewer sees password prompt before document loads
  - Password verified server-side
- [ ] Email verification:
  - Toggle in link settings
  - Viewer enters email → 6-digit code via Resend (10 min expiry)
  - Verified email stored on View record
- [ ] Link expiration:
  - Date picker in link settings → stored as `expiresAt`
  - Viewer gets "expired" message after date
- [ ] Max view count:
  - Number input → stored as `maxViews`
  - Auto-deactivate when reached
- [ ] Download toggle:
  - When enabled, download button appears in viewer
  - Downloads via signed R2 URL (separate from viewing URL)
- [ ] Watermark toggle:
  - When enabled, canvas overlay renders viewer email + timestamp on each page
  - Dynamic per-viewer (not burned into PDF)
- [ ] All access controls gated behind Pro+ (except password on Free)

---

## Phase 3 — AI (Month 4)

### Sprint 6: AI Chat & Notifications (Week 8-9)

#### 6.1 RAG Pipeline
```
Dependencies: 2.3 (embeddings must be generated)
Output: document content searchable via vector similarity
```

- [ ] Create `src/lib/openai.ts` (OpenAI client singleton)
- [ ] Create `src/modules/ai/`:
  - `embedText(text)` → embedding vector via text-embedding-3-small
  - `searchDocumentChunks(documentId, query, topK)` → pgvector similarity search
  - `chatWithDocument(documentId, question, history)` → RAG response stream
- [ ] Ensure `process-document.ts` job generates embeddings:
  - Chunk text: ~500 tokens per chunk, overlap 50 tokens
  - Generate embeddings in batches of 20
  - Store in DocumentEmbedding with pageNumber reference
- [ ] pgvector index: `CREATE INDEX ON "DocumentEmbedding" USING ivfflat (embedding vector_cosine_ops)`

#### 6.2 AI Chat Endpoint & UI
```
Dependencies: 6.1
Output: recipients can chat with documents in the viewer
```

- [ ] Create chat API: `POST /api/ai/chat`
  - Input: `{ linkId, question, conversationHistory }`
  - Validate: link exists, AI chat enabled, rate limit (10 req/min/link)
  - Check org AI chat quota (Redis counter)
  - Embed question → search top 5 chunks → build prompt → stream GPT-4o-mini
  - Return SSE stream
- [ ] System prompt with guardrails (per architecture doc section 11.6)
- [ ] Create chat widget: `src/components/viewer/AIChatWidget.tsx`
  - Floating button (bottom-right) → opens sidebar panel
  - Message list with streaming response
  - Input field with send button
  - "Powered by AI" disclaimer
  - Max 20 messages per session indicator
- [ ] Add `enableAIChat` toggle in link settings UI
- [ ] Log AI interactions to AuditEvent
- [ ] Token budget tracking: Redis key `ai_tokens:{orgId}:{billingCycleId}`, increment per response

#### 6.3 Smart Follow-up & Engagement Score
```
Dependencies: 3.3, 6.1
Output: senders get notified of high-engagement views with AI suggestions
```

- [ ] Create `src/modules/notifications/`:
  - `sendViewNotification(view)` — basic "someone viewed your doc"
  - `sendEngagementAlert(view, pattern)` — high-engagement alert with AI suggestion
- [ ] Trigger detection in `flush-analytics.ts`:
  - If view completion > 50% → dispatch `sendViewNotification`
  - If time on single page > 60s → dispatch `sendEngagementAlert`
  - Debounce: max 1 notification per viewer per doc per hour (Redis key)
- [ ] Create `src/jobs/send-notification.ts`:
  - Email via Resend (React Email template)
  - Slack via webhook (if configured)
  - AI suggestion: GPT-4o-mini prompt with viewing pattern context
- [ ] Notification settings page: `src/app/(dashboard)/settings/notifications/page.tsx`
  - Email toggle (on/off)
  - Slack webhook URL + test button
  - Minimum engagement threshold slider
- [ ] Engagement score computation:
  - Formula: `(completion * 40) + (time_score * 30) + (revisit * 20) + (chat * 10)`
  - Computed on view completion, stored on View model
  - Display in analytics viewer table with color coding

---

## Phase 4 — Growth (Month 5-6)

### Sprint 7: Teams & Branding (Week 10-11)

#### 7.1 Team Management
```
Dependencies: 5.1
Output: org owners can invite and manage team members
```

- [ ] Create `src/modules/orgs/`:
  - `inviteMember(orgId, email, role)` — create pending Membership + send invite email
  - `acceptInvite(token)` — verify JWT, activate Membership
  - `removeMember(orgId, userId)` — delete Membership
  - `updateMemberRole(orgId, userId, role)` — change role
  - `getMembers(orgId)` — list with role and status
- [ ] Invite email: React Email template with branded CTA button
- [ ] Team settings page: `src/app/(dashboard)/settings/team/page.tsx`
  - Member list: name, email, role, joined date
  - Invite form: email + role dropdown
  - Remove button per member
  - Plan limit indicator (X/Y members used)
- [ ] Permission enforcement:
  - OWNER: full access, billing, delete org
  - ADMIN: manage all docs and links, manage members (can't delete org or change billing)
  - MEMBER: CRUD own documents only
- [ ] Audit log: `member.invited`, `member.removed`, `member.role_changed`

#### 7.2 Custom Domains & Branding
```
Dependencies: 5.1
Output: Business users can use their own domain and branding
```

- [ ] Create `src/modules/domains/`:
  - `addDomain(orgId, domain)` — create CustomDomain record
  - `verifyDomain(orgId, domainId)` — check CNAME/TXT record via DNS lookup
  - `removeDomain(orgId, domainId)` — delete record
- [ ] Domain verification flow:
  1. User adds domain → shown CNAME record to add
  2. User clicks "Verify" → server checks DNS → verified or retry
  3. Configure Cloudflare for SaaS (SSL provisioning)
- [ ] Viewer routing: check custom domain → resolve to orgId → serve viewer with org branding
- [ ] Branding settings: `src/app/(dashboard)/settings/branding/page.tsx`
  - Logo upload (stored in R2)
  - Brand color picker
  - Preview of viewer with branding applied
- [ ] Business plan only for custom domain + colors. Pro gets logo only.

### Sprint 8: Launch Prep (Week 12)

#### 8.1 Landing Page & SEO
```
Dependencies: none (can be done in parallel)
Output: marketing site ready for Product Hunt launch
```

- [ ] Landing page: `src/app/page.tsx`
  - Hero: headline + subheadline + CTA + product screenshot
  - Features section: 4 key features with visuals
  - Social proof: "Used by X companies" (even if small number)
  - Pricing table: Free / Pro / Business
  - FAQ section
  - Footer: links, legal
- [ ] Comparison pages: `/vs/docsend`, `/vs/google-drive`, `/vs/wetransfer`
- [ ] Use case pages: `/for/fundraising`, `/for/sales`, `/for/real-estate`
- [ ] SEO basics: meta tags, OG images, sitemap.xml, robots.txt
- [ ] Blog: `/blog` with launch post

#### 8.2 Product Hunt Launch
```
Dependencies: 8.1, all Phase 1-3 features stable
Output: PH launch executed
```

- [ ] Prepare PH assets: logo, tagline, screenshots, maker comment
- [ ] Tagline: "Share documents. Track every page. Chat with AI."
- [ ] Schedule launch (Tuesday or Wednesday, 12:01 AM PT)
- [ ] Prepare launch day support: monitor signups, fix bugs fast
- [ ] Post-launch: respond to every comment, collect feedback

---

## Phase 5 — Scale (Month 7-12)

> Detailed sprint breakdown created closer to Phase 5 based on learnings from Phase 1-4.

### High-Level Milestones

- [ ] **Month 7-8:** Data Rooms (VDR) — new models, UI, per-doc permissions
- [ ] **Month 9:** Analytics heatmaps — page thumbnails with engagement overlay
- [ ] **Month 10:** Affiliate program — referral links, commission tracking, Stripe Connect
- [ ] **Month 11:** Performance optimization — read replicas, dedicated pgvector, R2 multi-region
- [ ] **Month 12:** Evaluate and plan Year 2 — enterprise features? new verticals? raise?

---

## Dependency Graph

```
1.1 Scaffolding
 └→ 1.2 Database
     ├→ 1.3 Auth
     │   ├→ 2.2 Upload API
     │   │   ├→ 2.3 Processing (async)
     │   │   │   └→ 6.1 RAG Pipeline
     │   │   │       └→ 6.2 AI Chat
     │   │   └→ 3.1 Links
     │   │       └→ 3.2 Viewer
     │   │           └→ 3.3 Tracking
     │   │               └→ 6.3 Notifications
     │   └→ 4.1 Layout
     │       └→ 4.2-4.4 Dashboard UI
     │           └→ 5.1 Billing
     │               ├→ 5.2 Access Controls
     │               ├→ 7.1 Teams
     │               └→ 7.2 Custom Domains
     └→ 2.1 R2 Storage

8.1 Landing Page (parallel, no deps)
```

---

## Risk Register

| Risk | Impact | Mitigation |
|---|---|---|
| PDF.js rendering issues on edge cases | Viewer broken for some files | Test with 50+ real pitch decks early. Fallback: render as images server-side. |
| PPTX→PDF conversion quality | Fonts/layouts broken | Use LibreOffice headless (best fidelity). Test with real client PPTXs. |
| OpenAI API costs exceed budget | Margin erosion | Hard token caps per org. Monitor daily spend. Switch to cheaper model if needed. |
| Stripe webhook reliability | Missed plan changes | Idempotent webhook handler. Daily reconciliation job compares Stripe ↔ DB. |
| R2 signed URL leakage | Unauthorized file access | 1-hour expiry + single-use tokens. Rotate signing keys monthly. |
| pgvector performance at scale | Slow AI chat responses | Monitor query latency. Migrate to dedicated instance at 10K+ documents. |
| Low PLG conversion from badge | Slow growth | A/B test badge copy/placement. Add CTA in viewer error states too. |
| Competitor ships same features | Feature parity race | AI Chat is the moat. Ship fast, iterate on UX, build brand. |
