'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('Admin123!@#', 12);
    const managerPassword = await bcrypt.hash('Manager123!@#', 12);
    const caseworkerPassword = await bcrypt.hash('Caseworker123!@#', 12);
    const viewerPassword = await bcrypt.hash('Viewer123!@#', 12);

    await queryInterface.bulkInsert('users', [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        username: 'admin',
        email: 'admin@hmcts.gov.uk',
        password_hash: hashedPassword,
        first_name: 'System',
        last_name: 'Administrator',
        role: 'admin',
        department: 'IT',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        username: 'manager1',
        email: 'manager@hmcts.gov.uk',
        password_hash: managerPassword,
        first_name: 'Task',
        last_name: 'Manager',
        role: 'manager',
        department: 'Case Management',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        username: 'jsmith',
        email: 'caseworker1@hmcts.gov.uk',
        password_hash: caseworkerPassword,
        first_name: 'John',
        last_name: 'Smith',
        role: 'caseworker',
        department: 'Case Management',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        username: 'sjones',
        email: 'caseworker2@hmcts.gov.uk',
        password_hash: caseworkerPassword,
        first_name: 'Sarah',
        last_name: 'Jones',
        role: 'caseworker',
        department: 'Case Management',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        username: 'viewer1',
        email: 'viewer@hmcts.gov.uk',
        password_hash: viewerPassword,
        first_name: 'Read',
        last_name: 'Only',
        role: 'viewer',
        department: 'Audit',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
