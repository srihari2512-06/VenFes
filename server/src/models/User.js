import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const vendorProfileSchema = new mongoose.Schema({
  storeName: { type: String, trim: true },
  storeDescription: { type: String, trim: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  kycDocumentUrl: { type: String, default: '' },
  rejectionReason: { type: String, default: '' },
  handlingDays: { type: Number, min: 0, max: 7, default: 2 }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'vendor', 'admin'], default: 'customer' },
  vendorProfile: { type: vendorProfileSchema, default: null },
  refreshTokens: { type: [String], default: [] }
}, {
  timestamps: true
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);
