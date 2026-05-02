import express from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  addMember,
  removeMember,
} from '../controllers/projectController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.post('/', authenticate, createProject);
router.get('/', authenticate, getProjects);
router.get('/:projectId', authenticate, getProjectById);
router.put('/:projectId', authenticate, updateProject);
router.post('/:projectId/members', authenticate, addMember);
router.delete('/:projectId/members/:memberId', authenticate, removeMember);

export default router;
