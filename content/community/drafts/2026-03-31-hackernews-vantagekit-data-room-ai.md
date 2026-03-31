---
platform: hackernews
thread_url: https://news.ycombinator.com/item?id=47247625
thread_title: "Show HN: VantageKit – a lightweight data room with staging, analytics, & AI Q&A"
date: 2026-03-31
confidence: 5
---

## Thread Summary

Posted March 4, 2026 by xheggs (solo developer, part-time, under 2 months of development, 20+ teams with 4 paid accounts). VantageKit positions itself between DocSend/Papermark (lightweight trackers) and enterprise VDRs like Datasite/Intralinks. Key differentiators: live sync from Google Docs/Slides without re-uploading PDFs, per-page scroll depth and attention tracking, an "intent score (0–100)" derived from engagement patterns, AI-powered Q&A on documents, and an "Investor Inbox" portal consolidating multiple shared rooms. The thread is directly relevant to Peeeky's space — fundraising document sharing with AI and per-page analytics.

## Proposed Response

The live Google Docs sync is the feature I'd double down on in your positioning — "never upload a PDF again" is a genuinely sticky workflow improvement, especially during active fundraising when deck iterations happen daily. The current alternatives all treat PDF as the canonical format, which creates a painful loop: edit slide → export → re-upload → reshare → repeat.

The intent score is interesting but I'd be curious about your input signals. Page dwell time and scroll depth are available, but they conflate "engaged" with "confused" — an investor who reads the market slide three times might be genuinely interested or genuinely skeptical. Have you found any behavioral signals that more reliably distinguish the two? I've seen some teams use forward/backward navigation patterns (someone who goes back to slide 2 after seeing the financials reads differently than someone who linear-scans) but it's noisy.

One tension I'd flag with the AI Q&A feature: in a fundraising context, founders often want control over exactly what narrative gets surfaced. If the AI answers an investor's question about burn rate with a literal number pulled from a table, the founder misses the opportunity to contextualize it. Do you give senders visibility into what questions are being asked, and does the AI answer directly or prompt the sender to respond?

Good luck with it — the gap between DocSend and full enterprise VDR is real and underserved.

## Notes

**Why this thread:** A recent (March 4, 2026) Show HN post building in nearly identical territory to Peeeky — lightweight data room + AI Q&A + per-page engagement analytics + fundraising focus. The creator is a solo dev at early traction stage (4 paid accounts), so the community discussion will center on product decisions and differentiation.

**Confidence rationale (5/5):** Verified real thread via HN Algolia API. Extremely high relevance — the overlap with Peeeky's feature set (AI chat with documents, per-page analytics, engagement scoring) is direct. However, because VantageKit is a Show HN by a fellow builder, the response should be constructive peer commentary, not competitive positioning. No explicit product mention is needed here — the value comes from demonstrating deep domain expertise, which builds brand credibility for Peeeky without a hard sell.

**Tone guidance:** Engage as a thoughtful practitioner who has worked through the same design tradeoffs. Ask sharp product questions (intent score signal quality, AI Q&A control surface) that show you've shipped in this space. Skip the Peeeky mention entirely or leave it to the very end only if natural — competing Show HN threads aren't the right place to promote.
