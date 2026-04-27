const mongoose = require('mongoose');
const User = require('../models/User');

const listUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-passwordHash -securityAnswerHash').lean();

    return res.status(200).json({
      success: true,
      message: 'Users loaded',
      data: {
        users: users.map((u) => ({
          id: u._id,
          name: u.name,
          email: u.email,
          coins: u.coins,
          roles: u.roles,
          activePetId: u.activePetId,
          createdAt: u.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('listUsers error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'USERS_FETCH_FAILED', message: 'Failed to load users', details: {} }
    });
  }
};

const updateUserRoles = async (req, res) => {
  try {
    const { id } = req.params;
    const { roles } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_USER_ID', message: 'User id is not a valid ObjectId', details: {} }
      });
    }

    const validRoles = ['USER', 'ADMIN'];
    if (!Array.isArray(roles) || roles.length === 0 || !roles.every((r) => validRoles.includes(r)) || !roles.includes('USER')) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ROLES', message: 'roles must be an array containing at least USER (valid values: USER, ADMIN)', details: {} }
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: { roles } },
      { new: true, select: '-passwordHash -securityAnswerHash' }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found', details: {} }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User roles updated',
      data: { id: user._id, roles: user.roles }
    });
  } catch (error) {
    console.error('updateUserRoles error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'ROLES_UPDATE_FAILED', message: 'Failed to update user roles', details: {} }
    });
  }
};

module.exports = { listUsers, updateUserRoles };
