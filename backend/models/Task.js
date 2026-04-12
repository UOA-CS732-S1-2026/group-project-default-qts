const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['COMMUNITY', 'PERSONAL', 'P2P'], required: true },
    visibility: { type: String, enum: ['PUBLIC', 'PRIVATE'], required: true, default: 'PUBLIC' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    rewardCoins: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'PENDING_CONFIRMATION', 'COMPLETED', 'CANCELLED', 'DISPUTED', 'CLOSED'],
      default: 'OPEN'
    },
    location: { type: String, default: null },
    startAt: { type: Date, default: null },
    endAt: { type: Date, default: null },
    requiresApplication: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// baseline list query index
TaskSchema.index({ type: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Task', TaskSchema);