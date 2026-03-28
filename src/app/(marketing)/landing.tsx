"use client";

import { useEffect, useRef } from "react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

:root {
  --font: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  --black: #0a0a0b;
  --black-2: #141416;
  --gray-1: #86868b;
  --gray-2: #afafb6;
  --gray-3: #f5f5f7;
  --white: #fbfbfd;
  --accent: #6C5CE7;
  --accent-2: #a78bfa;
  --accent-glow: rgba(108, 92, 231, 0.12);
  --accent-glow-strong: rgba(108, 92, 231, 0.3);
  --spring: cubic-bezier(0.32, 0.72, 0, 1);
  --expo: cubic-bezier(0.16, 1, 0.3, 1);
  --smooth: cubic-bezier(0.4, 0, 0.2, 1);
}

html { scroll-behavior: smooth; }
body {
  font-family: var(--font); color: var(--black); background: var(--black);
  -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

/* ═══ GRAIN OVERLAY ═══ */
.grain {
  position: fixed; inset: 0; z-index: 9999; pointer-events: none;
  opacity: 0.025;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-repeat: repeat; background-size: 180px;
}

/* ═══ NAV ═══ */
.nav {
  position: fixed; top: 16px; left: 50%; transform: translateX(-50%);
  z-index: 100; width: max-content; max-width: calc(100% - 32px);
  padding: 0 8px;
  border-radius: 980px;
  background: rgba(10,10,11,0.65);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border: 1px solid rgba(255,255,255,0.08);
  transition: all 0.6s var(--expo);
}
.nav.scrolled {
  background: rgba(10,10,11,0.85);
  border-color: rgba(255,255,255,0.1);
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
}
.nav-inner {
  display: flex; align-items: center; justify-content: center;
  height: 48px; gap: 6px; padding: 0 12px;
}
.nav-logo {
  font-weight: 800; font-size: 17px; color: white;
  text-decoration: none; letter-spacing: -0.5px; margin-right: 16px;
}
.nav-logo .e { color: var(--accent-2); }
.nav-links { display: flex; align-items: center; gap: 4px; list-style: none; }
.nav-links a {
  font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.55);
  text-decoration: none; padding: 6px 12px; border-radius: 980px;
  transition: all 0.3s var(--expo);
}
.nav-links a:hover { color: white; background: rgba(255,255,255,0.08); }
.nav-cta {
  color: white !important; opacity: 1 !important;
  background: var(--accent) !important;
  padding: 7px 18px !important; border-radius: 980px !important;
  font-weight: 600 !important; font-size: 12px !important;
  transition: all 0.4s var(--spring) !important;
}
.nav-cta:hover { background: var(--accent-2) !important; transform: scale(1.04); }

.nav-mobile-toggle { display: none; background: none; border: none; cursor: pointer; padding: 8px; }
.nav-mobile-toggle span { display: block; width: 16px; height: 1.5px; background: white; margin: 3px 0; border-radius: 2px; }

/* ═══ HERO ═══ */
.hero {
  min-height: 100dvh; display: flex; flex-direction: column;
  align-items: center; justify-content: center; text-align: center;
  padding: 140px 24px 100px; position: relative; overflow: hidden;
  background: var(--black);
}

/* Animated gradient orbs */
.hero-orb {
  position: absolute; border-radius: 50%; filter: blur(80px);
  pointer-events: none; opacity: 0.5;
  animation: orbFloat 12s ease-in-out infinite alternate;
}
.hero-orb-1 {
  width: 600px; height: 600px; top: -15%; left: 30%;
  background: radial-gradient(circle, rgba(108,92,231,0.35) 0%, transparent 70%);
  animation-delay: 0s;
}
.hero-orb-2 {
  width: 400px; height: 400px; bottom: 10%; right: 15%;
  background: radial-gradient(circle, rgba(167,139,250,0.25) 0%, transparent 70%);
  animation-delay: -4s; animation-duration: 15s;
}
.hero-orb-3 {
  width: 300px; height: 300px; top: 40%; left: -5%;
  background: radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%);
  animation-delay: -8s; animation-duration: 18s;
}
@keyframes orbFloat {
  0% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -20px) scale(1.05); }
  66% { transform: translate(-20px, 15px) scale(0.95); }
  100% { transform: translate(10px, -30px) scale(1.02); }
}

/* Grid pattern */
.hero-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
  background-size: 80px 80px;
  mask-image: radial-gradient(ellipse 60% 50% at 50% 40%, black 10%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse 60% 50% at 50% 40%, black 10%, transparent 70%);
}

.hero-content { position: relative; z-index: 2; max-width: 900px; }

.hero-badge {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 8px 20px 8px 14px; border-radius: 980px;
  background: rgba(108,92,231,0.1);
  border: 1px solid rgba(108,92,231,0.2);
  font-size: 13px; font-weight: 600; color: var(--accent-2);
  margin-bottom: 32px;
  opacity: 0; transform: translateY(20px) scale(0.96);
  animation: heroIn 1s var(--expo) 0.1s forwards;
}
.hero-badge .dot {
  width: 7px; height: 7px; background: #34d399; border-radius: 50%;
  box-shadow: 0 0 8px rgba(52,211,153,0.5);
  animation: pulse 2.5s ease-in-out infinite;
}
@keyframes pulse { 0%,100% { opacity:1; box-shadow: 0 0 8px rgba(52,211,153,0.5); } 50% { opacity:0.5; box-shadow: 0 0 16px rgba(52,211,153,0.3); } }

.hero h1 {
  font-size: clamp(48px, 7.5vw, 88px); font-weight: 800;
  line-height: 0.95; letter-spacing: -0.05em; color: white;
  opacity: 0; transform: translateY(40px);
  animation: heroIn 1.1s var(--expo) 0.2s forwards;
}
.hero h1 .grad {
  background: linear-gradient(135deg, #a78bfa 0%, #6C5CE7 40%, #818cf8 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-sub {
  font-size: clamp(17px, 2vw, 21px); line-height: 1.55;
  color: var(--gray-2); max-width: 480px; margin: 28px auto 0;
  opacity: 0; transform: translateY(30px);
  animation: heroIn 1.1s var(--expo) 0.35s forwards;
}
.hero-ctas {
  display: flex; align-items: center; justify-content: center;
  gap: 12px; margin-top: 44px; flex-wrap: wrap;
  opacity: 0; transform: translateY(30px);
  animation: heroIn 1.1s var(--expo) 0.5s forwards;
}
@keyframes heroIn { to { opacity: 1; transform: translateY(0) scale(1); } }

.btn-hero {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 16px 36px; font-size: 16px; font-weight: 700;
  background: white; color: var(--black); border: none;
  border-radius: 980px; cursor: pointer; text-decoration: none;
  position: relative; overflow: hidden;
  transition: all 0.5s var(--spring);
}
.btn-hero::before {
  content: ''; position: absolute; inset: -1px; border-radius: 980px;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  z-index: -1; opacity: 0; transition: opacity 0.4s;
}
.btn-hero:hover { transform: translateY(-2px) scale(1.03); color: white; background: transparent; }
.btn-hero:hover::before { opacity: 1; }
.btn-hero:active { transform: scale(0.97); }
.btn-hero .arrow {
  display: inline-flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border-radius: 50%;
  background: rgba(0,0,0,0.08); font-size: 14px;
  transition: all 0.4s var(--spring);
}
.btn-hero:hover .arrow { background: rgba(255,255,255,0.2); transform: translateX(2px); }

.btn-ghost-hero {
  padding: 16px 32px; font-size: 16px; font-weight: 600;
  color: rgba(255,255,255,0.6); text-decoration: none;
  border-radius: 980px;
  transition: all 0.3s var(--expo);
}
.btn-ghost-hero:hover { color: white; background: rgba(255,255,255,0.06); }

/* Stats row */
.hero-stats {
  display: flex; justify-content: center; gap: 56px; margin-top: 80px;
  opacity: 0; animation: heroIn 1s var(--expo) 0.7s forwards;
}
.hero-stat { text-align: center; }
.hero-stat-num {
  font-size: 36px; font-weight: 800; letter-spacing: -0.04em;
  background: linear-gradient(180deg, white 30%, rgba(255,255,255,0.4) 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-stat-label { font-size: 13px; color: var(--gray-1); margin-top: 4px; font-weight: 500; }
.hero-stat-divider { width: 1px; height: 40px; background: rgba(255,255,255,0.08); align-self: center; }

/* Mockup */
.hero-mockup {
  margin-top: 80px; position: relative; max-width: 900px; width: 100%;
  opacity: 0; transform: translateY(60px) perspective(1200px) rotateX(5deg);
  animation: mockupIn 1.4s var(--expo) 0.8s forwards;
}
@keyframes mockupIn { to { opacity: 1; transform: translateY(0) perspective(1200px) rotateX(0deg); } }

.mockup-shell {
  background: var(--black-2);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px; overflow: hidden;
  box-shadow: 0 40px 120px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.05);
}
.mockup-bar {
  height: 40px; background: rgba(255,255,255,0.03);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  display: flex; align-items: center; padding: 0 16px; gap: 8px;
}
.mockup-dot { width: 10px; height: 10px; border-radius: 50%; }
.mockup-dot-r { background: #ff5f57; }
.mockup-dot-y { background: #febc2e; }
.mockup-dot-g { background: #28c840; }
.mockup-url {
  flex: 1; text-align: center; font-size: 11px; color: rgba(255,255,255,0.3);
  font-weight: 500;
}
.mockup-body {
  padding: 32px; min-height: 280px;
  background: linear-gradient(180deg, rgba(108,92,231,0.04) 0%, transparent 100%);
}
.mockup-row { display: flex; gap: 20px; }
.mockup-sidebar {
  width: 180px; flex-shrink: 0;
}
.mockup-nav-item {
  padding: 10px 14px; border-radius: 10px; margin-bottom: 4px;
  font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.35);
  display: flex; align-items: center; gap: 8px;
}
.mockup-nav-item.active {
  background: rgba(108,92,231,0.12); color: var(--accent-2);
}
.mockup-nav-icon { font-size: 14px; }
.mockup-main { flex: 1; }
.mockup-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
.mockup-stat-card {
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px; padding: 16px;
}
.mockup-stat-label { font-size: 10px; color: rgba(255,255,255,0.3); margin-bottom: 4px; font-weight: 500; }
.mockup-stat-value { font-size: 22px; font-weight: 800; color: white; letter-spacing: -0.03em; }
.mockup-chart {
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px; padding: 20px; height: 120px;
  display: flex; align-items: flex-end; gap: 6px;
}
.mockup-bar-item {
  flex: 1; border-radius: 4px 4px 0 0;
  background: linear-gradient(180deg, var(--accent) 0%, rgba(108,92,231,0.3) 100%);
  transition: height 0.8s var(--spring);
}

/* ═══ WHITE SECTIONS ═══ */
.white-zone { background: var(--white); }

.section {
  padding: 140px 24px; text-align: center;
}
.section-reveal {
  opacity: 0; transform: translateY(50px);
  transition: opacity 1s var(--expo), transform 1s var(--expo);
}
.section-reveal.visible { opacity: 1; transform: translateY(0); }

.section-eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 13px; font-weight: 700; color: var(--accent);
  text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 20px;
}
.section-eyebrow::before {
  content: ''; width: 20px; height: 1.5px; background: var(--accent); border-radius: 2px;
}
.section-title {
  font-size: clamp(36px, 5.5vw, 68px); font-weight: 800;
  line-height: 1.02; letter-spacing: -0.045em;
  max-width: 700px; margin: 0 auto 20px;
}
.section-sub {
  font-size: 18px; color: var(--gray-1); max-width: 480px;
  margin: 0 auto; line-height: 1.55;
}

/* Dark section variant */
.section-dark { background: var(--black); color: white; }
.section-dark .section-eyebrow { color: var(--accent-2); }
.section-dark .section-eyebrow::before { background: var(--accent-2); }
.section-dark .section-sub { color: var(--gray-2); }

/* Gray section variant */
.section-soft { background: var(--gray-3); }

/* ═══ BENTO FEATURES ═══ */
.bento {
  display: grid; grid-template-columns: repeat(12, 1fr);
  gap: 12px; max-width: 1080px; margin: 64px auto 0;
  text-align: left;
}
.bento-card {
  border-radius: 20px; padding: 36px 30px;
  position: relative; overflow: hidden;
  border: 1px solid rgba(0,0,0,0.06);
  background: white;
  transition: all 0.6s var(--spring);
}
.bento-card::before {
  content: ''; position: absolute; inset: 0;
  border-radius: 20px; padding: 1px;
  background: linear-gradient(135deg, transparent 40%, var(--accent-glow) 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  opacity: 0; transition: opacity 0.6s var(--expo);
  pointer-events: none;
}
.bento-card:hover::before { opacity: 1; }
.bento-card:hover { transform: translateY(-4px); box-shadow: 0 24px 64px rgba(0,0,0,0.06); }

.bento-8 { grid-column: span 8; }
.bento-4 { grid-column: span 4; }
.bento-6 { grid-column: span 6; }

.section-dark .bento-card {
  background: var(--black-2);
  border-color: rgba(255,255,255,0.06);
}
.section-dark .bento-card:hover { box-shadow: 0 24px 64px rgba(0,0,0,0.4); }

.bento-icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 20px; font-size: 20px; font-weight: 700;
  background: var(--accent-glow); color: var(--accent);
  transition: all 0.5s var(--spring);
}
.bento-card:hover .bento-icon { transform: scale(1.08) rotate(-3deg); background: var(--accent-glow-strong); }

.section-dark .bento-icon { background: rgba(108,92,231,0.15); color: var(--accent-2); }
.section-dark .bento-card:hover .bento-icon { background: rgba(108,92,231,0.25); }

.bento-title { font-size: 20px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 8px; }
.bento-desc { font-size: 14px; color: var(--gray-1); line-height: 1.6; }
.section-dark .bento-desc { color: var(--gray-2); }

.bento-visual {
  margin-top: 20px; height: 120px; border-radius: 12px;
  background: var(--gray-3); overflow: hidden; position: relative;
}
.section-dark .bento-visual { background: rgba(255,255,255,0.04); }

.bento-bars {
  display: flex; align-items: flex-end; gap: 4px; height: 100%; padding: 16px;
}
.bento-bar {
  flex: 1; border-radius: 4px 4px 0 0;
  background: linear-gradient(180deg, var(--accent) 0%, rgba(108,92,231,0.2) 100%);
  opacity: 0; transform: scaleY(0); transform-origin: bottom;
  transition: all 0.8s var(--spring);
}
.visible .bento-bar { opacity: 1; transform: scaleY(1); }

.bento-link {
  display: inline-flex; align-items: center; gap: 4px;
  margin-top: 16px; font-size: 14px; font-weight: 600;
  color: var(--accent); text-decoration: none;
  transition: gap 0.3s var(--spring);
}
.bento-link:hover { gap: 8px; }
.section-dark .bento-link { color: var(--accent-2); }

/* ═══ COMPARISON ═══ */
.compare-wrap {
  max-width: 820px; margin: 56px auto 0; border-radius: 20px; overflow: hidden;
  border: 1px solid rgba(0,0,0,0.06); background: white;
  box-shadow: 0 4px 24px rgba(0,0,0,0.03);
}
.compare-wrap table { width: 100%; border-collapse: collapse; text-align: center; }
.compare-wrap th {
  padding: 16px 20px; font-size: 12px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.06em;
  background: var(--gray-3); color: var(--gray-1);
  border-bottom: 1px solid rgba(0,0,0,0.06);
}
.compare-wrap th:first-child { text-align: left; }
.compare-wrap td {
  padding: 14px 20px; font-size: 14px;
  border-bottom: 1px solid rgba(0,0,0,0.03);
}
.compare-wrap td:first-child { text-align: left; font-weight: 500; }
.compare-wrap tr:last-child td { border-bottom: none; }
.compare-check { color: var(--accent); font-weight: 700; }
.compare-x { color: var(--gray-2); }
.compare-peeeky {
  background: rgba(108,92,231,0.04); font-weight: 600;
}

/* ═══ TESTIMONIALS ═══ */
.testimonials {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 16px; max-width: 1080px; margin: 56px auto 0;
  text-align: left;
}
.testimonial-card {
  padding: 32px 28px; border-radius: 20px;
  background: white; border: 1px solid rgba(0,0,0,0.05);
  transition: all 0.5s var(--spring);
}
.testimonial-card:hover { transform: translateY(-3px); box-shadow: 0 16px 48px rgba(0,0,0,0.06); }
.testimonial-quote {
  font-size: 15px; line-height: 1.6; color: var(--black);
  margin-bottom: 20px; font-style: italic;
}
.testimonial-quote::before { content: '"'; font-size: 32px; font-weight: 800; color: var(--accent); line-height: 0; vertical-align: -8px; margin-right: 2px; }
.testimonial-author { display: flex; align-items: center; gap: 12px; }
.testimonial-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 700; color: white;
}
.testimonial-name { font-size: 13px; font-weight: 700; }
.testimonial-role { font-size: 12px; color: var(--gray-1); }

/* ═══ PRICING ═══ */
.pricing-toggle {
  display: inline-flex; align-items: center; gap: 12px;
  margin: 32px auto 56px; font-size: 14px; color: var(--gray-1);
}
.toggle-sw {
  width: 44px; height: 24px; border-radius: 980px;
  background: var(--gray-2); position: relative; cursor: pointer;
  transition: background 0.3s var(--spring);
}
.toggle-sw.on { background: var(--accent); }
.toggle-sw::after {
  content: ''; position: absolute; top: 3px; left: 3px;
  width: 18px; height: 18px; border-radius: 50%;
  background: white; transition: transform 0.35s var(--spring);
  box-shadow: 0 1px 4px rgba(0,0,0,0.15);
}
.toggle-sw.on::after { transform: translateX(20px); }
.toggle-label.active { color: var(--black); font-weight: 600; }

.pricing-grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 12px; max-width: 980px; margin: 0 auto;
  text-align: left;
}
.price-card {
  padding: 36px 28px; border-radius: 20px;
  background: white; border: 1px solid rgba(0,0,0,0.06);
  transition: all 0.5s var(--spring); position: relative;
}
.price-card:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,0.06); }
.price-card.pop {
  border: 2px solid var(--accent);
  box-shadow: 0 0 0 4px var(--accent-glow);
}
.price-card.pop::before {
  content: 'Most Popular'; position: absolute; top: -13px; left: 50%; transform: translateX(-50%);
  background: var(--accent); color: white; padding: 5px 18px; border-radius: 980px;
  font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
}
.price-name { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
.price-desc { font-size: 13px; color: var(--gray-1); margin-bottom: 24px; }
.price-amount {
  font-size: 52px; font-weight: 800; letter-spacing: -0.05em; line-height: 1; margin-bottom: 28px;
}
.price-amount span { font-size: 16px; font-weight: 500; color: var(--gray-1); letter-spacing: 0; }
.price-features { list-style: none; }
.price-features li {
  font-size: 14px; padding: 8px 0;
  border-top: 1px solid rgba(0,0,0,0.04);
}
.price-features li::before { content: '✓  '; color: var(--accent); font-weight: 700; }
.price-cta {
  display: block; text-align: center; padding: 14px; margin-top: 28px;
  border-radius: 14px; font-size: 15px; font-weight: 600;
  text-decoration: none; transition: all 0.4s var(--spring);
}
.price-cta-fill { background: var(--accent); color: white; }
.price-cta-fill:hover { background: var(--accent-2); transform: scale(1.02); }
.price-cta-line { color: var(--accent); border: 1.5px solid rgba(108,92,231,0.3); background: transparent; }
.price-cta-line:hover { background: var(--accent-glow); border-color: var(--accent); }

/* ═══ FAQ ═══ */
.faq-list { max-width: 640px; margin: 56px auto 0; text-align: left; }
.faq-item { border-bottom: 1px solid rgba(0,0,0,0.06); cursor: pointer; padding: 20px 0; }
.faq-q {
  display: flex; align-items: center; justify-content: space-between;
  font-size: 17px; font-weight: 600;
}
.faq-q .ico {
  width: 28px; height: 28px; border-radius: 50%;
  background: var(--gray-3); display: flex; align-items: center; justify-content: center;
  font-size: 18px; color: var(--gray-1); font-weight: 300;
  transition: all 0.4s var(--spring); flex-shrink: 0;
}
.faq-item.open .faq-q .ico { background: var(--accent); color: white; transform: rotate(45deg); }
.faq-a {
  max-height: 0; overflow: hidden; opacity: 0;
  transition: max-height 0.5s var(--expo), opacity 0.4s, padding 0.4s;
}
.faq-item.open .faq-a { max-height: 200px; opacity: 1; padding-top: 12px; }
.faq-a p { font-size: 15px; color: var(--gray-1); line-height: 1.6; }

/* ═══ CTA BANNER ═══ */
.cta-section { padding: 40px 24px 120px; }
.cta-banner {
  max-width: 1080px; margin: 0 auto;
  background: var(--black); border-radius: 28px;
  padding: 100px 40px; text-align: center; color: white;
  position: relative; overflow: hidden;
}
.cta-banner .hero-orb-1 {
  width: 500px; height: 500px; top: -30%; left: 20%; opacity: 0.4;
}
.cta-banner .hero-orb-2 {
  width: 350px; height: 350px; bottom: -20%; right: 10%; opacity: 0.3;
}
.cta-banner h2 {
  font-size: clamp(34px, 5vw, 56px); font-weight: 800;
  letter-spacing: -0.045em; line-height: 1.02; position: relative;
}
.cta-banner p {
  font-size: 18px; color: var(--gray-2); margin: 16px auto 36px;
  max-width: 400px; line-height: 1.5; position: relative;
}
.cta-banner .btn-hero { position: relative; }

/* ═══ FOOTER ═══ */
.footer {
  padding: 64px 24px 32px; max-width: 1080px; margin: 0 auto;
}
.footer-grid {
  display: grid; grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 40px; margin-bottom: 40px;
}
.footer-logo { font-size: 18px; font-weight: 800; margin-bottom: 8px; }
.footer-logo .e { color: var(--accent); }
.footer-tagline { font-size: 13px; color: var(--gray-1); line-height: 1.5; }
.footer h4 { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--gray-1); margin-bottom: 16px; }
.footer ul { list-style: none; }
.footer li { margin-bottom: 10px; }
.footer a { font-size: 13px; color: var(--black); text-decoration: none; opacity: 0.55; transition: opacity 0.2s; }
.footer a:hover { opacity: 1; }
.footer-bottom {
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 24px; border-top: 1px solid rgba(0,0,0,0.06);
  font-size: 12px; color: var(--gray-1);
}
.footer-socials { display: flex; gap: 20px; }
.footer-socials a { color: var(--gray-1); }

/* ═══ RESPONSIVE ═══ */
@media (max-width: 768px) {
  .nav { top: 12px; }
  .nav-links { display: none; }
  .nav-links.mobile-open {
    display: flex; flex-direction: column; position: fixed;
    inset: 0; background: rgba(10,10,11,0.97);
    backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px);
    padding: 100px 32px 40px; gap: 8px; z-index: 99;
  }
  .nav-links.mobile-open a {
    font-size: 32px !important; font-weight: 700 !important;
    color: white !important; opacity: 1 !important;
    padding: 12px 0 !important; background: none !important;
  }
  .nav-mobile-toggle { display: block; z-index: 101; }
  .hero { padding: 110px 20px 60px; min-height: auto; }
  .hero h1 { font-size: 42px; }
  .hero-stats { flex-direction: column; gap: 16px; }
  .hero-stat-divider { display: none; }
  .hero-mockup { display: none; }
  .bento { grid-template-columns: 1fr; }
  .bento-8, .bento-6, .bento-4 { grid-column: span 1; }
  .pricing-grid { grid-template-columns: 1fr; max-width: 400px; margin: 0 auto; }
  .testimonials { grid-template-columns: 1fr; }
  .compare-wrap { overflow-x: auto; }
  .compare-wrap table { min-width: 580px; }
  .footer-grid { grid-template-columns: 1fr 1fr; gap: 24px; }
  .section { padding: 80px 20px; }
  .cta-section { padding: 20px 16px 80px; }
  .cta-banner { padding: 64px 24px; border-radius: 20px; }
  .mockup-sidebar { display: none; }
  .mockup-cards { grid-template-columns: 1fr; }
}
`;

const HTML = `
<div class="grain"></div>

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
      <li><a href="/login" class="nav-cta">Get Started</a></li>
    </ul>
    <button class="nav-mobile-toggle" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-orb hero-orb-1"></div>
  <div class="hero-orb hero-orb-2"></div>
  <div class="hero-orb hero-orb-3"></div>
  <div class="hero-grid"></div>

  <div class="hero-content">
    <div class="hero-badge">
      <span class="dot"></span>
      Document intelligence for modern teams
    </div>
    <h1>Share documents.<br/><span class="grad">Know who reads them.</span></h1>
    <p class="hero-sub">Track every page, see engagement in real time, and let recipients chat with your content using AI.</p>
    <div class="hero-ctas">
      <a href="/login" class="btn-hero">Start for free <span class="arrow">&rarr;</span></a>
      <a href="#features" class="btn-ghost-hero">See how it works</a>
    </div>

    <div class="hero-stats">
      <div class="hero-stat">
        <div class="hero-stat-num" data-count="10000">0</div>
        <div class="hero-stat-label">Documents tracked</div>
      </div>
      <div class="hero-stat-divider"></div>
      <div class="hero-stat">
        <div class="hero-stat-num" data-count="50000">0</div>
        <div class="hero-stat-label">Page views analyzed</div>
      </div>
      <div class="hero-stat-divider"></div>
      <div class="hero-stat">
        <div class="hero-stat-num" data-count="98" data-suffix="%">0</div>
        <div class="hero-stat-label">Uptime SLA</div>
      </div>
    </div>

    <!-- Product Mockup -->
    <div class="hero-mockup">
      <div class="mockup-shell">
        <div class="mockup-bar">
          <span class="mockup-dot mockup-dot-r"></span>
          <span class="mockup-dot mockup-dot-y"></span>
          <span class="mockup-dot mockup-dot-g"></span>
          <span class="mockup-url">peeeky.com/documents</span>
        </div>
        <div class="mockup-body">
          <div class="mockup-row">
            <div class="mockup-sidebar">
              <div class="mockup-nav-item active"><span class="mockup-nav-icon">&#9635;</span> Documents</div>
              <div class="mockup-nav-item"><span class="mockup-nav-icon">&#9645;</span> Data Rooms</div>
              <div class="mockup-nav-item"><span class="mockup-nav-icon">&#9881;</span> Settings</div>
            </div>
            <div class="mockup-main">
              <div class="mockup-cards">
                <div class="mockup-stat-card">
                  <div class="mockup-stat-label">Total Views</div>
                  <div class="mockup-stat-value">2,847</div>
                </div>
                <div class="mockup-stat-card">
                  <div class="mockup-stat-label">Unique Viewers</div>
                  <div class="mockup-stat-value">184</div>
                </div>
                <div class="mockup-stat-card">
                  <div class="mockup-stat-label">Avg. Score</div>
                  <div class="mockup-stat-value" style="color:var(--accent-2);">76</div>
                </div>
              </div>
              <div class="mockup-chart" id="mockup-chart">
                <div class="mockup-bar-item" style="height:45%"></div>
                <div class="mockup-bar-item" style="height:72%"></div>
                <div class="mockup-bar-item" style="height:58%"></div>
                <div class="mockup-bar-item" style="height:90%"></div>
                <div class="mockup-bar-item" style="height:65%"></div>
                <div class="mockup-bar-item" style="height:82%"></div>
                <div class="mockup-bar-item" style="height:40%"></div>
                <div class="mockup-bar-item" style="height:95%"></div>
                <div class="mockup-bar-item" style="height:55%"></div>
                <div class="mockup-bar-item" style="height:78%"></div>
                <div class="mockup-bar-item" style="height:62%"></div>
                <div class="mockup-bar-item" style="height:85%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- FEATURES -->
<div class="white-zone">
<section class="section section-soft section-reveal" id="features">
  <div class="section-eyebrow">Features</div>
  <h2 class="section-title">Everything you need to share with confidence.</h2>
  <p class="section-sub">Page-level analytics, AI chat, and smart follow-ups — in one elegant viewer.</p>

  <div class="bento">
    <div class="bento-card bento-8">
      <div class="bento-icon">&#x2139;</div>
      <div class="bento-title">Page-level analytics</div>
      <div class="bento-desc">See exactly which pages each viewer reads, how long they spend, and where they drop off. Heatmaps show engagement intensity across your entire document.</div>
      <div class="bento-visual">
        <div class="bento-bars">
          <div class="bento-bar" style="height:45%;transition-delay:0s"></div>
          <div class="bento-bar" style="height:72%;transition-delay:0.05s"></div>
          <div class="bento-bar" style="height:58%;transition-delay:0.1s"></div>
          <div class="bento-bar" style="height:90%;transition-delay:0.15s"></div>
          <div class="bento-bar" style="height:65%;transition-delay:0.2s"></div>
          <div class="bento-bar" style="height:82%;transition-delay:0.25s"></div>
          <div class="bento-bar" style="height:40%;transition-delay:0.3s"></div>
          <div class="bento-bar" style="height:95%;transition-delay:0.35s"></div>
        </div>
      </div>
    </div>
    <div class="bento-card bento-4">
      <div class="bento-icon">&#x2728;</div>
      <div class="bento-title">AI Chat</div>
      <div class="bento-desc">Recipients ask questions and get instant answers from your document. You see every question — revealing what they care about.</div>
    </div>
    <div class="bento-card bento-4">
      <div class="bento-icon">&#x26A1;</div>
      <div class="bento-title">Smart alerts</div>
      <div class="bento-desc">Get notified the moment someone views your document. High-engagement alerts include AI-suggested next steps.</div>
    </div>
    <div class="bento-card bento-4">
      <div class="bento-icon">&#x1F512;</div>
      <div class="bento-title">Access controls</div>
      <div class="bento-desc">Password protection, email verification, expiration dates, download control, and dynamic watermarking per viewer.</div>
    </div>
    <div class="bento-card bento-4">
      <div class="bento-icon">&#x1F4C1;</div>
      <div class="bento-title">Data Rooms</div>
      <div class="bento-desc">Bundle documents into a single link with per-viewer permissions. Built for M&A, fundraising, and due diligence.</div>
    </div>
  </div>
</section>

<!-- COMPARE -->
<section class="section section-reveal" id="compare">
  <div class="section-eyebrow">Compare</div>
  <h2 class="section-title">Why teams switch to Peeeky.</h2>
  <p class="section-sub">More features, lower price, and a free tier that works.</p>

  <div class="compare-wrap">
    <table>
      <thead><tr><th style="text-align:left">Feature</th><th>Email / Drive</th><th>DocSend</th><th class="compare-peeeky">Peeeky</th></tr></thead>
      <tbody>
        <tr><td>Time per page</td><td class="compare-x">&mdash;</td><td class="compare-x">&mdash;</td><td class="compare-peeeky compare-check">&#10003;</td></tr>
        <tr><td>AI Chat with document</td><td class="compare-x">&mdash;</td><td class="compare-x">&mdash;</td><td class="compare-peeeky compare-check">&#10003;</td></tr>
        <tr><td>Engagement score</td><td class="compare-x">&mdash;</td><td class="compare-x">&mdash;</td><td class="compare-peeeky compare-check">&#10003;</td></tr>
        <tr><td>Smart follow-up alerts</td><td class="compare-x">&mdash;</td><td class="compare-x">&mdash;</td><td class="compare-peeeky compare-check">&#10003;</td></tr>
        <tr><td>Data Rooms (VDR)</td><td class="compare-x">&mdash;</td><td class="compare-check">&#10003;</td><td class="compare-peeeky compare-check">&#10003;</td></tr>
        <tr><td>Free plan</td><td class="compare-check">&#10003;</td><td class="compare-x">&mdash;</td><td class="compare-peeeky compare-check">&#10003;</td></tr>
        <tr><td>Starting price</td><td>Free</td><td>$45/user/mo</td><td class="compare-peeeky" style="color:var(--accent);font-weight:700;">$39/mo flat</td></tr>
      </tbody>
    </table>
  </div>
</section>

<!-- TESTIMONIALS -->
<section class="section section-soft section-reveal">
  <div class="section-eyebrow">Testimonials</div>
  <h2 class="section-title">Loved by teams that share to win.</h2>

  <div class="testimonials">
    <div class="testimonial-card">
      <div class="testimonial-quote">Peeeky completely changed how we track investor engagement. We closed our Series A faster because we knew exactly who was interested.</div>
      <div class="testimonial-author">
        <div class="testimonial-avatar">MC</div>
        <div><div class="testimonial-name">Maria Costa</div><div class="testimonial-role">CEO, NovaTech</div></div>
      </div>
    </div>
    <div class="testimonial-card">
      <div class="testimonial-quote">The engagement score is a game changer. We prioritize follow-ups based on data, not guesswork. Our close rate went up 40%.</div>
      <div class="testimonial-author">
        <div class="testimonial-avatar">RS</div>
        <div><div class="testimonial-name">Rafael Santos</div><div class="testimonial-role">Head of Sales, Apex</div></div>
      </div>
    </div>
    <div class="testimonial-card">
      <div class="testimonial-quote">The Data Room feature with per-document permissions saved us weeks during our M&A process. The audit trail is exactly what compliance needed.</div>
      <div class="testimonial-author">
        <div class="testimonial-avatar">AL</div>
        <div><div class="testimonial-name">Ana Lopes</div><div class="testimonial-role">Partner, Helios Capital</div></div>
      </div>
    </div>
  </div>
</section>
</div>

<!-- USE CASES -->
<section class="section section-dark section-reveal">
  <div class="section-eyebrow">Use Cases</div>
  <h2 class="section-title">Built for people who share to win.</h2>
  <p class="section-sub">From pitch decks to proposals, Peeeky gives you the edge.</p>

  <div class="bento" style="grid-template-columns: repeat(3, 1fr);">
    <div class="bento-card">
      <div class="bento-icon">&#x1F680;</div>
      <div class="bento-title">Fundraising</div>
      <div class="bento-desc">Know which investors read your deck, which pages they linger on, and when to follow up. Stop guessing, start closing.</div>
      <a href="/for/fundraising" class="bento-link">Learn more &rarr;</a>
    </div>
    <div class="bento-card">
      <div class="bento-icon">&#x1F4BC;</div>
      <div class="bento-title">Sales</div>
      <div class="bento-desc">Send proposals with full visibility. Engagement scores tell you who's ready to buy and who needs another touch.</div>
      <a href="/for/sales" class="bento-link">Learn more &rarr;</a>
    </div>
    <div class="bento-card">
      <div class="bento-icon">&#x1F3E6;</div>
      <div class="bento-title">M&A / Due Diligence</div>
      <div class="bento-desc">Secure Data Rooms with per-document permissions, full audit trails, and granular access control by party.</div>
      <a href="/for/mna" class="bento-link">Learn more &rarr;</a>
    </div>
  </div>
</section>

<!-- PRICING -->
<div class="white-zone">
<section class="section section-soft section-reveal" id="pricing">
  <div class="section-eyebrow">Pricing</div>
  <h2 class="section-title">Simple, transparent pricing.</h2>
  <p class="section-sub">Start free. Upgrade when you're ready.</p>

  <div class="pricing-toggle">
    <span id="monthly-label" class="toggle-label active">Monthly</span>
    <div class="toggle-sw" id="pricing-toggle"></div>
    <span id="annual-label" class="toggle-label">Annual <span style="color:var(--accent);font-weight:700;">save 17%</span></span>
  </div>

  <div class="pricing-grid">
    <div class="price-card">
      <div class="price-name">Free</div>
      <div class="price-desc">For getting started</div>
      <div class="price-amount">$0<span>/mo</span></div>
      <ul class="price-features">
        <li>5 documents</li>
        <li>3 links per document</li>
        <li>Basic analytics</li>
        <li>Password protection</li>
      </ul>
      <a href="/login" class="price-cta price-cta-line">Get started</a>
    </div>
    <div class="price-card pop">
      <div class="price-name">Pro</div>
      <div class="price-desc">For growing teams</div>
      <div class="price-amount" id="pro-price">$39<span>/mo</span></div>
      <ul class="price-features">
        <li>Unlimited documents</li>
        <li>Full analytics + heatmaps</li>
        <li>AI Chat (50/mo)</li>
        <li>Email + Slack alerts</li>
        <li>Custom logo</li>
        <li>3 team members</li>
      </ul>
      <a href="/login" class="price-cta price-cta-fill">Start free trial</a>
    </div>
    <div class="price-card">
      <div class="price-name">Business</div>
      <div class="price-desc">For serious deal flow</div>
      <div class="price-amount" id="biz-price">$129<span>/mo</span></div>
      <ul class="price-features">
        <li>Everything in Pro</li>
        <li>Unlimited AI Chat</li>
        <li>Data Rooms (VDR)</li>
        <li>Custom domain + colors</li>
        <li>Audit log</li>
        <li>10 team members</li>
      </ul>
      <a href="/login" class="price-cta price-cta-line">Contact us</a>
    </div>
  </div>
</section>

<!-- FAQ -->
<section class="section section-reveal" id="faq">
  <div class="section-eyebrow">FAQ</div>
  <h2 class="section-title">Questions? Answers.</h2>

  <div class="faq-list">
    <div class="faq-item"><div class="faq-q">Is there really a free plan?<span class="ico">+</span></div><div class="faq-a"><p>Yes. 5 documents, unlimited viewers, basic analytics. No credit card. No time limit. Use it forever.</p></div></div>
    <div class="faq-item"><div class="faq-q">How does page tracking work?<span class="ico">+</span></div><div class="faq-a"><p>Recipients view your document in our secure viewer. We track time on each page, device, location, and completion — without requiring them to create an account.</p></div></div>
    <div class="faq-item"><div class="faq-q">Is my document secure?<span class="ico">+</span></div><div class="faq-a"><p>Documents are stored encrypted, served via short-lived signed URLs, and never downloadable unless you allow it. Revoke access anytime.</p></div></div>
    <div class="faq-item"><div class="faq-q">What is AI Chat?<span class="ico">+</span></div><div class="faq-a"><p>Recipients ask questions about your document and get AI answers based solely on its content. You see every question — revealing what they care about.</p></div></div>
    <div class="faq-item"><div class="faq-q">Can I use my own domain?<span class="ico">+</span></div><div class="faq-a"><p>Yes, on the Business plan. Your links become docs.yourcompany.com with your logo and brand colors.</p></div></div>
    <div class="faq-item"><div class="faq-q">How is this different from DocSend?<span class="ico">+</span></div><div class="faq-a"><p>Peeeky has page-level time tracking, AI Chat, engagement scoring, and smart follow-ups — features DocSend doesn't offer. Plus a free tier and $39/mo vs $45+/user.</p></div></div>
  </div>
</section>

<!-- CTA -->
<div class="cta-section section-reveal">
  <div class="cta-banner">
    <div class="hero-orb hero-orb-1"></div>
    <div class="hero-orb hero-orb-2"></div>
    <h2>Start tracking your<br/>documents today.</h2>
    <p>Free forever. No credit card. Set up in 30 seconds.</p>
    <a href="/login" class="btn-hero" style="display:inline-flex;">Get started free <span class="arrow">&rarr;</span></a>
  </div>
</div>
</div>

<!-- FOOTER -->
<div class="white-zone">
<footer class="footer">
  <div class="footer-grid">
    <div>
      <div class="footer-logo">p<span class="e">eee</span>ky</div>
      <p class="footer-tagline">Document intelligence for<br/>modern teams.</p>
    </div>
    <div>
      <h4>Product</h4>
      <ul><li><a href="#features">Features</a></li><li><a href="#pricing">Pricing</a></li><li><a href="#compare">Compare</a></li><li><a href="/blog">Blog</a></li></ul>
    </div>
    <div>
      <h4>Compare</h4>
      <ul><li><a href="/vs/docsend">vs DocSend</a></li><li><a href="/vs/google-drive">vs Google Drive</a></li><li><a href="/vs/wetransfer">vs WeTransfer</a></li></ul>
    </div>
    <div>
      <h4>Use Cases</h4>
      <ul><li><a href="/for/fundraising">Fundraising</a></li><li><a href="/for/sales">Sales Teams</a></li><li><a href="/for/mna">M&A</a></li></ul>
    </div>
  </div>
  <div class="footer-bottom">
    <span>&copy; 2026 Peeeky. All rights reserved.</span>
    <div class="footer-socials"><a href="#">Twitter/X</a><a href="#">LinkedIn</a></div>
  </div>
</footer>
</div>
`;

export function LandingPage() {
  useEffect(() => {
    // Nav scroll
    const nav = document.getElementById("nav");
    const handleScroll = () => nav?.classList.toggle("scrolled", window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);

    // Scroll reveal
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.06, rootMargin: "0px 0px -80px 0px" }
    );
    document.querySelectorAll(".section-reveal").forEach((el) => observer.observe(el));

    // Animated counters
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        const target = parseInt(el.dataset.count || "0");
        const suffix = el.dataset.suffix || "";
        const isK = target >= 1000;
        const duration = 2000;
        const start = performance.now();

        const animate = (now: number) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 4); // ease-out quart
          const current = Math.round(eased * target);

          if (isK) {
            el.textContent = (current / 1000).toFixed(current >= 10000 ? 0 : 1).replace(/\.0$/, '') + "K+" + suffix;
          } else {
            el.textContent = current.toLocaleString() + suffix;
          }

          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
        countObserver.unobserve(el);
      });
    }, { threshold: 0.5 });

    document.querySelectorAll("[data-count]").forEach((el) => countObserver.observe(el));

    // Pricing toggle
    let annual = false;
    const togglePricing = () => {
      annual = !annual;
      const toggle = document.getElementById("pricing-toggle");
      const proPrice = document.getElementById("pro-price");
      const bizPrice = document.getElementById("biz-price");
      const mLabel = document.getElementById("monthly-label");
      const aLabel = document.getElementById("annual-label");
      toggle?.classList.toggle("on", annual);
      mLabel?.classList.toggle("active", !annual);
      aLabel?.classList.toggle("active", annual);
      if (proPrice) proPrice.innerHTML = annual ? '$32<span>/mo</span>' : '$39<span>/mo</span>';
      if (bizPrice) bizPrice.innerHTML = annual ? '$107<span>/mo</span>' : '$129<span>/mo</span>';
    };
    document.getElementById("pricing-toggle")?.addEventListener("click", togglePricing);

    // FAQ
    document.querySelectorAll(".faq-item").forEach((item) => {
      item.addEventListener("click", () => item.classList.toggle("open"));
    });

    // Mobile nav
    document.querySelector(".nav-mobile-toggle")?.addEventListener("click", () => {
      document.querySelector(".nav-links")?.classList.toggle("mobile-open");
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
      countObserver.disconnect();
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div dangerouslySetInnerHTML={{ __html: HTML }} />
    </>
  );
}
