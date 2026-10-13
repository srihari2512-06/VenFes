import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, {
  timestamps: true
});

export const Wishlist = mongoose.model('Wishlist', wishlistSchema);

const moderationFlagSchema = new mongoose.Schema({
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  targetType: { type: String, enum: ['Product', 'Review'], required: true },
  reason: { type: String, required: true, trim: true },
  status: { type: String, enum: ['pending', 'resolved', 'dismissed'], default: 'pending' }
}, {
  timestamps: true
});

export const ModerationFlag = mongoose.model('ModerationFlag', moderationFlagSchema);
