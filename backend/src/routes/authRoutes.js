import express from 'express';
import { signup, login, me } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/register', signup); // alias so frontend /register works too
router.post('/login', login);
router.get('/me', authenticate, me);

export default router;