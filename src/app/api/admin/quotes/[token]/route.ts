import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { quotesDb } from '@/lib/quotes-db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    await requireAdminAuth();
    const { token } = await params;
    const quote = await quotesDb.getQuoteByToken(token);
    
    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      quote
    });
  } catch (error: any) {
    console.error('Error fetching quote:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    await requireAdminAuth();
    const { token } = await params;
    const result = await quotesDb.deleteQuote({ token });
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to delete quote' }, { status: 500 });
    }
    return NextResponse.json({ success: true, message: 'Quote deleted' });
  } catch (error: any) {
    console.error('Error deleting quote:', error);
    return NextResponse.json({ error: 'Failed to delete quote' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    await requireAdminAuth();
    const { token } = await params;
    const { admin_notes, final_amount } = await request.json();
    
    const result = await quotesDb.updateAdminNotes(
      token,
      admin_notes || '',
      final_amount || null
    );
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update quote' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Quote updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating quote:', error);
    return NextResponse.json(
      { error: 'Failed to update quote' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    await requireAdminAuth();
    const { token } = await params;
    const { action, status: newStatus } = await request.json();
    
    if (action === 'send_to_client') {
      const result = await quotesDb.sendToClient(token);
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Failed to send quote to client' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Quote sent to client successfully'
      });
    }
    
    if (action === 'update_status') {
      if (!newStatus) {
        return NextResponse.json({ error: 'Missing status' }, { status: 400 });
      }
      const allowed = ['pending_review', 'sent_to_client', 'accepted', 'declined', 'paid'];
      if (!allowed.includes(newStatus)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      const result = await quotesDb.updateStatus({ token }, newStatus);
      if (!result.success) {
        return NextResponse.json({ error: result.error || 'Failed to update status' }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: 'Status updated' });
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error processing quote action:', error);
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    );
  }
}