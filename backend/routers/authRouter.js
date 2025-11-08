import express from 'express';
import { register, login, me, updateLocation } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', me);
router.put('/location', updateLocation);

export default router;
