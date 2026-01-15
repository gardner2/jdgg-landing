import Database from 'better-sqlite3';
import path from 'path';
import { generateOpenAIQuote } from './openai-service';

const dbPath = path.join(process.cwd(), 'data', 'simple-quotes.db');
const db = new Database(dbPath);

// Create a very simple table structure
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
    ai_analysis TEXT,
    quote_breakdown TEXT
  )
`);

// Simple insert with only the essential columns
const insertQuote = db.prepare(`
  INSERT INTO quotes (
    client_email, client_name, client_company, client_phone,
    project_type, scope_features, timeline, budget_range, requirements,
    quote_amount, currency, status, quote_token, expires_at, ai_analysis, quote_breakdown
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const getQuoteByToken = db.prepare('SELECT * FROM quotes WHERE quote_token = ?');

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
  
  const featureMultiplier = clientData.scopeFeatures.length * 0.1;
  baseAmount += baseAmount * featureMultiplier;
  
  if (clientData.timeline === 'asap') {
    baseAmount *= 1.3;
  } else if (clientData.timeline === '1-week') {
    baseAmount *= 1.2;
  }
  
  if (clientData.budgetRange === '5000-10000') {
    baseAmount = Math.max(baseAmount, 5000);
  } else if (clientData.budgetRange === '10000+') {
    baseAmount = Math.max(baseAmount, 8000);
  }
  
  return Math.round(baseAmount);
}

export const simpleQuoteDatabase = {
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
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      
      // Insert with exactly 16 parameters to match 16 placeholders
      const result = insertQuote.run(
        clientData.email,                    // 1
        clientData.name || null,             // 2
        clientData.company || null,          // 3
        clientData.phone || null,            // 4
        clientData.projectType,              // 5
        JSON.stringify(clientData.scopeFeatures), // 6
        clientData.timeline,                 // 7
        clientData.budgetRange,              // 8
        clientData.requirements || null,     // 9
        aiQuote.totalPrice,                  // 10
        'GBP',                              // 11
        'pending',                          // 12
        quoteToken,                         // 13
        expiresAt.toISOString(),            // 14
        JSON.stringify({                    // 15
          complexity: aiQuote.complexity,
          estimatedHours: aiQuote.estimatedHours,
          confidence: aiQuote.confidence
        }),
        JSON.stringify(aiQuote)             // 16
      );
      
      return {
        success: true,
        quoteId: result.lastInsertRowid,
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
      return getQuoteByToken.get(token);
    } catch (error: any) {
      console.error('Error getting quote by token:', error);
      return null;
    }
  }
};





