import mongoose from 'mongoose'

const { Schema } = mongoose

const MedicineSchema = new Schema(
  {
    id: { type: String },
    name: { type: String, required: true },
    dosageValue: { type: Number },
    dosageUnit: { type: String },
    timesPerDay: { type: Number },
    totalDays: { type: Number }
  },
  { _id: false }
)

const PrescriptionSchema = new Schema({
  patientName: { type: String, required: true },
  patientEmail: { type: String },
  age: { type: Number },
  sex: { type: String },
  medicines: { type: [MedicineSchema], default: [] },
  notes: { type: String },
  // Hashing and anchoring fields
  dataHash: { type: String },
  hashVersion: { type: Number, default: 1 },
  chainTxHash: { type: String },
  chainNetwork: { type: String },
  chainConfirmed: { type: Boolean },
  // meta
  createdAt: { type: Date, default: () => new Date() }
})

const Prescription = mongoose.model('Prescription', PrescriptionSchema)

export default Prescription
