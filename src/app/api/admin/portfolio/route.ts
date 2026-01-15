import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { crmDb } from '@/lib/crm-db';

// GET all portfolio projects
export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth();
    const projects = await crmDb.getAllPortfolioProjects();
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching portfolio projects:', error);
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}

// POST create new portfolio project
export async function POST(request: NextRequest) {
  try {
    await requireAdminAuth();
    const data = await request.json();
    
    const result = await crmDb.createPortfolioProject({
      title: data.title,
      description: data.description,
      tags: data.tags,
      image_url: data.image_url,
      live_url: data.live_url,
      featured: data.featured,
    });
    
    return NextResponse.json({ 
      success: true, 
      id: result.lastInsertRowid 
    });
  } catch (error) {
    console.error('Error creating portfolio project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
