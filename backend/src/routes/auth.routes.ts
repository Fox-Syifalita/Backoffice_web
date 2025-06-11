import { Router } from 'express';
import { login, register } from '../controllers/auth.controller';
import { authenticateToken, AuthRequest } from '../middlewares/auth'; // Import AuthRequest juga

const router = Router();

router.post('/login', login);
router.post('/register', register);

// Route untuk validasi token (penting untuk persistence)
router.get('/me', authenticateToken, (req: AuthRequest, res) => {
  res.json({ 
    user: req.user,
    message: 'Token is valid' 
  }); 
});

// Route untuk refresh/validate token
router.get('/validate', authenticateToken, (req: AuthRequest, res) => {
  res.json({ 
    valid: true,
    user: req.user 
  });
});

export default router;