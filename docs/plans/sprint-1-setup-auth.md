# Sprint 1: Project Setup, Database & Auth — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the Peeeky Next.js app with working auth (Google + magic link), multi-tenant database, and protected dashboard routes.

**Architecture:** Next.js 15 App Router with Prisma 6 on Supabase (PostgreSQL). NextAuth v5 with JWT strategy. Multi-tenant via Organization model — on signup, auto-create org + membership. Upstash Redis for caching. All tenant-scoped queries filter by orgId.

**Tech Stack:** Next.js 15, TypeScript (strict), Tailwind CSS 4, Prisma 6, NextAuth v5, Supabase, Upstash Redis, Resend, Zod

---

## File Map

```
MicroSaaS/                          (project root — already exists)
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (fonts, metadata)
│   │   ├── page.tsx                # Redirect to /documents or /login
│   │   ├── (auth)/
│   │   │   ├── layout.tsx          # Auth layout (centered card)
│   │   │   └── login/
│   │   │       └── page.tsx        # Login page (Google + email)
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx          # Dashboard layout (sidebar + header)
│   │   │   └── documents/
│   │   │       └── page.tsx        # Documents list (placeholder)
│   │   └── api/
│   │       └── auth/
│   │           └── [...nextauth]/
│   │               └── route.ts    # NextAuth API handler
│   ├── modules/
│   │   └── auth/
│   │       ├── auth.config.ts      # NextAuth config (providers, callbacks)
│   │       └── auth.ts             # Auth helpers (getSession, etc.)
│   ├── lib/
│   │   ├── prisma.ts               # Prisma singleton
│   │   ├── redis.ts                # Upstash Redis client
│   │   └── tenant.ts               # Tenant context (orgId from session)
│   ├── config/
│   │   └── plans.ts                # Plan limits
│   └── middleware.ts               # Auth middleware (protect dashboard)
├── prisma/
│   ├── schema.prisma               # Full data model
│   └── seed.ts                     # Seed script
├── .env.example                    # All env vars documented
├── .env.local                      # Actual env vars (gitignored)
├── next.config.ts                  # Next.js config
├── tailwind.config.ts              # Tailwind with brand tokens
├── tsconfig.json                   # Strict mode
└── package.json
```

---

## Task 1: Scaffold Next.js Project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`

- [ ] **Step 1: Create Next.js app at project root**

Run from the MicroSaaS directory. Since we already have files (docs, landing, README), we'll init Next.js in-place:

```bash
cd "C:/Users/guilh/OneDrive/Área de Trabalho/claude/projetos/MicroSaaS"
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*" --no-eslint --turbopack
```

If it complains about existing files, answer Yes to continue. The `docs/` and `landing/` folders will be preserved.

- [ ] **Step 2: Verify app runs**

```bash
npm run dev
```

Expected: Next.js dev server at http://localhost:3000 with default page.

- [ ] **Step 3: Enable TypeScript strict mode**

In `tsconfig.json`, ensure:
```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

- [ ] **Step 4: Install all Sprint 1 dependencies**

```bash
npm install @prisma/client @auth/prisma-adapter next-auth@5 @upstash/redis @upstash/ratelimit zod nanoid bcryptjs resend
npm install -D prisma @types/bcryptjs
```

- [ ] **Step 5: Configure Tailwind with brand tokens**

Replace `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1A1A2E",
          accent: "#6C5CE7",
          light: "#F8F9FC",
        },
        success: "#00B894",
        warning: "#FDCB6E",
        danger: "#E17055",
        info: "#74B9FF",
      },
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
        display: ["Outfit", ...defaultTheme.fontFamily.sans],
        mono: ["JetBrains Mono", ...defaultTheme.fontFamily.mono],
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 6: Update root layout with fonts and metadata**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Peeeky — Share documents. Know who reads them.",
  description:
    "Secure document sharing with page-level analytics and AI intelligence.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 7: Create `.env.example`**

```env
# Database (Supabase)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Email (Resend)
RESEND_API_KEY=""

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

- [ ] **Step 8: Add `.env.local` to `.gitignore`**

Verify `.gitignore` includes:
```
.env.local
.env*.local
```

- [ ] **Step 9: Create folder structure**

```bash
mkdir -p src/app/\(auth\)/login
mkdir -p src/app/\(dashboard\)/documents
mkdir -p src/app/api/auth/\[...nextauth\]
mkdir -p src/modules/auth
mkdir -p src/modules/orgs
mkdir -p src/modules/documents
mkdir -p src/modules/links
mkdir -p src/modules/tracking
mkdir -p src/modules/ai
mkdir -p src/modules/billing
mkdir -p src/modules/notifications
mkdir -p src/modules/domains
mkdir -p src/modules/audit
mkdir -p src/jobs
mkdir -p src/lib
mkdir -p src/config
mkdir -p src/components/ui
mkdir -p src/components/dashboard
mkdir -p src/components/viewer
mkdir -p src/components/analytics
mkdir -p prisma
```

- [ ] **Step 10: Verify dev server still works**

```bash
npm run dev
```

Expected: No errors, app loads at localhost:3000.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js 15 app with Tailwind, TypeScript strict, folder structure"
git push
```

---

## Task 2: Prisma Schema & Database

**Files:**
- Create: `prisma/schema.prisma`, `src/lib/prisma.ts`

- [ ] **Step 1: Create Prisma schema**

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [vector]
}

// ─── Multi-Tenancy ──────────────────────────────────────

model Organization {
  id               String    @id @default(cuid())
  name             String
  slug             String    @unique
  plan             Plan      @default(FREE)
  stripeCustomerId String?   @unique
  stripeSubId      String?   @unique
  logoUrl          String?
  brandColor       String?   @default("#000000")
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  members   Membership[]
  documents Document[]
  domains   CustomDomain[]
  audits    AuditEvent[]
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  memberships Membership[]
  accounts    Account[]
  sessions    Session[]
}

model Membership {
  id        String   @id @default(cuid())
  userId    String
  orgId     String
  role      Role     @default(MEMBER)
  createdAt DateTime @default(now())

  user User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  org  Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)

  @@unique([userId, orgId])
  @@index([orgId])
}

// ─── Core Models ────────────────────────────────────────

model Document {
  id          String       @id @default(cuid())
  name        String
  description String?
  fileUrl     String
  fileType    FileType     @default(PDF)
  status      DocStatus    @default(PROCESSING)
  pageCount   Int          @default(0)
  totalViews  Int          @default(0)
  orgId       String
  createdById String
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  org        Organization       @relation(fields: [orgId], references: [id], onDelete: Cascade)
  links      Link[]
  embeddings DocumentEmbedding[]

  @@index([orgId])
}

model Link {
  id              String    @id @default(cuid())
  slug            String    @unique
  documentId      String
  name            String?
  password        String?
  requireEmail    Boolean   @default(false)
  allowDownload   Boolean   @default(false)
  enableWatermark Boolean   @default(false)
  enableAIChat    Boolean   @default(false)
  expiresAt       DateTime?
  maxViews        Int?
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  document Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  views    View[]
}

model View {
  id             String   @id @default(cuid())
  linkId         String
  viewerEmail    String?
  viewerName     String?
  device         String?
  browser        String?
  os             String?
  country        String?
  city           String?
  ip             String?
  duration       Int      @default(0)
  completionRate Float    @default(0)
  createdAt      DateTime @default(now())

  link      Link       @relation(fields: [linkId], references: [id], onDelete: Cascade)
  pageViews PageView[]
}

model PageView {
  id         String   @id @default(cuid())
  viewId     String
  pageNumber Int
  duration   Int      @default(0)
  enteredAt  DateTime @default(now())

  view View @relation(fields: [viewId], references: [id], onDelete: Cascade)

  @@index([viewId, pageNumber])
}

model DocumentEmbedding {
  id         String                     @id @default(cuid())
  documentId String
  pageNumber Int
  chunk      String
  embedding  Unsupported("vector(1536)")
  createdAt  DateTime                   @default(now())

  document Document @relation(fields: [documentId], references: [id], onDelete: Cascade)

  @@index([documentId])
}

model CustomDomain {
  id        String   @id @default(cuid())
  domain    String   @unique
  verified  Boolean  @default(false)
  orgId     String
  createdAt DateTime @default(now())

  org Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
}

model AuditEvent {
  id           String   @id @default(cuid())
  orgId        String
  userId       String?
  action       String
  resourceType String
  resourceId   String
  metadata     Json?
  createdAt    DateTime @default(now())

  org Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)

  @@index([orgId, createdAt])
  @@index([orgId, resourceType, resourceId])
}

// ─── NextAuth Models ────────────────────────────────────

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

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ─── Enums ──────────────────────────────────────────────

enum Plan {
  FREE
  PRO
  BUSINESS
}

enum Role {
  OWNER
  ADMIN
  MEMBER
}

enum FileType {
  PDF
  PPTX
}

enum DocStatus {
  PROCESSING
  READY
  ERROR
}
```

- [ ] **Step 2: Set up DATABASE_URL in `.env.local`**

Create a Supabase project at https://supabase.com, then copy the connection string:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres"
```

- [ ] **Step 3: Push schema to database**

```bash
npx prisma db push
```

Expected: All tables created. Output shows "Your database is now in sync with your Prisma schema."

- [ ] **Step 4: Generate Prisma client**

```bash
npx prisma generate
```

Expected: "Prisma Client generated successfully"

- [ ] **Step 5: Create Prisma singleton**

Create `src/lib/prisma.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

- [ ] **Step 6: Verify Prisma connects**

```bash
npx prisma db seed --preview-feature || npx prisma studio
```

Open Prisma Studio — should connect and show empty tables.

- [ ] **Step 7: Commit**

```bash
git add prisma/schema.prisma src/lib/prisma.ts
git commit -m "feat: add Prisma schema with full multi-tenant data model"
git push
```

---

## Task 3: Redis & Config

**Files:**
- Create: `src/lib/redis.ts`, `src/config/plans.ts`

- [ ] **Step 1: Create Upstash Redis project**

Go to https://upstash.com, create a Redis database. Copy REST URL and token to `.env.local`:

```env
UPSTASH_REDIS_REST_URL="https://xxxxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxQ=="
```

- [ ] **Step 2: Create Redis client**

Create `src/lib/redis.ts`:

```typescript
import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
```

- [ ] **Step 3: Create plan limits config**

Create `src/config/plans.ts`:

```typescript
export const PLAN_LIMITS = {
  FREE: {
    documents: 5,
    linksPerDoc: 3,
    members: 1,
    aiChatsPerMonth: 0,
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
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/redis.ts src/config/plans.ts
git commit -m "feat: add Upstash Redis client and plan limits config"
git push
```

---

## Task 4: NextAuth Configuration

**Files:**
- Create: `src/modules/auth/auth.config.ts`, `src/modules/auth/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`

- [ ] **Step 1: Set up Google OAuth credentials**

1. Go to https://console.cloud.google.com → Create project "Peeeky"
2. Enable "Google Identity" API
3. Create OAuth 2.0 credentials:
   - Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID + Secret to `.env.local`:

```env
GOOGLE_CLIENT_ID="xxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxx"
```

- [ ] **Step 2: Set up Resend for magic link emails**

1. Go to https://resend.com, create account
2. Get API key → `.env.local`:

```env
RESEND_API_KEY="re_xxxx"
```

- [ ] **Step 3: Generate NEXTAUTH_SECRET**

```bash
openssl rand -base64 32
```

Copy output to `.env.local` as `NEXTAUTH_SECRET`.

- [ ] **Step 4: Create auth config**

Create `src/modules/auth/auth.config.ts`:

```typescript
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY!,
      from: "Peeeky <noreply@peeeky.com>",
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      // Check if user already has an org
      const existing = await prisma.membership.findFirst({
        where: { user: { email: user.email } },
      });

      if (!existing && user.id) {
        // First login — create org + membership
        const slug = nanoid(8);
        const orgName = user.name
          ? `${user.name}'s Workspace`
          : "My Workspace";

        await prisma.organization.create({
          data: {
            name: orgName,
            slug,
            members: {
              create: {
                userId: user.id,
                role: "OWNER",
              },
            },
          },
        });
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id;

        // Get first org membership
        const membership = await prisma.membership.findFirst({
          where: { userId: user.id },
          include: { org: true },
          orderBy: { createdAt: "asc" },
        });

        if (membership) {
          token.orgId = membership.orgId;
          token.orgSlug = membership.org.slug;
          token.role = membership.role;
          token.plan = membership.org.plan;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.orgId = token.orgId as string;
        session.user.orgSlug = token.orgSlug as string;
        session.user.role = token.role as string;
        session.user.plan = token.plan as string;
      }
      return session;
    },
  },
};
```

- [ ] **Step 5: Create auth helpers**

Create `src/modules/auth/auth.ts`:

```typescript
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authConfig);

export async function getSession() {
  return await auth();
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireOrgId() {
  const session = await requireAuth();
  const orgId = session.user.orgId;
  if (!orgId) {
    throw new Error("No organization found");
  }
  return { session, orgId };
}
```

- [ ] **Step 6: Extend NextAuth types**

Create `src/types/next-auth.d.ts`:

```typescript
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      orgId: string;
      orgSlug: string;
      role: string;
      plan: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    orgId: string;
    orgSlug: string;
    role: string;
    plan: string;
  }
}
```

- [ ] **Step 7: Create NextAuth API route**

Create `src/app/api/auth/[...nextauth]/route.ts`:

```typescript
export { GET, POST } from "@/modules/auth/auth";
```

- [ ] **Step 8: Commit**

```bash
git add src/modules/auth/ src/app/api/auth/ src/types/
git commit -m "feat: configure NextAuth v5 with Google + Resend + auto org creation"
git push
```

---

## Task 5: Tenant Context Helper

**Files:**
- Create: `src/lib/tenant.ts`

- [ ] **Step 1: Create tenant context helper**

Create `src/lib/tenant.ts`:

```typescript
import { auth } from "@/modules/auth/auth";
import { redirect } from "next/navigation";

export async function getTenantContext() {
  const session = await auth();

  if (!session?.user?.orgId) {
    redirect("/login");
  }

  return {
    userId: session.user.id,
    orgId: session.user.orgId,
    role: session.user.role,
    plan: session.user.plan,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/tenant.ts
git commit -m "feat: add tenant context helper for multi-tenant queries"
git push
```

---

## Task 6: Auth Middleware

**Files:**
- Create: `src/middleware.ts`

- [ ] **Step 1: Create middleware to protect dashboard routes**

Create `src/middleware.ts`:

```typescript
import { auth } from "@/modules/auth/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Public routes — no auth needed
  const publicPaths = ["/login", "/api/auth", "/view"];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Dashboard routes — require auth
  if (!req.auth?.user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
```

- [ ] **Step 2: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: add auth middleware — protect dashboard, allow public routes"
git push
```

---

## Task 7: Login Page

**Files:**
- Create: `src/app/(auth)/layout.tsx`, `src/app/(auth)/login/page.tsx`

- [ ] **Step 1: Create auth layout**

Create `src/app/(auth)/layout.tsx`:

```tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand px-4">
      <div className="w-full max-w-[400px]">{children}</div>
    </div>
  );
}
```

- [ ] **Step 2: Create login page**

Create `src/app/(auth)/login/page.tsx`:

```tsx
import { signIn } from "@/modules/auth/auth";

export default function LoginPage() {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-xl">
      <div className="mb-8 text-center">
        <h1 className="font-display text-2xl font-bold text-brand">
          p<span className="text-brand-accent">eee</span>ky
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Share documents. Know who reads them.
        </p>
      </div>

      {/* Google Sign In */}
      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/documents" });
        }}
      >
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-gray-400">or</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {/* Email Magic Link */}
      <form
        action={async (formData: FormData) => {
          "use server";
          const email = formData.get("email") as string;
          await signIn("resend", { email, redirectTo: "/documents" });
        }}
      >
        <label
          htmlFor="email"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@company.com"
          className="mb-4 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20"
        />
        <button
          type="submit"
          className="w-full rounded-lg bg-brand-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-accent/90"
        >
          Send magic link
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-gray-400">
        By signing in, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Verify login page renders**

```bash
npm run dev
```

Navigate to http://localhost:3000/login. Expected: branded login card with Google button and email input.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(auth\)/
git commit -m "feat: add login page with Google OAuth + email magic link"
git push
```

---

## Task 8: Dashboard Layout & Placeholder

**Files:**
- Create: `src/app/(dashboard)/layout.tsx`, `src/app/(dashboard)/documents/page.tsx`, `src/app/page.tsx`

- [ ] **Step 1: Create dashboard layout with sidebar**

Create `src/app/(dashboard)/layout.tsx`:

```tsx
import { auth } from "@/modules/auth/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/modules/auth/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-brand-light">
      {/* Sidebar */}
      <aside className="flex w-60 flex-col border-r border-gray-200 bg-white">
        <div className="flex h-16 items-center px-6">
          <Link href="/documents" className="font-display text-xl font-bold text-brand">
            p<span className="text-brand-accent">eee</span>ky
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4">
          <Link
            href="/documents"
            className="flex items-center gap-3 rounded-lg bg-brand-accent/5 px-3 py-2 text-sm font-medium text-brand-accent"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Documents
          </Link>
        </nav>
        <div className="border-t border-gray-200 p-4">
          <div className="mb-3 text-sm">
            <p className="font-medium text-brand">{session.user.name || session.user.email}</p>
            <p className="text-xs text-gray-500">{session.user.plan} plan</p>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="text-xs font-medium text-gray-500 hover:text-brand"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
```

- [ ] **Step 2: Create documents placeholder page**

Create `src/app/(dashboard)/documents/page.tsx`:

```tsx
export default function DocumentsPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-brand">
          Documents
        </h1>
        <button className="rounded-lg bg-brand-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-accent/90">
          + Upload Document
        </button>
      </div>
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-20">
        <div className="mb-4 text-4xl">&#128196;</div>
        <h2 className="mb-2 font-display text-lg font-semibold text-brand">
          No documents yet
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          Upload your first document and start tracking who reads it.
        </p>
        <button className="rounded-lg bg-brand-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-accent/90">
          Upload Document
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Update root page to redirect**

Replace `src/app/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { auth } from "@/modules/auth/auth";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/documents");
  }

  redirect("/login");
}
```

- [ ] **Step 4: Verify full flow**

```bash
npm run dev
```

1. Go to http://localhost:3000 → should redirect to /login
2. Login page should render correctly
3. After Google OAuth login → should redirect to /documents
4. Should see dashboard with sidebar and empty state

- [ ] **Step 5: Commit**

```bash
git add src/app/
git commit -m "feat: add dashboard layout with sidebar and documents placeholder"
git push
```

---

## Task 9: Seed Script

**Files:**
- Create: `prisma/seed.ts`
- Modify: `package.json` (add prisma seed config)

- [ ] **Step 1: Create seed script**

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.membership.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  // Create test user
  const user = await prisma.user.create({
    data: {
      email: "test@peeeky.com",
      name: "Test User",
      emailVerified: new Date(),
    },
  });

  // Create test org
  const org = await prisma.organization.create({
    data: {
      name: "Test Workspace",
      slug: "test-workspace",
      plan: "PRO",
      members: {
        create: {
          userId: user.id,
          role: "OWNER",
        },
      },
    },
  });

  console.log(`Seeded: user=${user.id}, org=${org.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 2: Add seed config to package.json**

Add to `package.json`:

```json
{
  "prisma": {
    "seed": "npx tsx prisma/seed.ts"
  }
}
```

Install tsx:

```bash
npm install -D tsx
```

- [ ] **Step 3: Run seed**

```bash
npx prisma db seed
```

Expected: "Seeded: user=clxxx, org=clxxx"

- [ ] **Step 4: Commit**

```bash
git add prisma/seed.ts package.json
git commit -m "feat: add database seed script with test user and org"
git push
```

---

## Task 10: Final Verification & Cleanup

- [ ] **Step 1: Verify full auth flow end-to-end**

```bash
npm run dev
```

1. Open http://localhost:3000 → redirects to /login
2. Click "Continue with Google" → OAuth flow → redirects to /documents
3. Dashboard shows with sidebar (user name, plan)
4. Refresh → still authenticated (JWT persists)
5. Click "Sign out" → redirects to /login
6. Try accessing /documents directly → redirects to /login

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: No TypeScript errors. Build succeeds.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: Sprint 1 complete — scaffolding, database, auth, dashboard"
git push
```

---

## Summary

After completing all 10 tasks, Sprint 1 delivers:

| What | Status |
|---|---|
| Next.js 15 + TypeScript strict + Tailwind | Working |
| Prisma schema (all models, multi-tenant) | Deployed to Supabase |
| NextAuth v5 (Google + magic link) | Working |
| Auto org creation on signup | Working |
| JWT with orgId, role, plan | Working |
| Tenant context helper | Ready |
| Auth middleware (dashboard protected) | Working |
| Dashboard layout + sidebar | Working |
| Documents placeholder (empty state) | Working |
| Redis client | Ready |
| Plan limits config | Ready |
| Seed script | Working |
