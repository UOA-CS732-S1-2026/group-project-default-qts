const express = require('express');
const router = express.Router();

const {
  getActivePet,
  feedPet,
  evolvePet,
  activatePet
} = require('../controllers/petControllers');

router.get('/active', getActivePet);
router.post('/:id/feed', feedPet);
router.post('/:id/evolve', evolvePet);
router.patch('/:id/activate', activatePet);


module.exports = router;