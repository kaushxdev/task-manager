import { Task, Project, ProjectMember } from '../models/index.js';
import { Op } from 'sequelize';

export const createTask = async (req, res, next) => {
  try {
    const { projectId, title, description, assignedTo, priority, dueDate } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ message: 'Title and project ID are required' });
    }

    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check authorization
    const isProjectMember = await ProjectMember.findOne({
      where: { projectId, userId: req.user.id },
    });

    if (project.adminId !== req.user.id && !isProjectMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const task = await Task.create({
      projectId,
      title,
      description,
      assignedTo,
      createdBy: req.user.id,
      priority,
      dueDate,
    });

    res.status(201).json({
      message: 'Task created successfully',
      task,
    });
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (req, res, next) => {
  try {
    const { projectId } = req.query;
    const where = {};

    if (projectId) {
      where.projectId = projectId;
    }

    const tasks = await Task.findAll({
      where,
      include: [
        {
          association: 'assignee',
          attributes: ['id', 'name', 'email'],
        },
        {
          association: 'creator',
          attributes: ['id', 'name', 'email'],
        },
        {
          association: 'project',
          attributes: ['id', 'name'],
        },
      ],
    });

    res.status(200).json({ tasks });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findByPk(taskId, {
      include: [
        {
          association: 'assignee',
          attributes: ['id', 'name', 'email'],
        },
        {
          association: 'creator',
          attributes: ['id', 'name', 'email'],
        },
        {
          association: 'project',
        },
      ],
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ task });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, priority, assignedTo, dueDate } = req.body;

    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findByPk(task.projectId);
    
    // Check authorization
    const isProjectMember = await ProjectMember.findOne({
      where: { projectId: task.projectId, userId: req.user.id },
    });

    if (project.adminId !== req.user.id && !isProjectMember && task.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await task.update({
      title,
      description,
      status,
      priority,
      assignedTo,
      dueDate,
    });

    res.status(200).json({
      message: 'Task updated successfully',
      task,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findByPk(task.projectId);
    
    if (project.adminId !== req.user.id && task.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await task.destroy();

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getTaskStats = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const stats = await Task.findAll({
      where: { projectId },
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
      ],
      group: ['status'],
      raw: true,
    });

    const formattedStats = {
      todo: 0,
      in_progress: 0,
      completed: 0,
      overdue: 0,
    };

    stats.forEach(stat => {
      formattedStats[stat.status] = parseInt(stat.count);
    });

    res.status(200).json(formattedStats);
  } catch (error) {
    next(error);
  }
};
