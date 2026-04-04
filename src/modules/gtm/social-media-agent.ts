import { openai } from "@/lib/openai";
import { redis } from "@/lib/redis";
import { createExecution } from "./execution-tracker";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const LINKEDIN_THEMES = [
  "document tracking insight",
  "sales follow-up tips",
  "AI in docs",
  "building-in-public",
  "data rooms",
] as const;

const SUBREDDITS = ["startups", "SaaS", "Entrepreneur", "sales"] as const;

const SEARCH_TERMS = [
  "pitch deck",
  "document sharing",
  "investor follow up",
  "proposal tracking",
] as const;

const LINKEDIN_SYSTEM_PROMPT = `You are Alex Moreira, Head of Product at Peeeky. Write a LinkedIn post. Hook line, blank line, 3-5 short paragraphs, CTA with peeeky.com. Under 250 words. No emojis.`;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function dayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function isWeekend(): boolean {
  const day = new Date().getDay();
  return day === 0 || day === 6;
}

function rotateItem<T>(items: readonly T[]): T {
  return items[dayOfYear() % items.length];
}

/* ------------------------------------------------------------------ */
/*  Reddit API helpers                                                 */
/* ------------------------------------------------------------------ */

interface RedditThread {
  title: string;
  url: string;
  selftext: string;
  subreddit: string;
  permalink: string;
}

async function searchReddit(
  subreddit: string,
  term: string,
): Promise<RedditThread[]> {
  const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(term)}&sort=new&t=week&limit=5&restrict_sr=1`;

  const res = await fetch(url, {
    headers: { "User-Agent": "peeeky-gtm-agent/1.0" },
  });

  if (!res.ok) {
    console.warn(`Reddit search failed for r/${subreddit} q="${term}": ${res.status}`);
    return [];
  }

  const json = await res.json();
  const posts = json?.data?.children ?? [];

  return posts.map((child: { data: Record<string, string> }) => ({
    title: child.data.title,
    url: `https://www.reddit.com${child.data.permalink}`,
    selftext: (child.data.selftext ?? "").slice(0, 500),
    subreddit: child.data.subreddit,
    permalink: child.data.permalink,
  }));
}

/* ------------------------------------------------------------------ */
/*  LinkedIn post generation                                           */
/* ------------------------------------------------------------------ */

interface LinkedInOutput {
  topic: string;
  content: string;
  hashtags: string[];
}

async function generateLinkedInPost(theme: string): Promise<LinkedInOutput> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.8,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: LINKEDIN_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Write a LinkedIn post about: "${theme}". Return JSON with keys: topic (string), content (string), hashtags (string array, max 5).`,
      },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as LinkedInOutput;

  return {
    topic: parsed.topic ?? theme,
    content: parsed.content ?? "",
    hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
  };
}

/* ------------------------------------------------------------------ */
/*  Reddit comment generation                                          */
/* ------------------------------------------------------------------ */

interface RedditCommentOutput {
  subreddit: string;
  threadTitle: string;
  threadUrl: string;
  comment: string;
}

async function generateRedditComment(
  thread: RedditThread,
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content: `You are a helpful community member on Reddit. Write a genuinely helpful comment (80% pure value, 20% subtle Peeeky mention ONLY if naturally relevant). Be conversational, not salesy. No emojis. Keep it under 150 words.`,
      },
      {
        role: "user",
        content: `Thread title: "${thread.title}"\nSubreddit: r/${thread.subreddit}\nPost excerpt: "${thread.selftext}"\n\nWrite a helpful reply.`,
      },
    ],
  });

  return response.choices[0]?.message?.content ?? "";
}

/* ------------------------------------------------------------------ */
/*  Main executor                                                      */
/* ------------------------------------------------------------------ */

export async function executeSocialMedia(
  requiresApproval: boolean,
): Promise<{ output: string; itemsCreated: number }> {
  // 1. Skip weekends
  if (isWeekend()) {
    return { output: "Skipped: weekend", itemsCreated: 0 };
  }

  // 2. Check Redis dedup key
  const redisKey = `social-media:generated:${todayKey()}`;
  const alreadyRan = await redis.get(redisKey);
  if (alreadyRan) {
    return { output: "Skipped: already generated today", itemsCreated: 0 };
  }

  const now = new Date();
  const status = requiresApproval ? "awaiting_approval" : "pending";
  let itemsCreated = 0;
  const summaryParts: string[] = [];

  // 3. Generate LinkedIn post
  const theme = rotateItem(LINKEDIN_THEMES);
  const linkedIn = await generateLinkedInPost(theme);

  await createExecution({
    agentName: "social-media",
    actionType: "linkedin_post",
    title: `LinkedIn: ${linkedIn.topic}`,
    scheduledAt: now,
    metadata: {
      platform: "linkedin",
      topic: linkedIn.topic,
      content: linkedIn.content,
      hashtags: linkedIn.hashtags,
      status,
    },
  });
  itemsCreated++;
  summaryParts.push(`LinkedIn post: "${linkedIn.topic}"`);

  // 4. Generate Reddit comments
  const subreddit = rotateItem(SUBREDDITS);
  const searchTerm = rotateItem(SEARCH_TERMS);

  const threads = await searchReddit(subreddit, searchTerm);
  const relevantThreads = threads.slice(0, 2);

  const redditResults: RedditCommentOutput[] = [];

  for (const thread of relevantThreads) {
    const comment = await generateRedditComment(thread);
    if (!comment) continue;

    const commentData: RedditCommentOutput = {
      subreddit: thread.subreddit,
      threadTitle: thread.title,
      threadUrl: thread.url,
      comment,
    };

    await createExecution({
      agentName: "social-media",
      actionType: "reddit_comment",
      title: `Reddit r/${thread.subreddit}: ${thread.title.slice(0, 60)}`,
      scheduledAt: now,
      metadata: {
        platform: "reddit",
        subreddit: commentData.subreddit,
        threadTitle: commentData.threadTitle,
        threadUrl: commentData.threadUrl,
        comment: commentData.comment,
        status,
      },
    });
    itemsCreated++;
    redditResults.push(commentData);
  }

  summaryParts.push(
    `Reddit: ${redditResults.length} comments in r/${subreddit} (search: "${searchTerm}")`,
  );

  // 5. Set Redis key with 24h expiry
  await redis.set(redisKey, "1", { ex: 86400 });

  const output = `Social media agent completed for ${todayKey()}.\n${summaryParts.join("\n")}`;
  return { output, itemsCreated };
}
