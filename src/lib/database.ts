import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Create database directory if it doesn't exist
const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'submissions.db');
const db = new Database(dbPath);

// Create table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS project_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    project_type TEXT NOT NULL,
    scope TEXT NOT NULL,
    timeline TEXT NOT NULL,
    budget TEXT NOT NULL,
    client TEXT NOT NULL,
    requirements TEXT,
    status TEXT DEFAULT 'new'
  )
`);

// Prepare statements for better performance
const insertSubmission = db.prepare(`
  INSERT INTO project_submissions (project_type, scope, timeline, budget, client, requirements, status)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const getAllSubmissions = db.prepare(`
  SELECT * FROM project_submissions ORDER BY created_at DESC
`);

const getSubmissionById = db.prepare(`
  SELECT * FROM project_submissions WHERE id = ?
`);

// Database interface
export interface ProjectSubmission {
  id?: number;
  created_at?: string;
  project_type: string;
  scope: {
    pages: number;
    features: string[];
    complexity: string;
  };
  timeline: {
    deadline: string;
    urgency: string;
  };
  budget: {
    range: string;
    flexibility: string;
  };
  client: {
    name: string;
    email: string;
    company?: string;
    phone?: string;
  };
  requirements: string;
  status?: 'new' | 'reviewed' | 'quoted' | 'accepted' | 'rejected';
}

// Database functions
export const database = {
  // Insert a new submission
  insertSubmission: (submission: Omit<ProjectSubmission, 'id' | 'created_at'>) => {
    try {
      const result = insertSubmission.run(
        submission.project_type,
        JSON.stringify(submission.scope),
        JSON.stringify(submission.timeline),
        JSON.stringify(submission.budget),
        JSON.stringify(submission.client),
        submission.requirements,
        submission.status || 'new'
      );
      
      return { success: true, id: result.lastInsertRowid };
    } catch (error) {
      console.error('Database insert error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all submissions
  getAllSubmissions: () => {
    try {
      const rows = getAllSubmissions.all();
      return rows.map(row => ({
        ...row,
        scope: JSON.parse(row.scope),
        timeline: JSON.parse(row.timeline),
        budget: JSON.parse(row.budget),
        client: JSON.parse(row.client)
      }));
    } catch (error) {
      console.error('Database select error:', error);
      return [];
    }
  },

  // Get submission by ID
  getSubmissionById: (id: number) => {
    try {
      const row = getSubmissionById.get(id);
      if (!row) return null;
      
      return {
        ...row,
        scope: JSON.parse(row.scope),
        timeline: JSON.parse(row.timeline),
        budget: JSON.parse(row.budget),
        client: JSON.parse(row.client)
      };
    } catch (error) {
      console.error('Database select error:', error);
      return null;
    }
  },

  // Close database connection
  close: () => {
    db.close();
  }
};

// Graceful shutdown
process.on('SIGINT', () => {
  database.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  database.close();
  process.exit(0);
});





