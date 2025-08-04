#!/usr/bin/env node

// Simple Node.js test database setup script
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Set environment variables
process.env.NODE_ENV = 'test';
process.env.DB_NAME_TEST = process.env.DB_NAME_TEST || 'hmcts_tasks_test';
process.env.DB_USERNAME = process.env.DB_USERNAME || 'postgres';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';

console.log('Setting up test database...');

// PostgreSQL paths to try
const pgPaths = [
  '/opt/homebrew/Cellar/postgresql@15/15.13/bin',
  '/opt/homebrew/bin',
  '/usr/local/bin',
  '/usr/bin'
];

function findPgCommand(cmd) {
  for (const pgPath of pgPaths) {
    const fullPath = path.join(pgPath, cmd);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }
  return cmd; // fallback to system PATH
}

try {
  const psql = findPgCommand('psql');
  const createdb = findPgCommand('createdb');
  const pgIsReady = findPgCommand('pg_isready');

  console.log(`Using PostgreSQL commands from: ${path.dirname(psql)}`);

  // Check if PostgreSQL is available
  try {
    execSync(`${pgIsReady} -h ${process.env.DB_HOST} -p ${process.env.DB_PORT}`, { stdio: 'pipe' });
    console.log('✓ PostgreSQL is running');
  } catch (error) {
    console.log('⚠️  Warning: PostgreSQL not detected or not running');
    console.log('   Please ensure PostgreSQL is running and accessible');
    console.log('   You can start it with: brew services start postgresql@15');
    return;
  }

  // Create test database if it doesn't exist
  console.log('Creating test database if it doesn\'t exist...');
  try {
    execSync(
      `${createdb} -h ${process.env.DB_HOST} -p ${process.env.DB_PORT} -U ${process.env.DB_USERNAME} ${process.env.DB_NAME_TEST}`,
      { stdio: 'pipe' }
    );
    console.log('✓ Test database created successfully');
  } catch (error) {
    // Check if database already exists
    try {
      execSync(
        `${psql} -h ${process.env.DB_HOST} -p ${process.env.DB_PORT} -U ${process.env.DB_USERNAME} -d ${process.env.DB_NAME_TEST} -c "SELECT 1;"`,
        { stdio: 'pipe' }
      );
      console.log('✓ Test database already exists');
    } catch (checkError) {
      console.log('✗ Failed to create or access test database');
      console.log('   Error:', error.message);
      console.log('   Please ensure you have proper PostgreSQL permissions');
    }
  }

  // Run migrations for test database
  console.log('Running migrations...');
  try {
    execSync('npx sequelize-cli db:migrate', { 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'test' }
    });
    console.log('✓ Migrations completed successfully');
  } catch (error) {
    console.log('⚠️  Migration may have failed:', error.message);
    console.log('   This might be okay if migrations have already been run');
  }

  console.log('\n✓ Test database setup completed!');
} catch (error) {
  console.error('✗ Error setting up test database:', error.message);
  console.log('\nTroubleshooting:');
  console.log('1. Ensure PostgreSQL is installed: brew install postgresql@15');
  console.log('2. Start PostgreSQL: brew services start postgresql@15');
  console.log('3. Check if you can connect: psql postgres');
  console.log('\nContinuing with tests - they may fail if database is not properly set up');
}
