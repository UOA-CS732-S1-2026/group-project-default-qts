const mongoose = require('mongoose');
const FocusSession = require('../models/FocusSession');
const User = require('../models/User');
const CoinTransaction = require('../models/CoinTransaction');

// 1 coin per 5 minutes of planned time, minimum 1
function calcFocusReward(plannedDurationSec) {
  return Math.max(1, Math.floor(plannedDurationSec / 300));
}

function formatSession(s) {
  return {
    id: s._id,
    status: s.status,
    startedAt: s.startedAt,
    endedAt: s.endedAt,
    plannedDurationSec: s.plannedDurationSec,
    actualDurationSec: s.actualDurationSec,
    rewardCoins: s.rewardCoins,
    rewardedAt: s.rewardedAt
  };
}

const startFocusSession = async (req, res) => {
  try {
    const userId = req.userId;
    const { plannedDurationSec = 1500 } = req.body;

    const existing = await FocusSession.findOne({ userId, status: 'RUNNING' });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: 'SESSION_ALREADY_RUNNING', message: 'A focus session is already running', details: {} }
      });
    }

    const parsed = Number(plannedDurationSec);
    if (!Number.isFinite(parsed) || parsed < 60) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_DURATION', message: 'plannedDurationSec must be at least 60', details: {} }
      });
    }

    const session = await FocusSession.create({
      userId,
      status: 'RUNNING',
      startedAt: new Date(),
      plannedDurationSec: parsed
    });

    return res.status(201).json({
      success: true,
      message: 'Focus session started',
      data: { session: formatSession(session) }
    });
  } catch (error) {
    console.error('startFocusSession error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'FOCUS_START_FAILED', message: 'Failed to start focus session', details: {} }
    });
  }
};

const completeFocusSession = async (req, res) => {
  const dbSession = await mongoose.startSession();
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_SESSION_ID', message: 'Session id is not a valid ObjectId', details: {} }
      });
    }

    dbSession.startTransaction();

    const focusSession = await FocusSession.findOne({ _id: id, userId }).session(dbSession);
    if (!focusSession) {
      throw { status: 404, code: 'SESSION_NOT_FOUND', message: 'Focus session not found' };
    }

    // Prevent duplicate rewards using rewardedAt (idempotent behavior)
    if (focusSession.rewardedAt) {
      await dbSession.abortTransaction();
      dbSession.endSession();
      return res.status(200).json({
        success: true,
        message: 'Focus session already rewarded',
        data: {
          session: formatSession(focusSession),
          coinsEarned: 0
        }
      });
    }

    if (focusSession.status !== 'RUNNING') {
      throw { status: 400, code: 'SESSION_NOT_RUNNING', message: 'Focus session is not running' };
    }

    const endedAt = new Date();
    const actualDurationSec = Math.floor((endedAt - focusSession.startedAt) / 1000);
    const rewardCoins = calcFocusReward(focusSession.plannedDurationSec);

    focusSession.status = 'COMPLETED';
    focusSession.endedAt = endedAt;
    focusSession.actualDurationSec = actualDurationSec;
    focusSession.rewardCoins = rewardCoins;
    focusSession.rewardedAt = endedAt;
    await focusSession.save({ session: dbSession });

    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { coins: rewardCoins } },
      { new: true, session: dbSession }
    );

    await CoinTransaction.create([{
      userId,
      amount: rewardCoins,
      balanceAfter: user.coins,
      type: 'FOCUS_REWARD',
      relatedModel: 'FocusSession',
      relatedId: focusSession._id,
      note: `Completed ${Math.floor(actualDurationSec / 60)}m focus session`
    }], { session: dbSession });

    await dbSession.commitTransaction();
    dbSession.endSession();

    return res.status(200).json({
      success: true,
      message: 'Focus session completed',
      data: {
        session: formatSession(focusSession),
        coinsEarned: rewardCoins,
        coins: user.coins
      }
    });
  } catch (error) {
    await dbSession.abortTransaction();
    dbSession.endSession();
    console.error('completeFocusSession error:', error);
    return res.status(error.status || 500).json({
      success: false,
      error: { code: error.code || 'FOCUS_COMPLETE_FAILED', message: error.message || 'Failed to complete session', details: {} }
    });
  }
};

const cancelFocusSession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_SESSION_ID', message: 'Session id is not a valid ObjectId', details: {} }
      });
    }

    const focusSession = await FocusSession.findOne({ _id: id, userId });
    if (!focusSession) {
      return res.status(404).json({
        success: false,
        error: { code: 'SESSION_NOT_FOUND', message: 'Focus session not found', details: {} }
      });
    }

    if (focusSession.status === 'CANCELLED') {
      return res.status(200).json({
        success: true,
        message: 'Focus session already cancelled',
        data: { session: formatSession(focusSession) }
      });
    }

    if (focusSession.status !== 'RUNNING') {
      return res.status(400).json({
        success: false,
        error: { code: 'SESSION_NOT_RUNNING', message: 'Only running sessions can be cancelled', details: {} }
      });
    }

    focusSession.status = 'CANCELLED';
    focusSession.endedAt = new Date();
    focusSession.actualDurationSec = Math.floor((focusSession.endedAt - focusSession.startedAt) / 1000);
    focusSession.rewardCoins = 0;
    focusSession.rewardedAt = null;
    await focusSession.save();

    return res.status(200).json({
      success: true,
      message: 'Focus session cancelled',
      data: { session: formatSession(focusSession) }
    });
  } catch (error) {
    console.error('cancelFocusSession error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'FOCUS_CANCEL_FAILED', message: 'Failed to cancel focus session', details: {} }
    });
  }
};

const getFocusHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    const sessions = await FocusSession.find({ userId })
      .sort({ startedAt: -1 })
      .limit(limit);

    return res.status(200).json({
      success: true,
      message: 'Focus history loaded',
      data: { sessions: sessions.map(formatSession) }
    });
  } catch (error) {
    console.error('getFocusHistory error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'FOCUS_HISTORY_FAILED', message: 'Failed to load focus history', details: {} }
    });
  }
};

module.exports = { startFocusSession, completeFocusSession, cancelFocusSession, getFocusHistory };