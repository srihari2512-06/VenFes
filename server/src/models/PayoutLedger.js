import mongoose from 'mongoose';

const payoutLedgerSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubOrder', required: true, index: true },
  amount: { type: Number, required: true },
  commission: { type: Number, required: true },
  status: {
    type: String,
    enum: ['accrued', 'settled', 'reversed'],
    default: 'accrued',
    index: true
  },
  settledAt: { type: Date },
  settledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

export const PayoutLedger = mongoose.model('PayoutLedger', payoutLedgerSchema);
