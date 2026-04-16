# Community Draft: Indie Hackers Response

**Platform:** Indie Hackers
**Thread URL:** https://www.indiehackers.com/post/building-an-open-source-docsend-alternative-with-next-js-vercel-blob-and-postgres-592f7a741c
**Thread Title:** Building an Open Source DocSend alternative with Next.js, Vercel Blob and Postgres
**Date Found:** 2026-04-16
**Thread Age:** ~3 years (posted June 2023) — thread is still active and receives comments; confirms persistent market demand

**Note:** This is an older thread but represents an active, ongoing topic on Indie Hackers. The post is from the Papermark founder (Marc Seitz) and the market interest it captured is still very much alive — new alternatives are still launching in 2026. Responding here adds to a living discussion about the product space.

---

## Thread Summary

Marc Seitz (Papermark founder) shared his process for building an open-source DocSend alternative using Next.js, Vercel Blob, and Postgres. The post attracted interest from founders and developers looking for affordable, self-hostable document tracking tools. It sits at the intersection of "building in public" and the ongoing market gap left by DocSend's pricing model.

---

## Proposed Response

This is a great space to be building in — three years later, the demand signal has only gotten stronger, especially after Dropbox killed its free Send & Track feature in March 2025 and DocSend raised prices again.

A few things we've learned from building in this space that might be useful for anyone following along or building their own version:

**The hardest technical problem isn't the viewer — it's bot filtering.** Most document analytics platforms (including DocSend) count bot-triggered link opens from Microsoft Defender, email security scanners, etc. as real views. If you're building a serious alternative, accurate bot detection is a real differentiator. Worth thinking about early rather than retrofitting it later.

**PDF rendering performance at mobile viewport sizes is underestimated.** A huge share of recipients open shared documents on their phones. Getting smooth, fast, mobile-first PDF rendering (without requiring a plugin download) took us longer than expected. Vercel's edge infrastructure helps with latency but the rendering itself still needs careful handling.

**Link-level vs. email-level analytics matter a lot for power users.** Most builders start with per-document analytics, but founders sending the same deck to 30 investors want per-link, per-viewer analytics with separate sessions tracked. The data model for this is more complex than it looks at first.

Curious how Papermark handled the bot filtering problem — did you find a reliable signal for distinguishing legitimate opens?

*(For context: I'm building Peeeky, a document-sharing and tracking platform in the same space — so these are hard-won observations from the same trench, shared in good faith.)*

---

## Confidence Score: 4 / 5

**Reasoning:** Indie Hackers is explicitly a "building in public" community where product disclosure is not only accepted but expected. This thread is directly about building a DocSend alternative — Peeeky's product space. The response leads with three substantive technical observations (bot filtering, mobile PDF rendering, link-level analytics) that genuinely add value to builders following this thread. The question at the end invites dialogue rather than just broadcasting. Slight deduction for thread age — best to combine with a more recent IH touchpoint when possible. The building-in-public tone is authentic and fits IH norms well.
