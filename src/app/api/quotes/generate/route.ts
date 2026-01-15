import { NextRequest, NextResponse } from 'next/server';
import { ultraSimpleDatabase } from '@/lib/ultra-simple-db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    
    const {
      email,
      name,
      company,
      phone,
      projectType,
      scopeFeatures,
      timeline,
      budgetRange,
      requirements
    } = formData;

    // Validate required fields
    if (!email || !projectType || !scopeFeatures || !timeline || !budgetRange) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Normalize timeline and budget to readable strings
    const timelineStr = typeof timeline === 'string'
      ? timeline
      : (timeline?.deadline || timeline?.label || timeline?.value || '') as string;

    const budgetStr = typeof budgetRange === 'string'
      ? budgetRange
      : (budgetRange?.range || budgetRange?.label || budgetRange?.value || '') as string;

    // Create quote
    const result = await ultraSimpleDatabase.createQuote({
      email,
      name,
      company,
      phone,
      projectType,
      scopeFeatures,
      timeline: timelineStr,
      budgetRange: budgetStr,
      requirements
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    // In a real application, you would send an email here
    // For now, we'll just return the quote token
    console.log(`Quote generated for ${email}: ${result.quoteToken}`);
    console.log(`Quote amount: £${result.quoteAmount}`);
    console.log(`Quote review URL: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/quote/${result.quoteToken}`);

    return NextResponse.json({
      success: true,
      quoteToken: result.quoteToken,
      quoteAmount: result.quoteAmount,
      reviewUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/quote/${result.quoteToken}`
    });

  } catch (error: any) {
    console.error('Quote generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
