import { Router } from 'express';
import { 
  getStockMovements, 
  getStockMovementSummary, 
  getStockMovementByProduct 
} from '../controllers/stockMovement.controller';

const router = Router();

router.get('/', getStockMovements);
router.get('/summary', getStockMovementSummary);
router.get('/product/:productId', getStockMovementByProduct);

export default router;