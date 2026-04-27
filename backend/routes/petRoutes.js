const express = require('express');
const router = express.Router();

const {
  getActivePet,
  feedPet,
  evolvePet
} = require('../controllers/petControllers');

router.get('/active', getActivePet);
router.post('/:id/feed', feedPet);
router.post('/:id/evolve', evolvePet);


module.exports = router;