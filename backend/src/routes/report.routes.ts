import { Router } from "express";
import {
    getSalesPerSKU,
    getSalesPerCategory,
    getSalesPerSupplier,
    getConsignmentReport,
    getPurchaseReport
} from '../controllers/report.controller';

const router = Router();

router.get('/sales-sku', getSalesPerSKU);
router.get('/sales-category', getSalesPerCategory);
router.get('/sales-supplier', getSalesPerSupplier);
router.get('/consignment', getConsignmentReport);
router.get('/purchase', getPurchaseReport);

export default router;