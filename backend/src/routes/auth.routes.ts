import { Router } from 'express';
import { login } from '../controllers/auth.controller';
import { register } from '../controllers/auth.controller';
const router = Router();
router.post('/login', login);
router.post('/register', register);
export default router;
