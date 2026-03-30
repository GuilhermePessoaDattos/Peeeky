import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const AGENTS = [
  {
    name: "content-writer",
    displayName: "Content Writer",
    description: "Writes 2 SEO blog posts per week as Alex Moreira",
    schedule: "0 10 * * 0",
  },
  {
    name: "social-manager",
    displayName: "Social Manager",
    description: "Generates 5 LinkedIn + 5 Twitter posts per week as Alex",
    schedule: "0 11 * * 0",
  },
  {
    name: "community-rep",
    displayName: "Community Rep",
    description: "Monitors Reddit, IH, HN and drafts 3-5 responses daily",
    schedule: "0 14 * * *",
  },
  {
    name: "outbound-sales",
    displayName: "Outbound Sales",
    description: "Researches 25 leads/day and drafts personalized cold emails",
    schedule: "0 13 * * 1-5",
  },
  {
    name: "github-maintainer",
    displayName: "GitHub Maintainer",
    description: "Triages issues and reviews PRs on open-source repos",
    schedule: "0 9 * * *",
  },
  {
    name: "analytics-reporter",
    displayName: "Analytics Reporter",
    description: "Generates weekly metrics report every Monday",
    schedule: "0 8 * * 1",
  },
];

const WEEKLY_TEMPLATES: Record<number, Array<{ title: string; category: string; priority: number }>> = {
  1: [
    { title: "Create AppSumo seller account", category: "appsumo", priority: 1 },
    { title: "Implement AppSumo redeem API", category: "appsumo", priority: 1 },
    { title: "Create Alex Moreira LinkedIn profile", category: "social", priority: 1 },
    { title: "Create @peeeky Twitter/X account", category: "social", priority: 1 },
    { title: "Configure alex@peeeky.com email alias", category: "outbound", priority: 1 },
    { title: "Deploy peeeky-js SDK to npm", category: "github", priority: 2 },
    { title: "Install Google Tag Manager pixel", category: "ads", priority: 2 },
    { title: "Register sitemap on Google Search Console", category: "content", priority: 2 },
    { title: "Submit to BetaList and AlternativeTo", category: "content", priority: 3 },
  ],
  2: [
    { title: "Submit AppSumo deal for review", category: "appsumo", priority: 1 },
    { title: "Deploy @peeeky/viewer to npm", category: "github", priority: 1 },
    { title: "Write 2 blog posts (SEO)", category: "content", priority: 1 },
    { title: "Generate 5 LinkedIn posts as Alex", category: "social", priority: 1 },
    { title: "Send first 25 cold emails as Alex", category: "outbound", priority: 1 },
    { title: "Post Show HN for peeeky-viewer", category: "community", priority: 2 },
    { title: "Submit to awesome-react list", category: "github", priority: 3 },
  ],
  3: [
    { title: "AppSumo deal goes live (monitor)", category: "appsumo", priority: 1 },
    { title: "Write 2 blog posts (SEO)", category: "content", priority: 1 },
    { title: "Generate 5 LinkedIn posts as Alex", category: "social", priority: 1 },
    { title: "Send 125 cold emails (25/day)", category: "outbound", priority: 1 },
    { title: "Respond to 15+ community threads", category: "community", priority: 2 },
    { title: "Prepare Product Hunt launch assets", category: "content", priority: 2 },
  ],
  4: [
    { title: "Product Hunt launch", category: "content", priority: 1 },
    { title: "Respond to ALL PH comments", category: "community", priority: 1 },
    { title: "Write 2 blog posts (SEO)", category: "content", priority: 1 },
    { title: "Send 125 cold emails (25/day)", category: "outbound", priority: 1 },
    { title: "First AppSumo reviews — request from buyers", category: "appsumo", priority: 2 },
    { title: "Submit to SaaSHub, StartupStash", category: "content", priority: 3 },
  ],
  5: [
    { title: "Write 2 blog posts (SEO)", category: "content", priority: 1 },
    { title: "Generate 5 LinkedIn posts", category: "social", priority: 1 },
    { title: "Send 125 cold emails", category: "outbound", priority: 1 },
    { title: "Launch referral program email blast", category: "outbound", priority: 2 },
    { title: "Respond to community threads", category: "community", priority: 2 },
  ],
  6: [
    { title: "Write 2 blog posts (SEO)", category: "content", priority: 1 },
    { title: "Send 125 cold emails", category: "outbound", priority: 1 },
    { title: "Request G2/Capterra reviews from AppSumo users", category: "content", priority: 1 },
    { title: "Create first case study from AppSumo user", category: "content", priority: 2 },
    { title: "Evaluate Google Ads launch (have enough social proof?)", category: "ads", priority: 2 },
  ],
  7: [
    { title: "Launch Google Ads (competitor keywords)", category: "ads", priority: 1 },
    { title: "Write 2 blog posts", category: "content", priority: 1 },
    { title: "Send 125 cold emails", category: "outbound", priority: 1 },
    { title: "Activate referral program in-app", category: "other", priority: 2 },
  ],
  8: [
    { title: "Write 2 blog posts", category: "content", priority: 1 },
    { title: "Send 125 cold emails", category: "outbound", priority: 1 },
    { title: "Analyze Google Ads performance (first month)", category: "ads", priority: 1 },
    { title: "Create 2 more case studies", category: "content", priority: 2 },
    { title: "Onboarding email sequence optimization", category: "outbound", priority: 3 },
  ],
  9: [
    { title: "Write 2 blog posts", category: "content", priority: 1 },
    { title: "Send 100 cold emails", category: "outbound", priority: 1 },
    { title: "Evaluate LinkedIn Ads launch", category: "ads", priority: 1 },
    { title: "Enterprise outbound: M&A advisors", category: "outbound", priority: 1 },
    { title: "Screen-only webinar on YouTube", category: "content", priority: 2 },
  ],
  10: [
    { title: "Launch LinkedIn Ads", category: "ads", priority: 1 },
    { title: "Write 2 blog posts", category: "content", priority: 1 },
    { title: "Enterprise outbound: investment bankers", category: "outbound", priority: 1 },
    { title: "Partnership outreach: accelerators", category: "outbound", priority: 2 },
  ],
  11: [
    { title: "Write 2 blog posts", category: "content", priority: 1 },
    { title: "Optimize funnel based on 8 months of data", category: "other", priority: 1 },
    { title: "Scale top 2 channels, cut bottom 2", category: "ads", priority: 1 },
    { title: "Submit Chrome Extension to Web Store", category: "other", priority: 2 },
    { title: "Zapier integration listing", category: "other", priority: 3 },
  ],
  12: [
    { title: "Write 2 blog posts", category: "content", priority: 1 },
    { title: "Launch annual plans with discount", category: "other", priority: 1 },
    { title: "Upsell existing base (free→pro, pro→biz)", category: "outbound", priority: 1 },
    { title: "Double down on best channels", category: "ads", priority: 1 },
    { title: "Review and hit R$20K/month target", category: "other", priority: 1 },
  ],
};

async function main() {
  for (const agent of AGENTS) {
    await prisma.gtmAgent.upsert({
      where: { name: agent.name },
      update: agent,
      create: agent,
    });
  }
  console.log(`Seeded ${AGENTS.length} agents`);

  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek;
  const startMonday = new Date(today);
  startMonday.setDate(today.getDate() + daysUntilMonday);
  startMonday.setHours(0, 0, 0, 0);

  for (let w = 1; w <= 12; w++) {
    const weekStart = new Date(startMonday);
    weekStart.setDate(startMonday.getDate() + (w - 1) * 7);

    const week = await prisma.gtmWeek.upsert({
      where: { weekStart },
      update: {},
      create: {
        weekStart,
        weekNumber: w,
        goals: JSON.stringify({
          week: w,
          focus: w <= 3 ? "Foundation" : w <= 6 ? "Traction" : w <= 9 ? "Growth" : "Scale",
        }),
      },
    });

    const template = WEEKLY_TEMPLATES[w] || [];
    for (const activity of template) {
      await prisma.gtmActivity.create({
        data: {
          weekId: week.id,
          title: activity.title,
          category: activity.category,
          priority: activity.priority,
        },
      });
    }

    console.log(`Week ${w}: ${template.length} activities`);
  }

  console.log("Done! 12-week GTM calendar seeded.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
