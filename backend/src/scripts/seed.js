import sequelize from '../config/database.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import ProjectMember from '../models/ProjectMember.js';

const seedDatabase = async () => {
  try {
    // Sync database
    await sequelize.sync({ force: true });
    console.log('✓ Database synced');

    // Create sample users
    const users = await User.bulkCreate([
      {
        name: 'John Admin',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
      },
      {
        name: 'Jane Developer',
        email: 'jane@example.com',
        password: 'password123',
        role: 'member',
      },
      {
        name: 'Bob Designer',
        email: 'bob@example.com',
        password: 'password123',
        role: 'member',
      },
    ]);
    console.log('✓ Created 3 sample users');

    // Create sample projects
    const projects = await Project.bulkCreate([
      {
        name: 'Website Redesign',
        description: 'Complete redesign of the company website',
        adminId: users[0].id,
        status: 'active',
      },
      {
        name: 'Mobile App',
        description: 'Build a new mobile application',
        adminId: users[0].id,
        status: 'active',
      },
      {
        name: 'API Development',
        description: 'Develop REST APIs for the platform',
        adminId: users[1].id,
        status: 'active',
      },
    ]);
    console.log('✓ Created 3 sample projects');

    // Add project members
    await ProjectMember.bulkCreate([
      { projectId: projects[0].id, userId: users[0].id, role: 'admin' },
      { projectId: projects[0].id, userId: users[1].id, role: 'member' },
      { projectId: projects[0].id, userId: users[2].id, role: 'member' },
      { projectId: projects[1].id, userId: users[0].id, role: 'admin' },
      { projectId: projects[1].id, userId: users[1].id, role: 'member' },
      { projectId: projects[2].id, userId: users[1].id, role: 'admin' },
      { projectId: projects[2].id, userId: users[0].id, role: 'member' },
    ]);
    console.log('✓ Added team members to projects');

    // Create sample tasks
    const tasks = await Task.bulkCreate([
      {
        title: 'Design homepage mockup',
        description: 'Create Figma mockups for the new homepage',
        projectId: projects[0].id,
        assignedTo: users[2].id,
        createdBy: users[0].id,
        priority: 'high',
        status: 'in_progress',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Setup project repository',
        description: 'Initialize Git repository and setup CI/CD',
        projectId: projects[0].id,
        assignedTo: users[1].id,
        createdBy: users[0].id,
        priority: 'high',
        status: 'completed',
        dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Create authentication endpoints',
        description: 'Build login, signup, and token refresh endpoints',
        projectId: projects[2].id,
        assignedTo: users[1].id,
        createdBy: users[1].id,
        priority: 'high',
        status: 'in_progress',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Write API documentation',
        description: 'Document all endpoints with examples',
        projectId: projects[2].id,
        assignedTo: users[0].id,
        createdBy: users[1].id,
        priority: 'medium',
        status: 'todo',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Setup mobile development environment',
        description: 'Configure React Native and development tools',
        projectId: projects[1].id,
        assignedTo: users[1].id,
        createdBy: users[0].id,
        priority: 'high',
        status: 'todo',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
    ]);
    console.log('✓ Created 5 sample tasks');

    console.log('\n✓ Database seeding completed successfully!');
    console.log('\nSample credentials for testing:');
    console.log('  Admin: admin@example.com / password123');
    console.log('  User 1: jane@example.com / password123');
    console.log('  User 2: bob@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('✗ Database seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
