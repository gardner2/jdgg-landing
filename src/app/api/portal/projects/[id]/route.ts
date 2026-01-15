import { NextRequest, NextResponse } from 'next/server';
import { requireClientAuth } from '@/lib/client-auth';
import { crmDb } from '@/lib/crm-db';

// GET single project (with auth check)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireClientAuth();
    const { id } = await params;
    const project = await crmDb.getProject(parseInt(id));
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Verify project belongs to this client
    if (project.client_id !== session.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    const updates = await crmDb.getProjectUpdates(parseInt(id));
    
    return NextResponse.json({ project, updates });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}
