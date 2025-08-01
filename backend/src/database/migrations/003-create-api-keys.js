'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ApiKeys', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: [1, 255]
        }
      },
      keyHash: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      keyPrefix: {
        type: Sequelize.STRING(8),
        allowNull: false
      },
      permissions: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
        defaultValue: ['read']
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      lastUsedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      usageCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      rateLimit: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1000
      },
      allowedIps: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {}
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
    await queryInterface.addIndex('ApiKeys', ['keyHash'], {
      unique: true,
      name: 'api_keys_key_hash_unique_idx'
    });
    
    await queryInterface.addIndex('ApiKeys', ['keyPrefix'], {
      name: 'api_keys_key_prefix_idx'
    });
    
    await queryInterface.addIndex('ApiKeys', ['isActive'], {
      name: 'api_keys_is_active_idx'
    });
    
    await queryInterface.addIndex('ApiKeys', ['expiresAt'], {
      name: 'api_keys_expires_at_idx'
    });
    
    await queryInterface.addIndex('ApiKeys', ['createdBy'], {
      name: 'api_keys_created_by_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ApiKeys');
  }
};
