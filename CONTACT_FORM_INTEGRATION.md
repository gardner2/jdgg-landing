# Contact Form Integration Guide

The contact form component is ready to replace the old quote form. Here's how to integrate it:

## Option 1: Replace Homepage CTAs (Recommended)

Update `src/app/page.tsx` to use the contact form instead of Calendly links where appropriate.

### Import the component:
```typescript
import { ContactForm } from '@/components/contact-form';
```

### Option A: Keep Calendly as Primary, Add Contact Form as Secondary

The current setup with Calendly is great for immediate bookings. You can add the contact form as an alternative:

```typescript
// In the contact section (around line 250+)
<div className="flex flex-col sm:flex-row gap-4 justify-center">
  <a 
    href="https://calendly.com/jgdd/30min" 
    target="_blank"
    rel="noopener noreferrer"
    className="modern-button bg-foreground text-background px-8 py-4 rounded-full text-lg font-medium hover:bg-foreground/90 transition-all duration-300"
  >
    Book a Free 30-minute Consultation
  </a>
  <ContactForm 
    trigger={
      <button className="modern-button bg-transparent border-2 border-foreground text-foreground px-8 py-4 rounded-full text-lg font-medium hover:bg-foreground/10 transition-all duration-300">
        Send a Message
      </button>
    }
  />
</div>
```

### Option B: Replace Calendly with Contact Form

If you prefer contact form submissions over Calendly:

```typescript
// Replace any Calendly link with:
<ContactForm 
  trigger={
    <button className="modern-button bg-foreground text-background px-8 py-4 rounded-full text-lg font-medium hover:bg-foreground/90 transition-all duration-300">
      Get in Touch
    </button>
  }
/>
```

## Option 2: Create a Dedicated Contact Page

Create `src/app/contact/page.tsx`:

```typescript
import { ContactForm } from '@/components/contact-form';

export default function ContactPage() {
  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-xl text-muted-foreground">
            Have a project in mind? We'd love to hear from you.
          </p>
        </div>
        
        <div className="modern-card border border-border rounded-3xl p-8">
          <ContactForm defaultOpen={true} />
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Prefer to book a call directly?
          </p>
          <a 
            href="https://calendly.com/jgdd/30min" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-foreground underline hover:text-foreground/80"
          >
            Book a free 30-minute consultation →
          </a>
        </div>
      </div>
    </div>
  );
}
```

Then update navigation in `src/app/page.tsx`:

```typescript
// In the header navigation (around line 50)
<a href="#contact" className="hover:text-foreground/80 transition-colors">Contact</a>

// Or link to the dedicated page:
<Link href="/contact" className="hover:text-foreground/80 transition-colors">Contact</Link>
```

## Option 3: Add to Footer (Best for Both Approaches)

Keep Calendly for primary CTAs, but add the contact form in the footer:

```typescript
// In the footer section (around line 350+)
<div className="grid md:grid-cols-2 gap-8 items-start">
  <div>
    <h3 className="text-xl font-semibold mb-4">Quick Contact</h3>
    <p className="text-muted-foreground mb-4">
      Send us a message and we'll get back to you within 24 hours.
    </p>
    <ContactForm 
      trigger={
        <button className="modern-button bg-foreground text-background px-6 py-3 rounded-full font-medium">
          Send Message
        </button>
      }
    />
  </div>
  
  <div>
    <h3 className="text-xl font-semibold mb-4">Book a Call</h3>
    <p className="text-muted-foreground mb-4">
      Prefer to chat? Book a free 30-minute consultation.
    </p>
    <a 
      href="https://calendly.com/jgdd/30min" 
      target="_blank"
      rel="noopener noreferrer"
      className="modern-button bg-foreground text-background px-6 py-3 rounded-full font-medium inline-block"
    >
      Book Now
    </a>
  </div>
</div>
```

## Managing Submissions

All contact form submissions are accessible in the admin panel:

1. Visit `/admin/contacts`
2. View all submissions with status tracking
3. Filter by status (new, contacted, converted, rejected)
4. Add admin notes
5. Send email replies directly
6. Convert to client + project when ready

## Recommended Approach

**For a new agency, I recommend:**

1. **Keep Calendly as primary CTA** - Immediate bookings are valuable
2. **Add contact form in footer** - Alternative for those who prefer messaging
3. **Eventually add `/contact` page** - For SEO and additional touchpoint

This gives visitors options while prioritizing direct engagement through calls.

## Converting Contact Submissions to Clients

From `/admin/contacts`:

1. Open a contact submission
2. Update status to "contacted" after reaching out
3. Go to `/admin/clients` and manually create the client
4. Return to contact and update status to "converted"
5. Create a project for the client in `/admin/projects`

**Future enhancement**: Add a "Convert to Client" button that does this automatically.

## Email Notifications

The contact form automatically:
- Sends notification to admin (`ADMIN_EMAIL` env var or `hello@quietforge.studio`)
- Sends confirmation to submitter
- In development, both are logged to console
- In production, requires email service setup (see `SETUP.md`)

## Styling

The contact form component:
- Matches your existing design system
- Uses the same `modern-card` and button styles
- Opens in a modal dialog
- Fully responsive
- Includes success state

No additional styling needed!
