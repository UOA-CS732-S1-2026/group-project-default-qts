const StoreItem = require('../models/StoreItem');

const getStoreItems = async (_req, res) => {
  try {
    const items = await StoreItem.find({})
      .select('code name type price growthValue meta createdAt updatedAt')
      .sort({ price: 1 });

    return res.status(200).json({
      success: true,
      message: 'Store items loaded successfully',
      data: {
        items
      }
    });
  } catch (error) {
    console.error('getStoreItems error:', error);

    return res.status(500).json({
      success: false,
      error: {
        code: 'STORE_ITEMS_FETCH_FAILED',
        message: 'Failed to load store items',
        details: {}
      }
    });
  }
};

module.exports = {
  getStoreItems
};