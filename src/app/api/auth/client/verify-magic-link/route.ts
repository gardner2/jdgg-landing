import { NextRequest, NextResponse } from 'next/server';
import { crmDb } from '@/lib/crm-db';
import { setClientSession } from '@/lib/client-auth';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }
    
    // Get magic link
    const magicLink = await crmDb.getMagicLink(token);
    
    if (!magicLink) {
      return NextResponse.json(
        { error: 'Invalid or expired link' },
        { status: 400 }
      );
    }
    
    // Check expiration
    const expiresAt = new Date(magicLink.expires_at);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Link has expired' },
        { status: 400 }
      );
    }
    
    // Check if it's for client
    if (magicLink.user_type !== 'client') {
      return NextResponse.json(
        { error: 'Invalid link' },
        { status: 400 }
      );
    }
    
    // Verify client exists and has portal access
    const client = await crmDb.getClientByEmail(magicLink.email);
    if (!client || !client.portal_access) {
      return NextResponse.json(
        { error: 'Portal access not granted' },
        { status: 403 }
      );
    }
    
    // Mark magic link as used
    await crmDb.useMagicLink(token);
    
    // Create session
    await setClientSession(magicLink.email);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error verifying client magic link:', error);
    return NextResponse.json(
      { error: 'Failed to verify link' },
      { status: 500 }
    );
  }
}
