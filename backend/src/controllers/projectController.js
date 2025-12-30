const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');
const { logAudit } = require('../utils/auditLog');

// API 12: Create Project
const createProject = async (req, res) => {
  try {
    const { name, description, status = 'active' } = req.body;
    const { tenantId, userId, role } = req.user;

    // Validation
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Project name is required'
      });
    }

    if (status && !['active', 'archived', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Check project limit
    const tenantResult = await query(
      'SELECT max_projects, (SELECT COUNT(*) FROM projects WHERE tenant_id = $1) as current_projects FROM tenants WHERE id = $1',
      [tenantId]
    );

    const { max_projects, current_projects } = tenantResult.rows[0];

    if (parseInt(current_projects) >= max_projects) {
      return res.status(403).json({
        success: false,
        message: 'Project limit reached for your subscription plan'
      });
    }

    // Create project
    const projectId = uuidv4();
    const result = await query(
      `INSERT INTO projects (id, tenant_id, name, description, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, tenant_id, name, description, status, created_by, created_at`,
      [projectId, tenantId, name, description, status, userId]
    );

    await logAudit(tenantId, userId, 'CREATE_PROJECT', 'project', projectId, req.ip);

    res.status(201).json({
      success: true,
      data: {
        id: result.rows[0].id,
        tenantId: result.rows[0].tenant_id,
        name: result.rows[0].name,
        description: result.rows[0].description,
        status: result.rows[0].status,
        createdBy: result.rows[0].created_by,
        createdAt: result.rows[0].created_at
      }
    });

  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project'
    });
  }
};

// API 13: List Projects
const listProjects = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const { tenantId, userId, role } = req.user;

    let whereConditions = [];
    let queryParams = [];
    let paramCount = 1;

    // Tenant isolation (except super_admin)
    if (role !== 'super_admin') {
      whereConditions.push(`p.tenant_id = $${paramCount++}`);
      queryParams.push(tenantId);
    }

    // User-level access control
    // Regular users can only see:
    // 1. Projects they created
    // 2. Projects where they have assigned tasks
    if (role === 'user') {
      whereConditions.push(`(p.created_by = $${paramCount} OR EXISTS (
        SELECT 1 FROM tasks t WHERE t.project_id = p.id AND t.assigned_to = $${paramCount}
      ))`);
      queryParams.push(userId);
      paramCount++;
    }

    if (status) {
      whereConditions.push(`p.status = $${paramCount++}`);
      queryParams.push(status);
    }

    if (search) {
      whereConditions.push(`p.name ILIKE $${paramCount++}`);
      queryParams.push(`%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM projects p ${whereClause}`,
      queryParams
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated projects
    const offset = (parseInt(page) - 1) * parseInt(limit);
    queryParams.push(parseInt(limit), offset);

    const result = await query(
      `SELECT p.id, p.name, p.description, p.status, p.created_at,
              u.id as creator_id, u.full_name as creator_name,
              (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count,
              (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'completed') as completed_task_count
       FROM projects p
       LEFT JOIN users u ON p.created_by = u.id
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT $${paramCount++} OFFSET $${paramCount}`,
      queryParams
    );

    const projects = result.rows.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      status: p.status,
      createdBy: {
        id: p.creator_id,
        fullName: p.creator_name
      },
      taskCount: parseInt(p.task_count),
      completedTaskCount: parseInt(p.completed_task_count),
      createdAt: p.created_at
    }));

    res.status(200).json({
      success: true,
      data: {
        projects,
        total,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('List projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects'
    });
  }
};

// API 14: Update Project
const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description, status } = req.body;
    const { tenantId, userId, role } = req.user;

    // Get project
    const projectResult = await query(
      'SELECT id, tenant_id, created_by FROM projects WHERE id = $1',
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const project = projectResult.rows[0];

    // Tenant isolation
    if (role !== 'super_admin' && project.tenant_id !== tenantId) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Access control: Regular users can only update projects they created
    if (role === 'user' && project.created_by !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only project creator or tenant admin can update.'
      });
    }

    // Authorization: tenant_admin or project creator
    if (role !== 'tenant_admin' && project.created_by !== userId && role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only tenant admin or project creator can update.'
      });
    }

    // Build update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }

    if (status !== undefined) {
      if (!['active', 'archived', 'completed'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(projectId);
    const result = await query(
      `UPDATE projects SET ${updates.join(', ')} WHERE id = $${paramCount}
       RETURNING id, name, description, status, updated_at`,
      values
    );

    await logAudit(tenantId, userId, 'UPDATE_PROJECT', 'project', projectId, req.ip);

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: {
        id: result.rows[0].id,
        name: result.rows[0].name,
        description: result.rows[0].description,
        status: result.rows[0].status,
        updatedAt: result.rows[0].updated_at
      }
    });

  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project'
    });
  }
};

// API 15: Delete Project
const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { tenantId, userId, role } = req.user;

    // Get project
    const projectResult = await query(
      'SELECT id, tenant_id, created_by FROM projects WHERE id = $1',
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const project = projectResult.rows[0];

    // Access control: Regular users can only delete projects they created
    if (role === 'user' && project.created_by !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only project creator or tenant admin can delete.'
      });
    }

    // Tenant isolation
    if (role !== 'super_admin' && project.tenant_id !== tenantId) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Authorization: tenant_admin or project creator
    if (role !== 'tenant_admin' && project.created_by !== userId && role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete project (cascade will delete tasks)
    await query('DELETE FROM projects WHERE id = $1', [projectId]);

    await logAudit(tenantId, userId, 'DELETE_PROJECT', 'project', projectId, req.ip);

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project'
    });
  }
};

module.exports = {
  createProject,
  listProjects,
  updateProject,
  deleteProject
};
