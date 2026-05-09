const mongoose = require('mongoose');
const UserPet = require('../models/UserPet');
const PetSpecies = require('../models/PetSpecies');
const InventoryItem = require('../models/InventoryItem');
const StoreItem = require('../models/StoreItem');
const User = require('../models/User');

const PET_SPECIES_SELECT = 'code displayName spriteKey enabled';

function formatPetResponse(pet) {
  return {
    id: pet._id,
    speciesId: pet.speciesId?._id || pet.speciesId || null,
    speciesCode: pet.speciesId?.code || null,
    speciesName: pet.speciesId?.displayName || null,

    // key point: frontend should use this first
    spriteKey: pet.speciesId?.spriteKey || 'apteryx',

    nickname: pet.nickname,
    stage: pet.stage,
    level: pet.level,
    growthPoints: pet.growthPoints,
    evolutionReady: pet.evolutionReady,
    isGrowthFrozen: pet.isGrowthFrozen,
    status: pet.status
  };
}

const getActivePet = async (req, res) => {
  try {
    const userId = req.userId;


    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_AUTH_USER',
          message: 'Authenticated user id is missing or invalid',
          details: {}
        }
      });
    }

    const activePet = await UserPet.findOne({
      userId,
      status: 'ACTIVE'
    }).populate('speciesId', PET_SPECIES_SELECT);

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
        activePet: formatPetResponse(activePet)
        // activePet: {
        //   id: activePet._id,
        //   speciesCode: activePet.speciesId?.code || null,
        //   speciesName: activePet.speciesId?.displayName || null,
        //   nickname: activePet.nickname,
        //   stage: activePet.stage,
        //   level: activePet.level,
        //   growthPoints: activePet.growthPoints,
        //   evolutionReady: activePet.evolutionReady,
        //   isGrowthFrozen: activePet.isGrowthFrozen,
        //   status: activePet.status
        // }
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
    const userId = req.userId;
    const { itemCode } = req.body;

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


    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_AUTH_USER',
          message: 'Authenticated user id is missing or invalid',
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
    }).populate('speciesId', PET_SPECIES_SELECT);

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
        // pet: {
        //   id: pet._id,
        //   speciesCode: pet.speciesId?.code || null,
        //   speciesName: pet.speciesId?.displayName || null,
        //   nickname: pet.nickname,
        //   stage: pet.stage,
        //   level: pet.level,
        //   growthPoints: pet.growthPoints,
        //   evolutionReady: pet.evolutionReady,
        //   isGrowthFrozen: pet.isGrowthFrozen,
        //   status: pet.status
        // }
        pet: formatPetResponse(pet)
        ,
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
    const userId = req.userId;

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


    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_AUTH_USER',
          message: 'Authenticated user id is missing or invalid',
          details: {}
        }
      });
    }

    const pet = await UserPet.findOne({
      _id: id,
      userId
    }).populate('speciesId', PET_SPECIES_SELECT);

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
        pet: formatPetResponse(pet)
        // pet: {
        //   id: pet._id,
        //   speciesCode: pet.speciesId?.code || null,
        //   speciesName: pet.speciesId?.displayName || null,
        //   nickname: pet.nickname,
        //   stage: pet.stage,
        //   level: pet.level,
        //   growthPoints: pet.growthPoints,
        //   evolutionReady: pet.evolutionReady,
        //   isGrowthFrozen: pet.isGrowthFrozen,
        //   status: pet.status
        // }
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

const activatePet = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { id } = req.params;
    const userId = req.userId;

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


    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_AUTH_USER',
          message: 'Authenticated user id is missing or invalid',
          details: {}
        }
      });
    }

    session.startTransaction();

    const user = await User.findById(userId).session(session);
    if (!user) {
      throw {
        status: 404,
        code: 'USER_NOT_FOUND',
        message: 'User not found'
      };
    }

    const targetPet = await UserPet.findById(id).session(session);
    if (!targetPet) {
      throw {
        status: 404,
        code: 'PET_NOT_FOUND',
        message: 'Pet not found'
      };
    }

    if (String(targetPet.userId) !== String(userId)) {
      throw {
        status: 403,
        code: 'PET_NOT_OWNED',
        message: 'This pet does not belong to the user'
      };
    }

    await UserPet.updateMany(
      { userId: user._id, status: 'ACTIVE' },
      { $set: { status: 'INVENTORY' } },
      { session }
    );

    targetPet.status = 'ACTIVE';
    await targetPet.save({ session });

    user.activePetId = targetPet._id;
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: 'Active pet updated successfully',
      data: {
        activePetId: targetPet._id
      }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error('activatePet error:', error);

    return res.status(error.status || 500).json({
      success: false,
      error: {
        code: error.code || 'PET_ACTIVATE_FAILED',
        message: error.message || 'Failed to activate pet',
        details: {}
      }
    });
  }
};

module.exports = {
  getActivePet,
  feedPet,
  evolvePet,
  activatePet
};