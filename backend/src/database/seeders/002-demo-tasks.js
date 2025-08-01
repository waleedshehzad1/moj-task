'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get user IDs for task assignment
    const users = await queryInterface.sequelize.query(
      'SELECT id, role FROM "Users" ORDER BY id',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const adminUser = users.find(u => u.role === 'admin');
    const managerUser = users.find(u => u.role === 'manager');
    const caseworkers = users.filter(u => u.role === 'caseworker');

    const tasks = [
      {
        title: 'Review Court Case #12345',
        description: 'Comprehensive review of court case documents and evidence for upcoming hearing',
        status: 'pending',
        priority: 'high',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        assignedTo: caseworkers[0]?.id,
        createdBy: managerUser?.id || adminUser?.id,
        tags: ['court-case', 'review', 'urgent'],
        metadata: {
          caseNumber: '12345',
          court: 'Crown Court',
          category: 'Criminal'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Prepare Legal Documents',
        description: 'Draft and prepare legal documentation for case submission',
        status: 'in-progress',
        priority: 'medium',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        assignedTo: caseworkers[1]?.id || caseworkers[0]?.id,
        createdBy: managerUser?.id || adminUser?.id,
        tags: ['documentation', 'legal', 'drafting'],
        metadata: {
          documentType: 'Legal Brief',
          pages: 15,
          category: 'Civil'
        },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        updatedAt: new Date()
      },
      {
        title: 'Schedule Court Hearing',
        description: 'Coordinate with court administration to schedule hearing date',
        status: 'completed',
        priority: 'high',
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        assignedTo: caseworkers[0]?.id,
        createdBy: adminUser?.id,
        completedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        tags: ['scheduling', 'court', 'coordination'],
        metadata: {
          hearingDate: '2025-08-15',
          courtroom: 'Room 3A',
          judge: 'Justice Williams'
        },
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
      },
      {
        title: 'Client Interview Session',
        description: 'Conduct comprehensive interview with client to gather case details',
        status: 'pending',
        priority: 'medium',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        assignedTo: caseworkers[1]?.id || caseworkers[0]?.id,
        createdBy: managerUser?.id || adminUser?.id,
        tags: ['interview', 'client', 'information-gathering'],
        metadata: {
          clientId: 'CLI001',
          estimatedDuration: '2 hours',
          location: 'Office'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Evidence Analysis Report',
        description: 'Analyze collected evidence and prepare comprehensive report',
        status: 'pending',
        priority: 'low',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        assignedTo: null, // Unassigned
        createdBy: adminUser?.id,
        tags: ['analysis', 'evidence', 'report'],
        metadata: {
          evidenceCount: 8,
          reportType: 'Forensic Analysis'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Update Case Management System',
        description: 'Update all case information in the central management system',
        status: 'in-progress',
        priority: 'low',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        assignedTo: caseworkers[0]?.id,
        createdBy: managerUser?.id || adminUser?.id,
        tags: ['system-update', 'data-entry', 'maintenance'],
        metadata: {
          systemName: 'CMS v2.1',
          recordsToUpdate: 45
        },
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        updatedAt: new Date()
      },
      {
        title: 'Urgent: File Emergency Motion',
        description: 'File emergency motion with court for case #67890 - time sensitive',
        status: 'pending',
        priority: 'urgent',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        assignedTo: caseworkers[1]?.id || caseworkers[0]?.id,
        createdBy: adminUser?.id,
        tags: ['emergency', 'motion', 'filing', 'urgent'],
        metadata: {
          caseNumber: '67890',
          motionType: 'Emergency Stay',
          filingDeadline: '2025-08-02T17:00:00Z'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Tasks', tasks, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Tasks', null, {});
  }
};
