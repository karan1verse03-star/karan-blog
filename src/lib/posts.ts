import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "src/content/posts");

export function getPostBySlug(slug: string) {
  const filePath = path.join(postsDirectory, `${slug}.mdx`);
  const fileContent = fs.readFileSync(filePath, "utf8");

  const { content, data } = matter(fileContent);

  return {
    content,
    ...data,
  };
}

export function getAllPosts() {
  const files = fs.readdirSync(postsDirectory);

  return files.map((fileName) => {
    const slug = fileName.replace(".mdx", "");
    const fullPath = path.join(postsDirectory, fileName);
    const fileContent = fs.readFileSync(fullPath, "utf8");

    const { data } = matter(fileContent);

    return {
      slug,
      ...data,
    };
  });
}
