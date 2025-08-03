const { Sequelize } = require('sequelize');
const config = require('../config/database');
const logger = require('../utils/logger');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Initialize Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    ...dbConfig,
    logging: dbConfig.logging ? (msg) => logger.logDatabase('Query', 'all', { query: msg }) : false,
    benchmark: true,
    retry: {
      max: 3,
      match: [
        /ECONNRESET/,
        /ENOTFOUND/,
        /ECONNREFUSED/,
        /ETIMEDOUT/,
        /TimeoutError/
      ]
    },
    hooks: {
      beforeConnect: () => {
        logger.info('Attempting to connect to database...');
      },
      afterConnect: () => {
        logger.info('Database connection established successfully');
      },
      beforeDisconnect: () => {
        logger.info('Disconnecting from database...');
      },
      afterDisconnect: () => {
        logger.info('Database connection closed');
      }
    }
  }
);

// Import models
const Task = require('./task')(sequelize, Sequelize.DataTypes);
const User = require('./user')(sequelize, Sequelize.DataTypes);

// Define associations
const defineAssociations = () => {
  // User-Task associations
  User.hasMany(Task, {
    foreignKey: 'assigned_to',
    as: 'assignedTasks',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });

  Task.belongsTo(User, {
    foreignKey: 'assigned_to',
    as: 'assignee',
    allowNull: true
  });

  User.hasMany(Task, {
    foreignKey: 'created_by',
    as: 'createdTasks',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });

  Task.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'creator',
    allowNull: true
  });
};

// Initialize associations
defineAssociations();

// Database connection test
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully');
    return true;
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    return false;
  }
};

// Sync database
const syncDatabase = async (force = false) => {
  try {
    logger.info('Starting database synchronization...');
    
    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }

    // Sync models (don't alter since we use migrations)
    await sequelize.sync({ 
      force,
      alter: false // Disable alter since we use migrations
    });
    
    logger.info('Database synchronized successfully');
    return true;
  } catch (error) {
    logger.error('Database synchronization failed:', error);
    throw error;
  }
};

// Close database connection
const closeDatabase = async () => {
  try {
    await sequelize.close();
    logger.info('Database connection closed successfully');
  } catch (error) {
    logger.error('Error closing database connection:', error);
  }
};

// Export models and sequelize instance
const db = {
  sequelize,
  Sequelize,
  Task,
  User,
  testConnection,
  syncDatabase,
  closeDatabase
};

module.exports = db;
