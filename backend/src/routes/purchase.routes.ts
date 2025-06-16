import { Router } from 'express';
import { getAllPurchases, createPurchase, updatePurchaseStatus } from '../controllers/purchase.controller';

const router = Router();

router.get('/', getAllPurchases);
router.post('/', createPurchase);
router.patch('/:id', updatePurchaseStatus);

export default router;
