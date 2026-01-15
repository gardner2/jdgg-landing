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
    const { paymentIntentId } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      );
    }

    // Verify payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment has not been completed' },
        { status: 400 }
      );
    }

    // Get quote from database
    const quote = ultraSimpleDatabase.getQuoteByToken(token);
    
    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Update quote status to paid
    const updateResult = ultraSimpleDatabase.updateStatus({ token }, 'paid');
    
    if (!updateResult) {
      return NextResponse.json(
        { error: 'Failed to update quote status' },
        { status: 500 }
      );
    }

    // TODO: Send confirmation email to client
    // TODO: Notify admin team of successful payment
    // TODO: Create client portal access if not already exists

    return NextResponse.json({
      success: true,
      message: 'Payment confirmed and quote status updated',
      quote: {
        id: quote.id,
        status: 'paid',
        paymentIntentId
      }
    });

  } catch (error: any) {
    console.error('Payment success handling error:', error);
    return NextResponse.json(
      { error: 'Failed to process payment confirmation' },
      { status: 500 }
    );
  }
}





