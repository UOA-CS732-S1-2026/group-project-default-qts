const express = require('express');
const router = express.Router();

const { getStoreItems } = require('../controllers/storeControllers');

router.get('/items', getStoreItems);

module.exports = router;