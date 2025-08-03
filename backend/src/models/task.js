const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      comment: 'Unique identifier for the task'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Title cannot be empty'
        },
        len: {
          args: [1, 255],
          msg: 'Title must be between 1 and 255 characters'
        }
      },
      comment: 'Task title'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 2000],
          msg: 'Description cannot exceed 2000 characters'
        }
      },
      comment: 'Optional task description'
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: {
          args: [['pending', 'in_progress', 'completed', 'cancelled']],
          msg: 'Status must be one of: pending, in_progress, completed, cancelled'
        }
      },
      comment: 'Current status of the task'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'medium',
      validate: {
        isIn: {
          args: [['low', 'medium', 'high', 'urgent']],
          msg: 'Priority must be one of: low, medium, high, urgent'
        }
      },
      comment: 'Task priority level'
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: {
          msg: 'Due date must be a valid date'
        },
        isAfter: {
          args: new Date().toISOString().split('T')[0],
          msg: 'Due date must be in the future'
        }
      },
      comment: 'Task due date and time'
    },
    assigned_to: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      comment: 'ID of the caseworker assigned to this task'
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      comment: 'ID of the user who created this task'
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp when the task was completed'
    },
    estimated_hours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: {
          args: [0],
          msg: 'Estimated hours cannot be negative'
        },
        max: {
          args: [999.99],
          msg: 'Estimated hours cannot exceed 999.99'
        }
      },
      comment: 'Estimated time to complete the task in hours'
    },
    actual_hours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: {
          args: [0],
          msg: 'Actual hours cannot be negative'
        },
        max: {
          args: [999.99],
          msg: 'Actual hours cannot exceed 999.99'
        }
      },
      comment: 'Actual time spent on the task in hours'
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
      comment: 'Array of tags for categorizing tasks'
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Additional metadata for the task'
    },
    is_archived: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether the task is archived'
    },
    archived_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp when the task was archived'
    }
  }, {
    tableName: 'tasks',
    timestamps: true,
    underscored: true,
    paranoid: true, // Soft deletes
    indexes: [
      {
        fields: ['status']
      },
      {
        fields: ['priority']
      },
      {
        fields: ['due_date']
      },
      {
        fields: ['assigned_to']
      },
      {
        fields: ['created_by']
      },
      {
        fields: ['is_archived']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['updated_at']
      },
      // Composite indexes for common queries
      {
        fields: ['status', 'priority']
      },
      {
        fields: ['assigned_to', 'status']
      },
      {
        fields: ['due_date', 'status']
      }
    ],
    hooks: {
      beforeUpdate: (task, options) => {
        // Automatically set completed_at when status changes to completed
        if (task.changed('status') && task.status === 'completed' && !task.completed_at) {
          task.completed_at = new Date();
        }
        
        // Clear completed_at if status changes from completed
        if (task.changed('status') && task.status !== 'completed' && task.completed_at) {
          task.completed_at = null;
        }

        // Set archived_at when is_archived changes to true
        if (task.changed('is_archived') && task.is_archived && !task.archived_at) {
          task.archived_at = new Date();
        }

        // Clear archived_at when is_archived changes to false
        if (task.changed('is_archived') && !task.is_archived && task.archived_at) {
          task.archived_at = null;
        }
      },
      beforeCreate: (task, options) => {
        // Set completed_at if status is completed
        if (task.status === 'completed' && !task.completed_at) {
          task.completed_at = new Date();
        }

        // Set archived_at if is_archived is true
        if (task.is_archived && !task.archived_at) {
          task.archived_at = new Date();
        }
      }
    }
  });

  // Instance methods
  Task.prototype.toJSON = function() {
    const values = { ...this.get() };
    
    // Remove sensitive or internal fields if needed
    if (values.deleted_at) {
      delete values.deleted_at;
    }
    
    return values;
  };

  Task.prototype.isOverdue = function() {
    return new Date() > this.due_date && this.status !== 'completed';
  };

  Task.prototype.getDaysUntilDue = function() {
    const now = new Date();
    const diffTime = this.due_date.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  Task.prototype.canBeDeleted = function() {
    return ['pending', 'cancelled'].includes(this.status);
  };

  Task.prototype.canBeModified = function() {
    return this.status !== 'completed' && !this.is_archived;
  };

  // Class methods
  Task.findByStatus = function(status, options = {}) {
    return this.findAll({
      where: { status, is_archived: false },
      ...options
    });
  };

  Task.findOverdue = function(options = {}) {
    return this.findAll({
      where: {
        due_date: { [sequelize.Sequelize.Op.lt]: new Date() },
        status: { [sequelize.Sequelize.Op.ne]: 'completed' },
        is_archived: false
      },
      ...options
    });
  };

  Task.findByAssignee = function(assigneeId, options = {}) {
    return this.findAll({
      where: { assigned_to: assigneeId, is_archived: false },
      ...options
    });
  };

  Task.getStatusCounts = function() {
    return this.findAll({
      attributes: [
        'status',
        [sequelize.Sequelize.fn('COUNT', sequelize.Sequelize.col('id')), 'count']
      ],
      where: { is_archived: false },
      group: ['status'],
      raw: true
    });
  };

  return Task;
};
