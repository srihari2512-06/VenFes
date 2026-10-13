import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true, index: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subOrderIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubOrder' }],
  totalAmount: { type: Number, required: true, min: 0 },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },
  paymentMethod: { type: String, default: 'razorpay' },
  paymentDetails: {
    transactionId: { type: String, default: '' },
    orderId: { type: String, default: '' },
    signature: { type: String, default: '' }
  },
  shippingAddress: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zip: { type: String, default: '' },
    country: { type: String, default: '' }
  }
}, {
  timestamps: true
});

export const Order = mongoose.model('Order', orderSchema);
