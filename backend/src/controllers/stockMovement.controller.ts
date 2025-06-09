import { Request, Response } from 'express';
import { pool } from '../db';

export const getStockMovements = async (req: Request, res: Response) => {
  const { start, end, date, month, product_id, supplier_id } = req.query;

  try {
    let baseQuery = `
      SELECT sm.*, 
             p.name AS product_name, 
             u.username AS user_name
      FROM stock_movements sm
      LEFT JOIN products p ON sm.product_id = p.id
      LEFT JOIN users u ON sm.user_id = u.id
    `;
    const conditions: string[] = [];
    const values: any[] = [];

    let paramIndex = 1; // karena posisi $1, $2, dst

    if (start && end) {
      conditions.push(`TO_CHAR(sm.movement_date, 'HH24:MI') BETWEEN $${paramIndex++} AND $${paramIndex++}`);
      values.push(start, end);
    } else if (date) {
      conditions.push(`DATE(sm.movement_date) = $${paramIndex++}`);
      values.push(date);
    } else if (month) {
      conditions.push(`TO_CHAR(sm.movement_date, 'YYYY-MM') = $${paramIndex++}`);
      values.push(month);
    }

    if (product_id) {
      conditions.push(`sm.product_id = $${paramIndex++}`);
      values.push(product_id);
    }

    if (supplier_id) {
      conditions.push(`p.supplier_id = $${paramIndex++}`);
      values.push(supplier_id);
    }

    if (conditions.length > 0) {
      baseQuery += ' WHERE ' + conditions.join(' AND ');
    }

    baseQuery += ' ORDER BY sm.movement_date DESC';

    const result = await pool.query(baseQuery, values);
    res.json(result.rows);
  } catch (err) {
    console.error('[StockMovementController]', err);
    res.status(500).json({ message: 'Gagal mengambil data pergerakan stok' });
  }
};

