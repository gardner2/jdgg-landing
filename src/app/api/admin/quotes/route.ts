import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { quotesDb } from '@/lib/quotes-db';

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const q = searchParams.get('q') || '';

    const quotes = await quotesDb.getAllQuotes({
      status: status !== 'all' ? status : undefined,
      search: q || undefined
    });

    return NextResponse.json({ success: true, quotes });
  } catch (error: any) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch quotes' }, { status: 500 });
  }
}