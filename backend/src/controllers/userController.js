const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');
const { logAudit } = require('../utils/auditLog');
const { validateEmail, validatePassword } = require('../utils/validation');

// API 8: Add User to Tenant
const addUser = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { email, password, fullName, role: userRole = 'user' } = req.body;
    const { role, tenantId: authTenantId, userId } = req.user;

    // Authorization: Only tenant_admin
    if (role !== 'tenant_admin' || authTenantId !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only tenant admins can add users.'
      });
    }

    // Validation
    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Valid email is required'
      });
    }

    if (!password || !validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
      });
    }

    if (!fullName || fullName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Full name is required'
      });
    }

    if (!['user', 'tenant_admin'].includes(userRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be user or tenant_admin'
      });
    }

    // Check tenant limits
    const tenantResult = await query(
      'SELECT max_users, (SELECT COUNT(*) FROM users WHERE tenant_id = $1) as current_users FROM tenants WHERE id = $1',
      [tenantId]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    const { max_users, current_users } = tenantResult.rows[0];

    if (parseInt(current_users) >= max_users) {
      return res.status(403).json({
        success: false,
        message: 'Subscription limit reached. Cannot add more users.'
      });
    }

    // Check if email already exists in this tenant
    const emailCheck = await query(
      'SELECT id FROM users WHERE tenant_id = $1 AND email = $2',
      [tenantId, email.toLowerCase()]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists in this tenant'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const newUserId = uuidv4();
    const result = await query(
      `INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, full_name, role, is_active, created_at`,
      [newUserId, tenantId, email.toLowerCase(), passwordHash, fullName, userRole, true]
    );

    await logAudit(tenantId, userId, 'CREATE_USER', 'user', newUserId, req.ip);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        fullName: result.rows[0].full_name,
        role: result.rows[0].role,
        tenantId,
        isActive: result.rows[0].is_active,
        createdAt: result.rows[0].created_at
      }
    });

  } catch (error) {
    console.error('Add user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
};

// API 9: List Tenant Users
const listUsers = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { search, role: roleFilter, page = 1, limit = 50 } = req.query;
    const { role, tenantId: authTenantId } = req.user;

    // Authorization
    if (role !== 'super_admin' && authTenantId !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    let whereConditions = ['tenant_id = $1'];
    let queryParams = [tenantId];
    let paramCount = 2;

    if (search) {
      whereConditions.push(`(full_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`);
      queryParams.push(`%${search}%`);
      paramCount++;
    }

    if (roleFilter) {
      whereConditions.push(`role = $${paramCount}`);
      queryParams.push(roleFilter);
      paramCount++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM users WHERE ${whereClause}`,
      queryParams
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated users
    const offset = (parseInt(page) - 1) * parseInt(limit);
    queryParams.push(parseInt(limit), offset);

    const result = await query(
      `SELECT id, email, full_name, role, is_active, created_at
       FROM users
       WHERE ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramCount++} OFFSET $${paramCount}`,
      queryParams
    );

    const users = result.rows.map(u => ({
      id: u.id,
      email: u.email,
      fullName: u.full_name,
      role: u.role,
      isActive: u.is_active,
      createdAt: u.created_at
    }));

    res.status(200).json({
      success: true,
      data: {
        users,
        total,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

// API 10: Update User
const updateUser = async (req, res) => {
  try {
    const { userId: targetUserId } = req.params;
    const { fullName, role: newRole, isActive } = req.body;
    const { role, tenantId, userId: authUserId } = req.user;

    // Get target user
    const userResult = await query(
      'SELECT id, tenant_id, role FROM users WHERE id = $1',
      [targetUserId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const targetUser = userResult.rows[0];

    // Authorization
    const isSelf = authUserId === targetUserId;
    const isTenantAdmin = role === 'tenant_admin' && tenantId === targetUser.tenant_id;

    if (!isSelf && !isTenantAdmin && role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Users can only update their own fullName
    if (isSelf && !isTenantAdmin) {
      if (newRole !== undefined || isActive !== undefined) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own name'
        });
      }
    }

    // Build update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (fullName !== undefined) {
      updates.push(`full_name = $${paramCount++}`);
      values.push(fullName);
    }

    if (newRole !== undefined && (isTenantAdmin || role === 'super_admin')) {
      if (!['user', 'tenant_admin'].includes(newRole)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role'
        });
      }
      updates.push(`role = $${paramCount++}`);
      values.push(newRole);
    }

    if (isActive !== undefined && (isTenantAdmin || role === 'super_admin')) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(isActive);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(targetUserId);
    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount}
       RETURNING id, full_name, role, is_active, updated_at`,
      values
    );

    await logAudit(tenantId, authUserId, 'UPDATE_USER', 'user', targetUserId, req.ip);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: result.rows[0].id,
        fullName: result.rows[0].full_name,
        role: result.rows[0].role,
        isActive: result.rows[0].is_active,
        updatedAt: result.rows[0].updated_at
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
};

// API 11: Delete User
const deleteUser = async (req, res) => {
  try {
    const { userId: targetUserId } = req.params;
    const { role, tenantId, userId: authUserId } = req.user;

    // Cannot delete yourself
    if (authUserId === targetUserId) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete yourself'
      });
    }

    // Get target user
    const userResult = await query(
      'SELECT id, tenant_id FROM users WHERE id = $1',
      [targetUserId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const targetUser = userResult.rows[0];

    // Authorization
    if (role !== 'tenant_admin' || tenantId !== targetUser.tenant_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete user (cascade will handle related records)
    await query('DELETE FROM users WHERE id = $1', [targetUserId]);

    await logAudit(tenantId, authUserId, 'DELETE_USER', 'user', targetUserId, req.ip);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};

module.exports = {
  addUser,
  listUsers,
  updateUser,
  deleteUser
};
