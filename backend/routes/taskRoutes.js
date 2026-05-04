const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const {
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
} = require('../controllers/taskControllers');

router.get('/', requireAuth, listTasks);
router.post('/', requireAuth, createTask);
router.get('/:id', requireAuth, getTask);
router.patch('/:id', requireAuth, updateTask);
router.delete('/:id', requireAuth, deleteTask);
router.post('/:id/apply', requireAuth, applyForTask);
router.delete('/:id/apply', requireAuth, withdrawApplication);
router.get('/:id/applications', requireAuth, getApplications);
router.patch('/:id/applications/:appId/decide', requireAuth, decideApplication);
router.post('/:id/submit', requireAuth, submitTask);
router.post('/:id/confirm', requireAuth, confirmTask);
router.post('/:id/cancel', requireAuth, cancelTask);

module.exports = router;
