import { NextRequest, NextResponse } from 'next/server';
import { crmDb } from '@/lib/crm-db';

// GET public portfolio items (featured only)
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const featured = url.searchParams.get('featured') === 'true';
    
    const projects = featured 
      ? await crmDb.getFeaturedPortfolioProjects()
      : await crmDb.getAllPortfolioProjects();
    
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}
