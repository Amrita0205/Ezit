import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
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
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  originalPrice: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    required: true,
    enum: ['clothing', 'electronics', 'home', 'beauty', 'books', 'sports', 'other'],
  },
  subcategory: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: '',
  },
  material: {
    type: String,
    default: '',
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
  },
  images: [{
    type: String,
    required: true,
  }],
  colors: [{
    type: String,
  }],
  tags: [{
    type: String,
  }],
  unitsSold: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  delivery: {
    isCOD: { type: Boolean, default: false },
    isReturnable: { type: Boolean, default: false },
    deliveryTime: { type: String, default: '3-5 days' },
    shippingCost: { type: Number, default: 0 },
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },
}, {
  timestamps: true,
});

ProductSchema.index({ seller: 1, category: 1 });
ProductSchema.index({ title: 'text', description: 'text' });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);