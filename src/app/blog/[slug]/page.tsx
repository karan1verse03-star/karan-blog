import { getPostBySlug } from "@/lib/posts";
import { MDXRemote } from "next-mdx-remote/rsc";
import Callout from "@/components/Callout";

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { content, title } = getPostBySlug(slug);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">{title}</h1>

      <article className="prose prose-lg">
        <MDXRemote source={content} components={{ Callout }} />
      </article>
    </div>
  );
}
