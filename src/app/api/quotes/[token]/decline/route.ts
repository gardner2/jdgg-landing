import { NextRequest, NextResponse } from 'next/server';
import { ultraSimpleDatabase } from '@/lib/ultra-simple-db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    
    // Get the quote
    const quote = ultraSimpleDatabase.getQuoteByToken(token);
    
    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }
    
    // Check if quote is still valid
    if (quote.status !== 'sent_to_client') {
      return NextResponse.json(
        { error: 'Quote is no longer available' },
        { status: 400 }
      );
    }
    
    // Update quote status to declined
    const statusResult = ultraSimpleDatabase.updateStatus({ token }, 'declined');
    
    if (!statusResult) {
      return NextResponse.json(
        { error: 'Failed to update quote status' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Quote declined successfully'
    });
    
  } catch (error: any) {
    console.error('Quote decline error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
