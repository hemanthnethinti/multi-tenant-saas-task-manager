const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const {
  addUser,
  listUsers,
  updateUser,
  deleteUser
} = require('../controllers/userController');

// All routes require authentication
router.use(authMiddleware);

// Tenant user management
router.post('/tenants/:tenantId/users', authorize('tenant_admin'), addUser);
router.get('/tenants/:tenantId/users', listUsers);

// User operations
router.put('/:userId', updateUser);
router.delete('/:userId', authorize('tenant_admin'), deleteUser);

module.exports = router;
