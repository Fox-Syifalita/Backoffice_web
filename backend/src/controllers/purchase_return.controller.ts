// src/controllers/purchase_return.controller.ts
import { Request, Response } from 'express';
import { pool } from '../db';
import { v4 as uuidv4 } from 'uuid';

export const getAllPurchaseReturns = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM purchase_returns ORDER BY created_at DESC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch purchase returns' });
  }
};

export const createPurchaseReturn = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { purchase_id, reason, notes, items } = req.body;
    const returnId = uuidv4();
    const returnNumber = 'PR-' + Date.now();

    await client.query('BEGIN');

    await client.query(
      `INSERT INTO purchase_returns (
        id, return_number, purchase_id, reason, notes
      ) VALUES ($1, $2, $3, $4, $5)`,
      [returnId, returnNumber, purchase_id, reason, notes]
    );

    for (const item of items) {
      await client.query(
        `INSERT INTO purchase_return_items (
          id, purchase_return_id, product_id, quantity_returned, return_reason
        ) VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), returnId, item.product_id, item.quantity_returned, item.return_reason || reason]
      );

      // Optionally reduce stock here
    }

    await client.query('COMMIT');

    res.status(201).json({ id: returnId, return_number: returnNumber });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to create purchase return' });
  } finally {
    client.release();
  }
};
