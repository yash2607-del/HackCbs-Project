import Prescription from '../models/Prescription.js'
import { hashPrescription } from '../utils/hashPrescription.js'
import { addHashToBlockchain } from '../utils/blockchain.js'

function validatePrescription(body) {
  if (!body) return 'Missing request body'
  if (!body.patientName) return 'patientName is required'
  if (!('patientEmail' in body)) return null // email optional
  if (!('age' in body)) return null
  if (!body.sex) return 'sex is required'
  if (!Array.isArray(body.medicines)) return 'medicines must be an array'
  return null
}

// Create a prescription, computing and storing a canonical data hash
export async function addPrescription(req, res) {
  try {
    const errMsg = validatePrescription(req.body)
    if (errMsg) return res.status(400).json({ error: errMsg })

    const { patientName, patientEmail, age, sex, medicines, notes } = req.body

    const normalized = {
      patientName,
      patientEmail,
      age: typeof age === 'string' ? Number(age) : age,
      sex,
      medicines: Array.isArray(medicines) ? medicines.map(m => ({
        id: m.id,
        name: m.name,
        dosageValue: typeof m.dosageValue === 'string' ? Number(m.dosageValue) : m.dosageValue,
        dosageUnit: m.dosageUnit,
        timesPerDay: typeof m.timesPerDay === 'string' ? Number(m.timesPerDay) : m.timesPerDay,
        totalDays: typeof m.totalDays === 'string' ? Number(m.totalDays) : m.totalDays
      })) : [],
      notes
    }

    // Compute canonical hash of core data
    const { hash } = hashPrescription(normalized)

    const created = await Prescription.create({
      ...normalized,
      dataHash: hash,
      hashVersion: 1
    })
    // Anchor hash on-chain (best-effort) and persist tx hash
    let chainTxHash = null
    try {
      chainTxHash = await addHashToBlockchain(created.dataHash)
      await Prescription.findByIdAndUpdate(created._id, {
        chainTxHash,
        chainNetwork: 'sepolia',
        chainConfirmed: true
      })
    } catch (chainErr) {
      console.error('Blockchain anchoring failed:', chainErr)
    }

    return res.status(201).json({ ok: true, id: created._id, dataHash: created.dataHash, chainTxHash })
  } catch (err) {
    console.error('addPrescription error:', err)
    return res.status(500).json({ error: 'Failed to add prescription' })
  }
}
