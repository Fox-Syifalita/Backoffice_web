import { Request, Response } from 'express';
import { pool } from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  
  console.log('Login attempt:', { username, password: '***' }); // Debug log
  
  try {
    // Validasi input di awal
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username and password are required',
        code: 'MISSING_CREDENTIALS' 
      });
    }
    
    const result = await pool.query('SELECT * FROM users WHERE username = $1 AND is_active = true', [username]);
    console.log('User found in DB:', result.rows.length > 0 ? 'Yes' : 'No'); // Debug log
    
    if (result.rows.length === 0) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS' 
      });
    }

    const user = result.rows[0];
    console.log('Comparing password for user:', user.username); // Debug log
    
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log('Password valid:', isValidPassword); // Debug log
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS' 
      });
    }

    // Pastikan JWT payload konsisten dengan interface
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        username: user.username // Tambahkan username untuk konsistensi
      }, 
      process.env.JWT_SECRET!, 
      { expiresIn: '24h' }
    );

    res.status(200).json({ 
      message: 'Login successful',
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name
      } 
    });
  } catch (err) {
    console.error('[Login Error]', err);
    res.status(500).json({ 
      error: 'Login failed',
      code: 'LOGIN_ERROR' 
    });
  }
};

export const register = async (req: Request, res: Response) => {
  console.log('Register request received:', req.body); // Debug log
  
  const { username, password, email, role = 'owner', first_name, last_name } = req.body;

  try {
    // Validasi input yang lebih baik
    if (!username || !password || !email || !first_name || !last_name) {
      return res.status(400).json({ 
        error: 'All fields are required',
        code: 'MISSING_FIELDS',
        missing: {
          username: !username,
          password: !password,
          email: !email,
          first_name: !first_name,
          last_name: !last_name
        }
      });
    }

    // Validasi format email sederhana
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format',
        code: 'INVALID_EMAIL' 
      });
    }

    // Validasi password strength
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long',
        code: 'WEAK_PASSWORD' 
      });
    }

    // Cek apakah username atau email sudah ada
    const existingUser = await pool.query(
      'SELECT id, username, email FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      const existing = existingUser.rows[0];
      const conflict = existing.username === username ? 'username' : 'email';
      
      return res.status(409).json({ 
        error: `${conflict.charAt(0).toUpperCase() + conflict.slice(1)} already exists`,
        code: 'DUPLICATE_USER',
        conflict_field: conflict
      });
    }

    const passwordHash = await bcrypt.hash(password, 12); // Tingkatkan dari 10 ke 12 untuk keamanan lebih baik
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, role, first_name, last_name, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, true, NOW())
       RETURNING id, username, email, role, first_name, last_name, created_at`,
      [username, email, passwordHash, role, first_name, last_name]
    );

    console.log('User created successfully:', result.rows[0]); // Debug log
    res.status(201).json({ 
      message: 'User registered successfully',
      user: result.rows[0] 
    });
    
  } catch (err: any) {
    console.error('[Register Error]', err);
    
    // Handle specific PostgreSQL errors
    if (err.code === '23505') { // Unique constraint violation
      return res.status(409).json({ 
        error: 'Username or email already exists',
        code: 'DUPLICATE_USER' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to register user',
      code: 'REGISTRATION_ERROR',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Tambahkan fungsi untuk refresh token
export const refreshToken = async (req: Request, res: Response) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Refresh token required',
      code: 'NO_REFRESH_TOKEN' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Verifikasi user masih aktif di database
    const result = await pool.query(
      'SELECT id, username, role FROM users WHERE id = $1 AND is_active = true',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        error: 'User not found or inactive',
        code: 'USER_INACTIVE' 
      });
    }

    const user = result.rows[0];
    
    // Generate token baru
    const newToken = jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        username: user.username
      }, 
      process.env.JWT_SECRET!, 
      { expiresIn: '24h' }
    );

    res.json({ 
      token: newToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });

  } catch (err: any) {
    console.error('[Refresh Token Error]', err);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Refresh token expired',
        code: 'REFRESH_TOKEN_EXPIRED' 
      });
    }
    
    return res.status(403).json({ 
      error: 'Invalid refresh token',
      code: 'INVALID_REFRESH_TOKEN' 
    });
  }
};