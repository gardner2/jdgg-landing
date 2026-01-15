import { query } from './db';
import { generateOpenAIQuote } from './openai-service';

// Generate unique quote token
function generateQuoteToken(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `quote_${timestamp}_${random}`;
}

// Simple quote calculation fallback
function calculateSimpleQuote(projectType: string): number {
  switch (projectType) {
    case 'landing-page':
      return 2500;
    case 'multi-page':
      return 4000;
    case 'ecommerce':
      return 6000;
    case 'web-app':
      return 8000;
    case 'redesign':
      return 2000;
    default:
      return 3000;
  }
}

export const quotesDb = {
  createQuote: async (clientData: {
    email: string;
    name?: string;
    company?: string;
    phone?: string;
    projectType: string;
    scopeFeatures: string[];
    timeline: string;
    budgetRange: string;
    requirements?: string;
  }) => {
    try {
      const quoteToken = generateQuoteToken();
      
      // Try OpenAI first, fallback to simple calculation
      let aiQuote;
      try {
        aiQuote = await generateOpenAIQuote({
          projectType: clientData.projectType,
          scopeFeatures: clientData.scopeFeatures,
          timeline: clientData.timeline,
          budgetRange: clientData.budgetRange,
          requirements: clientData.requirements,
          clientName: clientData.name
        });
      } catch (error: any) {
        console.error('OpenAI failed, using fallback:', error);
        const baseAmount = calculateSimpleQuote(clientData.projectType);
        aiQuote = {
          totalPrice: baseAmount,
          complexity: 'moderate',
          estimatedHours: 40,
          basePrice: baseAmount,
          timeline: '4-6 weeks',
          quoteText: 'Thank you for your project request. We will provide a detailed quote shortly.',
          projectScope: 'Web development project',
          deliverables: ['Responsive website', 'Basic SEO', '3 months support'],
          risks: ['Standard development risks'],
          recommendations: ['Focus on user experience'],
          confidence: 75
        };
      }
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      
      const scopeFeaturesJson = JSON.stringify(clientData.scopeFeatures);
      const aiAnalysisJson = JSON.stringify({
        complexity: aiQuote.complexity,
        estimatedHours: aiQuote.estimatedHours,
        confidence: aiQuote.confidence,
        quoteBreakdown: aiQuote
      });
      
      const rows = await query<{ id: number }>(
        `INSERT INTO quotes (
          client_email, client_name, client_company, client_phone, project_type, scope_features, timeline, budget_range, requirements,
          quote_amount, quote_token, expires_at, ai_analysis, status, admin_notes, final_amount, sent_to_client
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING id`,
        [
          clientData.email,
          clientData.name || null,
          clientData.company || null,
          clientData.phone || null,
          clientData.projectType,
          scopeFeaturesJson,
          clientData.timeline,
          clientData.budgetRange,
          clientData.requirements || null,
          aiQuote.totalPrice,
          quoteToken,
          expiresAt.toISOString(),
          aiAnalysisJson,
          'pending_review',
          null,
          null,
          false
        ]
      );
      
      return {
        success: true,
        quoteId: rows[0].id,
        quoteToken,
        quoteAmount: aiQuote.totalPrice,
        aiAnalysis: aiQuote,
        quoteBreakdown: aiQuote,
        reviewUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/quote/${quoteToken}`
      };
    } catch (error: any) {
      console.error('Quote creation error:', error);
      return { success: false, error: error.message };
    }
  },

  getQuoteByToken: async (token: string) => {
    try {
      const rows = await query(
        'SELECT * FROM quotes WHERE quote_token = $1 LIMIT 1',
        [token]
      );
      return rows[0] || null;
    } catch (error: any) {
      console.error('Error getting quote by token:', error);
      return null;
    }
  },

  getAllQuotes: async (filters?: { status?: string; search?: string }) => {
    try {
      let sql = 'SELECT * FROM quotes WHERE 1=1';
      const params: unknown[] = [];
      let paramIndex = 1;

      if (filters?.status && filters.status !== 'all') {
        sql += ` AND status = $${paramIndex++}`;
        params.push(filters.status);
      }

      if (filters?.search) {
        sql += ` AND (
          LOWER(client_name) LIKE $${paramIndex} OR
          LOWER(client_email) LIKE $${paramIndex} OR
          LOWER(project_type) LIKE $${paramIndex} OR
          LOWER(quote_token) LIKE $${paramIndex}
        )`;
        params.push(`%${filters.search.toLowerCase()}%`);
        paramIndex++;
      }

      sql += ' ORDER BY created_at DESC';
      
      return await query(sql, params);
    } catch (error: any) {
      console.error('Error getting all quotes:', error);
      return [];
    }
  },

  updateAdminNotes: async (token: string, notes: string, finalAmount: number | null) => {
    try {
      await query(
        'UPDATE quotes SET admin_notes = $1, final_amount = $2 WHERE quote_token = $3',
        [notes, finalAmount, token]
      );
      return { success: true };
    } catch (error: any) {
      console.error('Error updating admin notes:', error);
      return { success: false, error: error.message };
    }
  },

  sendToClient: async (token: string) => {
    try {
      await query(
        'UPDATE quotes SET status = $1, sent_to_client = TRUE WHERE quote_token = $2',
        ['sent_to_client', token]
      );
      return { success: true };
    } catch (error: any) {
      console.error('Error sending quote to client:', error);
      return { success: false, error: error.message };
    }
  },

  updateStatus: async (idOrToken: { id?: number; token?: string }, status: string) => {
    try {
      if (idOrToken.id) {
        await query('UPDATE quotes SET status = $1 WHERE id = $2', [status, idOrToken.id]);
      } else if (idOrToken.token) {
        await query('UPDATE quotes SET status = $1 WHERE quote_token = $2', [status, idOrToken.token]);
      }
      return { success: true };
    } catch (error: any) {
      console.error('Error updating status:', error);
      return { success: false, error: error.message };
    }
  },

  deleteQuote: async (idOrToken: { id?: number; token?: string }) => {
    try {
      if (idOrToken.id) {
        await query('DELETE FROM quotes WHERE id = $1', [idOrToken.id]);
      } else if (idOrToken.token) {
        await query('DELETE FROM quotes WHERE quote_token = $1', [idOrToken.token]);
      }
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting quote:', error);
      return { success: false, error: error.message };
    }
  }
};
