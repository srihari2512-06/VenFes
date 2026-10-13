import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  sku: { type: String, trim: true },
  size: { type: String, trim: true },
  color: { type: String, trim: true },
  price: { type: Number, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 }
}, { _id: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, trim: true, index: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  images: { type: [String], default: [] },
  stock: { type: Number, required: true, min: 0, default: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  variants: { type: [variantSchema], default: [] },
  isPublished: { type: Boolean, default: true, index: true },
  isFlagged: { type: Boolean, default: false, index: true },
  averageRating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Full-text search index on name and description (FR-13, NFR-22)
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, price: 1 });

export const Product = mongoose.model('Product', productSchema);
