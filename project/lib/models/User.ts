import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['seller', 'admin'],
    default: 'seller',
  },
  city: {
    type: String,
    default: '',
  },
  followers: {
    type: Number,
    default: 0,
  },
  storeName: {
    type: String,
    default: '',
  },
  storeDescription: {
    type: String,
    default: '',
  },
  profileImage: {
    type: String,
    default: '',
  },
  socialLinks: {
    instagram: { type: String, default: '' },
    youtube: { type: String, default: '' },
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
  },
  onboardingStep: {
    type: Number,
    default: 1,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  bankDetails: {
    accountNumber: { type: String, default: '' },
    ifsc: { type: String, default: '' },
    accountHolder: { type: String, default: '' },
  },
  documents: {
    aadhar: { type: String, default: '' },
    pan: { type: String, default: '' },
    gst: { type: String, default: '' },
  },
}, {
  timestamps: true,
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model('User', UserSchema);