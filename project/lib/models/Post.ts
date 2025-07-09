import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  media: [{
    type: String,
    required: true,
  }],
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    default: 'image',
  },
  taggedProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null,
  },
  views: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

PostSchema.index({ seller: 1, createdAt: -1 });

export default mongoose.models.Post || mongoose.model('Post', PostSchema);