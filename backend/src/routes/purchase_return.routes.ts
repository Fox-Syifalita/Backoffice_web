import { Router } from 'express';
import { getAllPurchaseReturns, createPurchaseReturn } from '../controllers/purchase_return.controller';

const router = Router();

router.get('/', getAllPurchaseReturns);
router.post('/', createPurchaseReturn);

export default router;
