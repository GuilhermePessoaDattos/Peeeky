"use client";

import { useEffect } from "react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

:root {
  --font: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  --black: #1d1d1f;
  --gray-1: #86868b;
  --gray-2: #d2d2d7;
  --gray-3: #f5f5f7;
  --white: #fbfbfd;
  --accent: #6C5CE7;
  --accent-hover: #5a4bd4;
  --accent-glow: rgba(108, 92, 231, 0.15);
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring: cubic-bezier(0.32, 0.72, 0, 1);
}

html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
body { font-family: var(--font); color: var(--black); background: var(--white); overflow-x: hidden; }

/* ═══ NAV ═══ */
.nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  transition: all 0.5s var(--ease-out-expo);
}
.nav-inner {
  max-width: 1080px; margin: 0 auto; height: 52px;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 22px;
}
.nav.scrolled {
  background: rgba(251,251,253,0.72);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 0.5px solid rgba(0,0,0,0.08);
}
.nav-logo {
  font-weight: 800; font-size: 20px; color: var(--black);
  text-decoration: none; letter-spacing: -0.5px;
}
.nav-logo .e { color: var(--accent); }
.nav-links {
  display: flex; align-items: center; gap: 28px; list-style: none;
}
.nav-links a {
  font-size: 12px; font-weight: 500; color: var(--black);
  text-decoration: none; opacity: 0.7;
  transition: opacity 0.3s var(--ease-out-expo);
}
.nav-links a:hover { opacity: 1; }
.nav-cta {
  font-size: 12px !important; font-weight: 600 !important; opacity: 1 !important;
  background: var(--accent); color: var(--white) !important;
  padding: 7px 18px; border-radius: 980px;
  transition: all 0.3s var(--ease-spring) !important;
}
.nav-cta:hover { background: var(--accent-hover); transform: scale(1.02); }

.nav-mobile-toggle { display: none; background: none; border: none; cursor: pointer; padding: 8px; }
.nav-mobile-toggle span { display: block; width: 18px; height: 1.5px; background: var(--black); margin: 4px 0; border-radius: 2px; }

/* ═══ HERO ═══ */
.hero {
  min-height: 100dvh; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center; padding: 120px 24px 80px;
  background: var(--white);
  position: relative; overflow: hidden;
}
.hero::before {
  content: ''; position: absolute; top: -40%; left: 50%; transform: translateX(-50%);
  width: 900px; height: 900px; border-radius: 50%;
  background: radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
  pointer-events: none; opacity: 0.6;
}
.hero-eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 14px; font-weight: 600; color: var(--accent);
  letter-spacing: 0.02em; margin-bottom: 20px;
  opacity: 0; transform: translateY(20px);
  animation: fadeUp 0.8s var(--ease-out-expo) 0.1s forwards;
}
.hero-eyebrow .dot {
  width: 7px; height: 7px; background: #00d26a; border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(0.85); } }

.hero h1 {
  font-size: clamp(44px, 7vw, 80px); font-weight: 800;
  line-height: 1.0; letter-spacing: -0.04em;
  color: var(--black); max-width: 820px;
  opacity: 0; transform: translateY(30px);
  animation: fadeUp 0.9s var(--ease-out-expo) 0.2s forwards;
}
.hero h1 .highlight {
  background: linear-gradient(135deg, var(--accent) 0%, #a855f7 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-sub {
  font-size: clamp(17px, 2.2vw, 21px); line-height: 1.5;
  color: var(--gray-1); max-width: 520px; margin: 24px auto 0;
  opacity: 0; transform: translateY(20px);
  animation: fadeUp 0.9s var(--ease-out-expo) 0.35s forwards;
}
.hero-ctas {
  display: flex; align-items: center; justify-content: center;
  gap: 14px; margin-top: 40px; flex-wrap: wrap;
  opacity: 0; transform: translateY(20px);
  animation: fadeUp 0.9s var(--ease-out-expo) 0.5s forwards;
}
.btn-main {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 16px 32px; font-size: 17px; font-weight: 600;
  background: var(--accent); color: white; border: none;
  border-radius: 980px; cursor: pointer; text-decoration: none;
  transition: all 0.4s var(--ease-spring);
}
.btn-main:hover { background: var(--accent-hover); transform: scale(1.03); box-shadow: 0 10px 40px var(--accent-glow); }
.btn-main:active { transform: scale(0.98); }

.btn-ghost {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 16px 32px; font-size: 17px; font-weight: 600;
  background: transparent; color: var(--accent); border: none;
  border-radius: 980px; cursor: pointer; text-decoration: none;
  transition: all 0.3s var(--ease-spring);
}
.btn-ghost:hover { background: var(--accent-glow); }

.hero-stat-row {
  display: flex; justify-content: center; gap: 48px; margin-top: 64px;
  opacity: 0; transform: translateY(20px);
  animation: fadeUp 0.9s var(--ease-out-expo) 0.65s forwards;
}
.hero-stat { text-align: center; }
.hero-stat-num { font-size: 32px; font-weight: 800; color: var(--black); letter-spacing: -0.03em; }
.hero-stat-label { font-size: 13px; color: var(--gray-1); margin-top: 4px; }

@keyframes fadeUp {
  to { opacity: 1; transform: translateY(0); }
}

/* ═══ SECTION BASE ═══ */
.section {
  padding: 120px 24px;
  text-align: center;
  opacity: 0; transform: translateY(40px);
  transition: opacity 0.9s var(--ease-out-expo), transform 0.9s var(--ease-out-expo);
}
.section.visible { opacity: 1; transform: translateY(0); }

.section-dark { background: var(--black); color: var(--white); }
.section-gray { background: var(--gray-3); }

.section-eyebrow {
  display: inline-block; font-size: 14px; font-weight: 600;
  color: var(--accent); margin-bottom: 16px; letter-spacing: 0.02em;
}
.section-dark .section-eyebrow { color: #a29bfe; }

.section-title {
  font-size: clamp(36px, 5vw, 64px); font-weight: 800;
  line-height: 1.05; letter-spacing: -0.04em;
  max-width: 740px; margin: 0 auto 16px;
}
.section-sub {
  font-size: 19px; color: var(--gray-1); max-width: 520px;
  margin: 0 auto; line-height: 1.5;
}
.section-dark .section-sub { color: var(--gray-2); }

/* ═══ FEATURE CARDS (Bento) ═══ */
.bento {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 16px; max-width: 1080px; margin: 64px auto 0;
  text-align: left;
}
.bento-card {
  background: var(--white); border-radius: 24px;
  padding: 40px 32px; position: relative; overflow: hidden;
  border: 1px solid rgba(0,0,0,0.04);
  transition: all 0.5s var(--ease-spring);
}
.bento-card:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,0.06); }
.section-dark .bento-card {
  background: #2d2d2f; border-color: rgba(255,255,255,0.06);
}
.section-dark .bento-card:hover { box-shadow: 0 20px 60px rgba(0,0,0,0.3); }

.bento-big { grid-column: span 2; }

.bento-icon {
  width: 48px; height: 48px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; margin-bottom: 20px;
  background: var(--accent-glow);
}
.section-dark .bento-icon { background: rgba(108,92,231,0.2); }

.bento-title {
  font-size: 22px; font-weight: 700; letter-spacing: -0.02em;
  margin-bottom: 8px;
}
.bento-desc {
  font-size: 15px; color: var(--gray-1); line-height: 1.55;
}
.section-dark .bento-desc { color: var(--gray-2); }

/* ═══ COMPARISON TABLE ═══ */
.compare-table {
  max-width: 800px; margin: 48px auto 0;
  border-radius: 20px; overflow: hidden;
  border: 1px solid rgba(0,0,0,0.06);
}
.compare-table table { width: 100%; border-collapse: collapse; text-align: left; }
.compare-table th {
  padding: 16px 24px; font-size: 13px; font-weight: 600;
  background: var(--gray-3); color: var(--gray-1); text-transform: uppercase;
  letter-spacing: 0.05em; border-bottom: 1px solid rgba(0,0,0,0.06);
}
.compare-table th:first-child { text-align: left; }
.compare-table td {
  padding: 14px 24px; font-size: 14px; border-bottom: 1px solid rgba(0,0,0,0.04);
  color: var(--black);
}
.compare-table tr:last-child td { border-bottom: none; }
.compare-table .check { color: var(--accent); font-weight: 700; }
.compare-table .x { color: var(--gray-2); }
.compare-table .peeeky-col { background: rgba(108,92,231,0.04); font-weight: 600; }

/* ═══ PRICING ═══ */
.pricing-toggle {
  display: inline-flex; align-items: center; gap: 12px;
  margin: 32px auto 48px; font-size: 14px; color: var(--gray-1);
}
.toggle-switch {
  width: 44px; height: 24px; border-radius: 980px;
  background: var(--gray-2); position: relative; cursor: pointer;
  transition: background 0.3s;
}
.toggle-switch.on { background: var(--accent); }
.toggle-switch::after {
  content: ''; position: absolute; top: 3px; left: 3px;
  width: 18px; height: 18px; border-radius: 50%;
  background: white; transition: transform 0.3s var(--ease-spring);
  box-shadow: 0 1px 4px rgba(0,0,0,0.15);
}
.toggle-switch.on::after { transform: translateX(20px); }
.toggle-label.active { color: var(--black); font-weight: 600; }

.pricing-grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 16px; max-width: 1000px; margin: 0 auto;
  text-align: left;
}
.pricing-card {
  padding: 36px 28px; border-radius: 24px;
  background: var(--white); border: 1px solid rgba(0,0,0,0.06);
  transition: all 0.4s var(--ease-spring);
}
.pricing-card:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,0.06); }
.pricing-card.featured {
  border-color: var(--accent); position: relative;
  box-shadow: 0 0 0 1px var(--accent);
}
.pricing-card.featured::before {
  content: 'Most Popular'; position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
  background: var(--accent); color: white; padding: 4px 16px; border-radius: 980px;
  font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
}
.plan-name { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
.plan-desc { font-size: 13px; color: var(--gray-1); margin-bottom: 20px; }
.plan-price {
  font-size: 48px; font-weight: 800; letter-spacing: -0.04em;
  line-height: 1; margin-bottom: 24px;
}
.plan-price span { font-size: 16px; font-weight: 500; color: var(--gray-1); }
.plan-features { list-style: none; }
.plan-features li {
  font-size: 14px; padding: 8px 0;
  border-top: 1px solid rgba(0,0,0,0.04);
  color: var(--black);
}
.plan-features li::before { content: '✓ '; color: var(--accent); font-weight: 700; }
.plan-cta {
  display: block; text-align: center; padding: 14px;
  border-radius: 14px; font-size: 15px; font-weight: 600;
  text-decoration: none; margin-top: 24px;
  transition: all 0.3s var(--ease-spring);
}
.plan-cta-main {
  background: var(--accent); color: white;
}
.plan-cta-main:hover { background: var(--accent-hover); transform: scale(1.02); }
.plan-cta-outline {
  background: transparent; color: var(--accent);
  border: 1.5px solid var(--accent);
}
.plan-cta-outline:hover { background: var(--accent-glow); }

/* ═══ FAQ ═══ */
.faq-list { max-width: 680px; margin: 48px auto 0; text-align: left; }
.faq-item {
  border-bottom: 1px solid rgba(0,0,0,0.06); cursor: pointer;
  padding: 20px 0;
}
.faq-q {
  display: flex; align-items: center; justify-content: space-between;
  font-size: 17px; font-weight: 600; color: var(--black);
}
.faq-q .icon {
  font-size: 22px; color: var(--gray-1); font-weight: 300;
  transition: transform 0.4s var(--ease-spring);
}
.faq-item.open .faq-q .icon { transform: rotate(45deg); color: var(--accent); }
.faq-a {
  max-height: 0; overflow: hidden; opacity: 0;
  transition: max-height 0.5s var(--ease-out-expo), opacity 0.4s, padding 0.4s;
}
.faq-item.open .faq-a { max-height: 200px; opacity: 1; padding-top: 12px; }
.faq-a p { font-size: 15px; color: var(--gray-1); line-height: 1.6; }

/* ═══ CTA BANNER ═══ */
.cta-banner {
  max-width: 1080px; margin: 0 auto;
  background: var(--black); border-radius: 32px;
  padding: 80px 40px; text-align: center; color: white;
  position: relative; overflow: hidden;
}
.cta-banner::before {
  content: ''; position: absolute; top: -50%; left: 50%; transform: translateX(-50%);
  width: 600px; height: 600px; border-radius: 50%;
  background: radial-gradient(circle, rgba(108,92,231,0.25) 0%, transparent 70%);
  pointer-events: none;
}
.cta-banner h2 {
  font-size: clamp(32px, 4.5vw, 52px); font-weight: 800;
  letter-spacing: -0.04em; line-height: 1.05; position: relative;
}
.cta-banner p {
  font-size: 18px; color: var(--gray-2); margin: 16px auto 32px;
  max-width: 440px; line-height: 1.5; position: relative;
}
.cta-banner .btn-main { position: relative; }

/* ═══ FOOTER ═══ */
.footer {
  padding: 64px 24px 32px; max-width: 1080px; margin: 0 auto;
  border-top: 1px solid rgba(0,0,0,0.06);
}
.footer-grid {
  display: grid; grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 40px; margin-bottom: 40px;
}
.footer-brand-name { font-size: 18px; font-weight: 800; margin-bottom: 8px; }
.footer-brand-name .e { color: var(--accent); }
.footer-brand-tagline { font-size: 13px; color: var(--gray-1); line-height: 1.5; }
.footer h4 { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--gray-1); margin-bottom: 16px; }
.footer ul { list-style: none; }
.footer li { margin-bottom: 10px; }
.footer a { font-size: 13px; color: var(--black); text-decoration: none; opacity: 0.6; transition: opacity 0.2s; }
.footer a:hover { opacity: 1; }
.footer-bottom {
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 24px; border-top: 1px solid rgba(0,0,0,0.06);
  font-size: 12px; color: var(--gray-1);
}
.footer-socials { display: flex; gap: 20px; }
.footer-socials a { color: var(--gray-1); text-decoration: none; font-size: 12px; }

/* ═══ RESPONSIVE ═══ */
@media (max-width: 768px) {
  .nav-links { display: none; }
  .nav-links.mobile-open {
    display: flex; flex-direction: column; position: fixed;
    inset: 0; background: rgba(251,251,253,0.97);
    backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
    padding: 100px 32px 40px; gap: 24px; z-index: 99;
  }
  .nav-links.mobile-open a { font-size: 28px; font-weight: 700; opacity: 1; color: var(--black); }
  .nav-mobile-toggle { display: block; z-index: 101; }
  .hero { padding: 100px 20px 60px; }
  .hero h1 { font-size: 40px; }
  .hero-stat-row { gap: 24px; flex-wrap: wrap; }
  .bento { grid-template-columns: 1fr; }
  .bento-big { grid-column: span 1; }
  .pricing-grid { grid-template-columns: 1fr; max-width: 400px; }
  .compare-table { overflow-x: auto; }
  .compare-table table { min-width: 600px; }
  .footer-grid { grid-template-columns: 1fr 1fr; gap: 24px; }
  .section { padding: 80px 20px; }
  .cta-banner { margin: 0 16px; padding: 60px 24px; border-radius: 24px; }
}
`;

const HTML = `
<!-- NAV -->
<nav class="nav" id="nav">
  <div class="nav-inner">
    <a href="/" class="nav-logo">p<span class="e">eee</span>ky</a>
    <ul class="nav-links">
      <li><a href="#features">Features</a></li>
      <li><a href="#compare">Compare</a></li>
      <li><a href="#pricing">Pricing</a></li>
      <li><a href="/blog">Blog</a></li>
      <li><a href="#faq">FAQ</a></li>
      <li><a href="/login" class="nav-cta">Get Started Free</a></li>
    </ul>
    <button class="nav-mobile-toggle" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-eyebrow">
    <span class="dot"></span>
    Document intelligence for modern teams
  </div>
  <h1>
    Share documents.<br/>
    <span class="highlight">Know who reads them.</span>
  </h1>
  <p class="hero-sub">
    Track every page, see engagement in real time, and let recipients chat with your content using AI.
  </p>
  <div class="hero-ctas">
    <a href="/login" class="btn-main">Start for free &rarr;</a>
    <a href="#features" class="btn-ghost">See how it works</a>
  </div>
  <div class="hero-stat-row">
    <div class="hero-stat">
      <div class="hero-stat-num">10K+</div>
      <div class="hero-stat-label">Documents tracked</div>
    </div>
    <div class="hero-stat">
      <div class="hero-stat-num">50K+</div>
      <div class="hero-stat-label">Page views analyzed</div>
    </div>
    <div class="hero-stat">
      <div class="hero-stat-num">98%</div>
      <div class="hero-stat-label">Uptime SLA</div>
    </div>
  </div>
</section>

<!-- FEATURES -->
<section class="section section-gray fade-in" id="features">
  <div class="section-eyebrow">Features</div>
  <h2 class="section-title">Everything you need to share with confidence.</h2>
  <p class="section-sub">Page-level analytics, AI chat, and smart follow-ups — in one elegant viewer.</p>

  <div class="bento">
    <div class="bento-card bento-big">
      <div class="bento-icon">📊</div>
      <div class="bento-title">Page-level analytics</div>
      <div class="bento-desc">See exactly which pages each viewer reads, how long they spend, and where they drop off. Heatmaps show engagement intensity across your entire document.</div>
    </div>
    <div class="bento-card">
      <div class="bento-icon">🤖</div>
      <div class="bento-title">AI Chat</div>
      <div class="bento-desc">Recipients ask questions and get instant answers from your document. You see every question — revealing exactly what they care about.</div>
    </div>
    <div class="bento-card">
      <div class="bento-icon">🔔</div>
      <div class="bento-title">Smart follow-ups</div>
      <div class="bento-desc">Get notified the moment someone views your document. High-engagement alerts include AI-suggested next steps.</div>
    </div>
    <div class="bento-card">
      <div class="bento-icon">🔒</div>
      <div class="bento-title">Access controls</div>
      <div class="bento-desc">Password protection, email verification, expiration dates, download control, and dynamic watermarking per viewer.</div>
    </div>
    <div class="bento-card bento-big">
      <div class="bento-icon">📁</div>
      <div class="bento-title">Data Rooms</div>
      <div class="bento-desc">Bundle multiple documents into a single shared link with per-viewer, per-document permissions. Built for M&A, fundraising, and due diligence — with full audit trails.</div>
    </div>
  </div>
</section>

<!-- COMPARE -->
<section class="section fade-in" id="compare">
  <div class="section-eyebrow">Compare</div>
  <h2 class="section-title">Why teams switch to Peeeky.</h2>
  <p class="section-sub">More features, lower price, and a free tier that actually works.</p>

  <div class="compare-table">
    <table>
      <thead>
        <tr>
          <th>Feature</th>
          <th>Email / Drive</th>
          <th>DocSend</th>
          <th class="peeeky-col">Peeeky</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Time per page</td><td class="x">✗</td><td class="x">✗</td><td class="peeeky-col check">✓</td></tr>
        <tr><td>AI Chat with doc</td><td class="x">✗</td><td class="x">✗</td><td class="peeeky-col check">✓</td></tr>
        <tr><td>Engagement score</td><td class="x">✗</td><td class="x">✗</td><td class="peeeky-col check">✓</td></tr>
        <tr><td>Smart follow-up alerts</td><td class="x">✗</td><td class="x">✗</td><td class="peeeky-col check">✓</td></tr>
        <tr><td>Data Rooms (VDR)</td><td class="x">✗</td><td class="check">✓</td><td class="peeeky-col check">✓</td></tr>
        <tr><td>Free plan</td><td class="check">✓</td><td class="x">✗</td><td class="peeeky-col check">✓</td></tr>
        <tr><td>Starting price</td><td>Free</td><td>$45/user/mo</td><td class="peeeky-col" style="color:var(--accent);">$39/mo flat</td></tr>
      </tbody>
    </table>
  </div>
</section>

<!-- USE CASES -->
<section class="section section-dark fade-in">
  <div class="section-eyebrow">Use Cases</div>
  <h2 class="section-title">Built for people who share to win.</h2>
  <p class="section-sub">From pitch decks to proposals, Peeeky gives you the edge.</p>

  <div class="bento" style="margin-top: 48px;">
    <div class="bento-card">
      <div class="bento-icon">🚀</div>
      <div class="bento-title">Fundraising</div>
      <div class="bento-desc">Know which investors read your deck, which pages they linger on, and when to follow up. Stop guessing, start closing.</div>
      <a href="/for/fundraising" style="display:inline-block;margin-top:16px;font-size:14px;font-weight:600;color:var(--accent);text-decoration:none;">Learn more &rarr;</a>
    </div>
    <div class="bento-card">
      <div class="bento-icon">💼</div>
      <div class="bento-title">Sales</div>
      <div class="bento-desc">Send proposals with full visibility. Engagement scores tell you who's ready to buy and who needs another touch.</div>
      <a href="/for/sales" style="display:inline-block;margin-top:16px;font-size:14px;font-weight:600;color:var(--accent);text-decoration:none;">Learn more &rarr;</a>
    </div>
    <div class="bento-card">
      <div class="bento-icon">🏦</div>
      <div class="bento-title">M&A / Due Diligence</div>
      <div class="bento-desc">Secure Data Rooms with per-document permissions, full audit trails, and granular access control by party.</div>
      <a href="/for/mna" style="display:inline-block;margin-top:16px;font-size:14px;font-weight:600;color:var(--accent);text-decoration:none;">Learn more &rarr;</a>
    </div>
  </div>
</section>

<!-- PRICING -->
<section class="section section-gray fade-in" id="pricing">
  <div class="section-eyebrow">Pricing</div>
  <h2 class="section-title">Simple, transparent pricing.</h2>
  <p class="section-sub">Start free. Upgrade when you're ready.</p>

  <div class="pricing-toggle">
    <span id="monthly-label" class="toggle-label active">Monthly</span>
    <div class="toggle-switch" id="pricing-toggle"></div>
    <span id="annual-label" class="toggle-label">Annual <span style="color:var(--accent);font-weight:600;">save 17%</span></span>
  </div>

  <div class="pricing-grid">
    <div class="pricing-card">
      <div class="plan-name">Free</div>
      <div class="plan-desc">For getting started</div>
      <div class="plan-price">$0<span>/mo</span></div>
      <ul class="plan-features">
        <li>5 documents</li>
        <li>3 links per document</li>
        <li>Basic analytics</li>
        <li>Password protection</li>
        <li>Peeeky branding</li>
      </ul>
      <a href="/login" class="plan-cta plan-cta-outline">Get started</a>
    </div>
    <div class="pricing-card featured">
      <div class="plan-name">Pro</div>
      <div class="plan-desc">For growing teams</div>
      <div class="plan-price" id="pro-price">$39<span>/mo</span></div>
      <ul class="plan-features">
        <li>Unlimited documents</li>
        <li>Unlimited links</li>
        <li>Full analytics + heatmaps</li>
        <li>AI Chat (50/mo)</li>
        <li>Email + Slack alerts</li>
        <li>Custom logo</li>
        <li>3 team members</li>
      </ul>
      <a href="/login" class="plan-cta plan-cta-main">Start free trial</a>
    </div>
    <div class="pricing-card">
      <div class="plan-name">Business</div>
      <div class="plan-desc">For serious deal flow</div>
      <div class="plan-price" id="biz-price">$129<span>/mo</span></div>
      <ul class="plan-features">
        <li>Everything in Pro</li>
        <li>Unlimited AI Chat</li>
        <li>Data Rooms (VDR)</li>
        <li>Custom domain</li>
        <li>Brand colors</li>
        <li>Audit log</li>
        <li>10 team members</li>
      </ul>
      <a href="/login" class="plan-cta plan-cta-outline">Contact us</a>
    </div>
  </div>
</section>

<!-- FAQ -->
<section class="section fade-in" id="faq">
  <div class="section-eyebrow">FAQ</div>
  <h2 class="section-title">Questions? Answers.</h2>

  <div class="faq-list">
    <div class="faq-item">
      <div class="faq-q">Is there really a free plan?<span class="icon">+</span></div>
      <div class="faq-a"><p>Yes. 5 documents, unlimited viewers, basic analytics. No credit card. No time limit. Use it forever.</p></div>
    </div>
    <div class="faq-item">
      <div class="faq-q">How does page tracking work?<span class="icon">+</span></div>
      <div class="faq-a"><p>Recipients view your document in our secure viewer. We track time on each page, device, location, and completion — without requiring them to create an account.</p></div>
    </div>
    <div class="faq-item">
      <div class="faq-q">Is my document secure?<span class="icon">+</span></div>
      <div class="faq-a"><p>Documents are stored encrypted, served via short-lived signed URLs, and never downloadable unless you allow it. You can revoke access to any link at any time.</p></div>
    </div>
    <div class="faq-item">
      <div class="faq-q">What is AI Chat?<span class="icon">+</span></div>
      <div class="faq-a"><p>Recipients can ask questions about your document and get instant AI answers based solely on its content. You see every question asked — giving you insight into what they care about.</p></div>
    </div>
    <div class="faq-item">
      <div class="faq-q">Can I use my own domain?<span class="icon">+</span></div>
      <div class="faq-a"><p>Yes, on the Business plan. Your links become docs.yourcompany.com with your logo and brand colors.</p></div>
    </div>
    <div class="faq-item">
      <div class="faq-q">How is this different from DocSend?<span class="icon">+</span></div>
      <div class="faq-a"><p>Peeeky has page-level time tracking, AI Chat, engagement scoring, and smart follow-ups — features DocSend doesn't offer. Plus a generous free tier and lower pricing ($39 vs $45+/user).</p></div>
    </div>
  </div>
</section>

<!-- CTA BANNER -->
<section class="section fade-in" style="padding-bottom: 80px;">
  <div class="cta-banner">
    <h2>Start tracking your<br/>documents today.</h2>
    <p>Free forever. No credit card required. Set up in 30 seconds.</p>
    <a href="/login" class="btn-main">Get started free &rarr;</a>
  </div>
</section>

<!-- FOOTER -->
<footer class="footer">
  <div class="footer-grid">
    <div>
      <div class="footer-brand-name">p<span class="e">eee</span>ky</div>
      <p class="footer-brand-tagline">Document intelligence for<br/>modern teams.</p>
    </div>
    <div>
      <h4>Product</h4>
      <ul>
        <li><a href="#features">Features</a></li>
        <li><a href="#pricing">Pricing</a></li>
        <li><a href="#compare">Compare</a></li>
        <li><a href="/blog">Blog</a></li>
      </ul>
    </div>
    <div>
      <h4>Compare</h4>
      <ul>
        <li><a href="/vs/docsend">vs DocSend</a></li>
        <li><a href="/vs/google-drive">vs Google Drive</a></li>
        <li><a href="/vs/wetransfer">vs WeTransfer</a></li>
      </ul>
    </div>
    <div>
      <h4>Use Cases</h4>
      <ul>
        <li><a href="/for/fundraising">Fundraising</a></li>
        <li><a href="/for/sales">Sales Teams</a></li>
        <li><a href="/for/mna">M&A</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <span>&copy; 2026 Peeeky. All rights reserved.</span>
    <div class="footer-socials">
      <a href="#">Twitter/X</a>
      <a href="#">LinkedIn</a>
    </div>
  </div>
</footer>
`;

export function LandingPage() {
  useEffect(() => {
    // Nav scroll
    const nav = document.getElementById("nav");
    const handleScroll = () => nav?.classList.toggle("scrolled", window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);

    // Scroll animations
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.08, rootMargin: "0px 0px -60px 0px" }
    );
    document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));

    // Pricing toggle
    let annual = false;
    const togglePricing = () => {
      annual = !annual;
      const toggle = document.getElementById("pricing-toggle");
      const proPrice = document.getElementById("pro-price");
      const bizPrice = document.getElementById("biz-price");
      const monthlyLabel = document.getElementById("monthly-label");
      const annualLabel = document.getElementById("annual-label");
      toggle?.classList.toggle("on", annual);
      monthlyLabel?.classList.toggle("active", !annual);
      annualLabel?.classList.toggle("active", annual);
      if (proPrice) proPrice.innerHTML = annual ? '$32<span>/mo</span>' : '$39<span>/mo</span>';
      if (bizPrice) bizPrice.innerHTML = annual ? '$107<span>/mo</span>' : '$129<span>/mo</span>';
    };
    const pricingToggle = document.getElementById("pricing-toggle");
    pricingToggle?.addEventListener("click", togglePricing);

    // FAQ
    document.querySelectorAll(".faq-item").forEach((item) => {
      item.addEventListener("click", () => item.classList.toggle("open"));
    });

    // Mobile nav
    const mobileToggle = document.querySelector(".nav-mobile-toggle");
    mobileToggle?.addEventListener("click", () => {
      document.querySelector(".nav-links")?.classList.toggle("mobile-open");
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
      pricingToggle?.removeEventListener("click", togglePricing);
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div dangerouslySetInnerHTML={{ __html: HTML }} />
    </>
  );
}
