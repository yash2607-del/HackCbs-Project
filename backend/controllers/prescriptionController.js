import Prescription from '../models/Prescription.js'
import { hashPrescription } from '../utils/hashPrescription.js'
import { addHashToBlockchain, verifyHashOnBlockchain } from '../utils/blockchain.js'

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

// GET /api/prescriptions?email=...
export async function listPrescriptionsByEmail(req, res) {
  try {
    const email = String(req.query.email || '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'email query parameter is required' });
    }
    const items = await Prescription.find({ patientEmail: email }).sort({ createdAt: -1 }).lean();
    return res.json({ ok: true, count: items.length, items });
  } catch (err) {
    console.error('listPrescriptionsByEmail error:', err);
    return res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
}

// GET /api/prescriptions/:id with tamper verification
export async function getPrescriptionByIdWithVerify(req, res) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const doc = await Prescription.findById(id).lean();
    if (!doc) return res.status(404).json({ error: 'Not found' });

    // Rebuild canonical JSON from the DB record using the same core fields
    const core = {
      patientName: doc.patientName,
      patientEmail: doc.patientEmail,
      age: typeof doc.age === 'number' ? doc.age : (doc.age == null ? null : Number(doc.age)),
      sex: doc.sex,
      medicines: Array.isArray(doc.medicines)
        ? doc.medicines.map(m => ({
            id: m.id,
            name: m.name,
            dosageValue: typeof m.dosageValue === 'number' ? m.dosageValue : (m.dosageValue == null ? null : Number(m.dosageValue)),
            dosageUnit: m.dosageUnit,
            timesPerDay: typeof m.timesPerDay === 'number' ? m.timesPerDay : (m.timesPerDay == null ? null : Number(m.timesPerDay)),
            totalDays: typeof m.totalDays === 'number' ? m.totalDays : (m.totalDays == null ? null : Number(m.totalDays)),
          }))
        : [],
      notes: doc.notes || ''
    };
    const { hash: computedHash, canonical } = hashPrescription(core);

    const storedHash = doc.dataHash || null;
    const hashMatches = !!storedHash && storedHash.toLowerCase() === computedHash.toLowerCase();

    // Verify on-chain best-effort; if chain env missing, don't hard-fail
    let onChainVerified = null;
    try {
      if (storedHash) {
        onChainVerified = await verifyHashOnBlockchain(storedHash);
      }
    } catch (e) {
      console.warn('On-chain verify failed (non-fatal):', e.message || e);
      onChainVerified = null; // unknown
    }

    // If either check fails (hash mismatch OR explicit on-chain false), mark tampered
    const onChainFailed = onChainVerified === false; // null means unknown -> do not fail solely on that
    const verified = hashMatches && !onChainFailed;

    if (!verified) {
      const reason = !hashMatches ? 'hash-mismatch' : 'onchain-mismatch';
      return res.status(409).json({ ok: false, verified: false, reason, id: doc._id, storedHash, computedHash, onChainVerified, canonical, doc });
    }

    return res.json({ ok: true, verified: true, id: doc._id, storedHash, computedHash, onChainVerified, canonical, doc });
  } catch (err) {
    console.error('getPrescriptionByIdWithVerify error:', err);
    return res.status(500).json({ error: 'Failed to fetch prescription' });
  }
}
