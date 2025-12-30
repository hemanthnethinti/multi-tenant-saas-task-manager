const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');
const { logAudit } = require('../utils/auditLog');

// API 16: Create Task
const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, assignedTo, priority = 'medium', dueDate } = req.body;
    const { tenantId, userId, role } = req.user;

    // Validation
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Task title is required'
      });
    }

    // Get project and verify tenant
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
    if (project.tenant_id !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Access control: Regular users can only create tasks in their own projects
    if (role === 'user' && project.created_by !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only create tasks in projects you created.'
      });
    }

    // If assignedTo provided, verify user belongs to same tenant
    if (assignedTo) {
      const userCheck = await query(
        'SELECT id FROM users WHERE id = $1 AND tenant_id = $2',
        [assignedTo, project.tenant_id]
      );

      if (userCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user not found in tenant'
        });
      }
    }

    // Validate priority
    if (!['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid priority. Must be low, medium, or high'
      });
    }

    // Create task
    const taskId = uuidv4();
    const result = await query(
      `INSERT INTO tasks (id, project_id, tenant_id, title, description, status, priority, assigned_to, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, project_id, tenant_id, title, description, status, priority, assigned_to, due_date, created_at`,
      [taskId, projectId, project.tenant_id, title, description, 'todo', priority, assignedTo || null, dueDate || null]
    );

    await logAudit(project.tenant_id, userId, 'CREATE_TASK', 'task', taskId, req.ip);

    res.status(201).json({
      success: true,
      data: {
        id: result.rows[0].id,
        projectId: result.rows[0].project_id,
        tenantId: result.rows[0].tenant_id,
        title: result.rows[0].title,
        description: result.rows[0].description,
        status: result.rows[0].status,
        priority: result.rows[0].priority,
        assignedTo: result.rows[0].assigned_to,
        dueDate: result.rows[0].due_date,
        createdAt: result.rows[0].created_at
      }
    });

  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task'
    });
  }
};

// API 17: List Project Tasks
const listTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, assignedTo, priority, search, page = 1, limit = 50 } = req.query;
    const { tenantId, userId, role } = req.user;

    // Verify project exists and belongs to tenant
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

    if (project.tenant_id !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Access control: Regular users can only view tasks in projects they created or are assigned to
    if (role === 'user' && project.created_by !== userId) {
      // Check if user has any tasks assigned in this project
      const userTaskCheck = await query(
        'SELECT id FROM tasks WHERE project_id = $1 AND assigned_to = $2 LIMIT 1',
        [projectId, userId]
      );
      
      if (userTaskCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view tasks in projects you created or are assigned to.'
        });
      }
    }

    // Build query
    let whereConditions = ['t.project_id = $1'];
    let queryParams = [projectId];
    let paramCount = 2;

    if (status) {
      whereConditions.push(`t.status = $${paramCount++}`);
      queryParams.push(status);
    }

    if (assignedTo) {
      whereConditions.push(`t.assigned_to = $${paramCount++}`);
      queryParams.push(assignedTo);
    }

    if (priority) {
      whereConditions.push(`t.priority = $${paramCount++}`);
      queryParams.push(priority);
    }

    if (search) {
      whereConditions.push(`t.title ILIKE $${paramCount++}`);
      queryParams.push(`%${search}%`);
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM tasks t WHERE ${whereClause}`,
      queryParams
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated tasks
    const offset = (parseInt(page) - 1) * parseInt(limit);
    queryParams.push(parseInt(limit), offset);

    const result = await query(
      `SELECT t.id, t.title, t.description, t.status, t.priority, t.due_date, t.created_at,
              u.id as user_id, u.full_name as user_name, u.email as user_email
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE ${whereClause}
       ORDER BY 
         CASE t.priority 
           WHEN 'high' THEN 1
           WHEN 'medium' THEN 2
           WHEN 'low' THEN 3
         END,
         t.due_date ASC NULLS LAST
       LIMIT $${paramCount++} OFFSET $${paramCount}`,
      queryParams
    );

    const tasks = result.rows.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      assignedTo: t.user_id ? {
        id: t.user_id,
        fullName: t.user_name,
        email: t.user_email
      } : null,
      dueDate: t.due_date,
      createdAt: t.created_at
    }));

    res.status(200).json({
      success: true,
      data: {
        tasks,
        total,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('List tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks'
    });
  }
};

// API 18: Update Task Status
const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const { tenantId, userId, role } = req.user;

    // Validation
    if (!status || !['todo', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be todo, in_progress, or completed'
      });
    }

    // Verify task belongs to tenant and get project info
    const taskResult = await query(
      `SELECT t.id, t.tenant_id, t.assigned_to, t.project_id, p.created_by as project_creator
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE t.id = $1`,
      [taskId]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const task = taskResult.rows[0];

    if (task.tenant_id !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Access control: Regular users can only update tasks in their own projects or tasks assigned to them
    if (role === 'user' && task.project_creator !== userId && task.assigned_to !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update tasks in your own projects or tasks assigned to you.'
      });
    }

    // Update status
    const result = await query(
      'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING id, status, updated_at',
      [status, taskId]
    );

    await logAudit(tenantId, userId, 'UPDATE_TASK_STATUS', 'task', taskId, req.ip);

    res.status(200).json({
      success: true,
      data: {
        id: result.rows[0].id,
        status: result.rows[0].status,
        updatedAt: result.rows[0].updated_at
      }
    });

  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task status'
    });
  }
};

// API 19: Update Task
const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, priority, assignedTo, dueDate } = req.body;
    const { tenantId, userId } = req.user;

    // Verify task belongs to tenant
    const taskResult = await query(
      'SELECT id, tenant_id FROM tasks WHERE id = $1',
      [taskId]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const task = taskResult.rows[0];

    if (task.tenant_id !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // If assignedTo provided, verify user belongs to same tenant
    if (assignedTo !== undefined && assignedTo !== null) {
      const userCheck = await query(
        'SELECT id FROM users WHERE id = $1 AND tenant_id = $2',
        [assignedTo, task.tenant_id]
      );

      if (userCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user not found in tenant'
        });
      }
    }

    // Build update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }

    if (status !== undefined) {
      if (!['todo', 'in_progress', 'completed'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }

    if (priority !== undefined) {
      if (!['low', 'medium', 'high'].includes(priority)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid priority'
        });
      }
      updates.push(`priority = $${paramCount++}`);
      values.push(priority);
    }

    if (assignedTo !== undefined) {
      updates.push(`assigned_to = $${paramCount++}`);
      values.push(assignedTo);
    }

    if (dueDate !== undefined) {
      updates.push(`due_date = $${paramCount++}`);
      values.push(dueDate);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(taskId);
    const result = await query(
      `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${paramCount}
       RETURNING id, title, description, status, priority, assigned_to, due_date, updated_at`,
      values
    );

    // Get assigned user info
    let assignedUser = null;
    if (result.rows[0].assigned_to) {
      const userResult = await query(
        'SELECT id, full_name, email FROM users WHERE id = $1',
        [result.rows[0].assigned_to]
      );
      if (userResult.rows.length > 0) {
        assignedUser = {
          id: userResult.rows[0].id,
          fullName: userResult.rows[0].full_name,
          email: userResult.rows[0].email
        };
      }
    }

    await logAudit(tenantId, userId, 'UPDATE_TASK', 'task', taskId, req.ip);

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: {
        id: result.rows[0].id,
        title: result.rows[0].title,
        description: result.rows[0].description,
        status: result.rows[0].status,
        priority: result.rows[0].priority,
        assignedTo: assignedUser,
        dueDate: result.rows[0].due_date,
        updatedAt: result.rows[0].updated_at
      }
    });

  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task'
    });
  }
};

// API 20: Delete Task
const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { tenantId, userId, role } = req.user;

    // Verify task and owning tenant
    const taskResult = await query(
      `SELECT t.id, t.tenant_id, t.assigned_to, p.created_by as project_creator
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE t.id = $1`,
      [taskId]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const task = taskResult.rows[0];

    if (task.tenant_id !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Access control: regular users can delete only tasks in projects they created or tasks assigned to them
    if (role === 'user' && task.project_creator !== userId && task.assigned_to !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete tasks in your projects or tasks assigned to you.'
      });
    }

    await query('DELETE FROM tasks WHERE id = $1', [taskId]);
    await logAudit(tenantId, userId, 'DELETE_TASK', 'task', taskId, req.ip);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task'
    });
  }
};

module.exports = {
  createTask,
  listTasks,
  updateTaskStatus,
  updateTask,
  deleteTask
};
