# Peeeky — Product Spec (PRD)

> Version 1.0 | March 2026

---

## 1. Vision

Peeeky is the simplest way to share documents securely and know exactly how they're consumed. Every link is a window into your recipient's intent.

**One-liner:** DocSend meets AI — share documents, track every page, and let recipients chat with your content.

---

## 2. Target Users

### 2.1 Primary Personas

**Startup Founder (Fundraising)**
- Sends pitch decks to 20-50 investors per round
- Needs to know who's interested (read the deck) vs. who's ghosting
- Wants to protect confidential financial data from leaking
- Typical plan: Pro ($39/mo)

**Sales Professional (B2B)**
- Sends proposals, case studies, pricing docs to prospects
- Needs to prioritize follow-ups based on engagement
- Wants branded experience (client sees their company, not Peeeky)
- Typical plan: Pro or Business ($39-129/mo)

**M&A Advisor / Investment Banker**
- Manages virtual data rooms with 100+ confidential documents
- Needs audit trail for compliance (who accessed what, when)
- Requires granular permissions per document per party
- Typical plan: Business ($129/mo)

### 2.2 Secondary Personas

**Freelancer / Consultant**
- Sends proposals and SOWs to clients
- Wants to know if client read the proposal before following up
- Price-sensitive, starts on Free

**Real Estate Agent**
- Shares property portfolios, contracts, disclosures
- Needs mobile-friendly viewer (clients view on phone)
- Typical plan: Pro ($39/mo)

---

## 3. Features by Phase

### Phase 1 — MVP (Month 1-2)

#### F1.1 Authentication

| ID | Story | Acceptance Criteria |
|---|---|---|
| F1.1.1 | As a user, I can sign up with Google OAuth | One-click signup, auto-create Organization with user as OWNER |
| F1.1.2 | As a user, I can sign up with email magic link | Enter email → receive link → click → authenticated. No passwords. |
| F1.1.3 | As a user, I land on my dashboard after login | Redirect to `/documents`. Show empty state with CTA on first visit. |
| F1.1.4 | As a user, I can switch between organizations | Org switcher in sidebar. Last-used org remembered in cookie. |

**Tech notes:**
- NextAuth v5 with Google + Email providers
- JWT strategy (stateless, no session table hits on every request)
- On signup: create Organization (name defaults to user's name + "'s Workspace") + Membership (role: OWNER)

#### F1.2 Document Upload & Management

| ID | Story | Acceptance Criteria |
|---|---|---|
| F1.2.1 | As a user, I can upload a PDF | Drag-and-drop or file picker. Max 50MB. Shows upload progress bar. |
| F1.2.2 | As a user, I can upload a PPTX | Same as PDF. Converted to PDF server-side. User sees "Processing..." then "Ready". |
| F1.2.3 | As a user, I see my documents in a list | Grid or list view. Shows: name, page count, total views, created date, status. |
| F1.2.4 | As a user, I can rename a document | Inline edit on document name. |
| F1.2.5 | As a user, I can delete a document | Confirm dialog. Deletes document + all links + all views + R2 file + embeddings. |
| F1.2.6 | As a user, I see document processing status | Status badge: PROCESSING → READY → ERROR. Error shows retry button. |

**Tech notes:**
- Upload to R2 via presigned URL (client → R2 direct, no server proxy)
- Trigger.dev job: PPTX→PDF conversion, text extraction, embedding generation
- Document status enum: `PROCESSING | READY | ERROR`
- Free plan: max 5 documents (soft limit, show upgrade CTA)

#### F1.3 Link Creation & Management

| ID | Story | Acceptance Criteria |
|---|---|---|
| F1.3.1 | As a user, I can create a shareable link for a document | One click → generates `peeeky.com/view/[slug]`. Copy to clipboard. |
| F1.3.2 | As a user, I can name a link | Optional name field: "Sent to Sequoia", "John - Series A". Helps organize. |
| F1.3.3 | As a user, I can see all links for a document | List with: name, slug, views count, created date, active status. |
| F1.3.4 | As a user, I can deactivate a link | Toggle switch. Deactivated link shows "This document is no longer available." |
| F1.3.5 | As a user, I can delete a link | Confirm dialog. Deletes link + all associated views. |

**Tech notes:**
- Slug: nanoid(8), URL-safe characters
- Free plan: max 3 links per document

#### F1.4 Document Viewer (Recipient-Facing)

| ID | Story | Acceptance Criteria |
|---|---|---|
| F1.4.1 | As a recipient, I can view a document in the browser | Full-screen PDF viewer. Pages load progressively. No download button by default. |
| F1.4.2 | As a recipient, the viewer works on mobile | Responsive layout. Swipe between pages. Pinch to zoom. |
| F1.4.3 | As a recipient, I see the sender's branding | Free plan: "Secured by Peeeky" badge in footer. Pro+: sender's logo. |
| F1.4.4 | As a recipient, I get a clean error if the link is invalid | "This link has expired", "This document is no longer available", "Invalid link". |

**Tech notes:**
- react-pdf (pdf.js) for rendering
- PDF served via signed R2 URL (1-hour expiry, never exposed to client directly)
- Viewer is a standalone page — no nav bar, no sidebar, no distractions
- Anti-scraping: canvas rendering, no raw PDF URL in DOM

#### F1.5 Analytics Dashboard

| ID | Story | Acceptance Criteria |
|---|---|---|
| F1.5.1 | As a user, I see total views per document | Count of unique + total views on document card and detail page. |
| F1.5.2 | As a user, I see a list of viewers | Table: viewer email/IP, device, location, date, duration, completion %. |
| F1.5.3 | As a user, I see per-page analytics | Bar chart: time spent per page. Highlights "hot" pages (most time spent). |
| F1.5.4 | As a user, I see real-time "currently viewing" | Badge on document: "1 person viewing now". Updates via Redis polling. |
| F1.5.5 | As a user, I can filter analytics by link | Dropdown to view analytics for a specific link or all links combined. |

**Tech notes:**
- Page tracking: client sends batch events every 3s → Redis buffer → Postgres flush
- Materialized view: `mv_document_analytics` (aggregated per-doc stats, refreshed every 60s)
- Free plan: total views only (no per-page, no viewer list)
- Geolocation via IP using free MaxMind GeoLite2 database

#### F1.6 Viral Badge (PLG Engine)

| ID | Story | Acceptance Criteria |
|---|---|---|
| F1.6.1 | As a recipient, I see "Secured by Peeeky" in the viewer | Subtle footer badge with link to peeeky.com/signup. Always visible on Free plan. |
| F1.6.2 | As a potential user, clicking the badge takes me to signup | Landing page with CTA: "Track your documents for free". |

---

### Phase 2 — Monetize (Month 3)

#### F2.1 Billing & Plans

| ID | Story | Acceptance Criteria |
|---|---|---|
| F2.1.1 | As a user, I can see my current plan and usage | Settings page: plan name, limits, current usage (docs, links, AI chats). |
| F2.1.2 | As a user, I can upgrade to Pro or Business | Redirect to Stripe Checkout. On success, plan updates immediately. |
| F2.1.3 | As a user, I can manage my subscription | Stripe Customer Portal: update card, cancel, view invoices. |
| F2.1.4 | As a user, I see upgrade prompts when hitting limits | When creating 6th doc on Free: "Upgrade to Pro for unlimited documents." |
| F2.1.5 | As a user, I can switch between monthly and annual billing | Annual = 2 months free (10 months price for 12 months). |

**Tech notes:**
- Stripe Checkout (hosted) for simplicity — no custom payment form
- Stripe Webhooks: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- Plan stored on Organization model, synced via webhooks
- Grace period: 3 days after failed payment before downgrade

#### F2.2 Access Controls

| ID | Story | Acceptance Criteria |
|---|---|---|
| F2.2.1 | As a user, I can set a password on a link | Password field in link settings. Viewer must enter password before seeing doc. |
| F2.2.2 | As a user, I can require email verification | Toggle in link settings. Viewer enters email → receives code → enters code → views. |
| F2.2.3 | As a user, I can set an expiration date | Date picker. After expiry, link shows "This document has expired." |
| F2.2.4 | As a user, I can set a max view count | Number input. After N views, link auto-deactivates. |
| F2.2.5 | As a user, I can allow/block downloads | Toggle. When allowed, download button appears in viewer. |
| F2.2.6 | As a user, I can enable watermarking | Toggle. Each page shows viewer's email as transparent overlay. |

**Tech notes:**
- Password: bcrypt hash stored on Link, verified server-side before serving PDF
- Email verification: 6-digit code via Resend, expires in 10 minutes
- All access control features are Pro+ only (Free gets password only)

---

### Phase 3 — AI (Month 4)

#### F3.1 AI Chat with Document

| ID | Story | Acceptance Criteria |
|---|---|---|
| F3.1.1 | As a sender, I can enable AI Chat on a link | Toggle in link settings. Only available on Pro+ plans. |
| F3.1.2 | As a recipient, I see a chat icon in the viewer | Floating button bottom-right. Opens chat sidebar. |
| F3.1.3 | As a recipient, I can ask questions about the document | Type question → get AI response based on document content. Streamed response. |
| F3.1.4 | As a recipient, the AI only answers from the document | Questions outside document scope get: "I can only answer based on this document." |
| F3.1.5 | As a sender, I can see what questions were asked | Chat log in analytics: question, answer, timestamp, viewer. |

**Tech notes:**
- RAG: question → embed → pgvector similarity search → top 5 chunks → GPT-4o-mini
- Streaming via Server-Sent Events (SSE)
- Max 20 messages per session, 500 tokens per response
- Guardrails: system prompt restrictions, input sanitization, extraction prevention
- Pro: 50 AI chats/mo per org. Business: unlimited.
- Token budget tracked in Redis per org per billing cycle

#### F3.2 Smart Follow-up Notifications

| ID | Story | Acceptance Criteria |
|---|---|---|
| F3.2.1 | As a user, I get notified when someone views my document | Email: "[Viewer] just viewed [Document]". Includes duration and pages viewed. |
| F3.2.2 | As a user, I get notified for high-engagement views | Email/Slack: "[Viewer] spent 3 min on your pricing page." Includes AI-suggested follow-up. |
| F3.2.3 | As a user, I can configure notification preferences | Settings: email on/off, Slack webhook URL, minimum engagement threshold. |
| F3.2.4 | As a user, I can connect Slack | Paste Slack webhook URL in settings. Test button sends sample notification. |

**Tech notes:**
- Trigger: view completion > 50% OR time on single page > 60s
- Notification dispatched via Trigger.dev job (async, doesn't block tracking)
- AI follow-up suggestion: GPT-4o-mini with prompt including viewing pattern + document context
- Pro: email only. Business: email + Slack.
- Debounce: max 1 notification per viewer per document per hour

#### F3.3 Engagement Score

| ID | Story | Acceptance Criteria |
|---|---|---|
| F3.3.1 | As a user, I see an engagement score per viewer | 0-100 score on viewer list. Color-coded: red (<30), yellow (30-70), green (>70). |
| F3.3.2 | As a user, I can sort viewers by engagement score | Sort column in viewer table. Helps prioritize follow-ups. |

**Tech notes:**
- Score formula: `(completion_rate * 40) + (time_weighted_score * 30) + (revisit_bonus * 20) + (ai_chat_bonus * 10)`
- `time_weighted_score`: normalized against median viewing time for same page count
- `revisit_bonus`: +20 if viewed more than once
- `ai_chat_bonus`: +10 if used AI chat (signals deep interest)
- Computed on each view completion, stored on View model

---

### Phase 4 — Growth (Month 5-6)

#### F4.1 Custom Domains & Branding

| ID | Story | Acceptance Criteria |
|---|---|---|
| F4.1.1 | As a Business user, I can add a custom domain | Enter domain → get CNAME record to add → verify → domain active. |
| F4.1.2 | As a Business user, my links use my custom domain | Links become `docs.mycompany.com/view/[slug]` instead of `peeeky.com/view/[slug]`. |
| F4.1.3 | As a Pro user, I can upload my logo | Logo appears in viewer header. Replaces Peeeky branding. |
| F4.1.4 | As a Business user, I can set brand colors | Color picker for viewer background, accent. Applied to all links. |

**Tech notes:**
- Custom domain: Cloudflare for SaaS (SSL provisioning, CNAME verification)
- Domain verification: TXT record check via DNS lookup
- Brand assets stored in R2 per org

#### F4.2 Team Management

| ID | Story | Acceptance Criteria |
|---|---|---|
| F4.2.1 | As an OWNER, I can invite team members by email | Invite form → email sent → recipient clicks → joins org. |
| F4.2.2 | As an OWNER, I can assign roles (ADMIN, MEMBER) | Role dropdown on member list. |
| F4.2.3 | As an ADMIN, I can manage all documents in the org | See and edit all docs, not just their own. |
| F4.2.4 | As a MEMBER, I can only see my own documents | Filtered by `createdById`. Cannot see other members' docs. |
| F4.2.5 | As an OWNER, I can remove a team member | Remove button. Member loses access immediately. |

**Tech notes:**
- Invite: create Membership with `PENDING` status + send email with invite link
- Invite link: signed JWT (orgId + email + role, expires 7 days)
- Pro: up to 3 members. Business: up to 10.

#### F4.3 SEO & Marketing Pages

| ID | Story | Acceptance Criteria |
|---|---|---|
| F4.3.1 | Landing page with clear value prop | Hero + features + pricing + social proof + CTA. |
| F4.3.2 | Comparison pages | "Peeeky vs DocSend", "Peeeky vs Google Drive", etc. SEO-optimized. |
| F4.3.3 | Use case pages | "For Fundraising", "For Sales Teams", "For Real Estate". |
| F4.3.4 | Blog | Launch post, use case stories, product updates. |

---

### Phase 5 — Scale (Month 7-12)

#### F5.1 Data Rooms (VDR)

| ID | Story | Acceptance Criteria |
|---|---|---|
| F5.1.1 | As a user, I can create a Data Room (collection of documents) | Name the room, add multiple documents, share with one link. |
| F5.1.2 | As a user, I can set per-document permissions in a Data Room | Granular: some viewers see all docs, others see only specific ones. |
| F5.1.3 | As a user, I see aggregated analytics for the Data Room | Dashboard: who viewed what, total engagement per party. |
| F5.1.4 | As a user, I can add/remove documents after creation | Dynamic room. New docs available to all parties immediately. |

**Tech notes:**
- New models: `DataRoom`, `DataRoomDocument`, `DataRoomAccess`
- Business plan only
- Audit log critical here — every access logged with full detail

#### F5.2 Analytics Heatmaps

| ID | Story | Acceptance Criteria |
|---|---|---|
| F5.2.1 | As a user, I see a visual heatmap of page engagement | Thumbnail grid of pages. Color intensity = time spent. |
| F5.2.2 | As a user, I can click a page to see detailed stats | Per-page detail: average time, viewer breakdown, comparison across links. |

#### F5.3 Affiliate Program

| ID | Story | Acceptance Criteria |
|---|---|---|
| F5.3.1 | As a user, I can generate a referral link | Share link. Get 20% commission on referred paid accounts for 12 months. |
| F5.3.2 | As a user, I see my referral earnings | Dashboard: referred users, conversions, earnings, payout history. |

**Tech notes:**
- Referral tracking: cookie (90-day attribution window) + UTM params
- Payouts via Stripe Connect or PayPal
- Commission: 20% recurring for 12 months

---

## 4. Non-Functional Requirements

### 4.1 Performance

| Metric | Target |
|---|---|
| Viewer first page load | < 2s (P95) |
| Page-to-page navigation | < 500ms |
| Dashboard load | < 1.5s |
| API response (non-AI) | < 300ms (P95) |
| AI chat first token | < 1s |
| Upload (10MB PDF) | < 5s |

### 4.2 Availability

- Target: 99.9% uptime (Vercel + Supabase SLAs cover this)
- Viewer must work even if dashboard is degraded (separate route groups)
- Graceful degradation: if Redis is down, tracking writes directly to Postgres (slower but functional)

### 4.3 Scalability Targets

| Phase | Users | Concurrent Viewers | Documents |
|---|---|---|---|
| Phase 1 | 0-500 | 100 | 5K |
| Phase 2 | 500-5K | 1K | 50K |
| Phase 3 | 5K+ | 10K | 500K+ |

### 4.4 Browser Support

- Chrome, Firefox, Safari, Edge (last 2 versions)
- Mobile: iOS Safari 16+, Chrome Android 100+
- PDF viewer must work without plugins

### 4.5 Accessibility

- WCAG 2.1 AA for dashboard
- Viewer: keyboard navigation between pages, screen reader support for chat
- High contrast mode support

---

## 5. Out of Scope (Explicitly NOT building)

- **Real-time collaboration / comments on documents** — not Google Docs, it's view-only
- **Document editing** — upload only, no in-browser editing
- **Native mobile apps** — responsive web only
- **SSO / SAML** — not until enterprise demand is clear
- **Self-hosting option** — cloud-only for now
- **Multi-language UI** — English only at launch
- **Video / audio file support** — PDFs and PPTXs only
- **E-signature** — not DocuSign, focused on sharing and tracking

---

## 6. Success Metrics

### 6.1 North Star

**Weekly Active Senders** — users who shared at least one link in the past 7 days.

### 6.2 Key Metrics by Phase

| Phase | Metric | Target |
|---|---|---|
| Phase 1 (MVP) | Signups | 200 |
| Phase 1 (MVP) | Documents uploaded | 500 |
| Phase 2 (Monetize) | Paying customers | 20 |
| Phase 2 (Monetize) | MRR | $500 |
| Phase 3 (AI) | AI chat usage rate | 30% of Pro users |
| Phase 4 (Growth) | MRR | $2,000 |
| Phase 4 (Growth) | Product Hunt upvotes | 300+ |
| Phase 5 (Scale) | MRR | $3,700 (R$20K target) |
| Phase 5 (Scale) | Paying customers | 100+ |

### 6.3 Health Metrics

| Metric | Healthy | Warning | Critical |
|---|---|---|---|
| Churn (monthly) | < 5% | 5-10% | > 10% |
| Free → Paid conversion | > 2% | 1-2% | < 1% |
| Viewer load time (P95) | < 2s | 2-4s | > 4s |
| Support tickets/week | < 10 | 10-30 | > 30 |
| NPS | > 40 | 20-40 | < 20 |
