import { getAllPosts } from "@/lib/posts";

export default function BlogPage() {
  const posts = getAllPosts();

  console.log(posts); // <-- test here

  return (
    <div>
      <h1>Blog</h1>
    </div>
  );
}
