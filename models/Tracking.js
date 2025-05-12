import mongoose from 'mongoose';

const TrackingSchema = new mongoose.Schema({
  trackingId: {
    type: String,
    required: true,
    unique: true,
  },
  origin: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: [
      'Package Received',
      'Processing',
      'In Transit',
      'Out for Delivery',
      'Delivered',
      'Exception'
    ],
  },
  location: {
    type: String,
    required: true,
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  history: [{
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
  }],
}, {
  timestamps: true,
});

export default mongoose.models.Tracking || mongoose.model('Tracking', TrackingSchema); 