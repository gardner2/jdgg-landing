import { NextRequest, NextResponse } from 'next/server';
import { clearAdminSession } from '@/lib/admin-auth';
import { clearClientSession } from '@/lib/client-auth';

export async function POST(request: NextRequest) {
  try {
    const { userType } = await request.json();
    
    if (userType === 'admin') {
      await clearAdminSession();
    } else {
      await clearClientSession();
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging out:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}
