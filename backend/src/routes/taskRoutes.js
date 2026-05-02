import express from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats,
} from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, createTask);
router.get('/', authenticate, getTasks);
router.get('/:taskId', authenticate, getTaskById);
router.put('/:taskId', authenticate, updateTask);
router.delete('/:taskId', authenticate, deleteTask);
router.get('/stats/:projectId', authenticate, getTaskStats);

export default router;
