const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { query, getClient } = require('../config/database');
const { secret, expiresIn } = require('../config/jwt');
const { logAudit } = require('../utils/auditLog');
const {
  validateEmail,
  validatePassword,
  validateSubdomain,
  validateRequired
} = require('../utils/validation');

// API 1: Tenant Registration
const registerTenant = async (req, res) => {
  const { tenantName, subdomain, adminEmail, adminPassword, adminFullName } = req.body;
  
  try {
    // Validation
    const errors = [];
    
    if (!tenantName || tenantName.trim() === '') errors.push('Tenant name is required');
    if (!subdomain || !validateSubdomain(subdomain)) errors.push('Invalid subdomain format');
    if (!adminEmail || !validateEmail(adminEmail)) errors.push('Invalid email format');
    if (!adminPassword || !validatePassword(adminPassword)) {
      errors.push('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
    }
    if (!adminFullName || adminFullName.trim() === '') errors.push('Admin full name is required');
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Check if subdomain already exists
    const subdomainCheck = await query(
      'SELECT id FROM tenants WHERE subdomain = $1',
      [subdomain.toLowerCase()]
    );

    if (subdomainCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Subdomain already exists. Please choose a different subdomain.'
      });
    }

    // Start transaction
    const client = await getClient();
    
    try {
      await client.query('BEGIN');

      // Create tenant
      const tenantId = uuidv4();
      const tenantResult = await client.query(
        `INSERT INTO tenants (id, name, subdomain, status, subscription_plan, max_users, max_projects)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, name, subdomain, status, subscription_plan`,
        [tenantId, tenantName, subdomain.toLowerCase(), 'active', 'free', 5, 3]
      );

      // Hash password
      const passwordHash = await bcrypt.hash(adminPassword, 10);

      // Create admin user
      const userId = uuidv4();
      const userResult = await client.query(
        `INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, email, full_name, role`,
        [userId, tenantId, adminEmail.toLowerCase(), passwordHash, adminFullName, 'tenant_admin', true]
      );

      // Commit transaction
      await client.query('COMMIT');

      // Log audit
      await logAudit(tenantId, userId, 'TENANT_REGISTERED', 'tenant', tenantId, req.ip);

      res.status(201).json({
        success: true,
        message: 'Tenant registered successfully',
        data: {
          tenantId: tenantResult.rows[0].id,
          subdomain: tenantResult.rows[0].subdomain,
          adminUser: {
            id: userResult.rows[0].id,
            email: userResult.rows[0].email,
            fullName: userResult.rows[0].full_name,
            role: userResult.rows[0].role
          }
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Register tenant error:', error);
    
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({
        success: false,
        message: 'Email or subdomain already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to register tenant. Please try again.'
    });
  }
};

// API 2: User Login
const login = async (req, res) => {
  const { email, password, tenantSubdomain } = req.body;

  try {
    // Validation
    if (!email || !password || (!tenantSubdomain && email.toLowerCase() !== 'superadmin@system.com')) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and tenant subdomain are required'
      });
    }

    // Special case: Super admin (no tenant)
    if (email.toLowerCase() === 'superadmin@system.com') {
      const userResult = await query(
        'SELECT id, email, password_hash, full_name, role, tenant_id, is_active FROM users WHERE email = $1 AND tenant_id IS NULL',
        [email.toLowerCase()]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const user = userResult.rows[0];

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check if active
      if (!user.is_active) {
        return res.status(403).json({
          success: false,
          message: 'Account is inactive. Please contact administrator.'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, tenantId: null, role: user.role },
        secret,
        { expiresIn }
      );

      // Log audit
      await logAudit(null, user.id, 'LOGIN', 'user', user.id, req.ip);

      return res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            role: user.role,
            tenantId: null
          },
          token,
          expiresIn: 86400
        }
      });
    }

    // Regular user login
    // Find tenant
    const tenantResult = await query(
      'SELECT id, name, status FROM tenants WHERE subdomain = $1',
      [tenantSubdomain.toLowerCase()]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    const tenant = tenantResult.rows[0];

    // Check tenant status
    if (tenant.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Tenant account is suspended or inactive'
      });
    }

    // Find user
    const userResult = await query(
      'SELECT id, email, password_hash, full_name, role, tenant_id, is_active FROM users WHERE email = $1 AND tenant_id = $2',
      [email.toLowerCase(), tenant.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = userResult.rows[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive. Please contact administrator.'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, tenantId: user.tenant_id, role: user.role },
      secret,
      { expiresIn }
    );

    // Log audit
    await logAudit(user.tenant_id, user.id, 'LOGIN', 'user', user.id, req.ip);

    // Get tenant details
    const tenantDetailsResult = await query(
      'SELECT id, name, subdomain, subscription_plan, max_users, max_projects, status FROM tenants WHERE id = $1',
      [user.tenant_id]
    );
    
    const tenantDetails = tenantDetailsResult.rows[0];

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          tenantId: user.tenant_id,
          tenant: {
            id: tenantDetails.id,
            name: tenantDetails.name,
            subdomain: tenantDetails.subdomain,
            subscriptionPlan: tenantDetails.subscription_plan,
            maxUsers: tenantDetails.max_users,
            maxProjects: tenantDetails.max_projects,
            status: tenantDetails.status
          }
        },
        token,
        expiresIn: 86400
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
};

// API 3: Get Current User
const getCurrentUser = async (req, res) => {
  try {
    const { userId } = req.user;

    const userResult = await query(
      `SELECT u.id, u.email, u.full_name, u.role, u.is_active, u.tenant_id,
              t.id as tenant_id, t.name as tenant_name, t.subdomain, 
              t.subscription_plan, t.max_users, t.max_projects, t.status as tenant_status
       FROM users u
       LEFT JOIN tenants t ON u.tenant_id = t.id
       WHERE u.id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult.rows[0];

    const response = {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        isActive: user.is_active
      }
    };

    // Add tenant info if user belongs to a tenant
    if (user.tenant_id) {
      response.data.tenant = {
        id: user.tenant_id,
        name: user.tenant_name,
        subdomain: user.subdomain,
        subscriptionPlan: user.subscription_plan,
        maxUsers: user.max_users,
        maxProjects: user.max_projects,
        status: user.tenant_status
      };
    }

    res.status(200).json(response);

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user data'
    });
  }
};

// API 4: Logout
const logout = async (req, res) => {
  try {
    // Log audit
    await logAudit(req.user.tenantId, req.user.userId, 'LOGOUT', 'user', req.user.userId, req.ip);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  }
};

module.exports = {
  registerTenant,
  login,
  getCurrentUser,
  logout
};
