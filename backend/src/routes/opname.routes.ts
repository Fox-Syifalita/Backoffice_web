import { Router } from 'express';
import {
    getStockOpnames,
    getOpnameItems,
    createStockOpname,
    updateStockOpname,
    updateOpnameStatus,
    updateItemCount,
    populateItems
} from '../controllers/opname.controller';

const router = Router();

router.get('/',getStockOpnames);
router.get('/:id', getOpnameItems);
router.post('/', createStockOpname);
router.put('/:id', updateStockOpname);
router.put('/:id/status', updateOpnameStatus);
router.put('/items/:id', updateItemCount);
router.post('/:id/populate', populateItems);

export default router;

