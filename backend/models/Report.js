import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, enum: ['copyright', 'spam', 'inappropriate', 'wrong_subject', 'other'], required: true },
  details: { type: String, maxlength: 500, default: '' }, status: { type: String, enum: ['open', 'resolved', 'dismissed'], default: 'open' },
}, { timestamps: true });

schema.index({ materialId: 1, reportedBy: 1 }, { unique: true });

export default mongoose.model('Report', schema);
