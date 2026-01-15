import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { crmDb } from '@/lib/crm-db';

// POST create project update
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminAuth();
    const { id } = await params;
    const data = await request.json();
    
    await crmDb.createProjectUpdate({
      project_id: parseInt(id),
      title: data.title,
      description: data.description,
      status: data.status,
      created_by: session.email,
    });
    
    // Optionally send email notification to client
    // const project = crmDb.getProject(parseInt(id));
    // if (project) {
    //   await sendProjectUpdateNotification(...);
    // }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating project update:', error);
    return NextResponse.json(
      { error: 'Failed to create update' },
      { status: 500 }
    );
  }
}
