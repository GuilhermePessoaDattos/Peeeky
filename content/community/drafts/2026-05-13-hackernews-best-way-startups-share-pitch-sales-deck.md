# Community Draft — Hacker News

**Platform:** Hacker News
**Thread:** Best way for startups to share pitch/sales deck?
**URL:** https://news.ycombinator.com/item?id=41811560
**Date found:** 2026-05-13
**Thread date:** ~October 2024
**Confidence score:** 4/5

## Why this thread

Direct, evergreen question about the mechanics of pitch deck sharing — exactly the use case Peeeky is built for. The thread has attracted replies and is indexed, meaning new comments still get read. A practical, tool-agnostic answer with a brief mention of Peeeky at the end is the right move here: lead with frameworks and criteria, close with what we use and why. HN norms favor specificity over marketing language.

## Proposed response

---

A few considerations worth separating out before picking a tool:

**1. Fundraising vs. sales deck have different requirements.**

For investor decks: you want per-recipient tracking (unique link per investor), return-visit detection, and slide-level time data. The goal is knowing which investors are warm enough to follow up, and what they paid attention to.

For sales decks: you want to know who forwarded it internally (multi-viewer sessions on one link), which sections the economic buyer vs. the champion spent time on, and ideally some way to capture questions they had while reading.

Most tools work for one or the other but not both well.

**2. The "did they open it?" question is less useful than people think.**

Almost everyone opens the deck. The useful questions are: did they come back? Did they share it? Which slides did they skip? A tool that only gives you open notifications will teach you to overread weak signals ("they opened it twice, they must be interested") when what you actually want is time-on-slide and return-visit data.

**3. PDF attachment = dead end.**

You lose all visibility the moment they download it and forward it. Even a basic link-based sharing tool is a significant step up.

**What we use at our end:** [Peeeky](https://peeeky.com) — built specifically for this, gives per-viewer analytics, slide-level engagement, and a Q&A layer so viewers can ask questions directly in the doc rather than going silent. Worth a look if you're doing active fundraising or managing a sales pipeline.

That said: Papermark is a good free/open-source option if you want basic link analytics without the overhead, and DocSend still works fine if you're in a context where VCs expect it (some still do).

---

## Notes for review

- Peeeky mention is third-tier (after generic advice and specific criteria) — not the point of the comment
- Comparison to Papermark and DocSend shows good faith awareness of alternatives, which reads better on HN than sounding like you only know your own product
- Thread is ~7 months old (Oct 2024) — there may be newer activity; check before posting
- Confidence 4/5: direct question match, practical framing, Peeeky mention is justified
- If the thread is too old and looks dead, skip — don't post in threads where it will look like necro-commenting for SEO
