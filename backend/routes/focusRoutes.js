const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { startFocusSession, completeFocusSession, cancelFocusSession, getFocusHistory } = require('../controllers/focusControllers');

router.get('/history', requireAuth, getFocusHistory);
router.post('/start', requireAuth, startFocusSession);
router.post('/:id/complete', requireAuth, completeFocusSession);
router.post('/:id/cancel', requireAuth, cancelFocusSession);

module.exports = router;
