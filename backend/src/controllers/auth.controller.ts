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
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const result = await pool.query('SELECT * FROM users WHERE username = $1 AND is_active = true', [username]);
    console.log('User found in DB:', result.rows.length > 0 ? 'Yes' : 'No'); // Debug log
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    console.log('Comparing password for user:', user.username); // Debug log
    
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log('Password valid:', isValidPassword); // Debug log
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET!, 
      { expiresIn: '24h' }
    );

    res.status(200).json({ 
      message: 'Login successful',
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      } 
    });
  } catch (err) {
    console.error('[Login Error]', err);
    res.status(500).json({ error: 'Login Gagal' });
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
        missing: {
          username: !username,
          password: !password,
          email: !email,
          first_name: !first_name,
          last_name: !last_name
        }
      });
    }

    // Cek apakah username atau email sudah ada
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, role, first_name, last_name, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING id, username, email, role, first_name, last_name`,
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
      return res.status(409).json({ error: 'Username or email already exists' });
    }
    
    res.status(500).json({ 
      error: 'Failed to register user',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};