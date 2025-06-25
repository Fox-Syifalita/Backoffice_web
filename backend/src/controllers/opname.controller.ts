import { Request, Response } from 'express';
import pool from '../db';
import { v4 as uuidv4 } from 'uuid';

export const getStockOpnames = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        o.id, 
        o.opname_number, 
        o.opname_date, 
        o.description, 
        o.status,
        COUNT(oi.id) AS total_items
      FROM stock_opnames o
      LEFT JOIN stock_opname_items oi ON o.id = oi.opname_id
      GROUP BY o.id
      ORDER BY o.opname_date DESC
    `);
    res.json(result.rows);
  } catch (err: any) {
    console.error('[StockOpnameController] Error:', err);
    res.status(500).json({ error: 'Failed to fetch stock opname', message: err.message });
  }
};

export const getOpnameItems = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT soi.*, p.name AS product_name, p.sku AS product_sku
      FROM stock_opname_items soi
      JOIN products p ON soi.product_id = p.id
      WHERE opname_id = $1
    `, [id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
};

export const createStockOpname = async (req: Request, res: Response) => {
  const { opname_number, description, status, opname_date } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO stock_opnames (id, opname_number, description, status, opname_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [uuidv4(), opname_number, description, status, opname_date]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create stock opname' });
  }
};

export const updateStockOpname = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { opname_number, description, status } = req.body;
  try {
    const result = await pool.query(`
      UPDATE stock_opnames
      SET opname_number = $1, description = $2, status = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `, [opname_number, description, status, id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update stock opname' });
  }
};

export const updateOpnameStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await pool.query(`
      UPDATE stock_opnames
      SET status = $1, updated_at = NOW()
      WHERE id = $2
    `, [status, id]);
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
};


export const updateItemCount = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { physical_count } = req.body;
  try {
    const result = await pool.query(`
      UPDATE stock_opname_items
      SET physical_count = $1,
          variance = physical_count - system_count,
          status = CASE 
                    WHEN physical_count = system_count THEN 'match'
                    ELSE 'variance'
                   END,
          updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [physical_count, id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update item count' });
  }
};


export const populateItems = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const products = await pool.query(`SELECT id, stock FROM products WHERE is_active = true`);
    const insertPromises = products.rows.map(p =>
      pool.query(`
        INSERT INTO stock_opname_items (id, opname_id, product_id, system_count, physical_count, variance, status)
        VALUES ($1, $2, $3, $4, 0, $4, 'pending')
      `, [uuidv4(), id, p.id, p.stock])
    );
    await Promise.all(insertPromises);
    res.status(201).json({ message: 'Items populated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to populate items' });
  }
};
