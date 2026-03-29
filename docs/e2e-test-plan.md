# Peeeky — E2E Test Plan: Full User Journey

> Comprehensive test scenarios from landing page trial signup through every app feature.
> Date: 2026-03-29

---

## Test Environment

- **URL:** http://localhost:3000 (dev) / https://peeeky.com (prod)
- **Tool:** Playwright MCP
- **Viewports:** Desktop (1280x800), Tablet (768x1024), Mobile (375x812)

---

## Phase 1: Landing Page & Onboarding

### TC-1.1: Landing Page Load
- [ ] Page loads with HTTP 200, title "Peeeky — Share documents. Know who reads them."
- [ ] 0 console errors
- [ ] All 8 sections render: Hero, Features, How It Works, Testimonials, Pricing, Blog, FAQ, CTA

### TC-1.2: Navigation
- [ ] Logo link returns to `/`
- [ ] "Features" scrolls to `#features`
- [ ] "Pricing" scrolls to `#pricing`
- [ ] "FAQ" scrolls to `#faq`
- [ ] "Compare" dropdown opens with 3 links (vs DocSend, Google Drive, WeTransfer)
- [ ] "Use Cases" dropdown opens with 3 links (Fundraising, Sales, M&A)
- [ ] "Blog" navigates to `/blog`
- [ ] "Sign In" navigates to `/login`
- [ ] "Get Started" navigates to `/login`

### TC-1.3: Hero CTAs
- [ ] "Start for free" links to `/login`
- [ ] "See how it works" scrolls to `#how-it-works`
- [ ] Stats display: 10,000+ / 50,000+ / 98%

### TC-1.4: Pricing Section
- [ ] Free plan: $0/mo, 5 features listed, CTA "Get started" → `/login`
- [ ] Pro plan: $39/mo, "Most Popular" badge, 7 features, CTA "Start free trial" → `/login`
- [ ] Business plan: $129/mo, 7 features, CTA "Contact us" → `mailto:hello@peeeky.com`

### TC-1.5: FAQ Accordion
- [ ] First item expanded by default
- [ ] Clicking closed item expands it and collapses previous
- [ ] All 7 questions present with answers

### TC-1.6: CTA Email Form
- [ ] Input accepts email text
- [ ] Submit with valid email shows success message: "You're on the list"
- [ ] Submit with empty email shows validation (or no action)

### TC-1.7: Footer & Legal Pages
- [ ] Privacy Policy (`/privacy`) loads publicly — not behind auth
- [ ] Terms of Service (`/terms`) loads publicly — not behind auth
- [ ] Footer links: Features, Pricing, How it works, vs DocSend/Google Drive/WeTransfer, Fundraising/Sales/M&A
- [ ] Copyright text: "2026 Peeeky. All rights reserved."

### TC-1.8: Compare Pages
- [ ] `/vs/docsend` loads with comparison table
- [ ] `/vs/google-drive` loads with comparison table
- [ ] `/vs/wetransfer` loads with comparison table

### TC-1.9: Use Case Pages
- [ ] `/for/fundraising` loads with content
- [ ] `/for/sales` loads with content
- [ ] `/for/mna` loads with content

### TC-1.10: Blog
- [ ] `/blog` loads publicly with 3 articles
- [ ] Each blog post link navigates to detail page
- [ ] `/blog/introducing-peeeky` loads with full content

### TC-1.11: Mobile Responsiveness (375px)
- [ ] Hamburger menu visible, desktop nav hidden
- [ ] Hamburger opens full mobile menu with all links
- [ ] All sections render and are scrollable
- [ ] CTAs are tappable

### TC-1.12: Tablet Responsiveness (768px)
- [ ] Desktop navbar renders at 768px
- [ ] All sections adapt properly

---

## Phase 2: Authentication

### TC-2.1: Login Page
- [ ] `/login` loads with Google OAuth button and magic link form
- [ ] "Continue with Google" button present and clickable
- [ ] Email input with placeholder "you@company.com"
- [ ] "Send magic link" button present
- [ ] Footer text: "By signing in, you agree to our Terms of Service and Privacy Policy."

### TC-2.2: Google OAuth Flow
- [ ] Clicking "Continue with Google" redirects to Google consent screen
- [ ] After consent, redirects back to `/documents` (dashboard)
- [ ] User session is created (navbar shows user info)

### TC-2.3: Magic Link Flow
- [ ] Enter valid email → "Send magic link" → success message displayed
- [ ] Email received with magic link URL
- [ ] Clicking magic link authenticates and redirects to `/documents`

### TC-2.4: Auth Redirect
- [ ] Unauthenticated visit to `/documents` redirects to `/login?callbackUrl=%2Fdocuments`
- [ ] After login, redirects back to original URL

### TC-2.5: Session Persistence
- [ ] After login, refreshing page maintains session
- [ ] Navigating between pages maintains auth state

---

## Phase 3: Documents Management

### TC-3.1: Empty State
- [ ] First-time user sees empty documents page with upload prompt
- [ ] Upload area visible (drag-and-drop or file picker)

### TC-3.2: Upload Document (PDF)
- [ ] Click upload area or drag PDF file
- [ ] File uploads with progress indicator
- [ ] Document appears in list with status PROCESSING
- [ ] Status transitions to READY after processing
- [ ] Document card shows: name, file type icon, view count (0), link count (0), date

### TC-3.3: Upload Document (PPTX)
- [ ] Upload PPTX file succeeds
- [ ] File is processed and converted
- [ ] Status becomes READY

### TC-3.4: Upload Validation
- [ ] Files > 50MB are rejected with error message
- [ ] Non-PDF/PPTX files are rejected or show error
- [ ] Free plan: uploading 6th document shows upgrade prompt

### TC-3.5: Import from URL
- [ ] Import URL feature available
- [ ] Enter valid Google Drive/Dropbox URL → document imports
- [ ] Invalid URL shows error

### TC-3.6: Document Detail Page
- [ ] Navigate to `/documents/[id]` shows document dashboard
- [ ] 4 tabs visible: Links, Analytics, Versions, Files
- [ ] Document name displayed in header
- [ ] File replacement button available

### TC-3.7: Delete Document
- [ ] Delete button present with confirmation dialog
- [ ] Confirming delete removes document from list
- [ ] Associated links and views are deleted

---

## Phase 4: Link Creation & Management

### TC-4.1: Create Link
- [ ] Click "Create link" on document detail page
- [ ] New link appears in Links tab with shareable URL
- [ ] Link URL format: `peeeky.com/view/[slug]`
- [ ] Copy link button copies URL to clipboard

### TC-4.2: Link Settings — Password Protection
- [ ] Toggle password protection ON
- [ ] Set password → save
- [ ] Visiting link URL shows password prompt
- [ ] Correct password grants access
- [ ] Wrong password shows error
- [ ] Toggle OFF removes password requirement

### TC-4.3: Link Settings — Email Requirement
- [ ] Toggle "Require email" ON
- [ ] Visiting link shows email input before document
- [ ] Valid email grants access
- [ ] Email is recorded in analytics as viewer identifier

### TC-4.4: Link Settings — Download Control
- [ ] Toggle "Allow downloads" ON → download button visible in viewer
- [ ] Toggle OFF → download button hidden in viewer

### TC-4.5: Link Settings — Watermark
- [ ] Toggle "Enable watermark" ON
- [ ] Document pages show viewer email/name as watermark overlay

### TC-4.6: Link Settings — AI Chat
- [ ] Toggle "Enable AI Chat" ON
- [ ] Chat panel visible in document viewer
- [ ] Toggle OFF → chat panel hidden

### TC-4.7: Link Settings — NDA/Agreement
- [ ] Toggle "Require NDA" ON
- [ ] Add NDA text in editor
- [ ] Visiting link shows NDA before document
- [ ] "I Agree" checkbox + Accept button
- [ ] Accepting grants access to document

### TC-4.8: Link Settings — Expiration
- [ ] Set expiration date/time
- [ ] Before expiry: link works normally
- [ ] After expiry: link shows expired message

### TC-4.9: Link Settings — Max Views
- [ ] Set max views limit (e.g., 5)
- [ ] Views up to limit work normally
- [ ] View beyond limit shows "link no longer available" message

### TC-4.10: Link Settings — Activation
- [ ] Deactivate link → visiting URL shows inactive message
- [ ] Reactivate → link works again

### TC-4.11: Plan Limit Enforcement
- [ ] Free plan: creating 4th link on same document shows upgrade prompt
- [ ] Pro/Business: unlimited links allowed

---

## Phase 5: Document Viewer (Public)

### TC-5.1: Basic Viewing
- [ ] Navigate to `/view/[slug]`
- [ ] PDF renders correctly with all pages
- [ ] Page navigation (previous/next) works
- [ ] Page counter shows correct "X/Y" format
- [ ] Zoom controls work

### TC-5.2: Access Gates
- [ ] Password-protected link shows password form first
- [ ] Email-required link shows email form first
- [ ] NDA-required link shows NDA acceptance form first
- [ ] Multiple gates chain correctly (e.g., email → NDA → document)

### TC-5.3: AI Chat
- [ ] Chat panel opens with input field
- [ ] Type question and send → streaming response appears
- [ ] Response is grounded in document content
- [ ] Conversation history maintained
- [ ] Multiple questions/answers work

### TC-5.4: Download
- [ ] When allowed: download button visible and downloads PDF
- [ ] When disabled: no download option visible

### TC-5.5: Watermark
- [ ] When enabled: viewer email/name overlaid on pages
- [ ] Watermark visible but doesn't block content

### TC-5.6: Tracking
- [ ] Opening document registers a view_start
- [ ] Navigating pages records page_view events
- [ ] Time spent per page is tracked
- [ ] Closing/leaving records view_end
- [ ] Analytics update on document owner's dashboard

---

## Phase 6: Analytics

### TC-6.1: Document Analytics Overview
- [ ] Analytics tab shows: total views, unique viewers, avg time, avg completion
- [ ] Data updates after a new view is recorded

### TC-6.2: Page Engagement Heatmap
- [ ] Heatmap displays engagement per page
- [ ] Highest-engagement page is highlighted

### TC-6.3: Time Per Page Chart
- [ ] Bar chart shows time spent per page
- [ ] Values match recorded tracking data

### TC-6.4: Viewers Table
- [ ] Table lists all viewers with: email/IP, link used, device, duration, completion %, engagement score, date
- [ ] Engagement score color-coded: green (70+), yellow (30-69), red (<30)

### TC-6.5: Real-Time Viewer Count
- [ ] "Currently viewing" counter shows active viewers
- [ ] Updates in real-time (polling every 10s)

---

## Phase 7: Data Rooms

### TC-7.1: Create Data Room
- [ ] Click "Create Data Room" on `/datarooms`
- [ ] Modal with Name (required) and Description (optional) fields
- [ ] Submit creates room and shows it in list

### TC-7.2: Add Documents to Data Room
- [ ] Open data room → Documents tab
- [ ] "Add document" opens searchable dropdown of org documents
- [ ] Select document → added to room with order number
- [ ] Multiple documents can be added

### TC-7.3: Remove Document from Data Room
- [ ] Remove button on each document
- [ ] Clicking removes document from room
- [ ] Order numbers update

### TC-7.4: Data Room Share Link
- [ ] Share URL displayed (format: `/room/[slug]`)
- [ ] Copy button copies URL
- [ ] Visiting URL shows data room with document list

### TC-7.5: Data Room Viewer (Public)
- [ ] `/room/[slug]` shows room name, description, org name, document count
- [ ] Document list with file type icons, names, page counts
- [ ] Clicking document opens it in viewer (`/view/[slug]`)

### TC-7.6: Data Room Analytics
- [ ] Analytics tab shows: unique viewers, total views, avg engagement
- [ ] Per-viewer breakdown: docs viewed, total views, time, engagement, last seen
- [ ] Per-document breakdown: views, avg time, avg completion

### TC-7.7: Delete Data Room
- [ ] Delete button with confirmation dialog
- [ ] Confirming removes room (documents remain in org)

---

## Phase 8: eSignature / NDA

### TC-8.1: Create Signature Request
- [ ] Navigate to `/esignature`
- [ ] Click "Create" → modal opens
- [ ] Select document, enter title, add signers (email + name)
- [ ] Submit creates request in DRAFT status

### TC-8.2: One-Click NDA
- [ ] Click "One-Click NDA" button
- [ ] Enter signer email
- [ ] NDA created with pre-configured fields and auto-sent
- [ ] Status becomes PENDING

### TC-8.3: Field Placement (DRAFT)
- [ ] Open DRAFT signature request
- [ ] PDF viewer shows with field tools: Signature, Initials, Date, Text, Checkbox
- [ ] Click tool then click on PDF → field placed at position
- [ ] Fields can be repositioned by dragging
- [ ] Fields can be deleted (X button)

### TC-8.4: Send Signature Request
- [ ] After placing fields, click "Send"
- [ ] Status changes to PENDING
- [ ] Signers receive email with signing link

### TC-8.5: Signer Experience
- [ ] Signer opens `/sign/[slug]`
- [ ] Sees document with field overlays
- [ ] Can choose signature method: Type, Draw, or Upload
- [ ] Fills all required fields
- [ ] Submits → confirmation shown with audit info
- [ ] Can download signed PDF

### TC-8.6: Completed Signature
- [ ] After all signers complete, status becomes COMPLETED
- [ ] Owner can download signed PDF
- [ ] Audit info shown: email, IP, timestamp, hash

### TC-8.7: Cancel & Resend
- [ ] Cancel button changes status to CANCELLED
- [ ] Resend button sends reminder email to pending signers

---

## Phase 9: Settings

### TC-9.1: Settings Hub
- [ ] `/settings` shows 6 option cards
- [ ] Each card navigates to respective settings page

### TC-9.2: Billing
- [ ] Current plan displayed
- [ ] 3 pricing tiers shown with features
- [ ] Upgrade button creates Stripe checkout session
- [ ] "Manage subscription" opens Stripe portal
- [ ] Monthly/annual toggle works

### TC-9.3: Team Management
- [ ] Invite form: email + role (Member/Admin) dropdown
- [ ] Invite sends email to new member
- [ ] Members table shows all members with roles
- [ ] Can change member role (except Owner)
- [ ] Can remove member (except Owner)
- [ ] Owner badge displayed for org owner

### TC-9.4: Audit Log
- [ ] Table shows actions chronologically
- [ ] Actions include: document.created, link.created, etc.
- [ ] Resource type and ID displayed
- [ ] Business plan only (others see upgrade prompt)

### TC-9.5: Notifications (Slack)
- [ ] Slack webhook URL input field
- [ ] Save webhook URL → success message
- [ ] Document view triggers Slack notification
- [ ] Business plan only

### TC-9.6: Referrals
- [ ] Unique referral link displayed
- [ ] Copy button works
- [ ] Stats cards: total referrals, active, earnings
- [ ] Referrals table with status and commission

### TC-9.7: Custom Domains
- [ ] Add domain form
- [ ] Domain added with "Pending Verification" status
- [ ] CNAME DNS record displayed
- [ ] After DNS propagation, status becomes "Verified"
- [ ] Remove domain button works
- [ ] Business plan only

---

## Phase 10: File Requests

### TC-10.1: Enable File Requests
- [ ] Files tab on document detail page
- [ ] Enable file request for document

### TC-10.2: Viewer Uploads File
- [ ] Viewer sees file upload option on shared document
- [ ] Upload file → appears as pending in owner's dashboard

### TC-10.3: Owner Reviews Files
- [ ] Pending files listed with uploader email
- [ ] Approve/Reject actions available
- [ ] Status updates accordingly

---

## Phase 11: Edge Cases & Error Handling

### TC-11.1: 404 Pages
- [ ] Non-existent route (e.g., `/nonexistent`) shows 404 page
- [ ] Non-existent document link (`/view/invalidslug`) shows appropriate error

### TC-11.2: Expired/Inactive Links
- [ ] Expired link shows expiration message
- [ ] Deactivated link shows inactive message
- [ ] Max-views-exceeded link shows limit message

### TC-11.3: Rate Limiting
- [ ] Rapid API calls are rate-limited
- [ ] Rate limit error message shown to user

### TC-11.4: Large File Upload
- [ ] File > 50MB shows rejection error
- [ ] File at ~50MB boundary uploads correctly

### TC-11.5: Network Errors
- [ ] Offline state shows appropriate error/retry

### TC-11.6: Concurrent Sessions
- [ ] Same account logged in from two browsers
- [ ] Both sessions work independently

---

## Phase 12: Cross-Browser & Performance

### TC-12.1: Browser Compatibility
- [ ] Chrome: all features work
- [ ] Firefox: all features work
- [ ] Safari: all features work
- [ ] Edge: all features work

### TC-12.2: Performance
- [ ] Landing page loads in < 3s
- [ ] Document viewer renders first page in < 2s
- [ ] Analytics data loads in < 1s

---

## Test Execution Priority

| Priority | Phases | Rationale |
|----------|--------|-----------|
| P0 (Critical) | 1, 2, 3, 4, 5 | Core flow: signup → upload → share → view |
| P1 (High) | 6, 7, 8 | Key features: analytics, data rooms, esignature |
| P2 (Medium) | 9, 10, 11 | Settings, file requests, edge cases |
| P3 (Low) | 12 | Cross-browser, performance |

---

## Total: 12 Phases | 80+ Test Cases
