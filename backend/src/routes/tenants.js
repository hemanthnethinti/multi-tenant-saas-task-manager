const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const {
  getTenantDetails,
  updateTenant,
  listAllTenants
} = require('../controllers/tenantController');

// All routes require authentication
router.use(authMiddleware);

// List all tenants (super_admin only)
router.get('/', authorize('super_admin'), listAllTenants);

// Get, update tenant
router.get('/:tenantId', getTenantDetails);
router.put('/:tenantId', updateTenant);

module.exports = router;
