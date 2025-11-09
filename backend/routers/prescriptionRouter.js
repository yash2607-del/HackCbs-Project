import express from 'express'
import { addPrescription, listPrescriptionsByEmail, getPrescriptionByIdWithVerify } from '../controllers/prescriptionController.js'

const router = express.Router()

// POST /api/prescriptions
router.post('/', addPrescription)

// GET /api/prescriptions?email=
router.get('/', listPrescriptionsByEmail)

// GET /api/prescriptions/:id (tamper verification)
router.get('/:id', getPrescriptionByIdWithVerify)

export default router
