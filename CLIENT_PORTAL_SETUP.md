# 🚀 Client Portal System Setup Guide

## Overview

This system provides a complete client portal with:
- **Magic Link Authentication** - Secure, passwordless login
- **Stripe Subscriptions** - Monthly recurring payments
- **Review Management** - 1 review/change request per month
- **Admin Dashboard** - Manage clients and subscriptions

## 🏗️ System Architecture

### Database Tables
- `clients` - Client information and subscription status
- `magic_links` - Temporary authentication tokens
- `sessions` - Active user sessions
- `review_requests` - Client review/change requests

### API Endpoints
- `/api/auth/magic-link` - Send magic link
- `/api/auth/verify` - Verify magic link and create session
- `/api/auth/me` - Get current user
- `/api/auth/logout` - Logout and delete session
- `/api/portal/review-requests` - Manage review requests

### Pages
- `/auth/login` - Magic link login page
- `/auth/verify` - Magic link verification
- `/portal` - Client portal dashboard

## 🔧 Setup Instructions

### 1. Environment Variables

Create a `.env.local` file with:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
```

### 2. Stripe Setup

1. **Create Stripe Account**: Go to [stripe.com](https://stripe.com)
2. **Create Product**: 
   - Name: "Monthly Care Plan"
   - Price: £99/month (or your preferred amount)
   - Billing: Recurring monthly
3. **Get Price ID**: Copy the price ID (starts with `price_`)
4. **Set Webhook**: 
   - Endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Events: `customer.subscription.*`, `invoice.payment_*`

### 3. Database Setup

The database will be created automatically when you first run the application. The SQLite database will be stored in `data/portal.db`.

### 4. Email Setup (Optional)

For production, you'll need to set up email sending. The system currently logs magic links to console in development mode.

## 🎯 How It Works

### Client Journey

1. **Project Completion**: Client receives magic link to access portal
2. **Portal Access**: Client logs in with magic link
3. **Subscription**: Client subscribes to monthly care plan
4. **Review Requests**: Client can submit 1 review/change request per month
5. **Admin Management**: Admin reviews and responds to requests

### Magic Link Flow

1. Client enters email on `/auth/login`
2. System creates magic link (15-minute expiry)
3. Client clicks link in email
4. System verifies token and creates session
5. Client redirected to `/portal`

### Subscription Flow

1. Client subscribes via Stripe Checkout
2. Stripe webhook updates client status
3. Monthly reviews reset on successful payment
4. Client can submit review requests

## 📊 Admin Features

### Client Management
- View all clients and subscription status
- Manage review requests
- Update request status and add notes
- Track monthly review usage

### Review Request Management
- View pending requests
- Mark as in progress/completed
- Add admin notes
- Set priority levels

## 🔒 Security Features

- **Magic Links**: 15-minute expiry, single-use
- **Sessions**: 30-day expiry, secure cookies
- **CSRF Protection**: Built into Next.js
- **Input Validation**: All inputs validated
- **SQL Injection**: Protected with prepared statements

## 🚀 Deployment

### Vercel Deployment

1. **Set Environment Variables** in Vercel dashboard
2. **Deploy**: `vercel --prod`
3. **Update Stripe Webhook**: Point to production URL

### Database Considerations

- **Development**: SQLite (local file)
- **Production**: Consider PostgreSQL for better performance
- **Backup**: Regular database backups recommended

## 📈 Business Model

### Pricing Structure
- **Monthly Care Plan**: £99/month
- **Includes**: 1 review/change request per month
- **Additional**: Extra requests can be charged separately

### Revenue Streams
1. **Initial Project**: Website development
2. **Monthly Subscriptions**: Ongoing care plan
3. **Additional Requests**: Extra review requests

## 🛠️ Customization

### Review Limits
- Change `monthly_reviews_limit` in database
- Modify pricing in Stripe
- Update UI text in portal

### Features
- Add more request types
- Implement file uploads
- Add project milestones
- Create client communication system

## 📞 Support

### Common Issues

1. **Magic Link Not Working**: Check email delivery and token expiry
2. **Stripe Webhook Failing**: Verify webhook URL and secret
3. **Database Errors**: Check file permissions and disk space

### Monitoring

- **Stripe Dashboard**: Monitor payments and subscriptions
- **Application Logs**: Check for errors and performance
- **Database**: Monitor size and performance

## 🎉 Next Steps

1. **Test the System**: Create test clients and subscriptions
2. **Customize Branding**: Update colors, logos, and copy
3. **Add Features**: Implement additional functionality
4. **Go Live**: Deploy to production and start onboarding clients

---

**Ready to launch your client portal system!** 🚀





