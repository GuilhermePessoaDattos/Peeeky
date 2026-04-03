---
platform: HackerNews
thread_url: https://news.ycombinator.com/item?id=47626215
thread_title: "Show HN: ClauseWize – Upload a contract, get risk score and negotiation language"
date: 2026-04-03
confidence: 4
---

## Context

Real HN thread posted April 3, 2026 by pratikdoshi01, presenting ClauseWize — a contract analysis tool where users upload a document, receive an automated risk score, and get suggested negotiation language for flagged clauses. Directly relevant to Peeeky because it's in the "AI layer on top of documents" category — the same primitive Peeeky applies to pitch decks and sales materials (AI Q&A, insight surfacing). The thread is very fresh (posted minutes before drafting), so engaging early maximizes visibility. The right angle here is technical and product-focused: explore the design space around AI on documents for the *sender* vs. the *recipient*, how trust is established for AI-generated risk assessments, and where the signal quality comes from. No hard pitch needed — being a thoughtful voice in this thread builds Peeeky's credibility in the document AI space on HN.

## Proposed Response

The risk scoring angle is interesting — the challenge with contract risk scores is that "risk" is heavily context-dependent. A non-compete clause that's a red flag for a freelance service agreement is completely standard in an employment contract. Does your risk model take contract type + counterparty relationship as inputs, or is it working from the clause text alone?

The negotiation language feature is where I'd expect the real retention to come from. Risk identification is useful once; "here's the exact language to propose instead" is something people will use and come back for repeatedly.

A question on the model architecture: when you're flagging risky clauses, are you doing semantic similarity against a corpus of known problematic clause patterns, or is the model doing something more like legal reasoning from first principles? The former scales easily but has obvious coverage gaps for novel clause structures; the latter is more powerful but harder to explain to a user ("why is this risky?").

More broadly, the upload-and-analyze pattern for documents is finding real traction in several adjacent spaces right now — investor diligence (AI answers LP questions against fund documents), sales (AI lets prospects interrogate a proposal before getting on a call), and now contracts. The common thread is that documents are traditionally one-way: you send, the reader decides. AI makes them interactive while the sender retains control over what's in them.

Does ClauseWize give the *sending* party any tools, or is it purely for the recipient reviewing a contract they received?

---
**URL note:** Thread URL confirmed live as of April 3, 2026 (item id 47626215). Posted approximately 9 minutes before drafting — no comments yet, making this an ideal moment to get in early with a substantive technical comment. Peeeky is not mentioned directly — the comment establishes domain credibility in the "AI on documents" category, which is Peeeky's positioning territory on HN.
