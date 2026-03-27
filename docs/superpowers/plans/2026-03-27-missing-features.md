# Missing Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the 8 remaining features from the Peeeky product spec: Geo-IP, Vercel Cron jobs, Redis analytics cache, real-time "currently viewing", PPTX→PDF conversion, Data Room granular permissions, Blog, and Affiliate Program.

**Architecture:** Each feature is independent and lands as its own commit. Tracking and analytics improvements (Tasks 1-4) share the Redis layer. Blog uses MDX with next-mdx-remote. Affiliate program adds a new Prisma model and settings page.

**Tech Stack:** Next.js 15 (App Router), Prisma 6, Upstash Redis, Vercel Cron, CloudConvert API, next-mdx-remote, Stripe (existing)

---

## File Structure

```
New files:
  src/app/api/cron/cleanup/route.ts          — Daily cleanup cron endpoint
  src/app/api/cron/refresh-analytics/route.ts — Analytics cache refresh cron
  src/app/api/documents/[id]/viewers-now/route.ts — Real-time viewer count
  src/lib/cloudconvert.ts                    — PPTX→PDF conversion client
  src/app/api/datarooms/[id]/access/route.ts — Data Room access control API
  src/app/blog/page.tsx                      — Blog index page
  src/app/blog/[slug]/page.tsx               — Blog post page
  src/lib/mdx.ts                             — MDX utilities
  content/blog/introducing-peeeky.mdx        — Launch blog post
  content/blog/investor-engagement.mdx       — Use case post
  content/blog/sales-follow-up.mdx           — Use case post
  src/app/(dashboard)/settings/referrals/page.tsx — Affiliate dashboard
  src/app/api/referrals/route.ts             — Referral API
  src/modules/referrals/index.ts             — Referral business logic
  vercel.json                                — Vercel cron configuration

Modified files:
  src/app/api/track/route.ts                 — Add geo-ip + heartbeat action
  src/modules/tracking/index.ts              — Add recordHeartbeat(), cache helpers
  src/app/api/documents/[id]/analytics/route.ts — Add Redis cache layer
  src/app/api/documents/route.ts             — Add PPTX conversion on upload
  src/modules/documents/index.ts             — Add conversion flow
  src/app/(viewer)/view/[slug]/viewer-client.tsx — Add heartbeat interval
  src/app/(dashboard)/documents/[id]/page.tsx — Add "viewing now" badge
  src/app/(viewer)/room/[slug]/page.tsx      — Filter docs by access
  src/modules/datarooms/index.ts             — Add access control functions
  prisma/schema.prisma                       — Add DataRoomAccess, Referral models
  src/app/(auth)/login/page.tsx              — Capture ref cookie on signup
  package.json                               — Add next-mdx-remote, gray-matter
```

---

## Task 1: Geo-IP via Vercel Headers

**Files:**
- Modify: `src/app/api/track/route.ts`

- [ ] **Step 1: Add geo-ip extraction to view_start action**

In `src/app/api/track/route.ts`, update the `view_start` handler to read Vercel headers. Find the section where `recordView` is called and add country/city:

```typescript
// Inside the POST handler, in the "view_start" case, before calling recordView:
const country = req.headers.get("x-vercel-ip-country") || null;
const city = req.headers.get("x-vercel-ip-city") || null;
```

Then pass these to `recordView`:

```typescript
const view = await recordView(linkId, {
  viewerEmail: email || null,
  device,
  browser: extractBrowser(ua),
  os: extractOS(ua),
  ip,
  country,
  city,
});
```

- [ ] **Step 2: Update recordView to accept country/city**

In `src/modules/tracking/index.ts`, update the `recordView` function signature and Prisma create call:

```typescript
export async function recordView(
  linkId: string,
  metadata: {
    viewerEmail: string | null;
    device: string;
    browser: string;
    os: string;
    ip: string;
    country: string | null;
    city: string | null;
  }
) {
  const view = await prisma.view.create({
    data: {
      linkId,
      viewerEmail: metadata.viewerEmail,
      device: metadata.device,
      browser: metadata.browser,
      os: metadata.os,
      ip: metadata.ip,
      country: metadata.country,
      city: metadata.city,
    },
  });
  // ... rest of function (increment totalViews)
```

- [ ] **Step 3: Verify the View model already has country/city fields**

Check `prisma/schema.prisma` — the View model should already have `country String?` and `city String?` fields. If not, add them and run `npx prisma db push`.

- [ ] **Step 4: Test locally**

Run: `npm run dev`
Open a document viewer link. Check the database — the View record should have country=null, city=null in local dev (Vercel headers only exist in production). In production, these will be populated automatically.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/track/route.ts src/modules/tracking/index.ts
git commit -m "feat: populate geo-ip from Vercel headers on view_start"
```

---

## Task 2: Vercel Cron Jobs

**Files:**
- Create: `vercel.json`
- Create: `src/app/api/cron/cleanup/route.ts`
- Create: `src/app/api/cron/refresh-analytics/route.ts`

- [ ] **Step 1: Create vercel.json with cron schedules**

Create `vercel.json` in the project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 3 * * *"
    },
    {
      "path": "/api/cron/refresh-analytics",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

- [ ] **Step 2: Create cron auth helper**

Add a shared auth check at the top of each cron route. Vercel sends `Authorization: Bearer <CRON_SECRET>`:

- [ ] **Step 3: Create cleanup cron route**

Create `src/app/api/cron/cleanup/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  // Deactivate expired links
  const expiredLinks = await prisma.link.updateMany({
    where: {
      expiresAt: { lt: now },
      isActive: true,
    },
    data: { isActive: false },
  });

  // Delete orphan page views (no parent view)
  const orphanPageViews = await prisma.pageView.deleteMany({
    where: {
      view: null,
    },
  });

  // Delete embeddings for deleted documents
  const orphanEmbeddings = await prisma.documentEmbedding.deleteMany({
    where: {
      document: null,
    },
  });

  return NextResponse.json({
    ok: true,
    expiredLinks: expiredLinks.count,
    orphanPageViews: orphanPageViews.count,
    orphanEmbeddings: orphanEmbeddings.count,
    timestamp: now.toISOString(),
  });
}
```

- [ ] **Step 4: Create refresh-analytics cron route**

Create `src/app/api/cron/refresh-analytics/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { getDocumentAnalytics, computeEngagementScore, getScoreColor, getScoreLabel } from "@/modules/tracking";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find top 50 most-viewed documents in last 24h
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const hotDocs = await prisma.view.groupBy({
    by: ["linkId"],
    where: { createdAt: { gte: oneDayAgo } },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 50,
  });

  // Get unique document IDs from hot links
  const linkIds = hotDocs.map((h) => h.linkId);
  const links = await prisma.link.findMany({
    where: { id: { in: linkIds } },
    select: { documentId: true },
  });
  const docIds = [...new Set(links.map((l) => l.documentId))];

  // Pre-compute and cache analytics for each hot document
  let cached = 0;
  for (const docId of docIds) {
    const analytics = await getDocumentAnalytics(docId);
    await redis.set(`analytics:${docId}`, JSON.stringify(analytics), { ex: 300 });
    cached++;
  }

  return NextResponse.json({
    ok: true,
    hotDocuments: docIds.length,
    cached,
    timestamp: new Date().toISOString(),
  });
}
```

- [ ] **Step 5: Test locally**

Run each cron route manually:
```bash
curl -H "Authorization: Bearer test-secret" http://localhost:3000/api/cron/cleanup
curl -H "Authorization: Bearer test-secret" http://localhost:3000/api/cron/refresh-analytics
```

Set `CRON_SECRET=test-secret` in `.env.local` for testing.

- [ ] **Step 6: Commit**

```bash
git add vercel.json src/app/api/cron/
git commit -m "feat: add Vercel cron jobs for cleanup and analytics refresh"
```

---

## Task 3: Redis Analytics Cache

**Files:**
- Modify: `src/app/api/documents/[id]/analytics/route.ts`
- Modify: `src/app/api/track/route.ts`

- [ ] **Step 1: Add cache layer to analytics endpoint**

Replace the GET handler in `src/app/api/documents/[id]/analytics/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth";
import { redis } from "@/lib/redis";
import { getDocumentAnalytics, computeEngagementScore, getScoreColor, getScoreLabel } from "@/modules/tracking";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: documentId } = await params;

  // Check Redis cache first
  const cacheKey = `analytics:${documentId}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    const data = typeof cached === "string" ? JSON.parse(cached) : cached;
    return NextResponse.json(data);
  }

  // Cache miss — compute fresh
  const analytics = await getDocumentAnalytics(documentId);

  const views = analytics.views.map((view: any) => {
    const score = computeEngagementScore(view);
    return {
      ...view,
      score,
      scoreColor: getScoreColor(score),
      scoreLabel: getScoreLabel(score),
    };
  });

  const pageAnalytics = analytics.pageAnalytics || [];

  const result = {
    totalViews: analytics.totalViews,
    uniqueViewers: analytics.uniqueViewers,
    avgDuration: analytics.avgDuration,
    avgCompletion: analytics.avgCompletion,
    views,
    pageAnalytics,
  };

  // Cache for 5 minutes
  await redis.set(cacheKey, JSON.stringify(result), { ex: 300 });

  return NextResponse.json(result);
}
```

- [ ] **Step 2: Invalidate cache on new view_end**

In `src/app/api/track/route.ts`, in the `view_end` case, after calling `updateViewDuration`, add cache invalidation:

```typescript
// After updateViewDuration call in the view_end case:
// Invalidate analytics cache for this document
const link = await prisma.link.findUnique({
  where: { id: linkId },
  select: { documentId: true },
});
if (link) {
  await redis.del(`analytics:${link.documentId}`);
}
```

Add the redis import at the top of the file if not already present:
```typescript
import { redis } from "@/lib/redis";
```

And add the prisma import if not already present:
```typescript
import { prisma } from "@/lib/prisma";
```

- [ ] **Step 3: Test the cache flow**

1. Open analytics for a document — should compute and cache
2. Refresh — should be faster (cache hit)
3. View the document in another tab, let it complete — cache should be invalidated
4. Refresh analytics — should recompute

- [ ] **Step 4: Commit**

```bash
git add src/app/api/documents/[id]/analytics/route.ts src/app/api/track/route.ts
git commit -m "feat: add Redis cache layer for document analytics"
```

---

## Task 4: "Currently Viewing" Real-time Indicator

**Files:**
- Modify: `src/app/api/track/route.ts`
- Create: `src/app/api/documents/[id]/viewers-now/route.ts`
- Modify: `src/app/(viewer)/view/[slug]/viewer-client.tsx`
- Modify: `src/app/(dashboard)/documents/[id]/page.tsx`

- [ ] **Step 1: Add heartbeat action to track API**

In `src/app/api/track/route.ts`, add a new case in the action switch for `heartbeat`:

```typescript
case "heartbeat": {
  if (!linkId || !viewId) {
    return NextResponse.json({ error: "Missing linkId or viewId" }, { status: 400 });
  }
  // Get documentId from link
  const heartbeatLink = await prisma.link.findUnique({
    where: { id: linkId },
    select: { documentId: true },
  });
  if (heartbeatLink) {
    // Add viewer to currently-viewing set
    await redis.sadd(`viewing:${heartbeatLink.documentId}`, viewId);
    // Set expiry key for this viewer (30s TTL)
    await redis.set(`viewer:${heartbeatLink.documentId}:${viewId}`, "1", { ex: 30 });
  }
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Create viewers-now API endpoint**

Create `src/app/api/documents/[id]/viewers-now/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth";
import { redis } from "@/lib/redis";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: documentId } = await params;
  const setKey = `viewing:${documentId}`;

  // Get all viewer IDs in the set
  const viewerIds = await redis.smembers(setKey);

  // Check which are still active (TTL key exists)
  let activeCount = 0;
  const expiredIds: string[] = [];

  for (const vid of viewerIds) {
    const alive = await redis.exists(`viewer:${documentId}:${vid}`);
    if (alive) {
      activeCount++;
    } else {
      expiredIds.push(vid);
    }
  }

  // Clean up expired entries
  if (expiredIds.length > 0) {
    await redis.srem(setKey, ...expiredIds);
  }

  return NextResponse.json({ count: activeCount });
}
```

- [ ] **Step 3: Add heartbeat interval to viewer client**

In `src/app/(viewer)/view/[slug]/viewer-client.tsx`, add a heartbeat effect after the existing `view_start` effect:

```typescript
// Heartbeat for "currently viewing" - send every 15 seconds
useEffect(() => {
  if (!viewId) return;

  const interval = setInterval(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "heartbeat",
        linkId: link.id,
        viewId,
      }),
    }).catch(() => {}); // Silent fail
  }, 15000);

  // Send first heartbeat immediately
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "heartbeat",
      linkId: link.id,
      viewId,
    }),
  }).catch(() => {});

  return () => clearInterval(interval);
}, [viewId, link.id]);
```

- [ ] **Step 4: Add "viewing now" badge to document detail page**

In `src/app/(dashboard)/documents/[id]/page.tsx`, add a component that polls the viewers-now endpoint. Add this near the top of the main component:

```typescript
const [viewingNow, setViewingNow] = useState(0);

useEffect(() => {
  const fetchViewers = () => {
    fetch(`/api/documents/${documentId}/viewers-now`)
      .then((r) => r.json())
      .then((data) => setViewingNow(data.count || 0))
      .catch(() => {});
  };

  fetchViewers();
  const interval = setInterval(fetchViewers, 10000);
  return () => clearInterval(interval);
}, [documentId]);
```

Then render a badge next to the document title:

```tsx
{viewingNow > 0 && (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
    {viewingNow} viewing now
  </span>
)}
```

- [ ] **Step 5: Test the flow**

1. Open a document viewer in one tab
2. Open the dashboard document detail in another tab
3. Badge should show "1 viewing now" within 15 seconds
4. Close the viewer tab → badge should disappear within 30 seconds

- [ ] **Step 6: Commit**

```bash
git add src/app/api/track/route.ts src/app/api/documents/[id]/viewers-now/route.ts src/app/(viewer)/view/[slug]/viewer-client.tsx src/app/(dashboard)/documents/[id]/page.tsx
git commit -m "feat: add real-time 'currently viewing' indicator with Redis heartbeat"
```

---

## Task 5: PPTX to PDF Conversion

**Files:**
- Create: `src/lib/cloudconvert.ts`
- Modify: `src/modules/documents/index.ts`
- Modify: `src/app/api/documents/route.ts`

- [ ] **Step 1: Install CloudConvert SDK**

```bash
npm install cloudconvert
```

- [ ] **Step 2: Create CloudConvert client**

Create `src/lib/cloudconvert.ts`:

```typescript
import CloudConvert from "cloudconvert";

const cloudConvert = new CloudConvert(process.env.CLOUDCONVERT_API_KEY!);

export async function convertPptxToPdf(fileBuffer: Buffer, fileName: string): Promise<Buffer> {
  // Create job: upload → convert → download
  const job = await cloudConvert.jobs.create({
    tasks: {
      upload: {
        operation: "import/upload",
      },
      convert: {
        operation: "convert",
        input: ["upload"],
        input_format: "pptx",
        output_format: "pdf",
      },
      download: {
        operation: "export/url",
        input: ["convert"],
      },
    },
  });

  // Find the upload task
  const uploadTask = job.tasks.find((t) => t.name === "upload")!;

  // Upload the file
  await cloudConvert.tasks.upload(uploadTask, fileBuffer, fileName);

  // Wait for job to complete
  const completed = await cloudConvert.jobs.wait(job.id);

  // Get download URL
  const downloadTask = completed.tasks.find(
    (t) => t.name === "download" && t.status === "finished"
  );

  if (!downloadTask?.result?.files?.[0]?.url) {
    throw new Error("PPTX conversion failed: no output file");
  }

  const downloadUrl = downloadTask.result.files[0].url;

  // Download the converted PDF
  const response = await fetch(downloadUrl);
  if (!response.ok) {
    throw new Error(`Failed to download converted PDF: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
```

- [ ] **Step 3: Update createDocument to handle PPTX conversion**

In `src/modules/documents/index.ts`, update the `createDocument` function. After the R2 upload, if the file is PPTX, convert and re-upload:

```typescript
import { convertPptxToPdf } from "@/lib/cloudconvert";

export async function createDocument(
  orgId: string,
  userId: string,
  file: File
) {
  const id = nanoid(12);
  const buffer = Buffer.from(await file.arrayBuffer());
  const isPptx = file.name.toLowerCase().endsWith(".pptx");
  const fileType = isPptx ? "PPTX" : "PDF";

  // Upload original file to R2
  const originalKey = `${orgId}/${id}/${file.name}`;
  await uploadToR2(originalKey, buffer, file.type);

  // Create document record with PROCESSING status if PPTX
  const doc = await prisma.document.create({
    data: {
      id,
      name: file.name.replace(/\.(pdf|pptx)$/i, ""),
      fileUrl: originalKey,
      fileType,
      status: isPptx ? "PROCESSING" : "READY",
      orgId,
      createdById: userId,
    },
  });

  // If PPTX, convert async (don't block response)
  if (isPptx) {
    convertPptxToPdf(buffer, file.name)
      .then(async (pdfBuffer) => {
        const pdfKey = `${orgId}/${id}/${file.name.replace(/\.pptx$/i, ".pdf")}`;
        await uploadToR2(pdfKey, pdfBuffer, "application/pdf");
        await prisma.document.update({
          where: { id },
          data: {
            fileUrl: pdfKey,
            status: "READY",
          },
        });
      })
      .catch(async (error) => {
        console.error("PPTX conversion failed:", error);
        await prisma.document.update({
          where: { id },
          data: {
            status: "ERROR",
          },
        });
      });
  }

  return doc;
}
```

- [ ] **Step 4: Add CLOUDCONVERT_API_KEY to env**

Add to `.env.local`:
```
CLOUDCONVERT_API_KEY=your_api_key_here
```

Add to `.env.example`:
```
CLOUDCONVERT_API_KEY=
```

- [ ] **Step 5: Test with a PPTX file**

1. Upload a .pptx file via the dashboard
2. Should show "PROCESSING" status immediately
3. After conversion (10-30s), status should change to "READY"
4. Open the document viewer — should render the converted PDF

- [ ] **Step 6: Commit**

```bash
git add src/lib/cloudconvert.ts src/modules/documents/index.ts src/app/api/documents/route.ts package.json package-lock.json
git commit -m "feat: add PPTX to PDF conversion via CloudConvert"
```

---

## Task 6: Data Room Granular Permissions

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `src/modules/datarooms/index.ts`
- Create: `src/app/api/datarooms/[id]/access/route.ts`
- Modify: `src/app/(viewer)/room/[slug]/page.tsx`

- [ ] **Step 1: Add DataRoomAccess model to schema**

In `prisma/schema.prisma`, add:

```prisma
model DataRoomAccess {
  id          String   @id @default(cuid())
  dataRoomId  String
  email       String
  documentIds String[] // Array of allowed document IDs
  createdAt   DateTime @default(now())

  dataRoom DataRoom @relation(fields: [dataRoomId], references: [id], onDelete: Cascade)

  @@unique([dataRoomId, email])
}
```

Also add the relation to the DataRoom model:

```prisma
model DataRoom {
  // ... existing fields
  accessRules DataRoomAccess[]
}
```

Then push the schema:

```bash
npx prisma db push
```

- [ ] **Step 2: Add access control functions to datarooms module**

Add to `src/modules/datarooms/index.ts`:

```typescript
export async function setDataRoomAccess(
  dataRoomId: string,
  email: string,
  documentIds: string[]
) {
  return prisma.dataRoomAccess.upsert({
    where: {
      dataRoomId_email: { dataRoomId, email },
    },
    create: { dataRoomId, email, documentIds },
    update: { documentIds },
  });
}

export async function removeDataRoomAccess(dataRoomId: string, email: string) {
  return prisma.dataRoomAccess.delete({
    where: {
      dataRoomId_email: { dataRoomId, email },
    },
  });
}

export async function getDataRoomAccessRules(dataRoomId: string) {
  return prisma.dataRoomAccess.findMany({
    where: { dataRoomId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getVisibleDocuments(
  dataRoomId: string,
  viewerEmail: string | null
) {
  const room = await prisma.dataRoom.findUnique({
    where: { id: dataRoomId },
    include: {
      documents: {
        include: { document: true },
        orderBy: { order: "asc" },
      },
      accessRules: true,
    },
  });

  if (!room) return null;

  // If no access rules exist, show all documents (backwards compatible)
  if (room.accessRules.length === 0) {
    return room.documents;
  }

  // If viewer has no email, show no restricted docs
  if (!viewerEmail) {
    return [];
  }

  // Find matching access rule
  const rule = room.accessRules.find(
    (r) => r.email.toLowerCase() === viewerEmail.toLowerCase()
  );

  if (!rule) {
    return []; // Email not in access list
  }

  // Filter documents to only allowed ones
  return room.documents.filter((d) =>
    rule.documentIds.includes(d.documentId)
  );
}
```

- [ ] **Step 3: Create access control API route**

Create `src/app/api/datarooms/[id]/access/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth";
import {
  setDataRoomAccess,
  removeDataRoomAccess,
  getDataRoomAccessRules,
} from "@/modules/datarooms";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const rules = await getDataRoomAccessRules(id);
  return NextResponse.json(rules);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { email, documentIds } = await req.json();

  if (!email || !Array.isArray(documentIds)) {
    return NextResponse.json(
      { error: "email and documentIds[] required" },
      { status: 400 }
    );
  }

  const rule = await setDataRoomAccess(id, email, documentIds);
  return NextResponse.json(rule);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  await removeDataRoomAccess(id, email);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 4: Update Data Room viewer to filter documents by access**

In `src/app/(viewer)/room/[slug]/page.tsx`, update the page to filter documents based on viewer email. The viewer email should come from a cookie or query param set during the email verification gate:

```typescript
import { getVisibleDocuments } from "@/modules/datarooms";
import { cookies } from "next/headers";

// Inside the page component, replace the direct document list with:
const viewerEmail = (await cookies()).get("viewer_email")?.value || null;
const visibleDocs = await getVisibleDocuments(dataRoom.id, viewerEmail);

// If visibleDocs is null, room not found
// If access rules exist but email doesn't match, visibleDocs is empty
// Use visibleDocs instead of dataRoom.documents in the render
```

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma src/modules/datarooms/index.ts src/app/api/datarooms/[id]/access/route.ts src/app/(viewer)/room/[slug]/page.tsx
git commit -m "feat: add granular per-document permissions for Data Rooms"
```

---

## Task 7: Blog with MDX

**Files:**
- Create: `src/lib/mdx.ts`
- Create: `src/app/blog/page.tsx`
- Create: `src/app/blog/[slug]/page.tsx`
- Create: `content/blog/introducing-peeeky.mdx`
- Create: `content/blog/investor-engagement.mdx`
- Create: `content/blog/sales-follow-up.mdx`

- [ ] **Step 1: Install MDX dependencies**

```bash
npm install next-mdx-remote gray-matter
```

- [ ] **Step 2: Create MDX utility functions**

Create `src/lib/mdx.ts`:

```typescript
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  description: string;
  author: string;
  tags: string[];
  content: string;
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));

  const posts = files.map((filename) => {
    const filePath = path.join(BLOG_DIR, filename);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);

    return {
      slug: filename.replace(/\.mdx$/, ""),
      title: data.title || "",
      date: data.date || "",
      description: data.description || "",
      author: data.author || "Peeeky Team",
      tags: data.tags || [],
      content,
    };
  });

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title || "",
    date: data.date || "",
    description: data.description || "",
    author: data.author || "Peeeky Team",
    tags: data.tags || [],
    content,
  };
}
```

- [ ] **Step 3: Create blog index page**

Create `src/app/blog/page.tsx`:

```typescript
import { getAllPosts } from "@/lib/mdx";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Peeeky",
  description: "Insights on document tracking, analytics, and secure sharing.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            Peeeky
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-2">Blog</h1>
        <p className="text-gray-500 mb-12">
          Insights on document tracking, analytics, and secure sharing.
        </p>

        <div className="space-y-12">
          {posts.map((post) => (
            <article key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="group">
                <time className="text-sm text-gray-400">{post.date}</time>
                <h2 className="text-2xl font-semibold mt-1 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-600 mt-2">{post.description}</p>
              </Link>
            </article>
          ))}

          {posts.length === 0 && (
            <p className="text-gray-400">No posts yet. Check back soon!</p>
          )}
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 4: Create blog post page**

Create `src/app/blog/[slug]/page.tsx`:

```typescript
import { getPostBySlug, getAllPosts } from "@/lib/mdx";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.title} | Peeeky Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            Peeeky
          </Link>
          <Link
            href="/blog"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            &larr; All posts
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <time className="text-sm text-gray-400">{post.date}</time>
        <h1 className="text-4xl font-bold mt-2 mb-4">{post.title}</h1>
        <p className="text-gray-500 mb-8">By {post.author}</p>

        <article className="prose prose-lg max-w-none">
          <MDXRemote source={post.content} />
        </article>

        <div className="mt-16 pt-8 border-t">
          <Link
            href="/blog"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            &larr; Back to all posts
          </Link>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 5: Create blog content directory and posts**

```bash
mkdir -p content/blog
```

Create `content/blog/introducing-peeeky.mdx`:

```mdx
---
title: "Introducing Peeeky — Track Every Page of Your Shared Documents"
date: "2026-03-27"
description: "Share documents securely and know exactly how they're consumed. Every link is a window into your recipient's intent."
author: "Peeeky Team"
tags: ["launch", "product"]
---

Sharing documents should be simple. But knowing whether anyone actually *read* them? That's been a black box — until now.

## The Problem

You send a pitch deck to an investor. A proposal to a client. A contract to a partner. Then... silence. Did they open it? Did they read past page 2? Are they interested or just being polite?

Email attachments give you zero visibility. Google Drive tells you someone "viewed" the file, but nothing more. DocSend exists, but it's expensive and clunky.

## Enter Peeeky

Peeeky gives you a **tracked link** for any PDF. When someone opens it, you see:

- **Which pages** they viewed and for how long
- **Engagement score** — are they deeply interested or just skimming?
- **Device and location** — are they reading on mobile during a commute or on desktop in their office?
- **AI-powered chat** — recipients can ask questions about your document without leaving the viewer

## How It Works

1. **Upload** your PDF
2. **Create a link** — you get a unique URL like `peeeky.com/view/abc123`
3. **Share it** — via email, Slack, LinkedIn, wherever
4. **Track** — watch real-time analytics as people view your document

## Built for Teams That Share

Whether you're raising a Series A, closing a deal, or managing an M&A data room, Peeeky gives you the visibility you need to follow up at exactly the right moment.

[Try Peeeky for free](https://peeeky.com) — no credit card required.
```

Create `content/blog/investor-engagement.mdx`:

```mdx
---
title: "How Founders Use Peeeky to Track Investor Engagement"
date: "2026-03-26"
description: "Stop guessing which investors are interested. Track every page of your pitch deck and follow up at the right moment."
author: "Peeeky Team"
tags: ["fundraising", "use-case"]
---

Fundraising is a numbers game. You send your deck to 30, 40, maybe 50 investors. But how do you know who's actually interested?

## The Old Way

1. Send pitch deck as email attachment
2. Wait 3-5 days
3. Send "just following up" email
4. Hear nothing
5. Repeat

The problem? You're treating every investor the same. The one who spent 8 minutes on your financials gets the same follow-up as the one who never opened the email.

## The Peeeky Way

With Peeeky, you know *exactly* who to call first:

- **Engagement scores** rank your investors by interest level
- **Per-page analytics** show you which sections caught their attention
- **Real-time alerts** notify you the moment someone views your deck
- **AI-suggested follow-ups** help you craft the perfect response

## A Real Example

Imagine you share your deck on Monday. By Tuesday morning, you see:

| Investor | Pages Viewed | Time Spent | Score |
|----------|-------------|------------|-------|
| Fund A | 12/12 | 6m 30s | 92 |
| Fund B | 5/12 | 1m 15s | 34 |
| Fund C | 12/12 | 8m 45s | 98 |

Fund C spent almost 9 minutes and read every page. They went back to your team slide twice. That's your warm lead — call them today.

Fund B skimmed 5 pages in 75 seconds. They're not interested right now. Don't waste your energy.

## Get Started

[Create your first tracked link](https://peeeky.com) and send your deck to one investor today. You'll never go back to blind sharing.
```

Create `content/blog/sales-follow-up.mdx`:

```mdx
---
title: "Sales Teams: Know Exactly When to Follow Up"
date: "2026-03-25"
description: "Use document analytics to time your follow-ups perfectly and close deals faster."
author: "Peeeky Team"
tags: ["sales", "use-case"]
---

The best salespeople don't follow up randomly. They follow up at the *right moment* — when the prospect is actively engaged.

## Timing Is Everything

Research shows that responding within 5 minutes of a prospect's engagement increases conversion rates by 400%. But how do you know when that moment is?

## Document Intelligence

When you share a proposal through Peeeky, you get real-time signals:

**Immediate alerts:** "Sarah from Acme Corp just opened your proposal."

**Deep engagement signals:** "Sarah spent 4 minutes on the pricing page."

**Return visits:** "Sarah is viewing your proposal again — third time this week."

Each of these is a buying signal. The prospect is doing their homework, comparing options, building an internal case.

## The Follow-Up Playbook

| Signal | Action |
|--------|--------|
| Opened, skimmed quickly | Wait — they'll come back if interested |
| Spent time on pricing | Send a "happy to walk through pricing" note |
| Returned 3+ times | They're building a case internally — offer to join their team meeting |
| Shared with colleagues | Multiple viewers from same company — deal is progressing |

## Protect Your Content

Peeeky also keeps your proposals secure:

- **Password protection** — only authorized recipients can view
- **Watermarking** — each viewer sees their email on every page
- **Expiration dates** — proposals auto-expire after your deadline
- **Download control** — decide if recipients can save a copy

## Start Closing Faster

[Try Peeeky free](https://peeeky.com) and share your next proposal with tracking enabled.
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/mdx.ts src/app/blog/ content/blog/ package.json package-lock.json
git commit -m "feat: add MDX blog with launch and use case posts"
```

---

## Task 8: Affiliate / Referral Program

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `src/modules/referrals/index.ts`
- Create: `src/app/api/referrals/route.ts`
- Create: `src/app/(dashboard)/settings/referrals/page.tsx`
- Modify: `src/app/(auth)/login/page.tsx`

- [ ] **Step 1: Add Referral model to schema**

In `prisma/schema.prisma`, add:

```prisma
model Referral {
  id            String   @id @default(cuid())
  referrerId    String
  referredOrgId String   @unique
  code          String
  status        String   @default("PENDING") // PENDING, ACTIVE, PAID
  commission    Float    @default(0.20) // 20%
  createdAt     DateTime @default(now())

  referrer    User         @relation("referrals_given", fields: [referrerId], references: [id])
  referredOrg Organization @relation(fields: [referredOrgId], references: [id])
}
```

Add to the User model:

```prisma
model User {
  // ... existing fields
  referralCode String?    @unique
  referrals    Referral[] @relation("referrals_given")
}
```

Add to the Organization model:

```prisma
model Organization {
  // ... existing fields
  referral Referral?
}
```

Then push:

```bash
npx prisma db push
```

- [ ] **Step 2: Create referrals module**

Create `src/modules/referrals/index.ts`:

```typescript
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

export async function getOrCreateReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });

  if (user?.referralCode) return user.referralCode;

  const code = nanoid(8);
  await prisma.user.update({
    where: { id: userId },
    data: { referralCode: code },
  });

  return code;
}

export async function createReferral(
  referralCode: string,
  referredOrgId: string
) {
  const referrer = await prisma.user.findUnique({
    where: { referralCode },
    select: { id: true },
  });

  if (!referrer) return null;

  return prisma.referral.create({
    data: {
      referrerId: referrer.id,
      referredOrgId,
      code: referralCode,
      status: "PENDING",
    },
  });
}

export async function activateReferral(referredOrgId: string) {
  // Called when referred org makes first payment
  return prisma.referral.updateMany({
    where: { referredOrgId, status: "PENDING" },
    data: { status: "ACTIVE" },
  });
}

export async function getReferralStats(userId: string) {
  const referrals = await prisma.referral.findMany({
    where: { referrerId: userId },
    include: {
      referredOrg: {
        select: { name: true, plan: true, createdAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const total = referrals.length;
  const active = referrals.filter((r) => r.status === "ACTIVE").length;
  const pending = referrals.filter((r) => r.status === "PENDING").length;

  return { referrals, total, active, pending };
}
```

- [ ] **Step 3: Create referrals API route**

Create `src/app/api/referrals/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth";
import { getOrCreateReferralCode, getReferralStats } from "@/modules/referrals";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const code = await getOrCreateReferralCode(session.user.id);
  const stats = await getReferralStats(session.user.id);

  return NextResponse.json({ code, ...stats });
}
```

- [ ] **Step 4: Create referral settings page**

Create `src/app/(dashboard)/settings/referrals/page.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";

interface Referral {
  id: string;
  status: string;
  commission: number;
  createdAt: string;
  referredOrg: {
    name: string;
    plan: string;
    createdAt: string;
  };
}

export default function ReferralsPage() {
  const [code, setCode] = useState("");
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [total, setTotal] = useState(0);
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/referrals")
      .then((r) => r.json())
      .then((data) => {
        setCode(data.code);
        setReferrals(data.referrals || []);
        setTotal(data.total || 0);
        setActive(data.active || 0);
        setLoading(false);
      });
  }, []);

  const referralUrl = `https://peeeky.com/signup?ref=${code}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">Referral Program</h1>
      <p className="text-gray-500 mb-8">
        Earn 20% commission for 12 months on every paying customer you refer.
      </p>

      {/* Referral Link */}
      <div className="bg-gray-50 border rounded-lg p-6 mb-8">
        <h2 className="text-sm font-medium text-gray-700 mb-3">
          Your referral link
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={referralUrl}
            className="flex-1 px-3 py-2 bg-white border rounded text-sm font-mono"
          />
          <button
            onClick={copyLink}
            className="px-4 py-2 bg-black text-white text-sm rounded hover:bg-gray-800 transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Referrals</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Active (Paying)</p>
          <p className="text-2xl font-bold text-green-600">{active}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Est. Monthly Earnings</p>
          <p className="text-2xl font-bold">
            ${(active * 39 * 0.2).toFixed(0)}
          </p>
        </div>
      </div>

      {/* Referral List */}
      {referrals.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Your Referrals</h2>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">
                    Organization
                  </th>
                  <th className="text-left px-4 py-3 font-medium">Plan</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((ref) => (
                  <tr key={ref.id} className="border-b last:border-0">
                    <td className="px-4 py-3">{ref.referredOrg.name}</td>
                    <td className="px-4 py-3">{ref.referredOrg.plan}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          ref.status === "ACTIVE"
                            ? "bg-green-50 text-green-700"
                            : ref.status === "PENDING"
                            ? "bg-yellow-50 text-yellow-700"
                            : "bg-gray-50 text-gray-700"
                        }`}
                      >
                        {ref.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(ref.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Capture referral code on signup**

In the login/signup page (`src/app/(auth)/login/page.tsx`), capture the `ref` query parameter and store it in a cookie:

```typescript
// At the top of the login page component:
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  if (ref) {
    document.cookie = `peeeky_ref=${ref};max-age=${90 * 24 * 60 * 60};path=/`;
  }
}, []);
```

- [ ] **Step 6: Link referral on org creation (in auth callbacks)**

In the NextAuth config (`src/modules/auth/index.ts`), in the signup/createOrganization callback, check for the referral cookie and create the Referral record:

```typescript
// After creating the Organization for a new user:
// This should be in the signIn or jwt callback where org is created
import { createReferral } from "@/modules/referrals";
import { cookies } from "next/headers";

// After org creation:
const refCode = cookies().get("peeeky_ref")?.value;
if (refCode) {
  await createReferral(refCode, newOrg.id);
}
```

- [ ] **Step 7: Activate referral on first payment**

In the Stripe webhook handler (`src/app/api/webhooks/stripe/route.ts`), in the `checkout.session.completed` handler, activate the referral:

```typescript
import { activateReferral } from "@/modules/referrals";

// Inside checkout.session.completed handler, after updating the org plan:
await activateReferral(orgId);
```

- [ ] **Step 8: Add referrals link to settings sidebar**

In the settings navigation, add a link to `/settings/referrals`. Find the settings layout or sidebar component and add:

```tsx
<Link href="/settings/referrals">Referrals</Link>
```

- [ ] **Step 9: Commit**

```bash
git add prisma/schema.prisma src/modules/referrals/ src/app/api/referrals/ src/app/(dashboard)/settings/referrals/ src/app/(auth)/login/page.tsx src/app/api/webhooks/stripe/route.ts
git commit -m "feat: add referral/affiliate program with 20% commission tracking"
```

---

## Summary

| Task | Feature | Estimated Complexity |
|------|---------|---------------------|
| 1 | Geo-IP | Low (2 files, header extraction) |
| 2 | Vercel Cron Jobs | Medium (3 new files, cron config) |
| 3 | Redis Analytics Cache | Medium (2 files, cache layer) |
| 4 | Currently Viewing | Medium (4 files, heartbeat + polling) |
| 5 | PPTX→PDF | Medium (3 files, external API) |
| 6 | Data Room Permissions | Medium (4 files, new model + filtering) |
| 7 | Blog | Medium (6 files, MDX setup + content) |
| 8 | Affiliate Program | High (8+ files, new model + auth hooks) |
