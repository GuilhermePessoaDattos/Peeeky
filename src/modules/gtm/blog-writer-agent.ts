import { openai } from "@/lib/openai";
import {
  createExecution,
  markRunning,
  markSuccess,
  markFailed,
  markAwaitingApproval,
} from "./execution-tracker";

/* ------------------------------------------------------------------ */
/*  Topic types & prompts                                              */
/* ------------------------------------------------------------------ */

type TopicType = "comparison" | "pain-point" | "tutorial" | "data-driven";

const TOPIC_ROTATION: TopicType[] = [
  "comparison",
  "pain-point",
  "tutorial",
  "data-driven",
];

const TOPIC_PROMPTS: Record<TopicType, string> = {
  comparison:
    "Write a comparison blog post that evaluates Peeeky against a competitor or alternative approach for sharing documents with tracking. " +
    "Focus on concrete feature differences, pricing, and use-case fit. " +
    "Title format: 'X vs Y: Which is Better for [Use Case]?' " +
    "Target keywords around document tracking, link sharing analytics, and pitch deck tools.",

  "pain-point":
    "Write a blog post that addresses a specific pain point founders, sales teams, or fundraising professionals face " +
    "when sharing sensitive documents without knowing who opens them or how long they read. " +
    "Agitate the problem with real-world consequences, then position Peeeky as the solution. " +
    "Title format: 'Why [Pain Point] is Costing You [Outcome]'.",

  tutorial:
    "Write a step-by-step tutorial blog post showing how to use Peeeky for a specific workflow " +
    "(e.g., sharing a pitch deck with investors, sending a sales proposal with tracking, creating a branded document portal). " +
    "Include numbered steps, practical tips, and expected outcomes. " +
    "Title format: 'How to [Achieve Goal] with Peeeky in [Timeframe]'.",

  "data-driven":
    "Write a data-driven blog post that references industry statistics about document engagement, " +
    "investor behavior, sales conversion rates, or content tracking. " +
    "Cite plausible benchmarks and tie them back to why real-time document analytics matter. " +
    "Title format: '[Stat] of [Audience] Do [Behavior] -- Here is What That Means for You'.",
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getWeekNumber(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  return Math.floor(diff / oneWeek) + 1;
}

function pickTopicType(now: Date): TopicType {
  const week = getWeekNumber(now);
  const daySlot = now.getDay() === 1 ? 0 : 1; // Monday = 0, Thursday = 1
  const index = (week * 2 + daySlot) % TOPIC_ROTATION.length;
  return TOPIC_ROTATION[index];
}

function buildFrontmatter(meta: {
  title: string;
  date: string;
  description: string;
  author: string;
  tags: string[];
}): string {
  const tagList = meta.tags.map((t) => `  - ${t}`).join("\n");
  return [
    "---",
    `title: "${meta.title}"`,
    `date: "${meta.date}"`,
    `description: "${meta.description}"`,
    `author: "${meta.author}"`,
    "tags:",
    tagList,
    "---",
  ].join("\n");
}

/* ------------------------------------------------------------------ */
/*  GitHub publish                                                     */
/* ------------------------------------------------------------------ */

async function publishToGitHub(
  slug: string,
  mdxContent: string,
): Promise<{ published: boolean; url?: string; error?: string }> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return { published: false, error: "GITHUB_TOKEN not configured" };
  }

  const path = `content/blog/${slug}.mdx`;
  const url = `https://api.github.com/repos/GuilhermePessoaDattos/Peeeky/contents/${path}`;
  const body = JSON.stringify({
    message: `blog: publish ${slug}`,
    content: Buffer.from(mdxContent).toString("base64"),
    branch: "main",
  });

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body,
  });

  if (!res.ok) {
    const errText = await res.text();
    return { published: false, error: `GitHub API ${res.status}: ${errText}` };
  }

  const data = (await res.json()) as { content?: { html_url?: string } };
  return {
    published: true,
    url: data.content?.html_url ?? `https://github.com/GuilhermePessoaDattos/Peeeky/blob/main/${path}`,
  };
}

/* ------------------------------------------------------------------ */
/*  Main agent                                                         */
/* ------------------------------------------------------------------ */

export async function executeBlogWriter(
  requiresApproval: boolean,
): Promise<{ output: string; itemsCreated: number }> {
  const now = new Date();
  const dayOfWeek = now.getDay();

  /* ---- Guard: only Monday and Thursday ---- */
  if (dayOfWeek !== 1 && dayOfWeek !== 4) {
    return {
      output: `Skipped: blog-writer only runs on Monday and Thursday (today is day ${dayOfWeek}).`,
      itemsCreated: 0,
    };
  }

  /* ---- Pick topic ---- */
  const topicType = pickTopicType(now);
  const topicPrompt = TOPIC_PROMPTS[topicType];

  /* ---- Create execution record ---- */
  const execution = await createExecution({
    agentName: "blog-writer",
    actionType: "blog_publish",
    title: `Generate ${topicType} blog post`,
    scheduledAt: now,
    metadata: { topicType },
  });

  const startTime = Date.now();

  try {
    await markRunning(execution.id);

    /* ---- Generate blog post via OpenAI ---- */
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.9,
      max_tokens: 4000,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are Alex Moreira, Head of Product at Peeeky (peeeky.com). " +
            "Write 800-1200 word SEO-optimized blog post. " +
            "Include internal links to /login, /vs/docsend, /for/fundraising, /for/sales. " +
            "End with CTA. No emojis. Use ## for H2, ### for H3.",
        },
        {
          role: "user",
          content:
            `${topicPrompt}\n\n` +
            "Return a JSON object with exactly these keys: " +
            '{ "slug": "url-friendly-slug", "title": "Blog Post Title", ' +
            '"description": "Meta description under 160 chars", ' +
            '"tags": ["tag1", "tag2", "tag3"], "content": "Full markdown body" }',
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      throw new Error("OpenAI returned an empty response");
    }

    const parsed = JSON.parse(raw) as {
      slug: string;
      title: string;
      description: string;
      tags: string[];
      content: string;
    };

    /* ---- Build full MDX ---- */
    const dateStr = now.toISOString().split("T")[0];
    const frontmatter = buildFrontmatter({
      title: parsed.title,
      date: dateStr,
      description: parsed.description,
      author: "Alex Moreira",
      tags: parsed.tags,
    });

    const mdxContent = `${frontmatter}\n\n${parsed.content}\n`;

    /* ---- Approval gate ---- */
    if (requiresApproval) {
      await markAwaitingApproval(execution.id);
      return {
        output:
          `Blog post "${parsed.title}" (${topicType}) generated and awaiting approval. ` +
          `Slug: ${parsed.slug}. Execution ID: ${execution.id}.`,
        itemsCreated: 1,
      };
    }

    /* ---- Autonomous: publish to GitHub ---- */
    const result = await publishToGitHub(parsed.slug, mdxContent);
    const duration = Date.now() - startTime;

    if (result.published) {
      await markSuccess(
        execution.id,
        `Published "${parsed.title}" to ${result.url}`,
        duration,
      );
      return {
        output: `Published blog post "${parsed.title}" (${topicType}) to GitHub: ${result.url}`,
        itemsCreated: 1,
      };
    }

    // No GitHub token -- save as draft
    await markSuccess(
      execution.id,
      `Draft saved: "${parsed.title}" (no GITHUB_TOKEN). ${result.error}`,
      duration,
    );
    return {
      output:
        `Blog post "${parsed.title}" (${topicType}) generated as draft. ` +
        `${result.error}. Execution ID: ${execution.id}.`,
      itemsCreated: 1,
    };
  } catch (err) {
    const duration = Date.now() - startTime;
    const message = err instanceof Error ? err.message : String(err);
    await markFailed(execution.id, message, duration);
    return {
      output: `blog-writer failed: ${message}`,
      itemsCreated: 0,
    };
  }
}
