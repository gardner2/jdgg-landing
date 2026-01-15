# Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```bash
# Calendly Integration
NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/your-handle/intro-call

# Analytics
PLAUSIBLE_DOMAIN=jgdd.studio

# Optional: Google Analytics (if you want to add it later)
# NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Optional: Google Search Console verification
# NEXT_PUBLIC_GOOGLE_VERIFICATION=your-google-verification-code
```

## Required Environment Variables

- `NEXT_PUBLIC_CALENDLY_URL`: Your Calendly booking URL
- `PLAUSIBLE_DOMAIN`: Your domain for Plausible Analytics

## Deployment

1. Set these environment variables in your Vercel deployment
2. Replace placeholder portfolio images with real screenshots
3. Update the Calendly URL with your actual booking link
4. Verify pricing conversion logic across different locales
