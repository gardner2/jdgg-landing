import Database from 'better-sqlite3';
import path from 'path';
import { generateOpenAIQuote } from './openai-service';

const dbPath = path.join(process.cwd(), 'data', 'quotes-new.db');
const db = new Database(dbPath);

// Create tables with simplified schema
db.exec(`
  CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_email TEXT NOT NULL,
    client_name TEXT,
    client_company TEXT,
    client_phone TEXT,
    project_type TEXT NOT NULL,
    scope_features TEXT NOT NULL,
    timeline TEXT NOT NULL,
    budget_range TEXT NOT NULL,
    requirements TEXT,
    quote_amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'GBP',
    status TEXT DEFAULT 'pending',
    quote_token TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    accepted_at DATETIME,
    declined_at DATETIME,
    payment_intent_id TEXT,
    stripe_customer_id TEXT,
    portal_access_granted BOOLEAN DEFAULT FALSE,
    ai_analysis TEXT,
    quote_breakdown TEXT,
    admin_notes TEXT,
    admin_adjustments TEXT,
    final_amount INTEGER
  )
`);

// Simple insert statement with exact column count
const insertQuote = db.prepare(`
  INSERT INTO quotes (
    client_email, client_name, client_company, client_phone,
    project_type, scope_features, timeline, budget_range, requirements,
    quote_amount, currency, status, quote_token, expires_at, 
    accepted_at, declined_at, payment_intent_id, stripe_customer_id, 
    portal_access_granted, ai_analysis, quote_breakdown, admin_notes, 
    admin_adjustments, final_amount
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const getQuoteByToken = db.prepare('SELECT * FROM quotes WHERE quote_token = ?');
const getQuoteByEmail = db.prepare('SELECT * FROM quotes WHERE client_email = ? ORDER BY created_at DESC');
const updateQuoteStatus = db.prepare('UPDATE quotes SET status = ?, accepted_at = ?, declined_at = ? WHERE quote_token = ?');
const updateQuotePayment = db.prepare('UPDATE quotes SET payment_intent_id = ?, stripe_customer_id = ? WHERE quote_token = ?');
const grantPortalAccess = db.prepare('UPDATE quotes SET portal_access_granted = TRUE WHERE quote_token = ?');
const updateAdminNotes = db.prepare('UPDATE quotes SET admin_notes = ?, admin_adjustments = ?, final_amount = ? WHERE quote_token = ?');
const getAllQuotes = db.prepare('SELECT * FROM quotes ORDER BY created_at DESC');

// Generate unique quote token
function generateQuoteToken(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `quote_${timestamp}_${random}`;
}

// Simple quote calculation fallback
function calculateSimpleQuote(clientData: {
  projectType: string;
  scopeFeatures: string[];
  timeline: string;
  budgetRange: string;
}): number {
  let baseAmount = 0;
  
  // Base pricing by project type
  switch (clientData.projectType) {
    case 'landing-page':
      baseAmount = 2500;
      break;
    case 'multi-page':
      baseAmount = 4000;
      break;
    case 'ecommerce':
      baseAmount = 6000;
      break;
    case 'web-app':
      baseAmount = 8000;
      break;
    case 'redesign':
      baseAmount = 2000;
      break;
    default:
      baseAmount = 3000;
  }
  
  // Adjust for scope features
  const featureMultiplier = clientData.scopeFeatures.length * 0.1;
  baseAmount += baseAmount * featureMultiplier;
  
  // Adjust for timeline (rush jobs cost more)
  if (clientData.timeline === 'asap') {
    baseAmount *= 1.3;
  } else if (clientData.timeline === '1-week') {
    baseAmount *= 1.2;
  }
  
  // Adjust for budget range
  if (clientData.budgetRange === '5000-10000') {
    baseAmount = Math.max(baseAmount, 5000);
  } else if (clientData.budgetRange === '10000+') {
    baseAmount = Math.max(baseAmount, 8000);
  }
  
  return Math.round(baseAmount);
}

export const quoteDatabase = {
  // Create a new quote using AI generation
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
      
      // Generate AI-powered quote using OpenAI
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
        console.error('OpenAI quote generation failed, using fallback:', error);
        // Fallback to simple calculation
        const baseAmount = calculateSimpleQuote(clientData);
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
      
      // Set expiration to 30 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      
      const result = insertQuote.run(
        clientData.email,
        clientData.name || null,
        clientData.company || null,
        clientData.phone || null,
        clientData.projectType,
        JSON.stringify(clientData.scopeFeatures),
        clientData.timeline,
        clientData.budgetRange,
        clientData.requirements || null,
        aiQuote.totalPrice,
        'GBP',
        'pending',
        quoteToken,
        expiresAt.toISOString(),
        null, // accepted_at
        null, // declined_at
        null, // payment_intent_id
        null, // stripe_customer_id
        false, // portal_access_granted
        JSON.stringify({
          complexity: aiQuote.complexity,
          estimatedHours: aiQuote.estimatedHours,
          confidence: aiQuote.confidence
        }),
        JSON.stringify(aiQuote),
        null, // admin_notes
        null, // admin_adjustments
        null  // final_amount
      );
      
      return {
        success: true,
        quoteId: result.lastInsertRowid,
        quoteToken,
        quoteAmount: aiQuote.totalPrice,
        aiAnalysis: aiQuote.analysis,
        quoteBreakdown: aiQuote,
        reviewUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/quote/${quoteToken}`
      };
    } catch (error: any) {
      console.error('Quote creation error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get quote by token
  getQuoteByToken: (token: string) => {
    try {
      return getQuoteByToken.get(token);
    } catch (error: any) {
      console.error('Error getting quote by token:', error);
      return null;
    }
  },

  // Get quotes by email
  getQuotesByEmail: (email: string) => {
    try {
      return getQuoteByEmail.all(email);
    } catch (error: any) {
      console.error('Error getting quotes by email:', error);
      return [];
    }
  },

  // Update quote status
  updateQuoteStatus: (token: string, status: string, acceptedAt?: string, declinedAt?: string) => {
    try {
      return updateQuoteStatus.run(status, acceptedAt || null, declinedAt || null, token);
    } catch (error: any) {
      console.error('Error updating quote status:', error);
      return null;
    }
  },

  // Update quote payment info
  updateQuotePayment: (token: string, paymentIntentId: string, stripeCustomerId: string) => {
    try {
      return updateQuotePayment.run(paymentIntentId, stripeCustomerId, token);
    } catch (error: any) {
      console.error('Error updating quote payment:', error);
      return null;
    }
  },

  // Grant portal access
  grantPortalAccess: (token: string) => {
    try {
      return grantPortalAccess.run(token);
    } catch (error: any) {
      console.error('Error granting portal access:', error);
      return null;
    }
  },

  // Update admin notes
  updateAdminNotes: (token: string, notes: string, adjustments: string, finalAmount: number) => {
    try {
      return updateAdminNotes.run(notes, adjustments, finalAmount, token);
    } catch (error: any) {
      console.error('Error updating admin notes:', error);
      return null;
    }
  },

  // Get all quotes for admin
  getAllQuotes: () => {
    try {
      return getAllQuotes.all();
    } catch (error: any) {
      console.error('Error getting all quotes:', error);
      return [];
    }
  }
};





