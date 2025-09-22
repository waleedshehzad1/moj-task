const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

// User model: authentication/authorization principal. Password hashes are stored
// in password_hash with strong bcrypt salting. Soft-deletes enabled (paranoid).
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      comment: 'Unique identifier for the user'
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: 'Must be a valid email address'
        },
        len: {
          args: [1, 255],
          msg: 'Email must be between 1 and 255 characters'
        }
      },
      comment: 'User email address (unique)'
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        len: {
          args: [3, 100],
          msg: 'Username must be between 3 and 100 characters'
        },
        isAlphanumeric: {
          msg: 'Username can only contain letters and numbers'
        }
      },
      comment: 'Unique username'
    },
  // Stored as bcrypt hash; never exposed via toJSON
  password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Hashed password'
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: {
          args: [1, 100],
          msg: 'First name must be between 1 and 100 characters'
        }
      },
      comment: 'User first name'
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: {
          args: [1, 100],
          msg: 'Last name must be between 1 and 100 characters'
        }
      },
      comment: 'User last name'
    },
    role: {
      type: DataTypes.ENUM('admin', 'manager', 'caseworker', 'viewer'),
      allowNull: false,
      defaultValue: 'caseworker',
      validate: {
        isIn: {
          args: [['admin', 'manager', 'caseworker', 'viewer']],
          msg: 'Role must be one of: admin, manager, caseworker, viewer'
        }
      },
      comment: 'User role for authorization'
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'User department'
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: {
          args: /^[\+]?[0-9\-\(\)\s]+$/,
          msg: 'Phone number must be valid'
        }
      },
      comment: 'User phone number'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether the user account is active'
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Last login timestamp'
    },
    password_changed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When password was last changed'
    },
    failed_login_attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Number of failed login attempts'
    },
    locked_until: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Account locked until this timestamp'
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether email has been verified'
    },
    email_verification_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Token for email verification'
    },
    password_reset_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Token for password reset'
    },
    password_reset_expires: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Password reset token expiry'
    },
    preferences: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'User preferences and settings'
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Additional user metadata'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    paranoid: true, // Soft deletes
    indexes: [
      {
        fields: ['email'],
        unique: true
      },
      {
        fields: ['username'],
        unique: true
      },
      {
        fields: ['role']
      },
      {
        fields: ['department']
      },
      {
        fields: ['is_active']
      },
      {
        fields: ['email_verified']
      },
      {
        fields: ['last_login']
      }
    ],
    hooks: {
      beforeCreate: async (user) => {
        if (user.password_hash) {
          user.password_hash = await bcrypt.hash(user.password_hash, parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12);
          user.password_changed_at = new Date();
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password_hash')) {
          user.password_hash = await bcrypt.hash(user.password_hash, parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12);
          user.password_changed_at = new Date();
          user.failed_login_attempts = 0;
          user.locked_until = null;
        }
      }
    }
  });

  // Instance methods
  // Redacts sensitive columns when serializing to API responses
  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    
    // Remove sensitive fields
    delete values.password_hash;
    delete values.email_verification_token;
    delete values.password_reset_token;
    delete values.password_reset_expires;
    delete values.failed_login_attempts;
    delete values.locked_until;
    delete values.deleted_at;
    
    return values;
  };

  // Compares plaintext password with bcrypt hash
  User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password_hash);
  };

  // Lockout guard to throttle brute-force attacks
  User.prototype.isLocked = function() {
    return this.locked_until && this.locked_until > new Date();
  };

  // Increment failure counter and set 30m lock when threshold reached
  User.prototype.incrementFailedLogins = async function() {
    this.failed_login_attempts += 1;
    
    // Lock account after 5 failed attempts for 30 minutes
    if (this.failed_login_attempts >= 5) {
      this.locked_until = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    }
    
    await this.save();
  };

  // Clear lock/failed counters on successful auth
  User.prototype.resetFailedLogins = async function() {
    this.failed_login_attempts = 0;
    this.locked_until = null;
    this.last_login = new Date();
    await this.save();
  };

  User.prototype.getFullName = function() {
    return `${this.first_name} ${this.last_name}`;
  };

  // Coarse-grained RBAC mapping used by requirePermission()
  User.prototype.hasPermission = function(permission) {
    const rolePermissions = {
      admin: ['create', 'read', 'update', 'delete', 'manage_users', 'view_reports'],
      manager: ['create', 'read', 'update', 'delete', 'view_reports'],
      caseworker: ['create', 'read', 'update'],
      viewer: ['read']
    };

    return rolePermissions[this.role]?.includes(permission) || false;
  };

  User.prototype.canModifyTask = function(task) {
    if (this.role === 'admin') return true;
    if (this.role === 'manager') return true;
    if (task.assigned_to === this.id) return true;
    if (task.created_by === this.id) return true;
    return false;
  };

  // Class methods
  User.findByEmail = function(email) {
    return this.findOne({ where: { email: email.toLowerCase() } });
  };

  User.findByUsername = function(username) {
    return this.findOne({ where: { username: username.toLowerCase() } });
  };

  User.findActive = function(options = {}) {
    return this.findAll({
      where: { is_active: true },
      ...options
    });
  };

  User.findByRole = function(role, options = {}) {
    return this.findAll({
      where: { role, is_active: true },
      ...options
    });
  };

  return User;
};
