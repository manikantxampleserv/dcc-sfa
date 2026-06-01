import { Router } from 'express';
import { barcodeController } from '../controllers/barcode.controller';

const router = Router();

// Public route for generating barcodes dynamically
router.get('/barcode', barcodeController.generateBarcode);

export default router;
