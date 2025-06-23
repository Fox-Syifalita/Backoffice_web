import { Request, Response } from 'express';
import { pool } from '../db';
import { v4 as uuidv4 } from 'uuid';

export const getAllCustomers = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM customers ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM customers WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  const {
    customer_code,
    name,
    email,
    phone,
    address,
    date_of_birth,
    gender,
    loyalty_points = 0,
    total_spent = 0,
    visit_count = 0,
    is_active = true
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO customers (
        id, customer_code, name, email, phone, address,
        date_of_birth, gender, loyalty_points, total_spent,
        visit_count, is_active
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
      ) RETURNING *`,
      [
        uuidv4(),
        customer_code,
        name,
        email,
        phone,
        address,
        date_of_birth,
        gender,
        loyalty_points,
        total_spent,
        visit_count,
        is_active
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create customer' });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    customer_code,
    name,
    email,
    phone,
    address,
    date_of_birth,
    gender
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE customers SET
        customer_code = $1,
        name = $2,
        email = $3,
        phone = $4,
        address = $5,
        date_of_birth = $6,
        gender = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8 RETURNING *`,
      [customer_code, name, email, phone, address, date_of_birth, gender, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update customer' });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('DELETE FROM customers WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
};