const mongoose = require('mongoose');
const UserPet = require('../models/UserPet');
require('../models/PetSpecies'); // ensure PetSpecies model is registered for population

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

module.exports = {
  getActivePet
};