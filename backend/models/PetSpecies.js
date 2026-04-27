const mongoose = require('mongoose');

const PetSpeciesSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true }, // Internal ID like "TAO_KIWI"
  displayName: { type: String, required: true },       // Display name like "Tao-Kiwi"
  stages: [
    {
        stage: { type: String, enum: ['EGG', 'KID', 'ADULT'], required: true },
        displayName: { type: String, required: true },
        assetKey: { type: String, required: true }  // Key to look up the image asset for this stage
      }
  ],
    rarity: { type: String, default: 'COMMON' }
  },
  { timestamps: true }
);

// keeps seed/upsert clean
// PetSpeciesSchema.index({ code: 1 }, { unique: true });

module.exports = mongoose.model('PetSpecies', PetSpeciesSchema);