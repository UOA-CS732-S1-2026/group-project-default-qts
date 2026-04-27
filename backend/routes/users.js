const express = require('express');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const router = express.Router();

// wrap in try/catch so DB issues return clean 500 instead of crashing request
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, {
      id: user._id,
      name: user.name,
      email: user.email,
      coins: user.coins,
      roles: user.roles,
      activePetId: user.activePetId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }, 'User profile loaded');
  } catch (err) {
    return sendError(res, 'Failed to load user profile', 500, { detail: err.message });
  }
});

module.exports = router;