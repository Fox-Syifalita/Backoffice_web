import { Request, Response } from 'express';
import { pool } from '../db';

export const getCategories = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT id, name FROM categories WHERE is_active = true');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  const { name } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO categories (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' });
  }
};
