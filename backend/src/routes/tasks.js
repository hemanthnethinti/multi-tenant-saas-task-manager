const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  createTask,
  listTasks,
  updateTaskStatus,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

// All routes require authentication
router.use(authMiddleware);

// Project tasks
router.post('/projects/:projectId/tasks', createTask);
router.get('/projects/:projectId/tasks', listTasks);

// Task operations
router.patch('/:taskId/status', updateTaskStatus);
router.put('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);

module.exports = router;
