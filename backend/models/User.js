import mongoose from 'mongoose';

import bcrypt from 'bcryptjs';
const schema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 40 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['student', 'professor', 'admin'], default: 'student' },
  university: { type: String, required: true, trim: true }, faculty: { type: String, required: true, trim: true },
  avatarUrl: { type: String, default: '' }, bio: { type: String, maxlength: 280, default: '' },
  reputation: { type: Number, default: 0 }, isVerified: { type: Boolean, default: false }, isBanned: { type: Boolean, default: false },
  refreshToken: { type: String, select: false }, lastLoginAt: Date,
}, { timestamps: true });

schema.pre('save', async function hashPassword() { if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12); });
schema.methods.comparePassword = function comparePassword(candidate) { return bcrypt.compare(candidate, this.password); };
schema.set('toJSON', { transform: (doc, ret) => { delete ret.password; delete ret.refreshToken; delete ret.__v; return ret; } });

export default mongoose.model('User', schema);
