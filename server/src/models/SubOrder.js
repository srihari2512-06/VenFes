import mongoose from 'mongoose';

const subOrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  variantId: { type: mongoose.Schema.Types.ObjectId, default: null },
  variantSku: { type: String, default: '' },
  variantInfo: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, required: true, min: 0 }
}, { _id: true });

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  changedAt: { type: Date, default: Date.now },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { _id: false });

const subOrderSchema = new mongoose.Schema({
  subOrderNumber: { type: String, required: true, unique: true, index: true },
  parentOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: { type: [subOrderItemSchema], required: true },
  subtotal: { type: Number, required: true, min: 0 },
  commissionRate: { type: Number, default: 0.10 },
  commissionAmount: { type: Number, default: 0 },
  vendorPayoutAmount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['placed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'placed',
    index: true
  },
  statusHistory: { type: [statusHistorySchema], default: [] }
}, {
  timestamps: true
});

export const SubOrder = mongoose.model('SubOrder', subOrderSchema);
