-- QuietForge production schema for Neon (Postgres)

-- Admin users
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio projects
CREATE TABLE IF NOT EXISTS portfolio_projects (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT,
  image_url TEXT,
  live_url TEXT,
  featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CRM clients
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active',
  portal_access BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  title TEXT NOT NULL,
  type TEXT,
  status TEXT DEFAULT 'quoted',
  budget NUMERIC,
  currency TEXT DEFAULT 'GBP',
  timeline TEXT,
  description TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id),
  invoice_number TEXT UNIQUE,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'GBP',
  status TEXT DEFAULT 'draft',
  due_date DATE,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  admin_notes TEXT,
  converted_to_client_id INTEGER REFERENCES clients(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Magic links (admin + client)
CREATE TABLE IF NOT EXISTS magic_links (
  id SERIAL PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  user_type TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions (admin + client)
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  user_type TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project updates
CREATE TABLE IF NOT EXISTS project_updates (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client requests
CREATE TABLE IF NOT EXISTS client_requests (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  project_id INTEGER REFERENCES projects(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  admin_notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portal tables (separate from CRM)
CREATE TABLE IF NOT EXISTS portal_clients (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  stripe_customer_id TEXT,
  subscription_status TEXT DEFAULT 'active',
  subscription_id TEXT,
  current_period_end TIMESTAMPTZ,
  monthly_reviews_used INTEGER DEFAULT 0,
  monthly_reviews_limit INTEGER DEFAULT 1,
  last_review_reset TIMESTAMPTZ DEFAULT NOW(),
  project_id INTEGER
);

CREATE TABLE IF NOT EXISTS portal_magic_links (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  token TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS portal_review_requests (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  client_id INTEGER NOT NULL REFERENCES portal_clients(id),
  project_id INTEGER,
  request_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  admin_notes TEXT,
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS portal_sessions (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  token TEXT UNIQUE NOT NULL,
  client_id INTEGER NOT NULL REFERENCES portal_clients(id),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS portal_project_submissions (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  project_type TEXT NOT NULL,
  scope TEXT NOT NULL,
  timeline TEXT NOT NULL,
  budget TEXT NOT NULL,
  client TEXT NOT NULL,
  requirements TEXT,
  status TEXT DEFAULT 'new'
);

-- Blog posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  author TEXT DEFAULT 'JGDD',
  category TEXT,
  tags TEXT,
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quotes
CREATE TABLE IF NOT EXISTS quotes (
  id SERIAL PRIMARY KEY,
  client_email TEXT NOT NULL,
  client_name TEXT,
  client_company TEXT,
  client_phone TEXT,
  project_type TEXT NOT NULL,
  scope_features TEXT,
  timeline TEXT,
  budget_range TEXT,
  requirements TEXT,
  quote_amount INTEGER NOT NULL,
  quote_token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  ai_analysis TEXT,
  status TEXT DEFAULT 'pending_review',
  admin_notes TEXT,
  final_amount INTEGER,
  sent_to_client BOOLEAN DEFAULT FALSE
);

-- Create index for faster quote queries
CREATE INDEX IF NOT EXISTS idx_quotes_token ON quotes(quote_token);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_email ON quotes(client_email);

-- Create index for faster blog queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published, published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);

-- Seed admin user (update email/name as needed)
INSERT INTO admin_users (email, name)
VALUES ('jgdesigndevelopment@gmail.com', 'JGDD Admin')
ON CONFLICT (email) DO NOTHING;
