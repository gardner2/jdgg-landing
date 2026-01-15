import { NextRequest, NextResponse } from 'next/server';
import { ultraSimpleDatabase } from '@/lib/ultra-simple-db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const q = searchParams.get('q')?.toLowerCase();

    let quotes = ultraSimpleDatabase.getAllQuotes();

    if (status && status !== 'all') {
      quotes = quotes.filter((qte: any) => qte.status === status);
    }
    if (q) {
      quotes = quotes.filter((qte: any) =>
        (qte.client_name || '').toLowerCase().includes(q) ||
        (qte.client_email || '').toLowerCase().includes(q) ||
        (qte.project_type || '').toLowerCase().includes(q) ||
        (qte.quote_token || '').toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ success: true, quotes });
  } catch (error: any) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch quotes' }, { status: 500 });
  }
}