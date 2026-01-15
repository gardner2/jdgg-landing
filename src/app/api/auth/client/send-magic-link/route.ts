import { NextRequest, NextResponse } from 'next/server';
import { crmDb } from '@/lib/crm-db';
import { sendClientMagicLink } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Check if client exists and has portal access
    const client = await crmDb.getClientByEmail(email);
    
    if (!client || !client.portal_access) {
      // Don't reveal if client exists or has access for security
      return NextResponse.json({ success: true });
    }
    
    // Create magic link
    const { token } = await crmDb.createMagicLink(email, 'client');
    
    // Send email
    await sendClientMagicLink(email, token, client.name);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending client magic link:', error);
    return NextResponse.json(
      { error: 'Failed to send magic link' },
      { status: 500 }
    );
  }
}
