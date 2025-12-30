// Role-based authorization middleware
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

// Check if user has access to specific tenant
const checkTenantAccess = (req, res, next) => {
  const { tenantId } = req.params;
  
  // Super admin can access any tenant
  if (req.user.role === 'super_admin') {
    return next();
  }

  // Regular users and tenant admins can only access their own tenant
  if (req.user.tenantId !== tenantId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Cannot access other tenant data.'
    });
  }

  next();
};

module.exports = {
  authorize,
  checkTenantAccess
};
