import { NextRequest, NextResponse } from 'next/server';
import { requireClientAuth } from '@/lib/client-auth';
import { crmDb } from '@/lib/crm-db';

// GET client's projects
export async function GET(request: NextRequest) {
  try {
    const session = await requireClientAuth();
    const projects = await crmDb.getProjectsByClient(session.id);
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}
