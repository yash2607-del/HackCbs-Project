import express from 'express';
import { createPharmacy, getPharmacies } from '../controllers/pharmacyController.js';

const router = express.Router();

router.post('/', createPharmacy);
router.get('/', getPharmacies);

export default router;
