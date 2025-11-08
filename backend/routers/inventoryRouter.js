import express from 'express';
import { getInventory, addInventory, updateStock } from '../controllers/inventoryController.js';

const router = express.Router();

router.get('/', getInventory);
router.post('/', addInventory);
router.post('/update-stock', updateStock);

export default router;
