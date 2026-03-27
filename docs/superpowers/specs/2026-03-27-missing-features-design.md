# Peeeky — Missing Features Design Spec

> 2026-03-27 | 8 items to complete the product spec

---

## Context

Peeeky is live at peeeky.com. The core product (upload, tracking, analytics, AI chat, billing, notifications, viewer) is functional. This spec covers the 8 remaining items from the original product spec.

**Deploy:** Vercel + custom domain peeeky.com
**Database:** Supabase (PostgreSQL + pgvector)
**Cache:** Upstash Redis
**Storage:** Cloudflare R2

---

## 1. Cron Jobs (Vercel Cron)

**Goal:** Scheduled background tasks for data maintenance and proactive cache refresh.

**Implementation:**
- Add `vercel.json` with cron schedule pointing to `/api/cron/*` routes
- Each cron route validates `CRON_SECRET` header (Vercel injects this automatically)

**Routes:**
- `GET /api/cron/cleanup` (daily at 03:00 UTC)
  - Delete expired links (expiresAt < now, inactive > 90 days)
  - Delete orphan PageView records with no parent View
  - Delete orphan DocumentEmbedding records with no parent Document
  - Log cleanup stats

- `GET /api/cron/refresh-analytics` (every 5 minutes)
  - Query top 50 most-viewed documents in last 24h
  - Pre-compute analytics and store in Redis cache
  - Key: `analytics:{documentId}`, TTL: 5 min

**Auth:** `Authorization: Bearer ${CRON_SECRET}` header check. Return 401 if missing/invalid.

---

## 2. Materialized Analytics (Redis Cache)

**Goal:** Avoid recomputing analytics on every dashboard request.

**Strategy:** Redis as analytics cache layer (not Postgres materialized views — Supabase complicates auto-refresh).

**Flow:**
1. `GET /api/documents/[id]/analytics` checks Redis key `analytics:{documentId}`
2. If cache hit → return cached data
3. If cache miss → compute from Postgres → store in Redis (TTL 5 min) → return
4. Cron `/api/cron/refresh-analytics` proactively warms cache for hot documents

**Cache structure:** JSON blob with `{ views, uniqueViewers, avgDuration, avgCompletion, pageAnalytics, recentViews }`.

**Invalidation:** On new `view_end` event, delete Redis key to force fresh computation on next request.

---

## 3. Geo-IP

**Goal:** Populate country/city on View records using Vercel's built-in geolocation headers.

**Implementation:**
- In `POST /api/track` (action: `view_start`), read:
  - `x-vercel-ip-country` → `view.country`
  - `x-vercel-ip-city` → `view.city`
- Zero external dependencies — Vercel provides these headers on every request for free.
- Fallback: if headers missing (local dev), leave fields null.

---

## 4. PPTX to PDF Conversion

**Goal:** Convert uploaded PPTX files to PDF for rendering in the viewer.

**Implementation:**
- Use CloudConvert API (free tier: 25 conversions/day)
- On PPTX upload:
  1. Upload file to R2 with status PROCESSING
  2. Call CloudConvert: upload PPTX → convert to PDF → download result
  3. Upload converted PDF to R2 (same key path, `.pdf` extension)
  4. Update Document record: `fileUrl` to PDF path, `status` to READY
  5. On failure: `status` = ERROR, `errorMessage` = conversion error
- Env var: `CLOUDCONVERT_API_KEY`
- Module: `src/lib/cloudconvert.ts` with `convertPptxToPdf(buffer): Promise<Buffer>`

---

## 5. Data Room — Granular Permissions

**Goal:** Per-document access control within Data Rooms based on viewer email.

**Schema changes (if needed):**
- `DataRoomAccess` model: `id`, `dataRoomId`, `email`, `documentIds` (JSON array of allowed doc IDs), `createdAt`
- If viewer email not in any DataRoomAccess → sees all documents (default: open access)
- If viewer email has a DataRoomAccess entry → sees only listed documentIds

**Viewer flow:**
- Data Room viewer (`/room/[slug]`) checks if viewer email matches a DataRoomAccess record
- If match → filter visible documents
- If no match and requireEmail is on → show only unrestricted docs
- If no DataRoomAccess records exist → all docs visible (backwards compatible)

**Dashboard UI:**
- In Data Room settings, "Access Control" tab
- Table: email → list of permitted documents (checkboxes)
- Add/remove access entries

---

## 6. Blog

**Goal:** SEO content for organic growth and Product Hunt launch.

**Implementation:**
- MDX-based blog at `/blog`
- Posts stored in `content/blog/*.mdx`
- Use `next-mdx-remote` for rendering
- Each post has frontmatter: `title`, `slug`, `date`, `description`, `author`, `tags`
- Blog index page: `/blog` with post list
- Blog post page: `/blog/[slug]` with full content

**Initial content:**
- Launch post: "Introducing Peeeky — Track Every Page of Your Shared Documents"
- Use case: "How Founders Use Peeeky to Track Investor Engagement"
- Use case: "Sales Teams: Know Exactly When to Follow Up"

**SEO:** OG meta, structured data (Article schema), sitemap entry per post.

---

## 7. Affiliate Program

**Goal:** Referral-based growth engine with commission tracking.

**Schema:**
- `Referral` model: `id`, `referrerId` (User), `referredOrgId` (Org), `code` (unique), `commission` (float), `status` (PENDING/ACTIVE/PAID), `createdAt`
- Add `referralCode` field to User model (unique, generated on first visit to referral page)

**Flow:**
1. User visits `/settings/referrals` → sees/generates their referral code
2. Share link: `peeeky.com/signup?ref={code}`
3. On signup with `ref` param → set 90-day cookie `peeeky_ref={code}`
4. On first subscription payment → create Referral record (status: ACTIVE, commission: 20%)
5. Commission tracked for 12 months per referred org

**Dashboard:** `/settings/referrals`
- Referral link (copy button)
- Table: referred users, conversion status, earnings
- Total earnings display
- Payouts: manual for now (admin), Stripe Connect later

---

## 8. "Currently Viewing" Real-time Indicator

**Goal:** Show document owners how many people are viewing their document right now.

**Implementation:**
- Redis SET key: `viewing:{documentId}` storing viewer IDs
- Each viewer ID entry has TTL managed via separate key: `viewer:{documentId}:{viewerId}` with 30s TTL

**Viewer side:**
- Add `heartbeat` action to `/api/track`
- Viewer sends heartbeat every 15 seconds
- On heartbeat: `SADD viewing:{documentId} {viewerId}` + `SET viewer:{documentId}:{viewerId} 1 EX 30`

**Dashboard side:**
- New API: `GET /api/documents/[id]/viewers-now`
- Reads `SMEMBERS viewing:{documentId}`
- For each member, checks if `viewer:{documentId}:{viewerId}` exists (not expired)
- Removes expired entries from SET
- Returns count

**UI:** Badge on document card and detail page: "X viewing now" (green dot + count). Poll every 10 seconds.

---

## Implementation Order

1. **Geo-IP** (trivial, immediate value)
2. **Cron Jobs** (infrastructure foundation)
3. **Analytics Cache** (performance, depends on cron)
4. **Currently Viewing** (real-time, uses Redis)
5. **PPTX→PDF** (external API integration)
6. **Data Room Permissions** (schema + UI)
7. **Blog** (content + SEO)
8. **Affiliate Program** (largest scope)
