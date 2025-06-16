import { Request, Response } from 'express';
import pool from '../db';

export const getAllSales = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = `
      SELECT s.id, s.transaction_number, s.subtotal, s.tax_amount, s.discount_amount,
             s.total_amount, s.paid_amount, s.change_amount, s.payment_method,
             s.status, s.notes, s.transaction_date, s.created_at, s.updated_at,
             CONCAT(u.first_name, ' ', u.last_name) as cashier_name,
             u.username as cashier_username,
             c.name as customer_name, c.customer_code, c.phone as customer_phone,
             st.name as store_name
      FROM sales s
      LEFT JOIN users u ON s.cashier_id = u.id
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN stores st ON s.store_id = st.id
      ORDER BY s.transaction_date DESC
    `;
    const result = await pool.query(query);
    const data = result.rows.map(s => ({
      id: s.id,
      transaction_number: s.transaction_number,
      subtotal: parseFloat(s.subtotal || 0),
      tax_amount: parseFloat(s.tax_amount || 0),
      discount_amount: parseFloat(s.discount_amount || 0),
      total_amount: parseFloat(s.total_amount || 0),
      paid_amount: parseFloat(s.paid_amount || 0),
      change_amount: parseFloat(s.change_amount || 0),
      payment_method: s.payment_method,
      status: s.status,
      notes: s.notes,
      transaction_date: s.transaction_date,
      cashier_name: s.cashier_name,
      cashier_username: s.cashier_username,
      customer_name: s.customer_name,
      customer_code: s.customer_code,
      customer_phone: s.customer_phone,
      store_name: s.store_name,
      created_at: s.created_at,
      updated_at: s.updated_at
    }));
    res.json(data);
  } catch (err: any) {
    console.error('getAllSales error:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
};

export const getSaleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const query = `
      SELECT s.*, CONCAT(u.first_name, ' ', u.last_name) as cashier_name,
             u.username as cashier_username, u.email as cashier_email,
             c.name as customer_name, c.customer_code, c.phone as customer_phone,
             c.email as customer_email, c.address as customer_address,
             st.name as store_name, st.address as store_address, st.phone as store_phone
      FROM sales s
      LEFT JOIN users u ON s.cashier_id = u.id
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN stores st ON s.store_id = st.id
      WHERE s.id = $1
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Sale not found' });
      return;
    }
    const s = result.rows[0];
    const formatted = {
      id: s.id,
      transaction_number: s.transaction_number,
      subtotal: parseFloat(s.subtotal || 0),
      tax_amount: parseFloat(s.tax_amount || 0),
      discount_amount: parseFloat(s.discount_amount || 0),
      total_amount: parseFloat(s.total_amount || 0),
      paid_amount: parseFloat(s.paid_amount || 0),
      change_amount: parseFloat(s.change_amount || 0),
      payment_method: s.payment_method,
      status: s.status,
      notes: s.notes,
      transaction_date: s.transaction_date,
      cashier: { name: s.cashier_name, username: s.cashier_username, email: s.cashier_email },
      customer: { name: s.customer_name, code: s.customer_code, phone: s.customer_phone, email: s.customer_email, address: s.customer_address },
      store: { name: s.store_name, address: s.store_address, phone: s.store_phone },
      created_at: s.created_at, updated_at: s.updated_at
    };
    res.json(formatted);
  } catch (err: any) {
    console.error('getSaleById error:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
};
