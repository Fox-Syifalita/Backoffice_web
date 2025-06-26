import { Request, Response } from 'express';
import { pool } from '../db';
import { error } from 'console';

export const getStockMovements = async (req: Request, res: Response) => {
  const { start, end, date, month, start_date, end_date, product_id, supplier_id } = req.query;

  try {
    let baseQuery = `
      SELECT 
        sm.id,
        sm.product_id,
        sm.movement_type,
        sm.quantity_change AS quantity,
        sm.movement_date,
        sm.notes,
        sm.user_id,
        p.name AS product_name,
        p.sku,
        c.name AS category,
        s.name AS supplier_name,
        u.username AS user_name
      FROM stock_movements sm
      LEFT JOIN products p ON sm.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN users u ON sm.user_id = u.id
    `;
    
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Time-based filters
    if (start && end) {
      // For hourly filter - filter by time range within today
      conditions.push(`
        DATE(sm.movement_date) = CURRENT_DATE 
        AND TO_CHAR(sm.movement_date, 'HH24:MI') BETWEEN $${paramIndex++} AND $${paramIndex++}
      `);
      values.push(start, end);
    } else if (date) {
      // For daily filter - specific date
      conditions.push(`DATE(sm.movement_date) = $${paramIndex++}`);
      values.push(date);
    } else if (start_date && end_date) {
      // For weekly filter - date range
      conditions.push(`DATE(sm.movement_date) BETWEEN $${paramIndex++} AND $${paramIndex++}`);
      values.push(start_date, end_date);
    } else if (month) {
      // For monthly filter - specific month
      conditions.push(`TO_CHAR(sm.movement_date, 'YYYY-MM') = $${paramIndex++}`);
      values.push(month);
    }

    // Additional filters
    if (product_id) {
      conditions.push(`sm.product_id = $${paramIndex++}`);
      values.push(product_id);
    }

    if (supplier_id) {
      conditions.push(`p.supplier_id = $${paramIndex++}`);
      values.push(supplier_id);
    }

    // Apply WHERE conditions
    if (conditions.length > 0) {
      baseQuery += ' WHERE ' + conditions.join(' AND ');
    }

    // Order by date descending
    baseQuery += ' ORDER BY sm.movement_date DESC, p.name ASC';

    console.log('Executing query:', baseQuery);
    console.log('With values:', values);

    const result = await pool.query(baseQuery, values);
    
    // If no data found, return empty array instead of error
    res.json(result.rows || []);
    
  } catch (err) {
    console.error('[StockMovementController] Error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ 
      message: 'Gagal mengambil data pergerakan stok',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
};

// New endpoint to get stock movement summary
export const getStockMovementSummary = async (req: Request, res: Response) => {
  const { start, end, date, month, start_date, end_date } = req.query;

  try {
    let baseQuery = `
      SELECT 
        p.id AS product_id,
        p.name AS product_name,
        p.sku,
        c.name AS category,
        s.name AS supplier_name,
        COALESCE(
          (SELECT SUM(quantity) 
           FROM stock_movements sm_opening 
           WHERE sm_opening.product_id = p.id 
           AND sm_opening.movement_type = 'OPENING'
          ), 0
        ) AS opening_stock,
        -- Incoming stock (purchases, returns in)
        COALESCE(
          (SELECT SUM(sm_in.quantity) 
           FROM stock_movements sm_in 
           WHERE sm_in.product_id = p.id 
           AND sm_in.movement_type IN ('IN', 'PURCHASE', 'RETURN_IN')
           AND DATE(sm_in.movement_date) <= CURRENT_DATE
          ), 0
        ) AS total_incoming,
        -- Outgoing stock (sales, returns out)
        COALESCE(
          (SELECT SUM(sm_out.quantity) 
           FROM stock_movements sm_out 
           WHERE sm_out.product_id = p.id 
           AND sm_out.movement_type IN ('OUT', 'SALE', 'RETURN_OUT')
           AND DATE(sm_out.movement_date) <= CURRENT_DATE
          ), 0
        ) AS total_outgoing,
        -- Current stock level
        p.stock_quantity AS current_stock
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.is_active = true
      ORDER BY p.name ASC
    `;

    const result = await pool.query(baseQuery);
    
    res.json(result.rows || []);
    
 } catch (err) {
    console.error('[StockMovementController] Summary Error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ 
      message: 'Gagal mengambil ringkasan pergerakan stok',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
};

// Get stock movement by product
export const getStockMovementByProduct = async (req: Request, res: Response) => {
  const { productId } = req.params;
  const { limit = 50, offset = 0 } = req.query;

  try {
    const query = `
      SELECT 
        sm.*,
        p.name AS product_name,
        p.sku,
        u.username AS user_name
      FROM stock_movements sm
      LEFT JOIN products p ON sm.product_id = p.id
      LEFT JOIN users u ON sm.user_id = u.id
      WHERE sm.product_id = $1
      ORDER BY sm.movement_date DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [productId, limit, offset]);
    
    res.json(result.rows || []);
    
  } catch (err) {
    console.error('[StockMovementController] By Product Error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ 
      message: 'Gagal mengambil data pergerakan stok produk',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
};