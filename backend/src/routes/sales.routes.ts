import express from 'express';
import {
  getAllSales,
  getSaleById
  // Tambahkan controller lain jika sudah ditambahkan
} from '../controllers/sales.controller';

const router = express.Router();

// GET /api/sales
router.get('/', getAllSales);

// GET /api/sales/:id
router.get('/:id', getSaleById);

export default router;