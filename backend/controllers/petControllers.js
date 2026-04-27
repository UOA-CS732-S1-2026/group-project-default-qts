const mongoose = require('mongoose');
const UserPet = require('../models/UserPet');
const PetSpecies = require('../models/PetSpecies');
const InventoryItem = require('../models/InventoryItem');
const StoreItem = require('../models/StoreItem');

const getActivePet = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'USER_ID_REQUIRED',
          message: 'userId is required in query string',
          details: {}
        }
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_USER_ID',
          message: 'userId is not a valid ObjectId',
          details: {}
        }
      });
    }

    const activePet = await UserPet.findOne({
      userId,
      status: 'ACTIVE'
    }).populate('speciesId', 'code displayName');

    if (!activePet) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ACTIVE_PET_NOT_FOUND',
          message: 'No active pet found for this user',
          details: {}
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Active pet loaded successfully',
      data: {
        activePet: {
          id: activePet._id,
          speciesCode: activePet.speciesId?.code || null,
          speciesName: activePet.speciesId?.displayName || null,
          nickname: activePet.nickname,
          stage: activePet.stage,
          level: activePet.level,
          growthPoints: activePet.growthPoints,
          evolutionReady: activePet.evolutionReady,
          isGrowthFrozen: activePet.isGrowthFrozen,
          status: activePet.status
        }
      }
    });
  } catch (error) {
    console.error('getActivePet error:', error);

    return res.status(500).json({
      success: false,
      error: {
        code: 'ACTIVE_PET_FETCH_FAILED',
        message: 'Failed to load active pet',
        details: {}
      }
    });
  }
};

const getStageCap = (stage) => {
  if (stage === 'EGG') return 4;
  if (stage === 'KID') return 9;
  if (stage === 'ADULT') return 10;
  return 10;
};

const applyGrowthToPet = (pet, growthValue) => {
  let growth = pet.growthPoints + growthValue;

  // Adult max state: allow bar to fill visually up to 99
  if (pet.stage === 'ADULT' && pet.level === 10) {
    pet.growthPoints = Math.min(99, growth);
    pet.evolutionReady = false;
    pet.isGrowthFrozen = false;
    return;
  }

  while (growth >= 100) {
    const stageCap = getStageCap(pet.stage);

    if (pet.level < stageCap) {
      pet.level += 1;
      growth -= 100;
    } else {
      pet.growthPoints = 99;
      pet.evolutionReady = true;
      pet.isGrowthFrozen = true;
      return;
    }
  }

  pet.growthPoints = growth;
};

const feedPet = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, itemCode } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PET_ID',
          message: 'Pet id is not a valid ObjectId',
          details: {}
        }
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'USER_ID_REQUIRED',
          message: 'userId is required',
          details: {}
        }
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_USER_ID',
          message: 'userId is not a valid ObjectId',
          details: {}
        }
      });
    }

    if (!itemCode) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ITEM_CODE_REQUIRED',
          message: 'itemCode is required',
          details: {}
        }
      });
    }

    const pet = await UserPet.findOne({
      _id: id,
      userId
    }).populate('speciesId', 'code displayName');

    if (!pet) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PET_NOT_FOUND',
          message: 'Pet not found for this user',
          details: {}
        }
      });
    }

    if (pet.isGrowthFrozen) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PET_EVOLVE_REQUIRED',
          message: 'Pet must evolve before it can be fed again',
          details: {}
        }
      });
    }

    const storeItem = await StoreItem.findOne({
      code: itemCode.toUpperCase().trim()
    });

    if (!storeItem) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'STORE_ITEM_NOT_FOUND',
          message: 'Store item not found',
          details: {}
        }
      });
    }

    if (storeItem.type !== 'FOOD') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_FEED_ITEM',
          message: 'Only FOOD items can be used to feed pets',
          details: {}
        }
      });
    }

    const inventoryItem = await InventoryItem.findOne({
      userId,
      storeItemId: storeItem._id
    }).populate('storeItemId', 'code name type price growthValue');

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INVENTORY_ITEM_NOT_FOUND',
          message: 'This item is not in the user inventory',
          details: {}
        }
      });
    }

    if (inventoryItem.quantity < 1) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVENTORY_INSUFFICIENT_QUANTITY',
          message: 'Not enough item quantity to feed the pet',
          details: {}
        }
      });
    }

    inventoryItem.quantity -= 1;
    await inventoryItem.save();

    applyGrowthToPet(pet, storeItem.growthValue || 0);
    await pet.save();

    return res.status(200).json({
      success: true,
      message: 'Pet fed successfully',
      data: {
        pet: {
          id: pet._id,
          speciesCode: pet.speciesId?.code || null,
          speciesName: pet.speciesId?.displayName || null,
          nickname: pet.nickname,
          stage: pet.stage,
          level: pet.level,
          growthPoints: pet.growthPoints,
          evolutionReady: pet.evolutionReady,
          isGrowthFrozen: pet.isGrowthFrozen,
          status: pet.status
        },
        inventoryItem: {
          id: inventoryItem._id,
          itemCode: inventoryItem.storeItemId?.code || null,
          itemName: inventoryItem.storeItemId?.name || null,
          type: inventoryItem.storeItemId?.type || null,
          price: inventoryItem.storeItemId?.price ?? null,
          growthValue: inventoryItem.storeItemId?.growthValue ?? null,
          quantity: inventoryItem.quantity
        }
      }
    });
  } catch (error) {
    console.error('feedPet error:', error);

    return res.status(500).json({
      success: false,
      error: {
        code: 'PET_FEED_FAILED',
        message: 'Failed to feed pet',
        details: {}
      }
    });
  }
};

const evolvePet = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PET_ID',
          message: 'Pet id is not a valid ObjectId',
          details: {}
        }
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'USER_ID_REQUIRED',
          message: 'userId is required',
          details: {}
        }
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_USER_ID',
          message: 'userId is not a valid ObjectId',
          details: {}
        }
      });
    }

    const pet = await UserPet.findOne({
      _id: id,
      userId
    }).populate('speciesId', 'code displayName');

    if (!pet) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PET_NOT_FOUND',
          message: 'Pet not found for this user',
          details: {}
        }
      });
    }

    if (pet.stage === 'ADULT') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PET_ALREADY_MAX_STAGE',
          message: 'Adult pet cannot evolve further',
          details: {}
        }
      });
    }

    if (!pet.evolutionReady) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PET_NOT_ELIGIBLE_TO_EVOLVE',
          message: 'Pet is not ready to evolve',
          details: {}
        }
      });
    }

    if (pet.stage === 'EGG') {
      if (pet.level !== 4) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'PET_NOT_ELIGIBLE_TO_EVOLVE',
            message: 'Egg can only evolve at level 4',
            details: {}
          }
        });
      }

      pet.stage = 'KID';
      pet.level = 5;
    } else if (pet.stage === 'KID') {
      if (pet.level !== 9) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'PET_NOT_ELIGIBLE_TO_EVOLVE',
            message: 'Kid can only evolve at level 9',
            details: {}
          }
        });
      }

      pet.stage = 'ADULT';
      pet.level = 10;
    }

    pet.growthPoints = 0;
    pet.evolutionReady = false;
    pet.isGrowthFrozen = false;

    await pet.save();

    return res.status(200).json({
      success: true,
      message: 'Pet evolved successfully',
      data: {
        pet: {
          id: pet._id,
          speciesCode: pet.speciesId?.code || null,
          speciesName: pet.speciesId?.displayName || null,
          nickname: pet.nickname,
          stage: pet.stage,
          level: pet.level,
          growthPoints: pet.growthPoints,
          evolutionReady: pet.evolutionReady,
          isGrowthFrozen: pet.isGrowthFrozen,
          status: pet.status
        }
      }
    });
  } catch (error) {
    console.error('evolvePet error:', error);

    return res.status(500).json({
      success: false,
      error: {
        code: 'PET_EVOLVE_FAILED',
        message: 'Failed to evolve pet',
        details: {}
      }
    });
  }
};

module.exports = {
  getActivePet,
  feedPet,
  evolvePet
};