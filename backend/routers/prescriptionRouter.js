import express from 'express'
import { addPrescription } from '../controllers/prescriptionController.js'

const router = express.Router()

// POST /api/prescriptions
router.post('/', addPrescription)

export default router
