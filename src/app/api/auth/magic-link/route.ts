import { NextRequest, NextResponse } from 'next/server';
import { portalDatabase } from '@/lib/portal-database';
import { sendClientMagicLink } from '@/lib/email';

// Send magic link
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if client exists, create if not
    let client = await portalDatabase.getClientByEmail(email);
    
    if (!client) {
      // Create new client (this would typically be done after project completion)
      const result = await portalDatabase.createClient({
        email,
        name: email.split('@')[0], // Temporary name
        company: '',
        phone: '',
        project_id: null
      });
      
      if (!result.success) {
        return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
      }
      
      client = await portalDatabase.getClientById(result.id!);
    }

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Create magic link
    const magicLinkResult = await portalDatabase.createMagicLink(email);
    
    if (!magicLinkResult.success) {
      return NextResponse.json({ error: 'Failed to create magic link' }, { status: 500 });
    }

    const magicLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/verify?token=${magicLinkResult.token}`;
    await sendClientMagicLink(email, magicLinkResult.token, client.name);

    return NextResponse.json({ 
      success: true, 
      message: 'Magic link sent to your email',
      // Remove this in production
      magicLink: process.env.NODE_ENV === 'development' ? magicLink : undefined
    });

  } catch (error: any) {
    console.error('Magic link creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}





