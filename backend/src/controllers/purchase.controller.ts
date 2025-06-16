import { Request, Response } from 'express';
import { pool } from '../db';
import { v4 as uuidv4 } from 'uuid';

export const getAllPurchases = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM purchases ORDER BY created_at DESC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
};

export const createPurchase = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const {
      supplier_id,
      order_date,
      expected_date,
      notes,
      total_amount,
      subtotal,
      status,
      items
    } = req.body;

    const purchaseId = uuidv4();
    const purchaseNumber = 'PO-' + Date.now();

    await client.query('BEGIN');

    await client.query(
      `INSERT INTO purchases (
        id, purchase_number, supplier_id, order_date, expected_date,
        notes, subtotal, total_amount, status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [purchaseId, purchaseNumber, supplier_id, order_date, expected_date, notes, subtotal, total_amount, status]
    );

    for (const item of items) {
      await client.query(
        `INSERT INTO purchase_items (
          id, purchase_id, product_id, quantity_ordered, unit_cost
        ) VALUES ($1,$2,$3,$4,$5)`,
        [uuidv4(), purchaseId, item.product_id, item.quantity_ordered, item.unit_cost]
      );

      // Optionally update stock here if status === 'received'
    }

    await client.query('COMMIT');

    res.status(201).json({ id: purchaseId, purchase_number: purchaseNumber });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to create purchase' });
  } finally {
    client.release();
  }
};

export const updatePurchaseStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE purchases SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
};