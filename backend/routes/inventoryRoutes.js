const express = require('express');
const router = express.Router();

const { getInventory } = require('../controllers/inventoryControllers');

router.get('/', getInventory);

module.exports = router;