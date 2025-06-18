import { Request, Response } from 'express';
import pool from '../db';
import bcrypt from 'bcryptjs';

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT id, username, email, first_name, last_name, role, is_active FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch users', message: err.message });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const { username, email, password, first_name, last_name, role, is_active } = req.body;

  if (!password) return res.status(400).json({ error: 'Password is required' });

  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (id, username, email, password, first_name, last_name, role, is_active)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7)
       RETURNING id, username, email, first_name, last_name, role, is_active`,
      [username, email, hash, first_name, last_name, role, is_active]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create user', message: err.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { username, email, password, first_name, last_name, role, is_active } = req.body;

  try {
    let query;
    let params;

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      query = `
        UPDATE users SET username=$1, email=$2, password=$3, first_name=$4, last_name=$5, role=$6, is_active=$7, updated_at=NOW()
        WHERE id=$8 RETURNING id, username, email, first_name, last_name, role, is_active
      `;
      params = [username, email, hash, first_name, last_name, role, is_active, id];
    } else {
      query = `
        UPDATE users SET username=$1, email=$2, first_name=$3, last_name=$4, role=$5, is_active=$6, updated_at=NOW()
        WHERE id=$7 RETURNING id, username, email, first_name, last_name, role, is_active
      `;
      params = [username, email, first_name, last_name, role, is_active, id];
    }

    const result = await pool.query(query, params);
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update user', message: err.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM users WHERE id=$1', [id]);
    res.status(204).end();
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete user', message: err.message });
  }
};
