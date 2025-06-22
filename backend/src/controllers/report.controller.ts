// reportController.ts – Backend controller laporan untuk semua tab
import { Request, Response } from 'express';
import pool from '../db';

const parseParams = (req: Request) => {
  const { startDate, endDate, period } = req.query;
  return {
    startDate: startDate as string,
    endDate: endDate as string,
    period: (period as string) || 'daily'
  };
};

export const getSalesPerSKU = async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;

  try {
    const result = await pool.query(`
      SELECT 
        p.sku,
        p.name AS product_name,
        c.name AS category_name,
        SUM(si.quantity) AS quantity_sold,
        SUM(si.quantity * si.unit_price) AS total_sales,
        SUM((si.unit_price - p.cost_price) * si.quantity) AS profit
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      JOIN sales sa ON si.sale_id = sa.id
      WHERE sa.created_at BETWEEN $1 AND $2
      GROUP BY p.sku, p.name, c.name
      ORDER BY total_sales DESC
    `, [startDate, endDate]);

    res.json(result.rows);
  } catch (err) {
    console.error('sales-sku error:', err);
    res.status(500).json({ error: 'Failed to fetch sales SKU report' });
  }
};



export const getSalesPerCategory = async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;

  try {
    const result = await pool.query(`
      SELECT 
        c.id AS category_id,
        c.name AS category_name,
        COUNT(DISTINCT p.id) AS product_count,
        SUM(si.quantity) AS quantity_sold,
        SUM(si.quantity * si.unit_price) AS total_sales,
        AVG(si.unit_price) AS average_price
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      JOIN sales s ON si.sale_id = s.id
      WHERE sa.created_at BETWEEN $1 AND $2
      GROUP BY c.id, c.name
      ORDER BY total_sales DESC
    `, [startDate, endDate]);

    res.json(result.rows);
  } catch (err) {
    console.error('sales-category error:', err);
    res.status(500).json({ error: 'Failed to fetch sales category report' });
  }
};

export const getSalesPerSupplier = async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;

  try {
    const result = await pool.query(`
      SELECT 
        s.id AS supplier_id,
        s.name AS supplier_name,
        COUNT(DISTINCT p.id) AS product_count,
        SUM(si.quantity) AS quantity_sold,
        SUM(si.quantity * si.unit_price) AS total_sales,
        SUM((si.unit_price - p.cost_price) * si.quantity) AS profit
      FROM sales_items si
      JOIN products p ON si.product_id = p.id
      JOIN suppliers s ON p.supplier_id = s.id
      JOIN sales sa ON si.sale_id = sa.id
      WHERE sa.created_at BETWEEN $1 AND $2
      GROUP BY s.id, s.name
      ORDER BY total_sales DESC
    `, [startDate, endDate]);

    res.json(result.rows);
  } catch (err) {
    console.error('sales-supplier error:', err);
    res.status(500).json({ error: 'Failed to fetch sales per supplier' });
  }
};

export const getConsignmentReport = async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;

  try {
    const result = await pool.query(`
      SELECT 
        con.id AS consignment_id,
        s.name AS supplier_name,
        p.name AS product_name,
        con.quantity_consigned,
        SUM(si.quantity) AS quantity_sold,
        con.commission_rate,
        SUM(si.quantity * si.unit_price) * (con.commission_rate / 100) AS total_commission
      FROM consignments con
      JOIN products p ON con.product_id = p.id
      JOIN suppliers s ON con.supplier_id = s.id
      LEFT JOIN sale_items si ON si.product_id = p.id
      LEFT JOIN sales sa ON si.sale_id = sa.id AND sa.created_at BETWEEN $1 AND $2
      GROUP BY con.id, s.name, p.name, con.quantity_consigned, con.commission_rate
    `, [startDate, endDate]);

    res.json(result.rows);
  } catch (err) {
    console.error('consignment error:', err);
    res.status(500).json({ error: 'Failed to fetch consignment report' });
  }
};

export const getPurchaseReport = async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;

  try {
    const result = await pool.query(`
      SELECT 
        p.id AS purchase_id,
        s.name AS supplier_name,
        p.purchase_number,
        p.order_date,
        COUNT(pi.id) AS total_items,
        SUM(pi.quantity * pi.unit_price) AS total_amount,
        p.status
      FROM purchases p
      JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN purchase_items pi ON pi.purchase_id = p.id
      WHERE p.order_date BETWEEN $1 AND $2
      GROUP BY p.id, s.name
      ORDER BY p.order_date DESC
    `, [startDate, endDate]);

    res.json(result.rows);
  } catch (err) {
    console.error('purchase report error:', err);
    res.status(500).json({ error: 'Failed to fetch purchase report' });
  }
};
