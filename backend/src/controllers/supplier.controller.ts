import { Request, Response } from 'express';
import { pool } from '../db';

export const getAllSuppliers = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT id, name, email, phone, address
      FROM suppliers
      WHERE is_active = true
      ORDER BY name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('getAllSuppliers error:', err);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
};


export const createSupplier = async (req: Request, res: Response) => {
  const { name, contact_person, email, phone, address, tax_number, payment_terms, is_active } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO suppliers (id, name, contact_person, email, phone, address, tax_number, payment_terms, is_active)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name, contact_person, email, phone, address, tax_number, payment_terms || 30, is_active ?? true]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal menambahkan supplier', message: err.message });
  }
};

export const updateSupplier = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, contact_person, email, phone, address, tax_number, payment_terms, is_active } = req.body;
  try {
    const result = await pool.query(
      `UPDATE suppliers SET name=$1, contact_person=$2, email=$3, phone=$4,
       address=$5, tax_number=$6, payment_terms=$7, is_active=$8, updated_at=NOW()
       WHERE id=$9 RETURNING *`,
      [name, contact_person, email, phone, address, tax_number, payment_terms, is_active, id]
    );
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal memperbarui supplier', message: err.message });
  }
};

export const deleteSupplier = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM suppliers WHERE id=$1', [id]);
    res.status(204).end();
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal menghapus supplier', message: err.message });
  }
};
