# Community Draft — Hacker News

**Platform:** Hacker News
**Thread:** Show HN: PitchRaft – DocSend Meets Hotjar for Pitch Decks
**URL:** https://news.ycombinator.com/item?id=45439537
**Date found:** 2026-05-13
**Thread date:** ~October 1, 2025
**Confidence score:** 3/5

## Why this thread

PitchRaft is a direct competitor in the pitch deck analytics space, positioning itself as DocSend + Hotjar combined. The HN thread is a good venue for a technically-grounded comment that adds genuine value to the conversation — discussing the real limitations of heatmap-style analytics for async pitch decks, and what signals actually predict investor follow-through. No need to mention Peeeky; the comment should stand on its own as a knowledgeable practitioner perspective.

## Proposed response

---

The Hotjar comparison is interesting framing — heatmaps make a lot of sense for websites where you have many sessions and can aggregate behavior. For pitch decks you usually have 20-60 individual viewers per deck, which is a much smaller sample, so the aggregate view has less statistical weight. The per-viewer session breakdown probably matters more than the heatmap overlay at that volume.

The signals that tend to actually predict investor follow-through (from what I've seen):

- **Return visits within 48 hours of first open.** First opens are often quick passes. A second visit, especially to specific slides, is much higher signal.
- **Time delta between slides.** A viewer who spends 45 seconds on your team slide and 4 seconds on the market slide is telling you something different than the reverse.
- **Multi-device opens.** Investors often open on mobile first, then return on desktop — that's usually a "shared internally" signal or a "I want to look more carefully" signal.
- **Link forwarding patterns.** If you're generating per-recipient links, the number of unique openers on a single link tells you the deck is getting circulated.

The challenge with adding heatmap-style overlays to deck analytics is that it adds visual complexity without necessarily surfacing the right question, which is usually "is this investor warm enough to follow up, and what should I say?" The most useful format I've seen is a simple per-session timeline rather than an aggregate heat overlay.

Curious whether you're tracking the multi-open / return visit patterns — that seems like the highest-value signal for the fundraising use case specifically.

---

## Notes for review

- No Peeeky mention — purely technical/practitioner perspective
- The question at the end is genuine and invites dialogue; if OP responds it creates a natural two-way exchange
- Thread is ~7 months old (Oct 2025) — low odds of active discussion but worth checking
- Confidence 3/5: topically precise but engagement may be limited at this point; posting is low-cost so still worth doing
