import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { pool } from './db'; // Pastikan 'pool' diekspor dari './db'
import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';

// Muat variabel lingkungan dari file .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Mengizinkan permintaan lintas domain (CORS)
app.use(cors());
// Menambahkan lapisan keamanan dengan mengatur header HTTP
app.use(helmet());
// Parsing body permintaan dalam format JSON
app.use(express.json());
// Parsing body permintaan dalam format URL-encoded (untuk form data)
app.use(express.urlencoded({ extended: true }));

// --- PERBAIKAN: Menambahkan rute untuk path root '/' ---
// Ketika browser mengakses http://localhost:3000, dia akan menampilkan pesan ini.
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
// --- AKHIR PERBAIKAN ---

// Rute API
// Menggunakan rute otentikasi yang diimpor dari './routes/auth.routes'
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);

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