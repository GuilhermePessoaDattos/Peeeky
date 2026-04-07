---
platform: HackerNews
thread_url: https://news.ycombinator.com/item?id=47286949
thread_title: "Show HN: CloakShare – Open-source DocSend alternative with video streaming (MIT)"
confidence: 3
---

## Context

Posted March 7, 2026 by GrimLabs. CloakShare is an MIT-licensed open-source DocSend alternative built on Hono, SQLite/Turso, and Poppler. The author left DocSend over $45/user/month pricing and wanted something embeddable (unlike Papermark's AGPL license). The thread has 1 comment. This is still an appropriate thread to contribute to — HN discussions stay active for weeks, and a genuinely technical comment on architecture or security tradeoffs would add value.

## Proposed Response

The MIT vs. AGPL distinction is a real differentiator for embedding use cases — good call to lead with that. The AGPL requirement to open-source anything that interacts with Papermark's network services has been a genuine blocker for some teams.

A few technical observations on the architecture choices:

**On canvas watermarking:**

Your honest framing ("traceable, not DRM") is exactly right and refreshingly accurate. The main attack surface you haven't mentioned: watermarks rendered client-side in the browser are removable by anyone with DevTools and patience. The more resilient approach is server-side watermarking at render time, where the viewer never receives an unwatermarked version of the image at all — the watermark is baked into the tile before it hits the wire. Harder to implement (you lose the pure CDN delivery model), but meaningfully more resistant.

**On SQLite/Turso for multi-tenant:**

Smart choice for this use case. Document viewing sessions are largely read-heavy after the initial upload, and the per-document-room isolation maps naturally to SQLite's file-per-database model. The main challenge at scale will be query fan-out across rooms for analytics aggregation (e.g., "show me all view events across all rooms in the last 30 days"). Worth designing that aggregation path early.

**On the webhook notification pipeline:**

The most latency-sensitive part of the whole system. The value of "someone just opened your document" alerts decays fast — a 5-minute delay makes it near-useless for live sales/investor follow-up. If you haven't already, worth benchmarking the Hono → webhook → notification latency end-to-end under realistic conditions (not just unit tests).

Solid project. The licensing and architecture choices are well-reasoned.

---

## Notes for posting

- Pure technical value — no Peeeky mention warranted here
- The server-side watermarking point is genuinely useful and differentiating
- The SQLite/Turso and webhook latency observations are substantive
- Confidence: 3 — thread is a few weeks old and only has 1 comment, but HN threads do stay indexed and receive new comments; the response adds real value to anyone reading
