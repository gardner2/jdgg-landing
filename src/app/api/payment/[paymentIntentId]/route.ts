import { NextRequest, NextResponse } from 'next/server';
import { ultraSimpleDatabase } from '@/lib/ultra-simple-db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2023-10-16',
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paymentIntentId: string }> }
) {
  try {
    const { paymentIntentId } = await params;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) {
      return NextResponse.json(
        { error: 'Payment intent not found' },
        { status: 404 }
      );
    }

    // Get quote token from metadata
    const quoteToken = paymentIntent.metadata?.quote_token;
    
    if (!quoteToken) {
      return NextResponse.json(
        { error: 'Quote token not found in payment intent' },
        { status: 400 }
      );
    }

    // Get quote from database
    const quote = ultraSimpleDatabase.getQuoteByToken(quoteToken);
    
    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Check if payment intent is still valid
    if (paymentIntent.status === 'succeeded') {
      return NextResponse.json(
        { error: 'Payment has already been completed' },
        { status: 400 }
      );
    }

    if (paymentIntent.status === 'canceled') {
      return NextResponse.json(
        { error: 'Payment has been canceled' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentData: {
        paymentIntentId,
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        quote: {
          id: quote.id,
          client_name: quote.client_name,
          client_email: quote.client_email,
          project_type: quote.project_type,
          quote_amount: quote.quote_amount,
          quote_token: quote.quote_token
        }
      }
    });

  } catch (error: any) {
    console.error('Payment data fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment data' },
      { status: 500 }
    );
  }
}





