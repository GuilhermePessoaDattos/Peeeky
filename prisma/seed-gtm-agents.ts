import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const agents = [
    {
      name: "cold-email",
      displayName: "Cold Email Outreach",
      description:
        "Scrapes leads from TechCrunch, personalizes cold emails via OpenAI, sends via Resend. Auto follow-up after 3 days.",
      schedule: "0 9 * * 1-5",
      status: "active",
      requiresApproval: false,
    },
    {
      name: "blog-writer",
      displayName: "Blog SEO Pipeline",
      description:
        "Generates SEO-optimized blog posts via OpenAI, publishes to GitHub. Runs Monday and Thursday.",
      schedule: "0 8 * * 1,4",
      status: "active",
      requiresApproval: true,
    },
    {
      name: "social-media",
      displayName: "Social Media Prep",
      description:
        "Generates LinkedIn posts and Reddit comments daily. Playwright script publishes them locally.",
      schedule: "0 8 * * 1-5",
      status: "active",
      requiresApproval: false,
    },
  ];

  for (const agent of agents) {
    await prisma.gtmAgent.upsert({
      where: { name: agent.name },
      update: {
        displayName: agent.displayName,
        description: agent.description,
        schedule: agent.schedule,
        requiresApproval: agent.requiresApproval,
      },
      create: agent,
    });
    console.log(`Upserted agent: ${agent.name} (approval: ${agent.requiresApproval})`);
  }

  console.log("Done!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err);
    prisma.$disconnect();
    process.exit(1);
  });
