---
platform: HackerNews
thread_url: https://news.ycombinator.com/item?id=46961092
thread_title: "Show HN: GrillMyPitch – An AI investor-readiness simulator for founders"
confidence: 4
---

## Proposed Response

This tackles a real gap. Most pitch prep is either asynchronous deck feedback (static, no conversation dynamics) or expensive human coaching (hard to scale, biased by the coach's thesis preferences). An AI that stress-tests assumptions in real time is a different category.

A few honest questions/thoughts on the approach:

**On numerical scoring (your Q1):**
A single 0–100 score tends to anchor founders in the wrong direction — they optimize for the score rather than the actual clarity of the narrative. More useful might be flagging which of the 12 parameters are blocking questions (things an investor would immediately challenge) vs. polish items. The distinction between "this will kill your raise" and "this needs work" matters more than the aggregate.

**On conversation realism (your Q2):**
The failure mode here is that AI investors are too polite. Real early-stage investor conversations involve a lot of "why does this matter?" and "what makes you the right team?" followed by genuine silence. If the simulator can hold uncomfortable pauses and push back repeatedly on the same point (the way a skeptical GP would), that's where the real value is.

**On where it fails (your Q3):**
It likely struggles with founders who have strong domain knowledge that doesn't translate well to the standard narrative arc. A deep-tech founder in a niche market may know their space cold but get dinged for not hitting the expected "problem → solution → market" structure. The simulator probably can't distinguish "bad deck" from "good deck that violates pitch conventions."

The pitch preparation problem and the pitch sharing/tracking problem are different but adjacent. Once a deck is refined, the next question is always: did the investor actually read it, and which part? Worth thinking about whether GrillMyPitch could surface those post-send signals too.
