import express from 'express';
import { register, login, me, updateLocation, getUserProfile } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', me);
// Public profile lookup by email (required path param)
// Example: GET /api/auth/user/jane.doe@example.com/profile
router.get('/user/:email/profile', getUserProfile);
router.put('/location', updateLocation);

export default router;
