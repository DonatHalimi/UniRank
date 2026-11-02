import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true, index: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  body: { type: String, required: true, maxlength: 500, trim: true }, parentCommentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Comment', schema);
