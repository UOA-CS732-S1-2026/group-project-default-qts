// this script seeds pet species + store catalog safely with upserts

require('dotenv').config(); // npm runs from /backend so this picks backend/.env
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const PetSpecies = require('../models/PetSpecies');
const StoreItem = require('../models/StoreItem');

const speciesData = [
  {
    code: 'TAO_KIWI',
    displayName: 'Tao-Kiwi',
    stages: [
      { stage: 'EGG', displayName: 'Egg', assetKey: 'tao_kiwi_egg' },
      { stage: 'KID', displayName: 'Kiwi Chick', assetKey: 'tao_kiwi_kid' },
      { stage: 'ADULT', displayName: 'Great Spotted Kiwi', assetKey: 'tao_kiwi_adult' }
    ],
    rarity: 'COMMON'
  },
  {
    code: 'TAO_PENGUIN',
    displayName: 'Tao-Penguin',
    stages: [
      { stage: 'EGG', displayName: 'Egg', assetKey: 'tao_penguin_egg' },
      { stage: 'KID', displayName: 'Little Blue Penguin Chick', assetKey: 'tao_penguin_kid' },
      { stage: 'ADULT', displayName: 'Adult Little Blue Penguin', assetKey: 'tao_penguin_adult' }
    ],
    rarity: 'COMMON'
  },
  {
    code: 'LEMUERA',
    displayName: 'Lemuera',
    stages: [
      { stage: 'EGG', displayName: 'Egg', assetKey: 'lemuera_egg' },
      { stage: 'KID', displayName: 'Ring-tailed Lemur', assetKey: 'lemuera_kid' },
      { stage: 'ADULT', displayName: 'Red Ruffed Lemur', assetKey: 'lemuera_adult' }
    ],
    rarity: 'RARE'
  },
  {
    code: 'APTERYX',
    displayName: 'Apteryx',
    stages: [
      { stage: 'EGG', displayName: 'Egg', assetKey: 'apteryx_egg' },
      { stage: 'KID', displayName: 'Lil Brown Kiwi', assetKey: 'apteryx_kid' },
      { stage: 'ADULT', displayName: 'Great Spotted Kiwi (White Feather)', assetKey: 'apteryx_adult' }
    ],
    rarity: 'RARE'
  },
  {
    code: 'PYRO',
    displayName: 'Pyro',
    stages: [
      { stage: 'EGG', displayName: 'Egg', assetKey: 'pyro_egg' },
      { stage: 'KID', displayName: 'Fry', assetKey: 'pyro_kid' },
      { stage: 'ADULT', displayName: 'Flaming Seahorse', assetKey: 'pyro_adult' }
    ],
    rarity: 'EPIC'
  },
  {
    code: 'ALAS',
    displayName: 'Alas',
    stages: [
      { stage: 'EGG', displayName: 'Egg', assetKey: 'alas_egg' },
      { stage: 'KID', displayName: 'Larvae', assetKey: 'alas_kid' },
      { stage: 'ADULT', displayName: 'Rhino Beetle', assetKey: 'alas_adult' }
    ],
    rarity: 'COMMON'
  },
  {
    code: 'MANU_PUKEKO',
    displayName: 'Manu-Pukeko',
    stages: [
      { stage: 'EGG', displayName: 'Egg', assetKey: 'manu_pukeko_egg' },
      { stage: 'KID', displayName: 'Pukeko', assetKey: 'manu_pukeko_kid' },
      { stage: 'ADULT', displayName: 'Takahe', assetKey: 'manu_pukeko_adult' }
    ],
    rarity: 'COMMON'
  },
  {
    code: 'MANU_PATEKE',
    displayName: 'Manu-Pateke',
    stages: [
      { stage: 'EGG', displayName: 'Egg', assetKey: 'manu_pateke_egg' },
      { stage: 'KID', displayName: 'Lil Pateke', assetKey: 'manu_pateke_kid' },
      { stage: 'ADULT', displayName: 'Pateke', assetKey: 'manu_pateke_adult' }
    ],
    rarity: 'COMMON'
  },
  {
    code: 'VINCENT_SEAL',
    displayName: 'Vincent-Seal',
    stages: [
      { stage: 'EGG', displayName: 'Egg', assetKey: 'vincent_seal_egg' },
      { stage: 'KID', displayName: 'Seal Pup', assetKey: 'vincent_seal_kid' },
      { stage: 'ADULT', displayName: 'Adult Seal', assetKey: 'vincent_seal_adult' }
    ],
    rarity: 'RARE'
  },
  {
    code: 'VINCENT_DOLPHIN',
    displayName: 'Vincent-Dolphin',
    stages: [
      { stage: 'EGG', displayName: 'Egg', assetKey: 'vincent_dolphin_egg' },
      { stage: 'KID', displayName: 'Hector’s Dolphin (Baby)', assetKey: 'vincent_dolphin_kid' },
      { stage: 'ADULT', displayName: 'Adult Hector’s Dolphin', assetKey: 'vincent_dolphin_adult' }
    ],
    rarity: 'RARE'
  },
  {
    code: 'MARRY_SHEEP',
    displayName: 'MarrySheep',
    stages: [
      { stage: 'EGG', displayName: 'Egg', assetKey: 'marry_sheep_egg' },
      { stage: 'KID', displayName: 'Little Sheep', assetKey: 'marry_sheep_kid' },
      { stage: 'ADULT', displayName: 'Sheep', assetKey: 'marry_sheep_adult' }
    ],
    rarity: 'COMMON'
  },
  {
    code: 'BEN_DEER',
    displayName: 'BenDeer',
    stages: [
      { stage: 'EGG', displayName: 'Egg', assetKey: 'ben_deer_egg' },
      { stage: 'KID', displayName: 'Little Deer', assetKey: 'ben_deer_kid' },
      { stage: 'ADULT', displayName: 'NZ Fallow Deer', assetKey: 'ben_deer_adult' }
    ],
    rarity: 'COMMON'
  }
];

const storeItemsData = [
  { code: 'SNACK', name: 'Snack', type: 'FOOD', price: 8, growthValue: 5, meta: null },
  { code: 'MEAL', name: 'Meal', type: 'FOOD', price: 15, growthValue: 12, meta: null },
  { code: 'FEAST', name: 'Feast', type: 'FOOD', price: 21, growthValue: 19, meta: null },
  { code: 'RANDOM_EGG', name: 'Random Egg', type: 'EGG', price: 200, growthValue: null, meta: null }
];

const seedDB = async () => {
  try {
    await connectDB();
    console.log('Connected. Starting seed...');

    for (const species of speciesData) {
      await PetSpecies.updateOne(
        { code: species.code },
        { $set: species },
        { upsert: true }
      );
    }

    for (const item of storeItemsData) {
      await StoreItem.updateOne(
        { code: item.code },
        { $set: item },
        { upsert: true }
      );
    }

    console.log('Seed complete. All good.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedDB();