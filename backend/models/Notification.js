import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['upvote', 'verify', 'comment', 'flag', 'system'], default: 'system' },
  message: { type: String, required: true }, relatedMaterialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Material' },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Notification', schema);
