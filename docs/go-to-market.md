# Peeeky — Go-to-Market Strategy

> How Peeeky gets its first 100 paying customers.

---

## 1. GTM Overview

Peeeky is a PLG (product-led growth) product. The product sells itself through usage — recipients become senders, free users become paid users. Marketing amplifies this loop; it doesn't replace it.

```
Viral Badge (40%)  ──→  Signup (Free)  ──→  Upload & Share  ──→  Hit Limits  ──→  Upgrade
SEO (30%)          ──↗                                                            │
Product Hunt (15%) ──↗                                                            │
Cold Outreach (10%)──↗                                                            │
Referrals (5%)     ──↗                                                            │
                                                                                  │
                         ←── Recipient sees badge, becomes sender ←───────────────┘
```

---

## 2. Pre-Launch (Month 1-3)

### 2.1 Build in Public

**Where:** Twitter/X, LinkedIn, Indie Hackers

**Cadence:** 2-3 posts/week

**Content themes:**
- Progress updates: "Week 2: PDF viewer is live. Here's how page tracking works under the hood."
- Decisions: "Why I chose Supabase over PlanetScale for a multi-tenant SaaS."
- Numbers: "First 10 beta users signed up. Here's what they said."
- Pain points: "I sent 40 pitch decks last year. I had no idea if anyone read them."

**Goal:** 500 followers before Product Hunt launch. These become your launch day army.

### 2.2 Beta Users (Month 3)

**Target:** 10-20 users, NOT friends.

**Where to find them:**
- Reddit: r/startups, r/SaaS, r/Entrepreneur — post in feedback threads
- Indie Hackers: post in "Show IH" and product feedback groups
- LinkedIn: DM founders who recently raised (they just went through deck-sharing pain)
- Twitter/X: search "pitch deck" + "investor" — find founders complaining

**Offer:** Pro plan free for 6 months in exchange for:
- Weekly 15-min feedback call (first 4 weeks)
- Written feedback on onboarding experience
- Permission to use as testimonial / case study

**Success criteria:** 5+ beta users actively sharing documents weekly by end of Month 3.

### 2.3 Waitlist / Landing Page

- Simple landing page live from Week 2 (even before product is ready)
- Email capture: "Be first to track your documents with AI"
- Share on social after each build-in-public post
- Goal: 200 emails before launch

---

## 3. Product Hunt Launch (Month 5-6)

### 3.1 Timing

- **Day:** Tuesday or Wednesday (highest traffic)
- **Time:** 12:01 AM PT (full 24-hour window)
- **Prerequisites:** Phase 1-3 complete, AI Chat working, 10+ beta testimonials

### 3.2 PH Assets

| Asset | Details |
|---|---|
| **Tagline** | Share documents. Track every page. Chat with AI. |
| **Description** | Peeeky is the smart way to share pitch decks, proposals, and confidential documents. Know exactly who reads your docs, how long they spend on each page, and let recipients ask questions via AI — all from a single tracked link. |
| **First Comment** | Personal story: "I sent 50 pitch decks and had no idea who read them..." + what makes Peeeky different + link to free plan |
| **Images** | 5 screenshots: viewer, analytics dashboard, AI chat, link creation, engagement score |
| **Video** | 60-second demo: upload → create link → recipient views → see analytics → AI chat |
| **Maker** | Guilherme — profile should be active on PH before launch (upvote/comment on other products) |

### 3.3 Launch Day Playbook

**Morning (6 AM PT):**
- Post goes live (scheduled night before)
- Share on Twitter, LinkedIn, Indie Hackers, WhatsApp groups
- DM beta users: "We just launched on PH, would love your support"
- Email waitlist: "We're live! Here's your free Pro upgrade code: LAUNCH30"

**Throughout the day:**
- Respond to EVERY comment on PH within 30 minutes
- Fix any bugs reported immediately
- Post updates on Twitter: engagement stats, user count
- DM anyone who upvotes and has a relevant profile (founders, VCs, sales)

**Target:** Top 5 of the day (300+ upvotes). Realistic with preparation.

### 3.4 Post-Launch (Week After)

- Write "Launch retrospective" blog post with real numbers
- Reach out to tech blogs: TechCrunch, BetaList, SaaSWorthy
- Submit to startup directories: BetaList, StartupStash, SaaSHub, AlternativeTo
- Follow up with every PH commenter who showed interest

---

## 4. SEO Strategy (Ongoing from Month 5)

### 4.1 Keyword Targets

**High intent (bottom funnel):**
| Keyword | Monthly Volume (est.) | Difficulty | Page |
|---|---|---|---|
| docsend alternative | 1K-5K | Medium | /vs/docsend |
| docsend free alternative | 500-1K | Low | /vs/docsend |
| track who views my pdf | 500-1K | Low | Blog post |
| secure document sharing | 1K-5K | Medium | Landing page |
| pitch deck sharing tool | 500-1K | Low | /for/fundraising |
| virtual data room free | 1K-5K | Medium | /for/mna |

**Informational (top funnel):**
| Keyword | Monthly Volume (est.) | Page |
|---|---|---|
| how to share a pitch deck with investors | 1K-5K | Blog post |
| how to know if someone read your email attachment | 500-1K | Blog post |
| virtual data room explained | 1K-5K | Blog post |
| how to protect confidential documents | 500-1K | Blog post |

### 4.2 Content Plan

**Comparison pages (Month 5):**
- `/vs/docsend` — "Peeeky vs DocSend: Free Alternative with AI"
- `/vs/google-drive` — "Why Google Drive Links Don't Cut It for Sales"
- `/vs/wetransfer` — "WeTransfer vs Peeeky: Sharing vs Tracking"
- `/vs/notion` — "Notion Isn't Built for External Document Sharing"

**Use case pages (Month 5):**
- `/for/fundraising` — "Track Your Pitch Deck: Know Which Investors Are Interested"
- `/for/sales` — "Sales Proposals That Tell You When to Follow Up"
- `/for/real-estate` — "Share Property Docs Securely with Clients"
- `/for/mna` — "Virtual Data Rooms for M&A, Without the Enterprise Price"

**Blog posts (Month 5-12, 2/month):**
1. "I Sent 50 Pitch Decks and Had No Idea Who Read Them" (launch story)
2. "5 Mistakes Founders Make When Sharing Pitch Decks"
3. "How to Follow Up With Investors After Sending Your Deck"
4. "DocSend Pricing in 2026: Is It Still Worth It?"
5. "What Investors Actually Look At in Your Pitch Deck (Data From 1,000 Views)"
6. "The Death of Email Attachments for Business Documents"

### 4.3 SEO Technical

- All pages server-rendered (Next.js SSR)
- `sitemap.xml` auto-generated
- `robots.txt` configured
- OG tags + Twitter cards on every page
- Structured data (JSON-LD) for software application
- Page speed: target 90+ Lighthouse score

---

## 5. Cold Outreach (Month 6+)

### 5.1 Target Segments

**Segment A: Startup Founders (Fundraising)**
- LinkedIn search: "Founder" + "raising" or "Series A" or "pre-seed"
- Signal: recently posted about fundraising
- Message angle: "I built this because I was in your exact position"

**Segment B: Sales Leaders (B2B)**
- LinkedIn search: "VP Sales" or "Head of Sales" + SaaS companies (50-500 employees)
- Signal: company is hiring SDRs (actively selling)
- Message angle: "Your reps send 100 proposals a month. How many get read?"

**Segment C: M&A Advisors**
- LinkedIn search: "M&A" + "Managing Director" or "Associate"
- Signal: boutique advisory firms (not Goldman, not Lazard)
- Message angle: "Data rooms at 1/10th the cost of Intralinks"

### 5.2 Outreach Templates

**Founder template (LinkedIn DM):**
```
Hi [Name],

I noticed you're raising [round] — congrats on the momentum.

Quick question: when you send your deck to investors, do you know who actually reads it?

I built Peeeky because I was tired of sending decks into a black hole. It tells you exactly who opened your deck, which slides they spent time on, and even lets them ask an AI questions about your deck.

Free to try: peeeky.com

Happy to show you a 5-min demo if useful. No pressure either way.
```

**Sales leader template:**
```
Hi [Name],

I see [Company] is scaling the sales team — exciting phase.

Curious: do your reps know which proposals actually get read? Most teams send proposals and guess when to follow up.

Peeeky tracks document engagement page by page. Your reps get a notification the moment a prospect opens their proposal, with a suggested follow-up based on which pages got attention.

Would a quick demo be useful, or happy to just share a link so you can try it yourself?
```

### 5.3 Outreach Volume

- **Weeks 1-2:** 10 DMs/day (test messaging, measure response rate)
- **Weeks 3-4:** Refine based on data, scale to 20/day
- **Target response rate:** 10-15%
- **Target demo→signup rate:** 40%+
- **Tools:** LinkedIn Sales Navigator (free trial), Apollo.io for email

---

## 6. Pricing Experiments

### 6.1 Initial Pricing

| Plan | Price | Target |
|---|---|---|
| Free | $0 | Individual users, viral acquisition |
| Pro | $39/mo ($390/yr) | Founders, freelancers, individual sales reps |
| Business | $129/mo ($1,290/yr) | Sales teams, M&A advisors, agencies |

### 6.2 Experiments to Run (Month 4-8)

| Experiment | Hypothesis | How to Measure |
|---|---|---|
| **Annual discount** (2 months free) | Increases LTV, reduces churn | Compare annual vs monthly cohort LTV at 6 months |
| **Pro at $29 vs $39 vs $49** | Price sensitivity test | A/B test pricing page, measure conversion rate |
| **Business at $99 vs $129 vs $149** | Value perception | A/B test, measure upgrade rate from Pro |
| **Launch code** (LAUNCH30 = 30% off 3 months) | Accelerate first conversions | Track code redemption and retention after discount ends |
| **Free plan limit** (5 docs vs 3 docs vs 10 docs) | Find the right "taste" before paywall | Track Free→Pro conversion rate per variant |
| **Usage-based AI pricing** ($0.10 per AI chat) | Alternative to monthly cap | Compare revenue and usage vs flat cap |

### 6.3 Anti-Churn Tactics

- **Cancellation flow:** "Before you go, tell us why" survey + offer: pause subscription for 1 month (free) instead of cancel
- **Downgrade path:** Pro → Free keeps documents but loses features (no data deleted)
- **Win-back email:** 30 days after cancel, email with "Your documents are still here. Come back for 20% off."
- **Annual lock-in incentive:** 2 months free = ~17% discount. Reduces monthly churn window.

---

## 7. Milestones & Targets

| Month | MRR Target | Customers | Key Activity |
|---|---|---|---|
| 1-2 | $0 | 0 | Build MVP, build in public |
| 3 | $0 | 10-20 beta | Beta users, Stripe live, iterate |
| 4 | $200 | 5-10 paid | First conversions from beta, AI live |
| 5 | $500 | 15-20 paid | Product Hunt launch week |
| 6 | $1,000 | 30-40 paid | SEO content live, cold outreach starts |
| 7 | $1,500 | 50 paid | SEO traffic growing, outreach scaled |
| 8 | $2,000 | 60-70 paid | Pricing experiments, reduce churn |
| 9 | $2,500 | 80 paid | Data rooms live (Business upsell) |
| 10 | $3,000 | 90 paid | Affiliate program, referral engine |
| 11 | $3,500 | 100+ paid | Optimization, enterprise inbound |
| 12 | **$3,700+** | **110+ paid** | **R$20K target achieved** |

---

## 8. Channels Summary

| Channel | % of Growth | Cost | When |
|---|---|---|---|
| **Viral badge** (PLG) | 40% | $0 | From Day 1 (Free plan) |
| **SEO** | 30% | $0 (time only) | Month 5+ (compounds) |
| **Product Hunt** | 15% | $0 | One-time (Month 5-6) |
| **Cold outreach** | 10% | ~$50/mo (tools) | Month 6+ |
| **Referrals/affiliates** | 5% | 20% commission | Month 10+ |
