// import 'module-alias/register';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { pool } from './db'; 
import salesRoutes from './routes/sales.routes';
import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';
import productRoutes from './routes/product.routes';
import stockMovementRoutes from './routes/stockMovement.routes';
import purchaseRoutes from './routes/purchase.routes';
import purchaseReturnRoutes from './routes/purchase_return.routes';
import supplierRoutes from './routes/supplier.routes';
import reportRoutes from './routes/report.routes';
import employeeRoutes from './routes/employee.routes';
import settingRoutes from './routes/setting.routes';



// Muat variabel lingkungan dari file .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Mengizinkan permintaan lintas domain (CORS)
app.use(helmet()); // Menambahkan lapisan keamanan dengan mengatur header HTTP
app.use(express.json()); // Parsing body permintaan dalam format JSON
app.use(express.urlencoded({ extended: true })); // Parsing body permintaan dalam format URL-encoded (untuk form data)

// Menambahkan rute untuk path root '/' ---
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Backend API for My POS App!',
    status: 'Server is running',
    available_endpoints: {
      health_check: '/api/health',
      authentication: '/api/auth'
      // Tambahkan endpoint lain jika ada di sini
    }
  });
});

// Rute kesehatan API (untuk memverifikasi server berjalan)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
});

// Rute API - PINDAHKAN KE ATAS SEBELUM 404 HANDLER
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stockmovement', stockMovementRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/purchase-returns', purchaseReturnRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/supplier', supplierRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/setting', settingRoutes);

// 404 fallback - PINDAHKAN KE BAWAH SETELAH SEMUA ROUTES
app.use((req, res) => {
  res.status(404).json({
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Memulai server pada port yang ditentukan
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access health check at: http://localhost:${PORT}/api/health`);
  console.log(`Access root (welcome message) at: http://localhost:${PORT}/`);
});

pool.query('SELECT NOW()')
  .then(res => console.log('DB connected at:', res.rows[0].now))
  .catch(err => console.error('DB connection error:', err));