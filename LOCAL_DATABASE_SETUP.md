# Local Database Setup

## Overview

The project now uses a local SQLite database for storing form submissions. This provides a simple, file-based database solution that doesn't require external services or Docker.

## Features

- **SQLite Database**: Lightweight, file-based database
- **Automatic Setup**: Database and tables are created automatically
- **API Endpoints**: RESTful API for form submissions
- **Admin Interface**: View and manage submissions
- **Type Safety**: Full TypeScript support

## Database Location

The database file is stored at: `data/submissions.db`

## API Endpoints

### POST /api/submit
Submit a new project form
```json
{
  "project_type": "website",
  "scope": {
    "pages": 5,
    "features": ["User Authentication", "Payment Processing"],
    "complexity": "moderate"
  },
  "timeline": {
    "deadline": "2months",
    "urgency": "medium"
  },
  "budget": {
    "range": "5k-10k",
    "flexibility": "flexible"
  },
  "client": {
    "name": "John Doe",
    "email": "john@example.com",
    "company": "Example Corp",
    "phone": "+44 20 1234 5678"
  },
  "requirements": "Need a modern website with e-commerce functionality",
  "status": "new"
}
```

### GET /api/submit
Retrieve all submissions

## Admin Interface

Visit `/admin` to view all form submissions with:
- Client information
- Project details
- Timeline and budget
- Requirements
- Status tracking
- Action buttons (placeholder for future features)

## Database Schema

```sql
CREATE TABLE project_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  project_type TEXT NOT NULL,
  scope TEXT NOT NULL,           -- JSON string
  timeline TEXT NOT NULL,        -- JSON string
  budget TEXT NOT NULL,          -- JSON string
  client TEXT NOT NULL,          -- JSON string
  requirements TEXT,
  status TEXT DEFAULT 'new'
);
```

## Development

The database is automatically initialized when the application starts. No additional setup is required.

## Production Considerations

For production deployment, consider:
1. **Backup Strategy**: Regular backups of the SQLite file
2. **File Permissions**: Ensure proper file permissions
3. **Migration**: Plan for database schema changes
4. **Monitoring**: Monitor database file size and performance

## Data Persistence

- Data persists between application restarts
- Database file is created in the `data/` directory
- Graceful shutdown handling included

## Troubleshooting

If you encounter issues:
1. Check that the `data/` directory exists and is writable
2. Verify no other process is using the database file
3. Check application logs for database errors
4. Ensure proper file permissions on the database file





