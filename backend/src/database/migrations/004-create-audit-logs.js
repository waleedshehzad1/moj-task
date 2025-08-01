'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AuditLogs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      action: {
        type: Sequelize.STRING,
        allowNull: false
      },
      resource: {
        type: Sequelize.STRING,
        allowNull: false
      },
      resourceId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      changes: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {}
      },
      ipAddress: {
        type: Sequelize.STRING,
        allowNull: true
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      success: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      errorMessage: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for audit log queries
    await queryInterface.addIndex('AuditLogs', ['userId'], {
      name: 'audit_logs_user_id_idx'
    });
    
    await queryInterface.addIndex('AuditLogs', ['action'], {
      name: 'audit_logs_action_idx'
    });
    
    await queryInterface.addIndex('AuditLogs', ['resource'], {
      name: 'audit_logs_resource_idx'
    });
    
    await queryInterface.addIndex('AuditLogs', ['resourceId'], {
      name: 'audit_logs_resource_id_idx'
    });
    
    await queryInterface.addIndex('AuditLogs', ['createdAt'], {
      name: 'audit_logs_created_at_idx'
    });
    
    await queryInterface.addIndex('AuditLogs', ['ipAddress'], {
      name: 'audit_logs_ip_address_idx'
    });
    
    // Composite indexes for common audit queries
    await queryInterface.addIndex('AuditLogs', ['userId', 'action'], {
      name: 'audit_logs_user_action_idx'
    });
    
    await queryInterface.addIndex('AuditLogs', ['resource', 'action'], {
      name: 'audit_logs_resource_action_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('AuditLogs');
  }
};
