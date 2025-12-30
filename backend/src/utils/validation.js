// Input validation helper functions

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // At least 8 characters, one uppercase, one lowercase, one number, one special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

const validateSubdomain = (subdomain) => {
  // Alphanumeric, hyphens allowed but not at start/end, 3-63 chars
  const subdomainRegex = /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/;
  return subdomainRegex.test(subdomain);
};

const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
};

const validateEnum = (value, allowedValues, fieldName) => {
  if (!allowedValues.includes(value)) {
    return `${fieldName} must be one of: ${allowedValues.join(', ')}`;
  }
  return null;
};

module.exports = {
  validateEmail,
  validatePassword,
  validateSubdomain,
  validateRequired,
  validateEnum
};
