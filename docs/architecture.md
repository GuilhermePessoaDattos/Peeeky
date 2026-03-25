# Peeeky — Technical Architecture

> Secure document sharing with granular tracking and AI intelligence.
> **Domain:** peeeky.com

---

## 1. Product Overview

Peeeky is a PLG, self-serve SaaS for secure document sharing with page-level analytics. Users upload documents (pitch decks, proposals, contracts), generate tracked links, and get real-time intelligence on how recipients interact with their content.

### Core Value Proposition

- **For senders:** Know exactly who opened your document, how long they spent on each page, and get AI-powered follow-up suggestions.
- **For recipients:** Clean, fast viewer with optional AI chat to ask questions about the document.

---

## 2. Core Features (MVP — Day 1)

### 2.1 Upload & Secure Viewer
- PDF and PPTX upload (convert PPTX to PDF server-side)
- Browser-based viewer (no download required)
- Mobile-responsive viewer
- Watermarking with recipient email

### 2.2 Granular Tracking
- Per-page time tracking (time spent on each page)
- Visitor identification (email verification or link-level tracking)
- Device, browser, OS, and geolocation (via IP)
- Total views, unique views, completion rate
- Real-time dashboard per document

### 2.3 Access Control
- Password protection
- Email verification before viewing
- Link expiration (date or view count)
- Remote revoke access
- Allow/block download toggle

### 2.4 Custom Branding
- Custom domain support (proposal.yourcompany.com)
- Logo upload on viewer
- Custom colors on viewer

### 2.5 AI Features
- **AI Chat with Doc:** Recipient can ask questions about the document via a chat widget in the viewer. Uses RAG (chunk PDF content → embeddings → LLM).
- **Smart Follow-up:** Notifies sender via email/Slack when a prospect engages with key pages (e.g., pricing). Suggests follow-up message based on reading behavior.
- **Engagement Score:** AI-generated score (0-100) based on time spent, pages viewed, and revisits. Helps prioritize follow-ups.

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      Client (Browser)                    │
│  Next.js App (SSR + CSR) — Tailwind CSS                 │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐    │
│  │ Dashboard │  │ Viewer   │  │ AI Chat Widget     │    │
│  │ (Sender)  │  │(Receiver)│  │ (Receiver-facing)  │    │
│  └──────────┘  └──────────┘  └────────────────────┘    │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────────┐
│                   Next.js API Routes                     │
│  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌─────────────┐  │
│  │ Auth     │ │ Documents│ │ Links  │ │ Analytics   │  │
│  │ Module   │ │ Module   │ │ Module │ │ Module      │  │
│  └──────────┘ └──────────┘ └────────┘ └─────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌────────────────────────┐  │
│  │ Billing  │ │ Notify   │ │ AI Module (RAG + Chat) │  │
│  │ Module   │ │ Module   │ │                        │  │
│  └──────────┘ └──────────┘ └────────────────────────┘  │
└────┬────────────┬────────────┬──────────────────────────┘
     │            │            │
┌────▼───┐  ┌────▼───┐  ┌────▼──────────────────────┐
│Postgres│  │ R2/S3  │  │ External Services         │
│(Prisma)│  │Storage │  │ ┌────────┐ ┌────────────┐ │
│        │  │        │  │ │ Stripe │ │ Resend     │ │
│        │  │        │  │ └────────┘ └────────────┘ │
│        │  │        │  │ ┌────────┐ ┌────────────┐ │
│        │  │        │  │ │OpenAI  │ │ Slack API  │ │
│        │  │        │  │ └────────┘ └────────────┘ │
└────────┘  └────────┘  └──────────────────────────┘
```

---

## 4. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | SSR for viewer SEO/speed, API routes for backend |
| **Language** | TypeScript (strict) | Type safety, DX |
| **Styling** | Tailwind CSS 4 | Rapid UI development |
| **Database** | PostgreSQL (Supabase) | Managed, generous free tier, realtime capabilities |
| **ORM** | Prisma 6 | Type-safe queries, migrations |
| **Auth** | NextAuth v5 (JWT) | Google + Email magic link |
| **Storage** | Cloudflare R2 | S3-compatible, zero egress fees |
| **PDF Viewer** | react-pdf (pdf.js) | Mature, customizable, enables page tracking |
| **PDF Processing** | pdf-lib / pdfjs-dist | Extract text for RAG, convert PPTX |
| **Payments** | Stripe | Global, PLG-friendly, Checkout + Customer Portal |
| **Email** | Resend | Simple API, React Email templates |
| **AI / LLM** | OpenAI API (GPT-4o-mini) | Cost-effective for RAG chat |
| **Embeddings** | OpenAI text-embedding-3-small | For document chunking/search |
| **Vector Store** | Supabase pgvector | No extra infra, lives in same Postgres |
| **Notifications** | Slack Webhooks + Resend | Smart follow-up alerts |
| **Analytics Ingest** | Next.js API route + batch insert | Simple, no extra infra for MVP |
| **Hosting** | Vercel | Zero-config deploys, edge functions for viewer |
| **DNS/CDN** | Cloudflare | Custom domain proxy, DDoS protection |
| **Monitoring** | Vercel Analytics + Sentry | Errors + performance |

---

## 5. Data Model (Prisma Schema)

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  plan          Plan      @default(FREE)
  stripeCustomerId   String? @unique
  stripeSubId        String? @unique
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  documents     Document[]
  domains       CustomDomain[]
  accounts      Account[]
  sessions      Session[]
}

model Document {
  id          String   @id @default(cuid())
  name        String
  description String?
  fileUrl     String   // R2 URL
  fileType    FileType @default(PDF)
  pageCount   Int      @default(0)
  totalViews  Int      @default(0)
  userId      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  links       Link[]
  embeddings  DocumentEmbedding[]
}

model Link {
  id              String    @id @default(cuid())
  slug            String    @unique // short URL slug
  documentId      String
  name            String?   // "Sent to Sequoia", "Series A deck - John"
  password        String?   // bcrypt hash
  requireEmail    Boolean   @default(false)
  allowDownload   Boolean   @default(false)
  enableWatermark Boolean   @default(false)
  enableAIChat    Boolean   @default(false)
  expiresAt       DateTime?
  maxViews        Int?
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  document        Document  @relation(fields: [documentId], references: [id], onDelete: Cascade)
  views           View[]
}

model View {
  id          String   @id @default(cuid())
  linkId      String
  viewerEmail String?
  viewerName  String?
  device      String?
  browser     String?
  os          String?
  country     String?
  city        String?
  ip          String?
  duration    Int      @default(0) // total seconds
  completionRate Float @default(0) // 0-1
  createdAt   DateTime @default(now())

  link        Link     @relation(fields: [linkId], references: [id], onDelete: Cascade)
  pageViews   PageView[]
}

model PageView {
  id        String   @id @default(cuid())
  viewId    String
  pageNumber Int
  duration  Int      @default(0) // seconds on this page
  enteredAt DateTime @default(now())

  view      View     @relation(fields: [viewId], references: [id], onDelete: Cascade)

  @@index([viewId, pageNumber])
}

model DocumentEmbedding {
  id          String @id @default(cuid())
  documentId  String
  pageNumber  Int
  chunk       String // text chunk
  embedding   Unsupported("vector(1536)")
  createdAt   DateTime @default(now())

  document    Document @relation(fields: [documentId], references: [id], onDelete: Cascade)

  @@index([documentId])
}

model CustomDomain {
  id        String   @id @default(cuid())
  domain    String   @unique
  verified  Boolean  @default(false)
  userId    String
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// NextAuth models
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum Plan {
  FREE
  PRO
  BUSINESS
}

enum FileType {
  PDF
  PPTX
}
```

---

## 6. Module Structure

```
src/
  app/
    (auth)/                    # Login, signup pages
      login/
      signup/
    (dashboard)/               # Authenticated sender pages
      documents/               # List, upload, manage docs
      documents/[id]/          # Doc detail + analytics
      documents/[id]/links/    # Manage links for a doc
      settings/                # Account, billing, domains
    (viewer)/                  # Public viewer (recipient-facing)
      view/[slug]/             # Secure document viewer
    api/
      auth/[...nextauth]/      # NextAuth API
      documents/               # CRUD documents
      links/                   # CRUD links
      track/                   # Analytics ingestion (page views)
      ai/chat/                 # AI chat endpoint (RAG)
      webhooks/stripe/         # Stripe webhook handler
      domains/verify/          # Custom domain verification
  components/
    ui/                        # Buttons, inputs, modals (design system)
    dashboard/                 # Dashboard-specific components
    viewer/                    # PDF viewer, chat widget, watermark
    analytics/                 # Charts, heatmaps, engagement score
  modules/
    auth/                      # Auth config, helpers
    documents/                 # Upload, processing, CRUD logic
    links/                     # Link generation, access control
    tracking/                  # View tracking, page-level analytics
    ai/                        # RAG pipeline, chat, embeddings
    billing/                   # Stripe integration, plan enforcement
    notifications/             # Email + Slack notifications
    domains/                   # Custom domain verification + proxy
  lib/
    prisma.ts                  # Prisma singleton
    r2.ts                      # Cloudflare R2 client
    stripe.ts                  # Stripe client
    openai.ts                  # OpenAI client
    geo.ts                     # IP geolocation helper
    utils.ts                   # General utilities
  config/
    plans.ts                   # Plan limits and features
    constants.ts               # App-wide constants
prisma/
  schema.prisma
  migrations/
```

---

## 7. Key Flows

### 7.1 Document Upload Flow

```
User uploads PDF/PPTX
  → API validates file type + size (max 50MB)
  → Upload to Cloudflare R2
  → If PPTX: convert to PDF (server-side via libreoffice or pdf-lib)
  → Extract text per page (pdfjs-dist)
  → Chunk text → generate embeddings → store in pgvector
  → Save Document record in Postgres
  → Return document with viewer-ready URL
```

### 7.2 Viewer + Tracking Flow

```
Recipient opens link (peeeky.com/view/abc123)
  → API checks: link active? expired? max views?
  → If password required → show password prompt
  → If email required → show email capture form
  → Load PDF in browser viewer (react-pdf)
  → On each page change:
      → POST /api/track { linkId, viewId, pageNumber, duration }
      → Batched every 3 seconds to reduce API calls
  → On close/navigate away:
      → Send final batch via navigator.sendBeacon()
  → Dashboard updates in near-realtime (polling every 30s or Supabase realtime)
```

### 7.3 AI Chat Flow

```
Recipient clicks "Ask about this document"
  → Chat widget opens in viewer sidebar
  → User types question
  → POST /api/ai/chat { linkId, question, conversationHistory }
  → Server: embed question → search pgvector for relevant chunks
  → Build prompt: system context + relevant chunks + question
  → Stream response from GPT-4o-mini
  → Display streamed response in chat widget
  → Log interaction (optional: notify sender that AI was used)
```

### 7.4 Smart Follow-up Flow

```
Tracking module detects: viewer spent >60s on pricing page
  → Check sender notification preferences
  → Generate AI follow-up suggestion based on viewing pattern
  → Send notification:
      - Email (via Resend): "John just spent 2 min on your pricing slide"
      - Slack (via webhook): same + suggested follow-up message
```

---

## 8. Pricing & Plan Enforcement

| Feature | Free | Pro ($39/mo) | Business ($129/mo) |
|---|---|---|---|
| Documents | 5 | Unlimited | Unlimited |
| Links per doc | 3 | Unlimited | Unlimited |
| Page analytics | Basic (views only) | Granular (per-page) | Granular + heatmap |
| AI Chat with Doc | -- | 50 chats/mo | Unlimited |
| Smart Follow-up | -- | Email only | Email + Slack |
| Custom branding | -- | Logo only | Full (logo + colors + domain) |
| Watermarking | -- | Yes | Yes |
| Password protection | Yes | Yes | Yes |
| Email verification | -- | Yes | Yes |
| Link expiration | -- | Yes | Yes |
| Team members | 1 | 1 | 5 |
| Badge "Secured by Peeeky" | Yes (required) | Removable | Removable |
| Data retention | 30 days | 1 year | Unlimited |

Plan enforcement happens at the module level via a `checkPlanLimit(userId, feature)` utility that reads the user's plan and checks against `config/plans.ts`.

---

## 9. PLG Growth Mechanics

### 9.1 Viral Badge
Every document shared on the Free plan shows "Secured by Peeeky" with a link in the viewer footer. This is the primary acquisition channel (modeled after Tally's 40% growth from badges).

### 9.2 Recipient → Sender Conversion
Recipients who view documents see the Peeeky experience. CTA: "Want to track your own documents? Start free."

### 9.3 SEO
Comparison pages: "Peeeky vs DocSend", "Best pitch deck sharing tool", "How to track who reads your proposal".

### 9.4 Product Hunt Launch
Target Month 5-6 with AI Chat as headline feature.

---

## 10. Infrastructure & Cost Estimate (Month 1-6)

| Service | Tier | Cost/mo |
|---|---|---|
| Vercel | Pro | $20 |
| Supabase (Postgres + pgvector) | Pro | $25 |
| Cloudflare R2 | Pay-as-you-go | ~$5 |
| OpenAI API (embeddings + chat) | Pay-as-you-go | ~$20-50 |
| Resend | Free (3K emails/mo) | $0 |
| Stripe | 2.9% + $0.30 per txn | Variable |
| Cloudflare (DNS/CDN) | Free | $0 |
| Sentry | Free tier | $0 |
| **Total** | | **~$70-100/mo** |

---

## 11. Security Considerations

- All documents served over HTTPS only
- PDF files stored in private R2 bucket (signed URLs, expire in 1 hour)
- Viewer uses signed, short-lived tokens — no direct file access
- Passwords hashed with bcrypt (cost 12)
- Rate limiting on all API routes (especially /api/track and /api/ai/chat)
- CORS restricted to peeeky.com + custom domains
- Input validation with Zod on all endpoints
- CSP headers on viewer to prevent XSS
- No PII stored beyond email — GDPR-friendly by design
- AI chat: document content never leaves OpenAI API context (no fine-tuning, no storage)

---

## 12. Roadmap Alignment

| Phase | Months | Focus | Key Deliverables |
|---|---|---|---|
| **1 - MVP** | 1-2 | Core upload + viewer + tracking | Upload, PDF viewer, page tracking, dashboard, auth, Free plan |
| **2 - Monetize** | 3 | Billing + access controls | Stripe integration, Pro/Business plans, password/email/expiry |
| **3 - AI** | 4 | AI differentiators | AI Chat with Doc, Smart Follow-up, Engagement Score |
| **4 - Growth** | 5-6 | PLG + launch | Badge viral loop, custom domains, Product Hunt, SEO pages |
| **5 - Scale** | 7-12 | Retention + expansion | Team features, Data Rooms (VDR), analytics heatmaps, affiliates |
