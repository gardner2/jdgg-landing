import { NextRequest, NextResponse } from 'next/server';
import { crmDb } from '@/lib/crm-db';
import { sendContactNotification, sendContactConfirmation } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.email || !data.message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }
    
    // Create contact submission
    await crmDb.createContactSubmission({
      name: data.name,
      email: data.email,
      company: data.company,
      phone: data.phone,
      message: data.message,
    });
    
    // Send notifications
    await Promise.all([
      sendContactNotification(data),
      sendContactConfirmation(data.email, data.name),
    ]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return NextResponse.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    );
  }
}
