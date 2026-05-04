const mongoose = require('mongoose');
const Task = require('../models/Task');
const TaskApplication = require('../models/TaskApplication');
const TaskAssignment = require('../models/TaskAssignment');
const TaskEscrow = require('../models/TaskEscrow');
const CoinTransaction = require('../models/CoinTransaction');
const User = require('../models/User');

function formatTask(t) {
  return {
    id: t._id,
    type: t.type,
    visibility: t.visibility,
    createdBy: t.createdBy,
    title: t.title,
    description: t.description,
    objectives: t.objectives || [],
    timeLimit: t.timeLimit || null,
    category: t.category ?? null,
    rewardCoins: t.rewardCoins,
    status: t.status,
    location: t.location,
    startAt: t.startAt,
    endAt: t.endAt,
    requiresApplication: t.requiresApplication,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt
  };
}

function formatApplication(a) {
  return {
    id: a._id,
    taskId: a.taskId,
    userId: a.userId,
    status: a.status,
    appliedAt: a.appliedAt,
    decidedAt: a.decidedAt
  };
}

function formatAssignment(a) {
  return {
    id: a._id,
    taskId: a.taskId,
    assignedTo: a.assignedTo,
    assignedBy: a.assignedBy,
    status: a.status,
    checkInAt: a.checkInAt,
    checkOutAt: a.checkOutAt,
    completedAt: a.completedAt,
    creatorConfirmedAt: a.creatorConfirmedAt
  };
}

// GET /api/tasks
// Query: type, status, mine=true
const listTasks = async (req, res) => {
  try {
    const userId = req.userId;
    const { type, status, mine } = req.query;

    let filter;

    if (mine === 'true') {
      const assignments = await TaskAssignment.find({ assignedTo: userId }).lean();
      const assignedTaskIds = assignments.map((a) => a.taskId);

      filter = { $or: [{ createdBy: userId }, { _id: { $in: assignedTaskIds } }] };
      if (type) filter.type = type;
      if (status) filter.status = status;
      if (req.query.category) filter.category = req.query.category;
    } else {
      filter = { visibility: 'PUBLIC' };
      if (type) filter.type = type;
      filter.status = status || 'OPEN';
      if (req.query.category) filter.category = req.query.category;
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 }).limit(50).lean();

    return res.status(200).json({
      success: true,
      message: 'Tasks loaded',
      data: { tasks: tasks.map(formatTask) }
    });
  } catch (error) {
    console.error('listTasks error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'TASK_LIST_FAILED', message: 'Failed to load tasks', details: {} }
    });
  }
};

// GET /api/tasks/:id
const getTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const roles = req.auth?.roles || [];

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TASK_ID', message: 'Task id is not a valid ObjectId', details: {} }
      });
    }

    const task = await Task.findById(id).lean();
    if (!task) {
      return res.status(404).json({
        success: false,
        error: { code: 'TASK_NOT_FOUND', message: 'Task not found', details: {} }
      });
    }

    if (task.visibility === 'PRIVATE' && String(task.createdBy) !== String(userId)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have access to this task', details: {} }
      });
    }

    const assignments = await TaskAssignment.find({ taskId: id }).lean();

    const isCreatorOrAdmin = String(task.createdBy) === String(userId) || roles.includes('ADMIN');
    let applications = [];
    if (isCreatorOrAdmin) {
      applications = await TaskApplication.find({ taskId: id }).lean();
    }

    return res.status(200).json({
      success: true,
      message: 'Task loaded',
      data: {
        task: formatTask(task),
        assignments: assignments.map(formatAssignment),
        applications: applications.map(formatApplication)
      }
    });
  } catch (error) {
    console.error('getTask error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'TASK_FETCH_FAILED', message: 'Failed to load task', details: {} }
    });
  }
};

// POST /api/tasks
const createTask = async (req, res) => {
  const dbSession = await mongoose.startSession();
  try {
    const userId = req.userId;
    const roles = req.auth?.roles || [];
    const {
      type,
      title,
      description = '',
      objectives = [],
      timeLimit = null,
      rewardCoins = 0,
      requiresApplication = false,
      location,
      startAt,
      endAt,
      category
    } = req.body;

    if (!['SYSTEM', 'P2P', 'PERSONAL'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TASK_TYPE', message: 'type must be SYSTEM, P2P, or PERSONAL', details: {} }
      });
    }

    if (type === 'SYSTEM' && !roles.includes('ADMIN')) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only admins can create SYSTEM tasks', details: {} }
      });
    }

    if (!title || String(title).trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'TITLE_REQUIRED', message: 'title is required', details: {} }
      });
    }

    const coins = Number(rewardCoins);
    if (!Number.isFinite(coins) || coins < 0 || !Number.isInteger(coins)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_REWARD_COINS', message: 'rewardCoins must be a non-negative integer', details: {} }
      });
    }

    // PERSONAL tasks have no coin reward to prevent self-gaming
    const finalRewardCoins = type === 'PERSONAL' ? 0 : coins;

    dbSession.startTransaction();

    const user = await User.findById(userId).session(dbSession);
    if (!user) {
      throw { status: 404, code: 'USER_NOT_FOUND', message: 'User not found' };
    }

    if (type === 'P2P' && finalRewardCoins > 0 && user.coins < finalRewardCoins) {
      throw { status: 400, code: 'INSUFFICIENT_COINS', message: 'Not enough coins to fund this task' };
    }

    const [task] = await Task.create([{
      type,
      visibility: type === 'PERSONAL' ? 'PRIVATE' : 'PUBLIC',
      createdBy: userId,
      title: String(title).trim(),
      description: String(description).trim(),
      objectives: Array.isArray(objectives) ? objectives.filter(o => String(o).trim().length > 0).map(o => String(o).trim()) : [],
      timeLimit: timeLimit ? Number(timeLimit) : null,
      category: (type === 'SYSTEM' && (category === 'organization' || category === 'activity')) ? category : null,
      rewardCoins: finalRewardCoins,
      status: type === 'PERSONAL' ? 'IN_PROGRESS' : 'OPEN',
      requiresApplication: type === 'PERSONAL' ? false : Boolean(requiresApplication),
      location: location || null,
      startAt: startAt ? new Date(startAt) : null,
      endAt: endAt ? new Date(endAt) : null
    }], { session: dbSession });

    if (type === 'P2P' && finalRewardCoins > 0) {
      user.coins -= finalRewardCoins;
      await user.save({ session: dbSession });

      await CoinTransaction.create([{
        userId,
        amount: -finalRewardCoins,
        balanceAfter: user.coins,
        type: 'ESCROW_HOLD',
        relatedModel: 'Task',
        relatedId: task._id,
        note: `Escrow held for P2P task: ${task.title}`
      }], { session: dbSession });

      await TaskEscrow.create([{
        taskId: task._id,
        payerUserId: userId,
        amount: finalRewardCoins,
        status: 'HELD',
        heldAt: new Date()
      }], { session: dbSession });
    }

    // PERSONAL: auto-assign to creator
    if (type === 'PERSONAL') {
      await TaskAssignment.create([{
        taskId: task._id,
        assignedTo: userId,
        assignedBy: userId,
        status: 'ASSIGNED'
      }], { session: dbSession });
    }

    await dbSession.commitTransaction();
    dbSession.endSession();

    const responseData = { task: formatTask(task) };
    if (type === 'P2P' && finalRewardCoins > 0) {
      responseData.coins = user.coins;
    }

    return res.status(201).json({
      success: true,
      message: 'Task created',
      data: responseData
    });
  } catch (error) {
    await dbSession.abortTransaction();
    dbSession.endSession();
    console.error('createTask error:', error);
    return res.status(error.status || 500).json({
      success: false,
      error: { code: error.code || 'TASK_CREATE_FAILED', message: error.message || 'Failed to create task', details: {} }
    });
  }
};

// POST /api/tasks/:id/apply
// SYSTEM (requiresApplication=false) → direct assignment
// SYSTEM (requiresApplication=true) / P2P → create application
const applyForTask = async (req, res) => {
  const dbSession = await mongoose.startSession();
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TASK_ID', message: 'Task id is not a valid ObjectId', details: {} }
      });
    }

    dbSession.startTransaction();

    const task = await Task.findById(id).session(dbSession);
    if (!task) {
      throw { status: 404, code: 'TASK_NOT_FOUND', message: 'Task not found' };
    }
    if (task.status !== 'OPEN') {
      throw { status: 400, code: 'TASK_NOT_OPEN', message: 'Task is no longer open for applications' };
    }
    if (task.type === 'PERSONAL') {
      throw { status: 400, code: 'CANNOT_APPLY_PERSONAL', message: 'Cannot apply for a personal task' };
    }
    if (task.type === 'P2P' && String(task.createdBy) === String(userId)) {
      throw { status: 400, code: 'CANNOT_APPLY_OWN_TASK', message: 'Cannot apply for your own task' };
    }

    // SYSTEM with no application required: direct assignment
    if (task.type === 'SYSTEM' && !task.requiresApplication) {
      const existingAssignment = await TaskAssignment.findOne({ taskId: id }).session(dbSession);
      if (existingAssignment) {
        throw { status: 409, code: 'TASK_ALREADY_ASSIGNED', message: 'Task has already been taken' };
      }

      const [assignment] = await TaskAssignment.create([{
        taskId: task._id,
        assignedTo: userId,
        assignedBy: null,
        status: 'ASSIGNED'
      }], { session: dbSession });

      task.status = 'IN_PROGRESS';
      await task.save({ session: dbSession });

      await dbSession.commitTransaction();
      dbSession.endSession();

      return res.status(200).json({
        success: true,
        message: 'Task taken successfully',
        data: { assignment: formatAssignment(assignment) }
      });
    }

    // Requires application (SYSTEM with requiresApplication=true, or any P2P)
    const existingApp = await TaskApplication.findOne({ taskId: id, userId }).session(dbSession);
    if (existingApp) {
      throw { status: 409, code: 'APPLICATION_ALREADY_EXISTS', message: 'You have already applied for this task' };
    }

    const [application] = await TaskApplication.create([{
      taskId: task._id,
      userId,
      status: 'PENDING',
      appliedAt: new Date()
    }], { session: dbSession });

    await dbSession.commitTransaction();
    dbSession.endSession();

    return res.status(201).json({
      success: true,
      message: 'Application submitted',
      data: { application: formatApplication(application) }
    });
  } catch (error) {
    await dbSession.abortTransaction();
    dbSession.endSession();
    console.error('applyForTask error:', error);
    return res.status(error.status || 500).json({
      success: false,
      error: { code: error.code || 'TASK_APPLY_FAILED', message: error.message || 'Failed to apply for task', details: {} }
    });
  }
};

// DELETE /api/tasks/:id/apply
const withdrawApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TASK_ID', message: 'Task id is not a valid ObjectId', details: {} }
      });
    }

    const application = await TaskApplication.findOne({ taskId: id, userId });
    if (!application) {
      return res.status(404).json({
        success: false,
        error: { code: 'APPLICATION_NOT_FOUND', message: 'No application found for this task', details: {} }
      });
    }
    if (application.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: { code: 'APPLICATION_NOT_PENDING', message: 'Only pending applications can be withdrawn', details: {} }
      });
    }

    application.status = 'WITHDRAWN';
    application.decidedAt = new Date();
    await application.save();

    return res.status(200).json({
      success: true,
      message: 'Application withdrawn',
      data: { application: formatApplication(application) }
    });
  } catch (error) {
    console.error('withdrawApplication error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'WITHDRAW_FAILED', message: 'Failed to withdraw application', details: {} }
    });
  }
};

// GET /api/tasks/:id/applications
const getApplications = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const roles = req.auth?.roles || [];

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TASK_ID', message: 'Task id is not a valid ObjectId', details: {} }
      });
    }

    const task = await Task.findById(id).lean();
    if (!task) {
      return res.status(404).json({
        success: false,
        error: { code: 'TASK_NOT_FOUND', message: 'Task not found', details: {} }
      });
    }

    const isCreatorOrAdmin = String(task.createdBy) === String(userId) || roles.includes('ADMIN');
    if (!isCreatorOrAdmin) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only the task creator or admin can view applications', details: {} }
      });
    }

    const applications = await TaskApplication.find({ taskId: id }).lean();

    return res.status(200).json({
      success: true,
      message: 'Applications loaded',
      data: { applications: applications.map(formatApplication) }
    });
  } catch (error) {
    console.error('getApplications error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'APPLICATIONS_FETCH_FAILED', message: 'Failed to load applications', details: {} }
    });
  }
};

// PATCH /api/tasks/:id/applications/:appId/decide
// body: { action: 'ACCEPT' | 'REJECT' }
const decideApplication = async (req, res) => {
  const dbSession = await mongoose.startSession();
  try {
    const { id, appId } = req.params;
    const userId = req.userId;
    const roles = req.auth?.roles || [];
    const { action } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(appId)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: 'Invalid task or application id', details: {} }
      });
    }
    if (!['ACCEPT', 'REJECT'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ACTION', message: 'action must be ACCEPT or REJECT', details: {} }
      });
    }

    dbSession.startTransaction();

    const task = await Task.findById(id).session(dbSession);
    if (!task) {
      throw { status: 404, code: 'TASK_NOT_FOUND', message: 'Task not found' };
    }

    const isCreator = String(task.createdBy) === String(userId);
    const isAdmin = roles.includes('ADMIN');

    if (task.type === 'SYSTEM' && !isAdmin) {
      throw { status: 403, code: 'FORBIDDEN', message: 'Only admins can decide on SYSTEM task applications' };
    }
    if (task.type === 'P2P' && !isCreator && !isAdmin) {
      throw { status: 403, code: 'FORBIDDEN', message: 'Only the task creator can decide on P2P applications' };
    }

    const application = await TaskApplication.findById(appId).session(dbSession);
    if (!application || String(application.taskId) !== String(id)) {
      throw { status: 404, code: 'APPLICATION_NOT_FOUND', message: 'Application not found' };
    }
    if (application.status !== 'PENDING') {
      throw { status: 400, code: 'APPLICATION_NOT_PENDING', message: 'Application is not in PENDING state' };
    }

    application.decidedAt = new Date();

    if (action === 'REJECT') {
      application.status = 'REJECTED';
      await application.save({ session: dbSession });

      await dbSession.commitTransaction();
      dbSession.endSession();

      return res.status(200).json({
        success: true,
        message: 'Application rejected',
        data: { application: formatApplication(application) }
      });
    }

    // ACCEPT
    if (task.status !== 'OPEN') {
      throw { status: 400, code: 'TASK_NOT_OPEN', message: 'Task is no longer open' };
    }

    application.status = 'ACCEPTED';
    await application.save({ session: dbSession });

    const [assignment] = await TaskAssignment.create([{
      taskId: task._id,
      assignedTo: application.userId,
      assignedBy: userId,
      status: 'ASSIGNED'
    }], { session: dbSession });

    task.status = 'IN_PROGRESS';
    await task.save({ session: dbSession });

    if (task.type === 'P2P') {
      await TaskEscrow.findOneAndUpdate(
        { taskId: task._id },
        { payeeUserId: application.userId },
        { session: dbSession }
      );

      // Reject other pending applications for this task
      await TaskApplication.updateMany(
        { taskId: task._id, status: 'PENDING', _id: { $ne: appId } },
        { $set: { status: 'REJECTED', decidedAt: new Date() } },
        { session: dbSession }
      );
    }

    await dbSession.commitTransaction();
    dbSession.endSession();

    return res.status(200).json({
      success: true,
      message: 'Application accepted, task assigned',
      data: {
        application: formatApplication(application),
        assignment: formatAssignment(assignment)
      }
    });
  } catch (error) {
    await dbSession.abortTransaction();
    dbSession.endSession();
    console.error('decideApplication error:', error);
    return res.status(error.status || 500).json({
      success: false,
      error: { code: error.code || 'DECIDE_APPLICATION_FAILED', message: error.message || 'Failed to decide application', details: {} }
    });
  }
};

// POST /api/tasks/:id/submit
// Assignee marks their work as done
// PERSONAL: auto-completes. SYSTEM/P2P: goes to PENDING_CONFIRMATION
const submitTask = async (req, res) => {
  const dbSession = await mongoose.startSession();
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TASK_ID', message: 'Task id is not a valid ObjectId', details: {} }
      });
    }

    dbSession.startTransaction();

    const task = await Task.findById(id).session(dbSession);
    if (!task) {
      throw { status: 404, code: 'TASK_NOT_FOUND', message: 'Task not found' };
    }
    if (!['IN_PROGRESS', 'OPEN'].includes(task.status)) {
      throw { status: 400, code: 'TASK_NOT_IN_PROGRESS', message: 'Task is not in progress' };
    }

    const assignment = await TaskAssignment.findOne({
      taskId: id,
      assignedTo: userId,
      status: 'ASSIGNED'
    }).session(dbSession);

    if (!assignment) {
      throw { status: 404, code: 'ASSIGNMENT_NOT_FOUND', message: 'No active assignment found for this task' };
    }

    // PERSONAL: skip confirmation step
    if (task.type === 'PERSONAL') {
      assignment.status = 'COMPLETED';
      assignment.completedAt = new Date();
      assignment.creatorConfirmedAt = new Date();
      await assignment.save({ session: dbSession });

      task.status = 'COMPLETED';
      await task.save({ session: dbSession });

      await dbSession.commitTransaction();
      dbSession.endSession();

      return res.status(200).json({
        success: true,
        message: 'Personal task completed',
        data: {
          task: formatTask(task),
          assignment: formatAssignment(assignment)
        }
      });
    }

    // SYSTEM / P2P: awaits external confirmation
    assignment.status = 'DONE_PENDING_CONFIRMATION';
    await assignment.save({ session: dbSession });

    task.status = 'PENDING_CONFIRMATION';
    await task.save({ session: dbSession });

    await dbSession.commitTransaction();
    dbSession.endSession();

    return res.status(200).json({
      success: true,
      message: 'Task submitted, awaiting confirmation',
      data: {
        task: formatTask(task),
        assignment: formatAssignment(assignment)
      }
    });
  } catch (error) {
    await dbSession.abortTransaction();
    dbSession.endSession();
    console.error('submitTask error:', error);
    return res.status(error.status || 500).json({
      success: false,
      error: { code: error.code || 'TASK_SUBMIT_FAILED', message: error.message || 'Failed to submit task', details: {} }
    });
  }
};

// POST /api/tasks/:id/confirm
// SYSTEM: admin only. P2P: task creator only.
// Awards coins: SYSTEM → TASK_REWARD from platform; P2P → ESCROW_PAYOUT
const confirmTask = async (req, res) => {
  const dbSession = await mongoose.startSession();
  try {
    const { id } = req.params;
    const userId = req.userId;
    const roles = req.auth?.roles || [];

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TASK_ID', message: 'Task id is not a valid ObjectId', details: {} }
      });
    }

    dbSession.startTransaction();

    const task = await Task.findById(id).session(dbSession);
    if (!task) {
      throw { status: 404, code: 'TASK_NOT_FOUND', message: 'Task not found' };
    }
    if (task.status !== 'PENDING_CONFIRMATION') {
      throw { status: 400, code: 'TASK_NOT_PENDING', message: 'Task is not pending confirmation' };
    }

    const isCreator = String(task.createdBy) === String(userId);
    const isAdmin = roles.includes('ADMIN');

    if (task.type === 'SYSTEM' && !isAdmin) {
      throw { status: 403, code: 'FORBIDDEN', message: 'Only admins can confirm SYSTEM tasks' };
    }
    if (task.type === 'P2P' && !isCreator && !isAdmin) {
      throw { status: 403, code: 'FORBIDDEN', message: 'Only the task creator can confirm P2P tasks' };
    }

    const assignment = await TaskAssignment.findOne({
      taskId: id,
      status: 'DONE_PENDING_CONFIRMATION'
    }).session(dbSession);

    if (!assignment) {
      throw { status: 404, code: 'ASSIGNMENT_NOT_FOUND', message: 'No assignment pending confirmation' };
    }

    const now = new Date();
    assignment.status = 'COMPLETED';
    assignment.completedAt = now;
    assignment.creatorConfirmedAt = now;
    await assignment.save({ session: dbSession });

    task.status = 'COMPLETED';
    await task.save({ session: dbSession });

    const assigneeId = assignment.assignedTo;
    const rewardCoins = task.rewardCoins;

    if (rewardCoins > 0) {
      if (task.type === 'SYSTEM') {
        const assignee = await User.findByIdAndUpdate(
          assigneeId,
          { $inc: { coins: rewardCoins } },
          { new: true, session: dbSession }
        );

        await CoinTransaction.create([{
          userId: assigneeId,
          amount: rewardCoins,
          balanceAfter: assignee.coins,
          type: 'TASK_REWARD',
          relatedModel: 'Task',
          relatedId: task._id,
          note: `Reward for completing SYSTEM task: ${task.title}`
        }], { session: dbSession });
      } else if (task.type === 'P2P') {
        const escrow = await TaskEscrow.findOne({ taskId: id, status: 'HELD' }).session(dbSession);
        if (escrow) {
          escrow.status = 'PAID_OUT';
          escrow.releasedAt = now;
          escrow.paidOutAt = now;
          await escrow.save({ session: dbSession });

          const assignee = await User.findByIdAndUpdate(
            assigneeId,
            { $inc: { coins: escrow.amount } },
            { new: true, session: dbSession }
          );

          await CoinTransaction.create([{
            userId: assigneeId,
            amount: escrow.amount,
            balanceAfter: assignee.coins,
            type: 'ESCROW_PAYOUT',
            relatedModel: 'Task',
            relatedId: task._id,
            note: `Escrow payout for P2P task: ${task.title}`
          }], { session: dbSession });
        }
      }
    }

    await dbSession.commitTransaction();
    dbSession.endSession();

    return res.status(200).json({
      success: true,
      message: 'Task confirmed and completed',
      data: {
        task: formatTask(task),
        assignment: formatAssignment(assignment)
      }
    });
  } catch (error) {
    await dbSession.abortTransaction();
    dbSession.endSession();
    console.error('confirmTask error:', error);
    return res.status(error.status || 500).json({
      success: false,
      error: { code: error.code || 'TASK_CONFIRM_FAILED', message: error.message || 'Failed to confirm task', details: {} }
    });
  }
};

// PATCH /api/tasks/:id
// Creator (or admin for SYSTEM) can edit title/description/location/startAt/endAt/requiresApplication.
// Only allowed while task is OPEN (or IN_PROGRESS for PERSONAL tasks).
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const roles = req.auth?.roles || [];

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TASK_ID', message: 'Task id is not a valid ObjectId', details: {} }
      });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: { code: 'TASK_NOT_FOUND', message: 'Task not found', details: {} }
      });
    }

    const isCreator = String(task.createdBy) === String(userId);
    const isAdmin = roles.includes('ADMIN');

    if (task.type === 'SYSTEM' && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only admins can edit SYSTEM tasks', details: {} }
      });
    }
    if (task.type !== 'SYSTEM' && !isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only the task creator can edit this task', details: {} }
      });
    }

    const editableStatuses = task.type === 'PERSONAL' ? ['OPEN', 'IN_PROGRESS'] : ['OPEN'];
    if (!editableStatuses.includes(task.status)) {
      return res.status(400).json({
        success: false,
        error: { code: 'TASK_NOT_EDITABLE', message: `Task cannot be edited in status: ${task.status}`, details: {} }
      });
    }

    const { title, description, location, startAt, endAt, requiresApplication } = req.body;

    if (title !== undefined) {
      if (String(title).trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: { code: 'TITLE_REQUIRED', message: 'title cannot be empty', details: {} }
        });
      }
      task.title = String(title).trim();
    }
    if (description !== undefined) task.description = String(description).trim();
    if (location !== undefined) task.location = location || null;
    if (startAt !== undefined) task.startAt = startAt ? new Date(startAt) : null;
    if (endAt !== undefined) task.endAt = endAt ? new Date(endAt) : null;

    if (requiresApplication !== undefined && task.type !== 'PERSONAL') {
      const hasPendingApps = await TaskApplication.exists({ taskId: id, status: 'PENDING' });
      if (hasPendingApps) {
        return res.status(400).json({
          success: false,
          error: { code: 'HAS_PENDING_APPLICATIONS', message: 'Cannot change requiresApplication while pending applications exist', details: {} }
        });
      }
      task.requiresApplication = Boolean(requiresApplication);
    }

    await task.save();

    return res.status(200).json({
      success: true,
      message: 'Task updated',
      data: { task: formatTask(task) }
    });
  } catch (error) {
    console.error('updateTask error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'TASK_UPDATE_FAILED', message: 'Failed to update task', details: {} }
    });
  }
};

// DELETE /api/tasks/:id
// Creator (or admin for SYSTEM) can delete a task only when OPEN or CANCELLED.
// Cascades: removes applications, assignments, escrows; refunds held P2P escrow.
const deleteTask = async (req, res) => {
  const dbSession = await mongoose.startSession();
  try {
    const { id } = req.params;
    const userId = req.userId;
    const roles = req.auth?.roles || [];

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TASK_ID', message: 'Task id is not a valid ObjectId', details: {} }
      });
    }

    dbSession.startTransaction();

    const task = await Task.findById(id).session(dbSession);
    if (!task) {
      throw { status: 404, code: 'TASK_NOT_FOUND', message: 'Task not found' };
    }

    const isCreator = String(task.createdBy) === String(userId);
    const isAdmin = roles.includes('ADMIN');

    if (task.type === 'SYSTEM' && !isAdmin) {
      throw { status: 403, code: 'FORBIDDEN', message: 'Only admins can delete SYSTEM tasks' };
    }
    if (task.type !== 'SYSTEM' && !isCreator && !isAdmin) {
      throw { status: 403, code: 'FORBIDDEN', message: 'Only the task creator can delete this task' };
    }

    if (!['OPEN', 'CANCELLED'].includes(task.status)) {
      throw { status: 400, code: 'TASK_NOT_DELETABLE', message: `Task cannot be deleted in status: ${task.status}` };
    }

    // Refund held P2P escrow if present
    if (task.type === 'P2P') {
      const escrow = await TaskEscrow.findOne({ taskId: id, status: 'HELD' }).session(dbSession);
      if (escrow) {
        escrow.status = 'REFUNDED';
        escrow.refundedAt = new Date();
        await escrow.save({ session: dbSession });

        const payer = await User.findByIdAndUpdate(
          escrow.payerUserId,
          { $inc: { coins: escrow.amount } },
          { new: true, session: dbSession }
        );

        await CoinTransaction.create([{
          userId: escrow.payerUserId,
          amount: escrow.amount,
          balanceAfter: payer.coins,
          type: 'ESCROW_REFUND',
          relatedModel: 'Task',
          relatedId: task._id,
          note: `Escrow refunded for deleted P2P task: ${task.title}`
        }], { session: dbSession });
      }
    }

    await TaskApplication.deleteMany({ taskId: id }, { session: dbSession });
    await TaskAssignment.deleteMany({ taskId: id }, { session: dbSession });
    await TaskEscrow.deleteMany({ taskId: id }, { session: dbSession });
    await Task.deleteOne({ _id: id }, { session: dbSession });

    await dbSession.commitTransaction();
    dbSession.endSession();

    return res.status(200).json({
      success: true,
      message: 'Task deleted',
      data: {}
    });
  } catch (error) {
    await dbSession.abortTransaction();
    dbSession.endSession();
    console.error('deleteTask error:', error);
    return res.status(error.status || 500).json({
      success: false,
      error: { code: error.code || 'TASK_DELETE_FAILED', message: error.message || 'Failed to delete task', details: {} }
    });
  }
};

// POST /api/tasks/:id/cancel
// Creator or admin. Refunds P2P escrow if still HELD.
const cancelTask = async (req, res) => {
  const dbSession = await mongoose.startSession();
  try {
    const { id } = req.params;
    const userId = req.userId;
    const roles = req.auth?.roles || [];

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TASK_ID', message: 'Task id is not a valid ObjectId', details: {} }
      });
    }

    dbSession.startTransaction();

    const task = await Task.findById(id).session(dbSession);
    if (!task) {
      throw { status: 404, code: 'TASK_NOT_FOUND', message: 'Task not found' };
    }
    if (['COMPLETED', 'CANCELLED'].includes(task.status)) {
      throw { status: 400, code: 'TASK_ALREADY_FINAL', message: 'Task is already completed or cancelled' };
    }

    const isCreator = String(task.createdBy) === String(userId);
    const isAdmin = roles.includes('ADMIN');
    if (!isCreator && !isAdmin) {
      throw { status: 403, code: 'FORBIDDEN', message: 'Only the task creator or admin can cancel this task' };
    }

    task.status = 'CANCELLED';
    await task.save({ session: dbSession });

    await TaskAssignment.updateMany(
      { taskId: id, status: { $in: ['ASSIGNED', 'CHECKED_IN', 'CHECKED_OUT', 'DONE_PENDING_CONFIRMATION'] } },
      { $set: { status: 'CANCELLED' } },
      { session: dbSession }
    );

    if (task.type === 'P2P') {
      const escrow = await TaskEscrow.findOne({ taskId: id, status: 'HELD' }).session(dbSession);
      if (escrow) {
        escrow.status = 'REFUNDED';
        escrow.refundedAt = new Date();
        await escrow.save({ session: dbSession });

        const payer = await User.findByIdAndUpdate(
          escrow.payerUserId,
          { $inc: { coins: escrow.amount } },
          { new: true, session: dbSession }
        );

        await CoinTransaction.create([{
          userId: escrow.payerUserId,
          amount: escrow.amount,
          balanceAfter: payer.coins,
          type: 'ESCROW_REFUND',
          relatedModel: 'Task',
          relatedId: task._id,
          note: `Escrow refunded for cancelled P2P task: ${task.title}`
        }], { session: dbSession });
      }
    }

    await dbSession.commitTransaction();
    dbSession.endSession();

    return res.status(200).json({
      success: true,
      message: 'Task cancelled',
      data: { task: formatTask(task) }
    });
  } catch (error) {
    await dbSession.abortTransaction();
    dbSession.endSession();
    console.error('cancelTask error:', error);
    return res.status(error.status || 500).json({
      success: false,
      error: { code: error.code || 'TASK_CANCEL_FAILED', message: error.message || 'Failed to cancel task', details: {} }
    });
  }
};

// PATCH /api/tasks/:id
// body: { title?, description?, endAt?, rewardCoins? }
// Auth: creator or admin. SYSTEM tasks: admin only.
// Only editable when OPEN (P2P/SYSTEM) or IN_PROGRESS (PERSONAL).
// P2P rewardCoins cannot be changed (escrow already held at create time).
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const roles = req.auth?.roles || [];

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TASK_ID', message: 'Task id is not a valid ObjectId', details: {} }
      });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: { code: 'TASK_NOT_FOUND', message: 'Task not found', details: {} }
      });
    }

    const isCreator = String(task.createdBy) === String(userId);
    const isAdmin = roles.includes('ADMIN');

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only the task creator or admin can edit this task', details: {} }
      });
    }
    if (task.type === 'SYSTEM' && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only admins can edit SYSTEM tasks', details: {} }
      });
    }

    const editableStatuses = task.type === 'PERSONAL' ? ['IN_PROGRESS'] : ['OPEN'];
    if (!editableStatuses.includes(task.status)) {
      return res.status(400).json({
        success: false,
        error: { code: 'TASK_NOT_EDITABLE', message: `Task can only be edited when ${editableStatuses.join(' or ')}`, details: {} }
      });
    }

    const { title, description, objectives, timeLimit, endAt, rewardCoins, category } = req.body;

    if (title !== undefined) task.title = String(title).trim();
    if (description !== undefined) task.description = String(description).trim();
    if (objectives !== undefined) {
      task.objectives = Array.isArray(objectives) ? objectives.filter(o => String(o).trim().length > 0).map(o => String(o).trim()) : [];
    }
    if (timeLimit !== undefined) task.timeLimit = timeLimit ? Number(timeLimit) : null;
    if (category !== undefined) {
      if (task.type === 'SYSTEM') {
        if (category === 'organization' || category === 'activity') task.category = category;
        else {
          return res.status(400).json({ success: false, error: { code: 'INVALID_CATEGORY', message: 'category must be organization or activity for SYSTEM tasks', details: {} } });
        }
      } else {
        task.category = null;
      }
    }
    if (endAt !== undefined) task.endAt = endAt ? new Date(endAt) : null;

    if (rewardCoins !== undefined && task.type !== 'P2P') {
      const coins = Number(rewardCoins);
      if (!Number.isFinite(coins) || coins < 0 || !Number.isInteger(coins)) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_REWARD_COINS', message: 'rewardCoins must be a non-negative integer', details: {} }
        });
      }
      task.rewardCoins = task.type === 'PERSONAL' ? 0 : coins;
    }

    await task.save();

    return res.status(200).json({
      success: true,
      message: 'Task updated',
      data: { task: formatTask(task) }
    });
  } catch (error) {
    console.error('updateTask error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'TASK_UPDATE_FAILED', message: 'Failed to update task', details: {} }
    });
  }
};

// DELETE /api/tasks/:id
// Auth: admin for SYSTEM; creator or admin for P2P/PERSONAL.
// Only deletable when status is OPEN or CANCELLED.
// P2P: auto-refunds escrow if still HELD.
// Cascades: removes TaskApplications, TaskAssignments, TaskEscrow for this task.
const deleteTask = async (req, res) => {
  const dbSession = await mongoose.startSession();
  try {
    const { id } = req.params;
    const userId = req.userId;
    const roles = req.auth?.roles || [];

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TASK_ID', message: 'Task id is not a valid ObjectId', details: {} }
      });
    }

    dbSession.startTransaction();

    const task = await Task.findById(id).session(dbSession);
    if (!task) {
      throw { status: 404, code: 'TASK_NOT_FOUND', message: 'Task not found' };
    }

    const isCreator = String(task.createdBy) === String(userId);
    const isAdmin = roles.includes('ADMIN');

    if (task.type === 'SYSTEM' && !isAdmin) {
      throw { status: 403, code: 'FORBIDDEN', message: 'Only admins can delete SYSTEM tasks' };
    }
    if (task.type !== 'SYSTEM' && !isCreator && !isAdmin) {
      throw { status: 403, code: 'FORBIDDEN', message: 'Only the task creator can delete this task' };
    }
    if (!['OPEN', 'CANCELLED'].includes(task.status)) {
      throw { status: 400, code: 'TASK_NOT_DELETABLE', message: 'Only open or cancelled tasks can be deleted' };
    }

    if (task.type === 'P2P') {
      const escrow = await TaskEscrow.findOne({ taskId: id, status: 'HELD' }).session(dbSession);
      if (escrow) {
        escrow.status = 'REFUNDED';
        escrow.refundedAt = new Date();
        await escrow.save({ session: dbSession });

        const payer = await User.findByIdAndUpdate(
          escrow.payerUserId,
          { $inc: { coins: escrow.amount } },
          { new: true, session: dbSession }
        );

        await CoinTransaction.create([{
          userId: escrow.payerUserId,
          amount: escrow.amount,
          balanceAfter: payer.coins,
          type: 'ESCROW_REFUND',
          relatedModel: 'Task',
          relatedId: task._id,
          note: `Escrow refunded for deleted P2P task: ${task.title}`
        }], { session: dbSession });
      }
    }

    await TaskApplication.deleteMany({ taskId: id }, { session: dbSession });
    await TaskAssignment.deleteMany({ taskId: id }, { session: dbSession });
    await TaskEscrow.deleteMany({ taskId: id }, { session: dbSession });
    await task.deleteOne({ session: dbSession });

    await dbSession.commitTransaction();
    dbSession.endSession();

    return res.status(200).json({
      success: true,
      message: 'Task deleted',
      data: {}
    });
  } catch (error) {
    await dbSession.abortTransaction();
    dbSession.endSession();
    console.error('deleteTask error:', error);
    return res.status(error.status || 500).json({
      success: false,
      error: { code: error.code || 'TASK_DELETE_FAILED', message: error.message || 'Failed to delete task', details: {} }
    });
  }
};

module.exports = {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  applyForTask,
  withdrawApplication,
  getApplications,
  decideApplication,
  submitTask,
  confirmTask,
  cancelTask
};
