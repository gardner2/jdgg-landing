# Admin & Client Portal Setup Guide

This guide will help you set up and use the QuietForge CRM admin panel and client portal.

## Quick Start

### 1. Initialize the Database

Run the setup script to create the database and default admin user:

```bash
npm run setup-db
```

This will:
- Create the `data/crm.db` SQLite database
- Create all necessary tables
- Add a default admin user: `hello@quietforge.studio`

### 2. Start the Development Server

```bash
npm run dev
```

### 3. Access the Admin Panel

1. Navigate to `http://localhost:3000/admin/login`
2. Enter the admin email: `hello@quietforge.studio`
3. In development mode, check your console for the magic link
4. Click the magic link or copy the token to verify

## System Overview

### Admin Panel (`/admin/*`)

**Features:**
- **Dashboard** - Overview of active projects, clients, and contacts
- **Portfolio Management** - Add, edit, delete portfolio items
- **Client Management** - Manage client information and portal access
- **Project Management** - Kanban board for project tracking
- **Contact Submissions** - View and manage contact form submissions
- **Client Requests** - View support requests from clients

**Key Routes:**
- `/admin/login` - Admin login
- `/admin/dashboard` - Main dashboard
- `/admin/portfolio` - Portfolio management
- `/admin/clients` - Client list
- `/admin/clients/[id]` - Client details
- `/admin/projects` - Projects kanban board
- `/admin/projects/[id]` - Project details
- `/admin/contacts` - Contact form submissions
- `/admin/requests` - Client support requests

### Client Portal (`/portal/*`)

**Features:**
- **Dashboard** - Overview of client's projects
- **Projects** - View project details and timeline updates
- **Requests** - Submit support requests (coming soon)

**Key Routes:**
- `/portal/login` - Client login
- `/portal/dashboard` - Client dashboard
- `/portal/projects` - Client's projects
- `/portal/projects/[id]` - Project details

### Public Site

**Updated Features:**
- **Portfolio** - Now displays projects from database (featured only)
- **Contact Form** - Replaces the onboarding form (to be integrated)

## Granting Client Portal Access

1. Go to `/admin/clients`
2. Click on a client or add a new one
3. Check "Portal access enabled"
4. The client can now login at `/portal/login` with their email

## Authentication

Both admin and client authentication use **passwordless magic links**:

1. User enters email
2. System sends magic link via email
3. In development, the link is printed to console
4. Link expires in 15 minutes
5. Session lasts 7 days

### Development Email Setup

In development mode (`NODE_ENV=development`), emails are logged to console instead of sent. Check your terminal for magic links.

### Production Email Setup

To enable real email sending, update `src/lib/email.ts` with:
- **Resend** (recommended)
- **SendGrid**
- **Nodemailer with SMTP**

Example with Resend:

```typescript
// src/lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  if (process.env.NODE_ENV === 'development') {
    console.log('\n📧 EMAIL (Dev):', { to, subject });
    return { success: true };
  }

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || 'hello@quietforge.studio',
    to,
    subject,
    html,
    text,
  });

  if (error) {
    console.error('Email error:', error);
    return { success: false };
  }

  return { success: true };
}
```

## Database Structure

The SQLite database (`data/crm.db`) includes:

- `admin_users` - Admin accounts
- `clients` - Client records
- `projects` - Client projects
- `portfolio_projects` - Public portfolio items
- `contact_submissions` - Contact form submissions
- `project_updates` - Project timeline updates
- `client_requests` - Client support requests
- `magic_links` - Authentication links
- `sessions` - User sessions
- `invoices` - Invoice tracking (future use)

## Common Tasks

### Add a New Admin

```typescript
// In Node.js console or setup script
import { crmDb } from './src/lib/crm-db';

crmDb.createAdminUser('newemail@example.com', 'Admin Name');
```

### Add a Test Client with Portal Access

1. Go to `/admin/clients`
2. Click "Add Client"
3. Fill in details
4. Check "Grant portal access"
5. Create client
6. Client can now login at `/portal/login`

### Add Portfolio Projects

1. Go to `/admin/portfolio`
2. Click "Add Project"
3. Fill in:
   - Title
   - Description
   - Tags (comma-separated)
   - Image URL (optional)
   - Live URL (optional)
   - Featured (shows on homepage if checked)
4. Create project

### Track a New Project

1. Go to `/admin/projects`
2. Click "New Project"
3. Select client, add details
4. Project appears in kanban board
5. Add timeline updates as work progresses
6. Client can view project in their portal

## Next Steps

### Replace Quote Form with Contact Form

The plan includes replacing the `/onboard` form with a simple contact form. To integrate:

1. Update homepage CTAs to use `<ContactForm />` component
2. Remove or redirect old `/onboard` routes
3. Contact submissions appear in `/admin/contacts`

### Production Deployment

Before deploying:

1. ✅ Set up real email service (Resend/SendGrid)
2. ✅ Set environment variables:
   - `NEXT_PUBLIC_BASE_URL` - Your production URL
   - `EMAIL_FROM` - Your sender email
   - `ADMIN_EMAIL` - Your admin notification email
   - Email API keys (e.g., `RESEND_API_KEY`)
3. ✅ Run database setup on production
4. ✅ Secure the `data/` directory (not web-accessible)
5. ✅ Test magic link authentication
6. ✅ Test client portal access
7. ✅ Add at least one real admin user

## Troubleshooting

### Magic links not working

- Check console for emails in development
- Verify token hasn't expired (15 min limit)
- Check database for `magic_links` table entries

### Client can't access portal

- Verify `portal_access` is enabled in `/admin/clients/[id]`
- Check client's email matches exactly
- Test with admin account first

### Database issues

- Delete `data/crm.db` and run `npm run setup-db` again
- Check file permissions on `data/` directory
- Verify `better-sqlite3` is installed

### Session issues

- Sessions expire after 7 days
- Clear cookies and re-login
- Check `sessions` table in database

## Support

For questions or issues:
- Email: hello@quietforge.studio
- Check the plan document: `c:\Users\james\.cursor\plans\admin_&_client_portal_system_6fc41999.plan.md`
