import { Request, Response } from 'express';
import pool from '../db';

export const getSettings = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT key, value FROM settings');
    res.json(result.rows);
  } catch (err: any) {
    console.error('Get settings failed:', err);
    res.status(500).json({ error: 'Failed to fetch settings', message: err.message });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  const { settings } = req.body;

  if (!Array.isArray(settings)) {
    return res.status(400).json({ error: 'Invalid settings format' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const setting of settings) {
      const { key, value, data_type } = setting;
      await client.query(
        `
        INSERT INTO settings (key, value, data_type)
        VALUES ($1, $2, $3)
        ON CONFLICT (key) DO UPDATE
        SET value = EXCLUDED.value, data_type = EXCLUDED.data_type, updated_at = NOW()
        `,
        [key, value, data_type]
      );
    }

    await client.query('COMMIT');
    res.status(200).json({ message: 'Settings updated successfully' });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('Update settings failed:', err);
    res.status(500).json({ error: 'Failed to update settings', message: err.message });
  } finally {
    client.release();
  }
};
