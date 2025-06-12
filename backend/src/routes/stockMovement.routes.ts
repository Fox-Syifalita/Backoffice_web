import express from 'express';
import { 
  getStockMovements, 
  getStockMovementSummary, 
  getStockMovementByProduct 
} from '../controllers/stockMovement.controller';

const router = express.Router();

// Get all stock movements with filters
router.get('/', getStockMovements);
// Get stock movement summary (grouped by product)
router.get('/summary', getStockMovementSummary);
// Get stock movements for specific product
router.get('/product/:productId', getStockMovementByProduct);

export default router;