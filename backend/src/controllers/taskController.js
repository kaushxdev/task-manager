import { Task, Project, ProjectMember } from '../models/index.js';
import mongoose from 'mongoose';

export const createTask = async (req, res, next) => {
  try {
    const { projectId, title, description, assignedTo, priority, dueDate } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ message: 'Title and project ID are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check authorization
    const isProjectMember = await ProjectMember.findOne({
      projectId, 
      userId: req.user.id,
    });

    if (project.adminId.toString() !== req.user.id && !isProjectMember) {
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
    const query = {};

    if (projectId) {
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ message: 'Invalid project ID' });
      }
      query.projectId = projectId;
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'id name email')
      .populate('createdBy', 'id name email')
      .populate('projectId', 'id name')
      .lean();

    const tasksWithId = tasks.map(task => ({
      ...task,
      id: task._id.toString(),
    }));

    res.status(200).json({ tasks: tasksWithId });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    const task = await Task.findById(taskId)
      .populate('assignedTo', 'id name email')
      .populate('createdBy', 'id name email')
      .populate('projectId', 'id name')
      .lean();

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ task: { ...task, id: task._id.toString() } });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, priority, assignedTo, dueDate } = req.body;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.projectId);
    
    // Check authorization
    const isProjectMember = await ProjectMember.findOne({
      projectId: task.projectId, 
      userId: req.user.id,
    });

    if (project.adminId.toString() !== req.user.id && !isProjectMember && task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        title,
        description,
        status,
        priority,
        assignedTo,
        dueDate,
      },
      { new: true }
    );

    res.status(200).json({
      message: 'Task updated successfully',
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.projectId);
    
    if (project.adminId.toString() !== req.user.id && task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Task.deleteOne({ _id: taskId });

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getTaskStats = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    const stats = await Task.aggregate([
      { $match: { projectId: new mongoose.Types.ObjectId(projectId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const formattedStats = {
      pending: 0,
      'in-progress': 0,
      completed: 0,
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
    });

    res.status(200).json(formattedStats);
  } catch (error) {
    next(error);
  }
};
