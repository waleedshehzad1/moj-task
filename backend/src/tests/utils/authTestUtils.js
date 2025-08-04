const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../../models');

/**
 * Authentication utilities for testing
 */

/**
 * Create a test user with the specified role
 * @param {Object} userData - User data overrides 
 * @returns {Promise<Object>} Created user
 */
async function createTestUser(userData = {}) {
  const defaultData = {
    email: 'test@example.com',
    username: 'testuser',
    password: 'Password123!',
    first_name: 'Test',
    last_name: 'User',
    role: 'caseworker',
    is_active: true,
    email_verified: true
  };

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(userData.password || defaultData.password, salt);

  const mergedData = {
    ...defaultData,
    ...userData,
    password_hash
  };

  // Remove password from mergedData if present to avoid Sequelize validation errors
  delete mergedData.password;

  return User.create(mergedData);
}

/**
 * Generate a JWT token for testing
 * @param {Object} user - User object 
 * @returns {String} JWT token
 */
function generateTestToken(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    permissions: getRolePermissions(user.role)
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'test_jwt_secret',
    { 
      expiresIn: '1h',
      issuer: 'hmcts-task-api',
      audience: 'hmcts-task-frontend'
    }
  );
}

/**
 * Get default role permissions based on role
 * @param {String} role - User role
 * @returns {Array} List of permissions 
 */
function getRolePermissions(role) {
  const permissions = {
    admin: ['create', 'read', 'update', 'delete', 'admin'],
    manager: ['create', 'read', 'update', 'delete'],
    caseworker: ['create', 'read', 'update'],
    viewer: ['read']
  };

  return permissions[role] || [];
}

/**
 * Create a user and generate a test token
 * @param {Object} userData - User data overrides
 * @returns {Promise<Object>} User and token
 */
async function setupAuthUser(userData = {}) {
  const user = await createTestUser(userData);
  const token = generateTestToken(user);
  
  return { 
    user,
    token,
    authHeader: `Bearer ${token}`
  };
}

module.exports = {
  createTestUser,
  generateTestToken,
  getRolePermissions,
  setupAuthUser
};
