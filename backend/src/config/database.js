require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'hmcts_tasks_dev',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    pool: {
      max: 20,
      min: 2,
      acquire: 30000,
      idle: 300000, // 5 minutes instead of 10 seconds
      evict: 60000   // How often to check for idle connections
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    },
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  },
  test: {
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME_TEST || 'hmcts_tasks_test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 1,
      acquire: 30000,
      idle: 300000, // 5 minutes instead of 10 seconds
      evict: 60000   // How often to check for idle connections
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: false,
    pool: {
      max: 50,
      min: 5,
      acquire: 60000,
      idle: 600000, // 10 minutes for production
      evict: 120000  // How often to check for idle connections
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};
