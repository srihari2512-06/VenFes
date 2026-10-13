import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubOrder', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true, default: '' },
  isFlagged: { type: Boolean, default: false }
}, {
  timestamps: true
});

// One review per customer per product purchase (FR-31)
reviewSchema.index({ productId: 1, customerId: 1 }, { unique: true });

export const Review = mongoose.model('Review', reviewSchema);
