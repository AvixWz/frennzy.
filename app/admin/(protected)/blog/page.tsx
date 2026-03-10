import { BlogManager } from "@/components/admin/blog-manager";
import { listBlogPosts } from "@/lib/services/admin-service";

export default async function AdminBlogPage() {
  const posts = await listBlogPosts();
  return <BlogManager initialPosts={JSON.parse(JSON.stringify(posts))} />;
}
