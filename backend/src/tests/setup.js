// Test setup file

// Set test environment first
process.env.NODE_ENV = 'test';

const { sequelize } = require('../models');

// Global test setup
beforeAll(async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✓ Test database connection established');
    
    // Sync database schema (recreate tables)
    await sequelize.sync({ force: true });
    console.log('✓ Test database schema synchronized');
  } catch (error) {
    console.error('✗ Unable to connect to test database:', error.message);
    console.error('Please ensure PostgreSQL is running and test database exists');
    throw error;
  }
});

// Global test teardown
afterAll(async () => {
  try {
    await sequelize.close();
    console.log('✓ Test database connection closed');
  } catch (error) {
    console.error('✗ Error closing test database connection:', error);
  }
});

// Increase timeout for database operations
jest.setTimeout(30000);
