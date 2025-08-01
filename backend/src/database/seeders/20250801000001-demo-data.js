'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create default users
    const users = [
      {
        id: uuidv4(),
        email: 'admin@hmcts.gov.uk',
        username: 'admin',
        password_hash: await bcrypt.hash('Admin123!@#', 12),
        first_name: 'System',
        last_name: 'Administrator',
        role: 'admin',
        is_active: true,
        email_verified: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        email: 'manager@hmcts.gov.uk',
        username: 'manager',
        password_hash: await bcrypt.hash('Manager123!@#', 12),
        first_name: 'Case',
        last_name: 'Manager',
        role: 'manager',
        is_active: true,
        email_verified: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        email: 'caseworker1@hmcts.gov.uk',
        username: 'caseworker1',
        password_hash: await bcrypt.hash('Caseworker123!@#', 12),
        first_name: 'Jane',
        last_name: 'Smith',
        role: 'caseworker',
        is_active: true,
        email_verified: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        email: 'caseworker2@hmcts.gov.uk',
        username: 'caseworker2',
        password_hash: await bcrypt.hash('Caseworker123!@#', 12),
        first_name: 'John',
        last_name: 'Doe',
        role: 'caseworker',
        is_active: true,
        email_verified: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        email: 'viewer@hmcts.gov.uk',
        username: 'viewer',
        password_hash: await bcrypt.hash('Viewer123!@#', 12),
        first_name: 'Mary',
        last_name: 'Johnson',
        role: 'viewer',
        is_active: true,
        email_verified: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('users', users);

    // Get the created users for task assignment
    const [adminUser] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE username = 'admin' LIMIT 1`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const [managerUser] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE username = 'manager' LIMIT 1`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const [caseworker1] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE username = 'caseworker1' LIMIT 1`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const [caseworker2] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE username = 'caseworker2' LIMIT 1`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Create sample tasks
    const tasks = [
      {
        id: uuidv4(),
        title: 'Review case documentation for Family Court hearing',
        description: 'Review and analyze all submitted documents for the upcoming Family Court hearing scheduled for next week. Ensure all required documentation is present and properly formatted.',
        status: 'pending',
        priority: 'high',
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        assigned_to: caseworker1.id,
        created_by: managerUser.id,
        estimated_hours: 4.5,
        tags: ['family-court', 'documentation', 'hearing'],
        metadata: {
          case_number: 'FC-2024-001',
          court_location: 'Central Family Court',
          hearing_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        title: 'Process divorce application - Application ID: DIV-2024-789',
        description: 'Complete the processing of divorce application including verification of documents, background checks, and preparation of court orders.',
        status: 'in_progress',
        priority: 'medium',
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        assigned_to: caseworker2.id,
        created_by: managerUser.id,
        estimated_hours: 6.0,
        actual_hours: 2.5,
        tags: ['divorce', 'application', 'processing'],
        metadata: {
          application_id: 'DIV-2024-789',
          applicant_name: 'Jane Doe',
          case_type: 'uncontested_divorce'
        },
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        title: 'Urgent: Emergency custody order review',
        description: 'Immediate review required for emergency custody order. Time-sensitive case requiring immediate attention and processing.',
        status: 'pending',
        priority: 'urgent',
        due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        assigned_to: caseworker1.id,
        created_by: adminUser.id,
        estimated_hours: 3.0,
        tags: ['emergency', 'custody', 'urgent', 'child-protection'],
        metadata: {
          case_number: 'EM-2024-012',
          child_age: 8,
          emergency_level: 'high',
          social_worker_contact: 'sarah.jones@localauthority.gov.uk'
        },
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        title: 'Complete monthly court statistics report',
        description: 'Compile and analyze monthly statistics for court proceedings, including case completion rates, processing times, and resource utilization.',
        status: 'completed',
        priority: 'low',
        due_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        assigned_to: caseworker2.id,
        created_by: managerUser.id,
        completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // completed 1 day ago
        estimated_hours: 4.0,
        actual_hours: 3.5,
        tags: ['statistics', 'report', 'monthly', 'analysis'],
        metadata: {
          report_period: '2024-07',
          total_cases: 156,
          completion_rate: 89.5
        },
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        id: uuidv4(),
        title: 'Update case management system with new court rules',
        description: 'Implement the latest court procedural rules into the case management system. Update workflows and validation rules accordingly.',
        status: 'pending',
        priority: 'medium',
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        assigned_to: null, // Unassigned
        created_by: adminUser.id,
        estimated_hours: 8.0,
        tags: ['system-update', 'court-rules', 'workflow'],
        metadata: {
          rule_version: '2024.2',
          affected_workflows: ['divorce', 'family', 'civil'],
          implementation_deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString()
        },
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        title: 'Cancelled: Legacy system migration - Phase 1',
        description: 'Initial phase of migrating data from legacy court system. This task was cancelled due to budget constraints and rescheduled for next quarter.',
        status: 'cancelled',
        priority: 'high',
        due_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // was due 7 days ago
        assigned_to: caseworker1.id,
        created_by: adminUser.id,
        estimated_hours: 12.0,
        actual_hours: 4.0,
        tags: ['migration', 'legacy', 'cancelled', 'data-transfer'],
        metadata: {
          cancellation_reason: 'Budget constraints',
          rescheduled_for: 'Q4 2024',
          migration_scope: 'civil_cases_2020_2023'
        },
        created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
        updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    ];

    await queryInterface.bulkInsert('tasks', tasks);

    // Create sample API keys for testing
    const apiKeys = [
      {
        id: uuidv4(),
        name: 'Development API Key',
        key_hash: await bcrypt.hash('dev-api-key-12345678901234567890', 12),
        key_prefix: 'dev_',
        permissions: ['tasks:read', 'tasks:write'],
        rate_limit: 1000,
        is_active: true,
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        created_by: adminUser.id,
        metadata: {
          environment: 'development',
          purpose: 'API testing and development'
        },
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'External Integration API Key',
        key_hash: await bcrypt.hash('ext-api-key-abcdefghijklmnopqrstuvwxyz', 12),
        key_prefix: 'ext_',
        permissions: ['tasks:read'],
        rate_limit: 500,
        is_active: true,
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        created_by: adminUser.id,
        metadata: {
          environment: 'production',
          purpose: 'External system integration',
          external_system: 'Court Management System'
        },
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('api_keys', apiKeys);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('api_keys', null, {});
    await queryInterface.bulkDelete('tasks', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};
