import { Request, Response } from 'express';
import { pool } from '../db';
import { v4 as uuidv4 } from 'uuid';

export const getAllPurchases = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id, p.purchase_number, p.order_date, p.status, 
        p.total_amount, s.name AS supplier_name
      FROM purchases p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      ORDER BY p.order_date DESC
    `);
    res.json(result.rows);
  } catch (err: any) {
    console.error('[getAllPurchases] Error:', err);
    res.status(500).json({ error: 'Failed to get purchases' });
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
      const quantity = Number(item.quantity_ordered);
      const unitCost = Number(item.unit_cost);
      const totalCost = quantity * unitCost;

      if (isNaN(totalCost)) throw new Error('Invalid quantity or unit cost');

      await client.query(
        `INSERT INTO purchase_items (
        id, purchase_id, product_id, quantity_ordered, unit_cost, total_cost
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), purchaseId, item.product_id, quantity, unitCost, totalCost]
    );
  
   if (status === 'received') {
        await client.query(
          `UPDATE products SET stock = stock + $1 WHERE id = $2`,
          [quantity, item.product_id]
        );
      }
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
      `UPDATE purchases SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    res.json({ message: 'Status updated', data: result.rows[0] });
  } catch (err: any) {
    console.error('[updatePurchaseStatus] Error:', err);
    res.status(500).json({ error: 'Failed to update status', message: err.message });
  }
};