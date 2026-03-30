import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  author?: string;
  category?: string;
  tags?: string[];
}

export async function saveBlogDraft(post: BlogPost) {
  const date = new Date().toISOString().slice(0, 10);
  const dir = join(process.cwd(), "content", "blog");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const filename = `${date}-${post.slug}.mdx`;
  const filepath = join(dir, filename);

  const frontmatter = `---
title: "${post.title}"
description: "${post.description}"
date: "${date}"
author: "${post.author || "Alex Moreira"}"
category: "${post.category || "insight"}"
tags: ${JSON.stringify(post.tags || [])}
---

${post.content}`;

  writeFileSync(filepath, frontmatter, "utf-8");

  return { filepath: `content/blog/${filename}`, slug: post.slug };
}
