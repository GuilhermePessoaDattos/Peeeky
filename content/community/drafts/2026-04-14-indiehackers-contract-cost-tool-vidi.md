---
platform: IndieHackers
thread_url: https://www.indiehackers.com/post/i-built-a-tool-that-shows-what-a-contract-could-cost-you-before-signing-5e39db229c
thread_title: "I built a tool that shows what a contract could cost you before signing"
date: 2026-04-14
confidence: 3
---

## Context

Posted April 13, 2026 by Meirambek (vidifounder). The tool lets users upload a contract and surfaces financial risks, one-sided clauses, and hidden liabilities before they sign. 11 upvotes, 53 comments — high engagement for an IH launch post.

The discussion is substantive: commenters focus on the "right before signing" moment as the key UX trigger, noting the real value is when someone is already holding the document and asking "is this safe?" Multiple comments address whether the tool can distinguish identical clauses that carry different risk depending on who's signing (bootstrapped vs. VC-backed), and whether it handles long contracts and missing-clause detection. The founder is actively engaging.

The connection to Peeeky is adjacent but genuine: both tools are in the "what happens when you share a document" space. The discussion also touches on document workflows — particularly the pattern of sharing a contract, waiting for a response, and not knowing what the other party's concerns actually are. An AI Q&A layer on top of a shared document (which Peeeky offers) is a natural complement to what Meirambek is building for the pre-signing review phase.

## Proposed Response

Really interesting timing — the "right before signing" moment you've identified as the key trigger is one of the most underserved points in the whole document flow.

One thing I'd push on based on the comment thread: there's a distinction between catching risks *you* can identify from the text versus catching the questions *the other party* will have before they'll agree to sign. Those are different problems. Your tool sounds like it does the former really well. But a lot of contracts stall not because of hidden risk to the signer, but because the counterparty has questions they haven't articulated — they slow-walk the signature because something in section 4.2 doesn't make sense to them and they're not sure whether to ask.

I've seen this pattern a lot in proposals and sales contracts — the document gets sent, there's a vague "I'll review and get back to you," and then silence. It's not rejection; it's confusion that nobody turns into a question. Tools that let the recipient ask questions directly on the document (without having to compose a formal email) can surface those blockers much earlier.

Curious whether you've thought about the recipient experience — not just the analysis you give to the sender before they share, but whether there's a companion layer for the person receiving the contract to interact with it.

The "what stage are they at with this doc?" question seems like a natural extension of what you're building.

---
**Posting note:** Warm IH tone is appropriate here. The question at the end is genuine — this isn't a stealth pitch, it's an honest product design question that also creates an opening to discuss what Peeeky does if Meirambek or a commenter asks. Post as a comment on the launch thread. The founder is active in the comments so there's a good chance of a reply. Can naturally mention Peeeky if asked directly: "we're building the recipient-side layer at Peeeky — page-level analytics and AI Q&A for the person receiving the doc."
