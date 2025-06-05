import { Request, Response } from 'express';
import { pool } from '../db';

export const createProduct = async (req: Request, res: Response) => {
  const {
    name,
    sku,
    barcode,
    description,
    category_id,
    supplier_id,
    cost_price,
    selling_price,
    stock_quantity,
    min_stock_level,
    max_stock_level,
    unit,
    tax_rate,
    is_active,
    track_stock,
    allow_negative_stock,
    image_url
  } = req.body;
try {
    const result = await pool.query(
      `INSERT INTO products (
        name, sku, barcode, description, category_id, supplier_id,
        cost_price, selling_price, stock_quantity,
        min_stock_level, max_stock_level, unit, tax_rate,
        is_active, track_stock, allow_negative_stock, image_url
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9,
        $10, $11, $12, $13,
        $14, $15, $16, $17
      ) RETURNING *`,
      [
        name,
        sku,
        barcode,
        description,
        category_id,
        supplier_id,
        cost_price,
        selling_price,
        stock_quantity,
        min_stock_level,
        max_stock_level,
        unit,
        tax_rate,
        is_active ?? true,
        track_stock ?? true,
        allow_negative_stock ?? false,
        image_url
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Product creation error:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, price } = req.body;
  try {
    const result = await pool.query(
      'UPDATE products SET name = $1, price = $2 WHERE id = $3 RETURNING *',
      [name, price, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
};
