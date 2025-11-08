import mongoose from 'mongoose';

const billingSchema = new mongoose.Schema({
  // store pharmacyId as string for compatibility with frontend IDs (e.g. 'P001')
  pharmacyId: { type: String },
  items: [
    {
      drugCode: String,
      name: String,
      qty: Number,
      price: Number,
      subtotal: Number
    }
  ],
  total: Number,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Billing', billingSchema);
