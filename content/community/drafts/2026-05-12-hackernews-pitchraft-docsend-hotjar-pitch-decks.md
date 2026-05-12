# Community Draft — Hacker News

**Platform:** Hacker News
**Thread:** PitchRaft – DocSend Meets Hotjar for Pitch Decks
**URL:** https://news.ycombinator.com/item?id=45439537
**Date found:** 2026-05-12
**Thread date:** ~October 1, 2025
**Confidence score:** 4/5

## Why this thread

The founder built PitchRaft while fundraising, frustrated by the lack of visibility into who reads a pitch deck and at what depth. This maps exactly onto Peeeky's core value prop. The thread has only 1 comment, so there is space to add a substantive technical perspective without it looking like a dog-pile. The HN audience at this thread is precisely Peeeky's target: founders evaluating tools in this category.

## Proposed response

---

The hard problem here isn't building the heatmap — it's ensuring investors actually view through your hosted link rather than downloading the PDF and opening it locally. In our experience, a meaningful percentage of recipients (varies a lot by VC firm culture) will forward the download directly, at which point all tracking ends. Have you solved for that?

A few approaches we've seen tried:
- **Require email gate before render** — captures the viewer's identity but adds friction that drops conversion on cold outreach
- **Watermarking per-viewer PDF exports** — lets people download but at least traces forwarding
- **Detecting download events and prompting viewers to re-open the live link** — UX-heavy but reduces leakage without hard blocking

There's also an interesting UX tension in surfacing the heatmap to senders: knowing a VC spent 45 seconds on your market size slide but 8 minutes on the team page is useful, but founders tend to over-index on slide-by-slide data when the more useful signal is often "did they come back a second time?"

Genuinely curious how you're thinking about the "investor knows they're being tracked" angle — some firms have started actively avoiding tracked links as a policy. Does your UX give viewers any indication?

---

## Notes for review

- No product mention — this is a purely technical/product design comment
- Appropriate HN tone: technical, questioning, no marketing language
- Thread is ~7 months old (Oct 2025) — low probability of notification traffic; post only if there's a strategic reason (SEO association with the thread, awareness)
- If confidence on thread age is a concern, skip this one and prioritize Thread 4 (IH/DocBeacon)
