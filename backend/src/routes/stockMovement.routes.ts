import express from 'express';
import { 
  getStockMovements, 
  getStockMovementSummary, 
  getStockMovementByProduct 
} from '../controllers/stockMovement.controller';

const router = express.Router();

router.get('/', getStockMovements);
router.get('/summary', getStockMovementSummary);
router.get('/product/:productId', getStockMovementByProduct);

export default router;