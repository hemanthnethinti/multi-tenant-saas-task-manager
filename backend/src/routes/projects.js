const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  createProject,
  listProjects,
  updateProject,
  deleteProject
} = require('../controllers/projectController');

// All routes require authentication
router.use(authMiddleware);

router.post('/', createProject);
router.get('/', listProjects);
router.put('/:projectId', updateProject);
router.delete('/:projectId', deleteProject);

module.exports = router;
