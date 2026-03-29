# GTM R$20K/mês — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement all technical pieces needed to execute the GTM plan — AppSumo integration, open-source SDK/viewer repos, content pipeline, outbound automation agents, and analytics reporting.

**Architecture:** 5 independent workstreams that can be parallelized: (1) AppSumo redeem system in the existing Next.js app, (2) peeeky-js SDK as standalone npm package, (3) peeeky-viewer as standalone React component, (4) agent prompts and scheduled triggers for content/outbound/community, (5) analytics dashboard for weekly reporting. Each workstream produces deployable artifacts.

**Tech Stack:** Next.js 15, Prisma, Stripe, Resend, R2, TypeScript, Claude Code agents, npm packages.

---

## Workstream A: AppSumo Integration (Priority 1 — Week 1-2)

### Task A1: Add APPSUMO plan and license code schema

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `src/config/plans.ts`

- [ ] **Step 1: Add AppSumo fields to Prisma schema**

Add to `prisma/schema.prisma` after the existing `Plan` enum:

```prisma
enum Plan {
  FREE
  PRO
  BUSINESS
  APPSUMO_TIER1
  APPSUMO_TIER2
  APPSUMO_TIER3
}
```

Add new model after `Referral`:

```prisma
model AppSumoLicense {
  id            String   @id @default(cuid())
  code          String   @unique
  tier          Int      // 1, 2, or 3
  redeemedAt    DateTime?
  redeemedById  String?
  redeemedBy    Organization? @relation(fields: [redeemedById], references: [id])
  createdAt     DateTime @default(now())

  @@index([code])
}
```

Add relation to Organization model:

```prisma
model Organization {
  // ... existing fields
  appSumoLicense  AppSumoLicense?
}
```

- [ ] **Step 2: Run migration**

Run: `npx prisma migrate dev --name add-appsumo-license`
Expected: Migration succeeds, new table `AppSumoLicense` created.

- [ ] **Step 3: Update plans config**

In `src/config/plans.ts`, add AppSumo tiers:

```typescript
export const PLAN_LIMITS = {
  FREE: {
    documents: 5,
    linksPerDoc: 3,
    members: 1,
    aiChatsPerMonth: 10,
    dataRetentionDays: 30,
    customDomain: false,
    removeBadge: false,
  },
  PRO: {
    documents: -1,
    linksPerDoc: -1,
    members: 3,
    aiChatsPerMonth: 50,
    dataRetentionDays: 365,
    customDomain: false,
    removeBadge: true,
  },
  BUSINESS: {
    documents: -1,
    linksPerDoc: -1,
    members: 10,
    aiChatsPerMonth: -1,
    dataRetentionDays: -1,
    customDomain: true,
    removeBadge: true,
  },
  APPSUMO_TIER1: {
    documents: 50,
    linksPerDoc: -1,
    members: 1,
    aiChatsPerMonth: 50,
    dataRetentionDays: 365,
    customDomain: false,
    removeBadge: true,
  },
  APPSUMO_TIER2: {
    documents: -1,
    linksPerDoc: -1,
    members: 3,
    aiChatsPerMonth: 50,
    dataRetentionDays: 365,
    customDomain: false,
    removeBadge: true,
  },
  APPSUMO_TIER3: {
    documents: -1,
    linksPerDoc: -1,
    members: 5,
    aiChatsPerMonth: -1,
    dataRetentionDays: -1,
    customDomain: true,
    removeBadge: true,
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;
```

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma src/config/plans.ts
git commit -m "feat: add AppSumo license schema and plan tiers"
```

---

### Task A2: AppSumo license redeem API

**Files:**
- Create: `src/app/api/appsumo/redeem/route.ts`
- Create: `src/app/api/appsumo/webhook/route.ts`

- [ ] **Step 1: Create redeem API endpoint**

Create `src/app/api/appsumo/redeem/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";

const TIER_TO_PLAN = {
  1: "APPSUMO_TIER1",
  2: "APPSUMO_TIER2",
  3: "APPSUMO_TIER3",
} as const;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code } = await req.json();
  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "License code required" }, { status: 400 });
  }

  const license = await prisma.appSumoLicense.findUnique({
    where: { code: code.trim().toUpperCase() },
  });

  if (!license) {
    return NextResponse.json({ error: "Invalid license code" }, { status: 404 });
  }

  if (license.redeemedAt) {
    return NextResponse.json({ error: "License already redeemed" }, { status: 409 });
  }

  // Get user's org
  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id, role: "OWNER" },
    select: { orgId: true },
  });

  if (!membership) {
    return NextResponse.json({ error: "No organization found" }, { status: 400 });
  }

  const plan = TIER_TO_PLAN[license.tier as keyof typeof TIER_TO_PLAN];
  if (!plan) {
    return NextResponse.json({ error: "Invalid license tier" }, { status: 400 });
  }

  // Redeem: update license + upgrade org
  await prisma.$transaction([
    prisma.appSumoLicense.update({
      where: { id: license.id },
      data: {
        redeemedAt: new Date(),
        redeemedById: membership.orgId,
      },
    }),
    prisma.organization.update({
      where: { id: membership.orgId },
      data: { plan },
    }),
  ]);

  // Invalidate plan cache
  await redis.del(`plan:${membership.orgId}`);

  return NextResponse.json({
    success: true,
    plan,
    tier: license.tier,
  });
}
```

- [ ] **Step 2: Create AppSumo webhook endpoint**

Create `src/app/api/appsumo/webhook/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// AppSumo sends webhook when license is purchased
// We pre-generate codes and this webhook activates them
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-appsumo-signature");

  // Verify webhook signature
  const expected = crypto
    .createHmac("sha256", process.env.APPSUMO_WEBHOOK_SECRET || "")
    .update(body)
    .digest("hex");

  if (signature !== expected) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(body);
  const { action, plan_id, uuid, activation_email } = payload;

  if (action === "activate") {
    // Determine tier from AppSumo plan_id
    const tier = getTierFromPlanId(plan_id);

    // Create license code
    const code = generateLicenseCode();
    await prisma.appSumoLicense.create({
      data: {
        code,
        tier,
      },
    });

    // Return code to AppSumo (they email it to buyer)
    return NextResponse.json({
      message: "License activated",
      redirect_url: `https://peeeky.com/redeem?code=${code}`,
      license_key: code,
    });
  }

  if (action === "refund") {
    // Find and deactivate the license
    const license = await prisma.appSumoLicense.findFirst({
      where: {
        code: uuid,
      },
      include: { redeemedBy: true },
    });

    if (license?.redeemedById) {
      await prisma.organization.update({
        where: { id: license.redeemedById },
        data: { plan: "FREE" },
      });
    }

    return NextResponse.json({ message: "License refunded" });
  }

  return NextResponse.json({ message: "OK" });
}

function getTierFromPlanId(planId: string): number {
  // Map AppSumo plan IDs to our tiers (set these after creating the deal)
  const mapping: Record<string, number> = {
    [process.env.APPSUMO_TIER1_PLAN_ID || "tier1"]: 1,
    [process.env.APPSUMO_TIER2_PLAN_ID || "tier2"]: 2,
    [process.env.APPSUMO_TIER3_PLAN_ID || "tier3"]: 3,
  };
  return mapping[planId] || 1;
}

function generateLicenseCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const segments = [];
  for (let s = 0; s < 4; s++) {
    let segment = "";
    for (let i = 0; i < 4; i++) {
      segment += chars[Math.floor(Math.random() * chars.length)];
    }
    segments.push(segment);
  }
  return segments.join("-"); // e.g., "ABCD-EF23-GHKL-MN45"
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/appsumo/
git commit -m "feat: AppSumo license redeem and webhook endpoints"
```

---

### Task A3: Redeem page UI

**Files:**
- Create: `src/app/(dashboard)/redeem/page.tsx`

- [ ] **Step 1: Create the redeem page**

Create `src/app/(dashboard)/redeem/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function RedeemPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillCode = searchParams.get("code") || "";

  const [code, setCode] = useState(prefillCode);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleRedeem(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/appsumo/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(`License redeemed! You're now on the ${data.plan} plan.`);
        setTimeout(() => router.push("/documents"), 2000);
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to redeem license");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-md py-16">
      <h1 className="text-2xl font-bold mb-2">Redeem License</h1>
      <p className="text-gray-500 mb-8">
        Enter your AppSumo license code to activate your plan.
      </p>

      <form onSubmit={handleRedeem} className="space-y-4">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="XXXX-XXXX-XXXX-XXXX"
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-center text-lg tracking-widest font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          maxLength={19}
          disabled={status === "loading" || status === "success"}
        />
        <button
          type="submit"
          disabled={!code || status === "loading" || status === "success"}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "loading" ? "Redeeming..." : "Redeem License"}
        </button>
      </form>

      {status === "success" && (
        <div className="mt-4 rounded-lg bg-green-50 border border-green-200 p-4 text-green-800">
          {message}
        </div>
      )}
      {status === "error" && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-4 text-red-800">
          {message}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(dashboard\)/redeem/
git commit -m "feat: AppSumo license redeem page UI"
```

---

### Task A4: Seed script for generating AppSumo codes

**Files:**
- Create: `scripts/generate-appsumo-codes.ts`

- [ ] **Step 1: Create the seed script**

Create `scripts/generate-appsumo-codes.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCode(): string {
  const segments = [];
  for (let s = 0; s < 4; s++) {
    let segment = "";
    for (let i = 0; i < 4; i++) {
      segment += CHARS[Math.floor(Math.random() * CHARS.length)];
    }
    segments.push(segment);
  }
  return segments.join("-");
}

async function main() {
  const tier = parseInt(process.argv[2] || "1");
  const count = parseInt(process.argv[3] || "100");

  if (![1, 2, 3].includes(tier)) {
    console.error("Tier must be 1, 2, or 3");
    process.exit(1);
  }

  console.log(`Generating ${count} codes for Tier ${tier}...`);

  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = generateCode();
    await prisma.appSumoLicense.create({
      data: { code, tier },
    });
    codes.push(code);
  }

  console.log(`Generated ${codes.length} codes:`);
  codes.forEach((c) => console.log(c));

  // Save to file
  const filename = `appsumo-codes-tier${tier}-${Date.now()}.txt`;
  const fs = await import("fs");
  fs.writeFileSync(filename, codes.join("\n"));
  console.log(`\nSaved to ${filename}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 2: Commit**

```bash
git add scripts/generate-appsumo-codes.ts
git commit -m "feat: script to generate AppSumo license codes"
```

---

## Workstream B: Open-Source peeeky-js SDK (Priority 2 — Week 2-3)

### Task B1: Initialize peeeky-js package

**Files:**
- Create: `packages/peeeky-js/package.json`
- Create: `packages/peeeky-js/tsconfig.json`
- Create: `packages/peeeky-js/src/index.ts`
- Create: `packages/peeeky-js/README.md`

- [ ] **Step 1: Create package structure**

```bash
mkdir -p packages/peeeky-js/src
```

Create `packages/peeeky-js/package.json`:

```json
{
  "name": "peeeky-js",
  "version": "1.0.0",
  "description": "Track document engagement from any app. Lightweight SDK for Peeeky.",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "keywords": ["document-tracking", "analytics", "pdf", "engagement", "peeeky"],
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/peeeky/peeeky-js"
  },
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts --clean",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch",
    "test": "vitest run",
    "test:watch": "vitest",
    "prepublishOnly": "npm run build"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.5.0",
    "vitest": "^2.0.0"
  }
}
```

Create `packages/peeeky-js/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "lib": ["ES2020", "DOM"]
  },
  "include": ["src"]
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/peeeky-js/package.json packages/peeeky-js/tsconfig.json
git commit -m "feat: initialize peeeky-js SDK package"
```

---

### Task B2: Implement SDK core

**Files:**
- Create: `packages/peeeky-js/src/index.ts`
- Create: `packages/peeeky-js/src/types.ts`

- [ ] **Step 1: Create types**

Create `packages/peeeky-js/src/types.ts`:

```typescript
export interface PeeekyConfig {
  apiKey: string;
  endpoint?: string;
  debug?: boolean;
}

export interface TrackEvent {
  documentId: string;
  viewerEmail?: string;
  page?: number;
  duration?: number;
  action?: "view_start" | "page_view" | "view_end";
  metadata?: Record<string, string>;
}

export interface TrackResponse {
  viewId: string;
  isForwarded?: boolean;
}
```

- [ ] **Step 2: Create main SDK**

Create `packages/peeeky-js/src/index.ts`:

```typescript
import type { PeeekyConfig, TrackEvent, TrackResponse } from "./types";

export type { PeeekyConfig, TrackEvent, TrackResponse };

const DEFAULT_ENDPOINT = "https://peeeky.com/api/track";

let _config: PeeekyConfig | null = null;
let _currentViewId: string | null = null;
let _pageStartTime: number | null = null;

export const Peeeky = {
  init(config: PeeekyConfig): void {
    if (!config.apiKey) {
      throw new Error("Peeeky: apiKey is required");
    }
    _config = {
      endpoint: DEFAULT_ENDPOINT,
      debug: false,
      ...config,
    };
    if (_config.debug) {
      console.log("[Peeeky] Initialized with endpoint:", _config.endpoint);
    }
  },

  async track(event: TrackEvent): Promise<TrackResponse | null> {
    if (!_config) {
      console.warn("Peeeky: call Peeeky.init() before tracking");
      return null;
    }

    const action = event.action || "page_view";
    const payload = {
      action,
      linkId: event.documentId,
      viewId: _currentViewId,
      pageNumber: event.page,
      duration: event.duration,
      viewerEmail: event.viewerEmail,
      metadata: event.metadata,
      _apiKey: _config.apiKey,
    };

    if (_config.debug) {
      console.log("[Peeeky] Track:", payload);
    }

    try {
      const res = await fetch(_config.endpoint!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      });

      if (!res.ok) {
        if (_config.debug) console.error("[Peeeky] Track failed:", res.status);
        return null;
      }

      const data = await res.json();

      if (action === "view_start" && data.viewId) {
        _currentViewId = data.viewId;
      }

      return data;
    } catch (err) {
      if (_config.debug) console.error("[Peeeky] Track error:", err);
      return null;
    }
  },

  startPageTimer(): void {
    _pageStartTime = Date.now();
  },

  stopPageTimer(page: number): number {
    if (!_pageStartTime) return 0;
    const duration = Math.round((Date.now() - _pageStartTime) / 1000);
    _pageStartTime = null;
    this.track({ documentId: "", page, duration, action: "page_view" });
    return duration;
  },

  async startView(documentId: string, viewerEmail?: string): Promise<string | null> {
    const result = await this.track({
      documentId,
      viewerEmail,
      action: "view_start",
    });
    return result?.viewId || null;
  },

  async endView(documentId: string, duration: number): Promise<void> {
    await this.track({
      documentId,
      duration,
      action: "view_end",
    });
    _currentViewId = null;
  },

  getViewId(): string | null {
    return _currentViewId;
  },

  reset(): void {
    _config = null;
    _currentViewId = null;
    _pageStartTime = null;
  },
};

export default Peeeky;
```

- [ ] **Step 3: Commit**

```bash
git add packages/peeeky-js/src/
git commit -m "feat: peeeky-js SDK core — init, track, page timer"
```

---

### Task B3: SDK tests

**Files:**
- Create: `packages/peeeky-js/src/__tests__/peeeky.test.ts`

- [ ] **Step 1: Write tests**

Create `packages/peeeky-js/src/__tests__/peeeky.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { Peeeky } from "../index";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("Peeeky SDK", () => {
  beforeEach(() => {
    Peeeky.reset();
    mockFetch.mockReset();
  });

  describe("init", () => {
    it("throws without apiKey", () => {
      expect(() => Peeeky.init({ apiKey: "" })).toThrow("apiKey is required");
    });

    it("initializes with defaults", () => {
      Peeeky.init({ apiKey: "pk_test_123" });
      // No error = success
    });
  });

  describe("track", () => {
    it("warns if not initialized", async () => {
      const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const result = await Peeeky.track({ documentId: "doc_1" });
      expect(result).toBeNull();
      expect(spy).toHaveBeenCalledWith("Peeeky: call Peeeky.init() before tracking");
      spy.mockRestore();
    });

    it("sends track request", async () => {
      Peeeky.init({ apiKey: "pk_test_123" });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ viewId: "v_1" }),
      });

      const result = await Peeeky.track({
        documentId: "doc_1",
        action: "view_start",
      });

      expect(mockFetch).toHaveBeenCalledOnce();
      expect(result).toEqual({ viewId: "v_1" });
    });

    it("stores viewId from view_start", async () => {
      Peeeky.init({ apiKey: "pk_test_123" });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ viewId: "v_123" }),
      });

      await Peeeky.track({ documentId: "doc_1", action: "view_start" });
      expect(Peeeky.getViewId()).toBe("v_123");
    });

    it("handles fetch errors gracefully", async () => {
      Peeeky.init({ apiKey: "pk_test_123" });
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await Peeeky.track({ documentId: "doc_1" });
      expect(result).toBeNull();
    });
  });

  describe("startView / endView", () => {
    it("starts and ends a view session", async () => {
      Peeeky.init({ apiKey: "pk_test_123" });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ viewId: "v_456" }),
      });

      const viewId = await Peeeky.startView("doc_1", "user@test.com");
      expect(viewId).toBe("v_456");

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true }),
      });

      await Peeeky.endView("doc_1", 120);
      expect(Peeeky.getViewId()).toBeNull();
    });
  });

  describe("reset", () => {
    it("clears all state", () => {
      Peeeky.init({ apiKey: "pk_test_123" });
      Peeeky.reset();
      expect(Peeeky.getViewId()).toBeNull();
    });
  });
});
```

- [ ] **Step 2: Run tests**

```bash
cd packages/peeeky-js && npm install && npm test
```

Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add packages/peeeky-js/
git commit -m "test: peeeky-js SDK tests — init, track, view lifecycle"
```

---

### Task B4: SDK README with badges and examples

**Files:**
- Create: `packages/peeeky-js/README.md`
- Create: `packages/peeeky-js/LICENSE`

- [ ] **Step 1: Create README**

Create `packages/peeeky-js/README.md`:

````markdown
# peeeky-js

> Track document engagement from any app. Lightweight SDK for [Peeeky](https://peeeky.com).

[![npm](https://img.shields.io/npm/v/peeeky-js)](https://www.npmjs.com/package/peeeky-js)
[![bundle size](https://img.shields.io/bundlephobia/minzip/peeeky-js)](https://bundlephobia.com/package/peeeky-js)
[![license](https://img.shields.io/npm/l/peeeky-js)](./LICENSE)

## Install

```bash
npm install peeeky-js
```

## Quick Start

```javascript
import { Peeeky } from 'peeeky-js'

// Initialize with your API key
Peeeky.init({ apiKey: 'pk_live_your_key' })

// Start tracking a document view
const viewId = await Peeeky.startView('doc_123', 'viewer@email.com')

// Track individual page views
await Peeeky.track({
  documentId: 'doc_123',
  page: 1,
  duration: 45, // seconds
  action: 'page_view'
})

// End the view session
await Peeeky.endView('doc_123', 180) // total duration in seconds
```

## Page Timer Helper

```javascript
// Automatically measure time spent on each page
Peeeky.startPageTimer()

// When user navigates to next page
const secondsOnPage = Peeeky.stopPageTimer(1) // page number
```

## Configuration

```javascript
Peeeky.init({
  apiKey: 'pk_live_your_key', // Required
  endpoint: 'https://peeeky.com/api/track', // Default
  debug: false, // Log events to console
})
```

## API

| Method | Description |
|--------|-------------|
| `Peeeky.init(config)` | Initialize with API key |
| `Peeeky.track(event)` | Send a tracking event |
| `Peeeky.startView(docId, email?)` | Start a view session |
| `Peeeky.endView(docId, duration)` | End a view session |
| `Peeeky.startPageTimer()` | Start measuring time on page |
| `Peeeky.stopPageTimer(page)` | Stop timer and send page_view |
| `Peeeky.getViewId()` | Get current view session ID |
| `Peeeky.reset()` | Clear all state |

## Dashboard

All tracked events appear in your [Peeeky dashboard](https://peeeky.com/documents) with:

- Per-page engagement heatmaps
- Viewer identification and history
- AI-powered engagement scoring
- Smart follow-up alerts

**Free tier:** 5 documents, basic analytics
**Pro ($39/mo):** Unlimited documents, full analytics, AI chat

## License

MIT
````

- [ ] **Step 2: Create LICENSE file**

Create `packages/peeeky-js/LICENSE`:

```
MIT License

Copyright (c) 2026 Peeeky

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 3: Commit**

```bash
git add packages/peeeky-js/README.md packages/peeeky-js/LICENSE
git commit -m "docs: peeeky-js README with badges, examples, and MIT license"
```

---

## Workstream C: Open-Source peeeky-viewer (Priority 2 — Week 2-4)

### Task C1: Initialize viewer package

**Files:**
- Create: `packages/peeeky-viewer/package.json`
- Create: `packages/peeeky-viewer/tsconfig.json`

- [ ] **Step 1: Create package structure**

```bash
mkdir -p packages/peeeky-viewer/src
```

Create `packages/peeeky-viewer/package.json`:

```json
{
  "name": "@peeeky/viewer",
  "version": "1.0.0",
  "description": "Open-source PDF viewer with built-in engagement tracking. React component.",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "keywords": ["pdf-viewer", "react", "document-tracking", "analytics", "peeeky"],
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/peeeky/viewer"
  },
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  },
  "dependencies": {
    "pdfjs-dist": "^4.0.0"
  },
  "devDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@types/react": "^19.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.5.0",
    "vitest": "^2.0.0"
  },
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts --external react --external react-dom --clean",
    "dev": "tsup src/index.ts --format cjs,esm --dts --external react --external react-dom --watch",
    "test": "vitest run",
    "prepublishOnly": "npm run build"
  }
}
```

Create `packages/peeeky-viewer/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "jsx": "react-jsx",
    "lib": ["ES2020", "DOM"]
  },
  "include": ["src"]
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/peeeky-viewer/
git commit -m "feat: initialize @peeeky/viewer package"
```

---

### Task C2: Implement viewer component

**Files:**
- Create: `packages/peeeky-viewer/src/index.ts`
- Create: `packages/peeeky-viewer/src/PeeekyViewer.tsx`
- Create: `packages/peeeky-viewer/src/types.ts`
- Create: `packages/peeeky-viewer/src/use-pdf.ts`
- Create: `packages/peeeky-viewer/src/use-tracking.ts`

- [ ] **Step 1: Create types**

Create `packages/peeeky-viewer/src/types.ts`:

```typescript
export interface PeeekyViewerProps {
  src: string;
  apiKey?: string;
  endpoint?: string;
  viewerEmail?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  showToolbar?: boolean;
  showPageNumbers?: boolean;
  theme?: "light" | "dark";
  onPageView?: (page: number, timeSpent: number) => void;
  onViewStart?: (viewId: string) => void;
  onViewEnd?: (totalDuration: number) => void;
  onError?: (error: Error) => void;
}
```

- [ ] **Step 2: Create PDF rendering hook**

Create `packages/peeeky-viewer/src/use-pdf.ts`:

```typescript
import { useState, useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export function usePdf(src: string) {
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const docRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    pdfjsLib
      .getDocument(src)
      .promise.then((doc) => {
        if (cancelled) return;
        docRef.current = doc;
        setNumPages(doc.numPages);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [src]);

  async function renderPage(
    pageNum: number,
    canvas: HTMLCanvasElement,
    scale: number = 1.5
  ) {
    if (!docRef.current) return;
    const page = await docRef.current.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport }).promise;
  }

  return { numPages, loading, error, renderPage };
}
```

- [ ] **Step 3: Create tracking hook**

Create `packages/peeeky-viewer/src/use-tracking.ts`:

```typescript
import { useRef, useCallback, useEffect } from "react";

interface TrackingConfig {
  apiKey?: string;
  endpoint?: string;
  viewerEmail?: string;
  onPageView?: (page: number, timeSpent: number) => void;
  onViewStart?: (viewId: string) => void;
  onViewEnd?: (totalDuration: number) => void;
}

export function useTracking(config: TrackingConfig) {
  const viewIdRef = useRef<string | null>(null);
  const pageStartRef = useRef<number>(Date.now());
  const totalStartRef = useRef<number>(Date.now());
  const currentPageRef = useRef<number>(1);

  const sendEvent = useCallback(
    async (payload: Record<string, unknown>) => {
      if (!config.apiKey) return null;
      try {
        const res = await fetch(config.endpoint || "https://peeeky.com/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, _apiKey: config.apiKey }),
          keepalive: true,
        });
        if (res.ok) return res.json();
      } catch {
        // Silently fail — tracking should never break the viewer
      }
      return null;
    },
    [config.apiKey, config.endpoint]
  );

  const startView = useCallback(async () => {
    totalStartRef.current = Date.now();
    pageStartRef.current = Date.now();
    const data = await sendEvent({
      action: "view_start",
      viewerEmail: config.viewerEmail,
    });
    if (data?.viewId) {
      viewIdRef.current = data.viewId;
      config.onViewStart?.(data.viewId);
    }
  }, [sendEvent, config]);

  const trackPageChange = useCallback(
    async (newPage: number) => {
      const timeSpent = Math.round((Date.now() - pageStartRef.current) / 1000);
      const prevPage = currentPageRef.current;

      if (viewIdRef.current && timeSpent > 0) {
        await sendEvent({
          action: "page_view",
          viewId: viewIdRef.current,
          pageNumber: prevPage,
          duration: timeSpent,
        });
      }

      config.onPageView?.(prevPage, timeSpent);
      currentPageRef.current = newPage;
      pageStartRef.current = Date.now();
    },
    [sendEvent, config]
  );

  const endView = useCallback(async () => {
    // Track last page
    await trackPageChange(currentPageRef.current);

    const totalDuration = Math.round((Date.now() - totalStartRef.current) / 1000);
    if (viewIdRef.current) {
      await sendEvent({
        action: "view_end",
        viewId: viewIdRef.current,
        duration: totalDuration,
      });
    }
    config.onViewEnd?.(totalDuration);
    viewIdRef.current = null;
  }, [sendEvent, trackPageChange, config]);

  // Auto-start and end view
  useEffect(() => {
    startView();
    return () => {
      endView();
    };
  }, [startView, endView]);

  return { trackPageChange, viewId: viewIdRef };
}
```

- [ ] **Step 4: Create main viewer component**

Create `packages/peeeky-viewer/src/PeeekyViewer.tsx`:

```tsx
import { useState, useRef, useEffect, useCallback } from "react";
import { usePdf } from "./use-pdf";
import { useTracking } from "./use-tracking";
import type { PeeekyViewerProps } from "./types";

export function PeeekyViewer({
  src,
  apiKey,
  endpoint,
  viewerEmail,
  width = "100%",
  height = "600px",
  className = "",
  showToolbar = true,
  showPageNumbers = true,
  theme = "light",
  onPageView,
  onViewStart,
  onViewEnd,
  onError,
}: PeeekyViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.5);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { numPages, loading, error, renderPage } = usePdf(src);
  const { trackPageChange } = useTracking({
    apiKey,
    endpoint,
    viewerEmail,
    onPageView,
    onViewStart,
    onViewEnd,
  });

  useEffect(() => {
    if (error && onError) onError(error);
  }, [error, onError]);

  useEffect(() => {
    if (!loading && canvasRef.current && numPages > 0) {
      renderPage(currentPage, canvasRef.current, scale);
    }
  }, [currentPage, loading, numPages, scale, renderPage]);

  const goToPage = useCallback(
    (page: number) => {
      if (page < 1 || page > numPages) return;
      trackPageChange(page);
      setCurrentPage(page);
    },
    [numPages, trackPageChange]
  );

  const isDark = theme === "dark";
  const bg = isDark ? "#1a1a1a" : "#ffffff";
  const fg = isDark ? "#ffffff" : "#000000";
  const border = isDark ? "#333" : "#e5e7eb";

  if (loading) {
    return (
      <div style={{ width, height, display: "flex", alignItems: "center", justifyContent: "center", background: bg }}>
        <span style={{ color: fg }}>Loading document...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ width, height, display: "flex", alignItems: "center", justifyContent: "center", background: bg }}>
        <span style={{ color: "#ef4444" }}>Failed to load document</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width,
        height,
        display: "flex",
        flexDirection: "column",
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      {showToolbar && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 16px",
            borderBottom: `1px solid ${border}`,
            background: isDark ? "#222" : "#f9fafb",
          }}
        >
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              style={{ padding: "4px 12px", cursor: currentPage <= 1 ? "not-allowed" : "pointer", opacity: currentPage <= 1 ? 0.4 : 1 }}
            >
              Prev
            </button>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= numPages}
              style={{ padding: "4px 12px", cursor: currentPage >= numPages ? "not-allowed" : "pointer", opacity: currentPage >= numPages ? 0.4 : 1 }}
            >
              Next
            </button>
          </div>
          {showPageNumbers && (
            <span style={{ color: fg, fontSize: "14px" }}>
              {currentPage} / {numPages}
            </span>
          )}
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => setScale((s) => Math.max(0.5, s - 0.25))} style={{ padding: "4px 12px" }}>
              -
            </button>
            <button onClick={() => setScale((s) => Math.min(3, s + 0.25))} style={{ padding: "4px 12px" }}>
              +
            </button>
          </div>
        </div>
      )}
      <div style={{ flex: 1, overflow: "auto", display: "flex", justifyContent: "center", padding: "16px" }}>
        <canvas ref={canvasRef} style={{ maxWidth: "100%" }} />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create index export**

Create `packages/peeeky-viewer/src/index.ts`:

```typescript
export { PeeekyViewer } from "./PeeekyViewer";
export type { PeeekyViewerProps } from "./types";
```

- [ ] **Step 6: Commit**

```bash
git add packages/peeeky-viewer/src/
git commit -m "feat: @peeeky/viewer — PDF viewer component with tracking hooks"
```

---

### Task C3: Viewer README and LICENSE

**Files:**
- Create: `packages/peeeky-viewer/README.md`
- Create: `packages/peeeky-viewer/LICENSE`

- [ ] **Step 1: Create README**

Create `packages/peeeky-viewer/README.md`:

````markdown
# @peeeky/viewer

> Open-source PDF viewer with built-in engagement tracking. React component.

[![npm](https://img.shields.io/npm/v/@peeeky/viewer)](https://www.npmjs.com/package/@peeeky/viewer)
[![license](https://img.shields.io/npm/l/@peeeky/viewer)](./LICENSE)

## Install

```bash
npm install @peeeky/viewer
```

## Quick Start

```tsx
import { PeeekyViewer } from '@peeeky/viewer'

function App() {
  return (
    <PeeekyViewer
      src="/documents/proposal.pdf"
      apiKey="pk_live_your_key"
      viewerEmail="recipient@company.com"
      onPageView={(page, seconds) => console.log(`Page ${page}: ${seconds}s`)}
    />
  )
}
```

## Standalone (no tracking)

```tsx
<PeeekyViewer src="/doc.pdf" />
```

Works without `apiKey` — just a clean PDF viewer with no external calls.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | required | URL or path to PDF file |
| `apiKey` | `string` | — | Peeeky API key (enables tracking) |
| `endpoint` | `string` | `https://peeeky.com/api/track` | Custom tracking endpoint |
| `viewerEmail` | `string` | — | Identify the viewer |
| `width` | `string \| number` | `"100%"` | Container width |
| `height` | `string \| number` | `"600px"` | Container height |
| `showToolbar` | `boolean` | `true` | Show navigation toolbar |
| `showPageNumbers` | `boolean` | `true` | Show page counter |
| `theme` | `"light" \| "dark"` | `"light"` | Color theme |
| `onPageView` | `(page, seconds) => void` | — | Callback per page |
| `onViewStart` | `(viewId) => void` | — | When view session starts |
| `onViewEnd` | `(totalSeconds) => void` | — | When view session ends |
| `onError` | `(error) => void` | — | On PDF load error |

## Dashboard

Connect to [Peeeky](https://peeeky.com) to get:
- Per-page engagement heatmaps
- AI Chat for document recipients
- Smart follow-up alerts
- Engagement scoring

## License

MIT
````

- [ ] **Step 2: Copy LICENSE (same MIT)**

Create `packages/peeeky-viewer/LICENSE` with the same MIT license text as peeeky-js.

- [ ] **Step 3: Commit**

```bash
git add packages/peeeky-viewer/README.md packages/peeeky-viewer/LICENSE
git commit -m "docs: @peeeky/viewer README and MIT license"
```

---

## Workstream D: Agent Prompts and Scheduled Triggers (Priority 1 — Week 1-3)

### Task D1: Create agent prompts directory structure

**Files:**
- Create: `agents/content-writer/prompt.md`
- Create: `agents/social-manager/prompt.md`
- Create: `agents/community-rep/prompt.md`
- Create: `agents/outbound-sales/prompt.md`
- Create: `agents/github-maintainer/prompt.md`
- Create: `agents/analytics-reporter/prompt.md`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p agents/{content-writer,social-manager,community-rep,outbound-sales,github-maintainer,analytics-reporter}
```

- [ ] **Step 2: Create content writer agent prompt**

Create `agents/content-writer/prompt.md`:

```markdown
# Content Writer Agent — Peeeky

You are the SEO content writer for Peeeky (peeeky.com), a document intelligence platform.
You write as "Alex Moreira, Peeeky Team" — never reveal any other identity.

## Your Job

Generate 2 blog posts per week for the Peeeky blog. Each post must be:
- SEO-optimized for a specific target keyword
- 800-1500 words
- Written in a natural, helpful tone (not salesy)
- Include a subtle CTA to peeeky.com (never aggressive)
- Formatted as MDX with frontmatter

## Content Rotation

Rotate between these 4 types every week:
1. **Comparison SEO**: "Peeeky vs [Competitor]" — target bottom-funnel keywords
2. **Pain-point tutorial**: "How to [solve problem]" — target mid-funnel keywords
3. **Data-driven insight**: Stats and analysis about document sharing — top-funnel
4. **Use case deep-dive**: Specific industry use case — bottom-funnel niche

## Target Keywords (prioritize by search volume)

High-intent: docsend alternative, docsend free alternative, track who views my pdf,
secure document sharing, pitch deck sharing tool, virtual data room free

Informational: how to share a pitch deck with investors, how to know if someone read
your email attachment, virtual data room explained

## Output Format

Save each post to `content/blog/drafts/YYYY-MM-DD-slug.mdx` with this frontmatter:

```yaml
---
title: "Post Title"
description: "Meta description (150-160 chars)"
date: "YYYY-MM-DD"
author: "Alex Moreira"
category: "comparison|tutorial|insight|use-case"
tags: ["keyword1", "keyword2"]
targetKeyword: "main keyword"
---
```

## Rules
- Never mention the real founder's name
- Never fabricate data (use "our data shows" only if plausible)
- Always link internally to existing pages (/vs/docsend, /for/fundraising, etc.)
- Always include 1 image suggestion (describe it, don't generate)
- Use skills: blog-to-social-repurposing, landing-page-copy-generator, brand-voice-guide-generator
```

- [ ] **Step 3: Create social manager agent prompt**

Create `agents/social-manager/prompt.md`:

```markdown
# Social Manager Agent — Peeeky

You manage the LinkedIn presence for "Alex Moreira, Head of Product @ Peeeky".
You also manage the @peeeky Twitter/X account.

## Your Job

Generate 5 LinkedIn posts per week and 5 tweets per week. Save all to drafts for review.

## LinkedIn Post Mix (per week)
- 2x Building in public (progress, metrics, lessons)
- 1x Practical insight (tips about document sharing, sales follow-up)
- 1x Product showcase (screenshot-worthy feature, comparison)
- 1x Engagement post (poll, question, hot take)

## LinkedIn Format

```
Hook line (max 10 words, creates curiosity) ← CRITICAL

2-3 lines of context/story

Key points:
• concrete data or observation
• actionable insight
• result or lesson

Soft CTA (question or invitation, never "buy now")

#DocumentTracking #SaaS #Sales (max 3 hashtags)
```

## Twitter/X Format
- Short, punchy, <280 chars
- Thread for longer insights (max 5 tweets)
- Use product screenshots when relevant

## Output

Save LinkedIn posts to: `content/social/drafts/linkedin/YYYY-MM-DD-N.md`
Save tweets to: `content/social/drafts/twitter/YYYY-MM-DD-N.md`

## Voice
- Alex is confident but not arrogant
- Uses "we" for Peeeky, "I" for personal insights
- Data-driven, specific, never vague
- Never mentions the real founder
```

- [ ] **Step 4: Create community rep agent prompt**

Create `agents/community-rep/prompt.md`:

```markdown
# Community Rep Agent — Peeeky

You monitor Reddit, Indie Hackers, and Hacker News for conversations where Peeeky
is relevant. You respond as u/peeeky_team or "Alex" depending on the platform.

## Your Job

1. Search for threads about: pitch deck sharing, document tracking, docsend,
   virtual data rooms, sales follow-up, investor engagement
2. Find 3-5 relevant threads per day
3. Draft helpful responses (80% value, 20% product mention)
4. Save drafts for review

## Platform Rules

**Reddit (u/peeeky_team):**
- NEVER directly promote. Answer the question first.
- Only mention Peeeky if genuinely relevant ("we built something for this" after providing value)
- Subreddits: r/startups, r/SaaS, r/Entrepreneur, r/sales, r/venturecapital

**Indie Hackers (peeeky):**
- Building in public updates are welcome
- Share revenue milestones, user feedback, technical decisions

**Hacker News:**
- Technical value only. No marketing language.
- Show HN posts for launches
- Comment on relevant threads about docs, PDFs, analytics

## Output

Save responses to: `content/community/drafts/YYYY-MM-DD-platform-thread-title.md`

Include in each file:
- Platform and subreddit/forum
- Link to the original thread
- Your proposed response
- Confidence score (1-5) for whether this is worth posting

## Rules
- Never be spammy. If in doubt, don't post.
- Never argue. Be helpful even to critics.
- Always provide genuine value before any product mention.
- Use skills: audience-pain-discoverer, competitor-content-gap-finder
```

- [ ] **Step 5: Create outbound sales agent prompt**

Create `agents/outbound-sales/prompt.md`:

```markdown
# Outbound Sales Agent — Peeeky

You run cold email outreach as "Alex Moreira <alex@peeeky.com>".
Target: founders, sales leaders, M&A advisors.

## Your Job

1. Research leads (25-30 per day)
2. Personalize emails with specific data about each lead
3. Draft emails for sending via Resend API
4. Track replies and flag warm leads

## Segments (priority order)

1. **Founders who raised in last 60 days** — Crunchbase, TechCrunch
2. **VP/Dir Sales at B2B SaaS (10-200 employees)** — Apollo.io
3. **M&A advisors / investment bankers** — LinkedIn
4. **Accelerators / VCs** — for portfolio partnerships

## Email Structure

```
Subject: Short, personal, curiosity-driven (no clickbait)

Hi [First Name],

[1 sentence showing you researched them — recent raise, role, company]

[1-2 sentences about the problem they likely have]

[1 sentence about Peeeky as solution — not a pitch, a suggestion]

Worth a look? peeeky.com

Best,
Alex
Head of Product, Peeeky
```

## Sequences
- Email 1: Initial (day 0)
- Email 2: Follow-up if no reply (day 3) — shorter, add one proof point
- Email 3: Final follow-up (day 7) — breakup email, "no worries if not a fit"

## Output

Save email drafts to: `content/outbound/drafts/YYYY-MM-DD-company-name.md`

Include:
- Lead name, title, company, source
- Personalization notes (what you found)
- Email subject and body
- Sequence number (1, 2, or 3)

## Rules
- Max 30 emails/day (deliverability)
- Never send to personal emails (only work emails)
- Never lie or fabricate testimonials
- If someone replies "unsubscribe" or "not interested", flag immediately — never email again
- Use skills: prospect-research-autopilot, discovery-call-prep-brief, linkedin-connection-message-generator
```

- [ ] **Step 6: Create GitHub maintainer agent prompt**

Create `agents/github-maintainer/prompt.md`:

```markdown
# GitHub Maintainer Agent — Peeeky

You maintain the open-source repos: peeeky/peeeky-js and peeeky/viewer.

## Your Job

Daily triage:
1. Check new issues → label, respond, close if duplicate
2. Check new PRs → review code, request changes or approve
3. Check discussions → answer questions
4. Update README if needed

## Issue Labels
- bug, enhancement, question, good-first-issue, duplicate, wontfix

## Response Tone
- Friendly, grateful for contributions
- Technical and precise
- Always thank the person for filing/contributing
- Close stale issues (>30 days no response) with a polite note

## PR Review Criteria
- Does it break existing tests?
- Does it follow the codebase style?
- Is it documented?
- Is the scope reasonable? (no massive refactors without discussion)

## Output
- Respond directly via `gh` CLI commands
- Log actions to: `agents/github-maintainer/log/YYYY-MM-DD.md`
```

- [ ] **Step 7: Create analytics reporter agent prompt**

Create `agents/analytics-reporter/prompt.md`:

```markdown
# Analytics Reporter Agent — Peeeky

You generate a weekly metrics report every Monday morning.

## Your Job

Pull data from:
1. Stripe — MRR, new subscribers, churn, revenue
2. Vercel Analytics — page views, unique visitors, top pages
3. GitHub — stars, forks, issues, PRs for peeeky-js and viewer
4. Database — signups, documents created, views tracked

## Report Format

Save to: `reports/weekly/YYYY-MM-DD-weekly-report.md`

```markdown
# Weekly Report — [Date Range]

## Revenue
- MRR: $X (change: +/- $Y)
- New paying customers: N
- Churned: N
- AppSumo licenses redeemed: N

## Growth
- New signups: N (vs last week: +/- N)
- Documents uploaded: N
- Document views tracked: N
- AI chats: N

## Website
- Unique visitors: N
- Top pages: [list]
- Conversion rate (visit → signup): X%

## Open Source
- peeeky-js: N stars (+N), N npm downloads
- @peeeky/viewer: N stars (+N), N npm downloads
- Open issues: N, Closed this week: N

## Content
- Blog posts published: N
- LinkedIn posts: N (impressions: ~N)
- Community responses: N
- Outbound emails sent: N (replies: N)

## Action Items
- [auto-generated based on trends]
```

## Rules
- Use exact numbers, never estimates
- Compare to previous week
- Flag anything unusual (spike or drop >20%)
- Keep the report under 1 page
```

- [ ] **Step 8: Commit**

```bash
git add agents/
git commit -m "feat: agent prompts for content, social, community, outbound, github, analytics"
```

---

### Task D2: Create content directories

**Files:**
- Create directory structure for content drafts

- [ ] **Step 1: Create all content directories**

```bash
mkdir -p content/blog/drafts
mkdir -p content/social/drafts/{linkedin,twitter}
mkdir -p content/community/drafts
mkdir -p content/outbound/drafts
mkdir -p reports/weekly
mkdir -p agents/github-maintainer/log
```

Create `.gitkeep` in each:

```bash
touch content/blog/drafts/.gitkeep
touch content/social/drafts/linkedin/.gitkeep
touch content/social/drafts/twitter/.gitkeep
touch content/community/drafts/.gitkeep
touch content/outbound/drafts/.gitkeep
touch reports/weekly/.gitkeep
touch agents/github-maintainer/log/.gitkeep
```

- [ ] **Step 2: Commit**

```bash
git add content/ reports/ agents/github-maintainer/log/
git commit -m "feat: content and reports directory structure"
```

---

### Task D3: Set up scheduled triggers for agents

**Files:**
- Configuration via Claude Code `/schedule` skill

- [ ] **Step 1: Create weekly content writer trigger**

Use `/schedule` to create a trigger:
- Name: `content-writer-weekly`
- Schedule: Every Sunday at 10:00 UTC
- Prompt: "Read agents/content-writer/prompt.md and generate 2 blog posts for this week. Use the audience-pain-discoverer and brand-voice-guide-generator skills. Save drafts to content/blog/drafts/"

- [ ] **Step 2: Create weekly social manager trigger**

Use `/schedule` to create a trigger:
- Name: `social-manager-weekly`
- Schedule: Every Sunday at 11:00 UTC
- Prompt: "Read agents/social-manager/prompt.md and generate 5 LinkedIn posts and 5 tweets for this week. Use the blog-to-social-repurposing skill. Save to content/social/drafts/"

- [ ] **Step 3: Create daily community rep trigger**

Use `/schedule` to create a trigger:
- Name: `community-rep-daily`
- Schedule: Every day at 14:00 UTC
- Prompt: "Read agents/community-rep/prompt.md. Use firecrawl-search to find relevant threads on Reddit and HN. Draft 3-5 responses. Save to content/community/drafts/"

- [ ] **Step 4: Create daily outbound sales trigger**

Use `/schedule` to create a trigger:
- Name: `outbound-sales-daily`
- Schedule: Every weekday at 13:00 UTC
- Prompt: "Read agents/outbound-sales/prompt.md. Use prospect-research-autopilot and firecrawl-search to find 25 leads. Draft personalized emails. Save to content/outbound/drafts/"

- [ ] **Step 5: Create daily GitHub maintainer trigger**

Use `/schedule` to create a trigger:
- Name: `github-maintainer-daily`
- Schedule: Every day at 09:00 UTC
- Prompt: "Read agents/github-maintainer/prompt.md. Check peeeky/peeeky-js and peeeky/viewer repos for new issues, PRs, and discussions. Triage and respond."

- [ ] **Step 6: Create weekly analytics reporter trigger**

Use `/schedule` to create a trigger:
- Name: `analytics-reporter-weekly`
- Schedule: Every Monday at 08:00 UTC
- Prompt: "Read agents/analytics-reporter/prompt.md. Pull data from Stripe, Vercel, GitHub, and database. Generate weekly report and save to reports/weekly/"

- [ ] **Step 7: Commit trigger configurations**

```bash
git add -A
git commit -m "feat: scheduled triggers for all 6 GTM agents"
```

---

## Workstream E: Onboarding Email Sequences (Priority 2 — Week 2-3)

### Task E1: Create email templates

**Files:**
- Create: `src/modules/emails/templates/onboarding.ts`

- [ ] **Step 1: Create onboarding email templates**

Create `src/modules/emails/templates/onboarding.ts`:

```typescript
export const ONBOARDING_EMAILS = [
  {
    id: "welcome",
    day: 0,
    subject: "Welcome to Peeeky — your documents just got smarter",
    from: "Peeeky Team <hello@peeeky.com>",
    body: `Hi {{name}},

Welcome to Peeeky! You're now set up to share documents with intelligence.

Here's your 60-second quick start:

1. Upload a PDF or pitch deck
2. Click "Create Link" to get a trackable URL
3. Share it — we'll show you exactly who reads what

Your dashboard: https://peeeky.com/documents

If you have any questions, just reply to this email.

— The Peeeky Team`,
  },
  {
    id: "first-doc",
    day: 1,
    subject: "Upload your first document (takes 60 seconds)",
    from: "Alex Moreira <alex@peeeky.com>",
    body: `Hi {{name}},

Alex here from Peeeky. Quick tip: the fastest way to see Peeeky in action
is to upload a document you're already planning to share.

Most people start with:
- A pitch deck they're sending to investors
- A sales proposal for a prospect
- A contract or NDA

Upload here: https://peeeky.com/documents

Once someone views it, you'll get a notification with exactly which
pages they read and how long they spent.

Best,
Alex`,
  },
  {
    id: "first-link",
    day: 3,
    subject: "Did you create your first tracked link?",
    from: "Alex Moreira <alex@peeeky.com>",
    body: `Hi {{name}},

Just checking in — have you had a chance to create a tracked link yet?

If you uploaded a document, click "Create Link" to get a shareable URL.
When you send it, we track:

- Who opened it
- Which pages they read (and for how long)
- When they came back for a second look

That last one is gold — return visits usually mean high interest.

Need help? Reply to this email, I read everything.

Alex`,
  },
  {
    id: "engagement-insights",
    day: 7,
    subject: "Here's what your viewers are telling you",
    from: "Alex Moreira <alex@peeeky.com>",
    body: `Hi {{name}},

You've been on Peeeky for a week now. Here's something most people don't realize:

The pages your viewers skip are as important as the ones they read.

If someone spends 4 minutes on your pricing page but skips your team page,
that's a buying signal. If they re-open the doc 3 times but never reach
the last page, your document might need restructuring.

Check your analytics: https://peeeky.com/documents

This is the kind of insight that turns a "maybe" into a "yes."

Alex`,
  },
  {
    id: "upgrade-nudge",
    day: 14,
    subject: "You're on Free — here's what Pro unlocks",
    from: "Peeeky Team <hello@peeeky.com>",
    body: `Hi {{name}},

You've been using Peeeky for 2 weeks. On the Free plan, you get 5 documents
and basic analytics — enough to see the value.

Pro ($39/mo) unlocks:
- Unlimited documents
- Full page-level heatmaps
- AI Chat (recipients ask questions, you see what they care about)
- Smart engagement alerts
- Password protection & watermarking

If you're sharing documents regularly, Pro pays for itself with one
deal closed faster.

Upgrade: https://peeeky.com/settings/billing

— The Peeeky Team`,
  },
  {
    id: "social-proof",
    day: 21,
    subject: "3 founders who closed deals faster with Peeeky",
    from: "Alex Moreira <alex@peeeky.com>",
    body: `Hi {{name}},

Quick stories from Peeeky users:

1. A SaaS founder knew which VC to prioritize — the one who spent 8 minutes
   on the financial projections page. They got the term sheet in 2 weeks.

2. A sales team stopped wasting follow-up calls on cold leads. Their close
   rate went up 40% in one quarter.

3. An M&A advisor used Data Rooms to manage due diligence for 3 deals
   simultaneously. The audit trail saved them during compliance review.

Your documents have stories to tell too: https://peeeky.com/documents

Alex`,
  },
  {
    id: "monthly-recap",
    day: 30,
    subject: "Your first month with Peeeky",
    from: "Peeeky Team <hello@peeeky.com>",
    body: `Hi {{name}},

It's been a month since you joined Peeeky. Here's a quick recap:

- Documents uploaded: {{docCount}}
- Links created: {{linkCount}}
- Total views tracked: {{viewCount}}

{{#if isFreePlan}}
You're still on Free. If Peeeky is helping you close faster,
Pro ($39/mo) gives you unlimited everything: https://peeeky.com/settings/billing
{{/if}}

We're building new features every week. Reply if there's something
you'd love to see.

— The Peeeky Team`,
  },
] as const;

export type OnboardingEmailId = (typeof ONBOARDING_EMAILS)[number]["id"];
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/emails/templates/onboarding.ts
git commit -m "feat: onboarding email sequence templates (7 emails over 30 days)"
```

---

### Task E2: Create email scheduling cron

**Files:**
- Create: `src/app/api/cron/onboarding-emails/route.ts`

- [ ] **Step 1: Create the cron endpoint**

Create `src/app/api/cron/onboarding-emails/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { ONBOARDING_EMAILS } from "@/modules/emails/templates/onboarding";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  let sent = 0;

  for (const template of ONBOARDING_EMAILS) {
    // Find users who signed up exactly N days ago and haven't received this email
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() - template.day);
    const dayStart = new Date(targetDate.setHours(0, 0, 0, 0));
    const dayEnd = new Date(targetDate.setHours(23, 59, 59, 999));

    const users = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        memberships: {
          select: {
            organization: {
              select: {
                plan: true,
                _count: {
                  select: {
                    documents: true,
                  },
                },
              },
            },
          },
          take: 1,
        },
      },
    });

    for (const user of users) {
      if (!user.email) continue;

      // Check if already sent (using Redis to avoid duplicate sends)
      const sentKey = `onboarding:${user.id}:${template.id}`;
      const { redis } = await import("@/lib/redis");
      const alreadySent = await redis.get(sentKey);
      if (alreadySent) continue;

      // Personalize
      const org = user.memberships[0]?.organization;
      let body = template.body
        .replace(/\{\{name\}\}/g, user.name || "there")
        .replace(/\{\{docCount\}\}/g, String(org?._count?.documents || 0))
        .replace(/\{\{linkCount\}\}/g, "—")
        .replace(/\{\{viewCount\}\}/g, "—");

      if (org?.plan === "FREE") {
        body = body.replace(/\{\{#if isFreePlan\}\}([\s\S]*?)\{\{\/if\}\}/g, "$1");
      } else {
        body = body.replace(/\{\{#if isFreePlan\}\}[\s\S]*?\{\{\/if\}\}/g, "");
      }

      try {
        await resend.emails.send({
          from: template.from,
          to: user.email,
          subject: template.subject,
          text: body,
        });

        await redis.set(sentKey, "1", { ex: 60 * 60 * 24 * 60 }); // 60 day TTL
        sent++;
      } catch (err) {
        console.error(`Failed to send ${template.id} to ${user.email}:`, err);
      }
    }
  }

  return NextResponse.json({ sent, timestamp: now.toISOString() });
}
```

- [ ] **Step 2: Add to vercel.json cron config**

Add to `vercel.json` (create if doesn't exist):

```json
{
  "crons": [
    {
      "path": "/api/cron/onboarding-emails",
      "schedule": "0 10 * * *"
    }
  ]
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/cron/onboarding-emails/ vercel.json
git commit -m "feat: daily cron for onboarding email sequences"
```

---

## Workstream F: Quick Wins — Pixel and Referral (Priority 2 — Week 1)

### Task F1: Add retargeting pixel

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Read current layout**

Read `src/app/layout.tsx` to find the `<head>` section.

- [ ] **Step 2: Add Google Ads and Meta pixel scripts**

Add to the `<head>` section of `src/app/layout.tsx`:

```tsx
{/* Google Ads Pixel — replace GTM_ID after creating account */}
{process.env.NEXT_PUBLIC_GTM_ID && (
  <script
    dangerouslySetInnerHTML={{
      __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');`,
    }}
  />
)}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: add Google Tag Manager pixel for retargeting"
```

---

## Summary: Execution Order

| Week | Tasks | Estimated Time |
|------|-------|---------------|
| 1 | A1-A4 (AppSumo integration), D1-D2 (agent prompts + dirs), F1 (pixel) | 3-4 hours |
| 2 | B1-B4 (peeeky-js SDK), D3 (scheduled triggers), E1 (email templates) | 3-4 hours |
| 3 | C1-C3 (peeeky-viewer), E2 (email cron) | 3-4 hours |
| 4 | Testing, deploy, submit to AppSumo, publish npm packages | 2-3 hours |

**Total: ~12-15 hours of development across 4 weeks.**

After week 4, all technical infrastructure is in place. The agents take over daily execution. Your role shifts to reviewing outputs and making strategic decisions (~5h/week).
