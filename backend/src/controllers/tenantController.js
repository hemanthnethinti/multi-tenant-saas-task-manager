const { query } = require('../config/database');
const { logAudit } = require('../utils/auditLog');

// API 5: Get Tenant Details
const getTenantDetails = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { role, tenantId: userTenantId } = req.user;

    // Authorization check
    if (role !== 'super_admin' && userTenantId !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Cannot access other tenant data.'
      });
    }

    // Get tenant details
    const tenantResult = await query(
      'SELECT id, name, subdomain, status, subscription_plan, max_users, max_projects, created_at FROM tenants WHERE id = $1',
      [tenantId]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    const tenant = tenantResult.rows[0];

    // Get stats
    const statsResult = await query(
      `SELECT 
        (SELECT COUNT(*) FROM users WHERE tenant_id = $1) as total_users,
        (SELECT COUNT(*) FROM projects WHERE tenant_id = $1) as total_projects,
        (SELECT COUNT(*) FROM tasks WHERE tenant_id = $1) as total_tasks`,
      [tenantId]
    );

    const stats = statsResult.rows[0];

    res.status(200).json({
      success: true,
      data: {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        status: tenant.status,
        subscriptionPlan: tenant.subscription_plan,
        maxUsers: tenant.max_users,
        maxProjects: tenant.max_projects,
        createdAt: tenant.created_at,
        stats: {
          totalUsers: parseInt(stats.total_users),
          totalProjects: parseInt(stats.total_projects),
          totalTasks: parseInt(stats.total_tasks)
        }
      }
    });

  } catch (error) {
    console.error('Get tenant details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tenant details'
    });
  }
};

// API 6: Update Tenant
const updateTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { name, status, subscriptionPlan, maxUsers, maxProjects } = req.body;
    const { role, tenantId: userTenantId, userId } = req.user;

    // Authorization check
    if (role !== 'super_admin' && role !== 'tenant_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admins can update tenant.'
      });
    }

    if (role !== 'super_admin' && userTenantId !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Cannot update other tenant.'
      });
    }

    // Check if tenant exists
    const tenantCheck = await query('SELECT id FROM tenants WHERE id = $1', [tenantId]);
    if (tenantCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    // Tenant admin can only update name
    if (role === 'tenant_admin') {
      if (status || subscriptionPlan || maxUsers || maxProjects) {
        return res.status(403).json({
          success: false,
          message: 'Tenant admins can only update tenant name'
        });
      }

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Name is required'
        });
      }

      const result = await query(
        'UPDATE tenants SET name = $1 WHERE id = $2 RETURNING id, name, updated_at',
        [name, tenantId]
      );

      await logAudit(tenantId, userId, 'UPDATE_TENANT', 'tenant', tenantId, req.ip);

      return res.status(200).json({
        success: true,
        message: 'Tenant updated successfully',
        data: {
          id: result.rows[0].id,
          name: result.rows[0].name,
          updatedAt: result.rows[0].updated_at
        }
      });
    }

    // Super admin can update all fields
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (status) {
      if (!['active', 'suspended', 'trial'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value'
        });
      }
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (subscriptionPlan) {
      if (!['free', 'pro', 'enterprise'].includes(subscriptionPlan)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid subscription plan'
        });
      }
      updates.push(`subscription_plan = $${paramCount++}`);
      values.push(subscriptionPlan);
    }
    if (maxUsers !== undefined) {
      updates.push(`max_users = $${paramCount++}`);
      values.push(maxUsers);
    }
    if (maxProjects !== undefined) {
      updates.push(`max_projects = $${paramCount++}`);
      values.push(maxProjects);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(tenantId);
    const result = await query(
      `UPDATE tenants SET ${updates.join(', ')} WHERE id = $${paramCount} 
       RETURNING id, name, status, subscription_plan, max_users, max_projects, updated_at`,
      values
    );

    await logAudit(tenantId, userId, 'UPDATE_TENANT', 'tenant', tenantId, req.ip);

    res.status(200).json({
      success: true,
      message: 'Tenant updated successfully',
      data: {
        id: result.rows[0].id,
        name: result.rows[0].name,
        status: result.rows[0].status,
        subscriptionPlan: result.rows[0].subscription_plan,
        maxUsers: result.rows[0].max_users,
        maxProjects: result.rows[0].max_projects,
        updatedAt: result.rows[0].updated_at
      }
    });

  } catch (error) {
    console.error('Update tenant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tenant'
    });
  }
};

// API 7: List All Tenants (Super Admin Only)
const listAllTenants = async (req, res) => {
  try {
    const { role } = req.user;
    const { page = 1, limit = 10, status, subscriptionPlan } = req.query;

    // Authorization check
    if (role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin only.'
      });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query
    let whereConditions = [];
    let queryParams = [];
    let paramCount = 1;

    if (status) {
      whereConditions.push(`t.status = $${paramCount++}`);
      queryParams.push(status);
    }

    if (subscriptionPlan) {
      whereConditions.push(`t.subscription_plan = $${paramCount++}`);
      queryParams.push(subscriptionPlan);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM tenants t ${whereClause}`,
      queryParams
    );
    const totalTenants = parseInt(countResult.rows[0].count);

    // Get paginated tenants with stats
    queryParams.push(parseInt(limit), offset);
    const tenantsResult = await query(
      `SELECT t.id, t.name, t.subdomain, t.status, t.subscription_plan, t.created_at,
              (SELECT COUNT(*) FROM users WHERE tenant_id = t.id) as total_users,
              (SELECT COUNT(*) FROM projects WHERE tenant_id = t.id) as total_projects
       FROM tenants t
       ${whereClause}
       ORDER BY t.created_at DESC
       LIMIT $${paramCount++} OFFSET $${paramCount}`,
      queryParams
    );

    const tenants = tenantsResult.rows.map(t => ({
      id: t.id,
      name: t.name,
      subdomain: t.subdomain,
      status: t.status,
      subscriptionPlan: t.subscription_plan,
      totalUsers: parseInt(t.total_users),
      totalProjects: parseInt(t.total_projects),
      createdAt: t.created_at
    }));

    res.status(200).json({
      success: true,
      data: {
        tenants,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalTenants / parseInt(limit)),
          totalTenants,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('List tenants error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tenants'
    });
  }
};

module.exports = {
  getTenantDetails,
  updateTenant,
  listAllTenants
};
