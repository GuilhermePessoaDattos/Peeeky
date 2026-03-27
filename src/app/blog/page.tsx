import { getAllPosts } from "@/lib/mdx";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Peeeky",
  description: "Insights on document tracking, analytics, and secure sharing.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            Peeeky
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-2">Blog</h1>
        <p className="text-gray-500 mb-12">
          Insights on document tracking, analytics, and secure sharing.
        </p>

        <div className="space-y-12">
          {posts.map((post) => (
            <article key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="group">
                <time className="text-sm text-gray-400">{post.date}</time>
                <h2 className="text-2xl font-semibold mt-1 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-600 mt-2">{post.description}</p>
              </Link>
            </article>
          ))}

          {posts.length === 0 && (
            <p className="text-gray-400">No posts yet. Check back soon!</p>
          )}
        </div>
      </main>
    </div>
  );
}
