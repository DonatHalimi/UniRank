import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 200, trim: true }, description: { type: String, maxlength: 500, default: '' },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
  uploaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  fileUrl: { type: String, required: true }, fileName: { type: String, required: true }, fileSize: { type: Number, default: 0 }, mimeType: { type: String, required: true },
  fileType: { type: String, enum: ['past_exam', 'summary', 'lecture_note', 'cheat_sheet'], required: true },
  targetTier: { type: String, enum: ['bare_minimum', 'max_distinction'], required: true, index: true },
  upvotes: { type: Number, default: 0 }, upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downvotes: { type: Number, default: 0 }, downvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], downloadCount: { type: Number, default: 0 },
  verifiedByAuthority: { type: Boolean, default: false }, verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, verifiedAt: Date,
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'flagged'], default: 'approved' },
  flagCount: { type: Number, default: 0 }, flaggedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], tags: [{ type: String, trim: true, lowercase: true }],
}, { timestamps: true });

schema.index({ subjectId: 1, targetTier: 1, fileType: 1 });
schema.index({ title: 'text', description: 'text', tags: 'text' });

export default mongoose.model('Material', schema);
