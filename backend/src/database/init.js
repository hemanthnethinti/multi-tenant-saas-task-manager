const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

async function initializeDatabase() {
  console.log('🚀 Starting database initialization...');
  
  const client = await pool.connect();
  
  try {
    // Check if core table exists; if not, run migrations
    const existsRes = await client.query("SELECT to_regclass('public.tenants') as exists");
    if (!existsRes.rows[0].exists) {
      console.log('📝 Running migrations...');
      const migrationPath = path.join(__dirname, 'migrations', '001_create_tables.sql');
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      try {
        await client.query(migrationSQL);
        console.log('✓ Migrations completed');
      } catch (mErr) {
        // If objects already exist, log and continue
        console.warn('⚠️ Migration warning:', mErr.message);
      }
    } else {
      console.log('✓ Migrations already applied, skipping...');
    }

    // Check if seed data already exists
    const checkResult = await client.query(
      "SELECT COUNT(*) FROM users WHERE email = 'superadmin@system.com'"
    );
    
    if (parseInt(checkResult.rows[0].count) > 0) {
      console.log('✓ Seed data already exists, skipping...');
      return;
    }

    // Generate password hashes
    console.log('🔐 Generating password hashes...');
    const superAdminHash = await bcrypt.hash('SuperAdmin@123', 10);
    const adminHash = await bcrypt.hash('Admin@123', 10);
    const userHash = await bcrypt.hash('User@123', 10);

    // Insert seed data with proper password hashes
    console.log('🌱 Seeding database...');
    
    // Super Admin
    await client.query(`
      INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active)
      VALUES ($1, NULL, $2, $3, $4, $5, true)
      ON CONFLICT (tenant_id, email) DO NOTHING
    `, ['a0000000-0000-0000-0000-000000000001', 'superadmin@system.com', superAdminHash, 'Super Administrator', 'super_admin']);

    // Tenants
    await client.query(`
      INSERT INTO tenants (id, name, subdomain, status, subscription_plan, max_users, max_projects)
      VALUES 
        ($1, 'Acme Corporation', 'acme', 'active', 'pro', 25, 15),
        ($2, 'TechStart Inc', 'techstart', 'active', 'free', 5, 3)
      ON CONFLICT (subdomain) DO NOTHING
    `, ['b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002']);

    // Users for Acme
    await client.query(`
      INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active)
      VALUES 
        ($1, $2, 'admin@acme.com', $3, 'John Doe', 'tenant_admin', true),
        ($4, $2, 'user1@acme.com', $5, 'Alice Smith', 'user', true),
        ($6, $2, 'user2@acme.com', $5, 'Bob Johnson', 'user', true)
      ON CONFLICT (tenant_id, email) DO NOTHING
    `, [
      'c0000000-0000-0000-0000-000000000001', 
      'b0000000-0000-0000-0000-000000000001', 
      adminHash,
      'c0000000-0000-0000-0000-000000000002',
      userHash,
      'c0000000-0000-0000-0000-000000000003'
    ]);

    // Users for TechStart
    await client.query(`
      INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active)
      VALUES 
        ($1, $2, 'admin@techstart.com', $3, 'Sarah Williams', 'tenant_admin', true),
        ($4, $2, 'developer@techstart.com', $5, 'Mike Chen', 'user', true)
      ON CONFLICT (tenant_id, email) DO NOTHING
    `, [
      'c0000000-0000-0000-0000-000000000004',
      'b0000000-0000-0000-0000-000000000002',
      adminHash,
      'c0000000-0000-0000-0000-000000000005',
      userHash
    ]);

    // Projects
    await client.query(`
      INSERT INTO projects (id, tenant_id, name, description, status, created_by)
      VALUES 
        ($1, $2, 'Website Redesign', 'Complete redesign of company website with modern UI', 'active', $3),
        ($4, $2, 'Mobile App Launch', 'Launch new mobile application for iOS and Android', 'active', $3),
        ($5, $6, 'Mobile App Development', 'Build iOS and Android app with React Native', 'active', $7)
    `, [
      'd0000000-0000-0000-0000-000000000001',
      'b0000000-0000-0000-0000-000000000001',
      'c0000000-0000-0000-0000-000000000001',
      'd0000000-0000-0000-0000-000000000002',
      'd0000000-0000-0000-0000-000000000003',
      'b0000000-0000-0000-0000-000000000002',
      'c0000000-0000-0000-0000-000000000004'
    ]);

    // Tasks
    await client.query(`
      INSERT INTO tasks (id, project_id, tenant_id, title, description, status, priority, assigned_to, due_date)
      VALUES 
        ($1, $2, $3, 'Design mockups', 'Create initial design mockups for homepage', 'in_progress', 'high', $4, CURRENT_DATE + INTERVAL '7 days'),
        ($5, $2, $3, 'Implement frontend', 'Build React components for new design', 'todo', 'medium', $6, CURRENT_DATE + INTERVAL '14 days'),
        ($7, $8, $3, 'API Integration', 'Connect mobile app to backend APIs', 'todo', 'high', $4, CURRENT_DATE + INTERVAL '10 days'),
        ($9, $10, $11, 'Setup project structure', 'Initialize React Native project', 'completed', 'high', $12, CURRENT_DATE - INTERVAL '2 days'),
        ($13, $10, $11, 'API Integration', 'Connect to backend REST APIs', 'in_progress', 'high', $12, CURRENT_DATE + INTERVAL '5 days')
    `, [
      'e0000000-0000-0000-0000-000000000001',
      'd0000000-0000-0000-0000-000000000001',
      'b0000000-0000-0000-0000-000000000001',
      'c0000000-0000-0000-0000-000000000002',
      'e0000000-0000-0000-0000-000000000002',
      'c0000000-0000-0000-0000-000000000003',
      'e0000000-0000-0000-0000-000000000003',
      'd0000000-0000-0000-0000-000000000002',
      'e0000000-0000-0000-0000-000000000004',
      'd0000000-0000-0000-0000-000000000003',
      'b0000000-0000-0000-0000-000000000002',
      'c0000000-0000-0000-0000-000000000005',
      'e0000000-0000-0000-0000-000000000005'
    ]);

    console.log('✓ Seed data inserted successfully');
    console.log('\n📋 Test Credentials:');
    console.log('Super Admin: superadmin@system.com / SuperAdmin@123');
    console.log('Acme Admin: admin@acme.com / Admin@123');
    console.log('TechStart Admin: admin@techstart.com / Admin@123');
    console.log('Users: user1@acme.com / User@123\n');
    
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Database initialization complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed to initialize database:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };
