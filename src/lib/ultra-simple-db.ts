import Database from 'better-sqlite3';
import path from 'path';
import { generateOpenAIQuote } from './openai-service';

const dbPath = path.join(process.cwd(), 'data', 'ultra-simple.db');
const db = new Database(dbPath);

// Create a very simple table structure with all columns
db.exec(`
  CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    ai_analysis TEXT,
    status TEXT DEFAULT 'pending_review',
    admin_notes TEXT,
    final_amount INTEGER,
    sent_to_client BOOLEAN DEFAULT FALSE
  )
`);

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

export const ultraSimpleDatabase = {
  createQuote: async (clientData: {
    email: string;
    name?: string;
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
      
      // Use direct SQL execution to avoid parameter binding issues
      const scopeFeaturesJson = JSON.stringify(clientData.scopeFeatures);
      const aiAnalysisJson = JSON.stringify({
        complexity: aiQuote.complexity,
        estimatedHours: aiQuote.estimatedHours,
        confidence: aiQuote.confidence,
        quoteBreakdown: aiQuote
      });
      
      // Helper function to safely escape strings
      const escapeString = (str: any): string => {
        if (typeof str !== 'string') {
          return String(str || '');
        }
        return str.replace(/'/g, "''");
      };
      
      const sql = `
        INSERT INTO quotes (
          client_email, client_name, client_company, client_phone, project_type, scope_features, timeline, budget_range, requirements,
          quote_amount, quote_token, expires_at, ai_analysis, status, admin_notes, final_amount, sent_to_client
        ) VALUES (
          '${escapeString(clientData.email)}',
          ${clientData.name ? `'${escapeString(clientData.name)}'` : 'NULL'},
          ${clientData.company ? `'${escapeString(clientData.company)}'` : 'NULL'},
          ${clientData.phone ? `'${escapeString(clientData.phone)}'` : 'NULL'},
          '${escapeString(clientData.projectType)}',
          '${escapeString(scopeFeaturesJson)}',
          '${escapeString(clientData.timeline)}',
          '${escapeString(clientData.budgetRange)}',
          ${clientData.requirements ? `'${escapeString(clientData.requirements)}'` : 'NULL'},
          ${aiQuote.totalPrice},
          '${quoteToken}',
          '${expiresAt.toISOString()}',
          '${escapeString(aiAnalysisJson)}',
          'pending_review',
          NULL,
          NULL,
          FALSE
        )
      `;
      
      db.exec(sql);
      
      // Get the last inserted ID
      const lastId = db.prepare('SELECT last_insert_rowid() as id').get();
      
      return {
        success: true,
        quoteId: lastId.id,
        quoteToken,
        quoteAmount: aiQuote.totalPrice,
        aiAnalysis: aiQuote.analysis,
        quoteBreakdown: aiQuote,
        reviewUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/quote/${quoteToken}`
      };
    } catch (error: any) {
      console.error('Quote creation error:', error);
      return { success: false, error: error.message };
    }
  },

  getQuoteByToken: (token: string) => {
    try {
      return db.prepare('SELECT * FROM quotes WHERE quote_token = ?').get(token);
    } catch (error: any) {
      console.error('Error getting quote by token:', error);
      return null;
    }
  },

  getAllQuotes: () => {
    try {
      return db.prepare('SELECT * FROM quotes ORDER BY created_at DESC').all();
    } catch (error: any) {
      console.error('Error getting all quotes:', error);
      return [];
    }
  },

  updateAdminNotes: (token: string, notes: string, finalAmount: number | null) => {
    try {
      return db.prepare('UPDATE quotes SET admin_notes = ?, final_amount = ? WHERE quote_token = ?').run(notes, finalAmount, token);
    } catch (error: any) {
      console.error('Error updating admin notes:', error);
      return null;
    }
  },

  sendToClient: (token: string) => {
    try {
      return db.prepare('UPDATE quotes SET status = ?, sent_to_client = TRUE WHERE quote_token = ?').run('sent_to_client', token);
    } catch (error: any) {
      console.error('Error sending quote to client:', error);
      return null;
    }
  },

  updateStatus: (idOrToken: { id?: number; token?: string }, status: string) => {
    try {
      if (idOrToken.id) {
        return db.prepare('UPDATE quotes SET status = ? WHERE id = ?').run(status, idOrToken.id);
      }
      if (idOrToken.token) {
        return db.prepare('UPDATE quotes SET status = ? WHERE quote_token = ?').run(status, idOrToken.token);
      }
      return null;
    } catch (error: any) {
      console.error('Error updating status:', error);
      return null;
    }
  },

  deleteQuote: (idOrToken: { id?: number; token?: string }) => {
    try {
      if (idOrToken.id) {
        return db.prepare('DELETE FROM quotes WHERE id = ?').run(idOrToken.id);
      }
      if (idOrToken.token) {
        return db.prepare('DELETE FROM quotes WHERE quote_token = ?').run(idOrToken.token);
      }
      return null;
    } catch (error: any) {
      console.error('Error deleting quote:', error);
      return null;
    }
  }
};
