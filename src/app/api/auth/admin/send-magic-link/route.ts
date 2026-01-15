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
    const emailResult = await sendAdminMagicLink(email, token);
    
    if (!emailResult.success) {
      console.error('❌ Failed to send magic link email:', emailResult.error);
      // Still return success to user (security: don't reveal if email exists)
      // But log the error for debugging
    } else if (emailResult.devMode) {
      console.log('✅ Magic link created (dev mode - check console above for link)');
      console.log(`🔗 Magic link: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/auth/verify?token=${token}`);
    } else {
      console.log('✅ Magic link email sent successfully');
    }
    
    return NextResponse.json({ 
      success: true,
      // In development, include the link for testing
      ...(process.env.NODE_ENV === 'development' && { 
        devLink: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/auth/verify?token=${token}` 
      })
    });
  } catch (error) {
    console.error('Error sending admin magic link:', error);
    return NextResponse.json(
      { error: 'Failed to send magic link' },
      { status: 500 }
    );
  }
}
