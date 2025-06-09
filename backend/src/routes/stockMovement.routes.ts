import express from 'express';
import { getStockMovements } from '../controllers/stockMovement.controller';

const router = express.Router();

router.get('/', getStockMovements);

export default router;
