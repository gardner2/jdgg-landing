import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { crmDb } from '@/lib/crm-db';

// GET all projects
export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth();
    const projects = await crmDb.getAllProjects();
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}

// POST create new project
export async function POST(request: NextRequest) {
  try {
    await requireAdminAuth();
    const data = await request.json();
    
    const result = await crmDb.createProject({
      client_id: data.client_id,
      title: data.title,
      type: data.type,
      status: data.status,
      budget: data.budget,
      timeline: data.timeline,
      description: data.description,
    });
    
    return NextResponse.json({ 
      success: true, 
      id: result.lastInsertRowid 
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
