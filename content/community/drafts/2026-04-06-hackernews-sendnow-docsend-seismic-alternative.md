---
platform: HackerNews
thread_url: https://news.ycombinator.com/item?id=46656314
thread_title: "Sendnow – Free DocSend/Seismic alternative for file tracking and microsites"
confidence: 2
---

## Proposed Response

The frustration with Highspot/Seismic pricing is real — those tools are priced for enterprise seat counts that have nothing to do with how much value a small sales team extracts from them.

A few technical thoughts on building in this space that might be useful as you iterate:

**On the tracking architecture:**
The tricky part isn't recording page views — it's making the data actionable in near-real-time. The most valuable notification is the one that fires within 5-10 minutes of a prospect opening a doc, so a sales rep can follow up while the material is still fresh. That means the backend pipeline (webhook → notification) needs to be tight, not batched.

**On page-level vs. document-level tracking:**
Document-level ("they opened it") is table stakes. The insight that actually changes behavior is slide/page dwell time — you can see if someone spent 45 seconds on your pricing page and skipped the case studies entirely. That shapes what you say in the follow-up call.

**On the AI timing recommendations you mentioned:**
This is interesting but risky to over-promise. The signal worth surfacing is simpler: "this prospect re-opened the doc 3 days after initial view" — that's a warm signal that doesn't require an ML model, just a clean re-visit alert.

Good luck with the build. The market gap you're targeting (startups priced out of enterprise tools) is real and underserved.
