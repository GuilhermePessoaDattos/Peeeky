# Community Draft — Hacker News

**Platform:** Hacker News
**Thread:** Show HN: DocSend, but Made 10x Cheaper (Peony)
**URL:** https://news.ycombinator.com/item?id=42109775
**Date found:** 2026-05-12
**Thread date:** November 11, 2024
**Confidence score:** 4/5

## Why this thread

14 points and 7 comments — the most substantive HN thread found this session in the pitch deck tracking space. A commenter raised a real performance concern (5-8 second load times vs DocSend), and the OP acknowledged it. The thread also surfaced the self-hosted Papermark comparison. These are the exact objections potential Peeeky users raise. A thoughtful reply here positions Peeeky against both DocSend and the "just cheaper" clones by surfacing what the category actually needs beyond pricing.

## Proposed response

---

The load time comment in this thread is the real crux. For investor-facing decks specifically, a 5-8 second render is a meaningful conversion problem — investors triaging 40+ emails a week will close a slow-loading link before your first slide appears. It's not about patience; it's that they have no sunk cost yet and zero reason to wait.

Curious what your rendering approach is: are you pre-generating page thumbnails server-side at upload time, or using client-side PDF.js rendering on demand? The former adds storage and processing cost but wins on first-load UX; the latter is cheap to build but almost always loses on perceived speed, especially on mobile.

On the broader "10x cheaper" framing: pricing is a tough moat. DocSend's defensibility was always the brand trust ("investors recognize the link") not the features — and that trust took years to build. Tools that replace it on price alone tend to face the same undercutting a few months later. What's the layer you're building on top of the analytics that's harder to copy?

(Not trying to be harsh — this is genuinely the question every tool in this space has to answer. The self-hosting angle Papermark took is one defensibility answer; the AI-on-documents angle is another.)

---

## Notes for review

- No product mention — comment reads as a thoughtful practitioner in the space, not a competitor
- Thread is ~18 months old (Nov 2024) — notification traffic will be very low; posting is mostly for discoverability/SEO association with the thread
- The last paragraph's aside about "self-hosting" and "AI-on-documents" opens a door for Peeeky to be associated with the latter without explicitly naming it
- If approved: post from a personal HN account with history, not a brand-new account
