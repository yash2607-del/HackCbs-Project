import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  role: { type: String, enum: ['doctor','patient','pharmacy'], required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  profile: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
