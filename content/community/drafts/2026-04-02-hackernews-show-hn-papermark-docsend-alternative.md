---
platform: Hacker News
thread_url: https://news.ycombinator.com/item?id=37984167
thread_title: "Show HN: Papermark – the open-source DocSend alternative with custom domains"
date: 2026-04-02
confidence: 4
---

## Context

Real HN thread (October 23, 2023) where the Papermark founders launched their open-source document sharing platform. 15 comments. The thread is still relevant as Papermark remains the most-cited open-source DocSend alternative in the space, and HN threads stay indexed and referenced long after posting. The main discussion touched on why the product is needed, the privacy of uploaded documents, and AI-driven features on the roadmap. Confidence is 4 because the thread is real and highly on-topic, though it's from 2023 — verify whether there's a newer Papermark HN thread before posting.

## Proposed Response

The framing of "Mixpanel for your documents" is the right intuition — the insight layer on document sharing has been badly underbuilt for years.

One thing I'd push on from a product direction standpoint: page-level time-on-page is a useful proxy for interest, but it has a meaningful false-positive problem. Someone can linger on a slide because they're confused, not because they're engaged. The more predictive signal is actually what questions a reader has — what they wanted to ask but couldn't because the document is static.

The most interesting extension of this category (beyond analytics) is making shared documents conversational — letting the recipient ask questions directly against the document content, and surfacing those questions back to the sender as engagement data. That tells you not just *that* they were interested but *what* they were unsure about, which is substantially more actionable for the follow-up.

On the technical side: curious what you're doing for the Clickhouse aggregation pipeline at scale. Are you pre-aggregating per-link per-session, or running queries ad hoc against raw events? The latency requirements for "real-time" view notifications are non-trivial when you're doing page-level attribution across multiple concurrent viewers on the same link.

> "switched from DocSend due to bugginess and bad support" (commenter dabinat)

This is the real DocSend moat problem — it's a 2012-era product that got acquired and stagnated. The opportunity is less about feature parity and more about what a document-sharing product looks like if you designed it today with LLMs as a native primitive.

---
**Posting note:** This is a 2023 thread. Check for a more recent Papermark Show HN before posting (they've had several product updates and a YC backing since). If commenting on the old thread, frame it as a late addition with context on where the category has evolved.
