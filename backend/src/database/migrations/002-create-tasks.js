'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Tasks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: [1, 255]
        }
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'in-progress', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'medium'
      },
      dueDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      assignedTo: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      completedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      tags: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: []
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {}
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });

    // Add indexes
    await queryInterface.addIndex('Tasks', ['status'], {
      name: 'tasks_status_idx'
    });
    
    await queryInterface.addIndex('Tasks', ['priority'], {
      name: 'tasks_priority_idx'
    });
    
    await queryInterface.addIndex('Tasks', ['assignedTo'], {
      name: 'tasks_assigned_to_idx'
    });
    
    await queryInterface.addIndex('Tasks', ['createdBy'], {
      name: 'tasks_created_by_idx'
    });
    
    await queryInterface.addIndex('Tasks', ['dueDate'], {
      name: 'tasks_due_date_idx'
    });
    
    await queryInterface.addIndex('Tasks', ['createdAt'], {
      name: 'tasks_created_at_idx'
    });
    
    // Composite indexes for common queries
    await queryInterface.addIndex('Tasks', ['status', 'assignedTo'], {
      name: 'tasks_status_assigned_to_idx'
    });
    
    await queryInterface.addIndex('Tasks', ['status', 'priority'], {
      name: 'tasks_status_priority_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Tasks');
  }
};
