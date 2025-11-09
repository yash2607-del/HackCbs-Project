import express from 'express';
import { getInventory, addInventory, updateStock, searchInventory } from '../controllers/inventoryController.js';

const router = express.Router();

router.get('/', getInventory);
router.post('/', addInventory);
router.post('/update-stock', updateStock);
router.get('/search', searchInventory);

export default router;
