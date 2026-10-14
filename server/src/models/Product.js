import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  sku: { type: String, trim: true },
  size: { type: String, trim: true },
  color: { type: String, trim: true },
  price: { type: Number, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 }
}, { _id: true });

const specificationSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true },
  value: { type: String, required: true, trim: true }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  mrp: {
    type: Number,
    min: 0,
    validate: {
      validator: function (val) {
        if (val === null || val === undefined || isNaN(val)) return true;
        const currentPrice = this.price !== undefined ? this.price : (this.getUpdate ? this.getUpdate().$set?.price : 0);
        return currentPrice === undefined || val >= currentPrice;
      },
      message: 'MRP must be greater than or equal to selling price'
    }
  },
  brand: { type: String, trim: true, maxlength: 60, default: '' },
  highlights: {
    type: [String],
    default: [],
    validate: [
      {
        validator: (arr) => !arr || arr.length <= 6,
        message: 'A product can have at most 6 highlights'
      },
      {
        validator: (arr) => !arr || arr.every(h => typeof h === 'string' && h.length <= 120),
        message: 'Each highlight must be 120 characters or fewer'
      }
    ]
  },
  specifications: {
    type: [specificationSchema],
    default: [],
    validate: [
      {
        validator: (arr) => !arr || arr.length <= 15,
        message: 'A product can have at most 15 specifications'
      }
    ]
  },
  category: { type: String, required: true, trim: true, index: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  images: {
    type: [String],
    default: [],
    validate: [
      {
        validator: (arr) => !arr || arr.length <= 6,
        message: 'A product can have at most 6 images'
      }
    ]
  },
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

// Full-text search index on name, description and brand (FR-13, NFR-22)
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ brand: 1 });

export const Product = mongoose.model('Product', productSchema);
