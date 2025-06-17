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
  const { startDate, endDate } = parseParams(req);
  try {
    const query = `
      SELECT p.sku, p.name as product_name, c.name as category_name,
             SUM(s.qty) as quantity_sold,
             SUM(s.qty * s.price) as total_sales,
             SUM((s.price - p.cost_price) * s.qty) as profit
      FROM sales_items s
      JOIN products p ON s.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      JOIN sales sa ON s.sale_id = sa.id
      WHERE sa.transaction_date BETWEEN $1 AND $2
      GROUP BY p.sku, p.name, c.name
    `;
    const result = await pool.query(query, [startDate, endDate]);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch SKU sales', message: err.message });
  }
};

export const getSalesPerCategory = async (req: Request, res: Response) => {
  const { startDate, endDate } = parseParams(req);
  try {
    const query = `
      SELECT c.id as category_id, c.name as category_name,
             COUNT(DISTINCT p.id) as product_count,
             SUM(s.qty) as quantity_sold,
             SUM(s.qty * s.price) as total_sales,
             ROUND(AVG(s.price), 0) as average_price
      FROM sales_items s
      JOIN products p ON s.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      JOIN sales sa ON s.sale_id = sa.id
      WHERE sa.transaction_date BETWEEN $1 AND $2
      GROUP BY c.id, c.name
    `;
    const result = await pool.query(query, [startDate, endDate]);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch category sales', message: err.message });
  }
};

export const getSalesPerSupplier = async (req: Request, res: Response) => {
  const { startDate, endDate } = parseParams(req);
  try {
    const query = `
      SELECT sup.id as supplier_id, sup.name as supplier_name,
             COUNT(DISTINCT p.id) as product_count,
             SUM(s.qty) as quantity_sold,
             SUM(s.qty * s.price) as total_sales,
             SUM((s.price - p.cost_price) * s.qty) as profit
      FROM sales_items s
      JOIN products p ON s.product_id = p.id
      LEFT JOIN suppliers sup ON p.supplier_id = sup.id
      JOIN sales sa ON s.sale_id = sa.id
      WHERE sa.transaction_date BETWEEN $1 AND $2
      GROUP BY sup.id, sup.name
    `;
    const result = await pool.query(query, [startDate, endDate]);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch supplier sales', message: err.message });
  }
};

export const getConsignmentReport = async (req: Request, res: Response) => {
  const { startDate, endDate } = parseParams(req);
  try {
    const query = `
      SELECT cs.id as consignment_id, sup.name as supplier_name, p.name as product_name,
             cs.quantity as quantity_consigned,
             COALESCE(SUM(s.qty), 0) as quantity_sold,
             cs.commission_rate,
             COALESCE(SUM(s.qty * s.price * (cs.commission_rate / 100)), 0) as total_commission
      FROM consignments cs
      JOIN products p ON cs.product_id = p.id
      JOIN suppliers sup ON p.supplier_id = sup.id
      LEFT JOIN sales_items s ON s.product_id = p.id
      LEFT JOIN sales sa ON s.sale_id = sa.id AND sa.transaction_date BETWEEN $1 AND $2
      GROUP BY cs.id, sup.name, p.name, cs.quantity, cs.commission_rate
    `;
    const result = await pool.query(query, [startDate, endDate]);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch consignment report', message: err.message });
  }
};

export const getPurchaseReport = async (req: Request, res: Response) => {
  const { startDate, endDate } = parseParams(req);
  try {
    const query = `
      SELECT p.id as purchase_id, p.purchase_number, p.order_date, p.status,
             s.name as supplier_name,
             COUNT(pi.id) as total_items,
             SUM(pi.quantity * pi.unit_cost) as total_amount
      FROM purchases p
      JOIN suppliers s ON p.supplier_id = s.id
      JOIN purchase_items pi ON pi.purchase_id = p.id
      WHERE p.order_date BETWEEN $1 AND $2
      GROUP BY p.id, s.name
    `;
    const result = await pool.query(query, [startDate, endDate]);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch purchase report', message: err.message });
  }
};