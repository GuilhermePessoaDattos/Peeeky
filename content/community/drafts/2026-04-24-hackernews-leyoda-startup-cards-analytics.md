---
platform: HackerNews
thread_url: https://news.ycombinator.com/item?id=47212693
thread_title: Show HN: Leyoda – Shareable startup cards with analytics
posted_by: whitehatd
date_found: 2026-04-24
confidence_score: 4
---

## Thread Summary

A solo developer launched Leyoda, a tool that turns startup info into shareable single-link "cards" showing metrics, team, fundraising status, and a pitch deck flip. The platform tracks views, referral sources (WhatsApp, LinkedIn, Telegram), geographic data, and device info. It also filters out 70+ AI bots including ChatGPT and Gemini from the analytics. Currently in alpha with only 1 comment on the thread.

## Proposed Response

This is a genuinely interesting framing — the "card" metaphor makes the sharing feel less transactional than sending a PDF link. A few things worth thinking through as you develop it:

**Bot filtering is underrated.** You mentioned detecting 70+ AI bots. This is actually a non-trivial problem for anyone doing document tracking — corporate email security scanners (Microsoft Defender, Barracuda) pre-fetch links and inflate view counts. If you've already solved the bot detection side, that's worth calling out more prominently in your positioning.

**The referral source tracking is interesting.** Knowing a link got forwarded from Telegram vs. directly opened from LinkedIn changes how a founder interprets investor interest. Are you planning to show a timeline view of who forwarded it and when? That chain-of-custody visibility would be genuinely useful during a raise.

**One open question on the flip mechanic:** Is the pitch deck visible before or after the card flip? There's a pattern in tools like Peeeky (and DocSend before it) where founders want the deck to load after an optional email capture, so you know who's reading slide-by-slide. If Leyoda stays card-level (vs. slide-level), that's a fine positioning choice — it's more of a warm intro tool than a deep analytics instrument. But founders doing 50+ outreach emails want both.

Good work on the Java 21/Spring Boot + Next.js stack — the blue-green deploy setup suggests you're thinking about uptime seriously for a launch-day traffic spike.

## Reasoning

This thread is directly adjacent to Peeeky's core use case — sharing pitch materials and knowing who engaged with them. The response is 80%+ technical feedback and builds credibility by engaging with specific implementation details (bot detection, link forwarding chain). Peeeky is mentioned once, naturally, as a comparison point in a technical question about tracking granularity, not as a recommendation. Confidence is 4 rather than 5 because the thread only has 1 comment so far and the product is a somewhat different format (card vs. document viewer). Still worth posting — the creator is clearly looking for substantive feedback.
