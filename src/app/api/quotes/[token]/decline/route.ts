import { NextRequest, NextResponse } from 'next/server';
import { quotesDb } from '@/lib/quotes-db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    
    // Get the quote
    const quote = await quotesDb.getQuoteByToken(token);
    
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
    const statusResult = await quotesDb.updateStatus({ token }, 'declined');
    
    if (!statusResult.success) {
      return NextResponse.json(
        { error: statusResult.error || 'Failed to update quote status' },
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
