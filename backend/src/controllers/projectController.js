import { Project, ProjectMember, Task, User } from '../models/index.js';
import mongoose from 'mongoose';

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
      projectId: project._id,
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

    // Get all projects where user is admin or member
    const adminProjects = await Project.find({ adminId: userId }).lean();

    // Get projects where user is a member
    const memberProjects = await ProjectMember.find({ userId })
      .populate('projectId')
      .lean();

    // Combine and deduplicate
    const projectIds = new Set();
    const allProjects = [];

    adminProjects.forEach(p => {
      projectIds.add(p._id.toString());
      allProjects.push(p);
    });

    memberProjects.forEach(m => {
      if (!projectIds.has(m.projectId._id.toString())) {
        projectIds.add(m.projectId._id.toString());
        allProjects.push(m.projectId);
      }
    });

    const projectsWithId = allProjects.map(project => ({
      ...project,
      id: project._id.toString(),
    }));

    res.status(200).json({ projects: projectsWithId });
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    const project = await Project.findById(projectId)
      .populate('adminId', 'name email')
      .lean();

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get project members with user details
    const members = await ProjectMember.find({ projectId })
      .populate('userId', 'name email')
      .lean();

    // Check authorization
    const isMember = members.some(m => m.userId._id.toString() === req.user.id);
    if (project.adminId._id.toString() !== req.user.id && !isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json({ project: { ...project, id: project._id.toString(), members } });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { name, description, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.adminId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only project admin can update' });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { name, description, status },
      { new: true }
    );

    res.status(200).json({
      message: 'Project updated successfully',
      project: updatedProject,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.adminId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only project admin can delete the project' });
    }

    await Promise.all([
      Task.deleteMany({ projectId }),
      ProjectMember.deleteMany({ projectId }),
      Project.findByIdAndDelete(projectId),
    ]);

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const addMember = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { userId, role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid project or user ID' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.adminId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only project admin can add members' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingMember = await ProjectMember.findOne({ projectId, userId });

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

    if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({ message: 'Invalid project or member ID' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.adminId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only project admin can remove members' });
    }

    await ProjectMember.deleteOne({ projectId, userId: memberId });

    res.status(200).json({ message: 'Member removed successfully' });
  } catch (error) {
    next(error);
  }
};
