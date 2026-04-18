const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    coins: { type: Number, default: 30, min: 0 },
    roles: { type: [String], default: ['USER'] },
    activePetId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserPet', default: null }
  },
  { timestamps: true }
);

// uni mail is the core unique identity key
UserSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('User', UserSchema);
