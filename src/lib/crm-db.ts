import crypto from 'crypto';
import { query } from './db';

type RunResult = { lastInsertRowid: number };
type UpdateResult = { changes: number };

export const crmDb = {
  // Admin Users
  createAdminUser: async (email: string, name: string, passwordHash?: string): Promise<RunResult> => {
    const rows = await query<{ id: number }>(
      'INSERT INTO admin_users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING id',
      [email, name, passwordHash ?? null]
    );
    return { lastInsertRowid: rows[0].id };
  },

  getAdminByEmail: async (email: string) => {
    const rows = await query('SELECT * FROM admin_users WHERE email = $1 LIMIT 1', [email]);
    return rows[0] ?? null;
  },

  // Portfolio Projects
  getAllPortfolioProjects: async () => {
    return query('SELECT * FROM portfolio_projects ORDER BY display_order, created_at DESC');
  },

  getFeaturedPortfolioProjects: async () => {
    return query('SELECT * FROM portfolio_projects WHERE featured = TRUE ORDER BY display_order');
  },

  getPortfolioProject: async (id: number) => {
    const rows = await query('SELECT * FROM portfolio_projects WHERE id = $1 LIMIT 1', [id]);
    return rows[0] ?? null;
  },

  createPortfolioProject: async (data: {
    title: string;
    description: string;
    tags: string;
    image_url?: string;
    live_url?: string;
    featured?: boolean;
  }): Promise<RunResult> => {
    const rows = await query<{ id: number }>(
      `INSERT INTO portfolio_projects (title, description, tags, image_url, live_url, featured)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        data.title,
        data.description,
        data.tags,
        data.image_url || null,
        data.live_url || null,
        data.featured ? true : false
      ]
    );
    return { lastInsertRowid: rows[0].id };
  },

  updatePortfolioProject: async (id: number, data: {
    title?: string;
    description?: string;
    tags?: string;
    image_url?: string | null;
    live_url?: string | null;
    featured?: boolean;
  }): Promise<UpdateResult> => {
    const fields: string[] = [];
    const values: Array<string | boolean | number | null> = [];
    let index = 1;

    if (data.title !== undefined) { fields.push(`title = $${index++}`); values.push(data.title); }
    if (data.description !== undefined) { fields.push(`description = $${index++}`); values.push(data.description); }
    if (data.tags !== undefined) { fields.push(`tags = $${index++}`); values.push(data.tags); }
    if (data.image_url !== undefined) { fields.push(`image_url = $${index++}`); values.push(data.image_url || null); }
    if (data.live_url !== undefined) { fields.push(`live_url = $${index++}`); values.push(data.live_url || null); }
    if (data.featured !== undefined) { fields.push(`featured = $${index++}`); values.push(data.featured); }

    if (fields.length === 0) {
      return { changes: 0 };
    }

    fields.push('updated_at = NOW()');
    values.push(id);

    await query(
      `UPDATE portfolio_projects SET ${fields.join(', ')} WHERE id = $${index}`,
      values
    );
    return { changes: 1 };
  },

  deletePortfolioProject: async (id: number): Promise<UpdateResult> => {
    await query('DELETE FROM portfolio_projects WHERE id = $1', [id]);
    return { changes: 1 };
  },

  // Clients
  getAllClients: async () => {
    return query('SELECT * FROM clients ORDER BY created_at DESC');
  },

  getClient: async (id: number) => {
    const rows = await query('SELECT * FROM clients WHERE id = $1 LIMIT 1', [id]);
    return rows[0] ?? null;
  },

  getClientByEmail: async (email: string) => {
    const rows = await query('SELECT * FROM clients WHERE email = $1 LIMIT 1', [email]);
    return rows[0] ?? null;
  },

  createClient: async (data: {
    email: string;
    name: string;
    company?: string;
    phone?: string;
    portal_access?: boolean;
  }): Promise<RunResult> => {
    const rows = await query<{ id: number }>(
      `INSERT INTO clients (email, name, company, phone, portal_access)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        data.email,
        data.name,
        data.company || null,
        data.phone || null,
        data.portal_access || false
      ]
    );
    return { lastInsertRowid: rows[0].id };
  },

  updateClient: async (id: number, data: {
    name?: string;
    company?: string;
    phone?: string;
    status?: string;
    portal_access?: boolean;
    notes?: string;
  }): Promise<UpdateResult> => {
    const fields: string[] = [];
    const values: Array<string | boolean | number | null> = [];
    let index = 1;

    if (data.name !== undefined) { fields.push(`name = $${index++}`); values.push(data.name); }
    if (data.company !== undefined) { fields.push(`company = $${index++}`); values.push(data.company); }
    if (data.phone !== undefined) { fields.push(`phone = $${index++}`); values.push(data.phone); }
    if (data.status !== undefined) { fields.push(`status = $${index++}`); values.push(data.status); }
    if (data.portal_access !== undefined) { fields.push(`portal_access = $${index++}`); values.push(data.portal_access); }
    if (data.notes !== undefined) { fields.push(`notes = $${index++}`); values.push(data.notes); }

    fields.push('updated_at = NOW()');
    values.push(id.toString());

    await query(`UPDATE clients SET ${fields.join(', ')} WHERE id = $${index}`, values);
    return { changes: 1 };
  },

  // Projects
  getAllProjects: async () => {
    return query(`
      SELECT p.*, c.name as client_name, c.email as client_email, c.company as client_company
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      ORDER BY p.created_at DESC
    `);
  },

  getProjectsByClient: async (clientId: number) => {
    return query('SELECT * FROM projects WHERE client_id = $1 ORDER BY created_at DESC', [clientId]);
  },

  getProject: async (id: number) => {
    const rows = await query(`
      SELECT p.*, c.name as client_name, c.email as client_email, c.company as client_company
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      WHERE p.id = $1
      LIMIT 1
    `, [id]);
    return rows[0] ?? null;
  },

  createProject: async (data: {
    client_id: number;
    title: string;
    type?: string;
    status?: string;
    budget?: number;
    timeline?: string;
    description?: string;
  }): Promise<RunResult> => {
    const rows = await query<{ id: number }>(
      `INSERT INTO projects (client_id, title, type, status, budget, timeline, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        data.client_id,
        data.title,
        data.type || null,
        data.status || 'quoted',
        data.budget ?? null,
        data.timeline || null,
        data.description || null
      ]
    );
    return { lastInsertRowid: rows[0].id };
  },

  updateProject: async (id: number, data: {
    title?: string;
    type?: string;
    status?: string;
    budget?: number;
    timeline?: string;
    description?: string;
    started_at?: string;
    completed_at?: string;
  }): Promise<UpdateResult> => {
    const fields: string[] = [];
    const values: Array<string | number | null> = [];
    let index = 1;

    if (data.title !== undefined) { fields.push(`title = $${index++}`); values.push(data.title); }
    if (data.type !== undefined) { fields.push(`type = $${index++}`); values.push(data.type); }
    if (data.status !== undefined) { fields.push(`status = $${index++}`); values.push(data.status); }
    if (data.budget !== undefined) { fields.push(`budget = $${index++}`); values.push(data.budget ?? null); }
    if (data.timeline !== undefined) { fields.push(`timeline = $${index++}`); values.push(data.timeline); }
    if (data.description !== undefined) { fields.push(`description = $${index++}`); values.push(data.description); }
    if (data.started_at !== undefined) { fields.push(`started_at = $${index++}`); values.push(data.started_at); }
    if (data.completed_at !== undefined) { fields.push(`completed_at = $${index++}`); values.push(data.completed_at); }

    fields.push('updated_at = NOW()');
    values.push(id);

    await query(`UPDATE projects SET ${fields.join(', ')} WHERE id = $${index}`, values);
    return { changes: 1 };
  },

  // Contact Submissions
  getAllContactSubmissions: async () => {
    return query('SELECT * FROM contact_submissions ORDER BY created_at DESC');
  },

  getContactSubmission: async (id: number) => {
    const rows = await query('SELECT * FROM contact_submissions WHERE id = $1 LIMIT 1', [id]);
    return rows[0] ?? null;
  },

  createContactSubmission: async (data: {
    name: string;
    email: string;
    company?: string;
    phone?: string;
    message: string;
  }): Promise<RunResult> => {
    const rows = await query<{ id: number }>(
      `INSERT INTO contact_submissions (name, email, company, phone, message)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        data.name,
        data.email,
        data.company || null,
        data.phone || null,
        data.message
      ]
    );
    return { lastInsertRowid: rows[0].id };
  },

  updateContactSubmission: async (id: number, data: {
    status?: string;
    admin_notes?: string;
    converted_to_client_id?: number;
  }): Promise<UpdateResult> => {
    const fields: string[] = [];
    const values: Array<string | number | null> = [];
    let index = 1;

    if (data.status !== undefined) { fields.push(`status = $${index++}`); values.push(data.status); }
    if (data.admin_notes !== undefined) { fields.push(`admin_notes = $${index++}`); values.push(data.admin_notes); }
    if (data.converted_to_client_id !== undefined) { fields.push(`converted_to_client_id = $${index++}`); values.push(data.converted_to_client_id); }

    values.push(id);
    await query(`UPDATE contact_submissions SET ${fields.join(', ')} WHERE id = $${index}`, values);
    return { changes: 1 };
  },

  // Magic Links
  createMagicLink: async (email: string, userType: 'admin' | 'client') => {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await query(
      'INSERT INTO magic_links (token, email, user_type, expires_at) VALUES ($1, $2, $3, $4)',
      [token, email, userType, expiresAt]
    );

    return { token, expiresAt };
  },

  getMagicLink: async (token: string) => {
    const rows = await query('SELECT * FROM magic_links WHERE token = $1 AND used = FALSE LIMIT 1', [token]);
    return rows[0] ?? null;
  },

  useMagicLink: async (token: string) => {
    await query('UPDATE magic_links SET used = TRUE, used_at = NOW() WHERE token = $1', [token]);
    return { changes: 1 };
  },

  // Sessions
  createSession: async (email: string, userType: 'admin' | 'client') => {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await query(
      'INSERT INTO sessions (token, email, user_type, expires_at) VALUES ($1, $2, $3, $4)',
      [token, email, userType, expiresAt]
    );

    return { token, expiresAt };
  },

  getSession: async (token: string) => {
    const rows = await query(
      'SELECT * FROM sessions WHERE token = $1 AND expires_at > NOW() LIMIT 1',
      [token]
    );
    return rows[0] ?? null;
  },

  deleteSession: async (token: string) => {
    await query('DELETE FROM sessions WHERE token = $1', [token]);
    return { changes: 1 };
  },

  // Project Updates
  getProjectUpdates: async (projectId: number) => {
    return query(
      'SELECT * FROM project_updates WHERE project_id = $1 ORDER BY created_at DESC',
      [projectId]
    );
  },

  createProjectUpdate: async (data: {
    project_id: number;
    title: string;
    description?: string;
    status?: string;
    created_by?: string;
  }): Promise<RunResult> => {
    const rows = await query<{ id: number }>(
      `INSERT INTO project_updates (project_id, title, description, status, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        data.project_id,
        data.title,
        data.description || null,
        data.status || null,
        data.created_by || null
      ]
    );
    return { lastInsertRowid: rows[0].id };
  },

  // Client Requests
  getAllClientRequests: async () => {
    return query(`
      SELECT r.*, c.name as client_name, c.email as client_email, p.title as project_title
      FROM client_requests r
      LEFT JOIN clients c ON r.client_id = c.id
      LEFT JOIN projects p ON r.project_id = p.id
      ORDER BY r.created_at DESC
    `);
  },

  getClientRequests: async (clientId: number) => {
    return query('SELECT * FROM client_requests WHERE client_id = $1 ORDER BY created_at DESC', [clientId]);
  },

  createClientRequest: async (data: {
    client_id: number;
    project_id?: number;
    type: string;
    title: string;
    description: string;
    priority?: string;
  }): Promise<RunResult> => {
    const rows = await query<{ id: number }>(
      `INSERT INTO client_requests (client_id, project_id, type, title, description, priority)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        data.client_id,
        data.project_id || null,
        data.type,
        data.title,
        data.description,
        data.priority || 'medium'
      ]
    );
    return { lastInsertRowid: rows[0].id };
  },

  updateClientRequest: async (id: number, data: {
    status?: string;
    admin_notes?: string;
    completed_at?: string;
  }): Promise<UpdateResult> => {
    const fields: string[] = [];
    const values: Array<string | number | null> = [];
    let index = 1;

    if (data.status !== undefined) { fields.push(`status = $${index++}`); values.push(data.status); }
    if (data.admin_notes !== undefined) { fields.push(`admin_notes = $${index++}`); values.push(data.admin_notes); }
    if (data.completed_at !== undefined) { fields.push(`completed_at = $${index++}`); values.push(data.completed_at); }

    values.push(id.toString());
    await query(`UPDATE client_requests SET ${fields.join(', ')} WHERE id = $${index}`, values);
    return { changes: 1 };
  },

  // Stats for dashboard
  getStats: async () => {
    const [activeProjects] = await query<{ count: number }>(
      "SELECT COUNT(*)::int as count FROM projects WHERE status IN ('active', 'in_progress')"
    );
    const [totalClients] = await query<{ count: number }>(
      "SELECT COUNT(*)::int as count FROM clients WHERE status = 'active'"
    );
    const [newContacts] = await query<{ count: number }>(
      "SELECT COUNT(*)::int as count FROM contact_submissions WHERE status = 'new'"
    );
    const [pendingRequests] = await query<{ count: number }>(
      "SELECT COUNT(*)::int as count FROM client_requests WHERE status = 'pending'"
    );

    return {
      activeProjects: activeProjects?.count ?? 0,
      totalClients: totalClients?.count ?? 0,
      newContacts: newContacts?.count ?? 0,
      pendingRequests: pendingRequests?.count ?? 0
    };
  },

  // Blog Posts
  getAllBlogPosts: async (publishedOnly: boolean = false) => {
    if (publishedOnly) {
      return query(`
        SELECT * FROM blog_posts 
        WHERE published = TRUE AND (published_at IS NULL OR published_at <= NOW())
        ORDER BY published_at DESC, created_at DESC
      `);
    }
    return query('SELECT * FROM blog_posts ORDER BY created_at DESC');
  },

  getBlogPostBySlug: async (slug: string) => {
    const rows = await query(
      'SELECT * FROM blog_posts WHERE slug = $1 AND published = TRUE LIMIT 1',
      [slug]
    );
    return rows[0] ?? null;
  },

  getBlogPost: async (id: number) => {
    const rows = await query('SELECT * FROM blog_posts WHERE id = $1 LIMIT 1', [id]);
    return rows[0] ?? null;
  },

  getRecentBlogPosts: async (limit: number = 3) => {
    return query(`
      SELECT * FROM blog_posts 
      WHERE published = TRUE AND (published_at IS NULL OR published_at <= NOW())
      ORDER BY published_at DESC, created_at DESC
      LIMIT $1
    `, [limit]);
  },

  getBlogPostsByCategory: async (category: string) => {
    return query(`
      SELECT * FROM blog_posts 
      WHERE category = $1 AND published = TRUE AND (published_at IS NULL OR published_at <= NOW())
      ORDER BY published_at DESC, created_at DESC
    `, [category]);
  },

  createBlogPost: async (data: {
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    featured_image?: string;
    author?: string;
    category?: string;
    tags?: string;
    published?: boolean;
    published_at?: string;
    meta_title?: string;
    meta_description?: string;
  }): Promise<RunResult> => {
    const rows = await query<{ id: number }>(
      `INSERT INTO blog_posts (
        title, slug, excerpt, content, featured_image, author, category, tags,
        published, published_at, meta_title, meta_description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id`,
      [
        data.title,
        data.slug,
        data.excerpt || null,
        data.content,
        data.featured_image || null,
        data.author || 'JGDD',
        data.category || null,
        data.tags || null,
        data.published ? true : false,
        data.published_at || null,
        data.meta_title || null,
        data.meta_description || null
      ]
    );
    return { lastInsertRowid: rows[0].id };
  },

  updateBlogPost: async (id: number, data: {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    featured_image?: string | null;
    author?: string;
    category?: string;
    tags?: string;
    published?: boolean;
    published_at?: string | null;
    meta_title?: string;
    meta_description?: string;
  }): Promise<UpdateResult> => {
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(data.title);
    }
    if (data.slug !== undefined) {
      updates.push(`slug = $${paramIndex++}`);
      values.push(data.slug);
    }
    if (data.excerpt !== undefined) {
      updates.push(`excerpt = $${paramIndex++}`);
      values.push(data.excerpt);
    }
    if (data.content !== undefined) {
      updates.push(`content = $${paramIndex++}`);
      values.push(data.content);
    }
    if (data.featured_image !== undefined) {
      updates.push(`featured_image = $${paramIndex++}`);
      values.push(data.featured_image);
    }
    if (data.author !== undefined) {
      updates.push(`author = $${paramIndex++}`);
      values.push(data.author);
    }
    if (data.category !== undefined) {
      updates.push(`category = $${paramIndex++}`);
      values.push(data.category);
    }
    if (data.tags !== undefined) {
      updates.push(`tags = $${paramIndex++}`);
      values.push(data.tags);
    }
    if (data.published !== undefined) {
      updates.push(`published = $${paramIndex++}`);
      values.push(data.published);
    }
    if (data.published_at !== undefined) {
      updates.push(`published_at = $${paramIndex++}`);
      values.push(data.published_at);
    }
    if (data.meta_title !== undefined) {
      updates.push(`meta_title = $${paramIndex++}`);
      values.push(data.meta_title);
    }
    if (data.meta_description !== undefined) {
      updates.push(`meta_description = $${paramIndex++}`);
      values.push(data.meta_description);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    await query(
      `UPDATE blog_posts SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      values
    );
    return { changes: 1 };
  },

  deleteBlogPost: async (id: number): Promise<UpdateResult> => {
    await query('DELETE FROM blog_posts WHERE id = $1', [id]);
    return { changes: 1 };
  }
};

export default crmDb;
