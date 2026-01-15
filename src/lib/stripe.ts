import Stripe from 'stripe';

// Initialize Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

// Stripe configuration
export const STRIPE_CONFIG = {
  // Monthly subscription price (in cents)
  MONTHLY_PRICE_ID: process.env.STRIPE_MONTHLY_PRICE_ID || 'price_monthly_care_plan',
  
  // Webhook endpoint secret
  WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  
  // Currency
  CURRENCY: 'gbp',
  
  // Trial period (in days)
  TRIAL_PERIOD_DAYS: 7,
};

// Create a customer in Stripe
export const createStripeCustomer = async (email: string, name: string, metadata?: Record<string, string>) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        ...metadata,
        source: 'quietforge_portal'
      }
    });
    
    return { success: true, customer };
  } catch (error) {
    console.error('Stripe customer creation error:', error);
    return { success: false, error: error.message };
  }
};

// Create a subscription
export const createSubscription = async (customerId: string, priceId: string) => {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      trial_period_days: STRIPE_CONFIG.TRIAL_PERIOD_DAYS,
      metadata: {
        source: 'quietforge_portal'
      }
    });
    
    return { success: true, subscription };
  } catch (error) {
    console.error('Stripe subscription creation error:', error);
    return { success: false, error: error.message };
  }
};

// Cancel a subscription
export const cancelSubscription = async (subscriptionId: string) => {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    return { success: true, subscription };
  } catch (error) {
    console.error('Stripe subscription cancellation error:', error);
    return { success: false, error: error.message };
  }
};

// Get subscription details
export const getSubscription = async (subscriptionId: string) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return { success: true, subscription };
  } catch (error) {
    console.error('Stripe subscription retrieval error:', error);
    return { success: false, error: error.message };
  }
};

// Create a checkout session
export const createCheckoutSession = async (customerId: string, successUrl: string, cancelUrl: string) => {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: STRIPE_CONFIG.MONTHLY_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      trial_period_days: STRIPE_CONFIG.TRIAL_PERIOD_DAYS,
      metadata: {
        source: 'quietforge_portal'
      }
    });
    
    return { success: true, session };
  } catch (error) {
    console.error('Stripe checkout session creation error:', error);
    return { success: false, error: error.message };
  }
};

// Create a customer portal session
export const createCustomerPortalSession = async (customerId: string, returnUrl: string) => {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    
    return { success: true, session };
  } catch (error) {
    console.error('Stripe customer portal session creation error:', error);
    return { success: false, error: error.message };
  }
};

// Verify webhook signature
export const verifyWebhookSignature = (payload: string, signature: string) => {
  try {
    const event = stripe.webhooks.constructEvent(payload, signature, STRIPE_CONFIG.WEBHOOK_SECRET);
    return { success: true, event };
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return { success: false, error: error.message };
  }
};

// Handle webhook events
export const handleWebhookEvent = async (event: Stripe.Event) => {
  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionCancellation(event.data.object as Stripe.Subscription);
        break;
        
      case 'invoice.payment_succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.Invoice);
        break;
        
      case 'invoice.payment_failed':
        await handlePaymentFailure(event.data.object as Stripe.Invoice);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Webhook event handling error:', error);
    return { success: false, error: error.message };
  }
};

// Handle subscription changes
const handleSubscriptionChange = async (subscription: Stripe.Subscription) => {
  const { portalDatabase } = await import('./portal-database');
  
  try {
    const customerId = subscription.customer as string;
    const client = await portalDatabase.getClientByEmail(customerId); // This would need to be updated to search by stripe_customer_id
    
    if (client) {
      await portalDatabase.updateClientSubscription(client.id!, {
        stripe_customer_id: customerId,
        subscription_status: subscription.status,
        subscription_id: subscription.id,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
      });
    }
  } catch (error) {
    console.error('Subscription change handling error:', error);
  }
};

// Handle subscription cancellation
const handleSubscriptionCancellation = async (subscription: Stripe.Subscription) => {
  const { portalDatabase } = await import('./portal-database');
  
  try {
    const customerId = subscription.customer as string;
    const client = await portalDatabase.getClientByEmail(customerId); // This would need to be updated to search by stripe_customer_id
    
    if (client) {
      await portalDatabase.updateClientSubscription(client.id!, {
        stripe_customer_id: customerId,
        subscription_status: 'canceled',
        subscription_id: subscription.id,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
      });
    }
  } catch (error) {
    console.error('Subscription cancellation handling error:', error);
  }
};

// Handle successful payment
const handlePaymentSuccess = async (invoice: Stripe.Invoice) => {
  const { portalDatabase } = await import('./portal-database');
  
  try {
    const customerId = invoice.customer as string;
    const client = await portalDatabase.getClientByEmail(customerId); // This would need to be updated to search by stripe_customer_id
    
    if (client) {
      // Reset monthly reviews on successful payment
      await portalDatabase.resetMonthlyReviews();
    }
  } catch (error) {
    console.error('Payment success handling error:', error);
  }
};

// Handle failed payment
const handlePaymentFailure = async (invoice: Stripe.Invoice) => {
  const { portalDatabase } = await import('./portal-database');
  
  try {
    const customerId = invoice.customer as string;
    const client = await portalDatabase.getClientByEmail(customerId); // This would need to be updated to search by stripe_customer_id
    
    if (client) {
      await portalDatabase.updateClientSubscription(client.id!, {
        stripe_customer_id: customerId,
        subscription_status: 'past_due',
        subscription_id: client.subscription_id,
        current_period_end: client.current_period_end
      });
    }
  } catch (error) {
    console.error('Payment failure handling error:', error);
  }
};





