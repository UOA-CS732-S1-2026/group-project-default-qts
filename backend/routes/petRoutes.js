const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');

const {
  getActivePet,
  feedPet,
  evolvePet,
  activatePet
} = require('../controllers/petControllers');

router.get('/active', requireAuth, getActivePet);
router.post('/:id/feed', requireAuth, feedPet);
router.post('/:id/evolve', requireAuth, evolvePet);
router.patch('/:id/activate', requireAuth, activatePet);


module.exports = router;