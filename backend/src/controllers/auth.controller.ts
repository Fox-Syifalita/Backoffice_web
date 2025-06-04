import { Request, Response } from 'express';
import { pool } from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE username = $1 AND is_active = true', [username]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    if (!isValidPassword) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '24h' }
    );

    res.json({ token, 
      user: { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const register = async (req: Request, res: Response) => {
  const { username, password, email, role } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  try {
    const decoded: any = jwt.verify(token || '', process.env.JWT_SECRET!);
    if (decoded.role !== 'owner') return res.status(403).json({ error: 'Only owner can create accounts' });

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash, role, is_active) VALUES ($1, $2, $3, $4, true) RETURNING id, username, email, role',
      [username, email, passwordHash, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to register user' });
  }
};