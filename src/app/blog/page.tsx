import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Blog</h1>

      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.slug}>
            <Link href={`/blog/${post.slug}`}>
              <h2 className="text-xl font-semibold">{post.title}</h2>
            </Link>
            <p className="text-sm text-gray-500">{post.date}</p>
            <p className="text-gray-700">{post.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
