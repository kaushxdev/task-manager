import { Project, ProjectMember, User } from '../models/index.js';
import { Op } from 'sequelize';

export const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const project = await Project.create({
      name,
      description,
      adminId: req.user.id,
    });

    // Add admin as project member
    await ProjectMember.create({
      projectId: project.id,
      userId: req.user.id,
      role: 'admin',
    });

    res.status(201).json({
      message: 'Project created successfully',
      project,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjects = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get projects where user is admin or member
    const projects = await Project.findAll({
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: ProjectMember,
          as: 'members',
          attributes: ['userId', 'role'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email'],
            },
          ],
        },
      ],
    });

    // Filter projects where user is admin or member
    const userProjects = projects.filter(project => {
      const isAdmin = project.adminId === userId;
      const isMember = project.members.some(m => m.userId === userId);
      return isAdmin || isMember;
    });

    res.status(200).json({ projects: userProjects });
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findByPk(projectId, {
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: ProjectMember,
          as: 'members',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email'],
            },
          ],
        },
      ],
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check authorization
    const isMember = project.members.some(m => m.userId === req.user.id);
    if (project.adminId !== req.user.id && !isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json({ project });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { name, description, status } = req.body;

    const project = await Project.findByPk(projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.adminId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only project admin can update' });
    }

    await project.update({ name, description, status });

    res.status(200).json({
      message: 'Project updated successfully',
      project,
    });
  } catch (error) {
    next(error);
  }
};

export const addMember = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { userId, role } = req.body;

    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.adminId !== req.user.id) {
      return res.status(403).json({ message: 'Only project admin can add members' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingMember = await ProjectMember.findOne({
      where: { projectId, userId },
    });

    if (existingMember) {
      return res.status(409).json({ message: 'User is already a member' });
    }

    const member = await ProjectMember.create({
      projectId,
      userId,
      role: role || 'member',
    });

    res.status(201).json({
      message: 'Member added successfully',
      member,
    });
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const { projectId, memberId } = req.params;

    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.adminId !== req.user.id) {
      return res.status(403).json({ message: 'Only project admin can remove members' });
    }

    await ProjectMember.destroy({
      where: { projectId, userId: memberId },
    });

    res.status(200).json({ message: 'Member removed successfully' });
  } catch (error) {
    next(error);
  }
};
