import Callout from "@/components/Callout";
import CodeBlock from "@/components/CodeBlock";
import { getPostBySlug, getAllPosts } from "@/lib/posts";
import { MDXRemote } from "next-mdx-remote/rsc";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  const posts = getAllPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;

  if (!slug) {
    throw new Error("Slug is missing");
  }

  const { content, meta } = getPostBySlug(slug);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">{meta.title}</h1>
      <p className="text-sm text-gray-500 mb-6">{meta.date}</p>

      <article className="prose prose-lg">
        <MDXRemote
          source={content}
          components={{
            Callout,
            pre: CodeBlock,
          }}
        />
      </article>
    </div>
  );
}
