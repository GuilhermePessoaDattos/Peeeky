---
platform: hackernews
thread_url: https://news.ycombinator.com/item?id=47286949
thread_title: "Show HN: CloakShare – Open-source DocSend alternative with video streaming (MIT)"
date: 2026-03-31
confidence: 5
---

## Thread Summary

Posted March 7, 2026 by GrimLabs. The author built CloakShare, a self-hosted, MIT-licensed alternative to DocSend, motivated explicitly by DocSend's $45/user/month pricing. Key technical choices: Hono framework (edge-compatible), SQLite/Turso for self-hosting, canvas-based PDF rendering with per-session watermarks, HLS video streaming, and webhooks for page-level analytics. An API-first design allows embedding via Web Component. The thread is recent (< 4 weeks old) and sits squarely in the document tracking / pitch deck tooling space.

## Proposed Response

The canvas-based rendering approach is interesting — it sidesteps the PDF.js licensing question entirely and gives you genuine per-page isolation for watermarking. The tradeoff is text selectability and accessibility (screen readers, copy-paste for AI tools). Have you considered a hybrid: canvas for the initial render + an invisible text layer for a11y, similar to how some PDF viewers layer SVG over raster?

On the self-hosting path: the SQLite/Turso choice is great for low-ops deployments, but the analytics story gets harder once you want to aggregate across multiple senders (e.g. "which page do investors consistently drop off on across all my deals"). Have you thought about an optional telemetry rollup layer, or is that intentionally out of scope for the MIT version?

One thing the open-source DocSend alternatives space hasn't cracked well yet is the recipient experience: viewers don't want to jump through hoops to open a VC's pitch deck, and senders don't want false negatives in their view data because a VC bounced at the email gate. There's a real UX design problem there that's distinct from the infrastructure problem. Curious how you're handling that.

(Disclosure: I work on Peeeky, which is in adjacent territory — we've wrestled with the same tradeoffs. Happy to compare notes if useful.)

## Notes

**Why this thread:** It's a direct, authentic Show HN post from a builder solving the exact problem Peeeky addresses — DocSend's high pricing and lack of modern features. The thread is fresh (March 7, 2026, 24 days ago).

**Confidence rationale (5/5):** Verified real thread via HN Algolia API. High relevance: the creator explicitly cites DocSend pricing as the motivation, the feature set (document tracking, per-page analytics, watermarking) directly overlaps with Peeeky. Response adds genuine technical value on rendering architecture and UX tradeoffs. Product mention is minimal, natural, and framed as peer-to-peer builder conversation rather than marketing.

**Tone guidance:** HN requires technical credibility first. The response leads with specific technical observations (canvas rendering tradeoffs, a11y layering) before pivoting to product/UX questions. The Peeeky mention comes last, in a parenthetical, as context not as a pitch.
