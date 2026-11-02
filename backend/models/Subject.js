import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }, code: { type: String, required: true, trim: true, uppercase: true },
  faculty: { type: String, required: true, trim: true, index: true }, university: { type: String, required: true, trim: true, index: true },
  description: { type: String, maxlength: 1000, default: '' }, professors: [{ type: String, trim: true }],
  semester: { type: String, default: '' }, credits: { type: Number, min: 0 }, createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true }, materialCount: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

schema.index({ university: 1, faculty: 1, code: 1 }, { unique: true });

export default mongoose.model('Subject', schema);
