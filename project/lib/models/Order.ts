import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  customerInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'online', 'wallet'],
    default: 'cod',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  trackingNumber: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

OrderSchema.index({ seller: 1, status: 1 });
OrderSchema.index({ orderId: 1 });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);