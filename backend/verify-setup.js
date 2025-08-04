#!/usr/bin/env node

// Quick test to verify Jest setup without database
console.log('Running basic setup verification...');

try {
  // Test 1: Check if Jest config is valid
  const jestConfig = require('./jest.config.js');
  console.log('✓ Jest configuration is valid');
  
  // Test 2: Check if models can be imported (without database connection)
  process.env.NODE_ENV = 'test';
  process.env.DB_HOST = 'nonexistent'; // Force connection to fail
  
  try {
    const models = require('./src/models');
    console.log('✓ Models can be imported');
  } catch (error) {
    if (error.message.includes('ENOTFOUND') || error.message.includes('connect')) {
      console.log('✓ Models import correctly (database connection expected to fail in this test)');
    } else {
      throw error;
    }
  }
  
  // Test 3: Check if test files exist
  const fs = require('fs');
  const testFiles = [
    './src/tests/models/task.test.js',
    './src/tests/controllers/taskController.test.js'
  ];
  
  testFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✓ Test file exists: ${file}`);
    } else {
      console.log(`✗ Test file missing: ${file}`);
    }
  });
  
  console.log('\n✓ Basic setup verification completed');
  console.log('To run full tests: npm test');
  console.log('Note: PostgreSQL database must be running for full tests');
  
} catch (error) {
  console.error('✗ Setup verification failed:', error.message);
  process.exit(1);
}
