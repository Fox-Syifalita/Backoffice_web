import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface User {
  id: string;
  username: string;
  email?: string; // Buat optional karena tidak selalu ada di JWT
  role: string;
}

// Interface untuk JWT payload
interface JWTPayload {
  id: string;
  role: string;
  username?: string;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: User;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      code: 'NO_TOKEN' 
    });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
      if (err) {
        console.log('JWT Error:', err.message); // Debug log
        
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ 
            error: 'Token expired',
            code: 'TOKEN_EXPIRED' 
          });
        }
        
        if (err.name === 'JsonWebTokenError') {
          return res.status(403).json({ 
            error: 'Invalid token',
            code: 'INVALID_TOKEN' 
          });
        }
        
        return res.status(403).json({ 
          error: 'Token verification failed',
          code: 'TOKEN_VERIFICATION_FAILED' 
        });
      }

      const payload = decoded as JWTPayload;
      
      // Pastikan payload memiliki data yang diperlukan
      if (!payload.id || !payload.role) {
        return res.status(403).json({ 
          error: 'Invalid token payload',
          code: 'INVALID_PAYLOAD' 
        });
      }

      req.user = {
        id: payload.id,
        username: payload.username || '', // Fallback jika tidak ada
        role: payload.role
      };
      
      next();
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Authentication error',
      code: 'AUTH_ERROR' 
    });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required_roles: roles,
        user_role: req.user?.role 
      });
    }
    next();
  };
};