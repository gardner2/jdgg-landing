import { NextRequest, NextResponse } from 'next/server';
import { portalDatabase } from '@/lib/portal-database';

// Get current authenticated client
export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'No session token' }, { status: 401 });
    }

    // Validate session
    const sessionResult = await portalDatabase.validateSession(sessionToken);
    
    if (!sessionResult.success) {
      return NextResponse.json({ error: sessionResult.error }, { status: 401 });
    }

    return NextResponse.json({ 
      success: true, 
      client: sessionResult.client 
    });

  } catch (error: any) {
    console.error('Session validation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}





