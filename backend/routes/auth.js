const express = require('express');
const mongoose = require('mongoose');

const User = require('../models/User');
const UserPet = require('../models/UserPet');
const PetSpecies = require('../models/PetSpecies');
const CoinTransaction = require('../models/CoinTransaction');

const { sendSuccess, sendError } = require('../utils/apiResponse');
const { signAccessToken } = require('../utils/jwt');

const router = express.Router();

function isAucklandUniEmail(email) {
  return email.endsWith('@aucklanduni.ac.nz');
}

// keep full handler in try/catch so async DB errors are always returned cleanly
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, securityQuestionCode, securityAnswer } = req.body || {};

    if (!name || !email || !password || !securityQuestionCode || !securityAnswer) {
      return sendError(res, 'Missing required fields', 400);
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    if (!isAucklandUniEmail(normalizedEmail)) {
      return sendError(res, 'Only @aucklanduni.ac.nz emails are allowed', 400);
    }

    if (String(password).length < 8) {
      return sendError(res, 'Password must be at least 8 characters', 400);
    }

    const existing = await User.findOne({ email: normalizedEmail }).lean();
    if (existing) {
      return sendError(res, 'Email already registered', 409);
    }

    const session = await mongoose.startSession();
    let createdUser;
    let createdPet;

    try {
      await session.withTransaction(async () => {
        const users = await User.create(
          [{
            name: String(name).trim(),
            email: normalizedEmail,
            passwordHash: String(password),
            securityQuestionCode: String(securityQuestionCode).trim(),
            securityAnswerHash: String(securityAnswer),
            coins: 30,
            roles: ['USER']
          }],
          { session }
        );
        createdUser = users[0];

        const defaultSpecies =
          await PetSpecies.findOne({ code: 'TAO_KIWI' }).session(session) ||
          await PetSpecies.findOne({}).sort({ createdAt: 1 }).session(session);

        if (!defaultSpecies) {
          throw new Error('NO_PET_SPECIES');
        }

        const pets = await UserPet.create(
          [{
            userId: createdUser._id,
            speciesId: defaultSpecies._id,
            nickname: '',
            stage: 'EGG',
            level: 1,
            growthPoints: 0,
            evolutionReady: false,
            status: 'ACTIVE'
          }],
          { session }
        );
        createdPet = pets[0];

        createdUser.activePetId = createdPet._id;
        await createdUser.save({ session });

        await CoinTransaction.create(
          [{
            userId: createdUser._id,
            amount: 30,
            balanceAfter: 30,
            type: 'INITIAL_GRANT',
            note: 'Initial signup grant'
          }],
          { session }
        );
      });
    } finally {
      await session.endSession();
    }

    const token = signAccessToken(createdUser);

    return sendSuccess(
      res,
      {
        token,
        user: {
          id: createdUser._id,
          name: createdUser.name,
          email: createdUser.email,
          coins: createdUser.coins,
          roles: createdUser.roles,
          activePetId: createdUser.activePetId
        },
        defaultPet: {
          id: createdPet._id,
          speciesId: createdPet.speciesId,
          stage: createdPet.stage,
          status: createdPet.status
        }
      },
      'Registered successfully',
      201
    );
  } catch (err) {
    if (err.code === 11000) return sendError(res, 'Email already registered', 409);
    if (err.message === 'NO_PET_SPECIES') return sendError(res, 'No pet species found. Run seed first.', 500);
    return sendError(res, 'Registration failed', 500, { detail: err.message });
  }
});

// same thing here, keep all async calls protected
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400);
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
    if (!user) {
      return sendError(res, 'Invalid credentials', 401);
    }

    const isValidPassword = await user.comparePassword(String(password));
    if (!isValidPassword) {
      return sendError(res, 'Invalid credentials', 401);
    }

    const token = signAccessToken(user);

    return sendSuccess(
      res,
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          coins: user.coins,
          roles: user.roles,
          activePetId: user.activePetId
        }
      },
      'Login successful'
    );
  } catch (err) {
    return sendError(res, 'Login failed', 500, { detail: err.message });
  }
});

module.exports = router;