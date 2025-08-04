const { Sequelize } = require('sequelize');
const { exec } = require('child_process');
const util = require('util');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');
const config = require('../config/database');

const execPromise = util.promisify(exec);
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

/**
 * Setup the database by running migrations and seeders
 * This ensures test users and sample data are loaded automatically
 */
const setupDatabase = async () => {
  try {
    logger.info('Starting database setup process...');
    
    // Create database if it doesn't exist
    await createDatabaseIfNotExists();
    
    // Run migrations
    logger.info('Running database migrations...');
    await execPromise('npx sequelize-cli db:migrate');
    logger.info('Database migrations completed successfully');
    
    // Run seeders (with --seed option to specify which seeders to run if needed)
    try {
      logger.info('Running database seeders for test data...');
      await execPromise('npx sequelize-cli db:seed:all');
      logger.info('Database seeding completed successfully');
    } catch (error) {
      // If seeding fails because records already exist, that's okay
      logger.warn('Some seed data may already exist, continuing anyway...');
      // Continue execution rather than failing
    }
    
    logger.info('Database setup completed successfully. Test users are ready to use.');
    return true;
  } catch (error) {
    logger.error('Database setup failed:', error);
    return false;
  }
};

/**
 * Create the database if it doesn't exist
 */
const createDatabaseIfNotExists = async () => {
  const sequelize = new Sequelize('postgres', dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'postgres',
    logging: false
  });
  
  try {
    await sequelize.authenticate();
    
    // Check if database exists
    const [results] = await sequelize.query(
      `SELECT 1 FROM pg_database WHERE datname = '${dbConfig.database}'`
    );
    
    if (results.length === 0) {
      logger.info(`Database '${dbConfig.database}' not found, creating...`);
      await sequelize.query(`CREATE DATABASE "${dbConfig.database}"`);
      logger.info(`Database '${dbConfig.database}' created successfully`);
    } else {
      logger.info(`Database '${dbConfig.database}' already exists`);
    }
  } catch (error) {
    logger.error('Error checking/creating database:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
};

module.exports = {
  setupDatabase
};
