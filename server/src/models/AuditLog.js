import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  actorRole: { type: String, required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  targetType: { type: String },
  details: { type: mongoose.Schema.Types.Mixed },
  ip: { type: String }
}, {
  timestamps: true
});

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
