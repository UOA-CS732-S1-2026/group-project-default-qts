const express = require('express');
const router = express.Router();

const {
  getActivePet,
  feedPet
} = require('../controllers/petControllers');

router.get('/active', getActivePet);
router.post('/:id/feed', feedPet);

module.exports = router;