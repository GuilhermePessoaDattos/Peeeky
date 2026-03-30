export const ONBOARDING_EMAILS = [
  {
    id: "welcome",
    day: 0,
    subject: "Welcome to Peeeky — your documents just got smarter",
    from: "Peeeky Team <hello@peeeky.com>",
    body: `Hi {{name}},

Welcome to Peeeky! You're now set up to share documents with intelligence.

Here's your 60-second quick start:

1. Upload a PDF or pitch deck
2. Click "Create Link" to get a trackable URL
3. Share it — we'll show you exactly who reads what

Your dashboard: https://peeeky.com/documents

If you have any questions, just reply to this email.

— The Peeeky Team`,
  },
  {
    id: "first-doc",
    day: 1,
    subject: "Upload your first document (takes 60 seconds)",
    from: "Alex Moreira <alex@peeeky.com>",
    body: `Hi {{name}},

Alex here from Peeeky. Quick tip: the fastest way to see Peeeky in action
is to upload a document you're already planning to share.

Most people start with:
- A pitch deck they're sending to investors
- A sales proposal for a prospect
- A contract or NDA

Upload here: https://peeeky.com/documents

Once someone views it, you'll get a notification with exactly which
pages they read and how long they spent.

Best,
Alex`,
  },
  {
    id: "first-link",
    day: 3,
    subject: "Did you create your first tracked link?",
    from: "Alex Moreira <alex@peeeky.com>",
    body: `Hi {{name}},

Just checking in — have you had a chance to create a tracked link yet?

If you uploaded a document, click "Create Link" to get a shareable URL.
When you send it, we track:

- Who opened it
- Which pages they read (and for how long)
- When they came back for a second look

That last one is gold — return visits usually mean high interest.

Need help? Reply to this email, I read everything.

Alex`,
  },
  {
    id: "engagement-insights",
    day: 7,
    subject: "Here's what your viewers are telling you",
    from: "Alex Moreira <alex@peeeky.com>",
    body: `Hi {{name}},

You've been on Peeeky for a week now. Here's something most people don't realize:

The pages your viewers skip are as important as the ones they read.

If someone spends 4 minutes on your pricing page but skips your team page,
that's a buying signal. If they re-open the doc 3 times but never reach
the last page, your document might need restructuring.

Check your analytics: https://peeeky.com/documents

This is the kind of insight that turns a "maybe" into a "yes."

Alex`,
  },
  {
    id: "upgrade-nudge",
    day: 14,
    subject: "You're on Free — here's what Pro unlocks",
    from: "Peeeky Team <hello@peeeky.com>",
    body: `Hi {{name}},

You've been using Peeeky for 2 weeks. On the Free plan, you get 5 documents
and basic analytics — enough to see the value.

Pro ($39/mo) unlocks:
- Unlimited documents
- Full page-level heatmaps
- AI Chat (recipients ask questions, you see what they care about)
- Smart engagement alerts
- Password protection & watermarking

If you're sharing documents regularly, Pro pays for itself with one
deal closed faster.

Upgrade: https://peeeky.com/settings/billing

— The Peeeky Team`,
  },
  {
    id: "social-proof",
    day: 21,
    subject: "3 founders who closed deals faster with Peeeky",
    from: "Alex Moreira <alex@peeeky.com>",
    body: `Hi {{name}},

Quick stories from Peeeky users:

1. A SaaS founder knew which VC to prioritize — the one who spent 8 minutes
   on the financial projections page. They got the term sheet in 2 weeks.

2. A sales team stopped wasting follow-up calls on cold leads. Their close
   rate went up 40% in one quarter.

3. An M&A advisor used Data Rooms to manage due diligence for 3 deals
   simultaneously. The audit trail saved them during compliance review.

Your documents have stories to tell too: https://peeeky.com/documents

Alex`,
  },
  {
    id: "monthly-recap",
    day: 30,
    subject: "Your first month with Peeeky",
    from: "Peeeky Team <hello@peeeky.com>",
    body: `Hi {{name}},

It's been a month since you joined Peeeky. Here's a quick recap:

- Documents uploaded: {{docCount}}
- Links created: {{linkCount}}
- Total views tracked: {{viewCount}}

{{#if isFreePlan}}
You're still on Free. If Peeeky is helping you close faster,
Pro ($39/mo) gives you unlimited everything: https://peeeky.com/settings/billing
{{/if}}

We're building new features every week. Reply if there's something
you'd love to see.

— The Peeeky Team`,
  },
] as const;

export type OnboardingEmailId = (typeof ONBOARDING_EMAILS)[number]["id"];
