import crypto from 'crypto';
import { query } from './db';

// Database interfaces
export interface Client {
  id?: number;
  created_at?: string;
  email: string;
  name: string;
  company?: string;
  phone?: string;
  stripe_customer_id?: string;
  subscription_status: 'inactive' | 'active' | 'past_due' | 'canceled';
  subscription_id?: string;
  current_period_end?: string;
  monthly_reviews_used: number;
  monthly_reviews_limit: number;
  last_review_reset?: string;
  project_id?: number;
}

export interface MagicLink {
  id?: number;
  created_at?: string;
  token: string;
  email: string;
  expires_at: string;
  used: boolean;
  used_at?: string;
}

export interface ReviewRequest {
  id?: number;
  created_at?: string;
  client_id: number;
  project_id?: number;
  request_type: 'change' | 'review' | 'support';
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  admin_notes?: string;
  completed_at?: string;
}

export interface Session {
  id?: number;
  created_at?: string;
  token: string;
  client_id: number;
  expires_at: string;
}

// Database functions
export const portalDatabase = {
  // Client management
  createClient: async (client: Omit<Client, 'id' | 'created_at' | 'subscription_status' | 'monthly_reviews_used' | 'monthly_reviews_limit' | 'last_review_reset'>) => {
    try {
      const rows = await query<{ id: number }>(
        `INSERT INTO portal_clients (email, name, company, phone, project_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [client.email, client.name, client.company || null, client.phone || null, client.project_id || null]
      );
      const clientId = rows[0].id;
      return { success: true, id: clientId };
    } catch (error) {
      console.error('Database insert error:', error);
      return { success: false, error: (error as Error).message };
    }
  },

  getClientByEmail: async (email: string): Promise<Client | null> => {
    try {
      const rows = await query<Client>('SELECT * FROM portal_clients WHERE email = $1 LIMIT 1', [email]);
      return rows[0] ?? null;
    } catch (error) {
      console.error('Database select error:', error);
      return null;
    }
  },

  getClientById: async (id: number): Promise<Client | null> => {
    try {
      const rows = await query<Client>('SELECT * FROM portal_clients WHERE id = $1 LIMIT 1', [id]);
      return rows[0] ?? null;
    } catch (error) {
      console.error('Database select error:', error);
      return null;
    }
  },

  updateClientSubscription: async (clientId: number, subscriptionData: {
    stripe_customer_id?: string;
    subscription_status: string;
    subscription_id?: string;
    current_period_end?: string;
  }) => {
    try {
      await query(
        `UPDATE portal_clients 
         SET stripe_customer_id = $1, subscription_status = $2, subscription_id = $3, current_period_end = $4
         WHERE id = $5`,
        [
          subscriptionData.stripe_customer_id || null,
          subscriptionData.subscription_status,
          subscriptionData.subscription_id || null,
          subscriptionData.current_period_end || null,
          clientId
        ]
      );
      return { success: true };
    } catch (error) {
      console.error('Database update error:', error);
      return { success: false, error: (error as Error).message };
    }
  },

  // Magic link management
  createMagicLink: async (email: string): Promise<{ success: boolean; token?: string; error?: string }> => {
    try {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await query(
        `INSERT INTO portal_magic_links (token, email, expires_at)
         VALUES ($1, $2, $3)`,
        [token, email, expiresAt.toISOString()]
      );
      return { success: true, token };
    } catch (error) {
      console.error('Magic link creation error:', error);
      return { success: false, error: (error as Error).message };
    }
  },

  validateMagicLink: async (token: string): Promise<{ success: boolean; email?: string; error?: string }> => {
    try {
      const rows = await query<MagicLink>(
        'SELECT * FROM portal_magic_links WHERE token = $1 AND expires_at > NOW() AND used = FALSE LIMIT 1',
        [token]
      );
      const row = rows[0];
      if (!row) {
        return { success: false, error: 'Invalid or expired magic link' };
      }
      return { success: true, email: row.email };
    } catch (error) {
      console.error('Magic link validation error:', error);
      return { success: false, error: (error as Error).message };
    }
  },

  useMagicLink: async (token: string) => {
    try {
      await query(
        'UPDATE portal_magic_links SET used = TRUE, used_at = NOW() WHERE token = $1',
        [token]
      );
      return { success: true };
    } catch (error) {
      console.error('Magic link usage error:', error);
      return { success: false, error: (error as Error).message };
    }
  },

  // Session management
  createSession: async (clientId: number): Promise<{ success: boolean; token?: string; error?: string }> => {
    try {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      await query(
        `INSERT INTO portal_sessions (token, client_id, expires_at)
         VALUES ($1, $2, $3)`,
        [token, clientId, expiresAt.toISOString()]
      );
      return { success: true, token };
    } catch (error) {
      console.error('Session creation error:', error);
      return { success: false, error: (error as Error).message };
    }
  },

  validateSession: async (token: string): Promise<{ success: boolean; client?: Client; error?: string }> => {
    try {
      const rows = await query<any>(
        `SELECT s.*, c.*
         FROM portal_sessions s
         JOIN portal_clients c ON s.client_id = c.id
         WHERE s.token = $1 AND s.expires_at > NOW()
         LIMIT 1`,
        [token]
      );
      const row = rows[0];
      if (!row) {
        return { success: false, error: 'Invalid or expired session' };
      }
      
      const client: Client = {
        id: row.client_id,
        created_at: row.created_at,
        email: row.email,
        name: row.name,
        company: row.company,
        phone: row.phone,
        stripe_customer_id: row.stripe_customer_id,
        subscription_status: row.subscription_status,
        subscription_id: row.subscription_id,
        current_period_end: row.current_period_end,
        monthly_reviews_used: row.monthly_reviews_used,
        monthly_reviews_limit: row.monthly_reviews_limit,
        last_review_reset: row.last_review_reset,
        project_id: row.project_id
      };
      
      return { success: true, client };
    } catch (error) {
      console.error('Session validation error:', error);
      return { success: false, error: (error as Error).message };
    }
  },

  deleteSession: async (token: string) => {
    try {
      await query('DELETE FROM portal_sessions WHERE token = $1', [token]);
      return { success: true };
    } catch (error) {
      console.error('Session deletion error:', error);
      return { success: false, error: (error as Error).message };
    }
  },

  // Review request management
  createReviewRequest: async (request: Omit<ReviewRequest, 'id' | 'created_at' | 'status' | 'admin_notes' | 'completed_at'>) => {
    try {
      const rows = await query<{ id: number }>(
        `INSERT INTO portal_review_requests (client_id, project_id, request_type, title, description, priority)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [
          request.client_id,
          request.project_id || null,
          request.request_type,
          request.title,
          request.description,
          request.priority
        ]
      );
      return { success: true, id: rows[0].id };
    } catch (error) {
      console.error('Review request creation error:', error);
      return { success: false, error: (error as Error).message };
    }
  },

  getReviewRequestsByClient: async (clientId: number): Promise<ReviewRequest[]> => {
    try {
      return await query<ReviewRequest>(
        'SELECT * FROM portal_review_requests WHERE client_id = $1 ORDER BY created_at DESC',
        [clientId]
      );
    } catch (error) {
      console.error('Review requests fetch error:', error);
      return [];
    }
  },

  updateReviewRequestStatus: async (requestId: number, status: string, adminNotes?: string) => {
    try {
      const completedAt = status === 'completed' ? new Date().toISOString() : null;
      await query(
        `UPDATE portal_review_requests
         SET status = $1, admin_notes = $2, completed_at = $3
         WHERE id = $4`,
        [status, adminNotes || null, completedAt, requestId]
      );
      return { success: true };
    } catch (error) {
      console.error('Review request update error:', error);
      return { success: false, error: (error as Error).message };
    }
  },

  // Monthly review management
  canMakeReviewRequest: async (clientId: number): Promise<{ success: boolean; canMake: boolean; error?: string }> => {
    try {
      const client = await portalDatabase.getClientById(clientId);
      if (!client) {
        return { success: false, canMake: false, error: 'Client not found' };
      }

      // Check if subscription is active
      if (client.subscription_status !== 'active') {
        return { success: true, canMake: false };
      }

      // Check monthly limit
      if (client.monthly_reviews_used >= client.monthly_reviews_limit) {
        return { success: true, canMake: false };
      }

      return { success: true, canMake: true };
    } catch (error) {
      console.error('Review request check error:', error);
      return { success: false, canMake: false, error: (error as Error).message };
    }
  },

  incrementReviewsUsed: async (clientId: number) => {
    try {
      await query(
        'UPDATE portal_clients SET monthly_reviews_used = monthly_reviews_used + 1 WHERE id = $1',
        [clientId]
      );
      return { success: true };
    } catch (error) {
      console.error('Increment reviews error:', error);
      return { success: false, error: (error as Error).message };
    }
  },

  resetMonthlyReviews: async () => {
    try {
      await query(
        `UPDATE portal_clients
         SET monthly_reviews_used = 0, last_review_reset = NOW()
         WHERE last_review_reset < NOW() - INTERVAL '1 month'`
      );
      return { success: true };
    } catch (error) {
      console.error('Reset reviews error:', error);
      return { success: false, error: (error as Error).message };
    }
  },

  // Close database connection (no-op for serverless pool)
  close: () => {
    return;
  }
};

// No process shutdown hooks needed for serverless pool.
