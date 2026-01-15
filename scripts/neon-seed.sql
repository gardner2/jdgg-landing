-- Seed data for Neon (safe to run multiple times)

-- Admin user
INSERT INTO admin_users (email, name)
VALUES ('jgdesigndevelopment@gmail.com', 'JGDD Admin')
ON CONFLICT (email) DO NOTHING;

-- Sample client
INSERT INTO clients (email, name, company, phone, status, portal_access)
VALUES ('client@example.com', 'Sample Client', 'Sample Co', '', 'active', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Sample project (linked to sample client)
INSERT INTO projects (client_id, title, type, status, budget, timeline, description)
SELECT id, 'Sample Website', 'website', 'active', 12000, '4-6 weeks', 'Initial build and launch.'
FROM clients
WHERE email = 'client@example.com'
ON CONFLICT DO NOTHING;

-- Sample portfolio item
INSERT INTO portfolio_projects (title, description, tags, image_url, live_url, featured, display_order)
VALUES (
  'JGDD Sample Project',
  'A clean, conversion-focused marketing site with clear scope and fast delivery.',
  'Next.js, Tailwind, Performance',
  NULL,
  NULL,
  TRUE,
  1
)
ON CONFLICT DO NOTHING;
