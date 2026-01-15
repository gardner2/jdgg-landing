import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { crmDb } from '@/lib/crm-db';

// GET all clients
export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth();
    const clients = await crmDb.getAllClients();
    return NextResponse.json({ clients });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}

// POST create new client
export async function POST(request: NextRequest) {
  try {
    await requireAdminAuth();
    const data = await request.json();
    
    const result = await crmDb.createClient({
      email: data.email,
      name: data.name,
      company: data.company,
      phone: data.phone,
      portal_access: data.portal_access,
    });
    
    return NextResponse.json({ 
      success: true, 
      id: result.lastInsertRowid 
    });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}
