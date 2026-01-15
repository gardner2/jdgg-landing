import { NextRequest, NextResponse } from 'next/server';
import { crmDb } from '@/lib/crm-db';
import { sendAdminMagicLink } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Check if admin user exists
    const admin = await crmDb.getAdminByEmail(email);
    
    if (!admin) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({ success: true });
    }
    
    // Create magic link
    const { token } = await crmDb.createMagicLink(email, 'admin');
    
    // Send email
    await sendAdminMagicLink(email, token);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending admin magic link:', error);
    return NextResponse.json(
      { error: 'Failed to send magic link' },
      { status: 500 }
    );
  }
}
