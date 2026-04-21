const express = require('express');
const router = express.Router();

const { getActivePet } = require('../controllers/petControllers');

router.get('/active', getActivePet);

module.exports = router;