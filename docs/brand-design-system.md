# Peeeky — Brand & Design System

> Visual identity, tone of voice, and UI design guidelines.

---

## 1. Brand Identity

### 1.1 Name & Domain

- **Name:** Peeeky
- **Domain:** peeeky.com
- **Pronunciation:** "peek-ee" (like "peeky" but with emphasis on the triple-e)
- **Why:** "Peek" = to look at something quickly, secretly. Perfect for document tracking. The triple "e" makes it memorable and ownable.

### 1.2 Tagline Options

| Context | Tagline |
|---|---|
| **Primary** | Share documents. Track every page. |
| **AI-focused** | The document link that watches back. |
| **Product Hunt** | Share documents. Track every page. Chat with AI. |
| **SEO** | Secure document sharing with page-level analytics. |

### 1.3 Brand Personality

| Trait | What it means | What it doesn't mean |
|---|---|---|
| **Sharp** | Precise, insightful, data-driven | Cold, clinical |
| **Confident** | Knows its value, direct communication | Arrogant, pushy |
| **Clean** | Minimal, uncluttered, focused | Boring, lifeless |
| **Approachable** | Easy to start, no enterprise gatekeeping | Childish, unserious |

### 1.4 Tone of Voice

**Writing principles:**
- Short sentences. Active voice. No jargon.
- Speak to one person, not "users" or "customers."
- Be specific: "Know who read page 7" beats "Get insights on document engagement."
- Confidence without hype: "Track every page" not "Revolutionary AI-powered document intelligence platform."

**Examples:**

| Context | Good | Bad |
|---|---|---|
| Feature description | "See who opened your deck and which pages got their attention." | "Leverage our cutting-edge analytics engine to drive actionable insights." |
| CTA | "Start tracking — it's free" | "Sign up for our free tier today!" |
| Error message | "This link has expired. Ask the sender for a new one." | "Error 410: Resource no longer available." |
| Upgrade prompt | "You've used all 5 documents. Upgrade for unlimited." | "You have exceeded your plan allocation. Please upgrade." |

---

## 2. Color System

### 2.1 Primary Palette

```
Brand Primary:    #1A1A2E    (Deep Navy)      — headers, primary text, sidebar
Brand Accent:     #6C5CE7    (Electric Purple) — CTAs, active states, links
Brand Light:      #F8F9FC    (Ghost White)     — page backgrounds
```

**Why purple?** Stands out in a market of blues (DocSend, Dropbox, Google). Purple signals intelligence, premium, and creativity — perfect for a document tracking + AI product.

### 2.2 Functional Colors

```
Success:          #00B894    (Mint Green)      — success states, high engagement
Warning:          #FDCB6E    (Warm Yellow)     — caution, mid engagement
Danger:           #E17055    (Coral Red)       — errors, low engagement, destructive actions
Info:             #74B9FF    (Sky Blue)        — informational, tips, badges
```

### 2.3 Neutral Scale

```
Gray 900:         #1A1A2E    (= Brand Primary)
Gray 800:         #2D2D44
Gray 700:         #4A4A68
Gray 600:         #6B6B8D
Gray 500:         #8E8EA8
Gray 400:         #B0B0C4
Gray 300:         #D1D1E0
Gray 200:         #E8E8F0
Gray 100:         #F4F4F8
Gray 50:          #F8F9FC    (= Brand Light)
```

### 2.4 Engagement Score Colors

```
High (70-100):    #00B894    (Mint Green)
Medium (30-69):   #FDCB6E    (Warm Yellow)
Low (0-29):       #E17055    (Coral Red)
```

### 2.5 Dark Mode (Future)

Not for MVP. When implemented:
```
Background:       #0F0F1A
Surface:          #1A1A2E
Text Primary:     #E8E8F0
Accent:           #A29BFE    (Lighter purple for dark bg)
```

---

## 3. Typography

### 3.1 Font Stack

```css
/* Headings */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Body */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Monospace (code, slugs, IDs) */
font-family: 'JetBrains Mono', 'Fira Code', monospace;
```

**Why Inter?** Free, excellent readability at small sizes (analytics dashboards), variable font (reduces load), and the de facto standard for modern SaaS.

### 3.2 Type Scale

| Element | Size | Weight | Line Height | Tracking |
|---|---|---|---|---|
| H1 (page title) | 32px / 2rem | 700 (Bold) | 1.2 | -0.02em |
| H2 (section) | 24px / 1.5rem | 600 (Semi) | 1.3 | -0.01em |
| H3 (subsection) | 20px / 1.25rem | 600 (Semi) | 1.4 | 0 |
| H4 (card title) | 16px / 1rem | 600 (Semi) | 1.4 | 0 |
| Body | 14px / 0.875rem | 400 (Regular) | 1.6 | 0 |
| Body Small | 13px / 0.8125rem | 400 (Regular) | 1.5 | 0 |
| Caption | 12px / 0.75rem | 500 (Medium) | 1.4 | 0.02em |
| Label | 12px / 0.75rem | 600 (Semi) | 1.4 | 0.04em |

### 3.3 Tailwind Config

```typescript
// tailwind.config.ts (relevant excerpt)
{
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1A1A2E',
          accent: '#6C5CE7',
          light: '#F8F9FC',
        },
        success: '#00B894',
        warning: '#FDCB6E',
        danger: '#E17055',
        info: '#74B9FF',
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
      },
    },
  },
}
```

---

## 4. Spacing & Layout

### 4.1 Spacing Scale

Based on 4px grid:

```
space-1:  4px    (0.25rem)
space-2:  8px    (0.5rem)
space-3:  12px   (0.75rem)
space-4:  16px   (1rem)
space-5:  20px   (1.25rem)
space-6:  24px   (1.5rem)
space-8:  32px   (2rem)
space-10: 40px   (2.5rem)
space-12: 48px   (3rem)
space-16: 64px   (4rem)
```

### 4.2 Layout Grid

**Dashboard:**
- Sidebar: 240px fixed (collapses to 64px icon-only on tablet, hidden on mobile with hamburger)
- Content area: fluid, max-width 1200px, centered
- Content padding: 24px (16px on mobile)

**Viewer:**
- Full viewport, no chrome
- Document centered, max-width 900px
- Controls overlay (semi-transparent, auto-hide after 3s)

**Landing page:**
- Max-width 1280px, centered
- Section padding: 80px vertical (48px on mobile)

### 4.3 Border Radius

```
radius-sm:  4px   — inputs, small badges
radius-md:  8px   — cards, buttons, dropdowns
radius-lg:  12px  — modals, large cards
radius-xl:  16px  — feature highlight cards
radius-full: 9999px — avatars, pills
```

---

## 5. Component Patterns

### 5.1 Buttons

| Variant | Use | Style |
|---|---|---|
| **Primary** | Main CTA (upgrade, create link, upload) | bg-brand-accent, text-white, hover:opacity-90 |
| **Secondary** | Secondary actions (cancel, back) | bg-transparent, border-gray-300, text-gray-700 |
| **Ghost** | Tertiary actions (within tables, inline) | bg-transparent, text-gray-600, hover:bg-gray-100 |
| **Destructive** | Delete, revoke | bg-danger, text-white |

All buttons: `radius-md`, `h-9` (36px), `px-4`, `font-medium`, `text-sm`

### 5.2 Cards

```
Background:     white
Border:         1px solid gray-200
Border radius:  radius-lg (12px)
Padding:        24px
Shadow:         shadow-sm (hover: shadow-md)
```

### 5.3 Tables

- Header: `bg-gray-50`, `text-xs`, `uppercase`, `tracking-wide`, `text-gray-500`
- Rows: `border-b border-gray-100`, hover: `bg-gray-50`
- Cell padding: `py-3 px-4`
- Sortable columns: click header to sort, arrow indicator

### 5.4 Status Badges

| Status | Color | Example |
|---|---|---|
| Processing | `bg-warning/10 text-warning` | Document processing |
| Ready/Active | `bg-success/10 text-success` | Document ready, link active |
| Expired/Inactive | `bg-gray-100 text-gray-500` | Link expired |
| Error | `bg-danger/10 text-danger` | Processing failed |
| Pro/Business | `bg-brand-accent/10 text-brand-accent` | Feature badge |

### 5.5 Empty States

Every list view has a designed empty state:
- Illustration (simple SVG, not stock photos)
- Headline: "No documents yet"
- Description: "Upload your first document and start tracking who reads it."
- CTA button: "Upload Document"

---

## 6. Viewer Design

The viewer is the most important design surface — it's what recipients see. It must be:

1. **Fast:** First page in < 2s. No loading spinners longer than 500ms.
2. **Clean:** No distractions. The document is the star.
3. **Mobile-first:** Most recipients open on phone (especially investors checking between meetings).
4. **Branded:** Shows sender's identity, not Peeeky (on paid plans).

### 6.1 Viewer Layout

```
┌──────────────────────────────────────┐
│  [Logo]           [Page 3/12]  [⬇️]  │  ← Header bar (auto-hides)
├──────────────────────────────────────┤
│                                      │
│                                      │
│           Document Page              │
│           (centered, max 900px)      │
│                                      │
│                                      │
│                                      │
├──────────────────────────────────────┤
│  [← Prev]    ● ● ● ○ ○    [Next →]  │  ← Navigation (bottom)
├──────────────────────────────────────┤
│  Secured by Peeeky                   │  ← Badge (Free plan only)
└──────────────────────────────────────┘
                              [💬]      ← AI Chat floating button
```

### 6.2 Viewer Interactions

- **Swipe:** Left/right to navigate pages (mobile)
- **Keyboard:** Arrow keys, Page Up/Down (desktop)
- **Click:** Left/right edges of document to navigate
- **Pinch:** Zoom on mobile
- **Scroll:** Continuous scroll mode (optional setting)
- **Auto-hide controls:** Header and navigation fade after 3s of inactivity, reappear on mouse move or tap

### 6.3 AI Chat Widget

```
┌──────────────────────┐
│  Ask about this doc  │  ← Header
├──────────────────────┤
│                      │
│  User: What's the    │
│  projected revenue?  │
│                      │
│  AI: Based on the    │
│  financial slides,   │
│  the projected...    │
│  ████████░░ (typing) │
│                      │
├──────────────────────┤
│  [Type a question...]│  ← Input
│  [Send ↗]            │
├──────────────────────┤
│  Powered by AI · 18  │  ← Footer (messages remaining)
│  messages remaining  │
└──────────────────────┘
```

- Width: 360px desktop, full-width mobile
- Opens as slide-over panel from right
- Background: white, slightly elevated shadow

---

## 7. Logo Direction

### 7.1 Concept

The logo should evoke "peek" — an eye, a document being observed, or a keyhole. Keep it simple enough to work as a 16x16 favicon.

### 7.2 Guidelines

- **Wordmark:** "peeeky" in lowercase, Inter Bold, with the three "e"s slightly stylized (gradient, or the middle "e" as an eye symbol)
- **Icon:** Simplified eye or document with an eye element — works as favicon and app icon
- **Colors:** Brand Primary (#1A1A2E) on light backgrounds, white on dark
- **Clear space:** Minimum padding = height of the "e" character on all sides
- **Minimum size:** Wordmark: 80px wide. Icon: 24px

### 7.3 Usage

| Context | Format |
|---|---|
| Dashboard header | Icon + wordmark (horizontal) |
| Viewer badge | "Secured by" + icon + wordmark |
| Favicon | Icon only (16x16, 32x32) |
| Social media profile | Icon on brand-accent background |
| Email header | Icon + wordmark (horizontal) |

---

## 8. Iconography

- **Library:** Lucide Icons (open source, consistent, works with React)
- **Size:** 16px inline, 20px in buttons, 24px standalone
- **Stroke:** 1.5px (matches Inter's weight)
- **Color:** Inherits text color (`currentColor`)

Key icons:
| Concept | Icon |
|---|---|
| Document | `FileText` |
| Upload | `Upload` |
| Link | `Link2` |
| Analytics | `BarChart3` |
| Eye (views) | `Eye` |
| Lock (password) | `Lock` |
| AI Chat | `MessageSquare` |
| Settings | `Settings` |
| Team | `Users` |
| Billing | `CreditCard` |

---

## 9. Motion & Animation

Keep animations subtle and functional. No decorative animation.

| Element | Animation | Duration | Easing |
|---|---|---|---|
| Page transitions | Fade | 150ms | ease-out |
| Modal open | Scale 0.95→1 + fade | 200ms | ease-out |
| Modal close | Scale 1→0.95 + fade | 150ms | ease-in |
| Toast notification | Slide in from top-right | 200ms | ease-out |
| Dropdown open | Scale Y 0.95→1 + fade | 150ms | ease-out |
| Viewer controls | Fade in/out | 300ms | ease-in-out |
| Button hover | Background color shift | 100ms | ease |
| Skeleton loading | Shimmer pulse | 1.5s | ease-in-out, infinite |

No animation on:
- Page loads (show content immediately)
- Data tables (instant render)
- Form interactions (instant feedback)
