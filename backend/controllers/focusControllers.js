const FocusSession = require('../models/FocusSession');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// Start a focus session
exports.startFocusSession = async (req, res) => {
  try {
    const userId = req.userId;
    const { plannedDurationSec } = req.body || {};

    const existing = await FocusSession.findOne({
      userId,
      status: 'RUNNING'
    }).lean();

    if (existing) {
      return sendError(res, 'Active focus session already exists', 409, { activeSession: existing });
    }

    const session = await FocusSession.create({
      userId,
      plannedDurationSec: plannedDurationSec || 25 * 60,
      status: 'RUNNING',
      startedAt: new Date()
    });

    return sendSuccess(res, session, 'Focus session started');
  } catch (err) {
    return sendError(res, 'Failed to start focus session', 500, { detail: err.message });
  }
};

// Complete a focus session
exports.completeFocusSession = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const session = await FocusSession.findOne({ _id: id, userId });
    if (!session) return sendError(res, 'Session not found', 404);

    session.status = 'COMPLETED';
    session.endedAt = new Date();
    await session.save();

    return sendSuccess(res, session, 'Focus session completed');
  } catch (err) {
    return sendError(res, 'Failed to complete focus session', 500, { detail: err.message });
  }
};

// Cancel a focus session
exports.cancelFocusSession = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const session = await FocusSession.findOne({ _id: id, userId });
    if (!session) return sendError(res, 'Session not found', 404);

    session.status = 'CANCELLED';
    session.endedAt = new Date();
    await session.save();

    return sendSuccess(res, session, 'Focus session cancelled');
  } catch (err) {
    return sendError(res, 'Failed to cancel focus session', 500, { detail: err.message });
  }
};

// Get active focus session (if any)
exports.getActiveFocusSession = async (req, res) => {
  try {
    const userId = req.userId;

    const session = await FocusSession.findOne({
      userId,
      status: 'RUNNING'
    }).lean();

    if (!session) {
      return sendError(res, 'No active focus session', 404);
    }

    return sendSuccess(res, session, 'Active focus session found');
  } catch (err) {
    return sendError(res, 'Failed to fetch active focus session', 500, { detail: err.message });
  }
};