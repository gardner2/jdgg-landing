import { NextRequest, NextResponse } from 'next/server';
import { crmDb } from '@/lib/crm-db';

// GET public blog posts (published only)
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    
    const posts = category
      ? await crmDb.getBlogPostsByCategory(category)
      : await crmDb.getAllBlogPosts(true);
    
    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}
