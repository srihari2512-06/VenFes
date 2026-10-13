import mongoose from 'mongoose';

const processedEventSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true, index: true },
  eventType: { type: String, required: true },
  payload: { type: mongoose.Schema.Types.Mixed },
  processedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export const ProcessedEvent = mongoose.model('ProcessedEvent', processedEventSchema);
