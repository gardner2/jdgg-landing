import { NextRequest, NextResponse } from 'next/server';
import { crmDb } from '@/lib/crm-db';
import { setAdminSession } from '@/lib/admin-auth';

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
    
    // Check if it's for admin
    if (magicLink.user_type !== 'admin') {
      return NextResponse.json(
        { error: 'Invalid link' },
        { status: 400 }
      );
    }
    
    // Verify admin exists
    const admin = await crmDb.getAdminByEmail(magicLink.email);
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 400 }
      );
    }
    
    // Mark magic link as used
    await crmDb.useMagicLink(token);
    
    // Create session
    await setAdminSession(magicLink.email);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error verifying admin magic link:', error);
    return NextResponse.json(
      { error: 'Failed to verify link' },
      { status: 500 }
    );
  }
}
