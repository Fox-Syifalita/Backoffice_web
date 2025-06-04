import 'module-alias/register';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { pool } from './db'; 
import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';
import productRoutes from './routes/product.routes';



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

//404  fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Rute API
// Menggunakan rute otentikasi yang diimpor dari './routes/auth.routes'
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

// Rute kesehatan API (untuk memverifikasi server berjalan)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
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