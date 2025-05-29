// Backend API Structure - Node.js with Express and TypeScript
// package.json dependencies needed:
// express, cors, helmet, bcryptjs, jsonwebtoken, pg, dotenv, multer, joi, winston

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Types
interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthRequest extends Request {
  user?: User;
}

// Authentication middleware
const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Role-based authorization
const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// AUTH ROUTES
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND is_active = true',
      [username]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PRODUCT ROUTES
app.get('/api/products', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 50, search, category, active } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    let query = `
      SELECT p.*, c.name as category_name, s.name as supplier_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 0;
    
    if (search) {
      paramCount++;
      query += ` AND (p.name ILIKE $${paramCount} OR p.sku ILIKE $${paramCount} OR p.barcode ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }
    
    if (category) {
      paramCount++;
      query += ` AND p.category_id = $${paramCount}`;
      params.push(category);
    }
    
    if (active !== undefined) {
      paramCount++;
      query += ` AND p.is_active = $${paramCount}`;
      params.push(active === 'true');
    }
    
    query += ` ORDER BY p.name LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(Number(limit), offset);
    
    const result = await pool.query(query, params);
    
    // Get total count
    let countQuery = `SELECT COUNT(*) FROM products p WHERE 1=1`;
    const countParams: any[] = [];
    let countParamCount = 0;
    
    if (search) {
      countParamCount++;
      countQuery += ` AND (p.name ILIKE $${countParamCount} OR p.sku ILIKE $${countParamCount} OR p.barcode ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }
    
    if (category) {
      countParamCount++;
      countQuery += ` AND p.category_id = $${countParamCount}`;
      countParams.push(category);
    }
    
    if (active !== undefined) {
      countParamCount++;
      countQuery += ` AND p.is_active = $${countParamCount}`;
      countParams.push(active === 'true');
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);
    
    res.json({
      products: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/products', authenticateToken, authorize(['admin', 'manager']), async (req: AuthRequest, res: Response) => {
  try {
    const {
      sku, barcode, name, description, category_id, supplier_id,
      cost_price, selling_price, stock_quantity, min_stock_level,
      max_stock_level, unit, tax_rate, track_stock, allow_negative_stock
    } = req.body;
    
    const result = await pool.query(`
      INSERT INTO products (
        sku, barcode, name, description, category_id, supplier_id,
        cost_price, selling_price, stock_quantity, min_stock_level,
        max_stock_level, unit, tax_rate, track_stock, allow_negative_stock
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `, [
      sku, barcode, name, description, category_id, supplier_id,
      cost_price, selling_price, stock_quantity || 0, min_stock_level || 0,
      max_stock_level, unit || 'pcs', tax_rate || 0, track_stock !== false, allow_negative_stock === true
    ]);
    
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ error: 'SKU or barcode already exists' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// SALES ROUTES
app.post('/api/sales', authenticateToken, async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      customer_id, items, payment_method, paid_amount,
      discount_amount = 0, notes
    } = req.body;
    
    // Generate transaction number
    const transactionNumber = `TXN-${Date.now()}`;
    
    // Calculate totals
    let subtotal = 0;
    let tax_amount = 0;
    
    for (const item of items) {
      const itemTotal = item.quantity * item.unit_price;
      subtotal += itemTotal;
      tax_amount += itemTotal * (item.tax_rate || 0);
    }
    
    const total_amount = subtotal + tax_amount - discount_amount;
    const change_amount = paid_amount - total_amount;
    
    // Insert sale
    const saleResult = await client.query(`
      INSERT INTO sales (
        transaction_number, cashier_id, customer_id, subtotal,
        tax_amount, discount_amount, total_amount, paid_amount,
        change_amount, payment_method, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      transactionNumber, req.user!.id, customer_id, subtotal,
      tax_amount, discount_amount, total_amount, paid_amount,
      change_amount, payment_method, notes
    ]);
    
    const sale = saleResult.rows[0];
    
    // Insert sale items and update stock
    for (const item of items) {
      // Insert sale item
      await client.query(`
        INSERT INTO sale_items (
          sale_id, product_id, product_name, product_sku,
          quantity, unit_price, discount_amount, tax_amount, total_amount
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        sale.id, item.product_id, item.product_name, item.product_sku,
        item.quantity, item.unit_price, item.discount_amount || 0,
        item.tax_amount || 0, item.quantity * item.unit_price
      ]);
      
      // Update product stock
      const productResult = await client.query(
        'SELECT stock_quantity, track_stock FROM products WHERE id = $1',
        [item.product_id]
      );
      
      if (productResult.rows.length > 0 && productResult.rows[0].track_stock) {
        const oldQuantity = productResult.rows[0].stock_quantity;
        const newQuantity = oldQuantity - item.quantity;
        
        await client.query(
          'UPDATE products SET stock_quantity = $1 WHERE id = $2',
          [newQuantity, item.product_id]
        );
        
        // Record stock movement
        await client.query(`
          INSERT INTO stock_movements (
            product_id, movement_type, reference_id, reference_type,
            quantity_change, quantity_before, quantity_after, user_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          item.product_id, 'sale', sale.id, 'sale',
          -item.quantity, oldQuantity, newQuantity, req.user!.id
        ]);
      }
    }
    
    // Update customer stats if customer exists
    if (customer_id) {
      await client.query(`
        UPDATE customers 
        SET total_spent = total_spent + $1, visit_count = visit_count + 1
        WHERE id = $2
      `, [total_amount, customer_id]);
    }
    
    await client.query('COMMIT');
    
    res.status(201).json({
      ...sale,
      items: items
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Transaction failed' });
  } finally {
    client.release();
  }
});

// DASHBOARD/REPORTS ROUTES
app.get('/api/dashboard/summary', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { period = 'today' } = req.query;
    
    let dateFilter = '';
    const now = new Date();
    
    switch (period) {
      case 'today':
        dateFilter = `AND DATE(transaction_date) = CURRENT_DATE`;
        break;
      case 'week':
        dateFilter = `AND transaction_date >= DATE_TRUNC('week', NOW())`;
        break;
      case 'month':
        dateFilter = `AND transaction_date >= DATE_TRUNC('month', NOW())`;
        break;
      case 'year':
        dateFilter = `AND transaction_date >= DATE_TRUNC('year', NOW())`;
        break;
    }
    
    // Sales summary
    const salesResult = await pool.query(`
      SELECT 
        COUNT(*) as total_transactions,
        COALESCE(SUM(total_amount), 0) as total_sales,
        COALESCE(AVG(total_amount), 0) as average_sale
      FROM sales 
      WHERE status = 'completed' ${dateFilter}
    `);
    
    // Top products
    const topProductsResult = await pool.query(`
      SELECT 
        p.name,
        SUM(si.quantity) as quantity_sold,
        SUM(si.total_amount) as total_revenue
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      JOIN products p ON si.product_id = p.id
      WHERE s.status = 'completed' ${dateFilter}
      GROUP BY p.id, p.name
      ORDER BY quantity_sold DESC
      LIMIT 10
    `);
    
    // Low stock products
    const lowStockResult = await pool.query(`
      SELECT name, sku, stock_quantity, min_stock_level
      FROM products
      WHERE track_stock = true 
        AND stock_quantity <= min_stock_level
        AND is_active = true
      ORDER BY stock_quantity ASC
      LIMIT 10
    `);
    
    res.json({
      sales_summary: salesResult.rows[0],
      top_products: topProductsResult.rows,
      low_stock_products: lowStockResult.rows
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// CUSTOMERS ROUTES
app.get('/api/customers', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    let query = 'SELECT * FROM customers WHERE 1=1';
    const params: any[] = [];
    
    if (search) {
      query += ' AND (name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1)';
      params.push(`%${search}%`);
    }
    
    query += ` ORDER BY name LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), offset);
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/customers', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, address, date_of_birth, gender } = req.body;
    
    const result = await pool.query(`
      INSERT INTO customers (name, email, phone, address, date_of_birth, gender)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [name, email, phone, address, date_of_birth, gender]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// CATEGORIES ROUTES
app.get('/api/categories', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT c.*, pc.name as parent_name
      FROM categories c
      LEFT JOIN categories pc ON c.parent_id = pc.id
      WHERE c.is_active = true
      ORDER BY c.name
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/categories', authenticateToken, authorize(['admin', 'manager']), async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, parent_id } = req.body;
    
    const result = await pool.query(`
      INSERT INTO categories (name, description, parent_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [name, description, parent_id]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// SUPPLIERS ROUTES
app.get('/api/suppliers', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT * FROM suppliers 
      WHERE is_active = true 
      ORDER BY name
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/suppliers', authenticateToken, authorize(['admin', 'manager']), async (req: AuthRequest, res: Response) => {
  try {
    const { name, contact_person, email, phone, address, tax_number, payment_terms } = req.body;
    
    const result = await pool.query(`
      INSERT INTO suppliers (name, contact_person, email, phone, address, tax_number, payment_terms)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [name, contact_person, email, phone, address, tax_number, payment_terms || 30]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// STOCK MOVEMENTS ROUTES
app.get('/api/stock-movements', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { product_id, page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    let query = `
      SELECT sm.*, p.name as product_name, p.sku, u.username
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.id
      LEFT JOIN users u ON sm.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (product_id) {
      query += ' AND sm.product_id = $1';
      params.push(product_id);
    }
    
    query += ` ORDER BY sm.movement_date DESC LIMIT ${params.length + 1} OFFSET ${params.length + 2}`;
    params.push(Number(limit), offset);
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// STOCK ADJUSTMENT ROUTES
app.post('/api/stock-adjustments', authenticateToken, authorize(['admin', 'manager']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { product_id, new_quantity, reason, notes } = req.body;
    
    // Get current stock
    const productResult = await client.query(
      'SELECT stock_quantity FROM products WHERE id = $1',
      [product_id]
    );
    
    if (productResult.rows.length === 0) {
      throw new Error('Product not found');
    }
    
    const old_quantity = productResult.rows[0].stock_quantity;
    const adjustment_quantity = new_quantity - old_quantity;
    
    // Update product stock
    await client.query(
      'UPDATE products SET stock_quantity = $1 WHERE id = $2',
      [new_quantity, product_id]
    );
    
    // Record stock adjustment
    await client.query(`
      INSERT INTO stock_adjustments (product_id, old_quantity, new_quantity, adjustment_quantity, reason, notes, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [product_id, old_quantity, new_quantity, adjustment_quantity, reason, notes, req.user!.id]);
    
    // Record stock movement
    await client.query(`
      INSERT INTO stock_movements (
        product_id, movement_type, quantity_change, quantity_before, quantity_after, notes, user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [product_id, 'adjustment', adjustment_quantity, old_quantity, new_quantity, `${reason}: ${notes}`, req.user!.id]);
    
    await client.query('COMMIT');
    res.json({ message: 'Stock adjusted successfully' });
    
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Stock adjustment failed' });
  } finally {
    client.release();
  }
});

// REPORTS ROUTES
app.get('/api/reports/sales', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { start_date, end_date, group_by = 'day' } = req.query;
    
    let dateFormat = '';
    switch (group_by) {
      case 'hour':
        dateFormat = 'YYYY-MM-DD HH24:00:00';
        break;
      case 'day':
        dateFormat = 'YYYY-MM-DD';
        break;
      case 'week':
        dateFormat = 'YYYY-"W"WW';
        break;
      case 'month':
        dateFormat = 'YYYY-MM';
        break;
      case 'year':
        dateFormat = 'YYYY';
        break;
      default:
        dateFormat = 'YYYY-MM-DD';
    }
    
    let query = `
      SELECT 
        TO_CHAR(transaction_date, '${dateFormat}') as period,
        COUNT(*) as transaction_count,
        SUM(total_amount) as total_sales,
        AVG(total_amount) as average_sale
      FROM sales
      WHERE status = 'completed'
    `;
    
    const params: any[] = [];
    let paramCount = 0;
    
    if (start_date) {
      paramCount++;
      query += ` AND DATE(transaction_date) >= ${paramCount}`;
      params.push(start_date);
    }
    
    if (end_date) {
      paramCount++;
      query += ` AND DATE(transaction_date) <= ${paramCount}`;
      params.push(end_date);
    }
    
    query += ` GROUP BY period ORDER BY period`;
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/reports/products', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { start_date, end_date } = req.query;
    
    let query = `
      SELECT 
        p.id,
        p.name,
        p.sku,
        c.name as category_name,
        SUM(si.quantity) as quantity_sold,
        SUM(si.total_amount) as total_revenue,
        AVG(si.unit_price) as average_price
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN sale_items si ON p.id = si.product_id
      LEFT JOIN sales s ON si.sale_id = s.id
      WHERE s.status = 'completed' OR s.id IS NULL
    `;
    
    const params: any[] = [];
    let paramCount = 0;
    
    if (start_date) {
      paramCount++;
      query += ` AND (s.transaction_date IS NULL OR DATE(s.transaction_date) >= ${paramCount})`;
      params.push(start_date);
    }
    
    if (end_date) {
      paramCount++;
      query += ` AND (s.transaction_date IS NULL OR DATE(s.transaction_date) <= ${paramCount})`;
      params.push(end_date);
    }
    
    query += ` GROUP BY p.id, p.name, p.sku, c.name ORDER BY quantity_sold DESC NULLS LAST`;
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// BARCODE GENERATION ROUTE
app.get('/api/products/:id/barcode', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT name, sku, barcode FROM products WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const product = result.rows[0];
    
    // Return barcode data for client-side generation
    res.json({
      product_id: id,
      name: product.name,
      sku: product.sku,
      barcode: product.barcode || product.sku
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ERROR HANDLING MIDDLEWARE
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 HANDLER
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// START SERVER
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;