import { NextRequest, NextResponse } from 'next/server';
import { portalDatabase } from '@/lib/portal-database';

// Verify magic link and create session
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Validate magic link
    const validationResult = await portalDatabase.validateMagicLink(token);
    
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error }, { status: 400 });
    }

    // Get client
    const client = await portalDatabase.getClientByEmail(validationResult.email!);
    
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Mark magic link as used
    await portalDatabase.useMagicLink(token);

    // Create session
    const sessionResult = await portalDatabase.createSession(client.id!);
    
    if (!sessionResult.success) {
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    // Set session cookie
    const response = NextResponse.json({ 
      success: true, 
      client: {
        id: client.id,
        email: client.email,
        name: client.name,
        company: client.company,
        subscription_status: client.subscription_status,
        monthly_reviews_used: client.monthly_reviews_used,
        monthly_reviews_limit: client.monthly_reviews_limit
      }
    });

    response.cookies.set('session_token', sessionResult.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });

    return response;

  } catch (error: any) {
    console.error('Magic link verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}





