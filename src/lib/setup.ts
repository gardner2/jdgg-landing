// Setup script to initialize the database and create admin user
import { crmDb } from './crm-db';

export async function setupDatabase() {
  try {
    console.log('Setting up database...');
    
    // Check if admin user exists
    const existingAdmin = await crmDb.getAdminByEmail('jgdesigndevelopment@gmail.com');
    
    if (!existingAdmin) {
      console.log('Creating default admin user...');
      await crmDb.createAdminUser('jgdesigndevelopment@gmail.com', 'JGDD Admin');
      console.log('✅ Admin user created: jgdesigndevelopment@gmail.com');
    } else {
      console.log('✅ Admin user already exists');
    }
    
    console.log('✅ Database setup complete!');
    return true;
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    return false;
  }
}

// Run if executed directly
if (require.main === module) {
  setupDatabase();
}
