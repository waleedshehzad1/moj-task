'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('Admin123!@#', 12);
    const managerPassword = await bcrypt.hash('Manager123!@#', 12);
    const caseworkerPassword = await bcrypt.hash('Caseworker123!@#', 12);
    const viewerPassword = await bcrypt.hash('Viewer123!@#', 12);

    await queryInterface.bulkInsert('Users', [
      {
        email: 'admin@hmcts.gov.uk',
        password: hashedPassword,
        firstName: 'System',
        lastName: 'Administrator',
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'manager@hmcts.gov.uk',
        password: managerPassword,
        firstName: 'Task',
        lastName: 'Manager',
        role: 'manager',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'caseworker1@hmcts.gov.uk',
        password: caseworkerPassword,
        firstName: 'John',
        lastName: 'Smith',
        role: 'caseworker',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'caseworker2@hmcts.gov.uk',
        password: caseworkerPassword,
        firstName: 'Sarah',
        lastName: 'Jones',
        role: 'caseworker',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'viewer@hmcts.gov.uk',
        password: viewerPassword,
        firstName: 'Read',
        lastName: 'Only',
        role: 'viewer',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
