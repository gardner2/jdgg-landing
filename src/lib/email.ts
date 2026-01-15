// Email service for sending magic links and notifications
import { Resend } from 'resend';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'hello@quietforge.studio';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

// Simple email function - configure with your SMTP or use Resend API
export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const forceProduction = process.env.FORCE_EMAIL_SEND === 'true';
  
  // Log email attempt
  console.log('\n📧 EMAIL SEND ATTEMPT:');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('To:', to);
  console.log('Subject:', subject);
  console.log('RESEND_API_KEY set:', !!RESEND_API_KEY);
  console.log('FROM_EMAIL:', FROM_EMAIL);
  
  // For development, log the email (unless forced to send)
  if (isDevelopment && !forceProduction) {
    console.log('\n⚠️  DEVELOPMENT MODE - Email logged to console only');
    console.log('To send real emails in development, set FORCE_EMAIL_SEND=true');
    console.log('\n📧 EMAIL CONTENT:');
    console.log('---');
    if (text) {
      console.log(text);
    } else {
      // Extract text from HTML for better readability
      const textContent = html.replace(/<[^>]*>/g, '').replace(/\n\s*\n/g, '\n');
      console.log(textContent);
    }
    console.log('---\n');
    return { success: true, error: null, devMode: true };
  }

  if (!resend) {
    const error = 'RESEND_API_KEY is not set. Email not sent.';
    console.error('❌', error);
    console.error('Please set RESEND_API_KEY in your environment variables.');
    return { success: false, error };
  }

  try {
    console.log('Sending email via Resend...');
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text,
    });
    
    console.log('✅ Email sent successfully!');
    console.log('Resend response:', JSON.stringify(result, null, 2));
    return { success: true, error: null, data: result };
  } catch (error: any) {
    const errorMessage = error?.message || 'Failed to send email';
    console.error('❌ Email send error:', errorMessage);
    console.error('Full error:', error);
    
    // Provide helpful error messages
    if (errorMessage.includes('domain') || errorMessage.includes('verify')) {
      console.error('💡 TIP: Make sure your FROM_EMAIL domain is verified in Resend dashboard');
    }
    if (errorMessage.includes('API key') || errorMessage.includes('unauthorized')) {
      console.error('💡 TIP: Check that your RESEND_API_KEY is correct');
    }
    
    return { success: false, error: errorMessage };
  }
}

// Send magic link for admin login
export async function sendAdminMagicLink(email: string, token: string) {
  const magicLink = `${BASE_URL}/admin/auth/verify?token=${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #000; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .button { display: inline-block; padding: 16px 32px; background: #000; color: #fff; text-decoration: none; border-radius: 50px; font-weight: 600; margin: 20px 0; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Login to JGDD Admin</h1>
          <p>Click the button below to securely login to your admin dashboard:</p>
          <a href="${magicLink}" class="button">Login to Admin Dashboard</a>
          <p>This link will expire in 15 minutes.</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <div class="footer">
            <p>JGDD<br>hello@quietforge.studio</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Login to JGDD Admin

Click the link below to securely login to your admin dashboard:
${magicLink}

This link will expire in 15 minutes.

If you didn't request this, you can safely ignore this email.

JGDD
hello@quietforge.studio
  `;

  return sendEmail({
    to: email,
    subject: 'Login to JGDD Admin',
    html,
    text
  });
}

// Send magic link for client portal login
export async function sendClientMagicLink(email: string, token: string, clientName?: string) {
  const magicLink = `${BASE_URL}/portal/auth/verify?token=${token}`;
  
  const greeting = clientName ? `Hi ${clientName}` : 'Hello';
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #000; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .button { display: inline-block; padding: 16px 32px; background: #000; color: #fff; text-decoration: none; border-radius: 50px; font-weight: 600; margin: 20px 0; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${greeting},</h1>
          <p>Click the button below to access your JGDD client portal:</p>
          <a href="${magicLink}" class="button">Access Your Portal</a>
          <p>This link will expire in 15 minutes.</p>
          <p>If you didn't request this, please contact us at hello@quietforge.studio</p>
          <div class="footer">
            <p>JGDD<br>hello@quietforge.studio</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
${greeting},

Click the link below to access your JGDD client portal:
${magicLink}

This link will expire in 15 minutes.

If you didn't request this, please contact us at hello@quietforge.studio

JGDD
hello@quietforge.studio
  `;

  return sendEmail({
    to: email,
    subject: 'Access Your JGDD Portal',
    html,
    text
  });
}

// Send contact form notification to admin
export async function sendContactNotification(data: {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL || 'hello@quietforge.studio';
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #000; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .details { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .label { font-weight: 600; display: block; margin-top: 10px; }
          .button { display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 50px; font-weight: 600; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>New Contact Form Submission</h1>
          <div class="details">
            <span class="label">Name:</span> ${data.name}
            <span class="label">Email:</span> ${data.email}
            ${data.company ? `<span class="label">Company:</span> ${data.company}` : ''}
            ${data.phone ? `<span class="label">Phone:</span> ${data.phone}` : ''}
            <span class="label">Message:</span>
            <p>${data.message}</p>
          </div>
          <a href="${BASE_URL}/admin/contacts" class="button">View in Admin Dashboard</a>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `New Contact: ${data.name}`,
    html
  });
}

// Send contact form auto-response
export async function sendContactConfirmation(email: string, name: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #000; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Thanks for reaching out!</h1>
          <p>Hi ${name},</p>
          <p>We received your message and will get back to you within 24 hours.</p>
          <p>In the meantime, feel free to book a free 30-minute consultation at <a href="https://calendly.com/jgdd/30min">calendly.com/jgdd/30min</a></p>
          <div class="footer">
            <p>JGDD<br>hello@quietforge.studio</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Thanks for reaching out!

Hi ${name},

We received your message and will get back to you within 24 hours.

In the meantime, feel free to book a free 30-minute consultation at calendly.com/jgdd/30min

JGDD
hello@quietforge.studio
  `;

  return sendEmail({
    to: email,
    subject: 'We received your message!',
    html,
    text
  });
}

// Send project update notification to client
export async function sendProjectUpdateNotification(
  clientEmail: string,
  clientName: string,
  projectTitle: string,
  updateTitle: string,
  updateDescription?: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #000; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .update { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 50px; font-weight: 600; margin: 20px 0; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Project Update: ${projectTitle}</h1>
          <p>Hi ${clientName},</p>
          <div class="update">
            <h2>${updateTitle}</h2>
            ${updateDescription ? `<p>${updateDescription}</p>` : ''}
          </div>
          <a href="${BASE_URL}/portal" class="button">View in Portal</a>
          <div class="footer">
            <p>JGDD<br>hello@quietforge.studio</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: clientEmail,
    subject: `Project Update: ${projectTitle}`,
    html
  });
}
