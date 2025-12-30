const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT) || 5432,
  database: process.env.DATABASE_NAME || 'multi_tenant_saas',
  user: process.env.DATABASE_USER || 'saas_user',
  password: process.env.DATABASE_PASSWORD || 'saas_password_2024',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Test connection
pool.on('connect', () => {
  console.log('✓ Database connected successfully');
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  process.exit(-1);
});

// Helper function to execute queries
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Get a client for transactions
const getClient = () => pool.connect();

module.exports = {
  query,
  getClient,
  pool
};
