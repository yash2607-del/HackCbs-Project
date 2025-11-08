import mongoose from 'mongoose';


const inventorySchema = new mongoose.Schema({
  // Accept pharmacyId as string for simple integration (e.g. 'P001')
  pharmacyId: { type: String },
  name: String,
  batch: String,
  expiry: String,
  quantity: Number,
  price: Number,
  drugCode: String
});

export default mongoose.model('Inventory', inventorySchema);
