// Utility to produce a canonical keccak256 hash of a prescription's core data
// Dependencies: json-stable-stringify, ethers
// Install (if not present): npm i json-stable-stringify ethers

import stringify from 'json-stable-stringify'
import { keccak256 } from 'ethers'

/**
 * Build a canonical JSON representation of the prescription payload
 * Only include stable business fields (exclude metadata like _id, timestamps, hashes)
 * @param {Object} data - raw prescription fields
 * @returns {{ hash: string, canonical: string }}
 */
export function hashPrescription(data) {
  const core = {
    patientName: data.patientName || '',
    patientEmail: data.patientEmail || '',
    age: typeof data.age === 'number' ? data.age : null,
    sex: data.sex || '',
    medicines: Array.isArray(data.medicines)
      ? data.medicines.map(m => ({
          id: m.id || '',
          name: m.name || '',
          dosageValue: typeof m.dosageValue === 'number' ? m.dosageValue : null,
          dosageUnit: m.dosageUnit || '',
          timesPerDay: typeof m.timesPerDay === 'number' ? m.timesPerDay : null,
          totalDays: typeof m.totalDays === 'number' ? m.totalDays : null
        }))
      : [],
    notes: data.notes || ''
  }

  // Canonical stable string (deterministic key ordering)
  const canonical = stringify(core)
  // keccak256 expects bytes/hex; for easy usage we hash the UTF-8 string
  const hash = keccak256(Buffer.from(canonical, 'utf8'))
  return { hash, canonical }
}

export default hashPrescription
