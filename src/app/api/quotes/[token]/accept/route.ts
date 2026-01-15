import { NextRequest, NextResponse } from 'next/server';
import { ultraSimpleDatabase } from '@/lib/ultra-simple-db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2023-10-16',
});

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
    
    if (quote.expires_at && new Date(quote.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Quote has expired' },
        { status: 400 }
      );
    }
    
    // Update quote status to accepted
    const statusResult = ultraSimpleDatabase.updateStatus({ token }, 'accepted');
    
    if (!statusResult) {
      return NextResponse.json(
        { error: 'Failed to update quote status' },
        { status: 500 }
      );
    }
    
    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: quote.client_email,
      name: quote.client_name || undefined,
      metadata: {
        quote_id: quote.id.toString(),
        quote_token: token
      }
    });
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: quote.quote_amount * 100, // Convert to pence
      currency: 'gbp',
      customer: customer.id,
      metadata: {
        quote_id: quote.id.toString(),
        quote_token: token
      },
      description: `Project Quote #${quote.id} - ${quote.project_type}`,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    return NextResponse.json({
      success: true,
      paymentUrl: `/payment/${paymentIntent.id}`,
      clientSecret: paymentIntent.client_secret
    });
    
  } catch (error: any) {
    console.error('Quote acceptance error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
