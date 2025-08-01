'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create audit_logs table for comprehensive audit trail
    await queryInterface.createTable('audit_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      entity_type: {
        type: Sequelize.STRING(50),
        allowNull: false, // 'user', 'task', 'system'
        comment: 'Type of entity being audited'
      },
      entity_id: {
        type: Sequelize.UUID,
        allowNull: true,
        comment: 'ID of the entity being audited'
      },
      action: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Action performed (CREATE, UPDATE, DELETE, LOGIN, etc.)'
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        comment: 'User who performed the action'
      },
      ip_address: {
        type: Sequelize.INET,
        allowNull: true,
        comment: 'IP address of the user'
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'User agent string'
      },
      old_values: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Previous values before change'
      },
      new_values: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'New values after change'
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
        comment: 'Additional metadata about the action'
      },
      severity: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'critical'),
        allowNull: false,
        defaultValue: 'low',
        comment: 'Severity level of the action'
      },
      session_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Session ID for tracking user sessions'
      },
      request_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Request ID for tracing'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes for audit_logs table
    await queryInterface.addIndex('audit_logs', ['entity_type']);
    await queryInterface.addIndex('audit_logs', ['entity_id']);
    await queryInterface.addIndex('audit_logs', ['action']);
    await queryInterface.addIndex('audit_logs', ['user_id']);
    await queryInterface.addIndex('audit_logs', ['created_at']);
    await queryInterface.addIndex('audit_logs', ['severity']);
    await queryInterface.addIndex('audit_logs', ['session_id']);
    await queryInterface.addIndex('audit_logs', ['request_id']);

    // Composite indexes for common audit queries
    await queryInterface.addIndex('audit_logs', ['entity_type', 'action']);
    await queryInterface.addIndex('audit_logs', ['user_id', 'created_at']);
    await queryInterface.addIndex('audit_logs', ['entity_id', 'created_at']);

    // Create API keys table for service-to-service authentication
    await queryInterface.createTable('api_keys', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Human readable name for the API key'
      },
      key_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
        comment: 'Hashed API key for security'
      },
      key_prefix: {
        type: Sequelize.STRING(10),
        allowNull: false,
        comment: 'Prefix of the API key for identification'
      },
      permissions: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
        defaultValue: [],
        comment: 'Array of permissions granted to this API key'
      },
      rate_limit: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1000,
        comment: 'Rate limit per hour for this API key'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether the API key is active'
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Expiration date of the API key'
      },
      last_used_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Last time the API key was used'
      },
      usage_count: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0,
        comment: 'Number of times the API key has been used'
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment: 'User who created the API key'
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
        comment: 'Additional metadata about the API key'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Add indexes for api_keys table
    await queryInterface.addIndex('api_keys', ['key_hash']);
    await queryInterface.addIndex('api_keys', ['key_prefix']);
    await queryInterface.addIndex('api_keys', ['is_active']);
    await queryInterface.addIndex('api_keys', ['expires_at']);
    await queryInterface.addIndex('api_keys', ['created_by']);
    await queryInterface.addIndex('api_keys', ['created_at']);
    await queryInterface.addIndex('api_keys', ['deleted_at']);

    // Create user_sessions table for JWT token management
    await queryInterface.createTable('user_sessions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      session_token: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
        comment: 'JWT session token'
      },
      refresh_token: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
        comment: 'JWT refresh token'
      },
      ip_address: {
        type: Sequelize.INET,
        allowNull: true,
        comment: 'IP address when session was created'
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'User agent when session was created'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether the session is active'
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'When the session expires'
      },
      last_activity: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: 'Last activity timestamp'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes for user_sessions table
    await queryInterface.addIndex('user_sessions', ['user_id']);
    await queryInterface.addIndex('user_sessions', ['session_token']);
    await queryInterface.addIndex('user_sessions', ['refresh_token']);
    await queryInterface.addIndex('user_sessions', ['is_active']);
    await queryInterface.addIndex('user_sessions', ['expires_at']);
    await queryInterface.addIndex('user_sessions', ['last_activity']);
    await queryInterface.addIndex('user_sessions', ['created_at']);

    // Composite index for session cleanup
    await queryInterface.addIndex('user_sessions', ['is_active', 'expires_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_sessions');
    await queryInterface.dropTable('api_keys');
    await queryInterface.dropTable('audit_logs');
  }
};
