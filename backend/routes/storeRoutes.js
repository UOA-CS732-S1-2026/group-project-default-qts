const express = require('express');
const router = express.Router();

const {
  getStoreItems,
  purchaseStoreItem
} = require('../controllers/storeControllers');

router.get('/items', getStoreItems);
router.post('/purchase', purchaseStoreItem);

module.exports = router;