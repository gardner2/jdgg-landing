import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { crmDb } from '@/lib/crm-db';

// GET all contact submissions
export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth();
    const contacts = await crmDb.getAllContactSubmissions();
    return NextResponse.json({ contacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}
