---
platform: Hacker News
thread_url: https://news.ycombinator.com/item?id=47639525
thread_title: "Show HN: A tool to make AI show evidence inline"
date: 2026-04-10
confidence: 3
---

## Context

Builder launched a tool that surfaces AI responses with citations anchored inline in documents — the AI doesn't just answer a question, it highlights the *exact passage* it drew from. Thread has good technical discussion about retrieval grounding vs. hallucination. Relevant because Peeeky's AI chat feature works similarly: recipients ask the document questions and get grounded answers from the content itself. Two angles: (1) genuine technical discussion on grounding quality, (2) soft mention that this pattern has strong traction in sales/investor doc use cases where accuracy to source matters enormously.

Confidence is 3 because the thread is about a general RAG/evidence tool, not specifically pitch decks or sales — the connection is adjacent, not direct.

## Proposed Response

The inline citation approach solves one of the harder UX problems in document AI — people trust answers a lot more when they can immediately verify the source passage without leaving the context. The "highlight the exact clause" pattern is what separates a useful assistant from a hallucination risk, especially when the document is a contract or financial model where a one-word error matters.

One pattern we've seen in sales and investor contexts: the most valuable use isn't answering factual questions ("what's the revenue forecast?") — it's handling interpretation questions that require judgment ("how does this compare to the market benchmark on slide 14?"). Those are harder to ground but the ones that move decisions. The quality of the retrieval matters way more there because the answer isn't just a number lookup.

Two technical questions if you're open to them: (1) how are you handling tables and charts — pure text extraction or structured layout parsing? and (2) are you doing any claim-level confidence scoring, or is it binary cited/not-cited per response?

[We've been building something similar into Peeeky for doc-sharing use cases — happy to compare notes on what's worked.]

---
**Posting note:** Technical substance leads the whole response. The Peeeky mention is bracketed at the end and clearly optional context. Only post if the thread has active discussion (>3 comments) — this is a technical audience and a low-engagement thread will make the mention look oddly promotional.
