"use client";

import { useEffect } from "react";

const LANDING_CSS = `
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    :root {
      --navy: #1A1A2E;
      --navy-light: #2D2D44;
      --purple: #6C5CE7;
      --purple-light: #A29BFE;
      --purple-glow: rgba(108, 92, 231, 0.3);
      --white: #FFFFFF;
      --ghost: #F8F9FC;
      --gray-50: #F8F9FC;
      --gray-100: #F4F4F8;
      --gray-200: #E8E8F0;
      --gray-300: #D1D1E0;
      --gray-400: #B0B0C4;
      --gray-500: #8E8EA8;
      --gray-600: #6B6B8D;
      --gray-700: #4A4A68;
      --green: #00B894;
      --yellow: #FDCB6E;
      --coral: #E17055;
      --font-display: 'Outfit', sans-serif;
      --font-body: 'DM Sans', sans-serif;
    }

    html { scroll-behavior: smooth; }

    body {
      font-family: var(--font-body);
      color: var(--navy);
      background: var(--white);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      overflow-x: hidden;
    }

    /* ============ NAVBAR ============ */
    .nav {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 100;
      padding: 0 24px;
      transition: background 0.3s, backdrop-filter 0.3s, box-shadow 0.3s;
    }

    .nav.scrolled {
      background: rgba(26, 26, 46, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      box-shadow: 0 1px 0 rgba(255,255,255,0.06);
    }

    .nav-inner {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 72px;
    }

    .nav-logo {
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 24px;
      color: var(--white);
      text-decoration: none;
      letter-spacing: -0.5px;
    }

    .nav-logo .eye {
      display: inline-block;
      color: var(--purple-light);
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 32px;
      list-style: none;
    }

    .nav-links a {
      font-family: var(--font-body);
      font-size: 14px;
      font-weight: 500;
      color: var(--gray-400);
      text-decoration: none;
      transition: color 0.2s;
    }

    .nav-links a:hover { color: var(--white); }

    .nav-cta {
      padding: 8px 20px;
      background: var(--purple);
      color: var(--white) !important;
      border-radius: 8px;
      font-weight: 600 !important;
      transition: transform 0.2s, box-shadow 0.2s, background 0.2s !important;
    }

    .nav-cta:hover {
      background: #7c6df0 !important;
      transform: translateY(-1px);
      box-shadow: 0 4px 20px var(--purple-glow);
    }

    .nav-mobile-toggle {
      display: none;
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
    }

    .nav-mobile-toggle span {
      display: block;
      width: 22px;
      height: 2px;
      background: var(--white);
      margin: 5px 0;
      border-radius: 2px;
      transition: all 0.3s;
    }

    /* ============ HERO ============ */
    .hero {
      position: relative;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--navy);
      overflow: hidden;
      padding: 120px 24px 80px;
    }

    .hero-bg {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse 80% 60% at 50% 0%, rgba(108, 92, 231, 0.15) 0%, transparent 60%),
        radial-gradient(ellipse 60% 40% at 80% 20%, rgba(108, 92, 231, 0.1) 0%, transparent 50%),
        radial-gradient(ellipse 50% 50% at 20% 80%, rgba(108, 92, 231, 0.08) 0%, transparent 50%);
      animation: heroPulse 8s ease-in-out infinite alternate;
    }

    @keyframes heroPulse {
      0% { opacity: 0.8; }
      100% { opacity: 1; }
    }

    .hero-grid {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(108, 92, 231, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(108, 92, 231, 0.05) 1px, transparent 1px);
      background-size: 60px 60px;
      mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 70%);
      -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 70%);
    }

    .hero-content {
      position: relative;
      max-width: 800px;
      text-align: center;
      z-index: 2;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 16px;
      background: rgba(108, 92, 231, 0.12);
      border: 1px solid rgba(108, 92, 231, 0.25);
      border-radius: 100px;
      font-size: 13px;
      font-weight: 500;
      color: var(--purple-light);
      margin-bottom: 32px;
      animation: fadeUp 0.6s ease-out;
    }

    .hero-badge .dot {
      width: 6px;
      height: 6px;
      background: var(--green);
      border-radius: 50%;
      animation: blink 2s ease-in-out infinite;
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    .hero h1 {
      font-family: var(--font-display);
      font-size: clamp(40px, 6vw, 72px);
      font-weight: 800;
      line-height: 1.05;
      letter-spacing: -0.03em;
      color: var(--white);
      margin-bottom: 24px;
      animation: fadeUp 0.6s ease-out 0.1s both;
    }

    .hero h1 .gradient {
      background: linear-gradient(135deg, var(--purple-light) 0%, var(--purple) 50%, #e17055 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero p {
      font-size: clamp(16px, 2vw, 20px);
      line-height: 1.6;
      color: var(--gray-400);
      max-width: 600px;
      margin: 0 auto 40px;
      animation: fadeUp 0.6s ease-out 0.2s both;
    }

    .hero-ctas {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      animation: fadeUp 0.6s ease-out 0.3s both;
      flex-wrap: wrap;
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 32px;
      background: var(--purple);
      color: var(--white);
      font-family: var(--font-display);
      font-size: 16px;
      font-weight: 600;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.25s;
    }

    .btn-primary:hover {
      background: #7c6df0;
      transform: translateY(-2px);
      box-shadow: 0 8px 30px var(--purple-glow);
    }

    .btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 32px;
      background: transparent;
      color: var(--gray-400);
      font-family: var(--font-display);
      font-size: 16px;
      font-weight: 500;
      border: 1px solid var(--navy-light);
      border-radius: 12px;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.25s;
    }

    .btn-secondary:hover {
      color: var(--white);
      border-color: var(--gray-600);
      background: rgba(255,255,255,0.03);
    }

    /* Hero product mockup */
    .hero-mockup {
      margin-top: 64px;
      animation: fadeUp 0.8s ease-out 0.5s both;
      position: relative;
    }

    .mockup-wrapper {
      position: relative;
      max-width: 900px;
      margin: 0 auto;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid rgba(108, 92, 231, 0.2);
      box-shadow:
        0 0 0 1px rgba(108, 92, 231, 0.1),
        0 20px 60px rgba(0, 0, 0, 0.4),
        0 0 120px rgba(108, 92, 231, 0.1);
    }

    .mockup-bar {
      background: #16162a;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .mockup-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--navy-light);
    }

    .mockup-dot:nth-child(1) { background: #E17055; }
    .mockup-dot:nth-child(2) { background: #FDCB6E; }
    .mockup-dot:nth-child(3) { background: #00B894; }

    .mockup-screen {
      background: #0f0f1e;
      padding: 32px;
      min-height: 400px;
    }

    /* Dashboard mockup content */
    .mock-dashboard {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: 24px;
    }

    .mock-sidebar {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .mock-sidebar-item {
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 13px;
      color: var(--gray-500);
      font-family: var(--font-body);
    }

    .mock-sidebar-item.active {
      background: rgba(108, 92, 231, 0.15);
      color: var(--purple-light);
    }

    .mock-main { display: flex; flex-direction: column; gap: 20px; }

    .mock-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .mock-title {
      font-family: var(--font-display);
      font-size: 18px;
      font-weight: 700;
      color: var(--white);
    }

    .mock-btn {
      padding: 6px 14px;
      background: var(--purple);
      color: white;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
    }

    .mock-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }

    .mock-stat-card {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 10px;
      padding: 16px;
    }

    .mock-stat-label {
      font-size: 11px;
      color: var(--gray-500);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 6px;
    }

    .mock-stat-value {
      font-family: var(--font-display);
      font-size: 24px;
      font-weight: 700;
      color: var(--white);
    }

    .mock-stat-value.green { color: var(--green); }
    .mock-stat-value.purple { color: var(--purple-light); }

    .mock-chart {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 10px;
      padding: 20px;
      height: 160px;
      display: flex;
      align-items: flex-end;
      gap: 8px;
    }

    .mock-bar {
      flex: 1;
      border-radius: 4px 4px 0 0;
      transition: height 0.6s ease-out;
    }

    .mock-bar:nth-child(1) { height: 40%; background: var(--purple); opacity: 0.5; }
    .mock-bar:nth-child(2) { height: 65%; background: var(--purple); opacity: 0.6; }
    .mock-bar:nth-child(3) { height: 90%; background: var(--purple); }
    .mock-bar:nth-child(4) { height: 100%; background: linear-gradient(to top, var(--purple), var(--purple-light)); }
    .mock-bar:nth-child(5) { height: 75%; background: var(--purple); opacity: 0.7; }
    .mock-bar:nth-child(6) { height: 55%; background: var(--purple); opacity: 0.55; }
    .mock-bar:nth-child(7) { height: 30%; background: var(--purple); opacity: 0.4; }
    .mock-bar:nth-child(8) { height: 45%; background: var(--purple); opacity: 0.5; }
    .mock-bar:nth-child(9) { height: 80%; background: var(--purple); opacity: 0.75; }
    .mock-bar:nth-child(10) { height: 60%; background: var(--purple); opacity: 0.6; }
    .mock-bar:nth-child(11) { height: 35%; background: var(--purple); opacity: 0.45; }
    .mock-bar:nth-child(12) { height: 50%; background: var(--purple); opacity: 0.5; }

    /* Floating notification mockup */
    .mock-notification {
      position: absolute;
      right: -20px;
      bottom: 80px;
      background: var(--white);
      border-radius: 12px;
      padding: 16px 20px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.3);
      display: flex;
      align-items: flex-start;
      gap: 12px;
      max-width: 300px;
      animation: floatIn 0.8s ease-out 1.2s both;
      z-index: 3;
    }

    @keyframes floatIn {
      from { opacity: 0; transform: translateY(20px) translateX(20px); }
      to { opacity: 1; transform: translateY(0) translateX(0); }
    }

    .mock-notif-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: rgba(108, 92, 231, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: var(--purple);
      font-size: 16px;
    }

    .mock-notif-text {
      font-size: 13px;
      line-height: 1.4;
      color: var(--navy);
    }

    .mock-notif-text strong { font-weight: 600; }
    .mock-notif-text .time { color: var(--gray-500); font-size: 11px; margin-top: 4px; display: block; }

    /* ============ SOCIAL PROOF ============ */
    .social-proof {
      background: var(--navy);
      padding: 0 24px 80px;
      text-align: center;
    }

    .social-proof-inner {
      max-width: 800px;
      margin: 0 auto;
      padding-top: 40px;
      border-top: 1px solid rgba(255,255,255,0.06);
    }

    .social-proof p {
      font-size: 14px;
      color: var(--gray-500);
      margin-bottom: 32px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-weight: 500;
    }

    .logo-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 48px;
      flex-wrap: wrap;
      opacity: 0.4;
    }

    .logo-placeholder {
      font-family: var(--font-display);
      font-size: 18px;
      font-weight: 700;
      color: var(--white);
      letter-spacing: -0.02em;
    }

    /* ============ SECTIONS COMMON ============ */
    .section {
      padding: 120px 24px;
    }

    .section-inner {
      max-width: 1100px;
      margin: 0 auto;
    }

    .section-label {
      font-family: var(--font-display);
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--purple);
      margin-bottom: 16px;
    }

    .section-title {
      font-family: var(--font-display);
      font-size: clamp(32px, 4vw, 48px);
      font-weight: 800;
      line-height: 1.1;
      letter-spacing: -0.03em;
      color: var(--navy);
      margin-bottom: 20px;
    }

    .section-subtitle {
      font-size: 18px;
      line-height: 1.6;
      color: var(--gray-600);
      max-width: 600px;
    }

    /* ============ COMPARISON ============ */
    .comparison {
      background: var(--ghost);
    }

    .comparison-table {
      margin-top: 56px;
      background: var(--white);
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid var(--gray-200);
      box-shadow: 0 4px 24px rgba(26, 26, 46, 0.04);
    }

    .comparison-table table {
      width: 100%;
      border-collapse: collapse;
    }

    .comparison-table thead th {
      padding: 20px 24px;
      text-align: left;
      font-family: var(--font-display);
      font-size: 14px;
      font-weight: 600;
      color: var(--gray-500);
      border-bottom: 1px solid var(--gray-200);
      background: var(--gray-50);
    }

    .comparison-table thead th:last-child {
      color: var(--purple);
      background: rgba(108, 92, 231, 0.04);
    }

    .comparison-table tbody td {
      padding: 16px 24px;
      font-size: 14px;
      color: var(--gray-600);
      border-bottom: 1px solid var(--gray-100);
    }

    .comparison-table tbody td:first-child {
      font-weight: 500;
      color: var(--navy);
    }

    .comparison-table tbody td:last-child {
      background: rgba(108, 92, 231, 0.02);
      font-weight: 600;
      color: var(--navy);
    }

    .comparison-table tbody tr:last-child td { border-bottom: none; }

    .check { color: var(--green); font-weight: 700; font-size: 16px; }
    .cross { color: var(--gray-300); font-size: 16px; }
    .highlight-price { color: var(--purple); font-weight: 700; }

    /* ============ FEATURES ============ */
    .features-grid {
      margin-top: 64px;
      display: flex;
      flex-direction: column;
      gap: 80px;
    }

    .feature-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 64px;
      align-items: center;
    }

    .feature-row.reverse { direction: rtl; }
    .feature-row.reverse > * { direction: ltr; }

    .feature-text { display: flex; flex-direction: column; gap: 16px; }

    .feature-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
    }

    .feature-icon.purple { background: rgba(108, 92, 231, 0.1); color: var(--purple); }
    .feature-icon.green { background: rgba(0, 184, 148, 0.1); color: var(--green); }
    .feature-icon.coral { background: rgba(225, 112, 85, 0.1); color: var(--coral); }

    .feature-title {
      font-family: var(--font-display);
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--navy);
    }

    .feature-desc {
      font-size: 16px;
      line-height: 1.7;
      color: var(--gray-600);
    }

    .feature-visual {
      background: var(--navy);
      border-radius: 16px;
      padding: 32px;
      min-height: 320px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      position: relative;
    }

    /* Feature 1: Analytics visual */
    .analytics-visual {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .analytics-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .analytics-page {
      font-size: 12px;
      color: var(--gray-500);
      width: 60px;
      text-align: right;
      font-family: var(--font-display);
      font-weight: 500;
    }

    .analytics-bar-bg {
      flex: 1;
      height: 28px;
      background: rgba(255,255,255,0.05);
      border-radius: 6px;
      overflow: hidden;
    }

    .analytics-bar-fill {
      height: 100%;
      border-radius: 6px;
      background: linear-gradient(90deg, var(--purple), var(--purple-light));
      transition: width 1s ease-out;
    }

    .analytics-time {
      font-size: 12px;
      color: var(--gray-400);
      width: 40px;
      font-family: var(--font-display);
      font-weight: 600;
    }

    /* Feature 2: AI Chat visual */
    .chat-visual {
      width: 100%;
      max-width: 320px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .chat-bubble {
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.5;
      max-width: 85%;
    }

    .chat-bubble.user {
      background: var(--purple);
      color: var(--white);
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }

    .chat-bubble.ai {
      background: rgba(255,255,255,0.08);
      color: var(--gray-300);
      align-self: flex-start;
      border-bottom-left-radius: 4px;
      border: 1px solid rgba(255,255,255,0.06);
    }

    .chat-bubble.ai .typing {
      display: inline-flex;
      gap: 4px;
    }

    .chat-bubble.ai .typing span {
      width: 6px;
      height: 6px;
      background: var(--gray-500);
      border-radius: 50%;
      animation: typingDot 1.4s ease-in-out infinite;
    }

    .chat-bubble.ai .typing span:nth-child(2) { animation-delay: 0.2s; }
    .chat-bubble.ai .typing span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes typingDot {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
      30% { transform: translateY(-4px); opacity: 1; }
    }

    /* Feature 3: Notification visual */
    .notif-visual {
      width: 100%;
      max-width: 360px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .notif-card {
      background: var(--white);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      gap: 12px;
      align-items: flex-start;
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    }

    .notif-card .icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 14px;
    }

    .notif-card .icon.hot { background: rgba(225, 112, 85, 0.1); color: var(--coral); }
    .notif-card .icon.ai { background: rgba(108, 92, 231, 0.1); color: var(--purple); }

    .notif-card .text { font-size: 13px; line-height: 1.5; color: var(--navy); }
    .notif-card .text strong { font-weight: 600; }
    .notif-card .text .meta { font-size: 11px; color: var(--gray-500); margin-top: 4px; }

    .notif-suggest {
      background: rgba(108, 92, 231, 0.08);
      border: 1px solid rgba(108, 92, 231, 0.15);
      border-radius: 10px;
      padding: 14px;
      font-size: 13px;
      color: var(--purple-light);
      line-height: 1.5;
    }

    .notif-suggest .label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 600;
      color: var(--purple);
      margin-bottom: 6px;
    }

    /* ============ HOW IT WORKS ============ */
    .how-it-works { background: var(--ghost); }

    .steps {
      margin-top: 64px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 32px;
    }

    .step {
      text-align: center;
      position: relative;
    }

    .step-number {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--purple);
      color: var(--white);
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
    }

    .step-title {
      font-family: var(--font-display);
      font-size: 16px;
      font-weight: 700;
      color: var(--navy);
      margin-bottom: 8px;
    }

    .step-desc {
      font-size: 14px;
      color: var(--gray-600);
      line-height: 1.6;
    }

    /* ============ TESTIMONIALS ============ */
    .testimonials-grid {
      margin-top: 56px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }

    .testimonial-card {
      background: var(--white);
      border: 1px solid var(--gray-200);
      border-radius: 16px;
      padding: 32px;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .testimonial-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(26, 26, 46, 0.06);
    }

    .testimonial-stars {
      color: var(--yellow);
      font-size: 16px;
      margin-bottom: 16px;
      letter-spacing: 2px;
    }

    .testimonial-text {
      font-size: 15px;
      line-height: 1.7;
      color: var(--navy);
      font-style: italic;
      margin-bottom: 24px;
    }

    .testimonial-author {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .testimonial-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--purple), var(--purple-light));
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 14px;
    }

    .testimonial-name {
      font-family: var(--font-display);
      font-weight: 600;
      font-size: 14px;
      color: var(--navy);
    }

    .testimonial-role {
      font-size: 13px;
      color: var(--gray-500);
    }

    /* ============ USE CASES ============ */
    .use-cases { background: var(--ghost); }

    .use-cases-grid {
      margin-top: 56px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }

    .use-case-card {
      background: var(--white);
      border: 1px solid var(--gray-200);
      border-radius: 16px;
      padding: 36px;
      transition: all 0.2s;
      position: relative;
      overflow: hidden;
    }

    .use-case-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: var(--purple);
      transform: scaleX(0);
      transition: transform 0.3s;
      transform-origin: left;
    }

    .use-case-card:hover::before { transform: scaleX(1); }
    .use-case-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(26, 26, 46, 0.06); }

    .use-case-emoji { font-size: 32px; margin-bottom: 16px; }

    .use-case-title {
      font-family: var(--font-display);
      font-size: 20px;
      font-weight: 700;
      color: var(--navy);
      margin-bottom: 12px;
    }

    .use-case-desc {
      font-size: 14px;
      line-height: 1.7;
      color: var(--gray-600);
    }

    /* ============ PRICING ============ */
    .pricing { text-align: center; }

    .pricing-toggle {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      margin-top: 24px;
      margin-bottom: 56px;
      font-size: 14px;
      color: var(--gray-500);
    }

    .pricing-toggle .active { color: var(--navy); font-weight: 600; }

    .toggle-switch {
      width: 48px;
      height: 26px;
      background: var(--gray-200);
      border-radius: 13px;
      position: relative;
      cursor: pointer;
      transition: background 0.3s;
    }

    .toggle-switch.on { background: var(--purple); }

    .toggle-switch::after {
      content: '';
      position: absolute;
      width: 22px;
      height: 22px;
      background: white;
      border-radius: 50%;
      top: 2px;
      left: 2px;
      transition: transform 0.3s;
      box-shadow: 0 1px 3px rgba(0,0,0,0.15);
    }

    .toggle-switch.on::after { transform: translateX(22px); }

    .pricing-badge {
      font-size: 12px;
      font-weight: 600;
      color: var(--green);
      background: rgba(0, 184, 148, 0.08);
      padding: 4px 10px;
      border-radius: 100px;
    }

    .pricing-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .pricing-card {
      background: var(--white);
      border: 1px solid var(--gray-200);
      border-radius: 20px;
      padding: 40px 32px;
      text-align: left;
      position: relative;
      transition: all 0.2s;
    }

    .pricing-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 16px 48px rgba(26, 26, 46, 0.06);
    }

    .pricing-card.featured {
      border-color: var(--purple);
      box-shadow: 0 0 0 1px var(--purple), 0 16px 48px rgba(108, 92, 231, 0.12);
    }

    .pricing-card.featured::before {
      content: 'Most Popular';
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--purple);
      color: white;
      font-family: var(--font-display);
      font-size: 12px;
      font-weight: 600;
      padding: 4px 16px;
      border-radius: 100px;
    }

    .pricing-plan {
      font-family: var(--font-display);
      font-size: 16px;
      font-weight: 600;
      color: var(--gray-600);
      margin-bottom: 8px;
    }

    .pricing-price {
      font-family: var(--font-display);
      font-size: 48px;
      font-weight: 800;
      color: var(--navy);
      line-height: 1;
      margin-bottom: 4px;
    }

    .pricing-price span { font-size: 16px; font-weight: 500; color: var(--gray-500); }

    .pricing-desc {
      font-size: 14px;
      color: var(--gray-500);
      margin-bottom: 32px;
      min-height: 40px;
    }

    .pricing-features {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 32px;
    }

    .pricing-features li {
      font-size: 14px;
      color: var(--gray-600);
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .pricing-features li::before {
      content: '';
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: rgba(0, 184, 148, 0.1);
      flex-shrink: 0;
      background-image: url("data:image/svg+xml,%3Csvg width='10' height='8' viewBox='0 0 10 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 4L3.5 6.5L9 1' stroke='%2300B894' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: center;
    }

    .pricing-card .btn-primary { width: 100%; justify-content: center; }

    .pricing-card .btn-secondary {
      width: 100%;
      justify-content: center;
      color: var(--navy);
      border-color: var(--gray-200);
    }

    /* ============ FINAL CTA ============ */
    .final-cta {
      background: var(--navy);
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .final-cta::before {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse 60% 50% at 50% 50%, rgba(108, 92, 231, 0.15) 0%, transparent 60%);
    }

    .final-cta .section-inner { position: relative; z-index: 2; }

    .final-cta .section-title { color: var(--white); }
    .final-cta .section-subtitle { color: var(--gray-400); margin: 0 auto 40px; }

    /* ============ FAQ ============ */
    .faq-grid {
      margin-top: 56px;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
    }

    .faq-item {
      background: var(--white);
      border: 1px solid var(--gray-200);
      border-radius: 12px;
      padding: 28px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .faq-item:hover {
      border-color: var(--purple);
      box-shadow: 0 4px 16px rgba(108, 92, 231, 0.06);
    }

    .faq-question {
      font-family: var(--font-display);
      font-size: 16px;
      font-weight: 600;
      color: var(--navy);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }

    .faq-question .arrow {
      font-size: 20px;
      color: var(--gray-400);
      transition: transform 0.3s;
      flex-shrink: 0;
    }

    .faq-item.open .faq-question .arrow { transform: rotate(45deg); color: var(--purple); }

    .faq-answer {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s, padding-top 0.3s;
    }

    .faq-item.open .faq-answer {
      max-height: 200px;
      padding-top: 16px;
    }

    .faq-answer p {
      font-size: 14px;
      line-height: 1.7;
      color: var(--gray-600);
    }

    /* ============ FOOTER ============ */
    .footer {
      background: var(--navy);
      padding: 64px 24px 32px;
      border-top: 1px solid rgba(255,255,255,0.06);
    }

    .footer-inner {
      max-width: 1100px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 48px;
    }

    .footer-brand .nav-logo { display: block; margin-bottom: 16px; }

    .footer-brand p {
      font-size: 14px;
      color: var(--gray-500);
      line-height: 1.6;
      max-width: 280px;
    }

    .footer-col h4 {
      font-family: var(--font-display);
      font-size: 13px;
      font-weight: 600;
      color: var(--gray-400);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 20px;
    }

    .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 12px; }

    .footer-col a {
      font-size: 14px;
      color: var(--gray-500);
      text-decoration: none;
      transition: color 0.2s;
    }

    .footer-col a:hover { color: var(--white); }

    .footer-bottom {
      max-width: 1100px;
      margin: 48px auto 0;
      padding-top: 24px;
      border-top: 1px solid rgba(255,255,255,0.06);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .footer-bottom p {
      font-size: 13px;
      color: var(--gray-600);
    }

    .footer-socials {
      display: flex;
      gap: 16px;
    }

    .footer-socials a {
      color: var(--gray-500);
      text-decoration: none;
      font-size: 14px;
      transition: color 0.2s;
    }

    .footer-socials a:hover { color: var(--white); }

    /* ============ ANIMATIONS ============ */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .fade-in {
      opacity: 0;
      transform: translateY(24px);
      transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    }

    .fade-in.visible {
      opacity: 1;
      transform: translateY(0);
    }

    /* ============ RESPONSIVE ============ */
    @media (max-width: 1024px) {
      .feature-row { grid-template-columns: 1fr; gap: 40px; }
      .feature-row.reverse { direction: ltr; }
      .mock-dashboard { grid-template-columns: 1fr; }
      .mock-sidebar { display: none; }
      .mock-stats { grid-template-columns: repeat(2, 1fr); }
      .mock-notification { position: relative; right: 0; bottom: 0; margin-top: 16px; }
    }

    @media (max-width: 768px) {
      .nav-links { display: none; }
      .nav-mobile-toggle { display: block; }

      .hero { padding: 100px 20px 60px; min-height: auto; }
      .section { padding: 80px 20px; }

      .hero-ctas { flex-direction: column; }
      .btn-primary, .btn-secondary { width: 100%; justify-content: center; }

      .steps { grid-template-columns: repeat(2, 1fr); }
      .testimonials-grid { grid-template-columns: 1fr; }
      .use-cases-grid { grid-template-columns: 1fr; }
      .pricing-grid { grid-template-columns: 1fr; max-width: 400px; }
      .faq-grid { grid-template-columns: 1fr; }

      .comparison-table { overflow-x: auto; }
      .comparison-table table { min-width: 600px; }

      .footer-inner { grid-template-columns: 1fr 1fr; }

      .mock-stats { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 480px) {
      .steps { grid-template-columns: 1fr; }
      .footer-inner { grid-template-columns: 1fr; }
    }
  

      @media (max-width: 768px) {
        .nav-links.mobile-open {
          display: flex !important;
          flex-direction: column;
          position: absolute;
          top: 72px;
          left: 0;
          right: 0;
          background: rgba(26, 26, 46, 0.98);
          backdrop-filter: blur(20px);
          padding: 24px;
          gap: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .nav-links.mobile-open .nav-cta {
          text-align: center;
          padding: 12px 20px;
        }
      }
    `;

const LANDING_HTML = `<!-- NAVBAR -->
  <nav class="nav" id="nav">
    <div class="nav-inner">
      <a href="#" class="nav-logo">p<span class="eye">eee</span>ky</a>
      <ul class="nav-links">
        <li><a href="#features">Features</a></li>
        <li><a href="#pricing">Pricing</a></li>
        <li><a href="#use-cases">Use Cases</a></li>
        <li><a href="#faq">FAQ</a></li>
        <li><a href="/login" class="nav-cta">Get Started Free</a></li>
      </ul>
      <button class="nav-mobile-toggle"  aria-label="Toggle menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>

  <!-- HERO -->
  <section class="hero">
    <div class="hero-bg"></div>
    <div class="hero-grid"></div>
    <div class="hero-content">
      <div class="hero-badge">
        <span class="dot"></span>
        Now with AI Chat
      </div>
      <h1>
        Share documents.<br>
        <span class="gradient">Know who reads them.</span>
      </h1>
      <p>Peeeky tracks every page of your pitch deck, proposal, or contract. See who opened it, which pages got attention, and let recipients ask questions with AI.</p>
      <div class="hero-ctas">
        <a href="/login" class="btn-primary">
          Start tracking &mdash; it's free
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
        <a href="#features" class="btn-secondary">See how it works</a>
      </div>
      <div class="hero-mockup">
        <div class="mockup-wrapper">
          <div class="mockup-bar">
            <div class="mockup-dot"></div>
            <div class="mockup-dot"></div>
            <div class="mockup-dot"></div>
          </div>
          <div class="mockup-screen">
            <div class="mock-dashboard">
              <div class="mock-sidebar">
                <div class="mock-sidebar-item active">Documents</div>
                <div class="mock-sidebar-item">Settings</div>
                <div class="mock-sidebar-item">Team</div>
                <div class="mock-sidebar-item">Billing</div>
              </div>
              <div class="mock-main">
                <div class="mock-header">
                  <div class="mock-title">Series A Pitch Deck</div>
                  <div class="mock-btn">+ Create Link</div>
                </div>
                <div class="mock-stats">
                  <div class="mock-stat-card">
                    <div class="mock-stat-label">Total Views</div>
                    <div class="mock-stat-value">247</div>
                  </div>
                  <div class="mock-stat-card">
                    <div class="mock-stat-label">Unique Viewers</div>
                    <div class="mock-stat-value">38</div>
                  </div>
                  <div class="mock-stat-card">
                    <div class="mock-stat-label">Avg. Time</div>
                    <div class="mock-stat-value green">4:32</div>
                  </div>
                  <div class="mock-stat-card">
                    <div class="mock-stat-label">Engagement</div>
                    <div class="mock-stat-value purple">87</div>
                  </div>
                </div>
                <div class="mock-chart">
                  <div class="mock-bar"></div>
                  <div class="mock-bar"></div>
                  <div class="mock-bar"></div>
                  <div class="mock-bar"></div>
                  <div class="mock-bar"></div>
                  <div class="mock-bar"></div>
                  <div class="mock-bar"></div>
                  <div class="mock-bar"></div>
                  <div class="mock-bar"></div>
                  <div class="mock-bar"></div>
                  <div class="mock-bar"></div>
                  <div class="mock-bar"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="mock-notification">
          <div class="mock-notif-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </div>
          <div class="mock-notif-text">
            <strong>Sarah from Sequoia</strong> just spent 3 min on your pricing slide.
            <span class="time">Just now</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- SOCIAL PROOF -->
  <section class="social-proof">
    <div class="social-proof-inner">
      <p>Trusted by founders and sales teams worldwide</p>
      <div class="logo-row">
        <span class="logo-placeholder">Acme Corp</span>
        <span class="logo-placeholder">Velocity</span>
        <span class="logo-placeholder">NovaTech</span>
        <span class="logo-placeholder">Apex</span>
        <span class="logo-placeholder">Helios</span>
      </div>
    </div>
  </section>

  <!-- COMPARISON -->
  <section class="section comparison" id="compare">
    <div class="section-inner fade-in">
      <div class="section-label">Why Peeeky</div>
      <div class="section-title">Stop sending documents<br>into the void</div>
      <div class="section-subtitle">Email attachments and Drive links give you zero visibility. DocSend charges enterprise prices. Peeeky gives you more for less.</div>
      <div class="comparison-table">
        <table>
          <thead>
            <tr>
              <th>Feature</th>
              <th>Email / Drive</th>
              <th>DocSend</th>
              <th>Peeeky</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Know who opened</td>
              <td><span class="cross">&times;</span></td>
              <td><span class="check">&check;</span></td>
              <td><span class="check">&check;</span></td>
            </tr>
            <tr>
              <td>Time per page</td>
              <td><span class="cross">&times;</span></td>
              <td><span class="cross">&times;</span></td>
              <td><span class="check">&check;</span></td>
            </tr>
            <tr>
              <td>AI Chat with document</td>
              <td><span class="cross">&times;</span></td>
              <td><span class="cross">&times;</span></td>
              <td><span class="check">&check;</span></td>
            </tr>
            <tr>
              <td>Smart follow-up alerts</td>
              <td><span class="cross">&times;</span></td>
              <td><span class="cross">&times;</span></td>
              <td><span class="check">&check;</span></td>
            </tr>
            <tr>
              <td>Engagement score</td>
              <td><span class="cross">&times;</span></td>
              <td><span class="cross">&times;</span></td>
              <td><span class="check">&check;</span></td>
            </tr>
            <tr>
              <td>Free plan</td>
              <td>&mdash;</td>
              <td><span class="cross">&times;</span></td>
              <td><span class="check">&check;</span></td>
            </tr>
            <tr>
              <td>Price</td>
              <td>Free</td>
              <td>$45/user/mo</td>
              <td><span class="highlight-price">$39/mo</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <!-- FEATURES -->
  <section class="section" id="features">
    <div class="section-inner">
      <div class="section-label fade-in">Features</div>
      <div class="section-title fade-in">Everything you need to know<br>what happens after you hit send</div>
      <div class="features-grid">

        <!-- Feature 1: Analytics -->
        <div class="feature-row fade-in">
          <div class="feature-text">
            <div class="feature-icon purple">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
            <h3 class="feature-title">See exactly who reads your documents</h3>
            <p class="feature-desc">Upload a PDF or pitch deck. Create a tracked link. Know the moment someone opens it &mdash; and watch which pages hold their attention. Page-by-page analytics show you where interest is real.</p>
          </div>
          <div class="feature-visual">
            <div class="analytics-visual">
              <div class="analytics-row">
                <span class="analytics-page">Page 1</span>
                <div class="analytics-bar-bg"><div class="analytics-bar-fill" style="width: 30%"></div></div>
                <span class="analytics-time">0:18</span>
              </div>
              <div class="analytics-row">
                <span class="analytics-page">Page 2</span>
                <div class="analytics-bar-bg"><div class="analytics-bar-fill" style="width: 45%"></div></div>
                <span class="analytics-time">0:27</span>
              </div>
              <div class="analytics-row">
                <span class="analytics-page">Page 3</span>
                <div class="analytics-bar-bg"><div class="analytics-bar-fill" style="width: 70%"></div></div>
                <span class="analytics-time">0:42</span>
              </div>
              <div class="analytics-row">
                <span class="analytics-page">Page 4</span>
                <div class="analytics-bar-bg"><div class="analytics-bar-fill" style="width: 95%"></div></div>
                <span class="analytics-time">2:14</span>
              </div>
              <div class="analytics-row">
                <span class="analytics-page">Page 5</span>
                <div class="analytics-bar-bg"><div class="analytics-bar-fill" style="width: 60%"></div></div>
                <span class="analytics-time">0:36</span>
              </div>
              <div class="analytics-row">
                <span class="analytics-page">Page 6</span>
                <div class="analytics-bar-bg"><div class="analytics-bar-fill" style="width: 25%"></div></div>
                <span class="analytics-time">0:15</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Feature 2: AI Chat -->
        <div class="feature-row reverse fade-in">
          <div class="feature-text">
            <div class="feature-icon green">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <h3 class="feature-title">Your documents answer questions with AI</h3>
            <p class="feature-desc">Recipients can ask your document anything. "What's the projected revenue?" "What are the contract terms?" AI responds using only your document's content. You see every question asked.</p>
          </div>
          <div class="feature-visual">
            <div class="chat-visual">
              <div class="chat-bubble user">What's the projected ARR for 2027?</div>
              <div class="chat-bubble ai">Based on slide 8, the projected ARR for 2027 is $4.2M, with a growth rate of 3.5x year-over-year from the current $1.2M baseline.</div>
              <div class="chat-bubble user">What's the main risk factor?</div>
              <div class="chat-bubble ai">
                <div class="typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Feature 3: Smart Follow-up -->
        <div class="feature-row fade-in">
          <div class="feature-text">
            <div class="feature-icon coral">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
            <h3 class="feature-title">Follow up at the perfect moment</h3>
            <p class="feature-desc">Get notified the instant a prospect reads your pricing page. Peeeky suggests what to say based on their reading pattern. Never miss the moment when interest peaks.</p>
          </div>
          <div class="feature-visual">
            <div class="notif-visual">
              <div class="notif-card">
                <div class="icon hot">&#128293;</div>
                <div class="text">
                  <strong>High engagement detected</strong><br>
                  David Park spent 3m 12s on your pricing slide (Page 8).
                  <div class="meta">2 minutes ago</div>
                </div>
              </div>
              <div class="notif-suggest">
                <div class="label">AI Suggested Follow-up</div>
                "Hi David, I noticed you were looking at our pricing. Happy to walk through the options and find the right fit for your team. Free for a quick call this week?"
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- HOW IT WORKS -->
  <section class="section how-it-works" id="how">
    <div class="section-inner" style="text-align: center;">
      <div class="section-label fade-in">How It Works</div>
      <div class="section-title fade-in" style="margin: 0 auto 20px;">Four steps. Two minutes. Full visibility.</div>
      <div class="steps">
        <div class="step fade-in">
          <div class="step-number">1</div>
          <div class="step-title">Upload</div>
          <div class="step-desc">Drag and drop your PDF or PPTX. We process it in seconds.</div>
        </div>
        <div class="step fade-in">
          <div class="step-number">2</div>
          <div class="step-title">Create Link</div>
          <div class="step-desc">One click generates a tracked, secure link. Copy and go.</div>
        </div>
        <div class="step fade-in">
          <div class="step-number">3</div>
          <div class="step-title">Share</div>
          <div class="step-desc">Send it via email, LinkedIn, Slack &mdash; anywhere.</div>
        </div>
        <div class="step fade-in">
          <div class="step-number">4</div>
          <div class="step-title">Track</div>
          <div class="step-desc">Watch your dashboard light up with real-time page analytics.</div>
        </div>
      </div>
    </div>
  </section>

  <!-- TESTIMONIALS -->
  <section class="section" id="testimonials">
    <div class="section-inner">
      <div style="text-align: center;">
        <div class="section-label fade-in">Testimonials</div>
        <div class="section-title fade-in" style="margin: 0 auto 20px;">Loved by founders and<br>sales teams</div>
      </div>
      <div class="testimonials-grid">
        <div class="testimonial-card fade-in">
          <div class="testimonial-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
          <p class="testimonial-text">"I sent 30 pitch decks last round. With Peeeky, I knew exactly which 4 investors actually read it. Closed the round in 3 weeks."</p>
          <div class="testimonial-author">
            <div class="testimonial-avatar">SC</div>
            <div>
              <div class="testimonial-name">Sarah Chen</div>
              <div class="testimonial-role">Founder & CEO</div>
            </div>
          </div>
        </div>
        <div class="testimonial-card fade-in">
          <div class="testimonial-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
          <p class="testimonial-text">"Our sales team went from guessing to knowing. Response rates doubled because we follow up when prospects are actually engaged."</p>
          <div class="testimonial-author">
            <div class="testimonial-avatar">MR</div>
            <div>
              <div class="testimonial-name">Marcus Rivera</div>
              <div class="testimonial-role">VP Sales, SaaS Company</div>
            </div>
          </div>
        </div>
        <div class="testimonial-card fade-in">
          <div class="testimonial-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
          <p class="testimonial-text">"The AI chat blew my mind. An investor asked my deck a question at 11 PM and got an answer instantly. I woke up to a term sheet request."</p>
          <div class="testimonial-author">
            <div class="testimonial-avatar">DP</div>
            <div>
              <div class="testimonial-name">David Park</div>
              <div class="testimonial-role">Co-founder, Series A Startup</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- USE CASES -->
  <section class="section use-cases" id="use-cases">
    <div class="section-inner" style="text-align: center;">
      <div class="section-label fade-in">Use Cases</div>
      <div class="section-title fade-in" style="margin: 0 auto 20px;">Built for people who share<br>documents that matter</div>
      <div class="use-cases-grid">
        <div class="use-case-card fade-in">
          <div class="use-case-emoji">&#127942;</div>
          <h3 class="use-case-title">Fundraising</h3>
          <p class="use-case-desc">Track your pitch deck. Know which investors are interested before the follow-up call. Stop guessing, start closing.</p>
        </div>
        <div class="use-case-card fade-in">
          <div class="use-case-emoji">&#128200;</div>
          <h3 class="use-case-title">Sales</h3>
          <p class="use-case-desc">Send proposals that tell you when to call. Prioritize by engagement score, not guesswork. Double your response rates.</p>
        </div>
        <div class="use-case-card fade-in">
          <div class="use-case-emoji">&#128274;</div>
          <h3 class="use-case-title">M&A & Legal</h3>
          <p class="use-case-desc">Secure data rooms with full audit trail. Know who accessed what, when. Enterprise-grade security at a fraction of the cost.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- PRICING -->
  <section class="section pricing" id="pricing">
    <div class="section-inner">
      <div class="section-label fade-in">Pricing</div>
      <div class="section-title fade-in" style="margin: 0 auto 20px;">Simple pricing. No per-seat fees.</div>
      <div class="section-subtitle fade-in" style="margin: 0 auto;">Start free. Upgrade when you need more. Cancel anytime.</div>

      <div class="pricing-toggle fade-in">
        <span class="active" id="monthly-label">Monthly</span>
        <div class="toggle-switch" id="pricing-toggle" ></div>
        <span id="annual-label">Annual</span>
        <span class="pricing-badge">Save 17%</span>
      </div>

      <div class="pricing-grid">
        <div class="pricing-card fade-in">
          <div class="pricing-plan">Free</div>
          <div class="pricing-price">$0<span>/mo</span></div>
          <p class="pricing-desc">Perfect to get started. No credit card.</p>
          <ul class="pricing-features">
            <li>5 documents</li>
            <li>3 links per document</li>
            <li>Basic analytics (total views)</li>
            <li>Password protection</li>
            <li>"Secured by Peeeky" badge</li>
          </ul>
          <a href="/login" class="btn-secondary">Start Free</a>
        </div>
        <div class="pricing-card featured fade-in">
          <div class="pricing-plan">Pro</div>
          <div class="pricing-price" id="pro-price">$39<span>/mo</span></div>
          <p class="pricing-desc">For founders and sales pros who need full visibility.</p>
          <ul class="pricing-features">
            <li>Unlimited documents</li>
            <li>Page-level analytics</li>
            <li>AI Chat (50/mo)</li>
            <li>Email notifications</li>
            <li>Watermarks & email gate</li>
            <li>Custom logo</li>
            <li>Remove Peeeky badge</li>
          </ul>
          <a href="/login" class="btn-primary">Start Free Trial</a>
        </div>
        <div class="pricing-card fade-in">
          <div class="pricing-plan">Business</div>
          <div class="pricing-price" id="biz-price">$129<span>/mo</span></div>
          <p class="pricing-desc">For teams, data rooms, and full brand control.</p>
          <ul class="pricing-features">
            <li>Everything in Pro</li>
            <li>10 team members</li>
            <li>Custom domain</li>
            <li>Slack notifications</li>
            <li>Unlimited AI Chat</li>
            <li>Audit log & compliance</li>
            <li>Priority support</li>
          </ul>
          <a href="/login" class="btn-secondary" style="color: var(--navy); border-color: var(--gray-200);">Contact Sales</a>
        </div>
      </div>
    </div>
  </section>

  <!-- FINAL CTA -->
  <section class="section final-cta" id="signup">
    <div class="section-inner fade-in">
      <div class="section-title">Your documents deserve to be<br>more than attachments.</div>
      <p class="section-subtitle">Join thousands of teams who know exactly how their documents perform.</p>
      <a href="/login" class="btn-primary" style="font-size: 18px; padding: 16px 40px;">
        Start tracking &mdash; it's free
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </a>
    </div>
  </section>

  <!-- FAQ -->
  <section class="section" id="faq" style="background: var(--ghost);">
    <div class="section-inner" style="text-align: center;">
      <div class="section-label fade-in">FAQ</div>
      <div class="section-title fade-in" style="margin: 0 auto 20px;">Questions? We've got answers.</div>
    </div>
    <div class="section-inner">
      <div class="faq-grid">
        <div class="faq-item fade-in">
          <div class="faq-question">
            Is there really a free plan?
            <span class="arrow">+</span>
          </div>
          <div class="faq-answer">
            <p>Yes. 5 documents, unlimited viewers, basic analytics. No credit card required. No time limit. Use it forever.</p>
          </div>
        </div>
        <div class="faq-item fade-in">
          <div class="faq-question">
            How does page tracking work?
            <span class="arrow">+</span>
          </div>
          <div class="faq-answer">
            <p>Recipients view your document in our secure viewer. We track time on each page, device, location, and completion &mdash; all without requiring them to create an account.</p>
          </div>
        </div>
        <div class="faq-item fade-in">
          <div class="faq-question">
            Is my document secure?
            <span class="arrow">+</span>
          </div>
          <div class="faq-answer">
            <p>Yes. Documents are stored encrypted, served via short-lived signed URLs, and never downloadable unless you allow it. You can revoke access to any link at any time.</p>
          </div>
        </div>
        <div class="faq-item fade-in">
          <div class="faq-question">
            What is AI Chat?
            <span class="arrow">+</span>
          </div>
          <div class="faq-answer">
            <p>Recipients can ask questions about your document and get instant AI answers based solely on its content. You see every question asked &mdash; giving you even more insight into what they care about.</p>
          </div>
        </div>
        <div class="faq-item fade-in">
          <div class="faq-question">
            Can I use my own domain?
            <span class="arrow">+</span>
          </div>
          <div class="faq-answer">
            <p>Yes, on the Business plan. Your links become docs.yourcompany.com. Full white-label with your logo and brand colors.</p>
          </div>
        </div>
        <div class="faq-item fade-in">
          <div class="faq-question">
            How is this different from DocSend?
            <span class="arrow">+</span>
          </div>
          <div class="faq-answer">
            <p>Peeeky has page-level time tracking, AI Chat, engagement scoring, and smart follow-ups &mdash; features DocSend doesn't offer. Plus a generous free tier and lower pricing ($39 vs $45+/user).</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <a href="#" class="nav-logo">p<span class="eye">eee</span>ky</a>
        <p>Secure document sharing with page-level analytics and AI intelligence.</p>
      </div>
      <div class="footer-col">
        <h4>Product</h4>
        <ul>
          <li><a href="#features">Features</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="#use-cases">Use Cases</a></li>
          <li><a href="#">Changelog</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Compare</h4>
        <ul>
          <li><a href="#">vs DocSend</a></li>
          <li><a href="#">vs Google Drive</a></li>
          <li><a href="#">vs WeTransfer</a></li>
          <li><a href="#">vs Notion</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Company</h4>
        <ul>
          <li><a href="#">Blog</a></li>
          <li><a href="#">Privacy</a></li>
          <li><a href="#">Terms</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2026 Peeeky. All rights reserved.</p>
      <div class="footer-socials">
        <a href="#">Twitter/X</a>
        <a href="#">LinkedIn</a>
        <a href="#">GitHub</a>
      </div>
    </div>
  </footer>`;

export function LandingPage() {
  useEffect(() => {
    // Navbar scroll effect
    const nav = document.getElementById("nav");
    const handleScroll = () => {
      nav?.classList.toggle("scrolled", window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);

    // Scroll-triggered fade-in animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
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

      if (proPrice)
        proPrice.innerHTML = annual
          ? "$32<span>/mo</span>"
          : "$39<span>/mo</span>";
      if (bizPrice)
        bizPrice.innerHTML = annual
          ? "$107<span>/mo</span>"
          : "$129<span>/mo</span>";
    };

    // Attach pricing toggle
    const pricingToggle = document.getElementById("pricing-toggle");
    pricingToggle?.addEventListener("click", togglePricing);

    // FAQ toggle
    document.querySelectorAll(".faq-item").forEach((item) => {
      item.addEventListener("click", () => {
        item.classList.toggle("open");
      });
    });

    // Mobile nav toggle
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
      <style dangerouslySetInnerHTML={{ __html: LANDING_CSS }} />
      <div dangerouslySetInnerHTML={{ __html: LANDING_HTML }} />
    </>
  );
}
