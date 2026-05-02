import User from './User.js';
import Project from './Project.js';
import Task from './Task.js';
import ProjectMember from './ProjectMember.js';

// User associations
User.hasMany(Project, { foreignKey: 'adminId', as: 'adminProjects' });
User.hasMany(Task, { foreignKey: 'createdBy', as: 'createdTasks' });
User.hasMany(Task, { foreignKey: 'assignedTo', as: 'assignedTasks' });
User.hasMany(ProjectMember, { foreignKey: 'userId', as: 'projectMemberships' });

// Project associations
Project.belongsTo(User, { foreignKey: 'adminId', as: 'admin' });
Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks', onDelete: 'CASCADE' });
Project.hasMany(ProjectMember, { foreignKey: 'projectId', as: 'members', onDelete: 'CASCADE' });

// Task associations
Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
Task.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });
Task.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// ProjectMember associations
ProjectMember.belongsTo(Project, { foreignKey: 'projectId' });
ProjectMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export { User, Project, Task, ProjectMember };
