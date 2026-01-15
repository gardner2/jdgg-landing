import { crmDb } from '@/lib/crm-db';
import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | JGDD',
  description: 'Insights on web development, design, and modern software practices.',
};

function formatDate(dateString: string | null) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function BlogPage() {
  const posts = await crmDb.getAllBlogPosts(true);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Blog</h1>
          <p className="text-xl text-muted-foreground">
            Insights on web development, design, and modern software practices.
          </p>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">No blog posts yet.</p>
            <p className="text-muted-foreground">Check back soon for updates.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {posts.map((post: any) => (
              <article key={post.id} className="group">
                <Link href={`/blog/${post.slug}`}>
                  <div className="grid md:grid-cols-3 gap-6">
                    {post.featured_image && (
                      <div className="md:col-span-1">
                        <div className="aspect-video rounded-lg overflow-hidden border border-border bg-muted">
                          <img
                            src={post.featured_image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </div>
                    )}
                    <div className={post.featured_image ? 'md:col-span-2' : 'md:col-span-3'}>
                      <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                        {post.category && (
                          <span className="px-3 py-1 bg-muted rounded-full text-xs font-medium">
                            {post.category}
                          </span>
                        )}
                        {post.published_at && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(post.published_at)}</span>
                          </div>
                        )}
                      </div>
                      <h2 className="text-2xl font-bold mb-3 group-hover:text-foreground/80 transition-colors">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-muted-foreground mb-4 leading-relaxed">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all">
                        Read more
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
