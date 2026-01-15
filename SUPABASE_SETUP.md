# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - Name: `quietforge-landing`
   - Database Password: (generate a strong password)
   - Region: Choose closest to your users
6. Click "Create new project"

## 2. Get Your Project Credentials

1. Go to Settings > API
2. Copy the following values:
   - Project URL
   - Anon public key

## 3. Create Environment Variables

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. Create Database Table

Run this SQL in the Supabase SQL Editor:

```sql
-- Create project_submissions table
CREATE TABLE project_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  project_type TEXT NOT NULL,
  scope JSONB NOT NULL,
  timeline JSONB NOT NULL,
  budget JSONB NOT NULL,
  client JSONB NOT NULL,
  requirements TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'quoted', 'accepted', 'rejected'))
);

-- Enable Row Level Security
ALTER TABLE project_submissions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts (form submissions)
CREATE POLICY "Allow form submissions" ON project_submissions
  FOR INSERT WITH CHECK (true);

-- Create policy to allow reads for authenticated users (admin access)
CREATE POLICY "Allow admin reads" ON project_submissions
  FOR SELECT USING (auth.role() = 'authenticated');
```

## 5. Test the Integration

1. Restart your development server: `npm run dev`
2. Go to `/onboard` and fill out the form
3. Check your Supabase dashboard to see the submitted data

## 6. Admin Access (Optional)

To view submissions in an admin panel, you can:

1. Enable authentication in Supabase
2. Create an admin user
3. Build an admin interface to view submissions

For now, you can view submissions directly in the Supabase dashboard under "Table Editor".





