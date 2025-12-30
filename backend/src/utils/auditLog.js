const { query } = require('../config/database');

// Log action to audit_logs table
const logAudit = async (tenantId, userId, action, entityType, entityId, ipAddress = null, metadata = null) => {
  try {
    await query(
      `INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id, ip_address, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [tenantId, userId, action, entityType, entityId, ipAddress, metadata ? JSON.stringify(metadata) : null]
    );
  } catch (error) {
    console.error('Audit log error:', error);
    // Don't throw error - audit logging should not break the main operation
  }
};

module.exports = { logAudit };
